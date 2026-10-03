/**
 * THE LABYRINTH — main.js
 * Bootstrap: settings UI → game initialization → main loop.
 */

import { Renderer }      from './engine/renderer.js';
import { InputManager, Camera } from './engine/input.js';
import { ParticleSystem } from './engine/particles.js';
import { AudioEngine }    from './engine/audio.js';
import { MazeGenerator }  from './game/generator.js';
import { Player }         from './game/player.js';
import { ThreeRenderer } from './game/threeRenderer.js';
import {
  drawVignette, drawDeathFlash, drawPortalFlash, drawCpFlash,
  drawMinimap, drawFloor, drawWall, drawCheckpoint, drawExit, 
  drawPortal, drawKey, drawTrap, drawDoor, drawPlayer
} from './game/drawWorld.js';

// ─── Global game state ───────────────────────────────────────
let renderer, threeRenderer, input, camera, particles, audio;
let maze, gridW, gridH, wallShape;
let player;
let keys = [], checkpoints = [], doors = [], portals = [], traps = [], exit;
let gameState = 'MENU';  // MENU | PLAY | DEAD | WON
let globalTime = 0;
let lastTime   = 0;
let deathTimer = 0;
let is3D = true;

// FIX: Offscreen canvas holds pre-rendered static maze (floor + walls)
let staticCanvas = null;

// Store game settings at launch time (not read from DOM later — avoids stale values)
let _gameDiff = 'noob';
let _gameSizeM = 1;

// ─── Settings UI wiring ──────────────────────────────────────
const settingsUI = document.getElementById('settings-ui');
const gameDiv    = document.getElementById('game-container');
const canvas     = document.getElementById('game-canvas');
const mmCanvas   = document.getElementById('minimap-canvas');
const deathOvl   = document.getElementById('death-overlay');
const winOvl     = document.getElementById('win-overlay');

function bindSlider(id, outId, fmt) {
  const el = document.getElementById(id);
  const ou = document.getElementById(outId);
  const update = () => {
    ou.textContent = fmt(el.value);
    const pct = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.background = `linear-gradient(to right,#58a6ff ${pct}%,#30363d ${pct}%)`;
  };
  el.addEventListener('input', update);
  update();
}

bindSlider('maze-size',  'size-val',  v => `${parseFloat(v).toFixed(1)} m²`);
bindSlider('path-width', 'width-val', v => `${v}px`);

document.getElementById('generate-btn').addEventListener('click', () => {
  const sizeM  = parseFloat(document.getElementById('maze-size').value);
  const diff   = document.getElementById('maze-diff').value;
  const shape  = document.getElementById('maze-shape').value;
  const tile   = parseInt(document.getElementById('path-width').value);
  const graphicsMode = document.getElementById('maze-graphics').value;

  startGame(sizeM, diff, shape, tile, graphicsMode);
});

// ─── Minimap Controls ───
document.getElementById('mm-toggle').addEventListener('click', () => {
  const ctr = document.getElementById('minimap-container');
  if (ctr.classList.contains('mm-closed')) {
    ctr.classList.remove('mm-closed');
    ctr.classList.add(ctr.dataset.lastSize || 'mm-normal');
  } else {
    if (ctr.classList.contains('mm-normal')) ctr.dataset.lastSize = 'mm-normal';
    if (ctr.classList.contains('mm-large')) ctr.dataset.lastSize = 'mm-large';
    ctr.classList.remove('mm-normal', 'mm-large');
    ctr.classList.add('mm-closed');
  }
});

document.getElementById('mm-resize').addEventListener('click', () => {
  const ctr = document.getElementById('minimap-container');
  if (ctr.classList.contains('mm-closed')) return; // Ignore if closed
  
  if (ctr.classList.contains('mm-normal')) {
    ctr.classList.remove('mm-normal');
    ctr.classList.add('mm-large');
  } else {
    ctr.classList.remove('mm-large');
    ctr.classList.add('mm-normal');
  }
});

// ─── Start game ──────────────────────────────────────────────
function startGame(sizeM, diff, shape, tile, graphicsMode) {
  // Init engine subsystems
  renderer  = new Renderer(canvas);
  const threeCanvas = document.getElementById('three-canvas');
  threeRenderer = new ThreeRenderer(threeCanvas);
  input     = new InputManager();
  
  is3D = graphicsMode === '3d';
  window._is3D = is3D;
  threeCanvas.style.display = is3D ? 'block' : 'none';
  camera    = new Camera();
  particles = new ParticleSystem();
  audio     = new AudioEngine();

  // Set tile size globally (passed to draw functions)
  window._TILE = tile;

  // Generate maze
  const gen = new MazeGenerator();
  const data = gen.generate(sizeM, diff, shape);
  maze = data.maze;
  gridW = data.gridW;
  gridH = data.gridH;
  wallShape = shape;
  exit = data.exit;
  keys         = data.keys;
  checkpoints  = data.checkpoints;
  doors        = data.doors;
  portals      = data.portals;
  traps        = data.traps;

  // Build 3D maze
  threeRenderer.buildMaze(maze, gridW, gridH);

  // Store at launch time so winGame can read them reliably (DOM may be hidden)
  _gameDiff  = diff;
  _gameSizeM = sizeM;

  // Create player
  player = new Player(data.startX, data.startY);
  camera.snap(player.x * tile, player.y * tile);

  // Pre-render static maze into offscreen canvas (FPS fix)
  if (!is3D) {
    prerenderStatic(tile);
  }

  // Show game
  settingsUI.style.display = 'none';
  gameDiv.style.display    = 'block';

  // HUD update
  updateHUD(diff, sizeM);

  // Launch loop
  gameState = 'PLAY';
  lastTime  = performance.now();
  requestAnimationFrame(loop);
}

/** Build offscreen canvas with floor + walls drawn once. */
function prerenderStatic(T) {
  staticCanvas = document.createElement('canvas');
  staticCanvas.width  = gridW * T;
  staticCanvas.height = gridH * T;
  const sCtx = staticCanvas.getContext('2d');

  // Floor tiles
  for (let y = 0; y < gridH; y++)
    for (let x = 0; x < gridW; x++)
      if (maze[y][x] === 0)
        drawFloor(sCtx, x, y, T, 0);

  // Wall tiles
  for (let y = 0; y < gridH; y++)
    for (let x = 0; x < gridW; x++)
      if (maze[y][x] === 1)
        drawWall(sCtx, x, y, T, wallShape);
}

function updateHUD(diff, sizeM) {
  document.getElementById('hud-diff').textContent = diff.toUpperCase().replace('_',' ');
  document.getElementById('hud-size').textContent = `${parseFloat(sizeM).toFixed(1)}m²`;
  rebuildKeyHUD();
}

function rebuildKeyHUD() {
  const inv = document.getElementById('key-inventory');
  inv.innerHTML = '';
  let any = false;
  for (const [col, cnt] of Object.entries(player?.heldKeys || {})) {
    if (cnt <= 0) continue;
    any = true;
    const chip = document.createElement('div');
    chip.className = 'key-chip';
    chip.style.setProperty('--kc', col);
    chip.textContent = `×${cnt}`;
    inv.appendChild(chip);
  }
  if (!any) {
    const em = document.createElement('span');
    em.style.cssText = 'font-size:.7rem;color:#444;font-family:monospace;';
    em.textContent = 'None';
    inv.appendChild(em);
  }
}

function updateStatsHUD() {
  const hpFill = document.getElementById('hud-hp-fill');
  const hpText = document.getElementById('hud-hp-text');
  if (hpFill && hpText) {
    const pct = Math.max(0, (player.hp / player.maxHp) * 100);
    hpFill.style.width = `${pct}%`;
    hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    
    // Color code based on HP
    if (pct < 30) hpFill.style.background = '#ff4444';
    else if (pct < 60) hpFill.style.background = '#ffaa00';
    else hpFill.style.background = '#2ea043';
  }

  // Debuffs
  const dCont = document.getElementById('hud-debuffs');
  if (dCont) {
    dCont.innerHTML = '';
    if (player.debuffs.slow > 0) {
      dCont.innerHTML += `<div class="debuff slow">🕸️ ${Math.ceil(player.debuffs.slow)}s</div>`;
    }
    if (player.debuffs.freeze > 0) {
      dCont.innerHTML += `<div class="debuff freeze">🧊 ${Math.ceil(player.debuffs.freeze)}s</div>`;
    }
    if (player.debuffs.poison > 0) {
      dCont.innerHTML += `<div class="debuff poison">☠️ ${Math.ceil(player.debuffs.poison)}s</div>`;
    }
  }
}

// ─── MAIN LOOP ───────────────────────────────────────────────
function loop() {
  const now = performance.now();
  const dt  = Math.min((now - lastTime) / 1000, 0.06);
  lastTime  = now;
  globalTime += dt;

  if (gameState === 'PLAY') {
    update(dt);
    updateStatsHUD();
  }
  render(dt);
  input.tick();
  requestAnimationFrame(loop);
}

// ─── UPDATE ──────────────────────────────────────────────────
function update(dt) {
  const T = window._TILE;
  const dx = input.dx, dy = input.dy;

  player.update(dx, dy, dt);

  // FIX: Run 3 resolution iterations per axis — prevents wall clipping
  // (a single iteration can fail on corner contacts causing drift)
  player.applyVelocityX(dt);
  resolveWalls();
  resolveWalls();
  resolveWalls();

  player.applyVelocityY(dt);
  resolveWalls();
  resolveWalls();
  resolveWalls();

  // Camera
  camera.follow(player.x * T, player.y * T);
  camera.update(dt);

  // ── Keys
  for (const k of keys) {
    k.update(dt);
    if (k.tryCollect(player)) {
      player.addKey(k.color);
      rebuildKeyHUD();
      particles.emit(k.x * T + T / 2, k.y * T + T / 2, 28, {
        speed: 3.5, speedVar: 2, color: k.color,
        life: 0.7, r: 3.5, glow: true, glowColor: k.color, gravity: 40, shape: 'spark'
      });
      particles.ring(k.x * T + T / 2, k.y * T + T / 2, 10, {
        speed: 5, color: '#ffffff', life: 0.4, r: 2, gravity: 0, drag: 0.92
      });
      audio.playCollect();
      camera.shake(3, 0.12);
    }
  }

  // ── Checkpoints
  for (const cp of checkpoints) {
    cp.update(dt);
    const dx2 = player.x - (cp.x + 0.5), dy2 = player.y - (cp.y + 0.5);
    if (dx2 * dx2 + dy2 * dy2 < 0.6 * 0.6) {
      if (!cp.active) {
        checkpoints.forEach(c => { if (c !== cp) c.active = false; });
        cp.activate();
        player.setCheckpoint(cp.x + 0.5, cp.y + 0.5);
        audio.playCheckpoint();
        particles.ring(cp.x * T + T / 2, cp.y * T + T / 2, 16, {
          speed: 3.5, color: '#58a6ff', life: 0.6, r: 2.5, gravity: 0, drag: 0.93, glow: true
        });
        camera.shake(2, 0.1);
      }
    }
  }

  // ── Doors
  for (const door of doors) {
    door.update(dt);
    const dx2 = player.x - (door.x + 0.5), dy2 = player.y - (door.y + 0.5);
    const d2  = dx2 * dx2 + dy2 * dy2;
    // FIX: Enlarged interaction radius (1.5 tiles) so player can trigger
    // even when the closed door is blocking direct approach to its center.
    door.nearPlayer = d2 < 1.5 * 1.5;
    door.canOpen    = player.countKeys(door.color) >= door.reqKeys;

    if (door.nearPlayer && !door.open && door.canOpen) {
      door.open = true;
      player.useKeys(door.color, door.reqKeys);
      rebuildKeyHUD();
      audio.playDoorOpen();
      particles.emit(door.x * T + T / 2, door.y * T + T / 2, 40, {
        speed: 5, speedVar: 3, color: door.color, colors: [door.color, '#fff'],
        life: 0.9, r: 4, glow: true, glowColor: door.color, gravity: 30, shape: 'spark'
      });
      camera.shake(5, 0.2);
    }
  }

  // ── Portals
  for (const portal of portals) {
    portal.update(dt);
    if (portal.tryUse(player, portals)) {
      audio.playPortal();
      player.triggerPortal();

      // FIX: Resolve walls AFTER teleport so player isn't stuck inside geometry
      resolveWalls(); resolveWalls(); resolveWalls();

      // Snap camera directly to new player world position
      camera.snap(player.x * T, player.y * T);

      const px2 = player.x * T, py2 = player.y * T;
      particles.ring(px2, py2, 20, {
        speed: 5, color: '#cc88ff', life: 0.7, r: 3, gravity: 0, drag: 0.9, glow: true
      });
      particles.emit(px2, py2, 30, {
        speed: 4, color: '#9b59b6', life: 0.5, r: 3.5, glow: true, gravity: 20
      });
      camera.shake(7, 0.28);

      // Break out of portal loop — only one teleport per frame
      break;
    }
  }

  // ── Traps
  for (const trap of traps) {
    trap.update(
      dt, player.x, player.y, 
      () => killPlayer(), 
      (type, val, dur) => player.applyEffect(type, val, dur), 
      audio
    );
  }

  if (player.hp <= 0) {
    killPlayer();
  }

  // ── Exit
  const edx = player.x - (exit.x + 0.5), edy = player.y - (exit.y + 0.5);
  exit.update(dt);
  if (edx * edx + edy * edy < 0.55 * 0.55) winGame();

  // ── Particles
  particles.update(dt);

  // Step sounds
  if (player.moving && player.stepAnim > 0.9) audio.playStep();
}

function killPlayer() {
  if (gameState === 'DEAD') return;
  gameState = 'DEAD';
  player.deathFlash = 1;
  audio.playDeath();
  camera.shake(14, 0.55);

  const px = player.x * window._TILE, py = player.y * window._TILE;
  particles.emit(px, py, 55, {
    speed: 6, speedVar: 4, colors: ['#ff4444','#ff8800','#ffcc00','#fff'],
    life: 0.9, r: 4, glow: true, gravity: 60, shape: 'spark'
  });
  particles.ring(px, py, 16, {
    speed: 7, color: '#ff0000', life: 0.5, r: 3, gravity: 0, drag: 0.9, glow: true
  });

  deathOvl.classList.add('active');
  deathTimer = 2.0;

  setTimeout(() => {
    player.die();
    camera.snap(player.x * window._TILE, player.y * window._TILE);
    deathOvl.classList.remove('active');
    gameState = 'PLAY';
  }, 2000);
}

function winGame() {
  if (gameState === 'WON') return;
  gameState = 'WON';
  audio.playWin();

  // Use stored settings (not DOM — safer)
  const DIFF_M = { noob:1,easy:2,medium:3,hard:4,insane:5,crazy:6,stupid_hard:7,impossible:8,'???':10 };
  const dm     = DIFF_M[_gameDiff] || 1;
  let tokens   = Math.max(1, Math.floor(_gameSizeM * dm * 3));
  const trueWin= (_gameDiff === '???' && _gameSizeM >= 2.9);
  if (trueWin) tokens = 250;

  document.getElementById('win-token-msg').textContent = trueWin
    ? `🏆 TRUE ENDING! +${tokens} Tokens · 2 Games Unlocked!`
    : `⭐ +${tokens} Tokens earned!`;
  winOvl.classList.add('active');

  const T  = window._TILE;
  const px = player.x * T, py = player.y * T;
  particles.ring(px, py, 30, { speed: 8, color: '#2ea043', life: 1.2, r: 4, gravity: -20, glow: true });
  particles.emit(px, py, 80, {
    speed: 7, speedVar: 5, colors: ['#ffd700','#ff9900','#ff5500','#2ea043','#58a6ff'],
    life: 1.5, r: 5, glow: true, gravity: 40, shape: 'spark'
  });

  const tok = localStorage.getItem('authToken');
  if (tok) {
    // GET current state first, then MERGE (never overwrite unrelated fields)
    fetch('/api/progress', { headers: { 'x-auth-token': tok } })
      .then(r => {
        if (!r.ok) throw new Error('auth_failed');
        return r.json();
      })
      .then(d => {
        // Safely merge — preserve all existing fields from server schema
        const existing = d.progress?.siteState || {};
        const merged = {
          tokens:       (existing.tokens      || 0) + tokens,
          totalEarned:  (existing.totalEarned || 0) + tokens,
          totalSpent:   existing.totalSpent   || 0,
          unlocked:     existing.unlocked     || ['archive', 'base2', 'base3'],
          completed:    existing.completed    || [],
          achievements: existing.achievements || [],
          profilePic:   existing.profilePic   || '/favicon.ico',
        };

        // Mark maze as completed
        if (!merged.completed.includes('maze')) merged.completed.push('maze');

        // True ending — unlock bonus games
        if (trueWin) {
          ['maze_bonus_1', 'maze_bonus_2'].forEach(id => {
            if (!merged.unlocked.includes(id)) merged.unlocked.push(id);
          });
        }

        return fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': tok },
          body: JSON.stringify({ siteState: merged })
        });
      })
      .then(r => r.json())
      .then(() => {
        // Small confirmation tick
        console.log(`[Labyrinth] +${tokens} tokens saved.`);
        setTimeout(() => window.location.href = '/', 4000);
      })
      .catch(err => {
        // Don't block the win screen if save fails
        console.warn('[Labyrinth] Token save failed:', err);
        setTimeout(() => window.location.href = '/', 4000);
      });
  } else {
    setTimeout(() => window.location.href = '/', 4000);
  }
}

// ─── COLLISION ───────────────────────────────────────────────
function resolveWalls() {
  const r  = player.radius;
  // Expand search area by 1 to catch edge cases on fast movement
  const x0 = Math.floor(player.x - r) - 1;
  const x1 = Math.floor(player.x + r) + 1;
  const y0 = Math.floor(player.y - r) - 1;
  const y1 = Math.floor(player.y + r) + 1;

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (maze[ty]?.[tx] === 1) player.pushOut(tx, ty);
    }
  }
  for (const d of doors) {
    if (!d.passable) player.pushOut(d.x, d.y);
  }
}

// ─── RENDER ──────────────────────────────────────────────────
function render(dt) {
  if (!renderer) return;
  const ctx  = renderer.c;
  const cam  = camera;
  // Render Scene
  if (threeRenderer && is3D) {
    threeRenderer.render(player, dt, maze, gridW, gridH, keys, checkpoints, doors, portals, traps, exit, particles);
  } else if (staticCanvas) {
    const T = window._TILE;
    renderer.beginWorld(cam.rx, cam.ry, cam.shakeX, cam.shakeY);
    ctx.drawImage(staticCanvas, 0, 0);

    checkpoints.forEach(cp => drawCheckpoint(ctx, cp, T, globalTime));
    drawExit(ctx, exit, T, globalTime);
    portals.forEach(p => drawPortal(ctx, p, T, globalTime));
    keys.forEach(k => { if (!k.collected) drawKey(ctx, k, T); });
    traps.forEach(t => drawTrap(ctx, t, T, globalTime));
    doors.forEach(d => drawDoor(ctx, d, T, globalTime));
    if (gameState !== 'DEAD') drawPlayer(ctx, player, T, globalTime);
    
    particles.draw(ctx);
    renderer.endWorld();
  }

  // ── Screen space ────────────────────────────────────────────
  if (is3D) {
    // 3D mode doesn't draw to the 2D world canvas, so we must clear it before drawing HUD
    renderer.ctx.clearRect(0, 0, renderer.logW, renderer.logH);
  }
  renderer.beginScreen();

  drawVignette(ctx, renderer.w, renderer.h);
  if (player?.deathFlash > 0)   drawDeathFlash(ctx, renderer.w, renderer.h, player.deathFlash);
  if (player?.portalFlash > 0)  drawPortalFlash(ctx, renderer.w, renderer.h, player.portalFlash);
  if (player?.cpFlash > 0)      drawCpFlash(ctx, renderer.w, renderer.h, player.cpFlash);

  // HUD trap proximity warnings
  drawProximityIndicators(ctx, renderer.w, renderer.h);

  renderer.endFrame();

  // ── Minimap ─────────────────────────────────────────────────
  if (maze) {
    drawMinimap(
      mmCanvas.getContext('2d'),
      maze, gridW, gridH,
      player, checkpoints, exit, portals
    );
  }
}

/** Subtle on-screen indicators showing nearby traps during warning phase */
function drawProximityIndicators(ctx, W, H) {
  let warnActive = false;
  for (const t of traps) {
    if ((t.state === 'WARNING' || t.state === 'ARMED') && t.dist < 3) {
      warnActive = true;
      break;
    }
  }
  if (warnActive) {
    const pulse = 0.4 + Math.sin(globalTime * 9) * 0.3;
    // Corner danger indicators
    const cx = W / 2, cy = H / 2;
    const size = Math.min(W, H) * 0.45;
    ctx.strokeStyle = `rgba(255,80,0,${pulse * 0.5})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.setLineDash([]);

    // Danger text
    ctx.fillStyle = `rgba(255,120,30,${pulse * 0.8})`;
    ctx.font = 'bold 0.7rem monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('⚠ DANGER NEARBY ⚠', W / 2, 60);
  }
}

/**
 * THE LABYRINTH — game/renderer3d.js
 * All world-space drawing. Separated from game logic entirely.
 * Uses the Renderer engine class for DPR-aware drawing.
 */
const TAU = Math.PI * 2;

// ─── Stone texture lookup table (deterministic per tile) ────
function tileHash(x, y) { return (x * 31337 + y * 7919) % 1024; }

function hexRgb(hex) {
  if (hex.length === 4) {
    return [
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
      parseInt(hex[3] + hex[3], 16)
    ];
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgba(hex, a) {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Floor Tile ──────────────────────────────────────────────
export function drawFloor(ctx, x, y, T, t) {
  const px = x * T, py = y * T;
  const h = tileHash(x, y);

  // Base color — subtle variation
  const brightness = 18 + (h % 8);
  ctx.fillStyle = `rgb(${brightness},${brightness + 2},${brightness + 5})`;
  ctx.fillRect(px, py, T, T);

  // Mortar line (grid)
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(px + 0.4, py + 0.4, T - 0.8, T - 0.8);

  // Inner stone highlight (top-left edge)
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(px + 1, py + 1, T - 2, 2);
  ctx.fillRect(px + 1, py + 1, 2, T - 2);

  // Random crack marks
  if (h % 7 < 2) {
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    const offX = (h % 20) / 20;
    ctx.moveTo(px + T * offX,         py + T * 0.3);
    ctx.lineTo(px + T * (offX + 0.15), py + T * 0.55);
    ctx.lineTo(px + T * (offX + 0.1),  py + T * 0.75);
    ctx.stroke();
  }
}

// ─── Wall Tile ───────────────────────────────────────────────
export function drawWall(ctx, x, y, T, shape) {
  const px = x * T, py = y * T;
  const cx = px + T / 2, cy = py + T / 2;
  const h  = tileHash(x, y);

  // Drop shadow (under wall — gives 3D illusion)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(px + 2, py + T * 0.72, T - 1, T * 0.32);

  if (shape === 'hexagon') {
    _wallHex(ctx, cx, cy, T);
  } else if (shape === 'triangle') {
    _wallTri(ctx, px, py, T);
  } else {
    _wallSquare(ctx, px, py, T, h);
  }
}

function _wallSquare(ctx, px, py, T, h) {
  // Main face gradient
  const g = ctx.createLinearGradient(px, py, px, py + T);
  g.addColorStop(0,   '#4a5263');
  g.addColorStop(0.35,'#343b47');
  g.addColorStop(1,   '#1c2028');
  ctx.fillStyle = g;
  ctx.fillRect(px, py, T, T);

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.11)';
  ctx.fillRect(px, py, T, 3);

  // Right shadow edge
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.fillRect(px + T - 4, py, 4, T);

  // Mortar outline
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(px + 0.6, py + 0.6, T - 1.2, T - 1.2);

  // Inner bevel
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 4, py + 4, T - 8, T - 8);

  // Stone detail: horizontal band
  if (h % 5 === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(px + 4, py + T * 0.42, T - 8, 3);
  }

  // Moss — bottom right corner
  if (h % 9 < 3) {
    ctx.fillStyle = 'rgba(30,80,30,0.22)';
    ctx.fillRect(px + T - 9, py + T - 11, 7, 9);
  }
}

function _wallHex(ctx, cx, cy, T) {
  const r = T / 2 - 3;

  // Shadow hex
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  _hexPath(ctx, cx + 2, cy + 3, r);
  ctx.fill();

  // Gradient body
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  g.addColorStop(0,   '#5a637a');
  g.addColorStop(0.5, '#333b48');
  g.addColorStop(1,   '#1a1f28');
  ctx.fillStyle = g;
  _hexPath(ctx, cx, cy, r);
  ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  _hexPath(ctx, cx, cy, r - 1);
  ctx.stroke();

  // Inner hex
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  _hexPath(ctx, cx, cy, r - 4);
  ctx.stroke();
}

function _wallTri(ctx, px, py, T) {
  const mid = px + T / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.moveTo(mid + 2, py + 3);
  ctx.lineTo(px + T + 2, py + T + 3);
  ctx.lineTo(px + 2, py + T + 3);
  ctx.closePath();
  ctx.fill();

  // Body
  const g = ctx.createLinearGradient(px, py, px, py + T);
  g.addColorStop(0,   '#5a637a');
  g.addColorStop(1,   '#1c2028');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(mid, py + 2);
  ctx.lineTo(px + T - 1, py + T - 1);
  ctx.lineTo(px + 1, py + T - 1);
  ctx.closePath();
  ctx.fill();

  // Left edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px + 1, py + T - 1);
  ctx.lineTo(mid, py + 2);
  ctx.stroke();
}

function _hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6 - Math.PI / 6;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
}

// ─── Checkpoint ──────────────────────────────────────────────
export function drawCheckpoint(ctx, cp, T, gt) {
  const px = cp.x * T, py = cp.y * T;
  const cx = px + T / 2, cy = py + T / 2;
  const pulse = 0.65 + Math.sin(cp.pulse) * 0.35;
  const col   = cp.active ? '#58a6ff' : '#1a3a6a';
  const alpha = cp.active ? pulse : 0.3;

  ctx.save();

  // Floor glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.65);
  g.addColorStop(0,   rgba(col, 0.35 * alpha));
  g.addColorStop(0.6, rgba(col, 0.1 * alpha));
  g.addColorStop(1,   rgba(col, 0));
  ctx.fillStyle = g;
  ctx.fillRect(px - T * 0.2, py - T * 0.2, T * 1.4, T * 1.4);

  // Pad
  ctx.shadowColor = col; ctx.shadowBlur = cp.active ? 18 * pulse : 5;
  ctx.strokeStyle = rgba(col, alpha);
  ctx.lineWidth = cp.active ? 2.5 : 1;
  ctx.strokeRect(px + 6, py + 6, T - 12, T - 12);

  // Symbol
  ctx.fillStyle = rgba(col, alpha * 0.9);
  ctx.font = `bold ${Math.floor(T * 0.42)}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('✦', cx, cy + (cp.active ? Math.sin(gt * 2) * 2 : 0));

  // Activation burst ring
  if (cp.activateAnim > 0) {
    const ar = (1 - cp.activateAnim);
    ctx.strokeStyle = rgba('#58a6ff', cp.activateAnim);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, T * 0.3 + ar * T * 0.5, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Exit ────────────────────────────────────────────────────
export function drawExit(ctx, exit, T, gt) {
  const px = exit.x * T, py = exit.y * T;
  const cx = px + T / 2, cy = py + T / 2;
  const pulse = 0.7 + Math.sin(exit.pulse) * 0.3;

  ctx.save();
  ctx.shadowColor = '#2ea043'; ctx.shadowBlur = 25 + Math.sin(gt * 2) * 8;

  // Floor glow halo
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.9);
  glow.addColorStop(0, `rgba(46,160,67,${0.5 * pulse})`);
  glow.addColorStop(1, 'rgba(46,160,67,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(px - T * 0.3, py - T * 0.3, T * 1.6, T * 1.6);

  // Arch door
  const archG = ctx.createLinearGradient(px, py, px, py + T);
  archG.addColorStop(0, `rgba(46,160,67,${0.75 * pulse})`);
  archG.addColorStop(1, `rgba(20,80,30,${0.9 * pulse})`);
  ctx.fillStyle = archG;
  ctx.beginPath();
  ctx.moveTo(px + T * 0.15, py + T);
  ctx.lineTo(px + T * 0.15, py + T * 0.35);
  ctx.arc(cx, py + T * 0.35, T * 0.35, Math.PI, 0);
  ctx.lineTo(px + T * 0.85, py + T);
  ctx.closePath();
  ctx.fill();

  // Door highlight
  ctx.strokeStyle = `rgba(100,220,100,${0.6 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + T * 0.15, py + T * 0.95);
  ctx.lineTo(px + T * 0.15, py + T * 0.35);
  ctx.arc(cx, py + T * 0.35, T * 0.35, Math.PI, 0);
  ctx.stroke();

  // Arrow up (floating)
  const arrowY = cy - Math.sin(gt * 2.5) * 4;
  ctx.fillStyle = `rgba(255,255,255,${pulse * 0.9})`;
  ctx.shadowBlur = 10;
  ctx.font = `bold ${Math.floor(T * 0.55)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('▲', cx, arrowY);

  ctx.restore();
}

// ─── Portal ──────────────────────────────────────────────────
export function drawPortal(ctx, p, T, gt) {
  const cx = p.x * T + T / 2, cy = p.y * T + T / 2;
  const ready = p.cooldown <= 0;
  const baseColor = ready ? '#9b59b6' : '#555555';
  const alpha = ready ? 1 : 0.45;

  ctx.save();

  // Outer glow disk
  const outerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.6);
  outerG.addColorStop(0,   rgba(baseColor, 0.28 * alpha));
  outerG.addColorStop(0.65,rgba(baseColor, 0.08 * alpha));
  outerG.addColorStop(1,   rgba(baseColor, 0));
  ctx.fillStyle = outerG;
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.6, 0, TAU); ctx.fill();

  // Ripple on use
  if (p.ripple > 0) {
    ctx.strokeStyle = rgba('#cc88ff', p.ripple);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.5 * (1 + (1 - p.ripple) * 0.8), 0, TAU); ctx.stroke();
  }

  // Three rotating arcs at different radii and speeds
  for (let layer = 0; layer < 3; layer++) {
    const r     = T * (0.16 + layer * 0.08);
    const phase = p.spin + layer * (TAU / 3);
    const layerAlpha = (0.95 - layer * 0.2) * alpha;

    ctx.strokeStyle = layer === 0
      ? `rgba(200,140,255,${layerAlpha})`
      : `rgba(155,89,182,${layerAlpha})`;
    ctx.lineWidth = 2.8 - layer * 0.7;
    ctx.beginPath();
    for (let a = 0; a < TAU; a += 0.05) {
      const rr = r * (0.75 + Math.sin(a * 4 + phase) * 0.25);
      const sx = cx + rr * Math.cos(a + p.spin * (1 + layer * 0.3));
      const sy = cy + rr * Math.sin(a + p.spin * (1 + layer * 0.3));
      a === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.closePath(); ctx.stroke();
  }

  // Core glow
  ctx.shadowColor = baseColor; ctx.shadowBlur = ready ? 20 : 6;
  const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.18);
  coreG.addColorStop(0, `rgba(230,200,255,${alpha})`);
  coreG.addColorStop(0.5,rgba(baseColor, 0.8 * alpha));
  coreG.addColorStop(1,  rgba(baseColor, 0));
  ctx.fillStyle = coreG;
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.18, 0, TAU); ctx.fill();

  // Cooldown ring
  if (p.cooldown > 0) {
    const frac = p.cooldown / 2.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, T * 0.4, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - frac));
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Key Item ────────────────────────────────────────────────
export function drawKey(ctx, k, T) {
  if (k.collected) return;
  const cx = k.x * T + T / 2;
  const cy = k.y * T + T / 2 + Math.sin(k.bob) * 4;
  const sc = k.scale;  // pop-in scale

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);

  // Glow halo
  ctx.shadowColor = k.color; ctx.shadowBlur = 16;
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, T * 0.45);
  halo.addColorStop(0,   rgba(k.color, 0.25));
  halo.addColorStop(0.6, rgba(k.color, 0.08));
  halo.addColorStop(1,   rgba(k.color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(0, 0, T * 0.45, 0, TAU); ctx.fill();

  // Key shape
  ctx.rotate(k.spin);
  const ks = T * 0.22;  // key scale unit

  ctx.strokeStyle = k.color; ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Bow (ring)
  ctx.beginPath(); ctx.arc(0, -ks * 0.6, ks * 0.5, 0, TAU); ctx.stroke();

  // Shaft
  ctx.beginPath();
  ctx.moveTo(0, -ks * 0.12);
  ctx.lineTo(0,  ks * 0.95);
  ctx.stroke();

  // Teeth
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ks * 0.45); ctx.lineTo(ks * 0.28, ks * 0.45);
  ctx.moveTo(0, ks * 0.7);  ctx.lineTo(ks * 0.28, ks * 0.7);
  ctx.stroke();

  // Center jewel in bow
  ctx.fillStyle = k.color; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(0, -ks * 0.6, ks * 0.18, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(-ks * 0.08, -ks * 0.68, ks * 0.07, 0, TAU); ctx.fill();

  ctx.restore();
}

// ─── Door ────────────────────────────────────────────────────
export function drawDoor(ctx, door, T, gt) {
  if (door.open && door.openPct >= 1) return;

  const px = door.x * T, py = door.y * T;
  const cx = px + T / 2, cy = py + T / 2;
  const sc = 1 - door.openPct;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  ctx.translate(-T / 2, -T / 2);

  const pulse = 0.6 + Math.sin(door.pulse) * 0.4;

  ctx.shadowColor = door.color;
  ctx.shadowBlur  = door.nearPlayer ? 20 * pulse : 10;

  // Frame
  ctx.fillStyle = '#08090c';
  ctx.fillRect(0, 0, T, T);

  // Door gradient body
  const g = ctx.createLinearGradient(0, 0, T, 0);
  g.addColorStop(0,   _shadeHex(door.color, -60));
  g.addColorStop(0.5,  door.color);
  g.addColorStop(1,   _shadeHex(door.color, -70));
  ctx.fillStyle = g;
  ctx.fillRect(3, 3, T - 6, T - 6);

  // Door panels — two rectangles
  ctx.strokeStyle = rgba(_shadeHex(door.color, -40), 0.7);
  ctx.lineWidth = 1;
  ctx.strokeRect(5, 5, T / 2 - 7, T - 10);
  ctx.strokeRect(T / 2 + 2, 5, T / 2 - 7, T - 10);

  // Door knobs
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.shadowColor = '#fff'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(T / 2 - 5, T / 2, 3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(T / 2 + 5, T / 2, 3, 0, TAU); ctx.fill();

  // Lock icon (center)
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(T / 2 - 7, T / 2 - 4, 14, 10, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 3.5; ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.arc(T / 2, T / 2 - 4, 5, Math.PI, 0);
  ctx.stroke();

  // Key count badge
  ctx.fillStyle = '#fff';
  ctx.shadowColor = door.color; ctx.shadowBlur = 6;
  ctx.font = `bold ${Math.floor(T * 0.26)}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(door.reqKeys, T / 2, T * 0.8);

  // Color stripe (top)
  ctx.fillStyle = door.color;
  ctx.fillRect(3, 3, T - 6, 4);

  // "Need keys" flash if player near and can't open
  if (door.nearPlayer && !door.canOpen) {
    ctx.fillStyle = `rgba(255,80,80,${0.15 * pulse})`;
    ctx.fillRect(3, 3, T - 6, T - 6);
  }

  ctx.restore();
}

// ─── Trap ────────────────────────────────────────────────────
export function drawTrap(ctx, trap, T, gt) {
  const px = trap.x * T, py = trap.y * T;
  const cx = px + T / 2, cy = py + T / 2;

  switch (trap.type) {
    case 'PIT':    _drawPit(ctx, trap, px, py, cx, cy, T, gt); break;
    case 'MINE':   _drawMine(ctx, trap, cx, cy, T, gt); break;
    case 'SLOW':   _drawSlow(ctx, trap, cx, cy, T, gt); break;
    case 'POISON': _drawPoison(ctx, trap, cx, cy, T, gt); break;
    case 'SPIKE':  _drawSpike(ctx, trap, cx, cy, T, gt); break;
    case 'FREEZE': _drawFreeze(ctx, trap, cx, cy, T, gt); break;
  }
}

function _drawPit(ctx, trap, px, py, cx, cy, T, gt) {
  const cp = trap.crackPct;

  // Hairline crack — always barely visible as a hint
  ctx.save();
  ctx.strokeStyle = `rgba(60,40,20,${0.05 + cp * 0.4})`;
  ctx.lineWidth = 0.8 + cp * 2.5;

  // Main crack forks
  const cracks = [
    [[0.45,0.1],[0.5,0.5],[0.6,0.9]],
    [[0.5,0.5],[0.2,0.7]],
    [[0.5,0.5],[0.75,0.3]],
    [[0.5,0.5],[0.35,0.85]],
  ];
  for (const seg of cracks) {
    ctx.beginPath();
    seg.forEach(([fx, fy], i) => {
      // Jitter during warning
      const jx = cp > 0 ? (Math.sin(gt * 15 + fx * 100) * 1.5 * cp) : 0;
      const jy = cp > 0 ? (Math.cos(gt * 12 + fy * 80)  * 1.5 * cp) : 0;
      i === 0
        ? ctx.moveTo(px + T * fx + jx, py + T * fy + jy)
        : ctx.lineTo(px + T * fx + jx, py + T * fy + jy);
    });
    ctx.stroke();
  }

  // Pit opening (void) — grows during warning
  if (cp > 0.1) {
    const r = T * 0.38 * cp;
    ctx.shadowColor = '#000'; ctx.shadowBlur = 15 * cp;
    const voidG = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    voidG.addColorStop(0,   `rgba(0,0,0,${cp})`);
    voidG.addColorStop(0.7, `rgba(0,0,0,${cp * 0.85})`);
    voidG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = voidG;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, TAU); ctx.fill();

    // Edge crumble
    if (cp > 0.5) {
      ctx.strokeStyle = `rgba(80,55,30,${cp * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.92, r * 0.62, 0, 0, TAU); ctx.stroke();
    }
  }

  // Lethal state — pulsing red vignette inside
  if (trap.state === 'LETHAL' || trap.state === 'OPEN') {
    const pulse = 0.5 + Math.sin(gt * 8) * 0.3;
    ctx.strokeStyle = `rgba(255,30,30,${pulse * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.35, 0, TAU); ctx.stroke();
  }

  ctx.restore();
}

function _drawMine(ctx, trap, cx, cy, T, gt) {
  if (trap.state === 'DEAD') {
    // Crater
    ctx.save();
    ctx.fillStyle = 'rgba(20,15,10,0.7)';
    ctx.beginPath(); ctx.ellipse(cx, cy, T * 0.35, T * 0.25, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(100,70,40,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();

  // Mine body (subtle bump)
  const armed = trap.state === 'ARMED' || trap.state === 'EXPLODING';
  ctx.fillStyle = armed ? 'rgba(40,22,22,0.7)' : 'rgba(25,22,22,0.4)';
  ctx.shadowColor = armed ? '#880000' : 'transparent'; ctx.shadowBlur = armed ? 8 : 0;
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.14, 0, TAU); ctx.fill();

  // Metal sheen
  ctx.fillStyle = 'rgba(80,75,75,0.5)';
  ctx.beginPath(); ctx.arc(cx - T * 0.04, cy - T * 0.05, T * 0.06, 0, TAU); ctx.fill();

  // LED blink
  const blinkFast = trap.state === 'ARMED';
  const blinkFreq = blinkFast ? (8 + trap.armPct * 12) : 3;
  const blink     = Math.sin(trap.blink) > (blinkFast ? 0.0 : 0.5);
  const ledAlpha  = blink ? (blinkFast ? 0.9 : 0.45) : 0.06;

  ctx.shadowColor = `rgba(255,0,0,${ledAlpha})`; ctx.shadowBlur = blink ? 10 : 2;
  ctx.fillStyle   = `rgba(255,0,0,${ledAlpha})`;
  ctx.beginPath(); ctx.arc(cx, cy, T * 0.06, 0, TAU); ctx.fill();

  // EXPLODING
  if (trap.state === 'EXPLODING') {
    const ep = trap.explodePct;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 30 * ep;
    const expG = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.65 * ep);
    expG.addColorStop(0,   `rgba(255,255,200,${1 - ep})`);
    expG.addColorStop(0.4, `rgba(255,150,0,${0.9 * (1 - ep)})`);
    expG.addColorStop(1,   'rgba(255,50,0,0)');
    ctx.fillStyle = expG;
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.65 * ep, 0, TAU); ctx.fill();

    // Shockwave ring
    ctx.strokeStyle = `rgba(255,200,100,${0.8 * (1 - ep)})`;
    ctx.lineWidth = 3 * (1 - ep * 0.5);
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.8 * ep, 0, TAU); ctx.stroke();
  }

  ctx.restore();
}

function _drawSlow(ctx, trap, cx, cy, T, gt) {
  if (trap.webPct <= 0) return;
  const wp = trap.webPct;
  ctx.save();
  ctx.globalAlpha = wp;
  ctx.strokeStyle = 'rgba(200,210,220,0.5)';
  ctx.lineWidth = 0.8;
  const r = T * 0.4;
  
  // Web strands
  ctx.translate(cx, cy);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Add jitter
    ctx.lineTo(r * Math.cos(a) + Math.sin(a*3)*3, r * Math.sin(a) + Math.cos(a*2)*3);
    ctx.stroke();
  }
  
  // Web rings
  for(let j=0.3; j<=0.9; j+=0.3) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      const x = r * j * Math.cos(a) + Math.sin(a*5)*2;
      const y = r * j * Math.sin(a) + Math.cos(a*4)*2;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function _drawPoison(ctx, trap, cx, cy, T, gt) {
  ctx.save();
  // Vent base
  ctx.fillStyle = '#1c221a';
  ctx.beginPath(); ctx.arc(cx, cy, T*0.15, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2d3b28'; ctx.lineWidth = 2; ctx.stroke();
  
  // Vent holes
  ctx.fillStyle = '#0a0d09';
  ctx.beginPath(); ctx.arc(cx-4, cy-4, 2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+4, cy-4, 2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy+5, 2, 0, TAU); ctx.fill();

  // Gas cloud
  const radius = (0.55 + trap.dc.dm * 0.025) * T;
  const pulse = Math.sin(trap.gasPhase) * 0.2 + 0.8;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * pulse);
  g.addColorStop(0, 'rgba(80, 200, 60, 0.4)');
  g.addColorStop(0.5, 'rgba(50, 160, 40, 0.15)');
  g.addColorStop(1, 'rgba(50, 160, 40, 0)');
  
  ctx.fillStyle = g;
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath(); ctx.arc(cx, cy, radius * pulse, 0, TAU); ctx.fill();
  ctx.restore();
}

function _drawSpike(ctx, trap, cx, cy, T, gt) {
  ctx.save();
  ctx.translate(cx, cy);
  
  // Base plate
  ctx.fillStyle = '#222';
  ctx.fillRect(-T*0.3, -T*0.3, T*0.6, T*0.6);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
  ctx.strokeRect(-T*0.3, -T*0.3, T*0.6, T*0.6);
  
  // Warning glow
  if (trap.state === 'WARNING') {
    ctx.fillStyle = `rgba(255,50,0,${trap.spikePct * 0.4})`;
    ctx.fillRect(-T*0.3, -T*0.3, T*0.6, T*0.6);
  }
  
  // Spikes
  let ext = 0;
  if (trap.state === 'WARNING') ext = trap.spikePct * 3; // peek out
  else if (trap.state === 'EXTENDED') ext = 15;
  else if (trap.state === 'RETRACTING') ext = trap.spikePct * 15;
  
  if (ext > 0) {
    ctx.fillStyle = '#889095'; // metal
    ctx.strokeStyle = '#fff';
    const coords = [[-T*0.15,-T*0.15], [T*0.15,-T*0.15], [-T*0.15,T*0.15], [T*0.15,T*0.15], [0,0]];
    for (const [sx, sy] of coords) {
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + ext*0.1, 0, TAU);
      ctx.fill();
      // Spike tip shine
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1, 1, 0, TAU);
      ctx.stroke();
    }
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 5;
    ctx.stroke();
  }
  
  ctx.restore();
}

function _drawFreeze(ctx, trap, cx, cy, T, gt) {
  if (trap.crystalPct <= 0) return;
  const cp = trap.crystalPct;
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(trap.crystalSpin);
  ctx.scale(cp, cp);
  
  // Ice crystal
  ctx.shadowColor = '#88ccff'; ctx.shadowBlur = 12 * cp;
  ctx.fillStyle = 'rgba(150,220,255,0.7)';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.moveTo(0, -T*0.25);
  ctx.lineTo(T*0.15, 0);
  ctx.lineTo(0, T*0.25);
  ctx.lineTo(-T*0.15, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, -T*0.25);
  ctx.lineTo(T*0.05, 0);
  ctx.lineTo(0, T*0.25);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

// ─── Player ──────────────────────────────────────────────────
export function drawPlayer(ctx, player, T, gt) {
  const wx = player.x * T, wy = player.y * T;

  ctx.save();
  ctx.translate(wx, wy);

  // Ground shadow
  ctx.save();
  ctx.scale(1, 0.35);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(0, T * 0.28, T * 0.22, T * 0.22, 0, 0, TAU); ctx.fill();
  ctx.restore();

  // Animation state
  const wc   = player.walkCycle;
  const bob  = player.moving ? Math.sin(wc) * 2.8 : Math.sin(player.breathe) * 1.2;
  const lean = player.moving ? (Math.cos(player.facing) * 2.5) : 0;

  ctx.translate(lean, bob);

  // ── Legs ────────────────────────────────────────────────────
  const legSwing = Math.sin(wc) * 0.2;
  const footOff  = T * 0.1;

  for (let side = -1; side <= 1; side += 2) {
    const lx = side * footOff * (1 + legSwing * side);
    const ly = T * 0.14 + Math.cos(wc + (side < 0 ? 0 : Math.PI)) * T * 0.06;
    const lG = ctx.createLinearGradient(lx - T * 0.07, ly, lx + T * 0.07, ly + T * 0.12);
    lG.addColorStop(0, '#2a6ab0');
    lG.addColorStop(1, '#1a3d70');
    ctx.fillStyle = lG;
    ctx.beginPath(); ctx.ellipse(lx, ly, T * 0.072, T * 0.11, legSwing * side * 0.4, 0, TAU); ctx.fill();

    // Boot
    ctx.fillStyle = '#182840';
    ctx.beginPath(); ctx.ellipse(lx + side * T * 0.02, ly + T * 0.1, T * 0.08, T * 0.045, 0, 0, TAU); ctx.fill();
  }

  // ── Cloak / Body ────────────────────────────────────────────
  ctx.shadowColor = '#3a7fd5'; ctx.shadowBlur = 12;
  const bodyG = ctx.createLinearGradient(-T * 0.19, -T * 0.32, T * 0.19, T * 0.12);
  bodyG.addColorStop(0,   '#5a9ae0');
  bodyG.addColorStop(0.4, '#2060b0');
  bodyG.addColorStop(1,   '#0e2d5a');
  ctx.fillStyle = bodyG;

  // Torso shape (slightly tapered)
  ctx.beginPath();
  ctx.moveTo(-T * 0.16, -T * 0.29);
  ctx.lineTo( T * 0.16, -T * 0.29);
  ctx.lineTo( T * 0.19,  T * 0.1);
  ctx.lineTo(-T * 0.19,  T * 0.1);
  ctx.closePath();
  ctx.fill();

  // Chest highlight
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath(); ctx.ellipse(-T * 0.03, -T * 0.15, T * 0.08, T * 0.1, -0.2, 0, TAU); ctx.fill();

  // Shoulder pads
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = '#4080c0';
    ctx.beginPath(); ctx.ellipse(side * T * 0.2, -T * 0.25, T * 0.07, T * 0.045, side * 0.3, 0, TAU); ctx.fill();
  }

  // Belt
  ctx.fillStyle = 'rgba(20,10,10,0.7)';
  ctx.fillRect(-T * 0.19, T * 0.04, T * 0.38, T * 0.05);
  ctx.fillStyle = 'rgba(200,160,50,0.8)';
  ctx.fillRect(-T * 0.04, T * 0.04, T * 0.08, T * 0.05); // buckle

  // ── Head ─────────────────────────────────────────────────────
  ctx.shadowColor = '#58b8ff'; ctx.shadowBlur = 15;
  const headG = ctx.createRadialGradient(-T * 0.04, -T * 0.45, T * 0.02, -T * 0.04, -T * 0.4, T * 0.16);
  headG.addColorStop(0,   '#a0d4ff');
  headG.addColorStop(0.55,'#5090e0');
  headG.addColorStop(1,   '#1a3d80');
  ctx.fillStyle = headG;
  ctx.beginPath(); ctx.arc(0, -T * 0.42, T * 0.155, 0, TAU); ctx.fill();

  // Visor (bright slit)
  ctx.fillStyle = 'rgba(180,230,255,0.78)';
  ctx.beginPath();
  ctx.ellipse(0, -T * 0.42, T * 0.11, T * 0.054, 0, 0, Math.PI);
  ctx.fill();

  // Visor glow stripe
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.ellipse(-T * 0.04, -T * 0.455, T * 0.07, T * 0.025, -0.15, 0, TAU); ctx.fill();

  // Helmet ridge
  ctx.strokeStyle = 'rgba(200,220,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-T * 0.06, -T * 0.57);
  ctx.lineTo( T * 0.06, -T * 0.57);
  ctx.stroke();

  // ── Arms ─────────────────────────────────────────────────────
  const armSwing = player.moving ? Math.sin(wc + Math.PI) * 0.25 : Math.sin(player.breathe * 0.7) * 0.06;
  for (let side = -1; side <= 1; side += 2) {
    const ax = side * T * 0.24;
    const ay = -T * 0.2 + armSwing * side * T * 0.12;
    const aG = ctx.createLinearGradient(ax, ay, ax, ay + T * 0.22);
    aG.addColorStop(0, '#3a7bc8');
    aG.addColorStop(1, '#1a4080');
    ctx.fillStyle = aG; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.ellipse(ax, ay + T * 0.11, T * 0.06, T * 0.115, armSwing * side * 0.4, 0, TAU); ctx.fill();

    // Glove
    ctx.fillStyle = '#223355';
    ctx.beginPath(); ctx.arc(ax + side * T * 0.01, ay + T * 0.24, T * 0.065, 0, TAU); ctx.fill();
  }

  // Direction dot
  ctx.fillStyle = 'rgba(150,200,255,0.55)';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(Math.cos(player.facing) * T * 0.22, Math.sin(player.facing) * T * 0.22 - T * 0.15, 2.5, 0, TAU);
  ctx.fill();

  ctx.restore();
}

// ─── Screen post-effects ─────────────────────────────────────

export function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function drawDeathFlash(ctx, W, H, alpha) {
  ctx.fillStyle = `rgba(180,0,0,${alpha * 0.55})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawPortalFlash(ctx, W, H, alpha) {
  ctx.fillStyle = `rgba(160,80,255,${alpha * 0.45})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawCpFlash(ctx, W, H, alpha) {
  ctx.fillStyle = `rgba(88,166,255,${alpha * 0.3})`;
  ctx.fillRect(0, 0, W, H);
}

// ─── Minimap ─────────────────────────────────────────────────
export function drawMinimap(mmCtx, maze, gridW, gridH, player, checkpoints, exit, portals) {
  const S = 3; // pixels per cell
  const W = gridW * S, H = gridH * S;
  mmCtx.canvas.width  = W;
  mmCtx.canvas.height = H;

  // Background
  mmCtx.fillStyle = '#07080b';
  mmCtx.fillRect(0, 0, W, H);

  // Walls
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (maze[y][x] === 0) {
        mmCtx.fillStyle = '#1c2533';
        mmCtx.fillRect(x * S, y * S, S, S);
      }
    }
  }

  // Exit
  mmCtx.fillStyle = '#2ea043';
  mmCtx.fillRect(exit.x * S, exit.y * S, S * 2, S * 2);

  // Checkpoints
  checkpoints.forEach(c => {
    mmCtx.fillStyle = c.active ? '#58a6ff' : '#1d3566';
    mmCtx.fillRect(c.x * S, c.y * S, S, S);
  });

  // Portals
  portals.forEach(p => {
    mmCtx.fillStyle = '#9b59b6';
    mmCtx.fillRect(p.x * S, p.y * S, S, S);
  });

  // Player dot
  mmCtx.fillStyle = '#ffffff';
  mmCtx.shadowColor = '#58a6ff'; mmCtx.shadowBlur = 4;
  mmCtx.beginPath();
  mmCtx.arc(player.x * S, player.y * S, S * 1.4, 0, TAU);
  mmCtx.fill();
  mmCtx.shadowBlur = 0;
}

// ─── Utility ─────────────────────────────────────────────────
function _shadeHex(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16) + amt;
  let g = parseInt(hex.slice(3, 5), 16) + amt;
  let b = parseInt(hex.slice(5, 7), 16) + amt;
  const clamp = v => Math.max(0, Math.min(255, v));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

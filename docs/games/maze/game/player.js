/**
 * THE LABYRINTH — game/player.js
 * Player class with full animation state machine.
 */
export class Player {
  constructor(startX, startY) {
    // World position (tile units)
    this.x = startX; this.y = startY;
    this.vx = 0; this.vy = 0;
    this.facing = 0;  // radians

    // Config
    this.baseSpeed = 5.8;
    this.speed  = 5.8;
    this.radius = 0.27;

    // Stats
    this.maxHp = 100;
    this.hp    = 100;
    this.debuffs = {
      slow: 0,
      freeze: 0,
      poison: 0,
      slowFactor: 1
    };

    // Progress
    this.heldKeys  = {};  // color → count
    this.checkpoint = { x: startX, y: startY };

    // Animation
    this.walkCycle  = 0;    // 0..TAU walk phase
    this.moving     = false;
    this.stepTimer  = 0;
    this.stepAnim   = 0;    // 0..1 step punch
    this.breathe    = 0;    // idle breathing
    this.deathFlash = 0;    // 0..1 red overlay

    // FX
    this.portalFlash = 0;  // 0..1 teleport flash
    this.cpFlash     = 0;  // 0..1 checkpoint glow
  }

  update(dx, dy, dt) {
    this.moving = dx !== 0 || dy !== 0;
    this.breathe += dt * 1.8;

    // --- Process Debuffs ---
    this.debuffs.slow   = Math.max(0, this.debuffs.slow - dt);
    this.debuffs.freeze = Math.max(0, this.debuffs.freeze - dt);
    this.debuffs.poison = Math.max(0, this.debuffs.poison - dt);

    if (this.debuffs.poison > 0) {
      // 10 dps for poison
      this.hp -= 15 * dt;
    } else {
      // Passive regen when not poisoned
      this.hp = Math.min(this.maxHp, this.hp + 2 * dt);
    }

    if (this.hp <= 0) {
      // Handled by main loop
      return;
    }

    // --- Speed Calc ---
    this.speed = this.baseSpeed;
    if (this.debuffs.slow > 0) this.speed *= this.debuffs.slowFactor;
    if (this.debuffs.freeze > 0) this.speed *= 0.1; // 90% slow when frozen

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    this.vx = dx * this.speed;
    this.vy = dy * this.speed;

    if (this.moving && this.debuffs.freeze === 0) {
      this.facing = Math.atan2(dy, dx);
      this.walkCycle += dt * 9.5 * (this.speed / this.baseSpeed);
      this.stepTimer  += dt;
      if (this.stepTimer > 0.21) {
        this.stepTimer = 0;
        this.stepAnim  = 1;
      }
    } else {
      this.walkCycle = 0;
      this.stepTimer = 0;
    }

    this.stepAnim   = Math.max(0, this.stepAnim   - dt * 8);
    this.deathFlash = Math.max(0, this.deathFlash - dt * 2.2);
    this.portalFlash= Math.max(0, this.portalFlash- dt * 2.0);
    this.cpFlash    = Math.max(0, this.cpFlash    - dt * 1.5);
  }

  die() {
    this.deathFlash = 1;
    this.x = this.checkpoint.x;
    this.y = this.checkpoint.y;
    this.vx = 0; this.vy = 0;
    this.hp = this.maxHp;
    this.debuffs.slow = 0;
    this.debuffs.freeze = 0;
    this.debuffs.poison = 0;
  }

  applyEffect(type, val, dur) {
    if (type === 'slow') {
      this.debuffs.slow = dur;
      this.debuffs.slowFactor = val;
    } else if (type === 'freeze') {
      this.debuffs.freeze = dur;
    } else if (type === 'poison') {
      this.debuffs.poison = dur;
    }
  }

  setCheckpoint(x, y) {
    this.checkpoint.x = x;
    this.checkpoint.y = y;
    this.cpFlash = 1;
  }

  triggerPortal() { this.portalFlash = 1; }

  // ── Collision helpers ──────────────────────────────────────
  applyVelocityX(dt) { this.x += this.vx * dt; }
  applyVelocityY(dt) { this.y += this.vy * dt; }

  pushOut(tx, ty) {
    const r  = this.radius;
    const cx = Math.max(tx, Math.min(this.x, tx + 1));
    const cy = Math.max(ty, Math.min(this.y, ty + 1));
    const dx = this.x - cx, dy = this.y - cy;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < r && d > 0) {
      const ov = r - d;
      this.x += dx / d * ov;
      this.y += dy / d * ov;
    }
  }

  hasKey(color) { return (this.heldKeys[color] || 0) > 0; }
  countKeys(color) { return this.heldKeys[color] || 0; }

  addKey(color) {
    this.heldKeys[color] = (this.heldKeys[color] || 0) + 1;
  }

  useKeys(color, count) {
    this.heldKeys[color] = Math.max(0, (this.heldKeys[color] || 0) - count);
  }
}

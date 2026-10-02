/**
 * THE LABYRINTH — engine/particles.js
 * Full-featured particle system with emitter types, gravity, glow, trails.
 */

const POOL_SIZE = 2000;

export class ParticleSystem {
  constructor() {
    this._pool   = new Array(POOL_SIZE).fill(null).map(() => this._make());
    this._active = [];
  }

  _make() {
    return { alive: false, x:0, y:0, vx:0, vy:0, life:0, maxLife:0,
             r:3, color:'#fff', glow:false, glowColor:'', trail:false,
             gravity:0, drag:0.99, spin:0, shape:'circle', scale:1 };
  }

  _get() {
    // Try pool first
    const p = this._pool.find(p => !p.alive);
    if (p) { p.alive = true; return p; }
    // Fallback: new object (pool exhausted)
    const np = this._make(); np.alive = true;
    this._active.push(np);
    return np;
  }

  /**
   * Emit `count` particles at world position (wx, wy).
   * opts: { speed, speedVar, angle, angleSpread, life, lifeVar,
   *         r, rVar, color, colors, glow, glowColor, gravity, drag,
   *         shape:'circle'|'square'|'spark', trail }
   */
  emit(wx, wy, count, opts = {}) {
    const {
      speed = 3, speedVar = 1.5,
      angle = 0, angleSpread = Math.PI,
      life = 0.8, lifeVar = 0.3,
      r = 3, rVar = 1.5,
      color = '#ffffff', colors = null,
      glow = false, glowColor = '',
      gravity = 60, drag = 0.97,
      shape = 'circle', trail = false
    } = opts;

    for (let i = 0; i < count; i++) {
      const p = this._get();
      const a = angle + (Math.random() - 0.5) * 2 * angleSpread;
      const s = speed + (Math.random() - 0.5) * 2 * speedVar;
      p.x = wx; p.y = wy;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = p.maxLife = Math.max(0.1, life + (Math.random() - 0.5) * 2 * lifeVar);
      p.r = Math.max(0.5, r + (Math.random() - 0.5) * 2 * rVar);
      p.color = colors ? colors[Math.floor(Math.random() * colors.length)] : color;
      p.glow = glow;
      p.glowColor = glowColor || p.color;
      p.gravity = gravity;
      p.drag = drag;
      p.shape = shape;
      p.trail = trail;
      p.spin = (Math.random() - 0.5) * 10;
      p.scale = 1;

      if (!this._active.includes(p)) this._active.push(p);
    }
  }

  /** Continuous ring burst */
  ring(wx, wy, count, opts = {}) {
    const base = opts.angle || 0;
    for (let i = 0; i < count; i++) {
      const a = base + (i / count) * Math.PI * 2;
      this.emit(wx, wy, 1, { ...opts, angle: a, angleSpread: 0.15 });
    }
  }

  update(dt) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const p = this._active[i];
      if (!p.alive) { this._active.splice(i, 1); continue; }

      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      p.spin *= 0.98;

      if (p.life <= 0) { p.alive = false; }
    }
  }

  draw(ctx) {
    for (const p of this._active) {
      if (!p.alive) continue;
      const t = p.life / p.maxLife;  // 1 → 0
      const alpha = Math.pow(t, 0.5);
      const radius = p.r * (0.3 + t * 0.7);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.glow) {
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur  = radius * 4;
      }

      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        // Elongated spark along velocity direction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const len = Math.max(radius, radius + speed * 0.06);
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, len, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin * t);
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  get count() { return this._active.filter(p => p.alive).length; }
}

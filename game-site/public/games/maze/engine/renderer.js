/**
 * THE LABYRINTH — engine/renderer.js
 * High-DPI aware canvas renderer with layered world/screen contexts.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.logW = 0; this.logH = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.logW = window.innerWidth;
    this.logH = window.innerHeight;
    this.canvas.width  = Math.round(this.logW * this.dpr);
    this.canvas.height = Math.round(this.logH * this.dpr);
    this.canvas.style.width  = this.logW + 'px';
    this.canvas.style.height = this.logH + 'px';
  }

  /** Begin world-space frame centered on camera world position (cx,cy) with optional shake */
  beginWorld(cx, cy, shakeX = 0, shakeY = 0) {
    const c = this.ctx, d = this.dpr;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, this.logW, this.logH);
    c.save();
    c.translate(
      Math.round(-cx + shakeX + this.logW * 0.5),
      Math.round(-cy + shakeY + this.logH * 0.5)
    );
  }

  endWorld() { this.ctx.restore(); }

  /** Begin screen-space frame (HUD, overlays) */
  beginScreen() {
    const d = this.dpr;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  endFrame() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); }

  get c() { return this.ctx; }
  get w() { return this.logW; }
  get h() { return this.logH; }

  // ─── Utility draw helpers ─────────────────────────────────────
  fillCircle(x, y, r, style) {
    const c = this.ctx;
    c.fillStyle = style;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  strokeCircle(x, y, r, style, lw = 1) {
    const c = this.ctx;
    c.strokeStyle = style; c.lineWidth = lw;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  }

  hexPath(x, y, r, rot = -Math.PI / 6) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = rot + i * Math.PI / 3;
      i === 0 ? c.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
               : c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    c.closePath();
  }

  glow(color, blur) { this.ctx.shadowColor = color; this.ctx.shadowBlur = blur; }
  noGlow() { this.ctx.shadowColor = 'transparent'; this.ctx.shadowBlur = 0; }
}

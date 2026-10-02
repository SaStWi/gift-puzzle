/**
 * THE LABYRINTH — engine/input.js
 * Clean input manager tracking held, just-pressed, and axes.
 */
export class InputManager {
  constructor() {
    this._held = new Set();
    this._prev = new Set();
    window.addEventListener('keydown', e => {
      this._held.add(e.code);
      // Prevent arrow/space scroll
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))
        e.preventDefault();
    });
    window.addEventListener('keyup', e => this._held.delete(e.code));
  }

  /** Call once per frame AFTER reading input */
  tick() { this._prev = new Set(this._held); }

  held(code)    { return this._held.has(code); }
  pressed(code) { return this._held.has(code) && !this._prev.has(code); }
  released(code){ return !this._held.has(code) && this._prev.has(code); }

  get dx() {
    let v = 0;
    if (this.held('KeyA') || this.held('ArrowLeft'))  v -= 1;
    if (this.held('KeyD') || this.held('ArrowRight')) v += 1;
    return v;
  }
  get dy() {
    let v = 0;
    if (this.held('KeyW') || this.held('ArrowUp'))   v -= 1;
    if (this.held('KeyS') || this.held('ArrowDown')) v += 1;
    return v;
  }
  get moving() { return this.dx !== 0 || this.dy !== 0; }
}

/**
 * THE LABYRINTH — engine/camera.js
 * Smooth-follow camera with shake support.
 */
export class Camera {
  constructor() {
    this.x = 0; this.y = 0;       // target
    this.rx = 0; this.ry = 0;     // rendered (smoothed)
    this.shakeX = 0; this.shakeY = 0;
    this._shakeMag = 0; this._shakeDur = 0;
    this._lagX = 0; this._lagY = 0;
  }

  follow(wx, wy) { this.x = wx; this.y = wy; }

  snap(wx, wy) {
    this.x = wx; this.y = wy;
    this.rx = wx; this.ry = wy;
  }

  update(dt) {
    // Exponential smooth follow
    const spd = 9.5;
    this.rx += (this.x - this.rx) * Math.min(1, spd * dt);
    this.ry += (this.y - this.ry) * Math.min(1, spd * dt);

    if (this._shakeDur > 0) {
      this._shakeDur -= dt;
      const m = this._shakeMag * (this._shakeDur > 0 ? 1 : 0);
      this.shakeX = (Math.random() * 2 - 1) * m;
      this.shakeY = (Math.random() * 2 - 1) * m;
      this._shakeMag *= 0.88;
    } else {
      this.shakeX = 0; this.shakeY = 0;
    }
  }

  shake(mag, dur) {
    if (mag > this._shakeMag) this._shakeMag = mag;
    if (dur > this._shakeDur) this._shakeDur = dur;
  }
}

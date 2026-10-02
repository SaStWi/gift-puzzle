/**
 * THE LABYRINTH — engine/audio.js
 * Web Audio synthesizer for all game sound effects.
 */
export class AudioEngine {
  constructor() {
    this._ac = null;
    // Lazy init on first user gesture
    const init = () => {
      if (this._ac) return;
      this._ac = new (window.AudioContext || window.webkitAudioContext)();
      this._master = this._ac.createGain();
      this._master.gain.value = 0.5;
      this._master.connect(this._ac.destination);
    };
    document.addEventListener('keydown', init, { once: true });
    document.addEventListener('click',   init, { once: true });
  }

  /** Low-level: schedule a note */
  _n(type, freq, gain, dur, delay = 0, freqEnd = null) {
    if (!this._ac) return;
    const t = this._ac.currentTime + delay;
    const osc  = this._ac.createOscillator();
    const gn   = this._ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    gn.gain.setValueAtTime(gain, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gn);
    gn.connect(this._master);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  // ─── Sound definitions ──────────────────────────────────────
  playStep()       { this._n('triangle', 180 + Math.random()*40, 0.04, 0.06); }
  playCollect()    {
    this._n('sine', 660, 0.12, 0.1);
    this._n('sine', 880, 0.10, 0.12, 0.07);
    this._n('sine',1320, 0.08, 0.15, 0.14);
  }
  playCheckpoint() {
    this._n('sine', 440, 0.14, 0.18);
    this._n('sine', 550, 0.12, 0.18, 0.12);
    this._n('sine', 660, 0.10, 0.22, 0.24);
    this._n('sine', 880, 0.08, 0.25, 0.36);
  }
  playDoorOpen()   {
    [110, 165, 220, 330].forEach((f, i) =>
      this._n('square', f, 0.08, 0.18, i * 0.07, f * 1.2));
  }
  playPortal()     {
    this._n('sine', 220, 0.18, 0.5,  0.0, 880);
    this._n('sine', 440, 0.12, 0.4,  0.1, 220);
  }
  playTrapWarn(freq = 600) { this._n('square', freq, 0.06, 0.04); }
  playMineBeep()   { this._n('square', 880, 0.07, 0.04); }
  playDeath()      {
    this._n('sawtooth', 440, 0.18, 0.15, 0.0, 110);
    this._n('sawtooth', 220, 0.14, 0.25, 0.12, 55);
    this._n('sawtooth',  80, 0.10, 0.45, 0.28, 40);
  }
  playWin()        {
    [440, 550, 660, 880, 1100].forEach((f, i) =>
      this._n('sine', f, 0.13, 0.5, i * 0.12));
  }
  playPitWarning() {
    this._n('sine', 200, 0.10, 0.12, 0, 100);
  }
}

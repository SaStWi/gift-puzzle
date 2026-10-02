/**
 * THE LABYRINTH — game/entities.js
 * All interactive entities. Trap system with 6 types + difficulty scaling.
 *
 * TRAP TYPES:
 *   PIT    — Floor cracks open. Warning → dodge or die. Reactivates.
 *   MINE   — Proximity mine, arms then detonates.
 *   SLOW   — Spider web on floor. Contact → slow debuff. Respawns.
 *   POISON — Gas vent. Player in range → poison DoT. Always active.
 *   SPIKE  — Periodic floor spikes, clearly telegraphed.
 *   FREEZE — Ice crystal. Contact → freeze debuff. Regrows.
 */

const TAU = Math.PI * 2;

// ─── Key collectible ─────────────────────────────────────────
export class KeyItem {
  constructor(x, y, color, id) {
    this.x = x; this.y = y;
    this.color = color; this.id = id;
    this.collected = false;
    this.bob  = Math.random() * TAU;
    this.spin = Math.random() * TAU;
    this.scale = 0;
  }

  update(dt) {
    if (this.collected) return;
    this.bob  += dt * 2.2;
    this.spin += dt * 2.8;
    this.scale = Math.min(1, this.scale + dt * 4);
  }

  /** Returns true exactly once — marks as collected immediately */
  tryCollect(player) {
    if (this.collected) return false;
    const dx = player.x - (this.x + 0.5);
    const dy = player.y - (this.y + 0.5);
    if ((dx * dx + dy * dy) < 0.55 * 0.55) {
      this.collected = true;
      return true;
    }
    return false;
  }
}

// ─── Checkpoint ──────────────────────────────────────────────
export class Checkpoint {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.active = false;
    this.pulse  = Math.random() * TAU;
    this.activateAnim = 0;
  }
  update(dt) {
    this.pulse += dt * 2;
    if (this.activateAnim > 0) this.activateAnim -= dt * 3;
  }
  activate() {
    if (this.active) return false;
    this.active = true;
    this.activateAnim = 1;
    return true;
  }
}

// ─── Door ────────────────────────────────────────────────────
export class Door {
  constructor(x, y, color, reqKeys) {
    this.x = x; this.y = y;
    this.color = color; this.reqKeys = reqKeys;
    this.open = false; this.openPct = 0;
    this.pulse = Math.random() * TAU;
    this.nearPlayer = false; this.canOpen = false;
  }
  update(dt) {
    this.pulse += dt * 2.5;
    if (this.open) this.openPct = Math.min(1, this.openPct + dt * 3.5);
  }
  get passable() { return this.open && this.openPct > 0.85; }
}

// ─── Exit ────────────────────────────────────────────────────
export class Exit {
  constructor(x, y) { this.x = x; this.y = y; this.pulse = 0; }
  update(dt) { this.pulse += dt * 2.2; }
}

// ─── Portal ──────────────────────────────────────────────────
export class Portal {
  constructor(x, y, partnerId) {
    this.x = x; this.y = y;
    this.partnerId = partnerId;
    this.id = 0;
    this.cooldown = 0;
    this.spin   = Math.random() * TAU;
    this.ripple = 0;
  }

  update(dt) {
    this.spin += dt * 2.0;
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.ripple > 0)   this.ripple   -= dt * 2;
  }

  tryUse(player, allPortals) {
    if (this.cooldown > 0) return false;
    const dx = player.x - (this.x + 0.5);
    const dy = player.y - (this.y + 0.5);
    if (dx * dx + dy * dy > 0.48 * 0.48) return false;

    const partner = allPortals.find(p => p.id === this.partnerId);
    if (!partner) return false;

    player.x = partner.x + 0.5;
    player.y = partner.y + 0.5;

    // Both portals go on cooldown → no instant bounce-back
    this.cooldown    = 2.5;
    partner.cooldown = 2.5;
    partner.ripple   = 1;
    this.ripple      = 1;
    return true;
  }
}

// ─── Trap ────────────────────────────────────────────────────
/**
 * Unified trap class.
 *
 * @param {number} x
 * @param {number} y
 * @param {string} type  PIT | MINE | SLOW | POISON | SPIKE | FREEZE
 * @param {object} dc    Difficulty config from DIFF_CONFIG
 */
export class Trap {
  static KILL_R    = 0.28;   // lethal radius (tile units)
  static WARN_DIST = 1.65;   // distance that wakes PIT / MINE

  constructor(x, y, type, dc) {
    this.x = x; this.y = y;
    this.type = type;
    this.dc   = dc;

    this.state = 'IDLE';
    this.timer = 0;
    this._dist = 99;
    this._lastSound = -9;

    // Shared / per-type visual state
    this.crackPct    = 0;   // PIT
    this.blink       = Math.random() * TAU;   // MINE, SPIKE warning
    this.armPct      = 0;   // MINE
    this.explodePct  = 0;   // MINE
    this.webPct      = 1;   // SLOW  (1=full, 0=depleted)
    this.gasPhase    = Math.random() * TAU;   // POISON
    this.spikePct    = 0;   // SPIKE (0=retracted, 1=extended)
    this.spikePhase  = Math.random() * TAU;  // random desync
    this.crystalPct  = 1;   // FREEZE
    this.crystalSpin = Math.random() * TAU;
  }

  /**
   * @param {function} onKill   () → void
   * @param {function} onEffect (type:'slow'|'poison'|'freeze', value:number, duration:number) → void
   */
  update(dt, px, py, onKill, onEffect, audio) {
    const dx = px - (this.x + 0.5);
    const dy = py - (this.y + 0.5);
    this._dist = Math.sqrt(dx * dx + dy * dy);
    this.timer += dt;
    this.blink += dt * 4.5;

    switch (this.type) {
      case 'PIT':    this._pit(dt, onKill, audio); break;
      case 'MINE':   this._mine(dt, onKill, audio); break;
      case 'SLOW':   this._slow(dt, onEffect, audio); break;
      case 'POISON': this._poison(dt, onEffect, audio); break;
      case 'SPIKE':  this._spike(dt, onKill, audio); break;
      case 'FREEZE': this._freeze(dt, onEffect, audio); break;
    }
  }

  // ── PIT ─────────────────────────────────────────────────────
  _pit(dt, onKill, audio) {
    const pw = this.dc.pitWarn;
    const kr = Trap.KILL_R;
    const wd = Trap.WARN_DIST;

    switch (this.state) {
      case 'IDLE':
        if (this._dist < wd) {
          this.state = 'WARNING'; this.timer = 0;
          audio?.playPitWarning();
        }
        break;

      case 'WARNING':
        this.crackPct = Math.min(1, this.timer / pw);

        if (this.timer - this._lastSound > Math.max(0.1, 0.45 - this.crackPct * 0.3)) {
          this._lastSound = this.timer;
          audio?.playTrapWarn(260 + this.crackPct * 240);
        }

        // Kill if standing on it when cracks complete
        if (this.crackPct >= 1) {
          if (this._dist < kr + 0.12) { this.state = 'LETHAL'; this.timer = 0; onKill(); }
          else                         { this.state = 'COOLING'; this.timer = 0; }
        }
        // Also kill if player walks into 75%+ cracked pit
        if (this.crackPct > 0.75 && this._dist < kr) {
          this.state = 'LETHAL'; this.timer = 0; onKill();
        }
        break;

      case 'COOLING':
        this.crackPct = Math.max(0, 1 - this.timer / 0.8);
        if (this.timer > 0.8) { this.state = 'IDLE'; this.timer = 0; this._lastSound = -9; }
        break;

      case 'LETHAL':
        if (this._dist < kr) onKill();
        if (this.timer > 0.55) { this.state = 'OPEN'; this.timer = 0; }
        break;

      case 'OPEN':
        this.crackPct = 1;
        if (this._dist < kr) onKill();
        // Reactivate after pitReset seconds
        if (this.timer > this.dc.pitReset) { this.state = 'RESETTING'; this.timer = 0; }
        break;

      case 'RESETTING':
        // Floor heals — cracks close
        this.crackPct = Math.max(0, 1 - this.timer / 1.8);
        if (this.timer > 1.8) { this.state = 'IDLE'; this.timer = 0; this.crackPct = 0; this._lastSound = -9; }
        break;
    }
  }

  // ── MINE ────────────────────────────────────────────────────
  _mine(dt, onKill, audio) {
    const ma = this.dc.mineArm;

    switch (this.state) {
      case 'IDLE':
        if (this._dist < Trap.WARN_DIST) {
          this.state = 'ARMED'; this.timer = 0; this.armPct = 0;
        }
        break;

      case 'ARMED':
        this.armPct = Math.min(1, this.timer / ma);
        const bi = Math.max(0.06, 0.55 - this.armPct * 0.48);
        if (this.timer - this._lastSound > bi) { this._lastSound = this.timer; audio?.playMineBeep(); }

        // Player retreats → disarm
        if (this._dist > Trap.WARN_DIST + 0.45) {
          this.state = 'IDLE'; this.timer = 0; this.armPct = 0; break;
        }

        if (this.timer >= ma) {
          if (this._dist < Trap.KILL_R + 0.42) { this.state = 'EXPLODING'; this.timer = 0; onKill(); }
          else                                   { this.state = 'IDLE'; this.timer = 0; this.armPct = 0; }
        }
        break;

      case 'EXPLODING':
        this.explodePct = Math.min(1, this.timer / 0.55);
        if (this.timer > 0.55) this.state = 'DEAD';
        break;

      case 'DEAD': break;
    }
  }

  // ── SLOW (spider web) ────────────────────────────────────────
  _slow(dt, onEffect, audio) {
    switch (this.state) {
      case 'IDLE':
        if (this._dist < 0.52) {
          this.state = 'TRIGGERED'; this.timer = 0;
          const dur    = 3.5 + this.dc.dm * 0.55;
          const factor = this.dc.slowFactor;
          onEffect?.('slow', factor, dur);
          audio?.playTrapWarn(410);
        }
        break;

      case 'TRIGGERED':
        this.webPct = 0;
        if (this.timer > 7) { this.state = 'REFORMING'; this.timer = 0; }
        break;

      case 'REFORMING':
        this.webPct = Math.min(1, this.timer / 3);
        if (this.timer > 3) { this.state = 'IDLE'; this.timer = 0; }
        break;
    }
  }

  // ── POISON (gas vent) ────────────────────────────────────────
  _poison(dt, onEffect, audio) {
    // Always active; radius grows slightly with difficulty
    const radius = 0.55 + this.dc.dm * 0.025;
    this.gasPhase += dt * 2.1;
    this.state = 'IDLE';

    if (this._dist < radius) {
      // Call each frame with short duration → continuously refreshed while in range
      onEffect?.('poison', this.dc.poisonRate, 0.35);

      if (this.timer - this._lastSound > 1.6) {
        this._lastSound = this.timer;
        audio?.playTrapWarn(175);
      }
    }
  }

  // ── SPIKE ────────────────────────────────────────────────────
  _spike(dt, onKill, audio) {
    const { spikePeriod, spikeWarn } = this.dc;
    // Phase-shifted cycle so all spikes don't fire simultaneously
    const cycleLen = spikePeriod;
    const warnFrac = spikeWarn / cycleLen;

    switch (this.state) {
      case 'IDLE': {
        // Use elapsed time + phase offset to trigger
        const phase = (this.timer + (this.spikePhase / TAU) * cycleLen) % cycleLen;
        if (phase > cycleLen * (1 - warnFrac)) {
          this.state = 'WARNING'; this.timer = 0;
          audio?.playTrapWarn(360);
        }
        break;
      }
      case 'WARNING':
        this.spikePct = Math.min(1, this.timer / spikeWarn);
        if (this.spikePct >= 1) { this.state = 'EXTENDED'; this.timer = 0; }
        break;

      case 'EXTENDED':
        if (this._dist < Trap.KILL_R + 0.06) onKill();
        if (this.timer > 0.65) { this.state = 'RETRACTING'; this.timer = 0; }
        break;

      case 'RETRACTING':
        this.spikePct = Math.max(0, 1 - this.timer / 0.5);
        if (this.timer > 0.5) { this.state = 'IDLE'; this.timer = 0; }
        break;
    }
  }

  // ── FREEZE (ice crystal) ─────────────────────────────────────
  _freeze(dt, onEffect, audio) {
    this.crystalSpin += dt * 1.3;

    switch (this.state) {
      case 'IDLE':
        if (this._dist < 0.44) {
          this.state = 'TRIGGERED'; this.timer = 0;
          this.crystalPct = 0;
          onEffect?.('freeze', 1, this.dc.freezeDur);
          audio?.playTrapWarn(620);
        }
        break;

      case 'TRIGGERED':
        // Shattered — regrow after delay
        if (this.timer > 11 + this.dc.dm * 0.5) { this.state = 'REGROWING'; this.timer = 0; }
        break;

      case 'REGROWING':
        this.crystalPct = Math.min(1, this.timer / 4);
        if (this.timer > 4) { this.state = 'IDLE'; this.timer = 0; }
        break;
    }
  }

  get dist() { return this._dist; }
}

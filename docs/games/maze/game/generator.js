/**
 * THE LABYRINTH — game/generator.js
 * Maze generation with guaranteed-avoidable trap placement.
 */
import { KeyItem, Checkpoint, Door, Exit, Portal, Trap } from './entities.js';

const DOOR_PALETTE = [
  '#e05252','#e07b52','#e0c052','#5be052','#52b8e0',
  '#9052e0','#e052bf','#52e0a8','#e0e052','#5278e0'
];

export class MazeGenerator {
  /**
   * @param {number} sizeM   maze size in "square meters" 1..3
   * @param {string} diffKey difficulty key
   * @param {string} shape   wall shape: 'square'|'hexagon'|'triangle'
   * @returns {{ maze, gridW, gridH, player: {x,y}, keys, checkpoints, doors, portals, traps, exit }}
   */
  generate(sizeM, diffKey, shape) {
    const DIFF = { noob:1, easy:2, medium:3, hard:4, insane:5, crazy:6, stupid_hard:7, impossible:8, '???':10 };
    const dm   = DIFF[diffKey] || 1;

    const base = Math.floor(22 * sizeM);
    const gridW = base * 2 + 1;
    const gridH = base * 2 + 1;

    const maze = this._allocMaze(gridW, gridH);

    // Section grid
    const secX = Math.max(2, Math.floor(sizeM * 2 + 0.5));
    const secY = Math.max(2, Math.floor(sizeM * 2 + 0.5));
    let secW = Math.floor((gridW - 1) / secX);
    let secH = Math.floor((gridH - 1) / secY);
    if (secW % 2 !== 0) secW--;
    if (secH % 2 !== 0) secH--;

    for (let sy = 0; sy < secY; sy++)
      for (let sx = 0; sx < secX; sx++)
        this._carveSection(maze, sx * secW + 1, sy * secH + 1, secW - 1, secH - 1, gridW, gridH);

    // Build spanning tree of sections → doors
    const { doors, keys } = this._buildDoorTree(maze, secX, secY, secW, secH, dm);

    // Player start (top-left corner of maze)
    const startX = 1.5, startY = 1.5;

    // Checkpoints
    const checkpoints = this._placeCheckpoints(maze, gridW, gridH, sizeM, startX, startY);

    // Exit (bottom-right section)
    const exitX = (secX - 1) * secW + 1;
    const exitY = (secY - 1) * secH + 1;
    maze[exitY][exitX] = 0;
    const exit = new Exit(exitX, exitY);

    // Portals
    const portals = this._placePortals(maze, gridW, gridH, dm, startX, startY, exitX, exitY);

    // Traps — placed ONLY in cells with 2+ open neighbors (never dead-ends)
    const occupied = this._buildOccupied(startX, startY, exitX, exitY, checkpoints, keys, portals, doors);
    const traps = this._placeTraps(maze, gridW, gridH, dm, sizeM, occupied, startX, startY);

    return { maze, gridW, gridH, startX, startY, keys, checkpoints, doors, portals, traps, exit };
  }

  // ─── Internals ──────────────────────────────────────────────

  _allocMaze(w, h) {
    return Array.from({ length: h }, () => new Uint8Array(w).fill(1));
  }

  _carveSection(maze, sx, sy, w, h, gridW, gridH) {
    const inBounds = (x, y) => x >= sx && x < sx + w && y >= sy && y < sy + h;
    const stack = [{ x: sx, y: sy }];
    maze[sy][sx] = 0;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const dirs = [
        { dx: 0, dy: -2 }, { dx: 0, dy: 2 },
        { dx: -2, dy: 0 }, { dx: 2, dy: 0 }
      ].sort(() => Math.random() - 0.5);
      let moved = false;
      for (const d of dirs) {
        const nx = cur.x + d.dx, ny = cur.y + d.dy;
        if (inBounds(nx, ny) && maze[ny][nx] === 1) {
          maze[cur.y + d.dy / 2][cur.x + d.dx / 2] = 0;
          maze[ny][nx] = 0;
          stack.push({ x: nx, y: ny });
          moved = true; break;
        }
      }
      if (!moved) stack.pop();
    }
  }

  _buildDoorTree(maze, secX, secY, secW, secH, dm) {
    // Union-find
    const uf = Array.from({ length: secX * secY }, (_, i) => i);
    const find = i => { while (uf[i] !== i) i = uf[i]; return i; };
    const union = (a, b) => { uf[find(b)] = find(a); };

    // All possible edges
    const edges = [];
    for (let sy = 0; sy < secY; sy++)
      for (let sx = 0; sx < secX; sx++) {
        if (sx < secX - 1) edges.push({ s1: sy * secX + sx, s2: sy * secX + sx + 1, dir: 'E', sx1: sx, sy1: sy });
        if (sy < secY - 1) edges.push({ s1: sy * secX + sx, s2: (sy + 1) * secX + sx, dir: 'S', sx1: sx, sy1: sy });
      }
    edges.sort(() => Math.random() - 0.5);

    const doors = [], keys = [];
    let colorIdx = 0;

    for (const e of edges) {
      if (find(e.s1) === find(e.s2)) continue;
      union(e.s1, e.s2);

      // Carve door cell
      let doorX, doorY;
      if (e.dir === 'E') {
        doorX = (e.sx1 + 1) * secW;
        doorY = e.sy1 * secH + 1 + Math.floor(Math.random() * ((secH - 1) / 2)) * 2;
      } else {
        doorY = (e.sy1 + 1) * secH;
        doorX = e.sx1 * secW + 1 + Math.floor(Math.random() * ((secW - 1) / 2)) * 2;
      }
      maze[doorY][doorX] = 0;

      const reqKeys = Math.min(10, Math.floor(1 + Math.random() * dm));
      const color   = DOOR_PALETTE[colorIdx % DOOR_PALETTE.length];
      const door    = new Door(doorX, doorY, color, reqKeys);
      doors.push(door);

      // Scatter keys in source section
      for (let k = 0; k < reqKeys; k++) {
        let kx, ky, att = 0;
        do {
          kx = e.sx1 * secW + 1 + Math.floor(Math.random() * ((secW - 1) / 2)) * 2;
          ky = e.sy1 * secH + 1 + Math.floor(Math.random() * ((secH - 1) / 2)) * 2;
          att++;
        } while (maze[ky]?.[kx] !== 0 && att < 60);
        keys.push(new KeyItem(kx, ky, color, `k_${colorIdx}_${k}`));
      }
      colorIdx++;
    }

    return { doors, keys };
  }

  _placeCheckpoints(maze, gridW, gridH, sizeM, sx, sy) {
    const count = Math.max(3, Math.floor(sizeM * 5));
    const cps = [];
    let att = 0;
    while (cps.length < count && att < 3000) {
      att++;
      const x = 1 + Math.floor(Math.random() * ((gridW - 2) / 2)) * 2;
      const y = 1 + Math.floor(Math.random() * ((gridH - 2) / 2)) * 2;
      if (maze[y]?.[x] !== 0) continue;
      if (this._dist(x, y, sx, sy) < 4) continue;
      if (cps.some(c => this._dist(c.x, c.y, x, y) < 7)) continue;
      cps.push(new Checkpoint(x, y));
    }
    return cps;
  }

  _placePortals(maze, gridW, gridH, dm, sx, sy, ex, ey) {
    const count = Math.floor(dm / 2);
    const portals = [];
    let id = 0;
    for (let i = 0; i < count; i++) {
      const p1 = this._findOpenCell(maze, gridW, gridH, sx, sy, 3);
      const p2 = this._findOpenCell(maze, gridW, gridH, sx, sy, 3, p1);
      if (!p1 || !p2) continue;
      const pa = new Portal(p1.x, p1.y, id + 1);
      const pb = new Portal(p2.x, p2.y, id);
      pa.id = id; pb.id = id + 1;
      portals.push(pa, pb);
      id += 2;
    }
    return portals;
  }

  _placeTraps(maze, gridW, gridH, dm, sizeM, occupied, sx, sy) {
    const count  = Math.floor(sizeM * dm * 3.5);
    const traps  = [];
    const MIN_D  = 3.5; // min distance from start
    
    // Base times minus 0.1s per difficulty level (min cap to prevent instant)
    const timeScale = Math.max(0, (dm - 1) * 0.1);
    
    const dc = {
      dm: dm,
      pitWarn: Math.max(0.3, 1.2 - timeScale),
      pitReset: Math.max(0.5, 3.5 - timeScale),
      mineArm: Math.max(0.2, 0.9 - timeScale),
      slowFactor: Math.max(0.1, 0.4 - dm * 0.03), // Gets slower at higher diff
      poisonRate: Math.max(5, 5 + dm * 2), // More dps
      spikeWarn: Math.max(0.2, 0.8 - timeScale),
      spikePeriod: Math.max(1.0, 3.0 - timeScale),
      freezeDur: Math.max(0.5, 1.5 + dm * 0.15), // Longer freeze
    };

    let att = 0;
    while (traps.length < count && att < 12000) {
      att++;
      const x = 1 + Math.floor(Math.random() * ((gridW - 2) / 2)) * 2;
      const y = 1 + Math.floor(Math.random() * ((gridH - 2) / 2)) * 2;
      const key = `${x},${y}`;

      if (maze[y]?.[x] !== 0) continue;
      if (occupied.has(key)) continue;
      if (this._dist(x, y, sx, sy) < MIN_D) continue;

      // ── CRITICAL: Only place in cells with 2+ open neighbors ──
      // This guarantees the player can back out during the warning phase
      const openN = [{ dx:0,dy:-1 },{ dx:0,dy:1 },{ dx:-1,dy:0 },{ dx:1,dy:0 }]
        .filter(d => maze[y + d.dy]?.[x + d.dx] === 0).length;
      if (openN < 2) continue; // Skip dead-ends — player would be stuck!

      const trapTypes = ['PIT', 'MINE', 'SLOW', 'POISON', 'SPIKE', 'FREEZE'];
      const type = trapTypes[Math.floor(Math.random() * trapTypes.length)];
      traps.push(new Trap(x, y, type, dc));
      occupied.add(key);
    }
    return traps;
  }

  _buildOccupied(sx, sy, ex, ey, checkpoints, keys, portals, doors) {
    const set = new Set();
    set.add(`${Math.floor(sx)},${Math.floor(sy)}`);
    set.add(`${ex},${ey}`);
    checkpoints.forEach(c => set.add(`${c.x},${c.y}`));
    keys.forEach(k => set.add(`${k.x},${k.y}`));
    portals.forEach(p => set.add(`${p.x},${p.y}`));
    doors.forEach(d => set.add(`${d.x},${d.y}`));
    return set;
  }

  _findOpenCell(maze, gridW, gridH, avoidX, avoidY, minDist, avoid2 = null) {
    for (let i = 0; i < 500; i++) {
      const x = 1 + Math.floor(Math.random() * ((gridW - 2) / 2)) * 2;
      const y = 1 + Math.floor(Math.random() * ((gridH - 2) / 2)) * 2;
      if (maze[y]?.[x] !== 0) continue;
      if (this._dist(x, y, avoidX, avoidY) < minDist) continue;
      if (avoid2 && this._dist(x, y, avoid2.x, avoid2.y) < 5) continue;
      return { x, y };
    }
    return null;
  }

  _dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

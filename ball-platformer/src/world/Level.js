import { Wall } from './Wall.js';

/** Character -> wall type (or special marker) used by Level.fromAscii. */
export const DEFAULT_LEGEND = {
  '#': 'solid',
  '~': 'ice',
  'B': 'bouncy',
  '-': 'oneway',
  '^': 'hazard',
  'P': 'spawn',
};

/**
 * Level data: walls, spawn point and pixel bounds.
 * fromAscii merges runs of identical tiles into larger rectangles (horizontally,
 * then vertically) so the ball never rolls across internal tile seams.
 */
export class Level {
  constructor({ walls = [], spawn = { x: 0, y: 0 }, width = 0, height = 0, name = 'level' } = {}) {
    this.walls = walls;
    this.spawn = spawn;
    this.width = width;
    this.height = height;
    this.name = name;
  }

  static fromAscii(rows, { tileSize = 32, legend = DEFAULT_LEGEND, name = 'level' } = {}) {
    if (typeof rows === 'string') rows = rows.replace(/^\n+|\n+$/g, '').split('\n');
    const cols = Math.max(...rows.map((r) => r.length));
    const tiles = rows.map((r) => r.padEnd(cols, ' '));
    const spawn = { x: tileSize, y: tileSize };
    const walls = [];

    // Horizontal runs per row.
    let open = new Map(); // key "x:w:type" -> wall from the previous row
    for (let ry = 0; ry < tiles.length; ry++) {
      const row = tiles[ry];
      const next = new Map();
      let cx = 0;
      while (cx < cols) {
        const ch = row[cx];
        const type = legend[ch];
        if (ch === ' ' || type === undefined) { cx++; continue; }
        if (type === 'spawn') {
          spawn.x = (cx + 0.5) * tileSize;
          spawn.y = (ry + 0.5) * tileSize;
          cx++; continue;
        }
        let run = 1;
        while (cx + run < cols && row[cx + run] === ch) run++;
        const key = `${cx}:${run}:${type}`;
        const above = open.get(key);
        if (above && !above.oneWay) {
          above.h += tileSize;          // extend vertically
          next.set(key, above);
        } else {
          const w = new Wall(cx * tileSize, ry * tileSize, run * tileSize, tileSize, type);
          walls.push(w);
          next.set(key, w);
        }
        cx += run;
      }
      open = next;
    }

    return new Level({ walls, spawn, width: cols * tileSize, height: tiles.length * tileSize, name });
  }
}

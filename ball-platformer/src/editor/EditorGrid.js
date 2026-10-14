import { DEFAULT_LEGEND } from '../world/Level.js';

/** Mutable ASCII tile grid backing the level editor. Mirrors the format Level.fromAscii reads. */
export class EditorGrid {
  constructor(cols, rows, fill = ' ') {
    this.cols = cols;
    this.rows = rows;
    this.cells = Array.from({ length: rows }, () => new Array(cols).fill(fill));
  }

  get(x, y) {
    return y >= 0 && y < this.rows && x >= 0 && x < this.cols ? this.cells[y][x] : null;
  }

  set(x, y, ch) {
    if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) return;
    if (ch === 'P') {
      for (let ry = 0; ry < this.rows; ry++) for (let rx = 0; rx < this.cols; rx++) {
        if (this.cells[ry][rx] === 'P') this.cells[ry][rx] = ' ';
      }
    }
    this.cells[y][x] = ch;
  }

  resize(cols, rows) {
    const next = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => (this.cells[y] && this.cells[y][x]) || ' '));
    this.cols = cols;
    this.rows = rows;
    this.cells = next;
  }

  clone() {
    const g = new EditorGrid(this.cols, this.rows);
    g.cells = this.cells.map((r) => r.slice());
    return g;
  }

  toAscii() {
    return this.cells.map((r) => r.join('').replace(/\s+$/, '')).join('\n');
  }

  static fromAscii(text) {
    const lines = text.replace(/^\n+|\n+$/g, '').split('\n');
    const cols = Math.max(1, ...lines.map((l) => l.length));
    const grid = new EditorGrid(cols, lines.length);
    lines.forEach((l, y) => { for (let x = 0; x < cols; x++) grid.cells[y][x] = l[x] || ' '; });
    return grid;
  }

  /** A blank rectangle bordered with solid walls and a spawn near the top-left. */
  static blank(cols, rows) {
    const grid = new EditorGrid(cols, rows);
    for (let x = 0; x < cols; x++) { grid.set(x, 0, '#'); grid.set(x, rows - 1, '#'); }
    for (let y = 0; y < rows; y++) { grid.set(0, y, '#'); grid.set(cols - 1, y, '#'); }
    if (cols > 2 && rows > 2) grid.set(1, 1, 'P');
    return grid;
  }
}

export const EDITOR_LEGEND = DEFAULT_LEGEND;

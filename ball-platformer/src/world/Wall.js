import { WallTypes } from './WallTypes.js';

let nextId = 1;

/** A static axis-aligned rectangle. Surface behaviour comes from its type. */
export class Wall {
  constructor(x, y, w, h, type = 'solid', data = {}) {
    const def = typeof type === 'string' ? WallTypes[type] : type;
    if (!def) throw new Error(`Unknown wall type: ${type}`);
    this.id = nextId++;
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.type = def.name;
    this.color = def.color;
    this.edge = def.edge;
    this.friction = def.friction;
    this.bounce = def.bounce;
    this.oneWay = !!def.oneWay;
    this.hazard = !!def.hazard;
    this.draw = def.draw || null;
    this.data = data; // free slot for game-specific customisation
  }

  get right() { return this.x + this.w; }
  get bottom() { return this.y + this.h; }
  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }
}

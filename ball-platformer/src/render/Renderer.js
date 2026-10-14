import { aabbOverlap } from '../physics/Collision.js';

/** Draws the level. Walls with a type-level draw() override use it; others get the default look. */
export class Renderer {
  constructor(cfg, tileSize) {
    this.cfg = cfg;
    this.tileSize = tileSize;
    this._cornerCache = new WeakMap(); // walls array -> Map<wall.id, [tl,tr,br,bl]>
  }

  clear(ctx, view) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = this.cfg.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawGrid(ctx, rect) {
    const t = this.tileSize;
    ctx.strokeStyle = this.cfg.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.floor(rect.x / t) * t; x <= rect.x + rect.w; x += t) { ctx.moveTo(x, rect.y); ctx.lineTo(x, rect.y + rect.h); }
    for (let y = Math.floor(rect.y / t) * t; y <= rect.y + rect.h; y += t) { ctx.moveTo(rect.x, y); ctx.lineTo(rect.x + rect.w, y); }
    ctx.stroke();
  }

  drawWalls(ctx, walls, rect) {
    const corners = this._getCorners(walls);
    for (const w of walls) {
      if (!aabbOverlap(w, rect)) continue;
      if (w.draw) { w.draw(ctx, w); continue; }
      const radii = corners.get(w.id);
      if (w.hazard) this._drawHazard(ctx, w);
      else if (w.oneWay) this._drawOneWay(ctx, w, radii);
      else this._drawBlock(ctx, w, radii);
    }
  }

  /** Per-wall [tl,tr,br,bl] radii: a corner rounds only if no other wall is flush against
   *  either edge meeting there, so merged/adjacent geometry keeps a seamless interior joint. */
  _getCorners(walls) {
    let cache = this._cornerCache.get(walls);
    if (cache) return cache;
    const r = this.cfg.cornerRadius;
    cache = new Map();
    for (const w of walls) {
      if (w.hazard) continue;
      const cr = Math.min(r, w.w / 2, w.h / 2);
      const touches = (a, b) => a < b + 0.01 && a > b - 0.01;
      let top = false, bottom = false, left = false, right = false;
      for (const o of walls) {
        if (o === w || o.hazard) continue;
        const xOverlap = o.x < w.right && o.right > w.x;
        const yOverlap = o.y < w.bottom && o.bottom > w.y;
        if (xOverlap && touches(o.bottom, w.y)) top = true;
        if (xOverlap && touches(o.y, w.bottom)) bottom = true;
        if (yOverlap && touches(o.right, w.x)) left = true;
        if (yOverlap && touches(o.x, w.right)) right = true;
      }
      cache.set(w.id, [
        top || left ? 0 : cr,
        top || right ? 0 : cr,
        bottom || right ? 0 : cr,
        bottom || left ? 0 : cr,
      ]);
    }
    this._cornerCache.set(walls, cache);
    return cache;
  }

  _drawBlock(ctx, w, radii) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(w.x, w.y, w.w, w.h, radii);
    ctx.clip();

    ctx.fillStyle = w.color;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = w.edge;
    ctx.fillRect(w.x, w.y, w.w, 3);
    if (w.type === 'ice') {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = w.x + 8; x < w.x + w.w; x += 16) { ctx.moveTo(x, w.y + 6); ctx.lineTo(x + 6, w.y + w.h - 6); }
      ctx.stroke();
    } else if (w.type === 'bouncy') {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = w.x; x < w.x + w.w; x += 8) { ctx.moveTo(x, w.y + 10); ctx.lineTo(x + 4, w.y + 6); ctx.lineTo(x + 8, w.y + 10); }
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawOneWay(ctx, w, radii) {
    const h = 6;
    const barRadii = radii.map((v) => Math.min(v, h / 2));
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(w.x, w.y, w.w, h, barRadii);
    ctx.clip();
    ctx.fillStyle = w.color;
    ctx.fillRect(w.x, w.y, w.w, h);
    ctx.fillStyle = w.edge;
    ctx.fillRect(w.x, w.y, w.w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let x = w.x + 4; x < w.x + w.w; x += 16) ctx.fillRect(x, w.y + 6, 4, 4);
    ctx.restore();
  }

  _drawHazard(ctx, w) {
    ctx.fillStyle = w.color;
    const s = 16;
    ctx.beginPath();
    for (let x = w.x; x < w.x + w.w; x += s) {
      ctx.moveTo(x, w.y + w.h);
      ctx.lineTo(x + s / 2, w.y + w.h - Math.min(w.h, s));
      ctx.lineTo(x + s, w.y + w.h);
    }
    ctx.closePath();
    ctx.fill();
  }
}

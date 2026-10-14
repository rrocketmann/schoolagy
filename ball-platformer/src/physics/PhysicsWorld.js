import { circleVsAABB } from './Collision.js';
import { SpatialHash } from './SpatialHash.js';
import { clamp } from '../math/MathUtil.js';

/**
 * Static-wall world for circle bodies.
 *
 * Step outline (per body):
 *  1. Pre-solve: sense walls within `skin`, cancel velocity into them (this is what
 *     makes resting contact drift-free: no penetration happens in the first place).
 *  2. Integrate in substeps small enough that the body can't tunnel, resolving
 *     overlaps after each substep (push out along the contact normal, cancel/bounce
 *     the normal velocity, corner-correct ceiling clips, keep landings from flinging
 *     the body sideways).
 *  3. Sense again and classify contacts into ground / ceiling / left / right.
 */
export class PhysicsWorld {
  constructor(config) {
    this.cfg = config;
    this.walls = [];
    this.hash = new SpatialHash(64);
    this._hit = { nx: 0, ny: 0, depth: 0, corner: false };
    this._query = [];
  }

  addWall(wall) { this.walls.push(wall); this.hash.insert(wall); return wall; }
  removeWall(wall) {
    const i = this.walls.indexOf(wall);
    if (i >= 0) { this.walls.splice(i, 1); this.hash.remove(wall); }
  }
  clear() { this.walls.length = 0; this.hash.clear(); }

  step(body, dt) {
    const p = this.cfg;
    body.prevPos.copy(body.pos);
    body.touched.clear();
    body.hazard = null;
    body.bounced = null;
    if (body.dropThrough > 0) body.dropThrough -= dt;

    // 1. Pre-solve velocity constraint against sensed contacts.
    this._sense(body);
    for (const c of body.senseContacts) this._impulse(body, c.wall, c.nx, c.ny);

    // 2. Integrate with substeps small enough to rule out tunneling. If a body is somehow
    //    moving faster than the substep budget can cover, clamp its speed rather than tunnel.
    const maxStep = body.radius * p.maxSubstepMove;
    let dist = body.vel.len() * dt;
    const maxDist = maxStep * p.maxSubsteps;
    if (dist > maxDist) { body.vel.scale(maxDist / dist); dist = maxDist; }
    const n = clamp(Math.ceil(dist / maxStep), 1, p.maxSubsteps);
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const fromY = body.pos.y;
      body.pos.addScaled(body.vel, h);
      this._resolve(body, fromY);
    }

    // 3. Final sensing and classification.
    this._sense(body);
    this._classify(body);
  }

  /** Whether `wall` is solid for `body` given where the body's center was before moving. */
  shouldCollide(body, wall, fromY) {
    if (wall.oneWay) {
      if (body.dropThrough > 0) return false;
      if (body.vel.y < 0) return false;
      if (fromY + body.radius > wall.y + this.cfg.oneWayTolerance) return false;
    }
    return true;
  }

  _sense(body) {
    const r = body.radius + this.cfg.skin;
    const pos = body.pos;
    const hit = this._hit;
    const list = this.hash.query(pos.x - r, pos.y - r, r * 2, r * 2, this._query);
    body.senseContacts.length = 0;
    for (const w of list) {
      if (!this.shouldCollide(body, w, pos.y)) continue;
      if (!circleVsAABB(pos.x, pos.y, r, w, hit)) continue;
      body.senseContacts.push({ wall: w, nx: hit.nx, ny: hit.ny, depth: hit.depth - this.cfg.skin });
      body.touched.add(w);
      if (w.hazard && !body.hazard) body.hazard = w;
    }
  }

  _resolve(body, fromY) {
    const p = this.cfg;
    const r = body.radius;
    const pos = body.pos, vel = body.vel;
    const hit = this._hit;
    const list = this.hash.query(pos.x - r - 2, pos.y - r - 2, r * 2 + 4, r * 2 + 4, this._query);

    for (let iter = 0; iter < p.solverIterations; iter++) {
      let any = false;
      for (const w of list) {
        if (!this.shouldCollide(body, w, fromY)) continue;
        if (!circleVsAABB(pos.x, pos.y, r, w, hit)) continue;
        if (hit.depth <= 0) continue;
        any = true;
        body.touched.add(w);
        if (w.hazard && !body.hazard) body.hazard = w;

        // Clipping the underside corner of a block while rising: nudge sideways instead of stopping.
        if (hit.ny > 0.2 && vel.y < 0 && this._cornerCorrect(body, w)) continue;

        pos.x += hit.nx * hit.depth;
        pos.y += hit.ny * hit.depth;

        const preVx = vel.x;
        this._impulse(body, w, hit.nx, hit.ny);

        // Landing grip: a ground-class contact must not convert fall speed into sideways speed.
        if (hit.ny <= p.groundNormalY && Math.abs(vel.x) > Math.abs(preVx)) vel.x = preVx;
      }
      if (!any) break;
    }
  }

  _cornerCorrect(body, w) {
    const cc = this.cfg.cornerCorrection;
    const pos = body.pos, r = body.radius;
    const overlapL = pos.x + r - w.x;          // how far the ball reaches past the wall's left edge
    const overlapR = w.x + w.w - (pos.x - r);  // ...past its right edge
    if (overlapL <= cc && overlapL <= overlapR) { pos.x -= overlapL + 0.01; return true; }
    if (overlapR <= cc) { pos.x += overlapR + 0.01; return true; }
    return false;
  }

  /** Remove (or reflect, for bouncy walls) the velocity component moving into the surface. */
  _impulse(body, w, nx, ny) {
    const vel = body.vel;
    const vn = vel.x * nx + vel.y * ny;
    if (vn >= 0) return false;
    const bounce = w.bounce || 0;
    const j = bounce > 0 && -vn > this.cfg.minBounceSpeed ? 1 + bounce : 1;
    vel.x -= nx * vn * j;
    vel.y -= ny * vn * j;
    if (j > 1) body.bounced = { wall: w, nx, ny, speed: -vn };
    return true;
  }

  _classify(body) {
    const p = this.cfg;
    const c = body.contacts;
    c.ground = c.ceiling = c.left = c.right = null;
    for (const s of body.senseContacts) {
      if (s.ny <= p.groundNormalY) {
        if (!c.ground || s.ny < c.ground.ny) c.ground = s;
      } else if (s.ny >= p.ceilingNormalY) {
        if (!c.ceiling || s.ny > c.ceiling.ny) c.ceiling = s;
      } else if (s.nx >= p.wallNormalX) {
        if (!c.left || s.nx > c.left.nx) c.left = s;   // normal points right => wall is on the left
      } else if (s.nx <= -p.wallNormalX) {
        if (!c.right || s.nx < c.right.nx) c.right = s;
      }
    }
  }
}

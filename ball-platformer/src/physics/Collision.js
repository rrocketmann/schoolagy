/**
 * Circle vs axis-aligned box overlap test.
 * `box` is {x, y, w, h} with x/y the top-left corner.
 * On overlap, fills `out` with the contact normal (pointing from the box toward the
 * circle center), the penetration depth along that normal, and whether the closest
 * feature was a box corner. Returns true on overlap (touching counts, depth 0).
 */
export function circleVsAABB(cx, cy, r, box, out) {
  const right = box.x + box.w;
  const bottom = box.y + box.h;
  const qx = cx < box.x ? box.x : cx > right ? right : cx;
  const qy = cy < box.y ? box.y : cy > bottom ? bottom : cy;
  const dx = cx - qx;
  const dy = cy - qy;
  const d2 = dx * dx + dy * dy;
  if (d2 > r * r) return false;

  if (d2 > 1e-10) {
    const d = Math.sqrt(d2);
    out.nx = dx / d;
    out.ny = dy / d;
    out.depth = r - d;
    out.corner = qx !== cx && qy !== cy;
    return true;
  }

  // Center is inside the box: push out along the axis of least penetration.
  const dl = cx - box.x, dr = right - cx, dt = cy - box.y, db = bottom - cy;
  let m = dl; out.nx = -1; out.ny = 0;
  if (dr < m) { m = dr; out.nx = 1; out.ny = 0; }
  if (dt < m) { m = dt; out.nx = 0; out.ny = -1; }
  if (db < m) { m = db; out.nx = 0; out.ny = 1; }
  out.depth = m + r;
  out.corner = false;
  return true;
}

export function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

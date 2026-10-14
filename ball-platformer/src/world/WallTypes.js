/**
 * Registry of wall/surface types. A Wall copies these properties at construction,
 * so add new types here (or via registerWallType) and reference them by name in
 * level legends. Optional `draw(ctx, wall)` overrides the default rendering.
 */
export const WallTypes = {
  solid:  { name: 'solid',  color: '#4c566a', edge: '#6e7b94', friction: 1,    bounce: 0 },
  ice:    { name: 'ice',    color: '#8fbcbb', edge: '#d0ecea', friction: 0.12, bounce: 0 },
  bouncy: { name: 'bouncy', color: '#b48ead', edge: '#e2c3d8', friction: 1,    bounce: 0.9 },
  oneway: { name: 'oneway', color: '#a3be8c', edge: '#c9e0b4', friction: 1,    bounce: 0, oneWay: true },
  hazard: { name: 'hazard', color: '#bf616a', edge: '#e7949b', friction: 1,    bounce: 0, hazard: true },
};

export function registerWallType(name, def) {
  WallTypes[name] = { name, color: '#888', edge: '#aaa', friction: 1, bounce: 0, ...def };
  return WallTypes[name];
}

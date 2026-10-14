# Ball Platformer Engine

A modular 2D side-scrolling platformer engine. The player is a ball; the world is
axis-aligned rectangles with per-type surface behaviour.

## Run

ES modules need an HTTP server:

```
python3 -m http.server 8080
# open http://localhost:8080
```

Controls: arrows / WASD to move, Space / Z / W / Up to jump, Down + jump to drop through
one-way platforms, R to respawn, backtick (or F3) to toggle the debug overlay.

Open `editor.html` (same server) for the level editor: paint tiles, resize the grid,
load/import/export levels, and playtest in-place using the real engine.

## Mechanics

- Run with acceleration/deceleration, turn boost, per-surface friction (ice).
- Jump with variable height (release early), coyote time, jump buffering, apex hang,
  faster fall gravity, fall-speed cap.
- Wall slide (hold toward a wall while falling) and wall jump, with wall coyote time
  and a short input lock after the jump so you don't slide straight back.
- One-way platforms (drop through), bouncy surfaces, hazards (respawn).
- Rolling ball visuals with landing squash; render interpolation on a fixed 120 Hz step.

## Layout

```
src/config.js                all tunables
src/core/Engine.js           fixed-timestep loop, interpolation alpha, resize
src/core/Input.js            action bindings, per-step edge latching
src/core/EventBus.js         pub/sub used for player:jump, player:land, player:died ...
src/math/MathUtil.js         clamp/lerp/approach/damp + Vec2
src/physics/Collision.js     circle vs AABB
src/physics/SpatialHash.js   broadphase for walls
src/physics/CircleBody.js    dynamic circle + contact state
src/physics/PhysicsWorld.js  substepped integration, overlap resolution, contact classification
src/player/PlatformerMotor.js  input + contacts -> velocity (no rendering, no collision)
src/player/Ball.js           body + motor + rolling visuals
src/world/WallTypes.js       registry of surface types
src/world/Wall.js            static rectangle
src/world/Level.js           ASCII level parser with tile merging
src/render/Camera.js         smooth follow, bounds clamp
src/render/Renderer.js       walls/grid drawing
src/render/DebugOverlay.js   diagnostics
src/scenes/GameScene.js      composes everything
src/levels/level1.js         sample level
src/editor/EditorGrid.js     mutable ASCII grid model backing the level editor
src/editor/main.js           editor UI: paint/pan/zoom, undo, import/export, playtest
editor.html                  level editor page
test/physics.test.js         node tests: `node test/physics.test.js`
```

## Extending

- **New surface type**: `registerWallType('mud', { color: '#654', friction: 0.4 })` in
  `src/world/WallTypes.js` (or anywhere before levels are built), then add a legend
  character in `Level.DEFAULT_LEGEND` or pass a custom `legend` to `Level.fromAscii`.
  Give the type a `draw(ctx, wall)` to customise its look.
- **Feel**: edit `CONFIG.player` / `CONFIG.physics`. Everything is in px, px/s, px/s², s.
- **Other controllers**: `PlatformerMotor.update(dt, command)` takes a plain
  `{moveX, down, jumpPressed, jumpHeld}` object, so AI or replay input plugs in without
  touching the motor.
- **Events**: `scene.events.on('player:land', ({speed}) => ...)` for sound/particles.

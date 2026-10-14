import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { Ball } from '../player/Ball.js';
import { Camera } from '../render/Camera.js';
import { Renderer } from '../render/Renderer.js';
import { DebugOverlay } from '../render/DebugOverlay.js';
import { EventBus } from '../core/EventBus.js';

/** Wires level + physics + player + camera together. */
export class GameScene {
  constructor({ input, level, config }) {
    this.input = input;
    this.config = config;
    this.events = new EventBus();
    this.world = new PhysicsWorld(config.physics);
    this.renderer = new Renderer(config.render, config.tileSize);
    this.camera = new Camera(config.camera);
    this.debug = new DebugOverlay();
    this.debug.enabled = !!config.debug.enabled;
    this.ball = new Ball({ x: 0, y: 0, params: config.player, render: config.render, events: this.events });
    this.deaths = 0;
    this.engine = null;
    this.loadLevel(level);
  }

  enter(engine) {
    this.engine = engine;
    this.camera.setView(engine.view.width, engine.view.height);
    this.camera.snapTo(this.ball.pos.x, this.ball.pos.y);
  }

  loadLevel(level) {
    this.level = level;
    this.world.clear();
    for (const w of level.walls) this.world.addWall(w);
    this.camera.bounds = { x: 0, y: 0, w: level.width, h: level.height };
    this.respawn();
    this.events.emit('level:loaded', { level });
  }

  respawn() {
    this.ball.respawn(this.level.spawn.x, this.level.spawn.y);
    this.camera.snapTo(this.ball.pos.x, this.ball.pos.y);
    this.events.emit('player:respawn', { ball: this.ball });
  }

  kill(reason) {
    this.deaths++;
    this.events.emit('player:died', { ball: this.ball, reason });
    this.respawn();
  }

  update(dt) {
    const input = this.input;
    input.poll();
    if (input.justPressed('debug')) this.debug.enabled = !this.debug.enabled;
    if (input.justPressed('reset')) this.respawn();

    this.ball.update(dt, Ball.readInput(input), this.world);

    const b = this.ball.body;
    if (b.hazard) { this.kill('hazard'); return; }
    if (b.pos.y - b.radius > this.level.height + 100) { this.kill('fell'); return; }

    this.camera.follow(b.pos, b.vel, dt);
  }

  render(ctx, alpha, view) {
    if (this.camera.viewW !== view.width / this.camera.zoom || this.camera.viewH !== view.height / this.camera.zoom) {
      this.camera.setView(view.width, view.height);
    }
    this.renderer.clear(ctx, view);
    this.camera.applyTo(ctx, view.dpr, alpha);
    const rect = this.camera.visibleRect(alpha);
    this.renderer.drawGrid(ctx, rect);
    this.renderer.drawWalls(ctx, this.level.walls, rect);
    this.ball.render(ctx, alpha);
    this.debug.drawWorld(ctx, this.ball);
    this.debug.drawHud(ctx, view, { engine: this.engine, ball: this.ball, scene: this });
  }
}

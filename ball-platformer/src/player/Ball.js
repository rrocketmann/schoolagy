import { CircleBody } from '../physics/CircleBody.js';
import { PlatformerMotor, MotorState } from './PlatformerMotor.js';
import { lerp } from '../math/MathUtil.js';

/** The player: a circle body + platformer motor + rolling visuals. */
export class Ball {
  constructor({ x, y, params, render, events }) {
    this.params = params;
    this.renderCfg = render;
    this.events = events;
    this.body = new CircleBody({ x, y, radius: params.radius });
    this.motor = new PlatformerMotor(this.body, params, events);
    this.angle = 0;
    this.prevAngle = 0;
    this.angularVel = 0;
    this.squash = 0;     // 0..1 landing squash amount
    this.alive = true;
  }

  get pos() { return this.body.pos; }
  get vel() { return this.body.vel; }

  /** Read the shared Input into a plain command object (swap this for AI/replay/gamepad). */
  static readInput(input) {
    return {
      moveX: input.axis('left', 'right'),
      down: input.isDown('down'),
      jumpPressed: input.justPressed('jump'),
      jumpHeld: input.isDown('jump'),
    };
  }

  update(dt, command, world) {
    const b = this.body, p = this.params;
    this.motor.update(dt, command);
    world.step(b, dt);

    // Rolling: no-slip on ground, roll along walls, coast in the air.
    this.prevAngle = this.angle;
    if (this.motor.state === MotorState.GROUND) this.angularVel = b.vel.x / b.radius;
    else if (this.motor.state === MotorState.WALL_SLIDE) this.angularVel = (b.vel.y / b.radius) * -b.wallDir;
    else this.angularVel *= Math.exp(-p.spinDamping * dt);
    this.angle += this.angularVel * dt;

    if (this.motor.state === MotorState.GROUND && this.motor.prevState !== MotorState.GROUND) {
      this.squash = Math.min(1, this.motor.landedSpeed / p.maxFallSpeed);
    }
    this.squash *= Math.exp(-12 * dt);
  }

  respawn(x, y) {
    this.body.teleport(x, y);
    this.motor.reset();
    this.angle = this.prevAngle = 0;
    this.angularVel = 0;
    this.squash = 0;
    this.alive = true;
  }

  render(ctx, alpha) {
    const b = this.body, r = b.radius, rc = this.renderCfg;
    const x = lerp(b.prevPos.x, b.pos.x, alpha);
    const y = lerp(b.prevPos.y, b.pos.y, alpha);
    const angle = lerp(this.prevAngle, this.angle, alpha);
    const sq = this.squash * 0.25;

    ctx.save();
    ctx.translate(x, y);
    // squash: flatten vertically, widen horizontally, keep the bottom on the floor
    ctx.translate(0, r * sq);
    ctx.scale(1 + sq, 1 - sq);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = rc.ballColor;
    ctx.fill();

    ctx.fillStyle = rc.ballDark;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, 0, Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, Math.PI, Math.PI * 1.5); ctx.closePath(); ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = rc.ballOutline;
    ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // static highlight (not rotated)
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }
}

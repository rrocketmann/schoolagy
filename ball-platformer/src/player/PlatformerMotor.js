import { approach, sign } from '../math/MathUtil.js';

export const MotorState = Object.freeze({ GROUND: 'ground', AIR: 'air', WALL_SLIDE: 'wallslide' });

/**
 * Turns input + contact state into velocity changes on a CircleBody.
 * Knows nothing about rendering or collision resolution; PhysicsWorld.step runs after this.
 */
export class PlatformerMotor {
  constructor(body, params, events = null) {
    this.body = body;
    this.p = params;
    this.events = events;

    this.state = MotorState.AIR;
    this.prevState = MotorState.AIR;
    this.facing = 1;
    this.moveX = 0;

    // Timers (seconds, count down)
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.wallCoyote = 0;
    this.wallJumpLock = 0;
    this.airTime = 0;
    this.jumpTime = 0;      // time since last jump started
    this.lastWallDir = 0;   // -1 wall was on the left, +1 on the right
    this.jumping = false;   // rising from a jump (cut still possible)
    this.jumpCut = false;
    this.lastJumpKind = null;
    this.landedSpeed = 0;   // impact speed of the last landing (for effects)
  }

  /** @param {number} dt  @param {{moveX:number, down:boolean, jumpPressed:boolean, jumpHeld:boolean}} input */
  update(dt, input) {
    const p = this.p, b = this.body, v = b.vel, c = b.contacts;
    const moveX = this.moveX = sign(input.moveX);
    if (moveX !== 0) this.facing = moveX;

    // ---- Timers
    if (c.ground) this.coyote = p.coyoteTime; else this.coyote -= dt;
    if (c.left || c.right) {
      this.lastWallDir = b.wallDir;
      this.wallCoyote = p.wallCoyoteTime;
    } else this.wallCoyote -= dt;
    this.jumpBuffer = input.jumpPressed ? p.jumpBufferTime : this.jumpBuffer - dt;
    this.wallJumpLock -= dt;
    this.jumpTime += dt;
    if (c.ground) { if (v.y >= 0) this.jumping = false; } else this.airTime += dt;

    // ---- State
    this.prevState = this.state;
    if (c.ground) {
      this.state = MotorState.GROUND;
    } else {
      const pushing = !p.wallSlideRequiresInput || (c.left && moveX < 0) || (c.right && moveX > 0);
      this.state = pushing && (c.left || c.right) && v.y > 0 ? MotorState.WALL_SLIDE : MotorState.AIR;
    }
    if (this.state === MotorState.GROUND && this.prevState !== MotorState.GROUND) {
      this.landedSpeed = Math.max(0, b.prevPos.y < b.pos.y ? (b.pos.y - b.prevPos.y) / dt : 0);
      this.airTime = 0;
      this.events?.emit('player:land', { motor: this, speed: this.landedSpeed });
    }

    // ---- Horizontal
    const target = moveX * p.moveSpeed;
    const control = this.wallJumpLock > 0 ? 1 - this.wallJumpLock / p.wallJumpLockTime : 1;
    const reversing = moveX !== 0 && v.x !== 0 && sign(v.x) !== moveX;
    let accel;
    if (this.state === MotorState.GROUND) {
      const friction = b.groundWall?.friction ?? 1;
      accel = (moveX !== 0 ? p.groundAccel : p.groundDecel) * friction;
    } else {
      accel = moveX !== 0 ? p.airAccel : p.airDecel;
    }
    if (reversing) accel *= p.turnBoost;
    v.x = approach(v.x, target, accel * control * dt);

    // ---- Vertical
    if (this.state === MotorState.WALL_SLIDE) {
      if (v.y > p.wallSlideSpeed) v.y = approach(v.y, p.wallSlideSpeed, p.wallSlideDecel * dt);
      else v.y = Math.min(v.y + p.gravity * dt, p.wallSlideSpeed);
    } else {
      let g = p.gravity;
      if (this.state === MotorState.AIR) {
        if (v.y > 0) g *= p.fallGravityMult;
        else if (Math.abs(v.y) < p.apexThreshold) g *= p.apexGravityMult;
      }
      v.y = Math.min(v.y + g * dt, p.maxFallSpeed);
    }

    // Jump cut (variable height)
    if (this.jumping && !this.jumpCut && !input.jumpHeld && v.y < 0 && this.jumpTime >= p.jumpMinTime) {
      v.y *= p.jumpCutMult;
      this.jumpCut = true;
    }

    // ---- Jumps
    if (this.jumpBuffer > 0) {
      const groundWall = b.groundWall;
      if (c.ground && input.down && groundWall?.oneWay) {
        b.dropThrough = p.dropThroughTime;
        this.jumpBuffer = 0;
      } else if (c.ground || this.coyote > 0) {
        this._jump(-p.jumpSpeed, v.x, 'ground');
      } else if (this.state === MotorState.WALL_SLIDE || (this.wallCoyote > 0 && this.lastWallDir !== 0)) {
        const dir = -this.lastWallDir;
        this._jump(-p.wallJumpSpeedY, dir * p.wallJumpSpeedX, 'wall');
        this.wallJumpLock = p.wallJumpLockTime;
        this.wallCoyote = 0;
        this.facing = dir;
      }
    }

    // ---- Full rest: kill the tiny residual velocities so a resting ball never creeps.
    if (this.state === MotorState.GROUND && moveX === 0 && !this.jumping && v.lenSq() < p.stickSpeed * p.stickSpeed) {
      v.set(0, 0);
    }
  }

  _jump(vy, vx, kind) {
    const v = this.body.vel;
    v.y = vy; v.x = vx;
    this.jumpBuffer = 0;
    this.coyote = 0;
    this.jumping = true;
    this.jumpCut = false;
    this.jumpTime = 0;
    this.lastJumpKind = kind;
    this.state = MotorState.AIR;
    this.events?.emit('player:jump', { motor: this, kind });
  }

  reset() {
    this.state = this.prevState = MotorState.AIR;
    this.coyote = this.jumpBuffer = this.wallCoyote = this.wallJumpLock = 0;
    this.airTime = this.jumpTime = 0;
    this.lastWallDir = 0;
    this.jumping = this.jumpCut = false;
    this.moveX = 0;
  }
}

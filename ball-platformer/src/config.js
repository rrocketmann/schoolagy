// All engine tunables live here. Anything gameplay-feel related should be changed
// in this file rather than inside the systems that consume it.
export const CONFIG = {
  tileSize: 32,

  physics: {
    fixedDt: 1 / 120,        // simulation step (s)
    maxFrameTime: 0.1,       // clamp on frame delta to avoid spiral of death (s)
    skin: 0.5,               // contact sensing distance beyond the radius (px)
    maxSubstepMove: 0.5,     // max distance per substep as a fraction of radius
    maxSubsteps: 64,         // speeds beyond radius*maxSubstepMove*maxSubsteps/dt are clamped
    solverIterations: 4,     // overlap resolution passes per substep
    groundNormalY: -0.65,    // contact normal.y <= this counts as ground
    ceilingNormalY: 0.65,    // contact normal.y >= this counts as ceiling
    wallNormalX: 0.75,       // |normal.x| >= this counts as wall (when not ground)
    cornerCorrection: 8,     // px of horizontal nudge allowed when clipping a ceiling corner
    oneWayTolerance: 2,      // px the ball may already be below a one-way top and still land
    minBounceSpeed: 80,      // impact speed needed for a bouncy surface to bounce (px/s)
  },

  player: {
    radius: 13,

    // Horizontal movement (px/s, px/s^2)
    moveSpeed: 270,
    groundAccel: 2600,
    groundDecel: 900,
    airAccel: 1800,
    airDecel: 500,
    turnBoost: 1.5,          // accel multiplier when reversing direction
    stickSpeed: 40,          // below this speed with no input on the ground, the ball comes fully to rest

    // Vertical movement
    gravity: 1900,
    fallGravityMult: 1.5,    // gravity multiplier while falling
    apexThreshold: 50,       // |vy| below this (while airborne) is the apex
    apexGravityMult: 0.6,    // gravity multiplier at the apex (hang time)
    maxFallSpeed: 950,

    // Jumping
    jumpSpeed: 700,
    jumpCutMult: 0.45,       // vy multiplier when jump is released early
    jumpMinTime: 0.05,       // jump can't be cut before this much time has elapsed
    coyoteTime: 0.1,
    jumpBufferTime: 0.12,

    // Walls
    wallSlideSpeed: 150,
    wallSlideDecel: 4000,    // how fast vy is pulled down to wallSlideSpeed when hitting a wall fast
    wallSlideRequiresInput: true,
    wallJumpSpeedX: 360,
    wallJumpSpeedY: 640,
    wallJumpLockTime: 0.16,  // horizontal control ramps back in over this time after a wall jump
    wallCoyoteTime: 0.1,     // can still wall jump this long after leaving a wall

    // One-way platforms
    dropThroughTime: 0.2,

    // Visual
    spinDamping: 1.5,        // angular velocity damping while airborne
  },

  camera: {
    smoothing: 8,            // higher = snappier follow
    lookAheadX: 0.12,        // seconds of horizontal velocity to look ahead
    lookAheadY: 0.0,
    zoom: 1,
  },

  render: {
    background: '#161a23',
    gridColor: 'rgba(255,255,255,0.035)',
    ballColor: '#ebcb8b',
    ballDark: '#c9973e',
    ballOutline: '#2b2f3a',
    cornerRadius: 6,         // px rounding applied to exposed (non-flush) wall corners
  },

  debug: {
    enabled: false,
  },
};

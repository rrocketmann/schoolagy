// Records finished Polytrack 0.6.3 laps, and only when this computer's determinism check is Ok.
// This save is separate from Polytrack 0.5.2. Each lap keeps the agent's 19 numbers,
// every value the 0.6.3 simulation posts, a 1 ms pose and control trace, and a canvas video.
// Good data is saved in this browser and sent to the 0.6.3 archive. The zip stays on this computer.
(function (global) {
  "use strict";

  var NAMES = [
    "x", "y", "z", "vx", "vy", "vz", "ax", "ay", "az",
    "forward_x", "forward_z", "upright", "wheels",
    "border", "border_side", "gate_right", "gate_forward", "gate_distance", "checkpoint"
  ];
  var ACTIONS = ["none", "a", "d", "w", "wa", "wd", "s", "sa", "sd"];
  var STEP_FRAMES = 50;
  var POS = 200;
  var VEL = 40;
  var ACC = 40;
  var BORDER = 10;
  var GATE = 100;
  var ROAD_HALF = 2.5;
  var PART = 5;
  var TICK_FIELDS = [
    "frame", "speed_kmh", "checkpoint", "control_bits", "brake_light", "wheel_bits",
    "respawn", "x", "y", "z", "qx", "qy", "qz", "qw", "steering"
  ];
  var WHEEL_NAMES = ["FL", "FR", "BL", "BR"];
  var ENV_NAMES = ["Summer", "Winter", "Desert"];
  var AXIS_NAMES = ["YPositive", "YNegative", "XPositive", "XNegative", "ZPositive", "ZNegative"];
  var COLOR_NAMES = {
    0: "Default", 1: "Summer", 2: "Winter", 3: "Desert",
    32: "Custom0", 33: "Custom1", 34: "Custom2", 35: "Custom3", 36: "Custom4",
    37: "Custom5", 38: "Custom6", 39: "Custom7", 40: "Custom8"
  };
  var PART_TYPES = [
      "Straight",
      "TurnSharp",
      "SlopeUp",
      "SlopeDown",
      "Slope",
      "Start",
      "Finish",
      "ToWideMiddle",
      "ToWideLeft",
      "ToWideRight",
      "StraightWide",
      "InnerCornerWide",
      "OuterCornerWide",
      "SlopeUpLeftWide",
      "SlopeUpRightWide",
      "SlopeDownLeftWide",
      "SlopeDownRightWide",
      "SlopeLeftWide",
      "SlopeRightWide",
      "PillarTop",
      "PillarMiddle",
      "PillarBottom",
      "PillarShort",
      "PlanePillarBottom",
      "PlanePillarShort",
      "Plane",
      "PlaneWall",
      "PlaneWallCorner",
      "PlaneWallInnerCorner",
      "Block",
      "WallTrackTop",
      "WallTrackMiddle",
      "WallTrackBottom",
      "PlaneSlopeUp",
      "PlaneSlopeDown",
      "PlaneSlope",
      "TurnShort",
      "TurnLong",
      "SlopeUpLong",
      "SlopeDownLong",
      null,
      "TurnSLeft",
      "TurnSRight",
      "IntersectionT",
      "IntersectionCross",
      "PillarBranch1",
      "PillarBranch2",
      "PillarBranch3",
      "PillarBranch4",
      "WallTrackBottomCorner",
      "WallTrackMiddleCorner",
      "WallTrackTopCorner",
      "Checkpoint",
      "HalfBlock",
      "QuarterBlock",
      "HalfPlane",
      "QuarterPlane",
      "PlaneBridge",
      "SignArrowLeft",
      "SignArrowRight",
      null,
      "SignArrowUp",
      "SignArrowDown",
      "SignWarning",
      "SignWrongWay",
      "CheckpointWide",
      "WallTrackCeiling",
      "WallTrackFloor",
      "BlockSlopedDown",
      "BlockSlopedDownInnerCorner",
      "BlockSlopedDownOuterCorner",
      "BlockSlopedUp",
      "BlockSlopedUpInnerCorner",
      "BlockSlopedUpOuterCorner",
      "FinishWide",
      "PlaneCheckpoint",
      "PlaneFinish",
      "PlaneCheckpointWide",
      "PlaneFinishWide",
      "WallTrackBottomInnerCorner",
      "WallTrackInnerCorner",
      "WallTrackTopInnerCorner",
      "TurnLong2",
      "TurnLong3",
      null,
      "BlockSlopeUp",
      "BlockSlopeDown",
      "BlockSlopeVerticalTop",
      "BlockSlopeVerticalBottom",
      null,
      "PlaneSlopeVerticalBottom",
      "StartWide",
      "PlaneStart",
      "PlaneStartWide",
      "TurnShortLeftWide",
      "TurnShortRightWide",
      "TurnLongLeftWide",
      "TurnLongRightWide",
      "SlopeUpVertical",
      "IntersectionY",
      "IntersectionYLong",
      "PillarBranch1Top",
      "PillarBranch1Bottom",
      "PillarBranch1Middle",
      "PillarBranch2Top",
      "PillarBranch2Middle",
      "PillarBranch2Bottom",
      "PillarBranch3Top",
      "PillarBranch3Middle",
      "PillarBranch3Bottom",
      "PillarBranch4Top",
      "PillarBranch4Middle",
      "PillarBranch4Bottom",
      "PillarBranch5",
      "PillarBranch5Top",
      "PillarBranch5Middle",
      "PillarBranch5Bottom",
      "ToWideDouble",
      "ToWideDiagonal",
      "StraightPillarBottom",
      "StraightPillarShort",
      "TurnSharpPillarBottom",
      "TurnSharpPillarShort",
      "IntersectionTPillarBottom",
      "IntersectionTPillarShort",
      "IntersectionCrossPillarBottom",
      "IntersectionCrossPillarShort",
      "PlaneBridgeCorner",
      "PlaneBridgeIntersectionT",
      "PlaneBridgeIntersectionCross",
      "BlockBridge",
      "BlockBridgeCorner",
      "BlockBridgeIntersectionT",
      "BlockBridgeIntersectionCross",
      "WallTrackCeilingCorner",
      "WallTrackCeilingPlaneCorner",
      "WallTrackFloorCorner",
      "WallTrackFloorPlaneCorner",
      "SlopeUpVerticalLeftWide",
      "SlopeUpVerticalRightWide",
      "BlockSlopeVerticalCornerTop",
      "BlockSlopeVerticalCornerBottom",
      "WallTrackSlopeToVertical",
      "PlaneSlopeToVertical",
      "BlockSlopeToVertical",
      "PlaneSlopeUpLong",
      "PlaneSlopeDownLong",
      "SlopeUpLongLeftWide",
      "SlopeUpLongRightWide",
      "SlopeDownLongLeftWide",
      "SlopeDownLongRightWide",
      "BlockSlopeUpLong",
      "BlockSlopeDownLong",
      "BlockSlopeVerticalInnerCornerBottom",
      "BlockSlopeVerticalInnerCornerTop",
      "BlockInnerCorner",
      "SlopeToVertical",
      "SlopeToVerticalLeftWide",
      "SlopeToVerticalRightWide",
      "StraightTilted",
      "TurnShortTilted",
      "TurnLongTilted",
      "TurnLong2Tilted",
      "TurnLong3Tilted",
      "TurnSLongLeft",
      "TurnSLongRight",
      "ToTiltedLeft",
      "ToTiltedRight",
      "PillarTopSlope",
      "PillarShortSlope",
      "HalfPlaneSlopeBottomLeft",
      "HalfPlaneSlopeBottomRight",
      "HalfPlaneSlopeTopLeft",
      "HalfPlaneSlopeTopRight",
      "HalfBlockSlopeBottomLeft",
      "HalfBlockSlopeBottomRight",
      "HalfBlockSlopeTopLeft",
      "HalfBlockSlopeTopRight",
      "PlaneWallSlopeLeft",
      "PlaneWallSlopeRight",
      "PlaneWallSlopeUpLeft",
      "PlaneWallSlopeUpRight",
      "PlaneWallSlopeDownLeft",
      "PlaneWallSlopeDownRight",
      "PlaneWallSlopeUpLongLeft",
      "PlaneWallSlopeUpLongRight",
      "PlaneWallSlopeDownLongLeft",
      "PlaneWallSlopeDownLongRight",
      "BlockOuterCorner",
      "PlaneCorner"
  ];
  var MOUNTAIN_RNG = [0.12047764760664692, 0.19645762332790628, 0.5525629082262744, 0.41272626379209965, 0.7795036003541387, 0.13367266027110114, 0.7999601557377349, 0.9519714253374205, 0.1735048382917752, 0.7513367084489158, 0.6531386724839523, 0.9026427867068505, 0.8543272738216994, 0.11176849958868162, 0.6705698284858437, 0.26628732081296946, 0.31140322993719605, 0.45170300835470933, 0.12615515120247944, 0.0610638094525735, 0.291990923385425, 0.4613983868623317, 0.6615759832726253, 0.4373182881232056, 0.7432890501246443, 0.39316710322388837, 0.49444122821563297, 0.5994296685114344, 0.060050119050233386, 0.4165885432422003, 0.43974364800990084, 0.1628314496954224, 0.05787972729968116, 0.225388541259955, 0.6075775236386991, 0.8908354370882479, 0.47072983115144584, 0.7662003453186828, 0.20651036895645647, 0.03724062137286044, 0.17110277274376795, 0.7626426077793496, 0.8372112804261309, 0.8761690804447455, 0.13887024930406633, 0.8287513367412203, 0.9794446290917873, 0.807658524448803, 0.8465629116398186, 0.5187285629536083, 0.33962953580139277, 0.9798419666114342, 0.6777071959103609, 0.5388899884934379, 0.7863389168762325, 0.4274591420924474, 0.25631366937500566, 0.5695289062505289, 0.026841382754547727, 0.18267938207996903, 0.9853642975717878, 0.24428485895234409, 0.5322028747608949, 0.9655065842019517, 0.043810183244384016, 0.541216190236913, 0.05897981610006209, 0.2849168541804703, 0.5349823008832073, 0.9655676144971486, 0.22831812764497283, 0.7698701658704175, 0.4103995069939841, 0.25782763124411856, 0.8490222628872495, 0.39280879489916987, 0.31999467883347554, 0.2860820872456349, 0.9684928577493004, 0.9973831481899462, 0.2930912094664657, 0.4847128131859766, 0.7218400909709828, 0.40407009594106236, 0.7059298060123587, 0.45362146566562744, 0.4640974655488792, 0.16076769483252273, 0.5989453525750241, 0.585759299589679, 0.9417035568973537, 0.20117930667657413, 0.5777873180244959, 0.1991854396549344, 0.8743781441651348, 0.624666386634513, 0.38720573630932886, 0.9967931526923675, 0.49817894572849486, 0.24585267823751833, 0.8639168275132305, 0.2865624029759799, 0.6163605496913385, 0.5864748073339972, 0.8781049154377354, 0.7497547608938613, 0.7864098057445887, 0.0334170452332867, 0.4875588105294657, 0.6737395339380896, 0.21851121231639659, 0.2923739650597854, 0.6073797612662293, 0.41823228947229896, 0.8531029420136382, 0.3260916332061783, 0.6306262204574675, 0.5268576689601923, 0.3516570914484707, 0.8659366375222706, 0.8447448461834428, 0.3794548980890986, 0.9832775904115916, 0.8442256760399809, 0.3006550591973338, 0.9718660619781394, 0.5103245035851833, 0.794319831388071];
  var VEHICLE = {
    steps_per_second: 1000,
    max_frames: 5999999,
    mass_offset_y: 0.6,
    collision_shape_sha256: "c12d4421883ae86b922550f98efea3cf5e6b9c168436f9f5c989ad33a41ce50b",
    detector_box_center: [0, 0.48, -0.15],
    detector_box_size: [0.89, 0.22, 1.8],
    suspension_reset_front: 0.07809501004219055,
    suspension_reset_rear: 0.0781289680480957,
    wheel_connection: {
      FL: [0.627909, 0.27, 1.3478],
      FR: [-0.627909, 0.27, 1.3478],
      BL: [0.720832, 0.27, -1.52686],
      BR: [-0.720832, 0.27, -1.52686]
    },
    start_offset: [0, 0.35, 1.35],
    start_wide_offset: [-10, 0.35, 1.35],
    part_size_m: 5,
    physics: "mass, engine, brake, steer rate, and suspension stiffness are inside polytrack_physics.wasm; each lap stores the posted steering angle and wheel suspension"
  };
  var HEADER = {
    kind: "header",
    version: 1,
    game: "polytrack-0.6.3",
    determinism: "ok",
    names: NAMES,
    actions: ACTIONS,
    scales: { position: POS, velocity: VEL, acceleration: ACC, border: BORDER, gate: GATE },
    step_ms: STEP_FRAMES,
    tick_ms: 1,
    tick_fields: TICK_FIELDS,
    tick_control_bits: { up: 1, down: 2, left: 4, right: 8, reset: 16 },
    tick_wheel_bits: "bit i is contact for wheel i",
    wheels: WHEEL_NAMES,
    velocity_source: "finite difference of position; the 0.6.3 worker does not post chassis velocity",
    video: { container: "webm", fps: 30, bits_per_second: 1000000, max_bytes: 40000000, audio: false },
    part_size_m: PART,
    part_types: PART_TYPES,
    environments: ENV_NAMES,
    axes: AXIS_NAMES,
    colors: COLOR_NAMES,
    gate_centers: { checkpoint: [0, 2.2, 0], wide: [10, 2.2, 0] },
    sun: "stored byte is degrees/2; sun direction is normalize(cos(deg), 0.78, sin(deg)) with deg = byte * 2",
    mountain: {
      rng_index_starts_at: 0,
      next_increments_before_read: true,
      height_scale: 100,
      samples_per_ring: 8,
      radial_step_m: 100,
      min_radius_m: 200,
      radius_bias_m: 160,
      max_radius_m: 4500,
      rings: "floor(radius/10)",
      radius: "max(200, 160 + max(grid span x, grid span z) * part_size/2 * sqrt(2)); span is max-min of the track grid, and the grid y axis is world z; no mesh above 4500",
      offset: "track center x and z in meters, y 0",
      rng: MOUNTAIN_RNG
    },
    vehicle: VEHICLE
  };
  var DATASET_README = [
    "# Polytrack 0.6.3 good data",
    "",
    "Good data from Polytrack 0.6.3. A run is included only when that browser's determinism check passed.",
    "",
    "Good data is uploaded for the site owner as well as saved in this zip. Profile names are not included. Polytrack 0.5.2 is a separate dataset and is not in this zip. A run that fails the determinism check is not uploaded.",
    "",
    "## Files",
    "",
    "- `runs.jsonl` is one JSON object per line. The first line is the header (`kind` is `header`). Each later line is one lap (`kind` is `run`).",
    "- `videos/<id>.webm` is the canvas recording named by the lap's `video` field. That field is null when the browser could not record.",
    "",
    "## Time",
    "",
    "- `t` and `frames` are physics time. The car steps every millisecond, so seconds are `frames * 0.001`.",
    "- `rows` are every 50 ms and include the full posted car state.",
    "- `ticks` are every 1 ms, capped at 5 minutes. Column names are `tick_fields` in the header. The last column is the posted steering angle.",
    "- `wall` on a row is seconds since the video started. `t` stays still while the simulation is paused. `wall` does not.",
    "",
    "## Lap row",
    "",
    "`game` is `polytrack-0.6.3` and `version` is 1. A Polytrack 0.5.2 lap does not belong in this file.",
    "",
    "`action` is the w/a/s/d combination at that physics frame: 0 none, 1 a, 2 d, 3 w, 4 wa, 5 wd, 6 s, 7 sa, 8 sd, and -1 while reset is held. Changes between rows are in `ticks`.",
    "",
    "`n` is the 19 scaled numbers named in the header. `scales` says the divisors. `velocity` and `acceleration` are the same derivatives in m/s and m/s^2.",
    "",
    "`car` is every field the 0.6.3 worker posts: speed, pose, quaternion, checkpoint, respawn flag, brake light, steering, controls, collision impulses, and for each wheel the contact point and normal, suspension length and velocity, delta rotation, and skid. Wheel order is FL, FR, BL, BR. This worker does not post wheel rotation, wheel position, or wheel quaternion.",
    "",
    "## Track and car",
    "",
    "`track.save` is the game's own track string. `track.parts` is that string decoded. A part's world position is its grid index times 5 meters. Rotation and axis share one byte. `track.environment` is 0 Summer, 1 Winter, 2 Desert. `track.sun_degrees` is twice the stored sun byte.",
    "",
    "`mountain` is the generated terrain's offset and vertex count. The mesh is a function of the track bounds and `header.mountain`.",
    "",
    "`header.vehicle` lists the car values stored in the page script. Engine force and the other forces live in polytrack_physics.wasm and are not copied here. Each lap still stores the posted steering angle and suspension lengths.",
    "",
    "`settings` is this browser's graphics, audio, camera, and key bindings. Profile names, ghosts, and saved tracks are left out.",
    "",
    "## Video",
    "",
    "WebM at 30 fps, VP8 when the browser allows it, about 1 Mbps, from the game canvas. There is no game audio. The recording stops at 40 MB and `video_truncated` is then true.",
    ""
  ].join("\n");

  // Same axis/rotation table the agent uses in polytrack_agent/rl/track.py.
  var PART_QUAT = [
    [[0, 0, 0, 1], [0, 0.7071067811865475, 0, 0.7071067811865476], [0, 1, 0, 0], [0, 0.7071067811865476, 0, -0.7071067811865475]],
    [[0, 0, 1, 0], [0.7071067811865475, 0, 0.7071067811865476, 0], [1, 0, 0, 0], [0.7071067811865476, 0, -0.7071067811865475, 0]],
    [[0, 0, -0.7071067811865477, 0.7071067811865475], [0.5, 0.5, -0.5, 0.5], [0.7071067811865475, 0.7071067811865477, 0, 0], [0.5, 0.5, 0.5, -0.5]],
    [[0, 0, 0.7071067811865475, 0.7071067811865476], [0.5, -0.5, 0.5, 0.5], [0.7071067811865476, -0.7071067811865475, 0, 0], [0.5, -0.5, -0.5, -0.5]],
    [[0.7071067811865475, 0, 0, 0.7071067811865476], [0.5, 0.5, 0.5, 0.5], [0, 0.7071067811865476, 0.7071067811865475, 0], [-0.5, 0.5, 0.5, -0.5]],
    [[-0.7071067811865477, 0, 0, 0.7071067811865475], [-0.5, -0.5, 0.5, 0.5], [0, -0.7071067811865475, 0.7071067811865477, 0], [0.5, -0.5, 0.5, -0.5]]
  ];
  var GATES = {
    52: { kind: "checkpoint", center: [0, 2.2, 0] },
    65: { kind: "checkpoint", center: [10, 2.2, 0] },
    75: { kind: "checkpoint", center: [0, 2.2, 0] },
    77: { kind: "checkpoint", center: [10, 2.2, 0] },
    6: { kind: "finish", center: [0, 2.2, 0] },
    74: { kind: "finish", center: [10, 2.2, 0] },
    76: { kind: "finish", center: [0, 2.2, 0] },
    78: { kind: "finish", center: [10, 2.2, 0] }
  };
  var CHECKPOINT_TYPES = { 52: 1, 65: 1, 75: 1, 77: 1 };
  var START_TYPES = { 5: 1, 91: 1, 92: 1, 93: 1 };
  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var DECODE = (function () {
    var table = [];
    var i;
    for (i = 0; i < 128; i++) table.push(-1);
    for (i = 0; i < ALPHABET.length; i++) table[ALPHABET.charCodeAt(i)] = i;
    return table;
  })();

  var inflateBytes = null;

  function setInflate(fn) {
    inflateBytes = fn;
  }

  function browserInflate(bytes) {
    if (typeof DecompressionStream === "undefined") {
      return Promise.reject(new Error("inflate unavailable"));
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Response(stream).arrayBuffer().then(function (buffer) {
      return new Uint8Array(buffer);
    });
  }

  function readBits(bytes, bit) {
    var index = Math.floor(bit / 8);
    var shift = bit - 8 * index;
    var value = bytes[index];
    if (shift <= 2 || index >= bytes.length - 1) return (value & (63 << shift)) >>> shift;
    return ((value & (63 << shift)) >>> shift) | ((bytes[index + 1] & (63 >>> (8 - shift))) << (8 - shift));
  }

  function writeBits(out, bit, width, value, last) {
    var index = Math.floor(bit / 8);
    while (index >= out.length) out.push(0);
    var shift = bit - 8 * index;
    out[index] |= (value << shift) & 255;
    if (shift > 8 - width && !last) {
      var next = index + 1;
      if (next >= out.length) out.push(0);
      out[next] |= value >> (8 - shift);
    }
  }

  function encodeBytes(bytes) {
    var bit = 0;
    var text = "";
    while (bit < 8 * bytes.length) {
      var chunk = readBits(bytes, bit);
      var symbol;
      if (30 & ~chunk) {
        symbol = chunk;
        bit += 6;
      } else {
        symbol = 31 & chunk;
        bit += 5;
      }
      text += ALPHABET[symbol];
    }
    return text;
  }

  function decodeText(text) {
    var out = [];
    var bit = 0;
    var i;
    for (i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if (code >= DECODE.length) return null;
      var symbol = DECODE[code];
      if (symbol < 0) return null;
      if (30 & ~symbol) {
        writeBits(out, bit, 6, symbol, i === text.length - 1);
        bit += 6;
      } else {
        writeBits(out, bit, 5, symbol, i === text.length - 1);
        bit += 5;
      }
    }
    return new Uint8Array(out);
  }

  function readI32(bytes, offset) {
    return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24));
  }

  function readPacked(bytes, offset, width) {
    var value = 0;
    var i;
    for (i = 0; i < width; i++) value |= bytes[offset + i] << (8 * i);
    return value;
  }

  function parseParts(bytes) {
    var cursor = 0;
    if (bytes.length - cursor < 1) return null;
    var environment = bytes[cursor];
    cursor += 1;
    if (environment > 2) return null;
    if (bytes.length - cursor < 1) return null;
    var sun = bytes[cursor];
    cursor += 1;
    if (sun >= 180) return null;
    if (bytes.length - cursor < 13) return null;
    var originX = readI32(bytes, cursor);
    cursor += 4;
    var originY = readI32(bytes, cursor);
    cursor += 4;
    var originZ = readI32(bytes, cursor);
    cursor += 4;
    var packed = bytes[cursor];
    cursor += 1;
    var widthX = packed & 3;
    var widthY = (packed >> 2) & 3;
    var widthZ = (packed >> 4) & 3;
    if (widthX < 1 || widthX > 3 || widthY < 1 || widthY > 3 || widthZ < 1 || widthZ > 3) return null;
    var parts = [];
    while (cursor < bytes.length) {
      if (bytes.length - cursor < 5) return null;
      var type = bytes[cursor];
      cursor += 1;
      if (type >= PART_TYPES.length || PART_TYPES[type] == null) return null;
      var count = readI32(bytes, cursor);
      cursor += 4;
      if (count < 0 || count > 100000) return null;
      var n;
      for (n = 0; n < count; n++) {
        if (bytes.length - cursor < widthX + widthY + widthZ + 2) return null;
        var x = readPacked(bytes, cursor, widthX) + originX;
        cursor += widthX;
        var y = readPacked(bytes, cursor, widthY) + originY;
        cursor += widthY;
        var z = readPacked(bytes, cursor, widthZ) + originZ;
        cursor += widthZ;
        var orient = bytes[cursor];
        cursor += 1;
        var rotation = orient & 3;
        var axis = (orient >> 2) & 7;
        if (axis > 5) return null;
        if (bytes.length - cursor < 1) return null;
        var color = bytes[cursor];
        cursor += 1;
        if (!Object.prototype.hasOwnProperty.call(COLOR_NAMES, color)) return null;
        var order = null;
        if (CHECKPOINT_TYPES[type]) {
          if (bytes.length - cursor < 2) return null;
          order = bytes[cursor] | (bytes[cursor + 1] << 8);
          cursor += 2;
        }
        var startOrder = null;
        if (START_TYPES[type]) {
          if (bytes.length - cursor < 4) return null;
          startOrder = readI32(bytes, cursor);
          cursor += 4;
        }
        parts.push({
          x: x,
          y: y,
          z: z,
          type: type,
          rotation: rotation,
          axis: axis,
          color: color,
          order: order,
          start_order: startOrder
        });
      }
    }
    return { environment: environment, sun: sun, parts: parts };
  }

  function inflateString(bytes) {
    return inflateBytes(bytes).then(function (out) {
      return new TextDecoder("utf-8").decode(out);
    });
  }

  function decodeLayers(text) {
    var first = decodeText(text);
    if (!first) return Promise.resolve(null);
    return inflateString(first).then(function (middle) {
      var second = decodeText(middle);
      if (!second) return null;
      return inflateBytes(second);
    }).catch(function () {
      return null;
    });
  }

  function readExportMeta(raw, dated) {
    if (!raw || raw.length < 2) return null;
    var cursor = 0;
    var nameLength = raw[cursor];
    cursor += 1;
    if (raw.length < cursor + nameLength + 1) return null;
    var name = new TextDecoder("utf-8").decode(raw.subarray(cursor, cursor + nameLength));
    cursor += nameLength;
    var authorLength = raw[cursor];
    cursor += 1;
    if (raw.length < cursor + authorLength) return null;
    var author = authorLength ? new TextDecoder("utf-8").decode(raw.subarray(cursor, cursor + authorLength)) : "";
    cursor += authorLength;
    var modified = null;
    if (dated) {
      if (raw.length < cursor + 1) return null;
      var flag = raw[cursor];
      cursor += 1;
      if (flag === 1) {
        if (raw.length < cursor + 4) return null;
        modified = readI32(raw, cursor);
        cursor += 4;
      } else if (flag !== 0) return null;
    }
    var track = parseParts(raw.subarray(cursor));
    if (!track) return null;
    track.name = name;
    track.author = author;
    track.modified = modified;
    return track;
  }

  function decodeExport(text) {
    var clean = String(text).replace(/\s+/g, "");
    if (clean.indexOf("PolyTrack2") === 0) {
      return decodeLayers(clean.substring(10)).then(function (raw) {
        return readExportMeta(raw, true);
      });
    }
    if (clean.indexOf("PolyTrack1") === 0) {
      return decodeLayers(clean.substring(10)).then(function (raw) {
        return readExportMeta(raw, false);
      });
    }
    return Promise.resolve(null);
  }

  function decodeSave(text) {
    return decodeLayers(String(text).replace(/\s+/g, "")).then(function (raw) {
      if (!raw) return null;
      return parseParts(raw);
    });
  }

  function rotate(quat, vector) {
    var x = quat[0];
    var y = quat[1];
    var z = quat[2];
    var w = quat[3];
    var vx = vector[0];
    var vy = vector[1];
    var vz = vector[2];
    var tx = 2 * (y * vz - z * vy);
    var ty = 2 * (z * vx - x * vz);
    var tz = 2 * (x * vy - y * vx);
    return [
      vx + w * tx + (y * tz - z * ty),
      vy + w * ty + (z * tx - x * tz),
      vz + w * tz + (x * ty - y * tx)
    ];
  }

  function mean(points) {
    var x = 0;
    var y = 0;
    var z = 0;
    var i;
    for (i = 0; i < points.length; i++) {
      x += points[i][0];
      y += points[i][1];
      z += points[i][2];
    }
    return [x / points.length, y / points.length, z / points.length];
  }

  function layoutFromParts(parts) {
    var seen = {};
    var cells = [];
    var buckets = {};
    var finishes = [];
    var i;
    for (i = 0; i < parts.length; i++) {
      var part = parts[i];
      var key = part.x + "," + part.z;
      if (!seen[key]) {
        seen[key] = 1;
        cells.push([part.x * PART, part.z * PART]);
      }
      var gate = GATES[part.type];
      if (!gate) continue;
      var quat = PART_QUAT[part.axis][part.rotation];
      var offset = rotate(quat, gate.center);
      var point = [part.x * PART + offset[0], part.y * PART + offset[1], part.z * PART + offset[2]];
      if (gate.kind === "checkpoint" && part.order !== null) {
        if (!buckets[part.order]) buckets[part.order] = [];
        buckets[part.order].push(point);
      } else if (gate.kind === "finish") {
        finishes.push(point);
      }
    }
    var orders = Object.keys(buckets).map(function (order) { return Number(order); }).sort(function (a, b) { return a - b; });
    var gates = orders.map(function (order) { return mean(buckets[order]); });
    var finish = finishes.length ? mean(finishes) : (gates.length ? gates[gates.length - 1] : [0, 0, 0]);
    return {
      cells: cells,
      gates: gates,
      finish: finish,
      checkpointCount: Math.max(1, orders.length)
    };
  }

  function emptyLayout() {
    return { cells: [], gates: [], finish: [0, 0, 0], checkpointCount: 1 };
  }

  function roadBorder(cells, x, z) {
    if (!cells.length) return [0, 0];
    var nearest = cells[0];
    var best = Infinity;
    var i;
    for (i = 0; i < cells.length; i++) {
      var dx = cells[i][0] - x;
      var dz = cells[i][1] - z;
      var score = dx * dx + dz * dz;
      if (score < best) {
        best = score;
        nearest = cells[i];
      }
    }
    var neighbor = null;
    var neighborDistance = 1e9;
    for (i = 0; i < cells.length; i++) {
      var distance = hypot(cells[i][0] - nearest[0], cells[i][1] - nearest[1]);
      if (distance > 3 && distance < 8 && distance < neighborDistance) {
        neighbor = cells[i];
        neighborDistance = distance;
      }
    }
    var offsetX = x - nearest[0];
    var offsetZ = z - nearest[1];
    if (!neighbor) return [ROAD_HALF - Math.max(Math.abs(offsetX), Math.abs(offsetZ)), 0];
    var alongX = neighbor[0] - nearest[0];
    var alongZ = neighbor[1] - nearest[1];
    var length = hypot(alongX, alongZ);
    alongX /= length;
    alongZ /= length;
    var side = offsetX * -alongZ + offsetZ * alongX;
    return [ROAD_HALF - Math.abs(side), side];
  }

  function targetPoint(layout, index) {
    if (index >= 0 && index < layout.gates.length) return layout.gates[index];
    return layout.finish;
  }

  function round6(value) {
    return Math.round(value * 1e6) / 1e6;
  }

  // The game replaces Math.hypot with a stub that throws. Use a local one.
  function hypot(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  function actionId(controls) {
    if (!controls) return 0;
    if (controls.reset) return -1;
    var throttle = controls.up && !controls.down ? 1 : (controls.down && !controls.up ? 2 : 0);
    var steer = controls.left && !controls.right ? 1 : (controls.right && !controls.left ? 2 : 0);
    return throttle * 3 + steer;
  }

  function features(sample, velocity, acceleration, layout) {
    var q = sample.quaternion || { x: 0, y: 0, z: 0, w: 1 };
    var qx = +q.x || 0;
    var qy = +q.y || 0;
    var qz = +q.z || 0;
    var qw = +q.w || 1;
    var upright = 1 - 2 * (qx * qx + qz * qz);
    var forwardX = 2 * (qx * qz + qw * qy);
    var forwardZ = 1 - 2 * (qx * qx + qy * qy);
    var rightX = 1 - 2 * (qy * qy + qz * qz);
    var rightZ = 2 * (qx * qz - qw * qy);
    var contact = 0;
    var wheels = sample.wheels || [];
    var i;
    for (i = 0; i < wheels.length; i++) if (wheels[i]) contact += 1;
    contact /= 4;
    var position = sample.position || { x: 0, y: 0, z: 0 };
    var px = +position.x || 0;
    var py = +position.y || 0;
    var pz = +position.z || 0;
    var target = targetPoint(layout, sample.checkpoint || 0);
    var dx = target[0] - px;
    var dz = target[2] - pz;
    var border = roadBorder(layout.cells, px, pz);
    var count = layout.checkpointCount || 1;
    return [
      px / POS, py / POS, pz / POS,
      velocity.x / VEL, velocity.y / VEL, velocity.z / VEL,
      acceleration.x / ACC, acceleration.y / ACC, acceleration.z / ACC,
      forwardX, forwardZ, upright, contact,
      border[0] / BORDER, border[1] / BORDER,
      (-(dx * rightX + dz * rightZ)) / GATE,
      (dx * forwardX + dz * forwardZ) / GATE,
      hypot(dx, dz) / GATE,
      (sample.checkpoint || 0) / Math.max(1, count)
    ].map(round6);
  }

  function buildRows(samples, layout) {
    var rows = [];
    var previous = null;
    var velocity = { x: 0, y: 0, z: 0 };
    var i;
    for (i = 0; i < samples.length; i++) {
      var sample = samples[i];
      var dt = 0;
      var acceleration = { x: 0, y: 0, z: 0 };
      if (previous) {
        dt = Math.max(0, (sample.frames - previous.frames) * 0.001);
        if (dt > 1e-6) {
          var next = {
            x: (sample.position.x - previous.position.x) / dt,
            y: (sample.position.y - previous.position.y) / dt,
            z: (sample.position.z - previous.position.z) / dt
          };
          acceleration = {
            x: (next.x - velocity.x) / dt,
            y: (next.y - velocity.y) / dt,
            z: (next.z - velocity.z) / dt
          };
          velocity = next;
        }
      }
      rows.push({
        t: round6(sample.frames * 0.001),
        dt: round6(dt),
        wall: sample.wall == null ? null : round6(sample.wall),
        action: actionId(sample.controls),
        n: features(sample, velocity, acceleration, layout),
        velocity: { x: round6(velocity.x), y: round6(velocity.y), z: round6(velocity.z) },
        acceleration: { x: round6(acceleration.x), y: round6(acceleration.y), z: round6(acceleration.z) },
        car: sample.raw || null
      });
      previous = sample;
    }
    return rows;
  }

  function finite(value) {
    var n = +value;
    return n === n && n !== Infinity && n !== -Infinity;
  }

  function num(value) {
    if (!finite(value)) return null;
    return round6(+value);
  }

  function nums(list, count) {
    var out = [];
    var i;
    for (i = 0; i < count; i++) out.push(list && finite(list[i]) ? round6(+list[i]) : null);
    return out;
  }

  function vec3(value) {
    if (!value) return null;
    return { x: num(value.x), y: num(value.y), z: num(value.z) };
  }

  function quat4(value) {
    if (!value) return null;
    return { x: num(value.x), y: num(value.y), z: num(value.z), w: num(value.w) };
  }

  function snapshotState(state) {
    var contacts = [];
    var wheels = state && state.wheelContact || [];
    var i;
    for (i = 0; i < 4; i++) {
      var wheel = wheels[i];
      contacts.push(wheel ? { position: vec3(wheel.position), normal: vec3(wheel.normal) } : null);
    }
    var impulses = [];
    var rawImpulses = state && state.collisionImpulses || [];
    for (i = 0; i < rawImpulses.length && i < 32; i++) impulses.push(num(rawImpulses[i]));
    var controls = state && state.controls || {};
    return {
      frames: state && state.frames | 0,
      speed_kmh: num(state && state.speedKmh),
      has_started: !!(state && state.hasStarted),
      finish_frames: state && state.finishFrames != null ? state.finishFrames | 0 : null,
      next_checkpoint_index: state && state.nextCheckpointIndex | 0,
      has_checkpoint_to_respawn_at: !!(state && state.hasCheckpointToRespawnAt),
      position: vec3(state && state.position),
      quaternion: quat4(state && state.quaternion),
      collision_impulses: impulses,
      wheel_contact: contacts,
      wheel_suspension_length: nums(state && state.wheelSuspensionLength, 4),
      wheel_suspension_velocity: nums(state && state.wheelSuspensionVelocity, 4),
      wheel_delta_rotation: nums(state && state.wheelDeltaRotation, 4),
      wheel_skid_info: nums(state && state.wheelSkidInfo, 4),
      steering: num(state && state.steering),
      brake_light: !!(state && state.brakeLightEnabled),
      controls: {
        up: !!controls.up,
        down: !!controls.down,
        left: !!controls.left,
        right: !!controls.right,
        reset: !!controls.reset
      }
    };
  }

  function decodeCarState(buffer) {
    var bytes;
    try {
      if (!buffer || !buffer.byteLength) return null;
      var viewIn = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      bytes = new Uint8Array(viewIn.length);
      bytes.set(viewIn);
    } catch (err) {
      return null;
    }
    if (bytes.length < 8) return null;
    var id = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var i = 4;
    function need(n) { return bytes.length >= i + n; }
    function f32() {
      var value = view.getFloat32(i, true);
      i += 4;
      return value;
    }
    if (!need(3 + 4 + 1)) return null;
    var frames = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16);
    i += 3;
    var speed = f32();
    var flags = bytes[i];
    i += 1;
    var finishFrames = null;
    if (flags & 2) {
      if (!need(3)) return null;
      finishFrames = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16);
      i += 3;
    }
    if (!need(2 + 12 + 16 + 1)) return null;
    var checkpoint = view.getUint16(i, true);
    i += 2;
    var position = { x: f32(), y: f32(), z: f32() };
    var quaternion = { x: f32(), y: f32(), z: f32(), w: f32() };
    var impulseCount = bytes[i];
    i += 1;
    if (impulseCount > 4 || !need(impulseCount * 4)) return null;
    var impulses = [];
    var n;
    for (n = 0; n < impulseCount; n++) impulses.push(f32());
    var contacts = [null, null, null, null];
    var bit;
    for (bit = 0; bit < 4; bit++) {
      if (!(flags & (8 << bit))) continue;
      if (!need(24)) return null;
      var point = { x: f32(), y: f32(), z: f32() };
      var normal = { x: f32(), y: f32(), z: f32() };
      contacts[bit] = { position: point, normal: normal };
    }
    if (!need(16 * 4 + 4 + 1)) return null;
    var suspensionLength = [f32(), f32(), f32(), f32()];
    var suspensionVelocity = [f32(), f32(), f32(), f32()];
    var deltaRotation = [f32(), f32(), f32(), f32()];
    var skid = [f32(), f32(), f32(), f32()];
    var steering = f32();
    var controlsByte = bytes[i];
    i += 1;
    return {
      id: id,
      frames: frames,
      speedKmh: speed,
      hasStarted: !!(flags & 1),
      finishFrames: finishFrames,
      nextCheckpointIndex: checkpoint,
      hasCheckpointToRespawnAt: !!(flags & 4),
      position: position,
      quaternion: quaternion,
      collisionImpulses: impulses,
      wheelContact: contacts,
      wheelSuspensionLength: suspensionLength,
      wheelSuspensionVelocity: suspensionVelocity,
      wheelDeltaRotation: deltaRotation,
      wheelSkidInfo: skid,
      steering: steering,
      brakeLightEnabled: !!(controlsByte & 32),
      controls: {
        up: !!(controlsByte & 1),
        right: !!(controlsByte & 2),
        down: !!(controlsByte & 4),
        left: !!(controlsByte & 8),
        reset: !!(controlsByte & 16)
      },
      bytes: i
    };
  }

  function packTicks(flat, count) {
    var stride = TICK_FIELDS.length;
    var rows = [];
    var i;
    var k;
    for (i = 0; i < count; i++) {
      var at = i * stride;
      var row = [];
      for (k = 0; k < stride; k++) {
        var raw = flat[at + k];
        row.push(k === 0 || (k >= 2 && k <= 6) ? raw : round6(raw));
      }
      rows.push(row);
    }
    return rows;
  }

  var CRC_TABLE = (function () {
    var table = [];
    var n;
    for (n = 0; n < 256; n++) {
      var c = n;
      var k;
      for (k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table.push(c >>> 0);
    }
    return table;
  })();

  function crc32(bytes) {
    var crc = 0xffffffff;
    var i;
    for (i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosTime(date) {
    var time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    var day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return [time, day];
  }

  function put32(bytes, offset, value) {
    bytes[offset] = value & 255;
    bytes[offset + 1] = (value >>> 8) & 255;
    bytes[offset + 2] = (value >>> 16) & 255;
    bytes[offset + 3] = (value >>> 24) & 255;
  }

  function put16(bytes, offset, value) {
    bytes[offset] = value & 255;
    bytes[offset + 1] = (value >>> 8) & 255;
  }

  function zipFiles(files) {
    var encoder = new TextEncoder();
    var local = [];
    var central = [];
    var offset = 0;
    var stamp = dosTime(new Date());
    var i;
    for (i = 0; i < files.length; i++) {
      var name = encoder.encode(files[i].name);
      var data = files[i].data;
      var crc = crc32(data);
      var head = new Uint8Array(30 + name.length);
      put32(head, 0, 0x04034b50);
      put16(head, 4, 20);
      put16(head, 8, 0);
      put16(head, 10, stamp[0]);
      put16(head, 12, stamp[1]);
      put32(head, 14, crc);
      put32(head, 18, data.length);
      put32(head, 22, data.length);
      put16(head, 26, name.length);
      head.set(name, 30);
      local.push(head, data);
      var dir = new Uint8Array(46 + name.length);
      put32(dir, 0, 0x02014b50);
      put16(dir, 4, 20);
      put16(dir, 6, 20);
      put16(dir, 10, 0);
      put16(dir, 12, stamp[0]);
      put16(dir, 14, stamp[1]);
      put32(dir, 16, crc);
      put32(dir, 20, data.length);
      put32(dir, 24, data.length);
      put16(dir, 28, name.length);
      put32(dir, 42, offset);
      dir.set(name, 46);
      central.push(dir);
      offset += head.length + data.length;
    }
    var centralSize = 0;
    for (i = 0; i < central.length; i++) centralSize += central[i].length;
    var end = new Uint8Array(22);
    put32(end, 0, 0x06054b50);
    put16(end, 8, files.length);
    put16(end, 10, files.length);
    put32(end, 12, centralSize);
    put32(end, 16, offset);
    local.push.apply(local, central);
    local.push(end);
    return new Blob(local, { type: "application/zip" });
  }

  var api = {
    NAMES: NAMES,
    ACTIONS: ACTIONS,
    HEADER: HEADER,
    setInflate: setInflate,
    encodeBytes: encodeBytes,
    decodeText: decodeText,
    decodeExport: decodeExport,
    decodeSave: decodeSave,
    parseParts: parseParts,
    layoutFromParts: layoutFromParts,
    roadBorder: roadBorder,
    actionId: actionId,
    features: features,
    buildRows: buildRows,
    emptyLayout: emptyLayout,
    snapshotState: snapshotState,
    decodeCarState: decodeCarState,
    packTicks: packTicks,
    zipFiles: zipFiles,
    readme: DATASET_README
  };

  if (typeof module === "object" && module.exports) module.exports = api;

  if (typeof window === "undefined") return;
  setInflate(browserInflate);

  var determinismOk = false;
  var knownMassOffset = null;
  var sessions = {};
  var memoryRuns = [];
  var publishedRuns = [];
  var button = null;
  var labelNode = null;
  var sendFailed = false;
  var INBOX_TOPIC = "pt360bad3248e4c33725e03b483f99b673448747fd";
  var UPLOAD_EXPIRE = "172800";
  var REPOST_MS = 8 * 60 * 60 * 1000;
  var URL_FRESH_MS = 36 * 60 * 60 * 1000;
  var MAX_POSTS = 3;
  var publishChain = Promise.resolve();

  function watch(worker) {
    var post = worker.postMessage;
    worker.postMessage = function (data, transfer) {
      try { onOut(data); } catch (err) {}
      if (transfer) return post.call(worker, data, transfer);
      return post.call(worker, data);
    };
    worker.addEventListener("message", function (event) {
      try { onIn(event.data); } catch (err) {}
    });
  }

  var VIDEO_FPS = 30;
  var VIDEO_BPS = 1000000;
  var VIDEO_MAX_BYTES = 40000000;
  var MAX_TICKS = 300000;
  var MAX_ROWS = 20000;

  function onOut(data) {
    if (!data || typeof data.messageType !== "number") return;
    if (data.messageType === 0) {
      if (data.carMassOffset != null) knownMassOffset = num(data.carMassOffset);
      return;
    }
    if (data.messageType === 3 && data.carRecording == null && data.carId != null) {
      openSession(data.carId, data);
    } else if (data.messageType === 4 && data.carId != null) {
      dropSession(data.carId);
    }
  }

  function onIn(data) {
    if (!data || typeof data.messageType !== "number") return;
    if (data.messageType === 9) {
      determinismOk = data.isDeterminstic === true || data.isDeterministic === true;
      if (button) {
        button.title = determinismOk
          ? "Good data from Polytrack 0.6.3 is saved here and sent to the 0.6.3 archive. Click to download a zip."
          : "Determinism check did not pass, so good data from this browser is not saved or sent.";
        notifyParent();
      }
      return;
    }
    if (data.messageType !== 10 || !data.carStateBuffers) return;
    var buffers = data.carStateBuffers;
    var i;
    for (i = 0; i < buffers.length; i++) {
      var state = decodeCarState(buffers[i]);
      if (state) takeState(state);
    }
  }

  function emptyTrack() {
    return { environment: null, sun: null, parts: [] };
  }

  function openSession(carId, message) {
    var trackData = message.trackData;
    var trackPromise = Promise.resolve(emptyTrack());
    if (typeof trackData === "string" && trackData.length) {
      trackPromise = decodeSave(trackData).then(function (decoded) {
        return decoded || emptyTrack();
      }).catch(function () {
        return emptyTrack();
      });
    }
    var session = {
      samples: [],
      tickBuf: [],
      tickCount: 0,
      tickTruncated: false,
      rowsTruncated: false,
      nextFrame: 0,
      trackPromise: trackPromise,
      trackKey: trackKey(trackData),
      trackSave: typeof trackData === "string" ? trackData : "",
      mountain: {
        offset: vec3(message.mountainOffset),
        float_count: message.mountainVertices && message.mountainVertices.length || 0
      },
      massOffset: message.carMassOffset != null ? num(message.carMassOffset) : knownMassOffset,
      finished: false,
      acceptFinish: true,
      clock: performance.now(),
      chunks: [],
      videoBytes: 0,
      videoStarted: 0,
      videoMeta: { fps: VIDEO_FPS, mime: "video/webm", width: 0, height: 0, bits_per_second: VIDEO_BPS, truncated: false }
    };
    sessions[carId] = session;
    startVideo(session);
  }

  function dropSession(carId) {
    var session = sessions[carId];
    if (!session) return;
    delete sessions[carId];
    stopRecorder(session);
  }

  function trackKey(trackData) {
    if (typeof trackData !== "string" || !trackData) return "track";
    var end = trackData.slice(-12);
    return trackData.length + ":" + trackData.slice(0, 12) + ":" + end;
  }

  function copyVec(value) {
    return {
      x: value && +value.x || 0,
      y: value && +value.y || 0,
      z: value && +value.z || 0
    };
  }

  function copyQuat(value) {
    return {
      x: value && +value.x || 0,
      y: value && +value.y || 0,
      z: value && +value.z || 0,
      w: value && value.w != null ? +value.w : 1
    };
  }

  function controlBits(controls) {
    var bits = 0;
    if (!controls) return 0;
    if (controls.up) bits |= 1;
    if (controls.down) bits |= 2;
    if (controls.left) bits |= 4;
    if (controls.right) bits |= 8;
    if (controls.reset) bits |= 16;
    return bits;
  }

  function wheelBits(state) {
    var bits = 0;
    var wheels = state.wheelContact || [];
    var i;
    for (i = 0; i < 4; i++) if (wheels[i]) bits |= 1 << i;
    return bits;
  }

  function mul32(a, b) {
    var aLo = a & 65535;
    var aHi = a >>> 16;
    var bLo = b & 65535;
    var bHi = b >>> 16;
    return ((aLo * bLo) + (((aLo * bHi + aHi * bLo) & 65535) << 16)) >>> 0;
  }

  function fnv32(text) {
    var hash = 2166136261;
    var i;
    for (i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = mul32(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function videoFile(id, mime) {
    var ext = mime && mime.indexOf("mp4") >= 0 ? "mp4" : "webm";
    var slug = String(id).replace(/[^A-Za-z0-9._-]+/g, "_");
    if (slug.length > 48) slug = slug.slice(0, 48);
    return "videos/" + slug + "-" + fnv32(String(id)) + "." + ext;
  }

  function stopRecorder(session) {
    var recorder = session.recorder;
    var stream = session.stream;
    var chunks = session.chunks || [];
    var mime = session.videoMeta && session.videoMeta.mime || "video/webm";
    session.recorder = null;
    session.stream = null;
    function blob() {
      return chunks.length ? new Blob(chunks, { type: mime }) : null;
    }
    function endStream() {
      if (!stream) return;
      var tracks = stream.getTracks();
      var i;
      for (i = 0; i < tracks.length; i++) {
        try { tracks[i].stop(); } catch (err) {}
      }
    }
    if (!recorder || recorder.state === "inactive") {
      endStream();
      return Promise.resolve(blob());
    }
    return new Promise(function (resolve) {
      recorder.onstop = function () {
        endStream();
        resolve(blob());
      };
      try { recorder.stop(); } catch (err) {
        endStream();
        resolve(blob());
      }
    });
  }

  function startVideo(session) {
    session.chunks = [];
    session.videoBytes = 0;
    session.videoStarted = 0;
    session.videoMeta = { fps: VIDEO_FPS, mime: "video/webm", width: 0, height: 0, bits_per_second: VIDEO_BPS, truncated: false };
    var canvas = document.querySelector("canvas#screen");
    if (!canvas || !canvas.captureStream || typeof MediaRecorder === "undefined") return;
    var stream;
    try { stream = canvas.captureStream(VIDEO_FPS); } catch (err) { return; }
    session.stream = stream;
    session.videoMeta.width = canvas.width;
    session.videoMeta.height = canvas.height;
    var types = ["video/webm;codecs=vp8", "video/webm;codecs=vp9", "video/webm"];
    var mime = "";
    var i;
    for (i = 0; i < types.length; i++) {
      if (MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
    }
    var recorder;
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: VIDEO_BPS } : { videoBitsPerSecond: VIDEO_BPS });
    } catch (err) {
      stopRecorder(session);
      return;
    }
    var chunks = [];
    session.chunks = chunks;
    session.recorder = recorder;
    session.videoMeta.mime = recorder.mimeType || mime || "video/webm";
    recorder.ondataavailable = function (event) {
      if (!event.data || !event.data.size) return;
      chunks.push(event.data);
      session.videoBytes += event.data.size;
      if (session.videoBytes > VIDEO_MAX_BYTES && recorder.state === "recording") {
        session.videoMeta.truncated = true;
        try { recorder.stop(); } catch (err2) {}
      }
    };
    recorder.onerror = function () {};
    try {
      recorder.start(1000);
      session.videoStarted = performance.now();
      session.clock = session.videoStarted;
    } catch (err) {
      session.recorder = null;
      stopRecorder(session);
    }
  }

  function restartVideo(session) {
    stopRecorder(session);
    startVideo(session);
  }

  function pushTick(session, state, frame) {
    if (session.tickCount >= MAX_TICKS) {
      session.tickTruncated = true;
      return;
    }
    var controls = state.controls || {};
    var position = state.position || {};
    var quat = state.quaternion || {};
    var buf = session.tickBuf;
    buf.push(frame);
    buf.push(finite(state.speedKmh) ? +state.speedKmh : 0);
    buf.push(state.nextCheckpointIndex | 0);
    buf.push(controlBits(controls));
    buf.push(state.brakeLightEnabled ? 1 : 0);
    buf.push(wheelBits(state));
    buf.push(state.hasCheckpointToRespawnAt ? 1 : 0);
    buf.push(+position.x || 0);
    buf.push(+position.y || 0);
    buf.push(+position.z || 0);
    buf.push(+quat.x || 0);
    buf.push(+quat.y || 0);
    buf.push(+quat.z || 0);
    buf.push(quat.w != null ? +quat.w : 1);
    buf.push(finite(state.steering) ? +state.steering : 0);
    session.tickCount += 1;
  }

  function clearAttempt(session) {
    session.finished = false;
    session.acceptFinish = false;
    session.samples = [];
    session.tickBuf = [];
    session.tickCount = 0;
    session.tickTruncated = false;
    session.rowsTruncated = false;
    session.nextFrame = 0;
    restartVideo(session);
  }

  function takeState(state) {
    if (!state || state.id == null) return;
    var session = sessions[state.id];
    if (!session) return;
    var frame = state.frames | 0;
    // Reset keeps this car, so a finished lap has to open a new attempt.
    var restarted = frame < session.nextFrame - STEP_FRAMES || (session.finished && state.finishFrames == null);
    if (restarted) clearAttempt(session);
    if (state.finishFrames == null) session.acceptFinish = true;
    if (session.finished || !state.hasStarted) return;
    if (state.finishFrames != null && !session.acceptFinish) return;
    var lastTickFrame = session.tickCount ? session.tickBuf[(session.tickCount - 1) * TICK_FIELDS.length] : -1;
    if (frame !== lastTickFrame) pushTick(session, state, frame);
    var crossed = frame >= session.nextFrame;
    var finished = state.finishFrames != null;
    if (!crossed && !finished) return;
    var last = session.samples[session.samples.length - 1];
    if (!last || last.frames !== frame) {
      if (session.samples.length >= MAX_ROWS) session.rowsTruncated = true;
      else {
        session.samples.push({
          frames: frame,
          wall: round6((performance.now() - session.clock) / 1000),
          position: copyVec(state.position),
          quaternion: copyQuat(state.quaternion),
          wheels: (state.wheelContact || []).map(function (wheel) { return wheel != null; }),
          checkpoint: state.nextCheckpointIndex | 0,
          controls: {
            up: !!(state.controls && state.controls.up),
            down: !!(state.controls && state.controls.down),
            left: !!(state.controls && state.controls.left),
            right: !!(state.controls && state.controls.right),
            reset: !!(state.controls && state.controls.reset)
          },
          raw: snapshotState(state)
        });
      }
    }
    if (crossed) session.nextFrame = (Math.floor(frame / STEP_FRAMES) + 1) * STEP_FRAMES;
    if (finished) {
      session.finished = true;
      var samples = session.samples.slice();
      var tickBuf = session.tickBuf;
      var tickCount = session.tickCount;
      var job = {
        samples: samples,
        tickBuf: tickBuf,
        tickCount: tickCount,
        tickTruncated: session.tickTruncated,
        rowsTruncated: session.rowsTruncated,
        trackPromise: session.trackPromise,
        key: session.trackKey,
        save: session.trackSave,
        mountain: session.mountain,
        massOffset: session.massOffset,
        frames: state.finishFrames | 0,
        ok: determinismOk,
        video: session.videoMeta
      };
      var videoPromise = stopRecorder(session);
      setTimeout(function () {
        videoPromise.then(function (blob) {
          job.blob = job.ok ? blob : null;
          commit(job);
        }).catch(function () {});
      }, 0);
    }
  }

  function trackLabel() {
    var named = document.querySelector(".time-announcer .track-name");
    if (named && named.textContent) {
      var text = named.textContent.replace(/\s+/g, " ").trim();
      if (text) return text;
    }
    return "";
  }

  function runId(track, frames, rows) {
    var first = rows[0].n;
    var last = rows[rows.length - 1].n;
    return [track, frames, rows.length, first[0], first[2], last[0], last[2]].join("|");
  }

  function plainValue(value, depth) {
    if (value == null || depth > 4) return null;
    var kind = typeof value;
    var i;
    if (kind === "number") return finite(value) ? round6(+value) : null;
    if (kind === "boolean") return value;
    if (kind === "string") return value.length > 120 ? null : value;
    if (Array.isArray(value)) {
      if (value.length > 32) return null;
      var list = [];
      for (i = 0; i < value.length; i++) list.push(plainValue(value[i], depth + 1));
      return list;
    }
    if (kind === "object") {
      var out = {};
      var keys = Object.keys(value);
      for (i = 0; i < keys.length && i < 40; i++) {
        var key = keys[i];
        if (/token|nick|email|user/i.test(key)) continue;
        var copied = plainValue(value[key], depth + 1);
        if (copied !== null) out[key] = copied;
      }
      return out;
    }
    return null;
  }

  function gameSettings() {
    var out = {};
    try {
      var i;
      for (i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i) || "";
        if (key.indexOf("polytrack_v5_prod_") !== 0) continue;
        if (key.indexOf("settings") < 0 && key.indexOf("key_bindings") < 0) continue;
        var copied = plainValue(JSON.parse(localStorage.getItem(key)), 0);
        if (copied !== null) out[key] = copied;
      }
    } catch (err) {}
    return out;
  }

  function commit(job) {
    if (!job.ok || job.samples.length < 10) return;
    job.trackPromise.then(function (track) {
      var rows = buildRows(job.samples, layoutFromParts(track.parts || []));
      if (rows.length < 10) return;
      var name = trackLabel() || track.name || job.key;
      var id = runId(name, job.frames, rows);
      var mime = job.video && job.video.mime || "video/webm";
      var file = job.blob ? videoFile(id, mime) : null;
      var run = {
        kind: "run",
        id: id,
        game: "polytrack-0.6.3",
        version: 1,
        determinism: "ok",
        track: {
          name: name,
          author: track.author || "",
          save: job.save,
          environment: track.environment,
          environment_name: ENV_NAMES[track.environment] || null,
          sun: track.sun,
          sun_degrees: track.sun == null ? null : track.sun * 2,
          parts: track.parts || []
        },
        mountain: job.mountain,
        car_mass_offset: job.massOffset,
        settings: gameSettings(),
        seconds: round6(job.frames * 0.001),
        frames: job.frames,
        video: file,
        video_mime: file ? mime : null,
        video_fps: file ? VIDEO_FPS : null,
        video_width: job.video ? job.video.width : null,
        video_height: job.video ? job.video.height : null,
        video_truncated: !!(job.video && job.video.truncated),
        ticks_truncated: !!job.tickTruncated,
        rows_truncated: !!job.rowsTruncated,
        tick_fields: TICK_FIELDS,
        ticks: packTicks(job.tickBuf, job.tickCount),
        rows: rows
      };
      remember(run, job.blob);
    }).catch(function () {});
  }

  function saveOutbox(rec) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("outbox", "readwrite");
        tx.objectStore("outbox").put(rec);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function loadOutbox(id) {
    return openDb().then(function (db) {
      if (!db.objectStoreNames.contains("outbox")) return null;
      return new Promise(function (resolve) {
        var tx = db.transaction("outbox", "readonly");
        var request = tx.objectStore("outbox").get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  function loadOutboxAll() {
    return openDb().then(function (db) {
      if (!db.objectStoreNames.contains("outbox")) return [];
      return new Promise(function (resolve) {
        var tx = db.transaction("outbox", "readonly");
        var request = tx.objectStore("outbox").getAll();
        request.onsuccess = function () { resolve(request.result || []); };
        request.onerror = function () { resolve([]); };
      });
    }).catch(function () { return []; });
  }

  function gzipBlob(bytes) {
    var stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Response(stream).arrayBuffer().then(function (buf) {
      return new Blob([buf], { type: "application/gzip" });
    });
  }

  function encodeRun(run) {
    var bytes = new TextEncoder().encode(JSON.stringify(run));
    if (typeof CompressionStream !== "function") {
      return Promise.resolve({ blob: new Blob([bytes], { type: "application/json" }), name: "lap.json" });
    }
    return gzipBlob(bytes).then(function (blob) {
      return { blob: blob, name: "lap.json.gz" };
    });
  }

  function uploadFile(blob, name) {
    var body = new FormData();
    body.append("file", blob, name);
    body.append("expire", UPLOAD_EXPIRE);
    return fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: body }).then(function (res) {
      if (!res.ok) throw new Error("upload");
      return res.json();
    }).then(function (data) {
      var url = data && data.data && data.data.url;
      if (typeof url !== "string" || url.indexOf("https://tmpfiles.org/") !== 0) throw new Error("upload url");
      if (url.indexOf(name) < 0) throw new Error("upload name");
      return url;
    });
  }

  function notifyLap(payload) {
    return fetch("https://ntfy.sh/" + INBOX_TOPIC, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Priority: "min", Tags: "lap" }
    }).then(function (res) {
      if (!res.ok) throw new Error("notify");
    });
  }

  function uploadPair(run, blob) {
    return encodeRun(run).then(function (file) {
      return uploadFile(file.blob, file.name).then(function (jsonUrl) {
        var type = blob && blob.type ? String(blob.type) : "";
        if (!blob || !blob.size || blob.size > 40 * 1024 * 1024) return { json: jsonUrl, video: "" };
        var ext = type.indexOf("mp4") >= 0 ? "mp4" : "webm";
        return uploadFile(blob, "lap." + ext).then(function (videoUrl) {
          return { json: jsonUrl, video: videoUrl };
        }).catch(function () {
          return { json: jsonUrl, video: "" };
        });
      });
    });
  }

  function dueForSend(rec, now) {
    if (!rec || !rec.posts) return true;
    if (rec.posts >= MAX_POSTS) return false;
    return now - rec.lastPost >= REPOST_MS;
  }

  function publishLap(run, blob) {
    if (!run || !run.id || run.determinism !== "ok") return Promise.resolve();
    return loadOutbox(run.id).then(function (rec) {
      var now = Date.now();
      if (!dueForSend(rec, now)) return null;
      rec = rec || { id: run.id, posts: 0, lastPost: 0, jsonUrl: "", videoUrl: "", uploadedAt: 0 };
      var fresh = rec.jsonUrl && rec.uploadedAt && now - rec.uploadedAt < URL_FRESH_MS;
      var ready = fresh ? Promise.resolve(rec) : uploadPair(run, blob).then(function (urls) {
        rec.jsonUrl = urls.json;
        rec.videoUrl = urls.video || "";
        rec.uploadedAt = Date.now();
        return saveOutbox(rec).then(function () { return rec; });
      });
      return ready.then(function (saved) {
        if (!saved) return null;
        return notifyLap({ v: 1, id: run.id, json: saved.jsonUrl, video: saved.videoUrl || null }).then(function () {
          sendFailed = false;
          saved.posts = (saved.posts || 0) + 1;
          saved.lastPost = Date.now();
          paint();
          return saveOutbox(saved);
        });
      });
    }).catch(function () {
      sendFailed = true;
      paint();
    });
  }

  function schedulePublish(run, blob) {
    publishChain = publishChain.then(function () {
      return publishLap(run, blob);
    }).catch(function () {});
  }

  function retryOutbox() {
    loadOutboxAll().then(function (rows) {
      var byId = {};
      var i;
      for (i = 0; i < rows.length; i++) if (rows[i] && rows[i].id) byId[rows[i].id] = rows[i];
      var now = Date.now();
      for (i = 0; i < memoryRuns.length; i++) {
        (function (run) {
          var rec = byId[run.id];
          if (!dueForSend(rec, now)) return;
          var fresh = rec && rec.jsonUrl && rec.uploadedAt && now - rec.uploadedAt < URL_FRESH_MS;
          var videoJob = fresh ? Promise.resolve(null) : loadVideo(run.id);
          videoJob.then(function (video) { schedulePublish(run, video); }).catch(function () {});
        })(memoryRuns[i]);
      }
    }).catch(function () {});
  }

  function remember(run, blob) {
    var i;
    for (i = 0; i < memoryRuns.length; i++) if (memoryRuns[i].id === run.id) return;
    memoryRuns.push(run);
    paint();
    var stored = saveLocal(run).catch(function () {});
    var videoStored = blob ? saveVideo(run.id, blob).catch(function () {}) : Promise.resolve();
    Promise.all([stored, videoStored]).then(function () {
      schedulePublish(run, blob || null);
    });
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error("no indexedDB"));
        return;
      }
      var request = window.indexedDB.open("polytrack-063-dataset", 1);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains("runs")) db.createObjectStore("runs", { keyPath: "id" });
        if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
        if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { keyPath: "id" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function saveLocal(run) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("runs", "readwrite");
        tx.objectStore("runs").put(run);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function saveVideo(id, blob) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("videos", "readwrite");
        tx.objectStore("videos").put(blob, id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function loadVideo(id) {
    return openDb().then(function (db) {
      if (!db.objectStoreNames.contains("videos")) return null;
      return new Promise(function (resolve) {
        var tx = db.transaction("videos", "readonly");
        var request = tx.objectStore("videos").get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  function loadLocal() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("runs", "readonly");
        var request = tx.objectStore("runs").getAll();
        request.onsuccess = function () { resolve(request.result || []); };
        request.onerror = function () { reject(request.error); };
      });
    }).catch(function () { return []; });
  }

  function loadPublished() {
    return fetch("dataset/runs.jsonl", { cache: "no-cache" }).then(function (response) {
      if (!response.ok) return [];
      return response.text();
    }).then(function (text) {
      var runs = [];
      var lines = String(text || "").split("\n");
      var i;
      for (i = 0; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        try {
          var row = JSON.parse(lines[i]);
          if (row && row.kind === "run" && row.game === "polytrack-0.6.3" && row.version === 1 && row.id && row.determinism === "ok" && row.rows && row.rows.length) runs.push(row);
        } catch (err) {}
      }
      return runs;
    }).catch(function () { return []; });
  }

  function allRuns() {
    var seen = {};
    var runs = [];
    function add(list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (!list[i] || seen[list[i].id]) continue;
        seen[list[i].id] = 1;
        runs.push(list[i]);
      }
    }
    add(publishedRuns);
    add(memoryRuns);
    return runs;
  }

  function exportText() {
    var lines = [JSON.stringify(HEADER)];
    var runs = allRuns();
    var i;
    for (i = 0; i < runs.length; i++) lines.push(JSON.stringify(runs[i]));
    return lines.join("\n") + "\n";
  }

  var packing = false;

  function download() {
    if (packing) return;
    packing = true;
    setLabel("Dataset · packing");
    var runs = allRuns();
    var videos = [];
    var chain = Promise.resolve();
    var i;
    for (i = 0; i < runs.length; i++) {
      (function (run) {
        chain = chain.then(function () {
          if (!run.video) return null;
          return loadVideo(run.id).then(function (blob) {
            if (!blob) return null;
            return blob.arrayBuffer().then(function (buffer) {
              videos.push({ name: run.video, data: new Uint8Array(buffer) });
            });
          });
        });
      })(runs[i]);
    }
    chain.then(function () {
      var encoder = new TextEncoder();
      var files = [
        { name: "README.md", data: encoder.encode(DATASET_README) },
        { name: "runs.jsonl", data: encoder.encode(exportText()) }
      ];
      var n;
      for (n = 0; n < videos.length; n++) files.push(videos[n]);
      return zipFiles(files);
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "polytrack-0.6.3-dataset.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }).catch(function () {}).then(function () {
      packing = false;
      paint();
    });
  }

  function framed() {
    try { return window.parent && window.parent !== window; } catch (err) { return false; }
  }

  function notifyParent() {
    if (!framed()) return;
    try {
      window.parent.postMessage({
        type: "polytrack-dataset",
        label: labelNode ? labelNode.nodeValue : "",
        title: button ? button.title : ""
      }, window.location.origin);
    } catch (err) {}
  }

  function setLabel(text) {
    if (labelNode) labelNode.nodeValue = text;
    notifyParent();
  }

  function paint() {
    if (!button) return;
    var count = allRuns().length;
    var label = count === 1 ? "Dataset · 1 lap" : "Dataset · " + count + " laps";
    if (sendFailed && count) label += " · not sent";
    setLabel(label);
  }

  function mount() {
    if (button || !document.body) return;
    button = document.createElement("button");
    button.type = "button";
    button.id = "polytrack-063-dataset";
    button.title = "Good data from Polytrack 0.6.3 is saved here and sent to the 0.6.3 archive. Click to download a zip.";
    labelNode = document.createTextNode("");
    button.appendChild(labelNode);
    button.addEventListener("mousedown", function (event) {
      event.preventDefault();
    });
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      download();
    });
    window.addEventListener("message", function (event) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "polytrack-dataset-download") return;
      if (event.source !== window.parent) return;
      download();
    });
    if (!framed()) {
      document.body.appendChild(button);
      var style = document.createElement("style");
      style.textContent = "#polytrack-063-dataset{position:fixed;left:12px;bottom:12px;z-index:40;margin:0;padding:6px 10px;border:0;background:#28346a;color:#fff;font:16px/1.2 sans-serif;cursor:pointer;pointer-events:auto;}#polytrack-063-dataset:hover{background:#334b77;}";
      document.head.appendChild(style);
    }
    paint();
  }

  function keepCanvasFrames() {
    var proto = window.HTMLCanvasElement && HTMLCanvasElement.prototype;
    if (!proto || proto.__polytrack063DatasetContext) return;
    var native = proto.getContext;
    proto.getContext = function (kind, options) {
      var name = String(kind || "");
      if (name === "webgl" || name === "webgl2" || name === "experimental-webgl") {
        var next = {};
        var key;
        if (options) {
          for (key in options) if (Object.prototype.hasOwnProperty.call(options, key)) next[key] = options[key];
        }
        next.preserveDrawingBuffer = true;
        return native.call(this, kind, next);
      }
      return native.apply(this, arguments);
    };
    proto.__polytrack063DatasetContext = true;
  }

  function boot() {
    keepCanvasFrames();
    var NativeWorker = window.Worker;
    function RecordingWorker(spec, options) {
      var worker = new NativeWorker(spec, options);
      try {
        var name = spec && spec.url ? String(spec.url) : String(spec);
        if (name.indexOf("simulation_worker.bundle.js") !== -1) watch(worker);
      } catch (err) {}
      return worker;
    }
    RecordingWorker.prototype = NativeWorker.prototype;
    window.Worker = RecordingWorker;
    window.polytrackDataset = {
      exportText: exportText,
      actionId: actionId,
      names: NAMES,
      actions: ACTIONS,
      runs: allRuns,
      download: download
    };
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
    loadPublished().then(function (runs) {
      publishedRuns = runs;
      return loadLocal();
    }).then(function (runs) {
      var i;
      for (i = 0; i < runs.length; i++) {
        if (!runs[i] || runs[i].determinism !== "ok") continue;
        var known = false;
        var j;
        for (j = 0; j < memoryRuns.length; j++) if (memoryRuns[j].id === runs[i].id) known = true;
        if (!known) memoryRuns.push(runs[i]);
      }
      paint();
      retryOutbox();
      setTimeout(retryOutbox, 20000);
      setTimeout(retryOutbox, 80000);
    }).catch(function () {});
  }

  boot();
})(typeof globalThis !== "undefined" ? globalThis : this);

# Polytrack 0.5.2 good data

Good data from Polytrack 0.5.2. A run is included only when that browser's determinism check passed.

Good data is uploaded for the site owner as well as saved in this zip. Profile names are not included. Polytrack 0.6.3 is a separate dataset and is not in this zip. A run that fails the determinism check is not uploaded.

## Files

- `runs.jsonl` is one JSON object per line. The first line is the header (`kind` is `header`). Each later line is one lap (`kind` is `run`).
- `videos/<id>.webm` is the canvas recording named by the lap's `video` field. That field is null when the browser could not record.

## Time

- `t` and `frames` are physics time. The car steps every millisecond, so seconds are `frames * 0.001`.
- `rows` are every 50 ms and include the full posted car state.
- `ticks` are every 1 ms, capped at 5 minutes. Column names are `tick_fields` in the header.
- `wall` on a row is seconds since the video started. `t` stays still while the simulation is paused. `wall` does not.

## Lap row

`game` is `polytrack-0.5.2` and `version` is 2.

`action` is the w/a/s/d combination at that physics frame: 0 none, 1 a, 2 d, 3 w, 4 wa, 5 wd, 6 s, 7 sa, 8 sd, and -1 while reset is held. Changes between rows are in `ticks`.

`n` is the 19 scaled numbers named in the header. `scales` says the divisors. `velocity` and `acceleration` are the same derivatives in m/s and m/s^2.

`car` is every field the 0.5.2 worker posts: speed, pose, quaternion, checkpoint, respawn flag, brake light, controls, collision impulses, and for each wheel the contact point and normal, suspension length and velocity, rotation, delta rotation, skid, position, and quaternion. Wheel order is FL, FR, BL, BR.

## Track and car

`track.save` is the game's own track string. `track.parts` is that string decoded. A part's world position is its grid index times 5 meters. `track.environment` is 0 Summer, 1 Winter, 2 Desert. `track.sun_degrees` is twice the stored sun byte.

`mountain` is the generated terrain's offset and vertex count. The mesh is a function of the track bounds and `header.mountain`.

`header.vehicle` is the fixed car: mass, wheel positions, suspension, engine, brake, steering, and the collision-shape checksum.

`settings` is this browser's graphics, audio, camera, and key bindings. Profile names, ghosts, and saved tracks are left out.

## Video

WebM at 30 fps, VP8 when the browser allows it, about 1 Mbps, from the game canvas. There is no game audio. The recording stops at 40 MB and `video_truncated` is then true.

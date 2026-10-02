function createPano(canvas) {
  var gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
  var yaw = 0;
  var pitch = 0;
  var fov = 78;
  var ready = false;
  var fail = '';

  function compile(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'shader');
    }
    return shader;
  }

  if (!gl) fail = 'This browser cannot show a 360 photo.';
  var program = null;
  var locs = {};
  var tex = null;
  if (gl) {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER,
      'attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}'));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, [
      'precision mediump float;',
      'varying vec2 v;',
      'uniform sampler2D uTex;',
      'uniform vec2 uRes;',
      'uniform float uYaw;',
      'uniform float uPitch;',
      'uniform float uFov;',
      'const float PI=3.141592653589793;',
      'void main(){',
      '  vec2 ndc=vec2(v.x*2.0-1.0,v.y*2.0-1.0);',
      '  float aspect=uRes.x/max(uRes.y,1.0);',
      '  float th=tan(radians(uFov)*0.5);',
      '  vec3 dir=normalize(vec3(ndc.x*aspect*th, ndc.y*th, -1.0));',
      '  float cp=cos(uPitch), sp=sin(uPitch);',
      '  dir=vec3(dir.x, dir.y*cp-dir.z*sp, dir.y*sp+dir.z*cp);',
      '  float cy=cos(uYaw), sy=sin(uYaw);',
      '  dir=vec3(cy*dir.x+sy*dir.z, dir.y, -sy*dir.x+cy*dir.z);',
      '  float lon=atan(dir.x,-dir.z);',
      '  float lat=asin(clamp(dir.y,-1.0,1.0));',
      '  vec2 tuv=vec2(fract(lon/(2.0*PI)+0.5), clamp(0.5-lat/PI, 0.001, 0.999));',
      '  gl_FragColor=texture2D(uTex, tuv);',
      '}'
    ].join('\n')));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fail = gl.getProgramInfoLog(program) || 'Could not start the 360 view.';
    }
    gl.useProgram(program);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    locs.res = gl.getUniformLocation(program, 'uRes');
    locs.yaw = gl.getUniformLocation(program, 'uYaw');
    locs.pitch = gl.getUniformLocation(program, 'uPitch');
    locs.fov = gl.getUniformLocation(program, 'uFov');
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  function resize() {
    var parent = canvas.parentElement || canvas;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.floor(parent.clientWidth * dpr));
    var h = Math.max(2, Math.floor(parent.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }

  var onView = null;

  function draw() {
    if (!gl || !program) return;
    gl.useProgram(program);
    gl.uniform2f(locs.res, canvas.width, canvas.height);
    gl.uniform1f(locs.yaw, yaw);
    gl.uniform1f(locs.pitch, pitch);
    gl.uniform1f(locs.fov, fov);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (onView) onView(yaw, pitch, fov);
  }

  function nudge(dyaw, dpitch) {
    yaw += dyaw;
    pitch = Math.max(-1.25, Math.min(1.25, pitch + dpitch));
    draw();
  }

  function zoomFov(mult) {
    fov = Math.max(28, Math.min(110, fov * mult));
    draw();
  }

  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var moved = false;
  canvas.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0) return;
    dragging = true;
    moved = false;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    var dx = ev.clientX - lastX;
    var dy = ev.clientY - lastY;
    if (dx * dx + dy * dy > 4) moved = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    // Grab the photo, the way Street View does. The picture follows the pointer.
    // +yaw looks left and +pitch looks up, so both deltas keep their sign.
    var sens = 0.0032 * (fov / 75);
    nudge(dx * sens, dy * sens);
  });
  canvas.addEventListener('pointerup', function () { dragging = false; });
  canvas.addEventListener('pointercancel', function () { dragging = false; });
  canvas.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    zoomFov(ev.deltaY > 0 ? 1.08 : 0.92);
  }, { passive: false });

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement || canvas);

  return {
    get fov() { return fov; },
    get yaw() { return yaw; },
    get moved() { return moved; },
    set onView(fn) { onView = fn; },
    fail: fail,
    resize: resize,
    nudge: nudge,
    zoomFov: zoomFov,
    reset: function () {
      yaw = 0;
      pitch = 0;
      fov = 78;
      moved = false;
      draw();
    },
    load: function (url, onDone) {
      ready = false;
      var img = new Image();
      img.onload = function () {
        if (!gl) { if (onDone) onDone(new Error(fail)); return; }
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } catch (err) {
          if (onDone) onDone(err);
          return;
        }
        ready = true;
        draw();
        if (onDone) onDone(null);
      };
      img.onerror = function () { if (onDone) onDone(new Error('Could not load the panorama.')); };
      img.src = url;
    }
  };
}

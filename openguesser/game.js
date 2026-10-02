(function () {
  var ROUNDS = 5;
  var NS = 'http://www.w3.org/2000/svg';
  var SHORT = {
    'United States of America': 'United States',
    'United Republic of Tanzania': 'Tanzania',
    'Democratic Republic of the Congo': 'DR Congo',
    'Republic of the Congo': 'Congo',
    'Central African Republic': 'C. African Rep.',
    'Dominican Republic': 'Dominican Rep.',
    'Bosnia and Herzegovina': 'Bosnia',
    'Republic of Serbia': 'Serbia',
    'French Southern and Antarctic Lands': 'Fr. S. Antarctic',
    'Equatorial Guinea': 'Eq. Guinea',
    'United Arab Emirates': 'UAE'
  };
  var map = document.getElementById('map');
  var mapWrap = document.getElementById('map-wrap');
  var canvas = document.getElementById('view');
  var pano = createPano(canvas);
  var statusEl = document.getElementById('status');
  var totalEl = document.getElementById('total');
  var resultEl = document.getElementById('result');
  var hint = document.getElementById('map-hint');
  var lookHint = document.getElementById('look-hint');
  var loadingEl = document.getElementById('loading');
  var guessBtn = document.getElementById('guess');
  var nextBtn = document.getElementById('next');
  var againBtn = document.getElementById('again');
  var stage = document.getElementById('stage');
  var endEl = document.getElementById('end');
  var creditBox = document.getElementById('credits');
  var creditList = document.getElementById('credit-list');

  var deck = [];
  var round = 0;
  var score = 0;
  var pin = null;
  var locked = false;
  var history = [];
  var marks;
  var labelLayer;
  var view = { cx: WORLD.w / 2, cy: WORLD.h / 2, w: WORLD.w };
  var drag = null;
  var markers = null;
  var countries = [];

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function project(lon, lat) {
    return {
      x: ((lon + 180) / 360) * WORLD.w,
      y: ((WORLD.lat0 - lat) / (WORLD.lat0 - WORLD.lat1)) * WORLD.h
    };
  }

  function unproject(x, y) {
    return {
      lon: (x / WORLD.w) * 360 - 180,
      lat: WORLD.lat0 - (y / WORLD.h) * (WORLD.lat0 - WORLD.lat1)
    };
  }

  function inside(ring, x, y) {
    var hit = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) hit = !hit;
    }
    return hit;
  }

  function countryAt(x, y) {
    var best = 64;
    var name = '';
    for (var i = 0; i < WORLD.countries.length; i++) {
      var rings = WORLD.countries[i].r;
      for (var r = 0; r < rings.length; r++) {
        if (inside(rings[r], x, y)) return WORLD.countries[i].n;
        var ring = rings[r];
        for (var p = 0; p < ring.length; p++) {
          var dx = ring[p][0] - x;
          var dy = ring[p][1] - y;
          var d = dx * dx + dy * dy;
          if (d < best) { best = d; name = WORLD.countries[i].n; }
        }
      }
    }
    return name;
  }

  function kmBetween(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var la1 = a.lat * Math.PI / 180;
    var la2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function pointsFor(km) {
    return Math.round(5000 * Math.exp(-km / 1500));
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function placeName(place) {
    return place.title.replace(/\.[a-z0-9]+$/i, '');
  }

  function labelFor(name) {
    return SHORT[name] || name;
  }

  function ringBox(ring) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, sx = 0, sy = 0;
    for (var i = 0; i < ring.length; i++) {
      var x = ring[i][0], y = ring[i][1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      sx += x;
      sy += y;
    }
    return { cx: sx / ring.length, cy: sy / ring.length, w: maxX - minX, h: maxY - minY, area: (maxX - minX) * (maxY - minY) };
  }

  function drawMap() {
    var ocean = el('rect', { x: -200, y: -200, width: WORLD.w + 400, height: WORLD.h + 400, fill: '#16324f' });
    map.appendChild(ocean);
    var lands = el('g');
    WORLD.countries.forEach(function (c) {
      var d = '';
      var best = null;
      c.r.forEach(function (ring) {
        var box = ringBox(ring);
        if (!best || box.area > best.area) best = box;
        ring.forEach(function (p, i) { d += (i ? 'L' : 'M') + p[0] + ' ' + p[1]; });
        d += 'Z';
      });
      var path = el('path', {
        d: d, fill: '#1f7a52', stroke: '#0c3324', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke'
      });
      lands.appendChild(path);
      if (best && best.w > 8 && best.h > 6) {
        countries.push({ n: c.n, cx: best.cx, cy: best.cy, w: best.w, h: best.h, area: best.area });
      }
    });
    var rank = {
      'United States of America': 0, China: 1, Brazil: 2, Russia: 3, Australia: 4,
      India: 5, Canada: 6, Mexico: 7, Argentina: 8, 'South Africa': 9,
      Japan: 10, Indonesia: 11, France: 12, 'United Kingdom': 13, Germany: 14,
      Egypt: 15, Nigeria: 16
    };
    countries.sort(function (a, b) {
      var ra = rank[a.n] == null ? 50 : rank[a.n];
      var rb = rank[b.n] == null ? 50 : rank[b.n];
      return ra - rb || b.area - a.area;
    });
    map.appendChild(lands);
    labelLayer = el('g', { 'pointer-events': 'none' });
    map.appendChild(labelLayer);
    marks = el('g', { 'pointer-events': 'none' });
    map.appendChild(marks);
  }

  function viewHeight() {
    var rect = map.getBoundingClientRect();
    var aspect = rect.width / Math.max(1, rect.height);
    return view.w / aspect;
  }

  function applyView() {
    var rect = map.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    var h = viewHeight();
    var x = view.cx - view.w / 2;
    var y = view.cy - h / 2;
    map.setAttribute('viewBox', x + ' ' + y + ' ' + view.w + ' ' + h);
    map.setAttribute('preserveAspectRatio', 'none');
    updateLabels();
    redrawMarks();
  }

  function resetView() {
    view.cx = WORLD.w / 2;
    view.cy = WORLD.h / 2;
    view.w = WORLD.w;
    applyView();
  }

  function zoomAt(svgX, svgY, factor) {
    var next = Math.max(36, Math.min(WORLD.w, view.w * factor));
    var k = next / view.w;
    view.cx = svgX + (view.cx - svgX) * k;
    view.cy = svgY + (view.cy - svgY) * k;
    view.w = next;
    applyView();
  }

  function clientToSvg(ev) {
    var pt = map.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    var ctm = map.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function pinR() {
    var rect = map.getBoundingClientRect();
    return Math.max(2.2, 9 * view.w / Math.max(1, rect.width));
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function addText(x, y, text, size, fill) {
    var node = el('text', {
      x: x, y: y, 'text-anchor': 'middle', 'font-size': size, fill: fill,
      stroke: '#071018', 'stroke-width': size * 0.22, 'font-family': 'system-ui, Segoe UI, sans-serif',
      'font-weight': '700', 'paint-order': 'stroke'
    });
    node.textContent = text;
    labelLayer.appendChild(node);
    return node;
  }

  function updateLabels() {
    clearNode(labelLayer);
    var rect = map.getBoundingClientRect();
    var h = viewHeight();
    var x0 = view.cx - view.w / 2;
    var y0 = view.cy - h / 2;
    var px = rect.width / view.w;
    var font = 13 / px;
    var placed = [];
    function free(sx, sy, gap) {
      for (var i = 0; i < placed.length; i++) {
        var dx = placed[i][0] - sx;
        var dy = placed[i][1] - sy;
        if (dx * dx + dy * dy < gap * gap) return false;
      }
      return true;
    }
    countries.forEach(function (c) {
      if (c.cx < x0 || c.cx > x0 + view.w || c.cy < y0 || c.cy > y0 + h) return;
      if (c.w * px < 36 || c.h * px < 14) return;
      var sx = (c.cx - x0) * px;
      var sy = (c.cy - y0) * px;
      if (!free(sx, sy, 32)) return;
      addText(c.cx, c.cy, labelFor(c.n), font, '#f4f8ff');
      placed.push([sx, sy]);
    });
    if (view.w < 720) {
      var cityFont = 12 / px;
      CITIES.forEach(function (city) {
        var p = project(city[2], city[1]);
        if (p.x < x0 || p.x > x0 + view.w || p.y < y0 || p.y > y0 + h) return;
        var sx = (p.x - x0) * px;
        var sy = (p.y - y0) * px;
        if (!free(sx, sy, 36)) return;
        addText(p.x, p.y + cityFont * 0.3, city[0], cityFont, '#ffe08a');
        placed.push([sx, sy]);
      });
    }
  }

  function redrawMarks() {
    clearNode(marks);
    if (!markers) return;
    var r = pinR();
    if (markers.answer) {
      marks.appendChild(el('line', {
        x1: markers.guess.x, y1: markers.guess.y, x2: markers.answer.x, y2: markers.answer.y,
        stroke: '#ffd84a', 'stroke-width': String(Math.max(0.6, r * 0.22)), 'stroke-dasharray': (r * 0.7) + ' ' + (r * 0.45)
      }));
    }
    function dot(p, fill) {
      marks.appendChild(el('circle', {
        cx: p.x, cy: p.y, r: r, fill: fill, stroke: '#fff', 'stroke-width': String(Math.max(0.4, r * 0.22))
      }));
    }
    dot(markers.guess, '#ffd84a');
    if (markers.answer) dot(markers.answer, '#ff5b5b');
  }

  function placePin(ev) {
    if (locked) return;
    var p = clientToSvg(ev);
    if (!p) return;
    if (p.y < -30 || p.y > WORLD.h + 30 || p.x < -30 || p.x > WORLD.w + 30) return;
    pin = { x: p.x, y: p.y, geo: unproject(p.x, p.y) };
    markers = { guess: pin, answer: null };
    redrawMarks();
    guessBtn.disabled = false;
    var where = countryAt(pin.x, pin.y);
    resultEl.textContent = where ? ('Pin is in ' + where + '.') : 'Pin is in the ocean.';
  }

  function showRound() {
    var place = deck[round];
    pin = null;
    locked = false;
    markers = null;
    redrawMarks();
    resetView();
    pano.reset();
    lookHint.classList.remove('hide');
    loadingEl.classList.remove('hide');
    loadingEl.textContent = 'Loading panorama…';
    pano.load(place.file, function (err) {
      loadingEl.classList.add('hide');
      if (err) {
        loadingEl.textContent = err.message;
        loadingEl.classList.remove('hide');
      }
    });
    statusEl.textContent = 'Round ' + (round + 1) + ' of ' + deck.length;
    resultEl.textContent = 'Drag the photo to look around, then pin the map.';
    hint.classList.remove('hide');
    guessBtn.disabled = true;
    guessBtn.classList.remove('hide');
    nextBtn.classList.add('hide');
    againBtn.classList.add('hide');
    stage.classList.remove('hide');
    endEl.classList.add('hide');
    mapWrap.classList.remove('hide');
  }

  function finishGuess() {
    if (!pin || locked) return;
    locked = true;
    var place = deck[round];
    var answer = project(place.lon, place.lat);
    var km = kmBetween(pin.geo, place);
    var pts = pointsFor(km);
    score += pts;
    var miles = km * 0.621371;
    var where = countryAt(answer.x, answer.y);
    history.push({ place: place, km: km, pts: pts, where: where });
    markers = { guess: pin, answer: answer };
    redrawMarks();
    totalEl.textContent = score + ' pts';
    var dist = km < 1 ? 'under 1 km' : (Math.round(km).toLocaleString() + ' km / ' + Math.round(miles).toLocaleString() + ' mi');
    var placeLabel = where ? (placeName(place) + ' · ' + where) : placeName(place);
    resultEl.innerHTML = '';
    resultEl.appendChild(document.createTextNode(pts + ' pts · ' + dist + ' off. ' + placeLabel + '. Photo by ' + place.author + ' (' + place.license + '). '));
    var link = document.createElement('a');
    link.href = place.source;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Source';
    resultEl.appendChild(link);
    guessBtn.classList.add('hide');
    hint.classList.add('hide');
    nextBtn.textContent = (round + 1 >= deck.length) ? 'Results' : 'Next';
    nextBtn.classList.remove('hide');
  }

  function showEnd() {
    endEl.classList.remove('hide');
    mapWrap.classList.add('hide');
    guessBtn.classList.add('hide');
    nextBtn.classList.add('hide');
    againBtn.classList.remove('hide');
    statusEl.textContent = 'Game over';
    var best = 0;
    try { best = Number(localStorage.getItem('sg-openguesser-best') || 0); } catch (e) {}
    if (score > best) {
      best = score;
      try { localStorage.setItem('sg-openguesser-best', String(best)); } catch (e) {}
    }
    var max = deck.length * 5000;
    endEl.innerHTML = '';
    var h = document.createElement('h1');
    h.textContent = score.toLocaleString() + ' / ' + max.toLocaleString();
    var sub = document.createElement('div');
    sub.textContent = 'Best on this browser: ' + best.toLocaleString();
    var list = document.createElement('ol');
    history.forEach(function (row) {
      var li = document.createElement('li');
      li.textContent = placeName(row.place) + (row.where ? ' · ' + row.where : '') +
        ' — ' + row.pts + ' pts, ' + Math.round(row.km).toLocaleString() + ' km off';
      list.appendChild(li);
    });
    endEl.appendChild(h);
    endEl.appendChild(sub);
    endEl.appendChild(list);
    resultEl.textContent = 'Five rounds. Closer pins score more, up to 5,000 each.';
  }

  function start() {
    deck = shuffle(PLACES).slice(0, Math.min(ROUNDS, PLACES.length));
    round = 0;
    score = 0;
    history = [];
    totalEl.textContent = '0 pts';
    showRound();
  }

  function fillCredits() {
    creditList.innerHTML = '';
    PLACES.forEach(function (place) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(place.author + ' · ' + place.license + ' · '));
      var link = document.createElement('a');
      link.href = place.source;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Wikimedia Commons';
      li.appendChild(link);
      creditList.appendChild(li);
    });
  }

  map.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0) return;
    map.setPointerCapture(ev.pointerId);
    drag = { x: ev.clientX, y: ev.clientY, cx: view.cx, cy: view.cy, moved: false };
  });
  map.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.x;
    var dy = ev.clientY - drag.y;
    if (dx * dx + dy * dy > 16) drag.moved = true;
    if (!drag.moved) return;
    var rect = map.getBoundingClientRect();
    var scale = view.w / Math.max(1, rect.width);
    view.cx = drag.cx - dx * scale;
    view.cy = drag.cy - dy * scale;
    applyView();
  });
  function endDrag(ev) {
    if (!drag) return;
    var moved = drag.moved;
    drag = null;
    if (!moved) placePin(ev);
  }
  map.addEventListener('pointerup', endDrag);
  map.addEventListener('pointercancel', function () { drag = null; });
  mapWrap.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var p = clientToSvg(ev);
    if (!p) return;
    zoomAt(p.x, p.y, ev.deltaY > 0 ? 1.16 : 1 / 1.16);
  }, { passive: false });
  document.getElementById('zoom-in').addEventListener('click', function (ev) {
    ev.stopPropagation();
    zoomAt(view.cx, view.cy, 1 / 1.35);
  });
  document.getElementById('zoom-out').addEventListener('click', function (ev) {
    ev.stopPropagation();
    zoomAt(view.cx, view.cy, 1.35);
  });
  document.getElementById('map-grow').addEventListener('click', function (ev) {
    ev.stopPropagation();
    mapWrap.classList.toggle('big');
    requestAnimationFrame(applyView);
  });
  canvas.addEventListener('pointermove', function () {
    if (pano.moved) lookHint.classList.add('hide');
  });
  guessBtn.addEventListener('click', finishGuess);
  nextBtn.addEventListener('click', function () {
    round += 1;
    if (round >= deck.length) showEnd();
    else showRound();
  });
  againBtn.addEventListener('click', start);
  document.getElementById('credit-btn').addEventListener('click', function () { creditBox.classList.remove('hide'); });
  document.getElementById('credit-close').addEventListener('click', function () { creditBox.classList.add('hide'); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !guessBtn.disabled && !guessBtn.classList.contains('hide')) {
      finishGuess();
      return;
    }
    var step = 0.09 * (pano.fov / 75);
    if (ev.key === 'ArrowLeft') { pano.nudge(step, 0); lookHint.classList.add('hide'); ev.preventDefault(); }
    else if (ev.key === 'ArrowRight') { pano.nudge(-step, 0); lookHint.classList.add('hide'); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { pano.nudge(0, step); lookHint.classList.add('hide'); ev.preventDefault(); }
    else if (ev.key === 'ArrowDown') { pano.nudge(0, -step); lookHint.classList.add('hide'); ev.preventDefault(); }
  });

  if (pano.fail) {
    loadingEl.textContent = pano.fail;
    loadingEl.classList.remove('hide');
  }
  drawMap();
  fillCredits();
  pano.resize();
  if (window.ResizeObserver) new ResizeObserver(function () { applyView(); }).observe(mapWrap);
  window.addEventListener('resize', applyView);
  if (!PLACES.length) {
    resultEl.textContent = 'No panoramas are installed.';
  } else {
    start();
  }
})();

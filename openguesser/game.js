(function () {
  var ROUNDS = 5;
  var NS = 'http://www.w3.org/2000/svg';
  var map = document.getElementById('map');
  var photo = document.getElementById('photo');
  var statusEl = document.getElementById('status');
  var totalEl = document.getElementById('total');
  var resultEl = document.getElementById('result');
  var hint = document.getElementById('map-hint');
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

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function drawMap() {
    map.setAttribute('viewBox', '0 0 ' + WORLD.w + ' ' + WORLD.h);
    map.appendChild(el('rect', { width: WORLD.w, height: WORLD.h, fill: '#16324f' }));
    var lands = el('g');
    WORLD.countries.forEach(function (c) {
      var d = '';
      c.r.forEach(function (ring) {
        ring.forEach(function (p, i) { d += (i ? 'L' : 'M') + p[0] + ' ' + p[1]; });
        d += 'Z';
      });
      lands.appendChild(el('path', { d: d, fill: '#1f7a52', stroke: '#0c3324', 'stroke-width': 0.6 }));
    });
    map.appendChild(lands);
    marks = el('g');
    map.appendChild(marks);
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

  function clearMarks() {
    while (marks.firstChild) marks.removeChild(marks.firstChild);
  }

  function addPin(x, y, fill) {
    marks.appendChild(el('circle', {
      cx: x, cy: y, r: 7, fill: fill, stroke: '#fff', 'stroke-width': 2
    }));
  }

  function showRound() {
    var place = deck[round];
    pin = null;
    locked = false;
    clearMarks();
    photo.src = place.file;
    photo.alt = '';
    statusEl.textContent = 'Round ' + (round + 1) + ' of ' + deck.length;
    resultEl.textContent = 'Look around the photo, then drop a pin.';
    hint.classList.remove('hide');
    hint.textContent = 'Click where this photo was taken';
    guessBtn.disabled = true;
    guessBtn.classList.remove('hide');
    nextBtn.classList.add('hide');
    againBtn.classList.add('hide');
    stage.classList.remove('hide');
    endEl.classList.add('hide');
  }

  function onMapClick(ev) {
    if (locked) return;
    var pt = map.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    var ctm = map.getScreenCTM();
    if (!ctm) return;
    var p = pt.matrixTransform(ctm.inverse());
    if (p.x < 0 || p.y < 0 || p.x > WORLD.w || p.y > WORLD.h) return;
    pin = { x: p.x, y: p.y, geo: unproject(p.x, p.y) };
    clearMarks();
    addPin(pin.x, pin.y, '#ffd84a');
    guessBtn.disabled = false;
    var where = countryAt(pin.x, pin.y);
    resultEl.textContent = where ? ('Pin is in ' + where + '.') : 'Pin is in the ocean.';
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
    clearMarks();
    marks.appendChild(el('line', {
      x1: pin.x, y1: pin.y, x2: answer.x, y2: answer.y,
      stroke: '#ffd84a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3'
    }));
    addPin(pin.x, pin.y, '#ffd84a');
    addPin(answer.x, answer.y, '#ff5b5b');
    totalEl.textContent = score + ' pts';
    var dist = km < 1 ? 'under 1 km' : (Math.round(km).toLocaleString() + ' km / ' + Math.round(miles).toLocaleString() + ' mi');
    var placeLabel = where ? (placeName(place) + ' · ' + where) : placeName(place);
    photo.alt = placeLabel;
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
    if (round + 1 >= deck.length) {
      nextBtn.textContent = 'Results';
    } else {
      nextBtn.textContent = 'Next';
    }
    nextBtn.classList.remove('hide');
  }

  function showEnd() {
    stage.classList.add('hide');
    endEl.classList.remove('hide');
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

  map.addEventListener('click', onMapClick);
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
    if (ev.key === 'Enter' && !guessBtn.disabled && !guessBtn.classList.contains('hide')) finishGuess();
  });

  drawMap();
  fillCredits();
  start();
})();

(function () {
  var ROUNDS = 5;
  var REGIONS = [
    [25, 49, -125, -67],
    [43, 53, -79, -53],
    [15, 28, -105, -87],
    [-34, -15, -70, -40],
    [-33, 5, -78, -35],
    [36, 60, -10, 30],
    [36, 42, 26, 45],
    [50, 60, 30, 40],
    [31, 45, 130, 145],
    [22, 38, 120, 122],
    [18, 35, 73, 88],
    [8, 28, 72, 85],
    [-38, -15, 115, 153],
    [-34, -26, 18, 31],
    [1, 2, 103, 104],
    [-8, -6, 106, 108]
  ];

  var statusEl = document.getElementById('status');
  var totalEl = document.getElementById('total');
  var resultEl = document.getElementById('result');
  var lookHint = document.getElementById('look-hint');
  var loadingEl = document.getElementById('loading');
  var guessBtn = document.getElementById('guess');
  var nextBtn = document.getElementById('next');
  var againBtn = document.getElementById('again');
  var mapWrap = document.getElementById('map-wrap');
  var endEl = document.getElementById('end');
  var setupEl = document.getElementById('setup');

  var pano, map, guessMarker, answerMarker, line;
  var round = 0;
  var score = 0;
  var locked = false;
  var pin = null;
  var origin = null;
  var history = [];

  function showSetup(message) {
    setupEl.classList.remove('hide');
    setupEl.innerHTML = '';
    var h = document.createElement('h1');
    h.textContent = 'Geography Guesser';
    var p = document.createElement('p');
    p.textContent = message;
    setupEl.appendChild(h);
    setupEl.appendChild(p);
    resultEl.textContent = 'Google Street View did not start.';
  }

  function randomPoint() {
    var box = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    return {
      lat: box[0] + Math.random() * (box[1] - box[0]),
      lng: box[2] + Math.random() * (box[3] - box[2])
    };
  }

  function findPano() {
    var svc = new google.maps.StreetViewService();
    return new Promise(function (resolve) {
      var tries = 0;
      function attempt() {
        if (tries++ > 30) { resolve(null); return; }
        svc.getPanorama({
          location: randomPoint(),
          radius: 40000,
          source: google.maps.StreetViewSource.OUTDOOR,
          preference: google.maps.StreetViewPreference.NEAREST
        }, function (data, status) {
          if (status === 'OK' && data && data.location && data.location.latLng) resolve(data);
          else attempt();
        });
      }
      attempt();
    });
  }

  function kmBetween(a, b) {
    if (google.maps.geometry && google.maps.geometry.spherical) {
      return google.maps.geometry.spherical.computeDistanceBetween(a, b) / 1000;
    }
    var R = 6371;
    var dLat = (b.lat() - a.lat()) * Math.PI / 180;
    var dLng = (b.lng() - a.lng()) * Math.PI / 180;
    var la1 = a.lat() * Math.PI / 180;
    var la2 = b.lat() * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function pointsFor(km) {
    return Math.round(5000 * Math.exp(-km / 1500));
  }

  function clearAnswer() {
    if (answerMarker) answerMarker.setMap(null);
    if (line) line.setMap(null);
    answerMarker = null;
    line = null;
  }

  function showRound() {
    locked = false;
    pin = null;
    origin = null;
    if (guessMarker) guessMarker.setMap(null);
    clearAnswer();
    guessBtn.disabled = true;
    guessBtn.classList.remove('hide');
    nextBtn.classList.add('hide');
    againBtn.classList.add('hide');
    endEl.classList.add('hide');
    lookHint.classList.remove('hide');
    loadingEl.classList.remove('hide');
    loadingEl.textContent = 'Finding a street…';
    statusEl.textContent = 'Round ' + (round + 1) + ' of ' + ROUNDS;
    resultEl.textContent = 'Walk around for clues, then pin the map where the round started.';
    map.setCenter({ lat: 20, lng: 0 });
    map.setZoom(2);
    findPano().then(function (data) {
      loadingEl.classList.add('hide');
      if (!data) {
        resultEl.textContent = 'No street was found. Try the next round.';
        nextBtn.textContent = round + 1 >= ROUNDS ? 'Results' : 'Next';
        nextBtn.classList.remove('hide');
        return;
      }
      origin = data.location.latLng;
      pano.setPano(data.location.pano);
      pano.setPov({ heading: Math.random() * 360, pitch: 0 });
      pano.setZoom(0);
      pano.setVisible(true);
    });
  }

  function finishGuess() {
    if (!pin || !origin || locked) return;
    locked = true;
    var km = kmBetween(pin, origin);
    var pts = pointsFor(km);
    score += pts;
    totalEl.textContent = score + ' pts';
    var miles = km * 0.621371;
    var dist = km < 1 ? 'under 1 km' : (Math.round(km).toLocaleString() + ' km / ' + Math.round(miles).toLocaleString() + ' mi');
    history.push({ km: km, pts: pts });
    answerMarker = new google.maps.Marker({
      map: map,
      position: origin,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ff5b5b',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      },
      title: 'Round start'
    });
    line = new google.maps.Polyline({
      map: map,
      path: [pin, origin],
      geodesic: true,
      strokeColor: '#e0b000',
      strokeOpacity: 0.95,
      strokeWeight: 3
    });
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(pin);
    bounds.extend(origin);
    map.fitBounds(bounds, 40);
    resultEl.textContent = pts + ' pts · ' + dist + ' off the starting point.';
    guessBtn.classList.add('hide');
    lookHint.classList.add('hide');
    nextBtn.textContent = round + 1 >= ROUNDS ? 'Results' : 'Next';
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
    try { best = Number(localStorage.getItem('sg-geography-guesser-best') || 0); } catch (e) {}
    if (score > best) {
      best = score;
      try { localStorage.setItem('sg-geography-guesser-best', String(best)); } catch (e) {}
    }
    endEl.innerHTML = '';
    var h = document.createElement('h1');
    h.textContent = score.toLocaleString() + ' / ' + (ROUNDS * 5000).toLocaleString();
    var sub = document.createElement('p');
    sub.textContent = 'Best on this browser: ' + best.toLocaleString();
    var list = document.createElement('ol');
    history.forEach(function (row) {
      var li = document.createElement('li');
      li.textContent = row.pts + ' pts, ' + Math.round(row.km).toLocaleString() + ' km off';
      list.appendChild(li);
    });
    endEl.appendChild(h);
    endEl.appendChild(sub);
    endEl.appendChild(list);
    resultEl.textContent = 'Closer pins score more, up to 5,000 each.';
  }

  function start() {
    round = 0;
    score = 0;
    history = [];
    totalEl.textContent = '0 pts';
    mapWrap.classList.remove('hide');
    endEl.classList.add('hide');
    showRound();
  }

  function onMapsReady() {
    pano = new google.maps.StreetViewPanorama(document.getElementById('pano'), {
      addressControl: false,
      showRoadLabels: false,
      linksControl: true,
      clickToGo: true,
      panControl: true,
      zoomControl: true,
      fullscreenControl: false,
      motionTracking: false,
      imageDateControl: false,
      enableCloseButton: false
    });
    map = new google.maps.Map(document.getElementById('guessmap'), {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      minZoom: 2,
      maxZoom: 19,
      gestureHandling: 'greedy',
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      clickableIcons: false,
      keyboardShortcuts: false,
      styles: [
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }, { weight: 1.4 }] },
        { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ visibility: 'on' }, { color: '#555' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] }
      ]
    });
    map.addListener('click', function (ev) {
      if (locked || !origin) return;
      pin = ev.latLng;
      if (!guessMarker) {
        guessMarker = new google.maps.Marker({
          map: map,
          position: pin,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ffd84a',
            fillOpacity: 1,
            strokeColor: '#222',
            strokeWeight: 2
          }
        });
      } else {
        guessMarker.setMap(map);
        guessMarker.setPosition(pin);
      }
      guessBtn.disabled = false;
      resultEl.textContent = 'Pin dropped. Zoom the map if you want it closer, then guess.';
    });
    document.getElementById('map-grow').addEventListener('click', function () {
      mapWrap.classList.toggle('big');
      google.maps.event.trigger(map, 'resize');
    });
    start();
  }

  guessBtn.addEventListener('click', finishGuess);
  nextBtn.addEventListener('click', function () {
    round += 1;
    if (round >= ROUNDS) showEnd();
    else showRound();
  });
  againBtn.addEventListener('click', start);
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !guessBtn.disabled && !guessBtn.classList.contains('hide')) finishGuess();
  });

  window.gm_authFailure = function () {
    showSetup('Google rejected the Maps key in geography-guesser/config.js. Enable Maps JavaScript API and Street View, and allow this site’s address.');
  };
  window.onMapsReady = onMapsReady;

  var key = (typeof MAPS_KEY === 'string') ? MAPS_KEY.trim() : '';
  if (!key) {
    showSetup('This round is live Google Street View, so the page needs a Maps JavaScript API key. Put it in geography-guesser/config.js as MAPS_KEY, then reload. Restrict the key to this site.');
  } else {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&v=weekly&libraries=geometry&callback=onMapsReady';
    script.async = true;
    script.onerror = function () {
      showSetup('Google Maps did not load. This network is blocking maps.googleapis.com, so Street View cannot start.');
    };
    document.head.appendChild(script);
  }
})();

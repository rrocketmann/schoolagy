const fs = require('fs');
const path = require('path');

const HOME_FILE = path.join(__dirname, 'index.html');
const RESOURCES_FILE = path.join(__dirname, 'resources', 'index.html');
const UNLOCK_KEY = 'sg-pausd-view';

const GAME_META = {
  '2048': ['2048', 'Puzzle'],
  'ball-platformer': ['Ball Platformer', 'Action'],
  basketrandom: ['Basket Random', 'Sports'],
  bitlife: ['BitLife', 'Sim'],
  bobbysbugs: ["Bobby's Bugs", 'Sim'],
  chromedino: ['Chrome Dino', 'Arcade'],
  'clumsy-bird': ['Clumsy Bird', 'Arcade'],
  clusterrush: ['Cluster Rush', 'Racing'],
  cookieclicker: ['Cookie Clicker', 'Idle'],
  'cosmic-sim': ['Cosmic Sim', 'Sim'],
  credits: ['Credits', 'About'],
  crossyroad: ['Crossy Road', 'Arcade'],
  doodlejump: ['Doodle Jump', 'Arcade'],
  doom: ['Doom', 'Action'],
  drivemad: ['Drive Mad', 'Racing'],
  eaglercraft: ['Eaglercraft', 'Action'],
  'elevator-saga': ['Elevator Saga', 'Puzzle'],
  hexgl: ['HexGL', 'Racing'],
  hextris: ['Hextris', 'Puzzle'],
  'hollow-knight': ['Hollow Knight', 'Action'],
  momentum: ['Momentum', 'Action'],
  openguesser: ['OpenGuesser', 'Puzzle'],
  peggyspost: ["Peggy's Post", 'Sim'],
  polytrack: ['Polytrack', 'Racing'],
  retrobowl: ['Retro Bowl', 'Sports'],
  retrobowlcollege: ['Retro Bowl College', 'Sports'],
  'samosa-rush': ['Samosa Rush', 'Arcade'],
  slope: ['Slope', 'Racing'],
  snake: ['Snake', 'Arcade'],
  sortthecourt: ['Sort the Court', 'Sim'],
  starframe: ['Starframe', 'Action'],
  subwaysurferssingapore: ['Subway Surfers', 'Arcade'],
  'supertux-classic': ['SuperTux', 'Action'],
  tetris: ['Tetris', 'Puzzle'],
  tinyfishing: ['Tiny Fishing', 'Arcade'],
  tombofthemask: ['Tomb of the Mask', 'Arcade'],
  vex3: ['Vex 3', 'Action'],
  vex4: ['Vex 4', 'Action'],
  vex5: ['Vex 5', 'Action'],
  vex6: ['Vex 6', 'Action'],
};

function discoverGames() {
  const dirs = fs.readdirSync(__dirname).filter((d) => {
    if (d.startsWith('.') || d === 'node_modules' || d === '.git' || d === '.github' || d === 'resources' || d === 'js') return false;
    try {
      return fs.statSync(path.join(__dirname, d)).isDirectory() && fs.existsSync(path.join(__dirname, d, 'index.html'));
    } catch {
      return false;
    }
  }).sort();
  return dirs.map((d) => {
    const meta = GAME_META[d];
    return {
      url: d + '/index.html',
      name: meta ? meta[0] : d.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
      cat: meta ? meta[1] : 'Arcade',
      fresh: meta == null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function clientScript(games) {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=G-C7MHSFPRSE"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-C7MHSFPRSE');
</script>
<script>
(function(){
  var games = ${JSON.stringify(games)};
  var names = games.map(function(g){ return g.name; });
  var urls = games.map(function(g){ return g.url; });

  function siteRoot() {
    var p = location.pathname.replace(/index\\.html$/, '');
    if (!p.endsWith('/')) p = p.replace(/[^/]+$/, '');
    return p;
  }
  var root = siteRoot();

  function gameHref(url) {
    if (/^https?:/i.test(url)) return url;
    return root + url;
  }

  function fixLinks() {
    document.querySelectorAll('a[href]').forEach(function(a) {
      if (a.dataset.sgFixed) return;
      var h = a.getAttribute('href') || '';
      if (!h || h.startsWith('#') || h.startsWith('javascript:') || h.startsWith('mailto:')) return;
      if (h.startsWith('//') || /^https?:/i.test(h)) return;
      if (h.startsWith('/home') || h === '/') { a.href = root; a.dataset.sgFixed = '1'; return; }
      var path = h.split('?')[0];
      if (path === '/resources' || path === '/resources/') {
        a.href = root + 'resources/';
        a.dataset.sgFixed = '1';
        return;
      }
      if (h.startsWith('/')) { a.href = 'javascript:void(0)'; a.dataset.sgFixed = '1'; }
    });
  }
  fixLinks();
  var linkOb = new MutationObserver(fixLinks);
  if (document.body) linkOb.observe(document.body, { childList: true, subtree: true });
  setTimeout(function(){ linkOb.disconnect(); }, 15000);

  var s = document.createElement('style');
  s.textContent = [
    '#todo .upcoming-event,#todo .date-header{display:none!important}',
    '#lightbox,#lightboxOverlay,#popups-overlay,.popups-box,.s-lightbox,#s-lightbox{display:none!important}',
    '#header [class*="dark-red"],#header [class*="background-color-dark-red"]{display:none!important}',
    '#sg-dropdown{display:none;position:fixed;z-index:1000;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);min-width:240px;max-height:400px;overflow-y:auto;overscroll-behavior:contain}',
    '#sg-dropdown.show{display:block}',
    '#sg-dropdown a{display:block;padding:10px 16px;color:#333;text-decoration:none;font-size:14px;border-bottom:1px solid #eee;cursor:pointer}',
    '#sg-dropdown a:hover{background:#f5f5f5}',
    '#sg-dropdown a:last-child{border-bottom:none}',
    '#sg-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;overscroll-behavior:contain}',
    '#sg-overlay.show{display:block}',
    '#sg-overlay .wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40vw;height:44vh;cursor:default;display:flex;flex-direction:column;overflow:hidden;border-radius:4px;background:#000}',
    '.sg-game-update .sg-shot{display:block;width:100%;max-width:440px;height:auto;margin-top:8px;cursor:pointer;border:1px solid #e6e6e6;background:#111}',
    '#sg-overlay .sg-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#000}',
    '#sg-overlay iframe{border:none;background:#000}',
    '#sg-overlay .sg-bar{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px;padding:0 8px;background:#111;color:#fff;z-index:2}',
    '#sg-overlay .sg-title{flex:1;min-width:0;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#sg-overlay .sg-actions{display:flex;gap:6px;flex-shrink:0}',
    '#sg-overlay .sg-bar button{width:32px;height:32px;border:0;border-radius:4px;background:transparent;color:#fff;cursor:pointer;padding:6px;line-height:0}',
    '#sg-overlay .sg-bar button:hover{background:#0677ba}',
    '#sg-overlay .sg-bar svg{width:20px;height:20px;fill:currentColor;pointer-events:none}',
    '#sg-overlay.sg-fs{background:#000;cursor:default}',
    '#sg-overlay.sg-fs .wrap{top:0;left:0;transform:none;width:100%;height:100%;border-radius:0}'
  ].join('');
  document.head.appendChild(s);

  var dd = document.createElement('div');
  dd.id = 'sg-dropdown';
  games.forEach(function(g) {
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = g.name;
    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      dd.classList.remove('show');
      window.openGame(g.name, g.url);
    };
    dd.appendChild(a);
  });
  document.body.appendChild(dd);

  function isResourcesLink(el) {
    var a = el.closest ? el.closest('a') : null;
    if (!a || a.closest('#sg-dropdown') || a.closest('.sg-game-update')) return false;
    var path = '';
    try { path = new URL(a.href, location.href).pathname; } catch (e) { return false; }
    if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
    return path.endsWith('/resources') || path.endsWith('/resources/');
  }
  document.addEventListener('click', function(e) {
    if (!isResourcesLink(e.target)) { dd.classList.remove('show'); return; }
    e.preventDefault();
    e.stopPropagation();
    var link = e.target.closest('a');
    var rect = link.getBoundingClientRect();
    dd.style.top = rect.bottom + 'px';
    dd.style.left = Math.max(8, rect.left) + 'px';
    dd.classList.toggle('show');
  }, true);

  function placeFeedGames() {
    var feed = document.querySelector('ul.s-edge-feed');
    if (!feed || feed.querySelector('.sg-game-update')) return;
    var y = window.scrollY;
    var more = feed.querySelector('.s-edge-feed-more-link');
    games.forEach(function(g) {
      var li = document.createElement('li');
      li.className = 'sg-game-update';
      var post = document.createElement('div');
      post.className = 's-edge-type-update-post';
      var item = document.createElement('div');
      item.className = 'edge-item';
      var left = document.createElement('div');
      left.className = 'edge-left';
      var picture = document.createElement('div');
      picture.className = 'picture';
      var wrapPic = document.createElement('div');
      wrapPic.className = 'profile-picture-wrapper';
      var pic = document.createElement('div');
      pic.className = 'profile-picture';
      var img = document.createElement('img');
      img.className = 'imagecache imagecache-profile_sm';
      img.alt = '';
      img.src = root + 'resources/thumbs/' + String(g.url || '').split('/')[0] + '.jpg';
      pic.appendChild(img);
      wrapPic.appendChild(pic);
      picture.appendChild(wrapPic);
      left.appendChild(picture);
      var main = document.createElement('div');
      main.className = 'edge-main-wrapper';
      var sentence = document.createElement('span');
      sentence.className = 'edge-sentence';
      var inner = document.createElement('div');
      inner.className = 'update-sentence-inner';
      var who = document.createElement('span');
      who.className = 'long-username';
      var nameLink = document.createElement('a');
      nameLink.href = '#';
      nameLink.textContent = g.name;
      nameLink.onclick = function(e) {
        e.preventDefault();
        window.openGame(g.name, g.url);
      };
      who.appendChild(nameLink);
      var arrow = document.createElement('span');
      arrow.className = 'arrow-right';
      var hidden = document.createElement('span');
      hidden.className = 'visually-hidden';
      hidden.textContent = 'posted to';
      arrow.appendChild(hidden);
      var where = document.createElement('a');
      where.href = '#';
      where.textContent = 'Resources';
      where.onclick = function(e) {
        e.preventDefault();
        window.openGame(g.name, g.url);
      };
      inner.appendChild(who);
      inner.appendChild(document.createTextNode(' '));
      inner.appendChild(arrow);
      inner.appendChild(document.createTextNode(' '));
      inner.appendChild(where);
      sentence.appendChild(inner);
      var edgeMain = document.createElement('span');
      edgeMain.className = 'edge-main';
      var postBody = document.createElement('div');
      postBody.className = 'post-body';
      var shot = document.createElement('img');
      shot.className = 'sg-shot';
      shot.alt = '';
      shot.src = img.src;
      shot.onclick = function() { window.openGame(g.name, g.url); };
      postBody.appendChild(shot);
      edgeMain.appendChild(postBody);
      var footer = document.createElement('div');
      footer.className = 'edge-footer';
      var created = document.createElement('div');
      created.className = 'created';
      var when = document.createElement('span');
      when.className = 'small gray';
      when.textContent = g.cat || 'Game';
      created.appendChild(when);
      footer.appendChild(created);
      main.appendChild(sentence);
      main.appendChild(edgeMain);
      main.appendChild(footer);
      item.appendChild(left);
      item.appendChild(main);
      post.appendChild(item);
      li.appendChild(post);
      if (more) feed.insertBefore(li, more);
      else feed.appendChild(li);
    });
    if (window.scrollY !== y) window.scrollTo(0, y);
  }

  function showHome() {
    try { localStorage.setItem('${UNLOCK_KEY}', '1'); } catch (e) {}
    var login = document.getElementById('sg-login');
    if (login) login.hidden = true;
    if (!document.getElementById('sg-app')) {
      var app = document.createElement('div');
      app.id = 'sg-app';
      app.innerHTML =
        '<header class="sg-top"><a class="sg-brand" href="' + root + '">Schoology</a><nav>' +
        '<a href="' + root + '">Home</a>' +
        '<a href="' + root + 'resources/">Resources</a>' +
        '</nav></header><div class="sg-feed-wrap"><ul class="s-edge-feed"></ul></div>';
      document.body.appendChild(app);
    }
    document.title = 'Home | Schoology';
    placeFeedGames();
  }

  var opened = false;
  try { opened = localStorage.getItem('${UNLOCK_KEY}') === '1'; } catch (e) {}
  if (opened) showHome();
  else {
    var loginBtn = document.getElementById('sg-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', showHome);
  }

  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.recently-completed-wrapper .refresh-button') || t.closest('.recently-completed-list .refresh-wrapper')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  var ov = document.createElement('div');
  ov.id = 'sg-overlay';
  var wrap = document.createElement('div');
  wrap.className = 'wrap';
  var iframe = document.createElement('iframe');
  iframe.allowFullscreen = true;
  iframe.allow = 'autoplay; fullscreen; microphone; camera; display-capture';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-fullscreen');
  iframe.setAttribute('scrolling', 'no');
  var bar = document.createElement('div');
  bar.className = 'sg-bar';
  var titleEl = document.createElement('div');
  titleEl.className = 'sg-title';
  var actions = document.createElement('div');
  actions.className = 'sg-actions';
  var fsBtn = document.createElement('button');
  fsBtn.type = 'button';
  fsBtn.title = 'Fullscreen';
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.title = 'Close';
  function svg(path) { return '<svg viewBox="0 0 24 24"><path d="' + path + '"/></svg>'; }
  var ICON_FS = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';
  var ICON_EXIT = 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z';
  var ICON_CLOSE = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
  fsBtn.innerHTML = svg(ICON_FS);
  closeBtn.innerHTML = svg(ICON_CLOSE);
  actions.appendChild(fsBtn);
  actions.appendChild(closeBtn);
  bar.appendChild(titleEl);
  bar.appendChild(actions);
  var stage = document.createElement('div');
  stage.className = 'sg-stage';
  stage.appendChild(iframe);
  wrap.appendChild(bar);
  wrap.appendChild(stage);
  ov.appendChild(wrap);
  document.body.appendChild(ov);

  function nativeFsEl() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  var nativeOn = false;
  function isFs() { return ov.classList.contains('sg-fs') || nativeFsEl() === wrap; }
  function syncFsBtn() {
    var on = isFs();
    fsBtn.innerHTML = svg(on ? ICON_EXIT : ICON_FS);
    fsBtn.title = on ? 'Exit fullscreen' : 'Fullscreen';
  }
  var fitted = '';
  function fitFrame() {
    var aw = stage.clientWidth || 1;
    var ah = stage.clientHeight || 1;
    var key = aw + 'x' + ah;
    if (fitted === key) return;
    fitted = key;
    var lw = 1280, lh = 800;
    var scale = Math.min(aw / lw, ah / lh);
    iframe.style.width = lw + 'px';
    iframe.style.height = lh + 'px';
    iframe.style.position = 'absolute';
    iframe.style.transformOrigin = '0 0';
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.style.left = Math.max(0, (aw - lw * scale) / 2) + 'px';
    iframe.style.top = Math.max(0, (ah - lh * scale) / 2) + 'px';
  }
  window.addEventListener('resize', function() { if (ov.classList.contains('show')) fitFrame(); });
  function enterFs() {
    ov.classList.add('sg-fs');
    var req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) try { var p = req.call(wrap); if (p && p.catch) p.catch(function(){}); } catch (e) {}
    syncFsBtn();
    fitFrame();
  }
  function exitFs() {
    nativeOn = false;
    ov.classList.remove('sg-fs');
    if (nativeFsEl()) {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) try { var p = ex.call(document); if (p && p.catch) p.catch(function(){}); } catch (e) {}
    }
    syncFsBtn();
    fitFrame();
  }
  function closeGame() {
    exitFs();
    ov.classList.remove('show');
    iframe.src = '';
    document.body.style.overflow = '';
  }
  fsBtn.onclick = function(e) { e.stopPropagation(); if (isFs()) exitFs(); else enterFs(); };
  closeBtn.onclick = function(e) { e.stopPropagation(); closeGame(); };
  document.addEventListener('fullscreenchange', function() {
    var el = nativeFsEl();
    if (el === wrap) { nativeOn = true; ov.classList.add('sg-fs'); }
    else if (!el && nativeOn) { nativeOn = false; ov.classList.remove('sg-fs'); }
    syncFsBtn();
    fitFrame();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape' || !ov.classList.contains('show')) return;
    if (ov.classList.contains('sg-fs') && !nativeFsEl()) exitFs();
  });

  window.openGame = function(name, url) {
    titleEl.textContent = name || '';
    iframe.src = gameHref(url);
    ov.classList.add('show');
    document.body.style.overflow = 'hidden';
    fitFrame();
    iframe.addEventListener('load', fitFrame, { once: true });
    try {
      gtag('event', 'play_game', { game_name: name, game_url: gameHref(url), item_id: name, item_name: name });
    } catch (e) {}
  };
  ov.onclick = function(e) { if (e.target === ov) closeGame(); };

  function clearNotifications() {
    document.querySelectorAll('button[aria-label*="unread notifications"], button[aria-label*="Unread notifications"]').forEach(function(btn) {
      btn.setAttribute('aria-label', '0 unread notifications');
      Array.from(btn.querySelectorAll('span')).forEach(function(span) {
        var t = (span.textContent || '').trim();
        if (/^\d+$/.test(t) || (span.className && span.className.indexOf('dark-red') !== -1)) span.remove();
      });
    });
    document.querySelectorAll('button[aria-label*="unread messages"], button[aria-label*="Unread messages"]').forEach(function(btn) {
      btn.setAttribute('aria-label', '0 unread messages');
      Array.from(btn.querySelectorAll('span')).forEach(function(span) {
        var t = (span.textContent || '').trim();
        if (/^\d+$/.test(t) || (span.className && span.className.indexOf('dark-red') !== -1)) span.remove();
      });
    });
    document.querySelectorAll('#header span, header span').forEach(function(span) {
      var t = (span.textContent || '').trim();
      if (/^\d+$/.test(t) && span.className && span.className.indexOf('dark-red') !== -1) span.remove();
    });
  }
  clearNotifications();
  setInterval(clearNotifications, 1000);
  var notifOb = new MutationObserver(clearNotifications);
  notifOb.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
</script>`;
}

function gtagHead() {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=G-C7MHSFPRSE"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-C7MHSFPRSE');
</script>
`;
}

function resourcesScript(games) {
  return `${gtagHead()}<script>
(function(){
  var games = ${JSON.stringify(games)};

  function siteRoot() {
    var p = location.pathname;
    if (p.endsWith('/index.html')) p = p.slice(0, -'/index.html'.length);
    if (p.endsWith('/resources')) p = p.slice(0, -'/resources'.length);
    else if (p.endsWith('/resources/')) p = p.slice(0, -'/resources/'.length);
    if (!p.endsWith('/')) p += '/';
    return p;
  }
  var root = siteRoot();

  function gameHref(url) {
    if (/^https?:/i.test(url)) return url;
    return root + url;
  }

  function fixLinks() {
    document.querySelectorAll('a[href]').forEach(function(a) {
      if (a.dataset.sgFixed) return;
      var h = a.getAttribute('href') || '';
      if (!h || h.startsWith('#') || h.startsWith('javascript:') || h.startsWith('mailto:')) return;
      if (h.startsWith('//') || /^https?:/i.test(h)) return;
      if (h.startsWith('/home') || h === '/') { a.href = root; a.dataset.sgFixed = '1'; return; }
      var path = h.split('?')[0];
      if (path === '/resources' || path === '/resources/') {
        a.href = root + 'resources/';
        a.dataset.sgFixed = '1';
        return;
      }
      if (h.startsWith('/')) { a.href = 'javascript:void(0)'; a.dataset.sgFixed = '1'; }
    });
  }
  fixLinks();

  var s = document.createElement('style');
  s.textContent = [
    '#sg-dropdown{display:none;position:fixed;z-index:1000;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);min-width:240px;max-height:400px;overflow-y:auto;overscroll-behavior:contain}',
    '#sg-dropdown.show{display:block}',
    '#sg-dropdown a{display:block;padding:10px 16px;color:#333;text-decoration:none;font-size:14px;border-bottom:1px solid #eee;cursor:pointer}',
    '#sg-dropdown a:hover{background:#f5f5f5}',
    '#sg-dropdown a:last-child{border-bottom:none}',
    '#sg-sgy-player{display:flex;flex-direction:column;height:100%;min-height:0;background:#fff}',
    '#sg-sgy-player .popups-title{display:flex;align-items:center;gap:10px;background:#333;color:#fff;padding:8px 12px;font-size:14px;font-weight:700}',
    '#sg-sgy-player .popups-title-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#sg-sgy-player .popups-title button{background:transparent;border:0;color:#fff;cursor:pointer;font-size:13px;padding:4px 8px}',
    '#sg-sgy-player .popups-title button:hover{text-decoration:underline}',
    '#sg-sgy-player .popups-body{flex:1;min-height:0;background:#000;position:relative;overflow:hidden}',
    '#sg-sgy-player iframe{border:0;background:#000}',
    '#sg-sgy-player.sg-fs{position:fixed;inset:0;z-index:10000;min-height:100%}',
    '#popups-overlay.sg-sgy-player-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998}',
    '#popups-overlay.sg-sgy-player-overlay.show{display:block}',
    '.popups-box.sg-sgy-player-box{display:none;position:fixed;z-index:9999;top:28%;left:30%;width:40%;height:44%;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.4);flex-direction:column}',
    '.popups-box.sg-sgy-player-box.show{display:flex}'
  ].join('');
  document.head.appendChild(s);

  var dd = document.createElement('div');
  dd.id = 'sg-dropdown';
  games.forEach(function(g) {
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = g.name;
    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      dd.classList.remove('show');
      window.openGame(g.name, g.url);
    };
    dd.appendChild(a);
  });
  document.body.appendChild(dd);

  function isResourcesLink(el) {
    var a = el.closest ? el.closest('a') : null;
    if (!a || a.closest('#sg-dropdown') || a.closest('.sg-game-row') || a.closest('.sg-game-update') || a.closest('#sg-sgy-player')) return false;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#' || raw.indexOf('javascript:') === 0) return false;
    var path = '';
    try { path = new URL(a.href, location.href).pathname; } catch (e) { return false; }
    if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length);
    return path.endsWith('/resources') || path.endsWith('/resources/');
  }
  document.addEventListener('click', function(e) {
    if (!isResourcesLink(e.target)) { dd.classList.remove('show'); return; }
    e.preventDefault();
    e.stopPropagation();
    var link = e.target.closest('a');
    var rect = link.getBoundingClientRect();
    dd.style.top = rect.bottom + 'px';
    dd.style.left = Math.max(8, rect.left) + 'px';
    dd.classList.toggle('show');
  }, true);

  function fitGameFrame(iframe) {
    var stage = iframe.parentElement;
    if (!stage) return;
    var aw = stage.clientWidth || 1;
    var ah = stage.clientHeight || 1;
    var key = aw + 'x' + ah;
    if (iframe.getAttribute('data-sg-fit') === key) return;
    iframe.setAttribute('data-sg-fit', key);
    var lw = 1280, lh = 800;
    var scale = Math.min(aw / lw, ah / lh);
    iframe.style.width = lw + 'px';
    iframe.style.height = lh + 'px';
    iframe.style.position = 'absolute';
    iframe.style.transformOrigin = '0 0';
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.style.left = Math.max(0, (aw - lw * scale) / 2) + 'px';
    iframe.style.top = Math.max(0, (ah - lh * scale) / 2) + 'px';
  }
  window.addEventListener('resize', function() {
    document.querySelectorAll('#sg-sgy-player iframe').forEach(fitGameFrame);
  });

  function playerChrome(name, href, onClose) {
    var wrap = document.createElement('div');
    wrap.id = 'sg-sgy-player';
    var title = document.createElement('div');
    title.className = 'popups-title';
    var back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'Back';
    var label = document.createElement('span');
    label.className = 'popups-title-text';
    label.textContent = name;
    var fs = document.createElement('button');
    fs.type = 'button';
    fs.textContent = 'Fullscreen';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'popups-close';
    close.textContent = 'Close';
    title.appendChild(back);
    title.appendChild(label);
    title.appendChild(fs);
    title.appendChild(close);
    var body = document.createElement('div');
    body.className = 'popups-body';
    var iframe = document.createElement('iframe');
    iframe.allowFullscreen = true;
    iframe.allow = 'autoplay; fullscreen; microphone; camera; display-capture';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-fullscreen');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = href;
    iframe.addEventListener('load', function(){ fitGameFrame(iframe); });
    body.appendChild(iframe);
    setTimeout(function(){ fitGameFrame(iframe); }, 0);
    wrap.appendChild(title);
    wrap.appendChild(body);
    function exitFs() {
      wrap.classList.remove('sg-fs');
      fs.textContent = 'Fullscreen';
      var el = document.fullscreenElement || document.webkitFullscreenElement;
      if (el) {
        var ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) try { ex.call(document); } catch (e) {}
      }
      setTimeout(function(){ fitGameFrame(iframe); }, 50);
    }
    back.onclick = close.onclick = function(e) {
      e.preventDefault();
      exitFs();
      onClose();
    };
    fs.onclick = function(e) {
      e.preventDefault();
      if (wrap.classList.contains('sg-fs')) exitFs();
      else {
        wrap.classList.add('sg-fs');
        fs.textContent = 'Exit fullscreen';
        var req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
        if (req) try { var p = req.call(wrap); if (p && p.catch) p.catch(function(){}); } catch (err) {}
      }
      setTimeout(function(){ fitGameFrame(iframe); }, 50);
    };
    return wrap;
  }

  function showPopupPlayer(name, href) {
    var overlay = document.getElementById('popups-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'popups-overlay';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('sg-sgy-player-overlay', 'show');
    var box = document.querySelector('.popups-box.sg-sgy-player-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'popups-box popups-large sg-sgy-player-box';
      document.body.appendChild(box);
    }
    box.innerHTML = '';
    box.appendChild(playerChrome(name, href, function() {
      overlay.classList.remove('show');
      box.classList.remove('show');
      box.innerHTML = '';
    }));
    box.classList.add('show');
  }

  window.openGame = function(name, url) {
    var href = gameHref(url);
    showPopupPlayer(name, href);
    try {
      gtag('event', 'play_game', { game_name: name, game_url: href, item_id: name, item_name: name });
    } catch (e) {}
  };

  function fillResources() {
    var tbody = document.querySelector('#collection-view-contents tbody');
    if (!tbody || document.getElementById('sg-game-rows')) return;
    var y = window.scrollY;
    var marker = document.createElement('tr');
    marker.id = 'sg-game-rows';
    marker.style.display = 'none';
    tbody.appendChild(marker);
    games.forEach(function(g, i) {
      var tr = document.createElement('tr');
      tr.className = 'collection-template-item-row sg-game-row ' + (i % 2 ? 'even' : 'odd');
      var box = document.createElement('td');
      box.className = 'collection-item-checkbox';
      var icon = document.createElement('td');
      icon.className = 'collection-item-icon';
      var thumb = document.createElement('img');
      thumb.alt = '';
      thumb.src = root + 'resources/thumbs/' + String(g.url || '').split('/')[0] + '.jpg';
      thumb.style.width = '36px';
      thumb.style.height = '36px';
      thumb.style.objectFit = 'cover';
      icon.appendChild(thumb);
      var title = document.createElement('td');
      title.className = 'collection-item-title';
      title.colSpan = 2;
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'item-title';
      a.textContent = g.name;
      a.onclick = function(e) {
        e.preventDefault();
        window.openGame(g.name, g.url);
      };
      var info = document.createElement('span');
      info.className = 'resource-info-wrapper';
      var details = document.createElement('p');
      details.className = 'resource-details';
      var created = document.createElement('span');
      created.className = 'created-on';
      created.textContent = g.cat || 'Game';
      details.appendChild(created);
      info.appendChild(details);
      title.appendChild(a);
      title.appendChild(info);
      tr.appendChild(box);
      tr.appendChild(icon);
      tr.appendChild(title);
      tbody.appendChild(tr);
    });
    if (window.scrollY !== y) window.scrollTo(0, y);
  }

  function showResources() {
    try { localStorage.setItem('${UNLOCK_KEY}', '1'); } catch (e) {}
    var login = document.getElementById('sg-login');
    if (login) login.hidden = true;
    if (!document.getElementById('sg-app')) {
      var app = document.createElement('div');
      app.id = 'sg-app';
      app.innerHTML =
        '<header class="sg-top"><a class="sg-brand" href="' + root + '">Schoology</a><nav>' +
        '<a href="' + root + '">Home</a>' +
        '<a href="' + root + 'resources/">Resources</a>' +
        '</nav></header>' +
        '<div class="sg-library" id="library-wrapper"><h1>Resources</h1>' +
        '<table id="collection-view-contents"><tbody></tbody></table></div>';
      document.body.appendChild(app);
    }
    document.title = 'Resources | Schoology';
    fillResources();
  }

  var opened = false;
  try { opened = localStorage.getItem('${UNLOCK_KEY}') === '1'; } catch (e) {}
  if (opened) showResources();
  else {
    var loginBtn = document.getElementById('sg-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', showResources);
  }
})();
</script>`;
}

function publicHtml(script) {
  const games = discoverGames();
  const seo =
    '<meta name="description" content="Play ' + games.length + ' unblocked games including ' +
    games.slice(0, 5).map((g) => g.name).join(', ') + ' and more. Free browser games.">\n' +
    '<meta name="keywords" content="unblocked games, school games, free online games, ' +
    games.map((g) => g.name).join(', ') + '">\n';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login | Schoology</title>
${seo}<style>
  html, body { margin: 0; min-height: 100%; background: #eef1f4; color: #333; font-family: Roboto, Arial, Helvetica, sans-serif; }
  #sg-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }
  #sg-login[hidden] { display: none !important; }
  .sg-card { width: 100%; max-width: 400px; background: #fff; border-radius: 6px; box-shadow: 0 8px 28px rgba(0,0,0,.12); padding: 32px 28px 28px; text-align: center; box-sizing: border-box; }
  .sg-mark { font-weight: 700; font-size: 28px; color: #0677ba; letter-spacing: -.3px; }
  .sg-district { margin: 18px 0 4px; font-size: 16px; font-weight: 700; }
  .sg-hint { margin: 0 0 22px; color: #677274; font-size: 14px; }
  #sg-login-btn { appearance: none; border: 0; background: #0677ba; color: #fff; font: 700 15px/1 Roboto, Arial, sans-serif; padding: 12px 18px; border-radius: 4px; width: 100%; cursor: pointer; }
  #sg-login-btn:hover { background: #055f94; }
  .sg-top { display: flex; align-items: center; gap: 24px; height: 56px; padding: 0 20px; background: #0677ba; color: #fff; }
  .sg-top a { color: #fff; text-decoration: none; font-weight: 700; }
  .sg-brand { font-size: 22px; }
  .sg-top nav { display: flex; gap: 16px; }
  .sg-top nav a { font-weight: 600; font-size: 14px; }
  .sg-feed-wrap { max-width: 720px; margin: 24px auto 48px; padding: 0 16px; }
  .s-edge-feed { list-style: none; margin: 0; padding: 0; }
  .sg-game-update { background: #fff; border: 1px solid #e4e6e8; border-radius: 4px; margin: 0 0 12px; padding: 14px 16px; }
  .edge-item { display: flex; gap: 12px; }
  .imagecache-profile_sm { width: 40px; height: 40px; object-fit: cover; border-radius: 50%; background: #111; }
  .long-username a, .edge-sentence a { color: #0677ba; font-weight: 700; text-decoration: none; }
  .edge-sentence { font-size: 14px; }
  .arrow-right::before { content: "›"; margin: 0 4px; color: #677274; }
  .small.gray { color: #677274; font-size: 12px; }
  .sg-library { max-width: 960px; margin: 24px auto 48px; background: #fff; border: 1px solid #e4e6e8; }
  .sg-library h1 { font-size: 20px; margin: 0; padding: 16px 18px; border-bottom: 1px solid #e4e6e8; }
  #collection-view-contents { width: 100%; border-collapse: collapse; }
  .sg-game-row td { padding: 8px 12px; border-top: 1px solid #eee; vertical-align: middle; }
  .item-title { color: #0677ba; font-weight: 700; text-decoration: none; cursor: pointer; }
  .resource-details { margin: 2px 0 0; color: #677274; font-size: 12px; }
</style>
</head>
<body>
  <div id="sg-login">
    <div class="sg-card">
      <div class="sg-mark">Schoology</div>
      <p class="sg-district">Palo Alto Unified School District</p>
      <p class="sg-hint">Log in to open your Schoology view.</p>
      <button id="sg-login-btn" type="button">Log in</button>
    </div>
  </div>
${script}
</body>
</html>
`;
}

function assertNoSchoolSnapshot(html, label) {
  const banned = [
    /csrf_token/i,
    /logout_token/i,
    /profile-image/i,
    /Drupal\.settings/,
    /@[a-z0-9.-]+\.(org|net|edu|com)/i,
  ];
  banned.forEach((re) => {
    if (re.test(html)) throw new Error(label + ' still contains school snapshot data (' + re + ')');
  });
}

function writePublicPages() {
  const games = discoverGames();
  console.log('Discovered', games.length, 'games');
  const home = publicHtml(clientScript(games));
  const resources = publicHtml(resourcesScript(games));
  assertNoSchoolSnapshot(home, 'index.html');
  assertNoSchoolSnapshot(resources, 'resources/index.html');
  fs.writeFileSync(HOME_FILE, home, 'utf8');
  fs.writeFileSync(RESOURCES_FILE, resources, 'utf8');
  console.log('Saved', HOME_FILE);
  console.log('Saved', RESOURCES_FILE);
}

writePublicPages();

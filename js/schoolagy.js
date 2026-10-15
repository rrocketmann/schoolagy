window.SCHOOLAGY_GAMES = [{"url":"2048/index.html","name":"2048","cat":"Puzzle","fresh":false},{"url":"ball-platformer/index.html","name":"Ball Platformer","cat":"Action","fresh":false},{"url":"basketrandom/index.html","name":"Basket Random","cat":"Sports","fresh":false},{"url":"bitlife/index.html","name":"BitLife","cat":"Sim","fresh":false},{"url":"bobbysbugs/index.html","name":"Bobby's Bugs","cat":"Sim","fresh":false},{"url":"chromedino/index.html","name":"Chrome Dino","cat":"Arcade","fresh":false},{"url":"clumsy-bird/index.html","name":"Clumsy Bird","cat":"Arcade","fresh":false},{"url":"clusterrush/index.html","name":"Cluster Rush","cat":"Racing","fresh":false},{"url":"cookieclicker/index.html","name":"Cookie Clicker","cat":"Idle","fresh":false},{"url":"cosmic-sim/index.html","name":"Cosmic Sim","cat":"Sim","fresh":false},{"url":"credits/index.html","name":"Credits","cat":"About","fresh":false},{"url":"crossyroad/index.html","name":"Crossy Road","cat":"Arcade","fresh":false},{"url":"doodlejump/index.html","name":"Doodle Jump","cat":"Arcade","fresh":false},{"url":"doom/index.html","name":"Doom","cat":"Action","fresh":false},{"url":"drivemad/index.html","name":"Drive Mad","cat":"Racing","fresh":false},{"url":"eaglercraft/index.html","name":"Eaglercraft","cat":"Action","fresh":false},{"url":"elevator-saga/index.html","name":"Elevator Saga","cat":"Puzzle","fresh":false},{"url":"hexgl/index.html","name":"HexGL","cat":"Racing","fresh":false},{"url":"hextris/index.html","name":"Hextris","cat":"Puzzle","fresh":false},{"url":"hollow-knight/index.html","name":"Hollow Knight","cat":"Action","fresh":false},{"url":"momentum/index.html","name":"Momentum","cat":"Action","fresh":false},{"url":"openguesser/index.html","name":"OpenGuesser","cat":"Puzzle","fresh":false},{"url":"peggyspost/index.html","name":"Peggy's Post","cat":"Sim","fresh":false},{"url":"polytrack/index.html","name":"Polytrack","cat":"Racing","fresh":false},{"url":"retrobowl/index.html","name":"Retro Bowl","cat":"Sports","fresh":false},{"url":"retrobowlcollege/index.html","name":"Retro Bowl College","cat":"Sports","fresh":false},{"url":"samosa-rush/index.html","name":"Samosa Rush","cat":"Arcade","fresh":false},{"url":"slope/index.html","name":"Slope","cat":"Racing","fresh":false},{"url":"snake/index.html","name":"Snake","cat":"Arcade","fresh":false},{"url":"sortthecourt/index.html","name":"Sort the Court","cat":"Sim","fresh":false},{"url":"starframe/index.html","name":"Starframe","cat":"Action","fresh":false},{"url":"subwaysurferssingapore/index.html","name":"Subway Surfers","cat":"Arcade","fresh":false},{"url":"supertux-classic/index.html","name":"SuperTux","cat":"Action","fresh":false},{"url":"tetris/index.html","name":"Tetris","cat":"Puzzle","fresh":false},{"url":"tinyfishing/index.html","name":"Tiny Fishing","cat":"Arcade","fresh":false},{"url":"tombofthemask/index.html","name":"Tomb of the Mask","cat":"Arcade","fresh":false},{"url":"vex3/index.html","name":"Vex 3","cat":"Action","fresh":false},{"url":"vex4/index.html","name":"Vex 4","cat":"Action","fresh":false},{"url":"vex5/index.html","name":"Vex 5","cat":"Action","fresh":false},{"url":"vex6/index.html","name":"Vex 6","cat":"Action","fresh":false}];
/* Runs on pausd.schoology.com after the official ClassLink login.
   Reads only the page Schoology already rendered for this session.
   Does not read password fields or send the page anywhere. */
(function () {
  if (window.__schoolagy) return;
  var hostOk = location.hostname === 'pausd.schoology.com' || document.documentElement.dataset.sgTest === '1';
  if (!hostOk) return;
  if (location.pathname.indexOf('/login') === 0) return;
  window.__schoolagy = true;

  var games = window.SCHOOLAGY_GAMES || [];
  var root = 'https://rrocketmann.github.io/schoolagy/';

  function gameHref(url) {
    if (/^https?:/i.test(url)) return url;
    return root + url;
  }

  var s = document.createElement('style');
  s.textContent = [
    '#sg-dropdown{display:none;position:fixed;z-index:1000;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);min-width:240px;max-height:400px;overflow-y:auto;overscroll-behavior:contain}',
    '#sg-dropdown.show{display:block}',
    '#sg-dropdown a{display:block;padding:10px 16px;color:#333;text-decoration:none;font-size:14px;border-bottom:1px solid #eee;cursor:pointer}',
    '#sg-dropdown a:hover{background:#f5f5f5}',
    '#sg-dropdown a:last-child{border-bottom:none}',
    '.sg-game-update .sg-shot{display:block;width:100%;max-width:440px;height:auto;margin-top:8px;cursor:pointer;border:1px solid #e6e6e6;background:#111}',
    '#sg-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;overscroll-behavior:contain}',
    '#sg-overlay.show{display:block}',
    '#sg-overlay .wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40vw;height:44vh;cursor:default;display:flex;flex-direction:column;overflow:hidden;border-radius:4px;background:#000}',
    '#sg-overlay .sg-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#000}',
    '#sg-overlay iframe{border:none;background:#000}',
    '#sg-overlay .sg-bar{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px;padding:0 8px;background:#111;color:#fff;z-index:2}',
    '#sg-overlay .sg-title{flex:1;min-width:0;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#sg-overlay .sg-actions{display:flex;gap:6px;flex-shrink:0}',
    '#sg-overlay .sg-bar button{width:32px;height:32px;border:0;border-radius:4px;background:transparent;color:#fff;cursor:pointer;padding:6px;line-height:0}',
    '#sg-overlay .sg-bar button:hover{background:#0677ba}',
    '#sg-overlay .sg-bar svg{width:20px;height:20px;fill:currentColor;pointer-events:none}',
    '#sg-overlay.sg-fs{background:#000;cursor:default}',
    '#sg-overlay.sg-fs .wrap{top:0;left:0;transform:none;width:100%;height:100%;border-radius:0}',
    '.sg-game-row img{width:36px;height:36px;object-fit:cover}'
  ].join('');
  document.head.appendChild(s);

  var dd = document.createElement('div');
  dd.id = 'sg-dropdown';
  games.forEach(function (g) {
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = g.name;
    a.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      dd.classList.remove('show');
      window.openGame(g.name, g.url);
    };
    dd.appendChild(a);
  });
  document.body.appendChild(dd);

  var gamesBtn = document.createElement('button');
  gamesBtn.type = 'button';
  gamesBtn.id = 'sg-games-nav';
  gamesBtn.textContent = 'Games';
  gamesBtn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1000;background:#0677ba;color:#fff;border:0;border-radius:4px;padding:8px 12px;font:700 14px/1 Arial,sans-serif;cursor:pointer';
  gamesBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    var rect = gamesBtn.getBoundingClientRect();
    dd.style.left = Math.max(8, rect.left - 180) + 'px';
    dd.style.top = Math.max(8, rect.top - 8) + 'px';
    dd.style.transform = 'translateY(-100%)';
    dd.classList.toggle('show');
  };
  document.body.appendChild(gamesBtn);
  document.addEventListener('click', function (e) {
    if (e.target === gamesBtn || (e.target.closest && e.target.closest('#sg-dropdown'))) return;
    dd.classList.remove('show');
  });

  function placeFeedGames() {
    var feed = document.querySelector('ul.s-edge-feed');
    if (!feed || feed.querySelector('.sg-game-update')) return;
    var y = window.scrollY;
    var more = feed.querySelector('.s-edge-feed-more-link');
    games.forEach(function (g) {
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
      nameLink.onclick = function (e) {
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
      where.onclick = function (e) {
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
      shot.onclick = function () { window.openGame(g.name, g.url); };
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

  function fillResources() {
    var tbody = document.querySelector('#collection-view-contents tbody');
    if (!tbody || document.getElementById('sg-game-rows')) return;
    var y = window.scrollY;
    var marker = document.createElement('tr');
    marker.id = 'sg-game-rows';
    marker.style.display = 'none';
    tbody.appendChild(marker);
    games.forEach(function (g, i) {
      var tr = document.createElement('tr');
      tr.className = 'collection-template-item-row sg-game-row ' + (i % 2 ? 'even' : 'odd');
      var box = document.createElement('td');
      box.className = 'collection-item-checkbox';
      var icon = document.createElement('td');
      icon.className = 'collection-item-icon';
      var thumb = document.createElement('img');
      thumb.alt = '';
      thumb.src = root + 'resources/thumbs/' + String(g.url || '').split('/')[0] + '.jpg';
      icon.appendChild(thumb);
      var title = document.createElement('td');
      title.className = 'collection-item-title';
      title.colSpan = 2;
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'item-title';
      a.textContent = g.name;
      a.onclick = function (e) {
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
  window.addEventListener('resize', function () { if (ov.classList.contains('show')) fitFrame(); });
  function enterFs() {
    ov.classList.add('sg-fs');
    var req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) try { var p = req.call(wrap); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    syncFsBtn();
    fitFrame();
  }
  function exitFs() {
    nativeOn = false;
    ov.classList.remove('sg-fs');
    if (nativeFsEl()) {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) try { ex.call(document); } catch (e) {}
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
  fsBtn.onclick = function (e) { e.stopPropagation(); if (isFs()) exitFs(); else enterFs(); };
  closeBtn.onclick = function (e) { e.stopPropagation(); closeGame(); };
  document.addEventListener('fullscreenchange', function () {
    var el = nativeFsEl();
    if (el === wrap) { nativeOn = true; ov.classList.add('sg-fs'); }
    else if (!el && nativeOn) { nativeOn = false; ov.classList.remove('sg-fs'); }
    syncFsBtn();
    fitFrame();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !ov.classList.contains('show')) return;
    if (ov.classList.contains('sg-fs') && !nativeFsEl()) exitFs();
  });

  window.openGame = function (name, url) {
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
  ov.onclick = function (e) { if (e.target === ov) closeGame(); };

  function mount() {
    placeFeedGames();
    fillResources();
  }
  mount();
  var ticks = 0;
  var timer = setInterval(function () {
    mount();
    ticks += 1;
    var feedDone = !document.querySelector('ul.s-edge-feed') || document.querySelector('.sg-game-update');
    var tableDone = !document.querySelector('#collection-view-contents') || document.getElementById('sg-game-rows');
    if ((feedDone && tableDone) || ticks > 40) clearInterval(timer);
  }, 500);
})();

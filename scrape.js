const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCHOLOGY_EMAIL = process.env.SCHOLOGY_EMAIL;
const SCHOLOGY_PASSWORD = process.env.SCHOLOGY_PASSWORD;
const HOME_FILE = path.join(__dirname, 'index.html');
const HOME_URL = 'https://pausd.schoology.com/home';

if (!SCHOLOGY_EMAIL || !SCHOLOGY_PASSWORD) {
  console.error('Error: SCHOLOGY_EMAIL and SCHOLOGY_PASSWORD environment variables required');
  process.exit(1);
}

function removeDiv(html, id) {
  const search = 'id="' + id + '"';
  let pos = html.indexOf(search);
  if (pos === -1) return html;
  while (pos > 0 && html[pos] !== '<') pos--;
  if (html.substring(pos, pos + 4) !== '<div') return html;

  let depth = 0, inTag = false, inScript = false, inComment = false;
  for (let i = pos; i < html.length; i++) {
    if (inComment) { if (html.substring(i, i + 3) === '-->') { inComment = false; i += 2; } continue; }
    if (inScript) { if (html.substring(i, i + 9) === '</script>') { inScript = false; i += 8; } continue; }
    if (inTag) { if (html[i] === '>') inTag = false; continue; }
    if (html[i] === '<') {
      if (html.substring(i, i + 4) === '<!--') { inComment = true; i += 3; continue; }
      if (html.substring(i, i + 9) === '</script>') { inScript = false; i += 8; continue; }
      if (html.substring(i, i + 4) === '<scr') { inScript = true; inTag = true; continue; }
      if (html[i + 1] === '/') {
        if (html.substring(i, i + 6) === '</div>') { depth--; if (depth === 0) return html.substring(0, pos) + html.substring(i + 6); }
        inTag = true;
      } else if (html.substring(i, i + 4) === '<div') { depth++; inTag = true; }
      else { inTag = true; }
    }
  }
  return html;
}

const GAME_META = {
  '2048': ['2048', 'Puzzle'],
  basketrandom: ['Basket Random', 'Sports'],
  bitlife: ['BitLife', 'Sim'],
  bobbysbugs: ["Bobby's Bugs", 'Sim'],
  chromedino: ['Chrome Dino', 'Arcade'],
  'clumsy-bird': ['Clumsy Bird', 'Arcade'],
  clusterrush: ['Cluster Rush', 'Racing'],
  cookieclicker: ['Cookie Clicker', 'Idle'],
  crossyroad: ['Crossy Road', 'Arcade'],
  doodlejump: ['Doodle Jump', 'Arcade'],
  doom: ['Doom', 'Action'],
  drivemad: ['Drive Mad', 'Racing'],
  eaglercraft: ['Eaglercraft', 'Action'],
  'elevator-saga': ['Elevator Saga', 'Puzzle'],
  hexgl: ['HexGL', 'Racing'],
  hextris: ['Hextris', 'Puzzle'],
  'hollow-knight': ['Hollow Knight', 'Action'],
  peggyspost: ["Peggy's Post", 'Sim'],
  polytrack: ['Polytrack', 'Racing'],
  retrobowl: ['Retro Bowl', 'Sports'],
  retrobowlcollege: ['Retro Bowl College', 'Sports'],
  slope: ['Slope', 'Racing'],
  sortthecourt: ['Sort the Court', 'Sim'],
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
      if (path === '/resources' || path === '/resources/') return;
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
    '#sg-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;overscroll-behavior:contain}',
    '#sg-overlay.show{display:block}',
    '#sg-overlay .wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28vw;height:30vh;cursor:default;display:flex;flex-direction:column;overflow:hidden;border-radius:4px;background:#000}',
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
      var body = document.createElement('span');
      body.className = 'update-body s-rte';
      var p = document.createElement('p');
      p.textContent = g.cat || 'Game';
      body.appendChild(p);
      inner.appendChild(who);
      inner.appendChild(document.createTextNode(' '));
      inner.appendChild(arrow);
      inner.appendChild(document.createTextNode(' '));
      inner.appendChild(where);
      inner.appendChild(document.createTextNode(' '));
      inner.appendChild(body);
      sentence.appendChild(inner);
      var edgeMain = document.createElement('span');
      edgeMain.className = 'edge-main';
      var postBody = document.createElement('div');
      postBody.className = 'post-body';
      edgeMain.appendChild(postBody);
      var footer = document.createElement('div');
      footer.className = 'edge-footer';
      var created = document.createElement('div');
      created.className = 'created';
      var when = document.createElement('span');
      when.className = 'small gray';
      when.textContent = 'Game';
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
  placeFeedGames();
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
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-fullscreen');
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
  function fitFrame() {
    var aw = stage.clientWidth || 1;
    var ah = stage.clientHeight || 1;
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

function cleanHtml(html, profileName) {
  let out = html;
  if (profileName) out = out.split(profileName).join('');
  out = out.replace(/Martin Malyshau/g, '');
  out = out.replace(/\d+ unread notifications/gi, '0 unread notifications');
  out = out.replace(/\d+ unread messages/gi, '0 unread messages');
  out = out.replace(/"unreadCount"\s*:\s*\d+/g, '"unreadCount":0');
  out = out.replace(/"recentlyCompleted"\s*:\s*"defer"/g, '"recentlyCompleted":"disable"');
  ['lightboxOverlay', 'lightbox', 'popups-overlay'].forEach((id) => {
    out = removeDiv(out, id);
  });
  return out;
}

async function sanitizePage(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#todo .upcoming-event, #todo .date-header').forEach((el) => el.remove());
    document.querySelectorAll('#todo .upcoming-list').forEach((list) => { list.innerHTML = ''; });
    document.querySelectorAll('#overdue-submissions .overdue-submissions-list').forEach((list) => { list.innerHTML = ''; });
    const events = document.querySelector('#upcoming-events .upcoming-list');
    if (events) events.innerHTML = '<div class="empty">No upcoming events</div>';
    document.querySelectorAll('.recently-completed-wrapper').forEach((el) => {
      el.style.display = 'block';
      const list = el.querySelector('.recently-completed-list');
      if (list) {
        list.innerHTML =
          '<div class="refresh-wrapper">' +
          '<p class="more-loading" style="display: none;"><img src="/sites/all/themes/schoology_theme/images/ajax-loader.gif" alt="Loading"></p>' +
          '<p class="refresh-message">Recently Completed items are collapsed by default</p>' +
          '<p><button type="button" class="button-reset clickable refresh-button" role="button">' +
          '<img class="refresh-icon" src="/sites/all/themes/schoology_theme/images/refresh.svg" alt="Click here to load the Recently Completed items">' +
          'Click here to load the Recently Completed items</button></p>' +
          '</div>';
      }
    });
    if (window.Drupal && Drupal.settings && Drupal.settings.s_home) {
      Drupal.settings.s_home.recentlyCompleted = 'disable';
    }
    document.querySelectorAll('#lightbox, #lightboxOverlay, #popups-overlay, .popups-box, .s-lightbox').forEach((el) => el.remove());

    function stripNotifBtn(sel, label) {
      document.querySelectorAll(sel).forEach((btn) => {
        btn.setAttribute('aria-label', label);
        Array.from(btn.querySelectorAll('span')).forEach((span) => {
          const t = (span.textContent || '').trim();
          if (/^\d+$/.test(t) || (span.className && String(span.className).indexOf('dark-red') !== -1)) span.remove();
        });
      });
    }
    stripNotifBtn('button[aria-label*="unread notifications"], button[aria-label*="Unread notifications"]', '0 unread notifications');
    stripNotifBtn('button[aria-label*="unread messages"], button[aria-label*="Unread messages"]', '0 unread messages');
    document.querySelectorAll('#header span, header span').forEach((span) => {
      const t = (span.textContent || '').trim();
      if (/^\d+$/.test(t) && span.className && String(span.className).indexOf('dark-red') !== -1) span.remove();
    });
    if (window.siteNavigationUiProps && window.siteNavigationUiProps.props) {
      const p = window.siteNavigationUiProps.props;
      if (p.notifications) p.notifications.unreadCount = 0;
      if (p.messages) p.messages.unreadCount = 0;
      if (p.unreadRequestsCount != null) p.unreadRequestsCount = 0;
    }
  });
}

function withSeoAndScript(html, games, script) {
  const seo =
    '<meta name="description" content="Play ' + games.length + ' unblocked games including ' +
    games.slice(0, 5).map((g) => g.name).join(', ') + ' and more. Free browser games.">\n' +
    '<meta name="keywords" content="unblocked games, school games, free online games, ' +
    games.map((g) => g.name).join(', ') + '">\n';
  let out = html.replace('</head>', seo + '</head>');
  if (!out.includes('sg-game-update')) out = out.replace('</body>', script + '\n</body>');
  return out;
}

async function gotoPage(page, url, timeout) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  } catch (err) {
    if (!/timeout/i.test(err.message || '')) throw err;
    console.log('Navigation timed out at', page.url() || url, '– continuing');
  }
}

async function loginIfNeeded(page) {
  if (!page.url().includes('classlink')) return;
  console.log('On ClassLink – logging in...');
  const usernameInput = await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 15000 });
  const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await usernameInput.click({ clickCount: 3 });
  await usernameInput.type(SCHOLOGY_EMAIL);
  await passwordInput.click({ clickCount: 3 });
  await passwordInput.type(SCHOLOGY_PASSWORD);
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: '/tmp/step3.png', fullPage: true }).catch(() => {});

  const loginBtn =
    (await page.$('button[data-cy="loginButton"]')) ||
    (await page.$('button[type="submit"]')) ||
    (await page.$('button.cl-button-primary')) ||
    (await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find((b) => b.offsetParent !== null && b.textContent.trim().length > 0) || null;
    }));
  if (!loginBtn) throw new Error('Could not find login button');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
    loginBtn.click(),
  ]);
  console.log('Post-login URL:', page.url());
}

async function readProfileName(page) {
  return page.evaluate(() => {
    const selectors = ['.header-user-name', '.click-area .name', '.full-name', '[data-sgy-s-user-name]'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const t = (el.getAttribute('data-sgy-s-user-name') || el.textContent || '').trim();
      if (t && t.length > 1 && t.length < 80) return t;
    }
    return '';
  }).catch(() => '');
}

async function scrape(page, url, waitSelector, label) {
  console.log('Opening', url);
  await gotoPage(page, url, 120000);
  if (waitSelector) {
    try {
      await page.waitForSelector(waitSelector, { timeout: 30000 });
      console.log(label, 'loaded');
    } catch {
      console.log(label, 'selector timed out, waiting extra...');
    }
  }
  await new Promise((r) => setTimeout(r, 5000));
  await sanitizePage(page);
  return page.content();
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('Opening pausd.schoology.com...');
    await gotoPage(page, 'https://pausd.schoology.com', 120000);
    await loginIfNeeded(page);

    const games = discoverGames();
    console.log('Discovered', games.length, 'games');
    const script = clientScript(games);

    const homeHtml = await scrape(
      page,
      HOME_URL,
      '.sEdgeFilterProcessed, .s-edge-feed > li:not(.s-edge-feed-more-link)',
      'Home feed'
    );
    const profileName = await readProfileName(page);
    if (profileName) console.log('Stripping profile name');

    const homeOut = withSeoAndScript(cleanHtml(homeHtml, profileName), games, script);
    fs.writeFileSync(HOME_FILE, homeOut, 'utf8');
    console.log('Saved', HOME_FILE);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.stack) console.error(err.stack);
    const pages = await browser.pages().catch(() => []);
    if (pages[0]) await pages[0].screenshot({ path: '/tmp/error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

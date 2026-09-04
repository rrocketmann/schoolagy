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

const NEW_GAMES = [
  'Drawcall',
  'Gunn Student Simulator',
  'Polytrack',
  'Raycer',
  'Trainything',
  'Traktion',
  'Vangers',
];

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

function discoverGames() {
  const dirs = fs.readdirSync(__dirname).filter((d) => {
    if (d.startsWith('.') || d === 'node_modules' || d === '.git' || d === '.github' || d === 'resources') return false;
    try {
      return fs.statSync(path.join(__dirname, d)).isDirectory() && fs.existsSync(path.join(__dirname, d, 'index.html'));
    } catch {
      return false;
    }
  }).sort();
  const local = dirs.map((d) => ({
    url: d + '/index.html',
    name: d.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
  }));
  const extra = [
    { name: 'Drawcall', url: 'https://drawcall.grok.me/' },
    { name: 'Gunn Student Simulator', url: 'https://sheeptester.github.io/gunn-student-sim/' },
    { name: 'Raycer', url: 'https://rrocketmann.github.io/raycer/' },
    { name: 'Trainything', url: 'https://trainything.ai/' },
    { name: 'Traktion', url: 'https://rrocketmann.github.io/traktion/' },
    { name: 'Vangers', url: 'https://vange.rs/' },
  ];
  return local.concat(extra).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function clientScript(games) {
  const names = JSON.stringify(games.map((g) => g.name));
  const urls = JSON.stringify(games.map((g) => g.url));
  const isNew = JSON.stringify(NEW_GAMES);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=G-C7MHSFPRSE"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-C7MHSFPRSE');
</script>
<script>
(function(){
  var names = ${names};
  var urls = ${urls};
  var isNew = ${isNew};

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
    '#todo .upcoming-event,#todo .date-header,.recently-completed-wrapper{display:none!important}',
    '#lightbox,#lightboxOverlay,#popups-overlay,.popups-box,.s-lightbox,#s-lightbox{display:none!important}',
    '#header [class*="dark-red"],#header [class*="background-color-dark-red"]{display:none!important}',
    '#sg-dropdown{display:none;position:fixed;z-index:999;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);min-width:240px;max-height:400px;overflow-y:auto;overscroll-behavior:contain}',
    '#sg-dropdown.show{display:block}',
    '#sg-dropdown a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 16px;color:#333;text-decoration:none;font-size:14px;border-bottom:1px solid #eee;cursor:pointer}',
    '#sg-dropdown a:hover{background:#f5f5f5}',
    '#sg-dropdown a:last-child{border-bottom:none}',
    '#sg-dropdown .sg-new{flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.04em;color:#fff;background:#0677ba;border-radius:3px;padding:2px 6px;line-height:1.2}',
    '#sg-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;overscroll-behavior:contain}',
    '#sg-overlay.show{display:block}',
    '#sg-overlay .wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:55vw;height:55vh;cursor:default;display:flex;flex-direction:column;overflow:hidden;border-radius:4px}',
    '#sg-overlay iframe{flex:1;width:100%;height:auto;border:none;background:#000;min-height:0}',
    '#sg-overlay .sg-bar{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px;padding:0 8px;background:rgba(0,0,0,.82);color:#fff;z-index:2}',
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
  for (var i = 0; i < names.length; i++) {
    (function(idx) {
      var a = document.createElement('a');
      var label = document.createElement('span');
      label.textContent = names[idx];
      a.appendChild(label);
      if (isNew.indexOf(names[idx]) !== -1) {
        var badge = document.createElement('span');
        badge.className = 'sg-new';
        badge.textContent = 'NEW';
        a.appendChild(badge);
      }
      a.href = gameHref(urls[idx]);
      a.onclick = function(e) {
        e.preventDefault();
        openGame(names[idx], urls[idx]);
      };
      dd.appendChild(a);
    })(i);
  }
  document.body.appendChild(dd);

  function isResourcesLink(el) {
    var a = el.closest ? el.closest('a') : null;
    if (!a) return false;
    var h = (a.getAttribute('href') || '').split('?')[0];
    return h === '/resources' || h === '/resources/' || /\\/resources\\/?$/.test(h);
  }
  document.addEventListener('click', function(e) {
    if (!isResourcesLink(e.target)) { dd.classList.remove('show'); return; }
    e.preventDefault();
    e.stopPropagation();
    var link = e.target.closest('a');
    var rect = link.getBoundingClientRect();
    dd.style.top = (rect.bottom + window.scrollY) + 'px';
    dd.style.left = (rect.left + window.scrollX) + 'px';
    dd.classList.toggle('show');
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
  wrap.appendChild(bar);
  wrap.appendChild(iframe);
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
  function pingResize() {
    setTimeout(function() {
      try { var w = iframe.contentWindow; if (w) w.dispatchEvent(new Event('resize')); } catch (e) {}
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }
  function enterFs() {
    ov.classList.add('sg-fs');
    var req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) try { var p = req.call(wrap); if (p && p.catch) p.catch(function(){}); } catch (e) {}
    syncFsBtn();
    pingResize();
  }
  function exitFs() {
    nativeOn = false;
    ov.classList.remove('sg-fs');
    if (nativeFsEl()) {
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) try { var p = ex.call(document); if (p && p.catch) p.catch(function(){}); } catch (e) {}
    }
    syncFsBtn();
    pingResize();
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
    pingResize();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape' || !ov.classList.contains('show')) return;
    if (ov.classList.contains('sg-fs') && !nativeFsEl()) exitFs();
  });

  function fitContent() {
    try {
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.head || doc.getElementById('sg-fit')) return;
      var st = doc.createElement('style');
      st.id = 'sg-fit';
      st.textContent = 'html,body{overflow:hidden!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important}canvas,#unity-canvas,#unity-container{max-width:100%!important;max-height:100%!important;width:100%!important;height:100%!important;object-fit:contain!important}';
      doc.head.appendChild(st);
    } catch (e) {}
  }

  window.openGame = function(name, url) {
    titleEl.textContent = name || '';
    iframe.src = gameHref(url);
    ov.classList.add('show');
    document.body.style.overflow = 'hidden';
    iframe.addEventListener('load', fitContent, { once: true });
    dd.classList.remove('show');
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
    document.querySelectorAll('.recently-completed-wrapper').forEach((el) => { el.style.display = 'none'; });
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
  if (!out.includes('sg-dropdown')) out = out.replace('</body>', script + '\n</body>');
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

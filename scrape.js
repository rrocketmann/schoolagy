const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCHOLOGY_EMAIL = process.env.SCHOLOGY_EMAIL;
const SCHOLOGY_PASSWORD = process.env.SCHOLOGY_PASSWORD;
const HOME_FILE = path.join(__dirname, 'index.html');
const RESOURCES_FILE = path.join(__dirname, 'resources', 'index.html');
const HOME_URL = 'https://pausd.schoology.com/home';
const RESOURCES_URL = 'https://pausd.schoology.com/resources';

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
    p = p.replace(/\\/resources\\/?$/, '/');
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
    '#todo .upcoming-event,#todo .date-header,.recently-completed-wrapper{display:none!important}',
    '#sg-game-resources{background:#fff;min-height:240px}',
    '#sg-game-resources table{width:100%;border-collapse:collapse}',
    '#sg-game-resources .sg-game-row{cursor:pointer}',
    '#sg-game-resources .sg-game-row:hover{background:#f5f8fb}',
    '#sg-game-resources td{padding:10px 12px;border-bottom:1px solid #e6e6e6;vertical-align:middle}',
    '#sg-game-resources .collection-title{color:#0677ba;text-decoration:none;font-size:14px}',
    '#sg-game-resources .collection-title:hover{text-decoration:underline}',
    '#sg-game-resources .sg-new{margin-left:8px;font-size:10px;font-weight:700;letter-spacing:.04em;color:#fff;background:#0677ba;border-radius:3px;padding:2px 6px}',
    '#library-main.active-loader .loading-overlay,#library-main.active-loader .loading-image{display:none!important}',
    '#sg-sgy-player{display:flex;flex-direction:column;height:100%;min-height:70vh;background:#fff}',
    '#sg-sgy-player .popups-title{display:flex;align-items:center;gap:10px;background:#333;color:#fff;padding:8px 12px;font-size:14px;font-weight:700}',
    '#sg-sgy-player .popups-title-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#sg-sgy-player .popups-title button{background:transparent;border:0;color:#fff;cursor:pointer;font-size:13px;padding:4px 8px}',
    '#sg-sgy-player .popups-title button:hover{text-decoration:underline}',
    '#sg-sgy-player .popups-body{flex:1;min-height:0;background:#000}',
    '#sg-sgy-player iframe{width:100%;height:100%;border:0;background:#000}',
    '#sg-sgy-player.sg-fs{position:fixed;inset:0;z-index:10000;min-height:100%}',
    '#popups-overlay.sg-sgy-player-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998}',
    '#popups-overlay.sg-sgy-player-overlay.show{display:block}',
    '.popups-box.sg-sgy-player-box{display:none;position:fixed;z-index:9999;top:4%;left:4%;width:92%;height:92%;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.4);flex-direction:column}',
    '.popups-box.sg-sgy-player-box.show{display:flex}'
  ].join('');
  document.head.appendChild(s);

  function fitGameFrame(iframe) {
    try {
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.head || doc.getElementById('sg-fit')) return;
      var st = doc.createElement('style');
      st.id = 'sg-fit';
      st.textContent = 'html,body{overflow:hidden!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important}canvas,#unity-canvas,#unity-container{max-width:100%!important;max-height:100%!important;width:100%!important;height:100%!important;object-fit:contain!important}';
      doc.head.appendChild(st);
    } catch (e) {}
  }

  function playerChrome(name, href, onClose) {
    var wrap = document.createElement('div');
    wrap.id = 'sg-sgy-player';
    wrap.className = 's-library-player';
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
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-fullscreen');
    iframe.src = href;
    iframe.addEventListener('load', function(){ fitGameFrame(iframe); });
    body.appendChild(iframe);
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
    var main = document.getElementById('library-main');
    if (main) {
      main.innerHTML = '';
      main.appendChild(playerChrome(name, href, function() {
        var existing = document.getElementById('sg-game-resources');
        if (existing) existing.remove();
        fillResources();
      }));
    } else {
      showPopupPlayer(name, href);
    }
    try {
      gtag('event', 'play_game', { game_name: name, game_url: href, item_id: name, item_name: name });
    } catch (e) {}
  };

  function isResourcesPage() {
    var p = location.pathname.replace(/index\\.html$/, '').replace(/\\/$/, '');
    return /\\/resources$/.test(p) || !!document.getElementById('library-wrapper');
  }

  function gameRow(name, url) {
    var tr = document.createElement('tr');
    tr.className = 'library-collection sg-game-row';
    var tdIcon = document.createElement('td');
    var icon = document.createElement('span');
    icon.className = 'folder-icon inline-icon';
    tdIcon.appendChild(icon);
    var tdName = document.createElement('td');
    var a = document.createElement('a');
    a.className = 'collection-title';
    a.href = gameHref(url);
    a.textContent = name;
    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      openGame(name, url);
    };
    tdName.appendChild(a);
    if (isNew.indexOf(name) !== -1) {
      var badge = document.createElement('span');
      badge.className = 'sg-new';
      badge.textContent = 'NEW';
      tdName.appendChild(badge);
    }
    tr.appendChild(tdIcon);
    tr.appendChild(tdName);
    tr.onclick = function(e) {
      if (e.target.closest && e.target.closest('a')) return;
      openGame(name, url);
    };
    return tr;
  }

  function fillResources() {
    if (!isResourcesPage()) return;
    if (document.getElementById('sg-sgy-player')) return;
    var main = document.getElementById('library-main');
    if (!main || main.querySelector('#sg-game-resources')) return;
    main.classList.remove('active-loader');
    var panel = document.createElement('div');
    panel.id = 'sg-game-resources';
    var table = document.createElement('table');
    var body = document.createElement('tbody');
    for (var i = 0; i < names.length; i++) body.appendChild(gameRow(names[i], urls[i]));
    table.appendChild(body);
    panel.appendChild(table);
    main.textContent = '';
    main.appendChild(panel);
  }

  fillResources();
  var fillTimer;
  var resOb = new MutationObserver(function() {
    clearTimeout(fillTimer);
    fillTimer = setTimeout(fillResources, 50);
  });
  resOb.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;
}

function cleanHtml(html, profileName) {
  let out = html;
  if (profileName) out = out.split(profileName).join('');
  out = out.replace(/Martin Malyshau/g, '');
  ['lightboxOverlay'].forEach((id) => {
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

    document.querySelectorAll('button[aria-label*="unread notifications"]').forEach((btn) => {
      btn.setAttribute('aria-label', '0 unread notifications');
      Array.from(btn.querySelectorAll('span')).forEach((span) => {
        if (/^\d+$/.test((span.textContent || '').trim())) span.remove();
      });
    });
    document.querySelectorAll('button[aria-label*="unread messages"]').forEach((btn) => {
      btn.setAttribute('aria-label', '0 unread messages');
      Array.from(btn.querySelectorAll('span')).forEach((span) => {
        if (/^\d+$/.test((span.textContent || '').trim())) span.remove();
      });
    });
  });
}

function withSeoAndScript(html, games, script) {
  const seo =
    '<meta name="description" content="Play ' + games.length + ' unblocked games including ' +
    games.slice(0, 5).map((g) => g.name).join(', ') + ' and more. Free browser games.">\n' +
    '<meta name="keywords" content="unblocked games, school games, free online games, ' +
    games.map((g) => g.name).join(', ') + '">\n';
  let out = html.replace('</head>', seo + '</head>');
  if (!out.includes('sg-game-resources')) out = out.replace('</body>', script + '\n</body>');
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

    const resourcesHtml = await scrape(
      page,
      RESOURCES_URL,
      '#library-wrapper, #library-main, .library-collections',
      'Resources'
    );

    const homeOut = withSeoAndScript(cleanHtml(homeHtml, profileName), games, script);
    fs.writeFileSync(HOME_FILE, homeOut, 'utf8');
    console.log('Saved', HOME_FILE);

    fs.mkdirSync(path.dirname(RESOURCES_FILE), { recursive: true });
    const resourcesOut = withSeoAndScript(cleanHtml(resourcesHtml, profileName), games, script);
    fs.writeFileSync(RESOURCES_FILE, resourcesOut, 'utf8');
    console.log('Saved', RESOURCES_FILE);
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

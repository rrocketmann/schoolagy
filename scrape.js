const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCHOOLAGY_EMAIL = process.env.SCHOOLAGY_EMAIL;
const SCHOOLAGY_PASSWORD = process.env.SCHOOLAGY_PASSWORD;
const OUTPUT_FILE = path.join(__dirname, 'index.html');

if (!SCHOOLAGY_EMAIL || !SCHOOLAGY_PASSWORD) {
  console.error('Error: SCHOOLAGY_EMAIL and SCHOOLAGY_PASSWORD environment variables required');
  process.exit(1);
}

function discoverGames() {
  const gameDirs = fs.readdirSync(__dirname).filter(d => {
    if (d.startsWith('.') || d === 'node_modules' || d === '.git' || d === '.github') return false;
    try {
      return fs.statSync(path.join(__dirname, d)).isDirectory() &&
        fs.existsSync(path.join(__dirname, d, 'index.html'));
    } catch { return false; }
  }).sort();

  return gameDirs.map(dir => ({
    url: dir + '/index.html',
    name: dir
      .replace(/[-_]/g, ' ')
      .replace(/(\d)v(\d)/gi, '$1v$2')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim()
  }));
}

function buildLauncherScript(games) {
  return `<script>
(function(){
  var games = ${JSON.stringify(games)};

  var style = document.createElement('style');
  style.textContent = [
    '#sgy-games-btn{display:flex;align-items:center;gap:4px;height:48px;padding:0 12px;border:none;background:none;color:#fff;font-size:14px;cursor:pointer;white-space:nowrap;font-family:inherit}',
    '#sgy-games-btn:hover{background:rgba(255,255,255,.1)}',
    '#sgy-games-btn svg{width:10px;height:10px;fill:#fff;transition:.2s}',
    '#sgy-games-btn.open svg{transform:rotate(180deg)}',
    '#sgy-games-dropdown{display:none;position:absolute;top:48px;left:0;background:#fff;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.2);z-index:999;min-width:200px;max-height:400px;overflow-y:auto}',
    '#sgy-games-dropdown.show{display:block}',
    '#sgy-games-dropdown a{display:block;padding:10px 16px;color:#333;text-decoration:none;font-size:14px;border-bottom:1px solid #eee;cursor:pointer}',
    '#sgy-games-dropdown a:hover{background:#f5f5f5}',
    '#sgy-games-dropdown a:last-child{border-bottom:none}',
    '#sgy-game-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:9999}',
    '#sgy-game-overlay.show{display:block}',
    '#sgy-game-overlay .bar{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#1a1a1a;color:#fff;font-family:sans-serif}',
    '#sgy-game-overlay .bar .name{font-size:16px;font-weight:600}',
    '#sgy-game-overlay .bar button{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:4px}',
    '#sgy-game-overlay .bar button:hover{background:rgba(255,255,255,.15)}',
    '#sgy-game-overlay iframe{width:100%;height:calc(100% - 42px);border:none;background:#000}'
  ].join('');
  document.head.appendChild(style);

  var observer = new MutationObserver(function() {
    var nav = document.querySelector('nav[role="navigation"] ul');
    if (!nav || document.getElementById('sgy-games-btn-container')) return;

    var li = document.createElement('li');
    li.id = 'sgy-games-btn-container';
    li.style.position = 'relative';

    var btn = document.createElement('button');
    btn.id = 'sgy-games-btn';
    btn.innerHTML = 'Resources <svg viewBox="0 0 15 10"><use href="#icon-caret-v2-2f65r"></use></svg>';
    li.appendChild(btn);

    var dd = document.createElement('div');
    dd.id = 'sgy-games-dropdown';
    games.forEach(function(g) {
      var a = document.createElement('a');
      a.textContent = g.name;
      a.onclick = function(e) {
        e.preventDefault();
        openGame(g);
      };
      dd.appendChild(a);
    });
    li.appendChild(dd);

    btn.onclick = function(e) {
      e.stopPropagation();
      btn.classList.toggle('open');
      dd.classList.toggle('show');
    };
    document.addEventListener('click', function() {
      btn.classList.remove('open');
      dd.classList.remove('show');
    });

    nav.appendChild(li);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  var overlay = document.createElement('div');
  overlay.id = 'sgy-game-overlay';
  overlay.innerHTML = '<div class="bar"><span class="name"></span><div><button id="sgy-fs-btn">⛶</button><button id="sgy-close-btn">✕</button></div></div><iframe allowfullscreen allow="autoplay; fullscreen"></iframe>';
  document.body.appendChild(overlay);

  window.openGame = function(g) {
    overlay.querySelector('.name').textContent = g.name;
    overlay.querySelector('iframe').src = g.url;
    overlay.classList.add('show');
  };

  document.getElementById('sgy-fs-btn').onclick = function() {
    var iframe = overlay.querySelector('iframe');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
  };
  document.getElementById('sgy-close-btn').onclick = function() {
    overlay.classList.remove('show');
    overlay.querySelector('iframe').src = '';
  };
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      overlay.querySelector('iframe').src = '';
    }
  };
})();
</script>`;
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

    console.log('Navigating to pausd.schoology.com...');
    await page.goto('https://pausd.schoology.com', { waitUntil: 'networkidle2', timeout: 60000 });

    if (page.url().includes('classlink')) {
      console.log('On ClassLink – logging in...');

      const usernameInput = await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 15000 });
      const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 15000 });

      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type(SCHOOLAGY_EMAIL);
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type(SCHOOLAGY_PASSWORD);

      const loginBtn =
        (await page.$('button[data-cy="loginButton"]')) ||
        (await page.$('button[type="submit"]'));

      if (!loginBtn) throw new Error('Could not find login button');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        loginBtn.click(),
      ]);

      console.log('Post-login URL:', page.url());
    }

    if (!page.url().includes('schoology.com/home')) {
      console.log('Navigating to /home...');
      await page.goto('https://pausd.schoology.com/home', { waitUntil: 'networkidle2', timeout: 60000 });
    }

    const html = await page.content();

    let cleaned = html.replace(/Martin Malyshau/g, '');

    const games = discoverGames();
    console.log('Discovered', games.length, 'games');
    cleaned = cleaned.replace('</body>', buildLauncherScript(games) + '\n</body>');

    fs.writeFileSync(OUTPUT_FILE, cleaned, 'utf8');
    console.log('Saved', cleaned.length, 'bytes to', OUTPUT_FILE);
  } catch (err) {
    console.error('Error:', err.message);
    const page = (await browser.pages())[0];
    if (page) await page.screenshot({ path: '/tmp/error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

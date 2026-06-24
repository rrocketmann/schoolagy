const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCHOLOGY_EMAIL = process.env.SCHOLOGY_EMAIL;
const SCHOLOGY_PASSWORD = process.env.SCHOLOGY_PASSWORD;
const OUTPUT_FILE = path.join(__dirname, 'index.html');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');

if (!SCHOLOGY_EMAIL || !SCHOLOGY_PASSWORD) {
  console.error('Error: SCHOLOGY_EMAIL and SCHOLOGY_PASSWORD environment variables required');
  process.exit(1);
}

function getTemplate() {
  if (fs.existsSync(TEMPLATE_FILE)) {
    return fs.readFileSync(TEMPLATE_FILE, 'utf8');
  }
  return fs.readFileSync(OUTPUT_FILE, 'utf8');
}

const GAMES = [
  {url:'basketrandom/index.html',name:'Basketball Random'},
  {url:'slope/index.html',name:'Slope'},
  {url:'drivemad/index.html',name:'Drive Mad'},
  {url:'retrobowl/index.html',name:'Retro Bowl'},
  {url:'2048/index.html',name:'2048'},
  {url:'bitlife/index.html',name:'BitLife'},
  {url:'subwaysurferssingapore/index.html',name:'Subway Surfers Singapore'},
  {url:'vex3/index.html',name:'Vex 3'},
  {url:'vex4/index.html',name:'Vex 4'},
  {url:'vex5/index.html',name:'Vex 5'},
  {url:'vex6/index.html',name:'Vex 6'},
  {url:'tetris/index.html',name:'Tetris'},
  {url:'tinyfishing/index.html',name:'Tiny Fishing'},
  {url:'eaglercraft/index.html',name:'Eaglercraft'},
  {url:'clusterrush/index.html',name:'Cluster Rush'},
  {url:'retrobowlcollege/index.html',name:'Retro Bowl College'},
  {url:'tombofthemask/index.html',name:'Tomb of the Mask'},
  {url:'chromedino/index.html',name:'Chrome Dino'},
  {url:'1v1lol/index.html',name:'1v1.LOL'},
  {url:'boxingrandom/index.html',name:'Boxing Random'},
  {url:'breakout/index.html',name:'Breakout'},
  {url:'cookieclicker/index.html',name:'Cookie Clicker'},
  {url:'crossyroad/index.html',name:'Crossy Road'},
  {url:'doodlejump/index.html',name:'Doodle Jump'},
  {url:'doom/index.html',name:'DOOM'},
  {url:'fireboyandwatergirlforesttemple/index.html',name:'Fireboy and Watergirl'},
  {url:'fruitninja/index.html',name:'Fruit Ninja'},
  {url:'geometrydash/index.html',name:'Geometry Dash'},
  {url:'grindcraft/index.html',name:'Grindcraft'},
  {url:'ovo2/index.html',name:'OvO 2'},
  {url:'polytrack/index.html',name:'PolyTrack'},
  {url:'slope2/index.html',name:'Slope 2'},
  {url:'subwaysurfers/index.html',name:'Subway Surfers'},
  {url:'tunnelrush/index.html',name:'Tunnel Rush'}
];

const GAMES_LIST = GAMES.map(g => `<div class="game-item" onclick="selectGame('${g.url}')">${g.name}</div>`).join('');

const GAME_PANEL_HTML = `
<div id="game-panel">
  <div id="game-panel-header">
    <span id="game-panel-title">Games</span>
    <span id="game-panel-close" onclick="closeGamePanel()">&#10005;</span>
  </div>
  <div id="game-list">
    ${GAMES_LIST}
  </div>
  <div id="game-frame-container" style="display:none;">
    <iframe id="game-frame" src="" allowfullscreen allow="fullscreen; pointer-lock"></iframe>
  </div>
</div>

<button id="games-toggle" onclick="toggleGamePanel()">&#127918; Games</button>

<style>
#games-toggle {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10001;
  background: #0770a2;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: background 0.15s;
}
#games-toggle:hover {
  background: #055a80;
}
#game-panel {
  position: fixed;
  top: 0;
  right: -33.33vw;
  width: 33.33vw;
  height: 100vh;
  background: #fff;
  border-left: 1px solid #ddd;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  transition: right 0.3s ease;
}
#game-panel.open {
  right: 0;
}
#game-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #023751;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}
#game-panel-close {
  cursor: pointer;
  font-size: 20px;
  padding: 2px 8px;
  border-radius: 3px;
}
#game-panel-close:hover {
  background: rgba(255,255,255,0.2);
}
#game-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.game-item {
  padding: 11px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.12s;
}
.game-item:hover {
  background: #f0f7fc;
  color: #0770a2;
}
#game-frame-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
#game-frame {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  background: #000;
  flex: 1;
}
body.no-scroll {
  overflow: hidden;
}
#page-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
}
#page-overlay.open {
  display: block;
}
</style>

<script>
function toggleGamePanel() {
  var panel = document.getElementById('game-panel');
  var overlay = document.getElementById('page-overlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.classList.toggle('no-scroll', panel.classList.contains('open'));
}

function selectGame(url) {
  document.getElementById('game-list').style.display = 'none';
  document.getElementById('game-frame-container').style.display = 'flex';
  document.getElementById('game-frame').src = url;
}

function closeGamePanel() {
  document.getElementById('game-panel').classList.remove('open');
  document.getElementById('page-overlay').classList.remove('open');
  document.getElementById('game-frame').src = '';
  document.getElementById('game-list').style.display = 'block';
  document.getElementById('game-frame-container').style.display = 'none';
  document.body.classList.remove('no-scroll');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeGamePanel();
  }
  if (e.key === 'f' && document.getElementById('game-frame').src) {
    var iframe = document.getElementById('game-frame');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
  }
});
</script>

<div id="page-overlay" onclick="closeGamePanel()"></div>
`;

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to pausd.schoology.com...');
    await page.goto('https://pausd.schoology.com', { waitUntil: 'load', timeout: 60000 });

    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: '/tmp/step1-initial.png', fullPage: true });
    console.log('Step 1 - URL:', page.url());

    if (page.url().includes('classlink')) {
      console.log('On ClassLink login page');

      await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 20000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 3000));

      await page.screenshot({ path: '/tmp/step2-classlink.png', fullPage: true });

      const usernameInput = await page.$('input[type="text"]') || await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      if (usernameInput && passwordInput) {
        console.log('Filling credentials...');
        await usernameInput.click({ clickCount: 3 });
        await usernameInput.type(SCHOLOGY_EMAIL, { delay: 30 });
        await passwordInput.click({ clickCount: 3 });
        await passwordInput.type(SCHOLOGY_PASSWORD, { delay: 30 });

        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '/tmp/step3-filled.png', fullPage: true });

        const loginBtn = await page.$('button[type="submit"]');
        if (loginBtn) {
          console.log('Clicking Sign In button...');

          try {
            await Promise.all([
              loginBtn.click(),
              page.waitForNavigation({ waitUntil: 'load', timeout: 30000 })
            ]);
          } catch (navErr) {
            console.log('Navigation error (expected):', navErr.message);
            await new Promise(r => setTimeout(r, 5000));
          }

          await page.screenshot({ path: '/tmp/step4-after-login.png', fullPage: true }).catch(() => {});
          console.log('After login URL:', page.url());

          if (page.url().includes('login.classlink.com')) {
            console.log('Still on ClassLink login page - credentials may be incorrect');
            const bodyText = await page.evaluate(() => document.body.innerText);
            console.log('Page text:', bodyText.substring(0, 300));
          }
        }
      } else {
        console.log('Could not find username/password inputs!');
      }
    }

    console.log('Navigating to Schoology home...');
    try {
      await page.goto('https://pausd.schoology.com/home', { waitUntil: 'load', timeout: 60000 });
    } catch (navErr) {
      console.log('Navigation error:', navErr.message);
    }

    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: '/tmp/step5-home.png', fullPage: true }).catch(() => {});
    console.log('Home URL:', page.url());

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page body length:', bodyText.length);

    // Extract dynamic sections
    console.log('Extracting dynamic sections...');
    const dynamicContent = await page.evaluate(() => {
      const sections = {};

      const feedContainer = document.querySelector('#home-feed-container');
      if (feedContainer) sections.feed = feedContainer.outerHTML;

      const todoSection = document.querySelector('#todo');
      if (todoSection) sections.todo = todoSection.outerHTML;

      const eventsSection = document.querySelector('#upcoming-events');
      if (eventsSection) sections.events = eventsSection.outerHTML;

      const recentlyCompleted = document.querySelector('.recently-completed-wrapper');
      if (recentlyCompleted) sections.recentlyCompleted = recentlyCompleted.outerHTML;

      const reminders = document.querySelector('.reminders-wrapper');
      if (reminders) sections.reminders = reminders.outerHTML;

      const edgeFilters = document.querySelector('#edge-filters');
      if (edgeFilters) sections.edgeFilters = edgeFilters.outerHTML;

      const smartBox = document.querySelector('#smart-box');
      if (smartBox) sections.smartBox = smartBox.outerHTML;

      return sections;
    });

    console.log('Extracted sections:', Object.keys(dynamicContent));

    // Load template
    let template = getTemplate();

    // Replace dynamic sections in template
    const replacements = [
      { key: 'feed', selector: /(<div id="home-feed-container"[^>]*>[\s\S]*?<\/div>\s*<\/div>)/ },
      { key: 'todo', selector: /(<div id="todo"[^>]*>[\s\S]*?<\/aside>\s*<\/div>)/ },
      { key: 'events', selector: /(<div id="upcoming-events"[^>]*>[\s\S]*?<\/aside>\s*<\/div>)/ },
      { key: 'recentlyCompleted', selector: /(<div class="recently-completed-wrapper"[^>]*>[\s\S]*?<\/aside>\s*<\/div>)/ },
      { key: 'reminders', selector: /(<div class="reminders-wrapper"[^>]*>[\s\S]*?<\/div>\s*<\/div>)/ },
      { key: 'edgeFilters', selector: /(<div id='edge-filters'[^>]*>[\s\S]*?<\/div>\s*<\/div>)/ },
      { key: 'smartBox', selector: /(<div id="smart-box"[^>]*>[\s\S]*?<\/div>\s*<\/div>)/ }
    ];

    for (const { key, selector } of replacements) {
      if (dynamicContent[key]) {
        const match = template.match(selector);
        if (match) {
          template = template.replace(match[0], dynamicContent[key]);
          console.log(`Replaced ${key} section`);
        } else {
          console.log(`Could not find ${key} section in template`);
        }
      }
    }

    // Inject game panel before </body>
    template = template.replace('</body>', GAME_PANEL_HTML + '</body>');

    fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
    console.log(`Saved updated HTML to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Error during scraping:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

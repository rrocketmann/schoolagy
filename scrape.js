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

        const loginBtn = await page.$('button[data-cy="loginButton"]') ||
          await page.$('button[type="submit"]') ||
          await page.$('button.cl-button-primary') ||
          await page.evaluateHandle(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.find(b => b.offsetParent !== null && b.textContent.trim().length > 0) || null;
          });
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

    // Navigate to Schoology home
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

    // Extract dynamic sections as plain text content
    console.log('Extracting dynamic sections...');
    const dynamicContent = await page.evaluate(() => {
      const sections = {};

      // Feed container
      const feedContainer = document.querySelector('#home-feed-container');
      if (feedContainer) sections.feed = feedContainer.innerHTML;

      // To Do section
      const todoSection = document.querySelector('#todo');
      if (todoSection) sections.todo = todoSection.innerHTML;

      // Upcoming Events
      const eventsSection = document.querySelector('#upcoming-events');
      if (eventsSection) sections.events = eventsSection.innerHTML;

      // Recently Completed
      const recentlyCompleted = document.querySelector('.recently-completed-wrapper');
      if (recentlyCompleted) sections.recentlyCompleted = recentlyCompleted.innerHTML;

      // Reminders
      const reminders = document.querySelector('.reminders-wrapper');
      if (reminders) sections.reminders = reminders.innerHTML;

      return sections;
    });

    console.log('Extracted sections:', Object.keys(dynamicContent));

    // Load template
    let template = getTemplate();

    // Replace dynamic section contents in template
    const sectionReplacements = [
      { key: 'feed', id: 'home-feed-container' },
      { key: 'todo', id: 'todo' },
      { key: 'events', id: 'upcoming-events' },
      { key: 'recentlyCompleted', class: 'recently-completed-wrapper' },
      { key: 'reminders', class: 'reminders-wrapper' }
    ];

    for (const { key, id, cls } of sectionReplacements) {
      if (dynamicContent[key]) {
        let match;
        if (id) {
          // Match <div id="...">...</div> with nested content
          const regex = new RegExp(`(<div\\s+id="${id}"[^>]*>)([\\s\\S]*?)(</div>)`, 'i');
          match = template.match(regex);
          if (match) {
            template = template.replace(match[2], dynamicContent[key]);
            console.log(`Replaced ${key} section content`);
          }
        } else if (cls) {
          const regex = new RegExp(`(<div\\s+class="${cls}"[^>]*>)([\\s\\S]*?)(</div>)`, 'i');
          match = template.match(regex);
          if (match) {
            template = template.replace(match[2], dynamicContent[key]);
            console.log(`Replaced ${key} section content`);
          }
        }
        if (!match) {
          console.log(`Could not find ${key} section in template`);
        }
      }
    }

    // Inject minimal game launcher
    const gameScript = `<script>
(function(){
  var g=[{u:'basketrandom/index.html',n:'Basketball Random'},{u:'slope/index.html',n:'Slope'},{u:'drivemad/index.html',n:'Drive Mad'},{u:'retrobowl/index.html',n:'Retro Bowl'},{u:'2048/index.html',n:'2048'},{u:'bitlife/index.html',n:'BitLife'},{u:'subwaysurferssingapore/index.html',n:'Subway Surfers Singapore'},{u:'vex3/index.html',n:'Vex 3'},{u:'vex4/index.html',n:'Vex 4'},{u:'vex5/index.html',n:'Vex 5'},{u:'vex6/index.html',n:'Vex 6'},{u:'tetris/index.html',n:'Tetris'},{u:'tinyfishing/index.html',n:'Tiny Fishing'},{u:'eaglercraft/index.html',n:'Eaglercraft'},{u:'clusterrush/index.html',n:'Cluster Rush'},{u:'retrobowlcollege/index.html',n:'Retro Bowl College'},{u:'tombofthemask/index.html',n:'Tomb of the Mask'},{u:'chromedino/index.html',n:'Chrome Dino'},{u:'1v1lol/index.html',n:'1v1.LOL'},{u:'boxingrandom/index.html',n:'Boxing Random'},{u:'breakout/index.html',n:'Breakout'},{u:'cookieclicker/index.html',n:'Cookie Clicker'},{u:'crossyroad/index.html',n:'Crossy Road'},{u:'doodlejump/index.html',n:'Doodle Jump'},{u:'doom/index.html',n:'DOOM'},{u:'fireboyandwatergirlforesttemple/index.html',n:'Fireboy and Watergirl'},{u:'fruitninja/index.html',n:'Fruit Ninja'},{u:'geometrydash/index.html',n:'Geometry Dash'},{u:'grindcraft/index.html',n:'Grindcraft'},{u:'ovo2/index.html',n:'OvO 2'},{u:'polytrack/index.html',n:'PolyTrack'},{u:'slope2/index.html',n:'Slope 2'},{u:'subwaysurfers/index.html',n:'Subway Surfers'},{u:'tunnelrush/index.html',n:'Tunnel Rush'}];
  var d=document.createElement('div');d.id='gdd';d.style.cssText='display:none;position:absolute;background:#fff;border:1px solid #ddd;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:9999;padding:4px 0;min-width:180px;width:max-content;max-height:70vh;overflow-y:auto;';
  for(var i=0;i<g.length;i++){var a=document.createElement('div');a.setAttribute('data-u',g[i].u);a.textContent=g[i].n;a.style.cssText='padding:8px 16px;font-size:14px;color:#333;cursor:pointer;';a.onmouseover=function(){this.style.background='#f0f7fc';this.style.color='#0770a2';};a.onmouseout=function(){this.style.background='';this.style.color='';};d.appendChild(a);}
  document.body.appendChild(d);
  var o=document.createElement('div');o.id='gov';o.style.cssText='display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background:rgba(0,0,0,0.52);align-items:center;justify-content:center;';
  var f=document.createElement('iframe');f.src='basketrandom/index.html';f.allowFullscreen=true;f.setAttribute('allow','fullscreen; pointer-lock');f.style.cssText='width:70vw;height:70vh;border:1px solid #ddd;background:#000;';
  o.appendChild(f);document.body.appendChild(o);
  d.querySelectorAll('div').forEach(function(a){a.onclick=function(){f.src=this.getAttribute('data-u');d.style.display='none';o.style.display='flex';document.body.style.overflow='hidden';};});
  o.onclick=function(e){if(e.target===o){o.style.display='none';document.body.style.overflow='';}};
  document.addEventListener('click',function(e){if(!d.contains(e.target)&&!e.target.matches('#gbtn, #gbtn *')){d.style.display='none';}});
  document.addEventListener('keydown',function(e){if(e.key==='f'&&o.style.display==='flex'){if(f.requestFullscreen)f.requestFullscreen();}if(e.key==='Escape'&&o.style.display==='flex'){o.style.display='none';document.body.style.overflow='';}});
  function findBtn(){var ls=document.querySelectorAll('a,span[tabindex],button');for(var i=0;i<ls.length;i++){var t=(ls[i].textContent||'').trim().toLowerCase();if(t==='resources'||t.indexOf('resources')===0){var p=ls[i].closest('nav')||ls[i].closest('#header');if(p)return ls[i];}}return null;}
  function attachBtn(b){if(b.getAttribute('data-g'))return;b.setAttribute('data-g','1');b.id='gbtn';b.style.cursor='pointer';b.onclick=function(e){e.preventDefault();e.stopPropagation();if(d.style.display==='block'){d.style.display='none';}else{var r=b.getBoundingClientRect();d.style.top=(r.bottom+window.scrollY)+'px';d.style.left=(r.left+window.scrollX)+'px';d.style.display='block';}};}
  document.addEventListener('click',function(e){var b=findBtn();if(b&&!b.getAttribute('data-g'))attachBtn(b);},true);
  var obs=new MutationObserver(function(){var b=findBtn();if(b)attachBtn(b);});obs.observe(document.body,{childList:true,subtree:true});
  var att=0;var chk=function(){var b=findBtn();if(b)attachBtn(b);else if(att<100){att++;setTimeout(chk,300);}};chk();
})();
</script>`;

    template = template.replace('</body>', gameScript + '</body>');

    fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
    console.log(`Saved updated HTML to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Error during scraping:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

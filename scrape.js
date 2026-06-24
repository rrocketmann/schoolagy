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

const gameLauncherScript = `
<script>
(function(){
  var games=[
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
    {url:'fireboyandwatergirlforesttemple/index.html',name:'Fireboy and Watergirl: Forest Temple'},
    {url:'fruitninja/index.html',name:'Fruit Ninja'},
    {url:'geometrydash/index.html',name:'Geometry Dash'},
    {url:'grindcraft/index.html',name:'Grindcraft'},
    {url:'ovo2/index.html',name:'OvO 2'},
    {url:'polytrack/index.html',name:'PolyTrack'},
    {url:'slope2/index.html',name:'Slope 2'},
    {url:'subwaysurfers/index.html',name:'Subway Surfers'},
    {url:'tunnelrush/index.html',name:'Tunnel Rush'}
  ];

  var dd=document.createElement('div');
  dd.id='resources-dropdown';
  dd.style.cssText='display:none;position:fixed;top:56px;left:0;right:0;max-height:70vh;overflow-y:auto;background:#fff;border-bottom:1px solid #ddd;box-shadow:0 4px 20px rgba(0,0,0,.12);z-index:9999;padding:4px 0;';
  for(var i=0;i<games.length;i++){
    var item=document.createElement('div');
    item.className='dropdown-item';
    item.setAttribute('data-url',games[i].url);
    item.textContent=games[i].name;
    item.style.cssText='padding:10px 20px;font-size:14px;color:#333;cursor:pointer;';
    item.onmouseover=function(){this.style.background='#f0f7fc';this.style.color='#0770a2';};
    item.onmouseout=function(){this.style.background='';this.style.color='';};
    dd.appendChild(item);
  }
  document.body.appendChild(dd);

  var overlay=document.createElement('div');
  overlay.id='game-overlay';
  overlay.style.cssText='display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background:rgba(0,0,0,0.52);align-items:center;justify-content:center;';
  
  var gameContainer=document.createElement('div');
  gameContainer.style.cssText='position:relative;width:85vw;height:85vh;';
  
  var iframe=document.createElement('iframe');
  iframe.id='game-iframe';
  iframe.src='basketrandom/index.html';
  iframe.allowFullscreen=true;
  iframe.setAttribute('allow','fullscreen; pointer-lock');
  iframe.style.cssText='width:100%;height:100%;border:3px solid #ddd;background:#000;';
  
  var fakeOverlay=document.createElement('div');
  fakeOverlay.id='game-fake-overlay';
  fakeOverlay.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid #ddd;';
  fakeOverlay.innerHTML='<div style="width:50px;height:50px;border:4px solid #ddd;border-top:4px solid #0770a2;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:16px;color:#555;font-family:Arial,sans-serif;font-size:14px;">Loading game...</p><style>@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}</style>';
  
  gameContainer.appendChild(iframe);
  gameContainer.appendChild(fakeOverlay);
  overlay.appendChild(gameContainer);
  document.body.appendChild(overlay);

  var frameCount=0;
  var frameInterval=null;
  
  function startFrameHiding(){
    frameCount=0;
    if(frameInterval)clearInterval(frameInterval);
    frameInterval=setInterval(function(){
      frameCount++;
      if(frameCount%3===0){
        fakeOverlay.style.display='none';
      }else{
        fakeOverlay.style.display='flex';
      }
    },1000/60);
  }
  
  function stopFrameHiding(){
    if(frameInterval){clearInterval(frameInterval);frameInterval=null;}
    fakeOverlay.style.display='none';
  }

  function isGameOpen(){return overlay.style.display==='flex';}
  function updateDim(){
    var open=isGameOpen();
    var bodyEl=document.getElementById('body');
    if(bodyEl){bodyEl.style.filter=open?'brightness(0.42) saturate(0.7)':'';bodyEl.style.pointerEvents=open?'none':'';}
    document.body.style.overflow=open?'hidden':'';
  }

  overlay.addEventListener('click',function(e){
    if(e.target===overlay){overlay.style.display='none';stopFrameHiding();updateDim();}
  });

  dd.querySelectorAll('.dropdown-item').forEach(function(item){
    item.addEventListener('click',function(){
      iframe.src=this.getAttribute('data-url');
      dd.style.display='none';
      overlay.style.display='flex';
      startFrameHiding();
      updateDim();
      setTimeout(function(){iframe.focus();},100);
    });
  });

  document.addEventListener('click',function(e){
    if(!dd.contains(e.target)&&!e.target.matches('#resources-btn, #resources-btn *')){
      dd.style.display='none';
    }
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='f'&&isGameOpen()){
      if(iframe.requestFullscreen){iframe.requestFullscreen();}
      else if(iframe.webkitRequestFullscreen){iframe.webkitRequestFullscreen();}
      else if(iframe.mozRequestFullScreen){iframe.mozRequestFullScreen();}
      else if(iframe.msRequestFullscreen){iframe.msRequestFullscreen();}
    }
    if(e.key==='Escape'&&isGameOpen()){
      overlay.style.display='none';stopFrameHiding();updateDim();
    }
  });

  function findResourcesBtn(){
    var links=document.querySelectorAll('a, [role="menuitem"], [role="button"], button, span[tabindex]');
    for(var i=0;i<links.length;i++){
      var el=links[i];
      var text=(el.textContent||'').trim().toLowerCase();
      if(text==='resources'||text.indexOf('resources')===0){
        var parent=el.closest('nav')||el.closest('[role="navigation"]')||el.closest('#header')||el.closest('.site-navigation');
        if(parent){return el;}
      }
    }
    return null;
  }

  function attachResourcesBtn(btn){
    if(btn.getAttribute('data-game-hook'))return;
    btn.setAttribute('data-game-hook','1');
    btn.id='resources-btn';
    btn.style.cursor='pointer';
    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      dd.style.display=dd.style.display==='block'?'none':'block';
    });
  }

  document.addEventListener('click',function(e){
    var btn=findResourcesBtn();
    if(btn&&!btn.getAttribute('data-game-hook')){
      attachResourcesBtn(btn);
    }
  },true);

  var observer=new MutationObserver(function(){
    var btn=findResourcesBtn();
    if(btn)attachResourcesBtn(btn);
  });
  observer.observe(document.body,{childList:true,subtree:true});

  var attempts=0;
  var poll=function(){
    var btn=findResourcesBtn();
    if(btn){attachResourcesBtn(btn);}
    else if(attempts<100){attempts++;setTimeout(poll,300);}
  };
  poll();
})();
</script>
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

    // Inject game launcher script
    template = template.replace('</body>', gameLauncherScript + '</body>');

    fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
    console.log(`Saved updated HTML to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Error during scraping:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

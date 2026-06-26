const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCHOLOGY_EMAIL = process.env.SCHOLOGY_EMAIL;
const SCHOLOGY_PASSWORD = process.env.SCHOLOGY_PASSWORD;
const OUTPUT_FILE = path.join(__dirname, 'index.html');

if (!SCHOLOGY_EMAIL || !SCHOLOGY_PASSWORD) {
  console.error('Error: SCHOLOGY_EMAIL and SCHOLOGY_PASSWORD environment variables required');
  process.exit(1);
}

async function screenshot(page, name) {
  await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
  console.log(`Screenshot: ${name}`);
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

    // Step 1: Go to pausd.schoology.com
    console.log('Step 1: Navigating to pausd.schoology.com...');
    await page.goto('https://pausd.schoology.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 8000));
    await screenshot(page, 'step1-initial');
    console.log('URL:', page.url());

    // Step 2: Wait for ClassLink to load and find login fields
    console.log('Step 2: Waiting for login form...');

    // Wait for any input to appear
    await page.waitForSelector('input', { timeout: 20000 }).catch(() => {
      console.log('No input found after 20s');
    });

    await new Promise(r => setTimeout(r, 3000));
    await screenshot(page, 'step2-waited');

    // Get all inputs and buttons for debugging
    const inputs = await page.$$('input');
    const buttons = await page.$$('button');
    console.log(`Found ${inputs.length} inputs, ${buttons.length} buttons`);

    // Log input attributes
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const attrs = await inputs[i].evaluate(el => {
        const a = {};
        for (const attr of el.attributes) a[attr.name] = attr.value;
        return a;
      });
      console.log(`Input ${i}:`, JSON.stringify(attrs));
    }

    // Find username field - try multiple selectors
    let usernameInput = null;
    let passwordInput = null;

    // Try common ClassLink selectors
    const usernameSelectors = [
      'input[placeholder*="username" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="ID" i]',
      'input[name="username"]',
      'input[name="email"]',
      'input[type="text"]',
      'input[type="email"]',
      'input[autocomplete="username"]',
      'input'
    ];

    for (const sel of usernameSelectors) {
      usernameInput = await page.$(sel);
      if (usernameInput) {
        console.log(`Found username input with selector: ${sel}`);
        break;
      }
    }

    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[autocomplete="current-password"]'
    ];

    for (const sel of passwordSelectors) {
      passwordInput = await page.$(sel);
      if (passwordInput) {
        console.log(`Found password input with selector: ${sel}`);
        break;
      }
    }

    if (usernameInput && passwordInput) {
      console.log('Step 3: Filling credentials...');

      // Click username field and type
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type(SCHOLOGY_EMAIL, { delay: 30 });

      // Click password field and type
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type(SCHOLOGY_PASSWORD, { delay: 30 });

      await new Promise(r => setTimeout(r, 1000));
      await screenshot(page, 'step3-filled');

      // Find login button
      let loginBtn = null;
      const loginBtnSelectors = [
        'button[type="submit"]',
        'button[data-cy="loginButton"]',
        'button.cl-button-primary',
        'button.cl-button',
        'input[type="submit"]',
        'button'
      ];

      for (const sel of loginBtnSelectors) {
        loginBtn = await page.$(sel);
        if (loginBtn) {
          console.log(`Found login button with selector: ${sel}`);
          break;
        }
      }

      if (loginBtn) {
        console.log('Clicking login button...');
        await loginBtn.click();
      } else {
        console.log('No login button found, pressing Enter...');
        await passwordInput.press('Enter');
      }

      // Wait for navigation and redirects
      await new Promise(r => setTimeout(r, 10000));
      await screenshot(page, 'step4-after-login');
      console.log('URL after login:', page.url());

      // If still on classlink, wait more
      if (page.url().includes('classlink')) {
        console.log('Still on ClassLink, waiting for redirect...');
        await new Promise(r => setTimeout(r, 10000));
        await screenshot(page, 'step4b-still-waiting');
        console.log('URL after more wait:', page.url());
      }
    } else {
      console.log('ERROR: Could not find login fields!');
      console.log('Page title:', await page.title());
      console.log('Page HTML (first 2000):', (await page.content()).substring(0, 2000));
      await screenshot(page, 'step4-error-no-fields');
    }

    // Step 5: Navigate to Schoology home
    console.log('Step 5: Navigating to Schoology home...');
    await page.goto('https://pausd.schoology.com/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000));
    await screenshot(page, 'step5-home');
    console.log('Final URL:', page.url());

    // Check content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body text length:', bodyText.length);
    console.log('First 500 chars:', bodyText.substring(0, 500));

    console.log('Extracting HTML...');
    const html = await page.content();

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
  var iframe=document.createElement('iframe');
  iframe.id='game-iframe';
  iframe.src='basketrandom/index.html';
  iframe.allowFullscreen=true;
  iframe.setAttribute('allow','fullscreen; pointer-lock');
  iframe.style.cssText='width:85vw;height:85vh;border:3px solid #ddd;background:#000;';
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  function isGameOpen(){return overlay.style.display==='flex';}
  function updateDim(){
    var open=isGameOpen();
    var bodyEl=document.getElementById('body');
    if(bodyEl){bodyEl.style.filter=open?'brightness(0.42) saturate(0.7)':'';bodyEl.style.pointerEvents=open?'none':'';}
    document.body.style.overflow=open?'hidden':'';
  }

  overlay.addEventListener('click',function(e){
    if(e.target===overlay){overlay.style.display='none';updateDim();}
  });

  dd.querySelectorAll('.dropdown-item').forEach(function(item){
    item.addEventListener('click',function(){
      iframe.src=this.getAttribute('data-url');
      dd.style.display='none';
      overlay.style.display='flex';
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
      overlay.style.display='none';updateDim();
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

    const modifiedHtml = html.replace('</body>', gameLauncherScript + '</body>');
    fs.writeFileSync(OUTPUT_FILE, modifiedHtml, 'utf8');
    console.log(`Saved to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

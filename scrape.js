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

    fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
    console.log(`Saved updated HTML to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Error during scraping:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

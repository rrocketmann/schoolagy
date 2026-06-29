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

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Step 1: Navigate to pausd.schoology.com...');
    await page.goto('https://pausd.schoology.com', { waitUntil: 'load', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: '/tmp/step1.png', fullPage: true });
    console.log('URL:', page.url());

    if (page.url().includes('classlink')) {
      console.log('Step 2: On ClassLink, waiting for form...');
      await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 15000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));

      const usernameInput = await page.$('input[type="text"]') || await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      if (usernameInput && passwordInput) {
        console.log('Step 3: Filling credentials...');
        await usernameInput.click({ clickCount: 3 });
        await usernameInput.type(SCHOLOGY_EMAIL, { delay: 30 });
        await passwordInput.click({ clickCount: 3 });
        await passwordInput.type(SCHOLOGY_PASSWORD, { delay: 30 });

        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '/tmp/step3.png', fullPage: true });

        const loginBtn = await page.$('button[type="submit"]');
        if (loginBtn) {
          console.log('Step 4: Clicking login...');
          try {
            await Promise.all([
              loginBtn.click(),
              page.waitForNavigation({ waitUntil: 'load', timeout: 30000 })
            ]);
          } catch (e) {
            await new Promise(r => setTimeout(r, 5000));
          }
          await page.screenshot({ path: '/tmp/step4.png', fullPage: true });
          console.log('After login URL:', page.url());
        }
      }
    }

    console.log('Step 5: Navigate to home...');
    await page.goto('https://pausd.schoology.com/home', { waitUntil: 'load', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: '/tmp/step5.png', fullPage: true });
    console.log('Home URL:', page.url());

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body length:', bodyText.length);

    console.log('Step 6: Extracting full HTML...');
    const html = await page.content();
    fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
    console.log('Saved to', OUTPUT_FILE);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

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
    fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
    console.log('Saved', html.length, 'bytes to', OUTPUT_FILE);
  } catch (err) {
    console.error('Error:', err.message);
    const page = (await browser.pages())[0];
    if (page) await page.screenshot({ path: '/tmp/error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

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

function extractDiv(html, id) {
  const search = 'id="' + id + '"';
  let pos = html.indexOf(search);
  if (pos === -1) return null;
  while (pos > 0 && html[pos] !== '<') pos--;
  if (html.substring(pos, pos + 4) !== '<div') return null;

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
        if (html.substring(i, i + 6) === '</div>') { depth--; if (depth === 0) return html.substring(pos, i + 6); }
        inTag = true;
      } else if (html.substring(i, i + 4) === '<div') { depth++; inTag = true; }
      else { inTag = true; }
    }
  }
  return null;
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
      await usernameInput.type(SCHOLOGY_EMAIL);
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type(SCHOLOGY_PASSWORD);

      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: '/tmp/step3.png', fullPage: true });

      const loginBtn =
        (await page.$('button[data-cy="loginButton"]')) ||
        (await page.$('button[type="submit"]')) ||
        (await page.$('button.cl-button-primary')) ||
        (await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          return btns.find(b => b.offsetParent !== null && b.textContent.trim().length > 0) || null;
        }));

      if (!loginBtn) throw new Error('Could not find login button');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        loginBtn.click(),
      ]);

      console.log('Post-login URL:', page.url());
    }

    if (!page.url().includes('schoology.com/home')) {
      console.log('Navigating to /home...');
      await page.goto('https://pausd.schoology.com/home', { waitUntil: 'networkidle0', timeout: 120000 });
    }

    console.log('Waiting for feed to load...');
    try {
      await page.waitForSelector('.sEdgeFilterProcessed, .s-edge-feed > li:not(.s-edge-feed-more-link)', { timeout: 30000 });
      console.log('Feed loaded');
    } catch {
      console.log('Feed selector timed out, trying reload...');
      await page.goto('https://pausd.schoology.com/home', { waitUntil: 'networkidle0', timeout: 120000 });
      try {
        await page.waitForSelector('.sEdgeFilterProcessed, .s-edge-feed > li:not(.s-edge-feed-more-link)', { timeout: 30000 });
        console.log('Feed loaded after reload');
      } catch {
        console.log('Feed still not loaded after reload');
      }
    }

    await new Promise(r => setTimeout(r, 5000));

    const freshHtml = await page.content();
    let cleaned = freshHtml.replace(/Martin Malyshau/g, '');

    const existingHtml = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : null;

    if (existingHtml) {
      const freshSection = extractDiv(cleaned, 'home-feed-container');
      const oldSection = extractDiv(existingHtml, 'home-feed-container');
      if (freshSection && oldSection) {
        const result = existingHtml.replace(oldSection, freshSection);
        fs.writeFileSync(OUTPUT_FILE, result, 'utf8');
        console.log('Updated home-feed-container (', freshSection.length, 'bytes)');
      } else {
        console.log('Extraction failed, saving full page');
        fs.writeFileSync(OUTPUT_FILE, cleaned, 'utf8');
      }
    } else {
      fs.writeFileSync(OUTPUT_FILE, cleaned, 'utf8');
    }

    console.log('Saved to', OUTPUT_FILE);
  } catch (err) {
    console.error('Error:', err.message);
    const page = (await browser.pages())[0];
    if (page) await page.screenshot({ path: '/tmp/error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

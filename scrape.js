const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'index.html');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');

// Just copy template to index.html
// Schoology's dynamic content loads via its own JS when viewed in browser
if (fs.existsSync(TEMPLATE_FILE)) {
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
  console.log('Copied template to index.html');
} else {
  console.error('template.html not found');
  process.exit(1);
}

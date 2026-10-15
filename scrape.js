const fs = require('fs');
const path = require('path');

const HOME_FILE = path.join(__dirname, 'index.html');
const RESOURCES_FILE = path.join(__dirname, 'resources', 'index.html');
const PROGRAM_FILE = path.join(__dirname, 'js', 'schoolagy-program.js');
const SCRIPT_FILE = path.join(__dirname, 'js', 'schoolagy.js');
const USERSCRIPT_FILE = path.join(__dirname, 'schoolagy.user.js');
const LOGIN_URL = 'https://pausd.schoology.com/';
const RESOURCES_URL = 'https://pausd.schoology.com/resources';
const GAME_ORIGIN = 'https://rrocketmann.github.io/schoolagy/';

const GAME_META = {
  '2048': ['2048', 'Puzzle'],
  'ball-platformer': ['Ball Platformer', 'Action'],
  basketrandom: ['Basket Random', 'Sports'],
  bitlife: ['BitLife', 'Sim'],
  bobbysbugs: ["Bobby's Bugs", 'Sim'],
  chromedino: ['Chrome Dino', 'Arcade'],
  'clumsy-bird': ['Clumsy Bird', 'Arcade'],
  clusterrush: ['Cluster Rush', 'Racing'],
  cookieclicker: ['Cookie Clicker', 'Idle'],
  'cosmic-sim': ['Cosmic Sim', 'Sim'],
  credits: ['Credits', 'About'],
  crossyroad: ['Crossy Road', 'Arcade'],
  doodlejump: ['Doodle Jump', 'Arcade'],
  doom: ['Doom', 'Action'],
  drivemad: ['Drive Mad', 'Racing'],
  eaglercraft: ['Eaglercraft', 'Action'],
  'elevator-saga': ['Elevator Saga', 'Puzzle'],
  hexgl: ['HexGL', 'Racing'],
  hextris: ['Hextris', 'Puzzle'],
  'hollow-knight': ['Hollow Knight', 'Action'],
  momentum: ['Momentum', 'Action'],
  openguesser: ['OpenGuesser', 'Puzzle'],
  peggyspost: ["Peggy's Post", 'Sim'],
  polytrack: ['Polytrack', 'Racing'],
  retrobowl: ['Retro Bowl', 'Sports'],
  retrobowlcollege: ['Retro Bowl College', 'Sports'],
  'samosa-rush': ['Samosa Rush', 'Arcade'],
  slope: ['Slope', 'Racing'],
  snake: ['Snake', 'Arcade'],
  sortthecourt: ['Sort the Court', 'Sim'],
  starframe: ['Starframe', 'Action'],
  subwaysurferssingapore: ['Subway Surfers', 'Arcade'],
  'supertux-classic': ['SuperTux', 'Action'],
  tetris: ['Tetris', 'Puzzle'],
  tinyfishing: ['Tiny Fishing', 'Arcade'],
  tombofthemask: ['Tomb of the Mask', 'Arcade'],
  vex3: ['Vex 3', 'Action'],
  vex4: ['Vex 4', 'Action'],
  vex5: ['Vex 5', 'Action'],
  vex6: ['Vex 6', 'Action'],
};

function discoverGames() {
  const dirs = fs.readdirSync(__dirname).filter((d) => {
    if (d.startsWith('.') || d === 'node_modules' || d === '.git' || d === '.github' || d === 'resources' || d === 'js') return false;
    try {
      return fs.statSync(path.join(__dirname, d)).isDirectory() && fs.existsSync(path.join(__dirname, d, 'index.html'));
    } catch {
      return false;
    }
  }).sort();
  return dirs.map((d) => {
    const meta = GAME_META[d];
    return {
      url: d + '/index.html',
      name: meta ? meta[0] : d.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
      cat: meta ? meta[1] : 'Arcade',
      fresh: meta == null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}


function redirectPage(url) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PAUSD Schoology</title>
<meta http-equiv="refresh" content="0;url=${url}">
</head>
<body>
<p><a href="${url}">PAUSD Schoology login</a></p>
</body>
</html>
`;
}

function bundleProgram(games) {
  const program = fs.readFileSync(PROGRAM_FILE, 'utf8');
  return 'window.SCHOOLAGY_GAMES = ' + JSON.stringify(games) + ';\n' + program;
}

function userscript(body) {
  return `// ==UserScript==
// @name         Schoolagy
// @namespace    ${GAME_ORIGIN}
// @version      1
// @description  After you log in at PAUSD Schoology, add Schoolagy games to that view
// @match        https://pausd.schoology.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
${body}`;
}

function assertPublic(html, label) {
  const banned = [/csrf_token/i, /logout_token/i, /profile-image/i, /type="password"/i, /SCHOOLAGY_GAMES/];
  banned.forEach((re) => {
    if (re.test(html)) throw new Error(label + ' contains data that should not be public (' + re + ')');
  });
}

function writePublicPages() {
  const games = discoverGames();
  console.log('Discovered', games.length, 'games');
  const home = redirectPage(LOGIN_URL);
  const resources = redirectPage(RESOURCES_URL);
  const body = bundleProgram(games);
  assertPublic(home, 'index.html');
  assertPublic(resources, 'resources/index.html');
  if (body.includes('input[type="password"]') || body.includes('passwordInput')) {
    throw new Error('program reads password fields');
  }
  fs.writeFileSync(HOME_FILE, home, 'utf8');
  fs.writeFileSync(RESOURCES_FILE, resources, 'utf8');
  fs.writeFileSync(SCRIPT_FILE, body, 'utf8');
  fs.writeFileSync(USERSCRIPT_FILE, userscript(body), 'utf8');
  console.log('Saved login redirect and Schoology program');
}

writePublicPages();

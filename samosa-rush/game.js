'use strict';

const DEBUG_COLLIDER = /[?&]debug/.test(location.search);

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, vignette = null;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  vignette = null;
}
window.addEventListener('resize', resize);
resize();

const ballImg = new Image(); ballImg.src = 'samosa.png';
const naanImg = new Image(); naanImg.src = 'naan.png';
const naanImg2 = new Image(); naanImg2.src = 'naan2.png';
const naanShortImg = new Image(); naanShortImg.src = 'naan-short.png';
const naanLongImg = new Image(); naanLongImg.src = 'naan-long.png';
const pooriImg = new Image(); pooriImg.src = 'poori.png';
const nguyenImg = new Image(); nguyenImg.src = 'nguyen.png';
const nguyenOpenImg = new Image(); nguyenOpenImg.src = 'nguyen-open.png';

const $ = id => document.getElementById(id);
const hud = {
  levelNum: $('hud-level-num'), levelName: $('hud-level-name'),
  attempts: $('attempt-count'), time: $('time-count'),
  intro: $('intro'), introNum: $('intro-num'), introName: $('intro-name'),
  win: $('win'), winStats: $('win-stats'),
};

// ---------------------------------------------------------------- constants  (Geometry Dash cube feel)
const RUN_SPEED = 390;
const GRAVITY = 2200;
const JUMP_SPEED = 860;
const BOUNCE_SPEED = 1050;
const COYOTE = 0.18;
const JUMP_BUFFER = 0.26;
const JUMP_LOCK = 0.12;
const SPIKE_H = 38;
const NAAN_H = 26;
const TAU = Math.PI * 2;
const SOLVER_ITERS = 3;
const MAX_SUBSTEP = 10;

const SAMOSA_IMG_W = 816;
const SAMOSA_IMG_H = 651;
const SAMOSA_SCALE = 0.07;
const SAMOSA_CX = (393 + 807 + 8) / 3;
const SAMOSA_CY = (8 + 616 + 625) / 3;
const SAMOSA_INSET = 0.9;
const SAMOSA_LOCAL = [
  [(393 - SAMOSA_CX) * SAMOSA_SCALE * SAMOSA_INSET, (8 - SAMOSA_CY) * SAMOSA_SCALE * SAMOSA_INSET],
  [(807 - SAMOSA_CX) * SAMOSA_SCALE * SAMOSA_INSET, (616 - SAMOSA_CY) * SAMOSA_SCALE * SAMOSA_INSET],
  [(8 - SAMOSA_CX) * SAMOSA_SCALE * SAMOSA_INSET, (625 - SAMOSA_CY) * SAMOSA_SCALE * SAMOSA_INSET],
];
const RADIUS = Math.max(...SAMOSA_LOCAL.map(([x, y]) => Math.hypot(x, y)));
const SAMOSA_FOOT = Math.max(...SAMOSA_LOCAL.map(([, y]) => y));
const HIT_R = SAMOSA_FOOT + 2;

// ---------------------------------------------------------------- helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hash(n) {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}

function samosaVerts(x, y, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return SAMOSA_LOCAL.map(([lx, ly]) => [x + lx * c - ly * s, y + lx * s + ly * c]);
}

function circleVsAABB(cx, cy, r, box, out) {
  const right = box.x + box.w, bottom = box.y + box.h;
  const qx = cx < box.x ? box.x : cx > right ? right : cx;
  const qy = cy < box.y ? box.y : cy > bottom ? bottom : cy;
  const dx = cx - qx, dy = cy - qy;
  const d2 = dx * dx + dy * dy;
  if (d2 > r * r) return false;
  if (d2 > 1e-10) {
    const d = Math.sqrt(d2);
    out.nx = dx / d; out.ny = dy / d; out.depth = r - d;
    return true;
  }
  const dl = cx - box.x, dr = right - cx, dt = cy - box.y, db = bottom - cy;
  let m = dl; out.nx = -1; out.ny = 0;
  if (dr < m) { m = dr; out.nx = 1; out.ny = 0; }
  if (dt < m) { m = dt; out.nx = 0; out.ny = -1; }
  if (db < m) { m = db; out.nx = 0; out.ny = 1; }
  out.depth = m + r;
  return true;
}

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-rgb', theme.accentRgb);
  root.style.setProperty('--cloth', theme.cloth);
  root.style.setProperty('--sky', theme.skyTop);
  document.body.style.background = theme.skyTop;
}

// ---------------------------------------------------------------- themes
const themes = {
  dawn: {
    skyTop: '#3b0d18', skyMid: '#a33a1c', skyBottom: '#f4b45a',
    sun: '#ffe08a', sunSize: 110, sunPos: [0.7, 0.32], stars: 0.35,
    hills: ['#6b2a12', '#9a4a1a', '#c47a28'], fog: '255,170,90',
    cloud: 'rgba(255,230,190,0.45)', cloudCount: 5,
    accent: '#fbbf24', cloth: '#f43f5e',
    mote: '255,210,120', glow: false, ink: '#2c1a10',
  },
  sunset: {
    skyTop: '#4a1020', skyMid: '#c2410c', skyBottom: '#fbbf24',
    sun: '#fff1c1', sunSize: 130, sunPos: [0.25, 0.42], stars: 0.2,
    hills: ['#7f1d1d', '#b45309', '#d97706'], fog: '255,140,70',
    cloud: 'rgba(255,210,170,0.4)', cloudCount: 6,
    accent: '#fb7185', cloth: '#38bdf8',
    mote: '255,180,90', glow: false, ink: '#331c12',
  },
  night: {
    skyTop: '#1a1020', skyMid: '#3f1d2e', skyBottom: '#6b3a1f',
    sun: '#fde68a', sunSize: 60, sunPos: [0.8, 0.2], stars: 1,
    hills: ['#2a1810', '#4a2c18', '#6b3f22'], fog: '180,90,40',
    cloud: 'rgba(255,200,140,0.16)', cloudCount: 4,
    accent: '#a78bfa', cloth: '#f472b6',
    mote: '250,200,90', glow: true, ink: '#0b0e1c',
  },
  cavern: {
    skyTop: '#1c0a06', skyMid: '#7f1d1d', skyBottom: '#ea580c',
    sun: '#ffb37a', sunSize: 150, sunPos: [0.5, 0.55], stars: 0.15,
    hills: ['#3f0e0e', '#7c2d12', '#9a3412'], fog: '255,90,40',
    cloud: 'rgba(255,160,80,0.18)', cloudCount: 3,
    accent: '#fde047', cloth: '#22d3ee',
    mote: '255,140,60', glow: true, ink: '#160b0b',
  },
  day: {
    skyTop: '#9a3412', skyMid: '#ea580c', skyBottom: '#fde68a',
    sun: '#fff7c2', sunSize: 120, sunPos: [0.78, 0.18], stars: 0.12,
    hills: ['#854d0e', '#ca8a04', '#eab308'], fog: '255,230,160',
    cloud: 'rgba(255,248,220,0.7)', cloudCount: 7,
    accent: '#f97316', cloth: '#ef4444',
    mote: '255,220,140', glow: false, ink: '#4a2f1d',
  },
};
for (const t of Object.values(themes)) t.accentRgb = hexToRgb(t.accent);

// ---------------------------------------------------------------- levels
// naan: [x, y, w]  y is the standing surface
// movers: [x, y, w, dx, dy, period, phase]
const levels = [
  {
    name: 'Naan Run', theme: themes.dawn, start: [90, 404],
    naan: [
      [0, 420, 720], [840, 420, 360], [1280, 420, 360],
      [1720, 380, 340], [2140, 420, 520], [2760, 380, 340],
      [3180, 420, 560],
    ],
    spikes: [[2360, 420, 36]],
    flag: [3620, 420],
  },
  {
    name: 'Tandoor Leap', theme: themes.sunset, start: [90, 404],
    naan: [
      [0, 420, 600], [740, 420, 320], [1140, 420, 320],
      [1540, 420, 360], [1980, 280, 340], [2420, 340, 300],
      [2800, 400, 320], [3220, 420, 360], [3680, 380, 320],
      [4100, 340, 340], [4540, 380, 320], [4960, 420, 480],
    ],
    pads: [[1680, 420, 90]],
    spikes: [[3380, 420, 36]],
    flag: [5320, 420],
  },
  {
    name: 'Midnight Masala', theme: themes.night, start: [90, 384],
    naan: [
      [0, 400, 560], [700, 400, 320], [1100, 360, 340],
      [1520, 400, 340], [1940, 360, 320], [2340, 320, 340],
      [2760, 360, 340], [3180, 400, 320], [3580, 360, 340],
      [4000, 400, 360], [4440, 360, 320], [4840, 400, 460],
    ],
    spikes: [[1660, 400, 36], [4140, 400, 36]],
    flag: [5180, 400],
  },
  {
    name: 'Masala Gauntlet', theme: themes.cavern, start: [90, 404],
    naan: [
      [0, 420, 580], [720, 420, 340], [1140, 420, 400],
      [1620, 460, 280], [1980, 420, 400], [2460, 380, 340],
      [2880, 420, 360], [3320, 380, 320], [3720, 340, 340],
      [4140, 380, 320], [4540, 420, 400], [5020, 380, 340],
      [5440, 420, 460],
    ],
    spikes: [[1320, 420, 36], [2140, 420, 36], [3040, 420, 36]],
    flag: [5780, 420],
  },
  {
    name: 'Sky Kitchen', theme: themes.day, start: [90, 484],
    naan: [
      [0, 500, 500], [640, 460, 320], [1040, 430, 320],
      [1440, 430, 340], [1860, 390, 320], [2260, 360, 340],
      [2680, 330, 320], [3080, 370, 340], [3500, 410, 320],
      [3900, 440, 360], [4340, 400, 320], [4740, 360, 340],
      [5160, 400, 320], [5560, 440, 340], [5980, 400, 320],
      [6380, 440, 520],
    ],
    pads: [[2460, 360, 90]],
    spikes: [[1600, 430, 36], [4060, 440, 36]],
    flag: [6780, 440],
  },
];

// ---------------------------------------------------------------- state
let levelIndex = 0;
let theme = themes.dawn;
let platforms = [], pads = [], spikes = [];
let flag = null, spawn = { x: 0, y: 0 };
let deathY = 2000, camMinY = 0, camMaxY = 0;
let levelStartX = 0, levelEndX = 0;
const parts = [], trail = [], confetti = [];

const ball = {
  x: 0, y: 0, vx: 0, vy: 0, rotation: 0, prevRotation: 0,
  grounded: false, riding: null,
  sx: 1, sy: 1,
};

let coyote = 0, jumpBuffer = 0, jumpHeld = false, jumpLock = 0;
let shakeTime = 0, shakeMag = 0, flash = 0;
let camX = 0, camY = 0;
let dead = false, deadTimer = 0;
let transition = null;
let won = false;
let gameTime = 0, runTime = 0, animT = 0;
let attempts = 1, attemptLevel = 0;
let lastTime = performance.now();
const hitOut = { nx: 0, ny: 0, depth: 0 };

const stars = Array.from({ length: 140 }, (_, i) => ({
  x: hash(i * 3.1), y: hash(i * 3.1 + 1) * 0.7,
  s: 0.6 + hash(i * 3.1 + 2) * 1.6, ph: hash(i * 7.7) * TAU,
}));
const motes = Array.from({ length: 36 }, (_, i) => ({
  x: hash(i * 5.3) * 2000, y: hash(i * 5.3 + 1) * 1200,
  vx: (hash(i * 5.3 + 2) - 0.5) * 30, vy: -8 - hash(i * 5.3 + 3) * 14,
  s: 1 + hash(i * 5.3 + 4) * 2, ph: hash(i * 9.1) * TAU,
}));

// ---------------------------------------------------------------- input
const isJump = c => c === 'Space' || c === 'ArrowUp' || c === 'KeyW';
function pressJump() { jumpBuffer = JUMP_BUFFER; jumpHeld = true; }
function releaseJump() { jumpHeld = false; }

window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  if (isJump(e.code)) {
    if (!e.repeat) pressJump();
    jumpHeld = true;
    return;
  }
  if (e.repeat) return;
  if (e.code === 'KeyR') {
    if (won) restartGame();
    else if (!transition && !dead) die(true);
  }
});
window.addEventListener('keyup', e => {
  if (isJump(e.code)) releaseJump();
});
window.addEventListener('pointerdown', e => {
  if (e.button != null && e.button !== 0) return;
  pressJump();
});
window.addEventListener('pointerup', releaseJump);
window.addEventListener('blur', releaseJump);

// ---------------------------------------------------------------- level loading
function makeNaan(x, y, w, kind, seed) {
  return {
    x, y, w, h: kind === 'bounce' ? 12 : NAAN_H,
    kind, seed,
    ox: 0, oy: 0, dox: 0, doy: 0,
    move: null, squish: 0, padW: w,
  };
}

function loadLevel(i) {
  levelIndex = i;
  const L = levels[i];
  theme = L.theme;
  platforms = []; pads = []; spikes = [];
  let seed = i * 100;
  let minY = Infinity, maxY = -Infinity;

  for (const [x, y, w] of L.naan) {
    platforms.push(makeNaan(x, y, w, 'ground', seed++));
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  for (const [x, y, w, dx, dy, period, phase] of (L.movers || [])) {
    const p = makeNaan(x, y, w, 'move', seed++);
    p.move = { dx, dy, period, phase: phase || 0 };
    platforms.push(p);
    minY = Math.min(minY, y - Math.abs(dy)); maxY = Math.max(maxY, y + Math.abs(dy));
  }
  for (const [x, y, w] of (L.pads || [])) {
    const p = makeNaan(x, y - 6, w, 'bounce', seed++);
    p.padW = w; p.squish = 0;
    platforms.push(p); pads.push(p);
    minY = Math.min(minY, y);
  }
  spikes = (L.spikes || []).map(([x, y, w]) => ({ x, y, w }));
  flag = { x: L.flag[0], y: L.flag[1], w: 78, h: 108 };
  spawn = { x: L.start[0], y: L.start[1] };
  levelStartX = L.start[0];
  levelEndX = L.flag[0];

  deathY = maxY + 280;
  camMinY = Math.min(0, minY - 280);
  camMaxY = Math.max(camMinY, maxY + 180 - H);
  applyTheme();

  parts.length = 0; trail.length = 0;
  gameTime = 0;
  if (attemptLevel !== i) { attempts = 1; attemptLevel = i; }
  respawn(true);
  camX = ball.x - W * 0.32;
  camY = clamp(ball.y - H * 0.58, camMinY, camMaxY);

  hud.levelNum.textContent = String(i + 1).padStart(2, '0');
  hud.levelName.textContent = L.name.toUpperCase();
  hud.introNum.textContent = `PLATE ${i + 1}`;
  hud.introName.textContent = L.name;
  hud.intro.classList.remove('show');
  void hud.intro.offsetWidth;
  hud.intro.classList.add('show');
  updateAttemptHud();
  updateProgress();
}

function updateAttemptHud() {
  hud.attempts.textContent = `ORDER ${attempts}`;
}

function updateProgress() {
  const span = Math.max(1, levelEndX - levelStartX);
  const t = clamp((ball.x - levelStartX) / span, 0, 1);
  const fill = document.getElementById('progress-fill');
  const pip = document.getElementById('progress-pip');
  if (fill) fill.style.width = `${t * 100}%`;
  if (pip) pip.style.left = `${10 + t * 80}%`;
}

function restartGame() {
  won = false; attempts = 1; attemptLevel = 0; runTime = 0; confetti.length = 0;
  hud.win.classList.remove('show');
  loadLevel(0);
  transition = { phase: 'in', t: 0 };
}

function respawn(silent) {
  ball.x = spawn.x; ball.y = spawn.y;
  ball.vx = RUN_SPEED; ball.vy = 0;
  ball.grounded = false; ball.riding = null;
  ball.sx = 1; ball.sy = 1;
  ball.rotation = ball.prevRotation = 0;
  dead = false;
  jumpLock = 0;
  trail.length = 0;
  const settled = solveContacts();
  ball.grounded = settled.grounded;
  ball.riding = settled.riding;
  if (!silent) {
    camX = ball.x - W * 0.32;
    camY = clamp(ball.y - H * 0.58, camMinY, camMaxY);
  }
}

// ---------------------------------------------------------------- particles
function addPart(p) {
  parts.push(p);
  if (parts.length > 900) parts.splice(0, parts.length - 900);
}
function burst(x, y, n, color, speed, type, life, grav) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const s = speed * (0.4 + Math.random() * 0.8);
    const l = life * (0.6 + Math.random() * 0.7);
    addPart({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: l, maxLife: l, size: 2 + Math.random() * 3,
      color, type, grav: grav === undefined ? 300 : grav, drag: 1.5,
      rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 10,
    });
  }
}
function explodeSamosa(x, y) {
  const pastry = ['#e8a54b', '#c97a2a', '#f5d08a', '#8a4b1f'];
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * TAU, s = 180 + Math.random() * 280;
    addPart({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80,
      life: 0.7, maxLife: 0.7, size: 7 + Math.random() * 8,
      color: pastry[i % pastry.length], type: 'shard', grav: 520, drag: 1.1,
      rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 16,
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * TAU, s = 140 + Math.random() * 220;
    addPart({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
      life: 0.75, maxLife: 0.75, size: 3.5 + Math.random() * 2.5,
      color: '#4d7c0f', type: 'pea', grav: 480, drag: 1.2,
      rot: 0, spin: 0,
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * TAU, s = 120 + Math.random() * 180;
    addPart({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30,
      life: 0.7, maxLife: 0.7, size: 5 + Math.random() * 4,
      color: '#eab308', type: 'cube', grav: 500, drag: 1.15,
      rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 8,
    });
  }
  burst(x, y, 18, '#fbbf24', 240, 'dot', 0.55, 200);
  burst(x, y, 10, '#b45309', 200, 'dot', 0.5, 220);
  burst(x, y, 8, '#65a30d', 160, 'dot', 0.45, 180);
  for (let i = 0; i < 4; i++) {
    addPart({
      x, y, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 40,
      life: 0.5, maxLife: 0.5, size: 10 + i * 4,
      color: 'rgba(255,240,200,0.5)', type: 'steam', grav: -40, drag: 0.6,
      rot: 0, spin: 0,
    });
  }
}
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += p.grav * dt;
    if (p.spin) p.rot += p.spin * dt;
    if (p.drag) { const d = Math.max(0, 1 - p.drag * dt); p.vx *= d; p.vy *= d; }
    p.life -= dt;
    if (p.life <= 0) parts.splice(i, 1);
  }
}
function launchConfetti() {
  const kinds = [
    { color: '#fbbf24', type: 'spice' },
    { color: '#dc2626', type: 'spice' },
    { color: '#65a30d', type: 'pea' },
    { color: '#b45309', type: 'spice' },
    { color: '#f97316', type: 'spice' },
    { color: '#eab308', type: 'cube' },
  ];
  for (let i = 0; i < 180; i++) {
    const k = kinds[Math.floor(Math.random() * kinds.length)];
    confetti.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.6,
      y: -20 - Math.random() * H * 0.4,
      vx: (Math.random() - 0.5) * 260, vy: 100 + Math.random() * 260,
      size: 5 + Math.random() * 7, rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 12,
      color: k.color, type: k.type,
    });
  }
}
function updateConfetti(dt) {
  for (const c of confetti) {
    c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 380 * dt; c.rotation += c.spin * dt;
  }
}

function platBox(p) {
  return { x: p.x + p.ox, y: p.y + p.oy, w: p.w, h: p.h };
}

// ---------------------------------------------------------------- physics
function solveContacts() {
  let grounded = false;
  let riding = null;
  let bouncePlat = null;
  let crashed = false;

  for (let iter = 0; iter < SOLVER_ITERS; iter++) {
    for (const p of platforms) {
      const box = platBox(p);
      if (ball.x < box.x - HIT_R - 2 || ball.x > box.x + box.w + HIT_R + 2) continue;
      if (ball.y < box.y - HIT_R - 2 || ball.y > box.y + box.h + HIT_R + 2) continue;
      if (!circleVsAABB(ball.x, ball.y, HIT_R, box, hitOut)) continue;

      const nx = hitOut.nx, ny = hitOut.ny, depth = hitOut.depth;
      const topSnap = (ball.y + HIT_R) - box.y;
      const landing = ny < -0.4 || (topSnap < 22 && ball.vy >= -140 && ball.x + HIT_R > box.x + 2);

      if (landing) {
        ball.y -= Math.max(depth, topSnap);
        if (ball.vy > 0) ball.vy = 0;
        if (p.kind === 'bounce') bouncePlat = p;
        else {
          grounded = true;
          if (!riding) riding = p;
        }
      } else {
        crashed = true;
        ball.x += nx * (depth + 0.2);
        ball.y += ny * (depth + 0.2);
      }
    }
  }
  return { grounded, riding, bouncePlat, crashed };
}

function doJump() {
  ball.vy = -JUMP_SPEED;
  ball.grounded = false; ball.riding = null;
  coyote = 0; jumpBuffer = 0; jumpLock = JUMP_LOCK;
  ball.sx = 0.88; ball.sy = 1.12;
}

function die(quiet) {
  if (dead) return;
  dead = true; deadTimer = quiet ? 0.22 : 0.62;
  trail.length = 0;
  attempts++;
  if (!quiet) {
    explodeSamosa(ball.x, ball.y);
    flash = 0.4; shakeTime = 0.22; shakeMag = 12;
  }
}

function hitFlag() {
  const box = { x: flag.x - flag.w / 2, y: flag.y - flag.h, w: flag.w, h: flag.h };
  return circleVsAABB(ball.x, ball.y, HIT_R, box, hitOut);
}

function updateCamera(dt) {
  const targetX = ball.x - W * 0.32;
  const targetY = clamp(ball.y - H * 0.58, camMinY, camMaxY);
  camX += (targetX - camX) * Math.min(1, 10 * dt);
  camY += (targetY - camY) * Math.min(1, 6 * dt);
}

function update(dt) {
  animT = performance.now() / 1000;
  if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - dt);
  if (flash > 0) flash = Math.max(0, flash - dt * 3);
  ball.sx += (1 - ball.sx) * Math.min(1, 11 * dt);
  ball.sy += (1 - ball.sy) * Math.min(1, 11 * dt);
  for (const p of pads) p.squish = Math.max(0, p.squish - dt * 5);
  updateParts(dt);

  if (transition) {
    transition.t += dt;
    if (transition.phase === 'out' && transition.t >= 0.55) {
      if (transition.next >= levels.length) {
        won = true; transition = null;
        hud.levelNum.textContent = '✓'; hud.levelName.textContent = 'CLEARED';
        hud.winStats.textContent = `${attempts} orders  ·  ${formatTime(runTime)}`;
        hud.win.classList.add('show');
        launchConfetti();
        return;
      }
      loadLevel(transition.next);
      transition = { phase: 'in', t: 0 };
    } else if (transition.phase === 'in' && transition.t >= 0.6) {
      transition = null;
    }
    updateCamera(dt);
    return;
  }
  if (won) { updateConfetti(dt); return; }

  if (dead) {
    deadTimer -= dt;
    if (deadTimer <= 0) {
      updateAttemptHud();
      respawn(false);
    }
    updateCamera(dt);
    return;
  }

  gameTime += dt; runTime += dt;
  if (jumpLock > 0) jumpLock -= dt;

  for (const p of platforms) {
    if (!p.move) continue;
    const s = Math.sin(gameTime * TAU / p.move.period + p.move.phase);
    const nox = p.move.dx * s, noy = p.move.dy * s;
    p.dox = nox - p.ox; p.doy = noy - p.oy;
    p.ox = nox; p.oy = noy;
  }
  if (ball.riding && ball.riding.move) {
    ball.x += ball.riding.dox; ball.y += ball.riding.doy;
  }

  ball.vx = RUN_SPEED;
  ball.vy += GRAVITY * dt;
  if (ball.vy > 1400) ball.vy = 1400;

  const speed = Math.hypot(ball.vx, ball.vy);
  const steps = clamp(Math.ceil((speed * dt) / MAX_SUBSTEP), 1, 12);
  const sdt = dt / steps;
  let contact = { grounded: false, riding: null, bouncePlat: null, crashed: false };
  for (let i = 0; i < steps; i++) {
    ball.x += ball.vx * sdt;
    ball.y += ball.vy * sdt;
    contact = solveContacts();
    if (contact.crashed) break;
  }

  if (contact.crashed) {
    die(false);
  } else if (contact.bouncePlat) {
    const p = contact.bouncePlat;
    ball.vy = -BOUNCE_SPEED;
    ball.grounded = false; ball.riding = null;
    jumpLock = JUMP_LOCK;
    ball.sx = 0.72; ball.sy = 1.35;
    p.squish = 1;
  } else if (jumpLock <= 0) {
    ball.grounded = contact.grounded;
    ball.riding = contact.riding;
  } else {
    ball.grounded = false;
  }

  if (ball.grounded) coyote = COYOTE;
  else coyote -= dt;

  const wantJump = jumpBuffer > 0 || jumpHeld;
  if (wantJump && jumpLock <= 0 && (ball.grounded || coyote > 0)) doJump();
  if (jumpBuffer > 0) jumpBuffer -= dt;

  ball.prevRotation = ball.rotation;
  ball.rotation += (ball.vx / RADIUS) * dt;

  trail.push({ x: ball.x, y: ball.y, rotation: ball.rotation });
  while (trail.length > 4) trail.shift();

  for (const s of spikes) {
    const box = { x: s.x, y: s.y - SPIKE_H, w: s.w, h: SPIKE_H };
    if (circleVsAABB(ball.x, ball.y, HIT_R * 0.82, box, hitOut)) { die(false); break; }
  }

  if (!dead && ball.y > deathY) die(false);

  if (!dead && hitFlag()) {
    transition = { phase: 'out', t: 0, next: levelIndex + 1 };
  }

  updateCamera(dt);
  updateProgress();
  hud.time.textContent = formatTime(runTime);
}

// ---------------------------------------------------------------- drawing: background
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme.skyTop);
  g.addColorStop(0.55, theme.skyMid);
  g.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (theme.stars > 0) {
    for (const s of stars) {
      const sx = ((s.x * W - camX * 0.03) % W + W) % W;
      const sy = s.y * H;
      const tw = 0.5 + 0.5 * Math.sin(animT * 2 + s.ph);
      ctx.globalAlpha = theme.stars * (0.35 + 0.65 * tw);
      ctx.fillStyle = s.s > 1.4 ? '#f59e0b' : '#fde68a';
      ctx.beginPath();
      ctx.ellipse(sx, sy, s.s * 1.4, s.s * 0.7, s.ph, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const sunX = W * theme.sunPos[0] - camX * 0.04;
  const sunY = H * theme.sunPos[1];
  const R = theme.sunSize;
  const halo = ctx.createRadialGradient(sunX, sunY, R * 0.2, sunX, sunY, R * 2.6);
  halo.addColorStop(0, theme.sun);
  halo.addColorStop(0.35, 'rgba(255,180,60,0.12)');
  halo.addColorStop(1, 'rgba(255,140,0,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - R * 2.6, sunY - R * 2.6, R * 5.2, R * 5.2);
  ctx.globalAlpha = 1;
  const core = ctx.createRadialGradient(sunX - R * 0.12, sunY - R * 0.12, 0, sunX, sunY, R * 0.55);
  core.addColorStop(0, '#fff7c2');
  core.addColorStop(0.45, '#fbbf24');
  core.addColorStop(1, '#b45309');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.ellipse(sunX, sunY, R * 0.58, R * 0.5, -0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(146,64,14,0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(180,83,9,0.25)';
  for (let i = 0; i < 5; i++) {
    const a = i * 1.1 + 0.4;
    ctx.beginPath();
    ctx.ellipse(sunX + Math.cos(a) * R * 0.22, sunY + Math.sin(a) * R * 0.16, 6, 4, a, 0, TAU);
    ctx.fill();
  }

  const span = W + 600;
  for (let i = 0; i < theme.cloudCount; i++) {
    const baseX = i * 470 + hash(i * 1.7) * 200 + animT * 6;
    const cx = ((baseX - camX * 0.12) % span + span) % span - 300;
    const cy = 60 + (i % 3) * 70 + hash(i * 2.3) * 40 + Math.sin(animT / 3 + i) * 6;
    const sc = 0.8 + hash(i * 4.1) * 0.6;
    ctx.fillStyle = theme.cloud;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62 * sc, 22 * sc, -0.15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,83,9,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = theme.cloud;
    ctx.beginPath();
    ctx.ellipse(cx + 36 * sc, cy + 4, 34 * sc, 14 * sc, 0.1, 0, TAU);
    ctx.ellipse(cx - 32 * sc, cy + 6, 30 * sc, 13 * sc, -0.1, 0, TAU);
    ctx.fill();
  }
}

function drawHillLayer(factor, amp, baseline, wavelength, color, seedOff) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  const shift = camX * factor + seedOff;
  for (let sx = 0; sx <= W + 24; sx += 24) {
    const u = sx + shift;
    const y = baseline + Math.sin(u / wavelength) * amp +
      Math.sin(u / (wavelength * 0.43) + 1.3) * amp * 0.35 +
      Math.sin(u / (wavelength * 2.3) + 0.4) * amp * 0.6;
    ctx.lineTo(sx, y);
  }
  ctx.lineTo(W + 24, H);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff7c2';
  for (let i = 0; i < 18; i++) {
    const px = ((hash(seedOff + i) * (W + 400) - camX * factor * 0.3) % (W + 80));
    const py = baseline + 20 + hash(seedOff + i + 9) * 80;
    ctx.beginPath();
    ctx.ellipse(px, py, 16 + hash(i) * 22, 7, hash(i * 3) * 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawFog(y0, y1, alpha) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(${theme.fog},0)`);
  g.addColorStop(1, `rgba(${theme.fog},${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, W, y1 - y0);
}

function drawBackground() {
  drawSky();
  drawFog(H * 0.35, H * 0.7, 0.25);
  drawHillLayer(0.18, 50, H * 0.62, 300, theme.hills[0], 100);
  drawFog(H * 0.55, H * 0.85, 0.22);
  drawHillLayer(0.32, 60, H * 0.72, 200, theme.hills[1], 900);
  drawFog(H * 0.65, H, 0.18);
  drawHillLayer(0.5, 70, H * 0.83, 140, theme.hills[2], 2200);
}

function naanSprite(p) {
  if (p.w < 270) return naanShortImg;
  if (p.w < 420) return (p.seed % 2 === 0 ? naanImg : naanImg2);
  return naanLongImg;
}

function drawNaan(p) {
  const x = p.x + p.ox, y = p.y + p.oy;
  const vw = p.w + 36;
  const vh = clamp(50 + p.w * 0.045, 52, 84);
  const vx = x - 18;
  const vy = y - vh * 0.4;
  const bob = Math.sin(animT * 1.2 + p.seed) * 1.2;
  const img = naanSprite(p);

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + p.w / 2, y + 16, p.w * 0.42, 7, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (img.complete && img.naturalWidth) {
    ctx.drawImage(img, vx, vy + bob, vw, vh);
  } else {
    ctx.fillStyle = '#e8c99b';
    ctx.beginPath();
    ctx.ellipse(x + p.w / 2, y + 8 + bob, vw * 0.48, vh * 0.34, 0, 0, TAU);
    ctx.fill();
  }

  if (DEBUG_COLLIDER) {
    ctx.strokeStyle = 'rgba(0,255,180,0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, p.w, p.h);
  }
}

function drawPad(p) {
  const x = p.x + p.ox, w = p.padW, y = p.y + p.oy;
  const sq = 1 - 0.18 * p.squish;
  const size = Math.max(w + 18, 56);
  const dx = x + w / 2 - size / 2;
  const dy = y - size * 0.72 * sq;
  if (pooriImg.complete && pooriImg.naturalWidth) {
    ctx.drawImage(pooriImg, dx, dy, size, size * sq);
  } else {
    ctx.fillStyle = '#e8b15a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y - 8, size * 0.42, size * 0.28 * sq, 0, 0, TAU);
    ctx.fill();
  }
}

function drawFlame(cx, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(cx, y - h);
  ctx.quadraticCurveTo(cx + w * 0.55, y - h * 0.45, cx + w * 0.32, y);
  ctx.lineTo(cx - w * 0.32, y);
  ctx.quadraticCurveTo(cx - w * 0.55, y - h * 0.45, cx, y - h);
  ctx.closePath();
}

function drawSpike(s) {
  const n = Math.max(1, Math.round(s.w / 26));
  const tw = s.w / n;
  const h = SPIKE_H + 16;
  const w = Math.min(28, tw + 8);
  for (let i = 0; i < n; i++) {
    const cx = s.x + (i + 0.5) * tw;
    ctx.fillStyle = '#ea580c';
    drawFlame(cx, s.y, w, h);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    drawFlame(cx, s.y, w * 0.58, h * 0.72);
    ctx.fill();
    ctx.fillStyle = '#fff7c2';
    drawFlame(cx, s.y, w * 0.28, h * 0.42);
    ctx.fill();
  }
}

function drawFlag() {
  const w = flag.w, h = flag.h;
  const x = flag.x - w / 2;
  const y = flag.y - h;
  const dist = Math.hypot(ball.x - flag.x, ball.y - (flag.y - h * 0.35));
  const open = clamp(1 - (dist - 50) / 420, 0, 1);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(flag.x, flag.y + 6, w * 0.32, 7, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  if (nguyenImg.complete && nguyenImg.naturalWidth) {
    ctx.drawImage(nguyenImg, x, y, w, h);
    if (open > 0.02 && nguyenOpenImg.complete && nguyenOpenImg.naturalWidth) {
      ctx.globalAlpha = open;
      ctx.drawImage(nguyenOpenImg, x, y, w, h);
      ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = '#60a5fa';
    rrect(x + 10, y, w - 20, h, 12); ctx.fill();
  }
}

function drawBallImage(x, y, rotation, alpha, scale, sx, sy) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(sx * scale, sy * scale);
  ctx.rotate(rotation);
  if (ballImg.complete && ballImg.naturalWidth) {
    const dw = SAMOSA_IMG_W * SAMOSA_SCALE;
    const dh = SAMOSA_IMG_H * SAMOSA_SCALE;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(ballImg, -SAMOSA_CX * SAMOSA_SCALE, -SAMOSA_CY * SAMOSA_SCALE, dw, dh);
  } else {
    ctx.beginPath();
    ctx.moveTo(SAMOSA_LOCAL[0][0], SAMOSA_LOCAL[0][1]);
    ctx.lineTo(SAMOSA_LOCAL[1][0], SAMOSA_LOCAL[1][1]);
    ctx.lineTo(SAMOSA_LOCAL[2][0], SAMOSA_LOCAL[2][1]);
    ctx.closePath();
    ctx.fillStyle = '#e8a54b';
    ctx.fill();
  }
  ctx.restore();
}

function drawBall() {
  if (dead) return;
  for (let i = 0; i < trail.length - 1; i++) {
    const t = trail[i];
    drawBallImage(t.x, t.y, t.rotation, (i / trail.length) * 0.28, 0.92, 1, 1);
  }
  drawBallImage(ball.x, ball.y, ball.rotation, 1, 1, ball.sx, ball.sy);
  if (DEBUG_COLLIDER) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, HIT_R, 0, TAU);
    ctx.strokeStyle = 'rgba(0,255,180,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const tri = samosaVerts(ball.x, ball.y, ball.rotation);
    ctx.beginPath();
    ctx.moveTo(tri[0][0], tri[0][1]);
    ctx.lineTo(tri[1][0], tri[1][1]);
    ctx.lineTo(tri[2][0], tri[2][1]);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,200,0,0.8)';
    ctx.stroke();
  }
}

function drawParts() {
  ctx.lineCap = 'round';
  for (const p of parts) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    if (p.type === 'dot') {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * a), 0, TAU); ctx.fill();
    } else if (p.type === 'pea') {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.28, 0, TAU); ctx.fill();
    } else if (p.type === 'shard') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.7, p.size * 0.6);
      ctx.lineTo(-p.size * 0.7, p.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'cube') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.fillRect(-p.size * 0.5, -p.size * 0.4, p.size, p.size * 0.75);
      ctx.restore();
    } else if (p.type === 'steam') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size + (1 - a) * 10, 0, TAU); ctx.stroke();
    } else if (p.type === 'spark') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.stroke();
    } else if (p.type === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5 * a + 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size + (1 - a) * p.size * 3, 0, TAU); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawMotes(dt) {
  for (const m of motes) {
    m.x += m.vx * dt; m.y += m.vy * dt;
    const sx = ((m.x - camX * 0.1) % W + W) % W;
    const sy = ((m.y - camY * 0.1) % H + H) % H;
    const a = 0.22 + 0.35 * (0.5 + 0.5 * Math.sin(animT * 1.5 + m.ph));
    ctx.fillStyle = `rgba(${theme.mote},${a})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, m.s * 1.6, m.s * 0.7, m.ph, 0, TAU);
    ctx.fill();
  }
}

function drawVignette() {
  if (!vignette) {
    vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(40, 16, 4, 0.45)');
  }
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function draw(dt) {
  drawBackground();

  let shakeX = 0, shakeY = 0;
  if (shakeTime > 0) {
    shakeX = (Math.random() - 0.5) * shakeMag;
    shakeY = (Math.random() - 0.5) * shakeMag;
  }
  const left = camX - 80, right = camX + W + 80;

  ctx.save();
  ctx.translate(-camX + shakeX, -camY + shakeY);

  for (const p of platforms) {
    if (p.kind === 'bounce') continue;
    if (p.x + p.ox + p.w < left || p.x + p.ox > right) continue;
    drawNaan(p);
  }
  for (const s of spikes) if (s.x + s.w > left && s.x < right) drawSpike(s);
  for (const p of pads) if (p.x + p.w > left && p.x < right) drawPad(p);
  if (flag.x > left - 100 && flag.x < right + 100) drawFlag();

  drawParts();
  drawBall();
  ctx.restore();

  drawMotes(dt);
  drawVignette();

  for (const c of confetti) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.fillStyle = c.color;
    if (c.type === 'pea') {
      ctx.beginPath(); ctx.arc(0, 0, c.size * 0.45, 0, TAU); ctx.fill();
    } else if (c.type === 'cube') {
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.7);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -c.size * 0.55);
      ctx.lineTo(c.size * 0.35, 0);
      ctx.lineTo(0, c.size * 0.55);
      ctx.lineTo(-c.size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  if (flash > 0) {
    ctx.fillStyle = `rgba(251, 191, 36, ${flash * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (transition) {
    const a = transition.phase === 'out' ? Math.min(1, transition.t / 0.5) : Math.max(0, 1 - transition.t / 0.6);
    ctx.fillStyle = `rgba(42, 16, 6, ${a})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw(dt);
  requestAnimationFrame(loop);
}

loadLevel(0);
transition = { phase: 'in', t: 0 };
draw(0);
requestAnimationFrame(loop);

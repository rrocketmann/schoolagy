import { CONFIG } from '../config.js';
import { Engine } from '../core/Engine.js';
import { Input } from '../core/Input.js';
import { Level } from '../world/Level.js';
import { GameScene } from '../scenes/GameScene.js';
import { Renderer } from '../render/Renderer.js';
import { Camera } from '../render/Camera.js';
import { WallTypes } from '../world/WallTypes.js';
import { EditorGrid } from './EditorGrid.js';

const STORAGE_KEY = 'ballplatformer.editor.v1';
const TOOLS = [
  { ch: '#', label: 'Solid', color: WallTypes.solid.color, key: '1' },
  { ch: '~', label: 'Ice', color: WallTypes.ice.color, key: '2' },
  { ch: 'B', label: 'Bouncy', color: WallTypes.bouncy.color, key: '3' },
  { ch: '-', label: 'One-way', color: WallTypes.oneway.color, key: '4' },
  { ch: '^', label: 'Hazard', color: WallTypes.hazard.color, key: '5' },
  { ch: 'P', label: 'Spawn', color: CONFIG.render.ballColor, key: '6' },
  { ch: ' ', label: 'Eraser', color: '#2b2f3a', key: '0' },
];

const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const renderer = new Renderer(CONFIG.render, CONFIG.tileSize);
const camera = new Camera(CONFIG.camera);
camera.bounds = null;

let grid = loadSaved() ?? EditorGrid.blank(60, 18);
let level;
rebuildLevel();
let tool = TOOLS[0];
let hover = { x: 0, y: 0, valid: false };
let isPainting = false, paintCh = null;
let isPanning = false, panLast = null;
let spaceDown = false;
let undoStack = [];
let playtest = null; // { engine, input } while active
let rafId = 0;
let saveTimer = 0;

// ---- Persistence ----
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    document.getElementById('level-name').value = data.name || 'LEVEL_CUSTOM';
    return EditorGrid.fromAscii(data.ascii);
  } catch { return null; }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ascii: grid.toAscii(),
        name: document.getElementById('level-name').value,
      }));
    } catch { /* storage unavailable, ignore */ }
  }, 250);
}

function rebuildLevel() {
  level = Level.fromAscii(grid.toAscii(), { tileSize: CONFIG.tileSize, name: 'editor' });
  return level;
}

function markDirty() {
  rebuildLevel();
  scheduleSave();
  document.getElementById('cols').value = grid.cols;
  document.getElementById('rows').value = grid.rows;
}

function pushUndo() {
  undoStack.push(grid.toAscii());
  if (undoStack.length > 60) undoStack.shift();
}

function undo() {
  const prev = undoStack.pop();
  if (prev === undefined) return;
  grid = EditorGrid.fromAscii(prev);
  markDirty();
}

// ---- Canvas / camera ----
function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  return { w, h, dpr };
}

function worldFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  return { x: camera.x + sx / camera.zoom, y: camera.y + sy / camera.zoom };
}

function cellFromWorld(w) {
  return { x: Math.floor(w.x / CONFIG.tileSize), y: Math.floor(w.y / CONFIG.tileSize) };
}

// ---- Render loop (editor mode only; playtest owns the canvas via Engine) ----
function frame() {
  rafId = requestAnimationFrame(frame);
  const { w, h, dpr } = fitCanvas();
  camera.setView(w, h);
  camera.prevX = camera.x; camera.prevY = camera.y;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = CONFIG.render.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  camera.applyTo(ctx, dpr, 1);
  const rect = camera.visibleRect(1);
  renderer.drawGrid(ctx, rect);
  renderer.drawWalls(ctx, level.walls, rect);
  drawSpawn(ctx);
  drawHover(ctx);

  if (Date.now() > statusOverrideUntil) {
    statusEl.textContent =
      `tile ${hover.x},${hover.y}  |  grid ${grid.cols}x${grid.rows}  |  tool ${tool.label}  |  zoom ${camera.zoom.toFixed(2)}x`;
  }
}

function drawSpawn(ctx) {
  const s = level.spawn;
  ctx.fillStyle = CONFIG.render.ballColor;
  ctx.beginPath();
  ctx.arc(s.x, s.y, CONFIG.player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#161a23';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHover(ctx) {
  if (!hover.valid) return;
  const t = CONFIG.tileSize;
  ctx.strokeStyle = tool.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(hover.x * t + 1, hover.y * t + 1, t - 2, t - 2);
}

// ---- Painting ----
function paintAt(cx, cy, ch) {
  if (grid.get(cx, cy) === null || grid.get(cx, cy) === ch) return;
  grid.set(cx, cy, ch);
  markDirty();
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (playtest) return;
  if (e.button === 1 || (e.button === 0 && spaceDown)) {
    isPanning = true; panLast = { x: e.clientX, y: e.clientY };
    return;
  }
  const w = worldFromEvent(e), c = cellFromWorld(w);
  pushUndo();
  isPainting = true;
  paintCh = e.button === 2 ? ' ' : tool.ch;
  paintAt(c.x, c.y, paintCh);
});

window.addEventListener('mousemove', (e) => {
  if (playtest) return;
  const w = worldFromEvent(e), c = cellFromWorld(w);
  hover = { x: c.x, y: c.y, valid: c.x >= 0 && c.y >= 0 && c.x < grid.cols && c.y < grid.rows };
  if (isPanning && panLast) {
    camera.x -= (e.clientX - panLast.x) / camera.zoom;
    camera.y -= (e.clientY - panLast.y) / camera.zoom;
    panLast = { x: e.clientX, y: e.clientY };
  } else if (isPainting) {
    paintAt(c.x, c.y, paintCh);
  }
});

window.addEventListener('mouseup', () => { isPainting = false; isPanning = false; panLast = null; });

canvas.addEventListener('wheel', (e) => {
  if (playtest) return;
  e.preventDefault();
  const before = worldFromEvent(e);
  const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
  camera.zoom = Math.min(4, Math.max(0.2, camera.zoom * factor));
  const after = worldFromEvent(e);
  camera.x += before.x - after.x;
  camera.y += before.y - after.y;
}, { passive: false });

// ---- Keyboard ----
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { spaceDown = true; e.preventDefault(); }
  if (playtest) {
    if (e.code === 'Escape') stopPlaytest();
    return;
  }
  const found = TOOLS.find((t) => t.key === e.key);
  if (found) { tool = found; refreshToolButtons(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
});
window.addEventListener('keyup', (e) => { if (e.code === 'Space') spaceDown = false; });

// ---- Toolbar wiring ----
const toolGrid = document.getElementById('tool-grid');
TOOLS.forEach((t) => {
  const btn = document.createElement('button');
  btn.className = 'tool-btn';
  btn.innerHTML = `<span class="swatch" style="background:${t.color}"></span>${t.label}`;
  btn.addEventListener('click', () => { tool = t; refreshToolButtons(); });
  btn.dataset.ch = t.ch;
  toolGrid.appendChild(btn);
});
function refreshToolButtons() {
  [...toolGrid.children].forEach((btn) => btn.classList.toggle('active', btn.dataset.ch === tool.ch));
}
refreshToolButtons();

document.getElementById('resize').addEventListener('click', () => {
  const cols = Math.max(4, Math.min(400, +document.getElementById('cols').value || grid.cols));
  const rows = Math.max(4, Math.min(200, +document.getElementById('rows').value || grid.rows));
  pushUndo();
  grid.resize(cols, rows);
  markDirty();
});

document.getElementById('new').addEventListener('click', () => {
  const cols = +document.getElementById('cols').value || 60;
  const rows = +document.getElementById('rows').value || 18;
  pushUndo();
  grid = EditorGrid.blank(cols, rows);
  markDirty();
});

document.getElementById('load-level1').addEventListener('click', async () => {
  const mod = await import('../levels/level1.js');
  pushUndo();
  grid = EditorGrid.fromAscii(mod.LEVEL_1);
  document.getElementById('level-name').value = 'LEVEL_1';
  markDirty();
});

document.getElementById('import').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const m = text.match(/`([\s\S]*?)`/);
  if (!m) { flashStatus('No backtick-delimited level found in file'); return; }
  const nameMatch = text.match(/export const (\w+)/);
  pushUndo();
  grid = EditorGrid.fromAscii(m[1]);
  if (nameMatch) document.getElementById('level-name').value = nameMatch[1];
  markDirty();
  e.target.value = '';
});

document.getElementById('export').addEventListener('click', () => {
  const name = document.getElementById('level-name').value.trim() || 'LEVEL_CUSTOM';
  const src = `// Legend: # solid, ~ ice, B bouncy, - one-way, ^ hazard, P spawn (see world/Level.js)\n` +
    `export const ${name} = \`\n${grid.toAscii()}\n\`;\n`;
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${name.toLowerCase()}.js`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(grid.toAscii()); flashStatus('Copied ASCII to clipboard'); }
  catch { flashStatus('Clipboard unavailable'); }
});

document.getElementById('undo').addEventListener('click', undo);

let statusOverrideUntil = 0;
function flashStatus(msg) {
  statusEl.textContent = msg;
  statusOverrideUntil = Date.now() + 1200;
}

// ---- Playtest ----
const gravityInput = document.getElementById('pt-gravity');
gravityInput.value = CONFIG.player.gravity;
gravityInput.addEventListener('change', () => {
  CONFIG.player.gravity = +gravityInput.value || CONFIG.player.gravity;
});

const playtestBtn = document.getElementById('playtest');
playtestBtn.addEventListener('click', () => (playtest ? stopPlaytest() : startPlaytest()));

function startPlaytest() {
  cancelAnimationFrame(rafId);
  const input = new Input(window);
  const ptLevel = Level.fromAscii(grid.toAscii(), { tileSize: CONFIG.tileSize, name: 'playtest' });
  const scene = new GameScene({ input, level: ptLevel, config: CONFIG });
  const engine = new Engine(canvas, CONFIG.physics);
  engine.setScene(scene);
  engine.start();
  playtest = { engine, input };
  playtestBtn.textContent = '■ Stop (Esc)';
  playtestBtn.classList.add('playing');
  canvas.style.cursor = 'default';
}

function stopPlaytest() {
  if (!playtest) return;
  playtest.engine.destroy();
  playtest.input.destroy();
  playtest = null;
  playtestBtn.textContent = '▶ Playtest';
  playtestBtn.classList.remove('playing');
  canvas.style.cursor = 'crosshair';
  rafId = requestAnimationFrame(frame);
}

// ---- Boot ----
document.getElementById('cols').value = grid.cols;
document.getElementById('rows').value = grid.rows;
camera.setView(canvas.clientWidth || 800, canvas.clientHeight || 600);
camera.snapTo(level.spawn.x, level.spawn.y);
rafId = requestAnimationFrame(frame);

// Exposed for tooling / automated play-tests.
window.editor = {
  get grid() { return grid; },
  get level() { return level; },
  camera, TOOLS,
  get tool() { return tool; },
  set tool(t) { tool = t; refreshToolButtons(); },
};

import { CONFIG } from './config.js';
import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { Level } from './world/Level.js';
import { GameScene } from './scenes/GameScene.js';
import { LEVEL_1 } from './levels/level1.js';

const canvas = document.getElementById('game');
const engine = new Engine(canvas, CONFIG.physics);
const input = new Input(window);
const level = Level.fromAscii(LEVEL_1, { tileSize: CONFIG.tileSize, name: 'level1' });
const scene = new GameScene({ input, level, config: CONFIG });

engine.setScene(scene);
engine.start();

// Exposed for tooling / console tinkering / automated play-tests.
window.game = { engine, input, scene, config: CONFIG, Level };

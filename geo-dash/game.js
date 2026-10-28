const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gridSize = 20;
let canvasWidth = 400;
let canvasHeight = 600;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let cube = {
    x: canvasWidth / 2 - gridSize / 2,
    y: canvasHeight - gridSize * 3,
    width: gridSize,
    height: gridSize,
    color: '#f97316',
    velocityY: 0,
    gravity: 0.5,
    jump: -10
};

let keys = {
    space: false,
    up: false,
    down: false,
    left: false,
    right: false
};

let platforms = [];
let spikes = [];

function createPlatform(x, y, width) {
    for (let i = 0; i < width / gridSize; i++) {
        platforms.push({
            x: x + i * gridSize,
            y: y,
            width: gridSize,
            height: gridSize
        });
    }
}

function createSpikes(x, y) {
    spikes.push({ x, y });
}

function initGame() {
    // Create levels
    createPlatform(0, canvasHeight - gridSize, canvasWidth);
    createPlatform(100, canvasHeight - gridSize * 2, 200);
    createPlatform(300, canvasHeight - gridSize * 3, 100);
    createPlatform(150, canvasHeight - gridSize * 4, 200);
    createPlatform(350, canvasHeight - gridSize * 5, 50);

    // Create spike traps
    createSpikes(200, canvasHeight - gridSize * 2 + 10);
    createSpikes(350, canvasHeight - gridSize * 3 + 10);
}

function resetGame() {
    cube = {
        x: canvasWidth / 2 - gridSize / 2,
        y: canvasHeight - gridSize * 3,
        width: gridSize,
        height: gridSize,
        color: '#f97316',
        velocityY: 0,
        gravity: 0.5,
        jump: -10
    };
    platforms.length = 0;
    spikes.length = 0;
    initGame();
}

function jump() {
    if (canJump()) {
        cube.velocityY = cube.jump;
    }
}

function canJump() {
    for (let plat of platforms) {
        if (cube.x + cube.width > plat.x &&
            cube.x < plat.x + plat.width &&
            cube.y + cube.height > plat.y &&
            cube.y < plat.y + plat.height && cube.velocityY > 0) {
            cube.y = plat.y - cube.height;
            cube.velocityY = 0;
            return true;
        }
    }
    return false;
}

function checkCollision() {
    // Check platform collision
    for (let plat of platforms) {
        if (cube.x + cube.width > plat.x &&
            cube.x < plat.x + plat.width &&
            cube.y + cube.height > plat.y &&
            cube.y < plat.y + plat.height) {
            if (cube.velocityY > 0) {
                cube.y = plat.y - cube.height;
                cube.velocityY = 0;
                return false;
            }
        }
    }

    // Check spike collision
    for (let spike of spikes) {
        if (cube.x < spike.x + gridSize &&
            cube.x + cube.width > spike.x &&
            cube.y < spike.y + gridSize &&
            cube.y + cube.height > spike.y) {
            return 'gameover';
        }
    }

    // Check bottom death
    if (cube.y > canvasHeight) {
        return 'death';
    }

    return false;
}

function update() {
    cube.velocityY += cube.gravity;
    cube.y += cube.velocityY;

    // Move cube left/right with arrows
    if (keys.left) cube.x -= 3;
    if (keys.right) cube.x += 3;

    // Wall collision
    if (cube.x < 0) cube.x = 0;
    if (cube.x + cube.width > canvasWidth) cube.x = canvasWidth - cube.width;

    let result = checkCollision();
    if (result === 'gameover' || result === 'death') {
        resetGame();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background grids
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasWidth; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
    }
    for (let i = 0; i < canvasHeight; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        ctx.stroke();
    }

    // Draw platforms
    ctx.fillStyle = '#10b981';
    for (let plat of platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Draw spikes
    ctx.fillStyle = '#ef4444';
    for (let spike of spikes) {
        ctx.beginPath();
        ctx.moveTo(spike.x + gridSize / 2, spike.y);
        ctx.lineTo(spike.x + gridSize, spike.y + gridSize);
        ctx.lineTo(spike.x, spike.y + gridSize);
        ctx.closePath();
        ctx.fill();
    }

    // Draw cube
    ctx.fillStyle = cube.color;
    ctx.fillRect(cube.x, cube.y, cube.width, cube.height);

    update();
    requestAnimationFrame(draw);
}

initGame();
draw();
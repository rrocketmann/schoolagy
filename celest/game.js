const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let player = {
    x: 180,
    y: 560,
    width: 20,
    height: 20,
    dy: 0,
    gravity: 0.8,
    jump: -12
};

let keys = {
    space: false,
    left: false,
    right: false
};

let platforms = [
    { x: 0, y: 580, width: 400, height: 20 },
    { x: 50, y: 450, width: 100, height: 20 },
    { x: 200, y: 350, width: 100, height: 20 },
    { x: 320, y: 280, width: 80, height: 20 },
    { x: 180, y: 200, width: 40, height: 20 }
];

let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    if (e.key in keysPressed) keysPressed[e.key] = true;
    if (e.key === ' ' && !keysPressed.Space) {
        keysPressed.Space = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keysPressed) keysPressed[e.key] = false;
});

function playerMove() {
    player.dy += player.gravity;
    player.y += player.dy;

    // Gravity collision
    let onGround = false;
    for (let plat of platforms) {
        if (player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height > plat.y &&
            player.y < plat.y + plat.height) {
            // Check if falling onto platform
            if (player.dy > 0 && player.y + player.dy + player.height > plat.y) {
                player.y = plat.y - player.height;
                player.dy = 0;
                onGround = true;
            }
        }
    }

    if (!onGround && player.y > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
    }

    // Move left/right
    if (keysPressed.ArrowLeft) player.x -= 3;
    if (keysPressed.ArrowRight) player.x += 3;
    if (keysPressed.Space && onGround) {
        player.dy = player.jump;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#f97316';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw platforms
    ctx.fillStyle = '#10b981';
    for (let plat of platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    playerMove();
    requestAnimationFrame(draw);
}

draw();
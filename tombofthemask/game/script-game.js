const limit = Math.tan(45 * 1.5 / 180 * Math.PI); //touch - per lo slide in orizzontale e verticale
const gestureZone = document.body; //touch - zona di touch
const score = document.getElementById("numero-score");
const wallDown = new Image(); //crea una variabile contenente un immagine
const wallUp = new Image();
const wallLeft = new Image();
const wallRight = new Image();
const wallDownLeft = new Image();
const wallDownRight = new Image();
const wallUpLeft = new Image();
const wallUpRight = new Image();
const wallFull = new Image();
const wallLeftRight = new Image();
const wallUpDown = new Image();
const wallNotDown = new Image();
const wallNotRight = new Image();
const wallNotLeft = new Image();
const wallNotUp = new Image();
const trapSquareImage = new Image();
const spikeTrapDownImage = new Image();
const spikeTrapTopImage = new Image();
const spikeTrapRightImage = new Image();
const spikeTrapLeftImage = new Image();
const spikeTrapDownLeftImage = new Image();
const spikeTrapDownRightImage = new Image();
const spikeTrapTopLeftImage = new Image();
const spikeTrapTopRightImage = new Image();
const upLeftSpike = new Image();
const upRightSpike = new Image()
const downLeftSpike = new Image();
const downRightSpike = new Image();
const upSpike = new Image();
const downSpike = new Image();
const leftSpike = new Image();
const rightSpike = new Image();
const upSpikeTrap = new Image();
const rightSpikeTrap = new Image();
const downSpikeTrap = new Image();
const leftSpikeTrap = new Image();
const exitBox = new Image();
const gameSoundtrack = new Audio('../Music and sounds/Game-soundtrack.mp3'); //crea una variabile di tipo audio
const playerMovement = new Audio('../Music and sounds/Player-movement.mp3');
const coinPickUp = new Audio('../Music and sounds/Coin.mp3');
const starPickUp = new Audio('../Music and sounds/Star-pick-up.mp3');
const trapOn = new Audio('../Music and sounds/Spikesinwalls-attack.mp3');
const trapOff = new Audio('../Music and sounds/Spikesinwalls-off.mp3');
const winSound = new Audio('../Music and sounds/Win.mp3');
const deathSound = new Audio('../Music and sounds/Death.mp3');
const firstStar = new Audio('../Music and sounds/1-star.mp3');
const secondStar = new Audio('../Music and sounds/2-star.mp3');
const thirdStar = new Audio('../Music and sounds/3-star.mp3');
let map = JSON.parse(window.localStorage.getItem('map')); //prende la mappa dallo storage locale
let stageLevel = window.localStorage.getItem('stage-level'); //prende il numero della mappa dallo storage locale
let playerRotation = "down_player";
let playerSprites = new Image(); //crea una variabile contenente un immagine
let starSprites = new Image();
let coinSprites = new Image();
let player;
let oneBlockSize = 40; //larghezza di un blocco
let starUp = 0;
let pageWidth = window.innerWidth || document.body.clientWidth; //touch
let treshold = Math.max(1,Math.floor(0.01 * (pageWidth))); //touch
let touchstartX = 0; //touch
let touchstartY = 0; //touch
let touchendX = 0; //touch
let touchendY = 0; //touch
let playerFrames = 0; 
let exitFrames = 0;
let starFrames = 0;
let coinFrames = 0;
let delay = false //delay del movimento del player

document.getElementsByClassName("stage-level")[0].innerHTML = stageLevel; //per mettere lo stage in alto
document.getElementsByClassName("stage-level")[1].innerHTML = stageLevel; //per mettere lo stage dentro il messaggio di lose
document.getElementsByClassName("stage-level")[2].innerHTML = stageLevel; //per mettere lo stage dentro il messaggio di win
wallDown.src = '../Images/Wall/Wall-down.png'; //trova l'immagine
wallUp.src = '../Images/Wall/Wall-up.png';
wallLeft.src = '../Images/Wall/Wall-left.png';
wallRight.src = '../Images/Wall/Wall-right.png';
wallDownLeft.src = '../Images/Wall/Wall-down-left.png';
wallDownRight.src = '../Images/Wall/Wall-down-right.png';
wallUpLeft.src = '../Images/Wall/Wall-up-left.png';
wallUpRight.src = '../Images/Wall/Wall-up-right.png';
wallFull.src = '../Images/Wall/Wall-full.png';
wallLeftRight.src = '../Images/Wall/Wall-left-right.png';
wallUpDown.src = '../Images/Wall/Wall-up-down.png';
wallNotDown.src = '../Images/Wall/Wall-not-down.png';
wallNotRight.src = '../Images/Wall/Wall-not-right.png';
wallNotLeft.src = '../Images/Wall/Wall-not-left.png';
wallNotUp.src = '../Images/Wall/Wall-not-up.png';
trapSquareImage.src = '../Images/Traps/Spike-trap/Spike-trap-square.png';
spikeTrapDownImage.src = '../Images/Traps/Spike-trap/Spike-trap-down.png';
spikeTrapTopImage.src = '../Images/Traps/Spike-trap/Spike-trap-up.png';
spikeTrapRightImage.src = '../Images/Traps/Spike-trap/Spike-trap-right.png';
spikeTrapLeftImage.src = '../Images/Traps/Spike-trap/Spike-trap-left.png';
spikeTrapDownLeftImage.src = '../Images/Traps/Spike-trap/Spike-trap-down-left.png';
spikeTrapDownRightImage.src = '../Images/Traps/Spike-trap/Spike-trap-down-right.png';
spikeTrapTopLeftImage.src = '../Images/Traps/Spike-trap/Spike-trap-up-left.png';
spikeTrapTopRightImage.src = '../Images/Traps/Spike-trap/Spike-trap-up-right.png';
upSpike.src = '../Images/Traps/Spike/Spike-up.png';
downSpike.src = '../Images/Traps/Spike/Spike-down.png';
leftSpike.src = '../Images/Traps/Spike/Spike-left.png';
rightSpike.src = '../Images/Traps/Spike/Spike-right.png';
upLeftSpike.src = '../Images/Traps/Spike/Spike-up-left.png';
upRightSpike.src = '../Images/Traps/Spike/Spike-up-right.png';
downLeftSpike.src = '../Images/Traps/Spike/Spike-down-left.png';
downRightSpike.src = '../Images/Traps/Spike/Spike-down-right.png';
rightSpikeTrap.src = '../Images/Traps/Spike-trap/Spike-trap-spike-right.png';
downSpikeTrap.src = '../Images/Traps/Spike-trap/Spike-trap-spike-down.png';
leftSpikeTrap.src = '../Images/Traps/Spike-trap/Spike-trap-spike-left.png';
upSpikeTrap.src = '../Images/Traps/Spike-trap/Spike-trap-spike-up.png';
exitBox.src = '../Images/Exit/exit'+ exitFrames +'.png'
playerSprites.src = '../Images/Player/' + playerRotation + '9.png';
starSprites.src = '../Images/Stars e coins/star0.png';
coinSprites.src = '../Images/Stars e coins/coin0.png';

gameSoundtrack.volume = 0.2; //attribuisco un volume al suono
playerMovement.volume = 0.2;
starPickUp.volume = 0.2;
coinPickUp.volume = 0.2;
trapOn.volume = 0.2;
winSound.volume = 0.2;
deathSound.volume = 0.2;

function startGame() {
    getPlayerPosition();
    player = new MakePlayer(oneBlockSize, oneBlockSize, playerPosXMap, playerPosYMap); //creo il player
    gameArea.start() //avvio il gioco
    mapResolutionManagement();
    window.addEventListener("keydown", getKey); //evento che prende i tasti
    gestureZone.addEventListener('touchstart', function(event) { //evento che prende il touch
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);
    
    gestureZone.addEventListener('touchend', function(event) { //evento che prende il touch
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture(event);
    }, false);
    updateTextures();
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    //     touchFix();
    // }
}

let gameArea = {
    canvas : document.createElement("canvas"), //crea un elemento canvas
    start : function() {
        this.canvas.width = (map[0].length) * oneBlockSize; //attribuisce larghezza al canvas
        this.canvas.height = (map.length) * oneBlockSize; //attribuisce altezza al canvas
        this.canvas.id = "map"; //attribuisce l'id
        this.context = this.canvas.getContext("2d"); // gli da il modo di lavorare, in questo caso 2d
        document.getElementById("map-container").appendChild(this.canvas); //lo inserisco nella pagina
        this.interval = setInterval(updateGameArea, 20); //aggiorna la mappa
    },
    stop : function() {
        clearInterval(this.interval); //per stoppare la funzione
    },    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //per eliminare il vecchio player
    }
}

function MakePlayer(width, height, x, y) {
    this.width = width; //assegno una larghezza
    this.height = height; //assegno l'altezza
    this.x = x * oneBlockSize + this.width / 2; //assegno la poszione con la coordinata x
    this.y = y * oneBlockSize + this.height / 2; //assegno la poszione con la coordinata y
    this.update = function() {
        ctx = gameArea.context;
        ctx.save(); //salva le modifiche apportate
        ctx.translate(this.x, this.y); //trasla il player di x e y
        ctx.drawImage(playerSprites, this.width / -2, this.height / -2);
        ctx.restore(); //ripristina la pagina prima del save()
    }
}

function updateGameArea() {
    goBackToLevelSelection();
    gameArea.clear();
    player.update(); //aggiorna lo stato del player
    drawWall(); //crea e aggiorna tutti i muri
    getPlayerPosition(); //controlla la posizione del player sulla mappa
    onTrap(); //controlla se il giocatore e sopra una trappola
}

function getKey(event){
    gameSoundtrack.play();
    if(delay == false)
    {
        if(event.key == "ArrowRight"){ //verifica per la freccia destra
            playerRotation = "right_player";
            playerSprites.src = "../Images/Player/"+ playerRotation + playerFrames + ".png"; //cambia l'immagine
            delay = true; //metto un delay per i tasti
            setTimeout(function(){delay = false}, 70); //dopo 70 millisecondi il delay sparisce e quindi si possono riutilizzare i tasti
            for(let i = 0; i < map[0].length; i++){//verifico collisioni vaire
                if(map[playerPosYMap][playerPosXMap + 1] == "S"){ //verifica la collisione con le stelle
                    starCount();
                }
                if(map[playerPosYMap][playerPosXMap + 1] == "C"){ //verifica la collisione con le monete
                    coinPickUp.play();
                }
                if((map[playerPosYMap][playerPosXMap + 1] == "SL") || (map[playerPosYMap][playerPosXMap + 1] == "SUL")){ //verifica collisioni con le spike
                    gameOver();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap + 1] == "TU") || (map[playerPosYMap][playerPosXMap + 1] == "TD")){ //verifica collisioni con le spikeTrap
                    gameOver();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap + 1] == "SL") == "END"){ //verifica collisioni con la end box
                    win();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap + 1] != "WL") && (map[playerPosYMap][playerPosXMap + 1] != "WDL") && (map[playerPosYMap][playerPosXMap + 1] != "WUL") && (map[playerPosYMap][playerPosXMap + 1] != "WLR") && (map[playerPosYMap][playerPosXMap + 1] != "WND") && (map[playerPosYMap][playerPosXMap + 1] != "WDR") && (map[playerPosYMap][playerPosXMap + 1] != "WUR") && (map[playerPosYMap][playerPosXMap + 1] != "WNR") && (map[playerPosYMap][playerPosXMap + 1] != "WNU") && (map[playerPosYMap][playerPosXMap + 1] != "WF") && (map[playerPosYMap][playerPosXMap + 1] != "TS") && (map[playerPosYMap][playerPosXMap + 1] != "END") && (map[playerPosYMap][playerPosXMap + 1] != "SL") && (map[playerPosYMap][playerPosXMap + 1] != "SUL") && (map[playerPosYMap][playerPosXMap + 1] != "TU") && (map[playerPosYMap][playerPosXMap + 1] != "TD") && (map[playerPosYMap][playerPosXMap + 1] != "STL") && (map[playerPosYMap][playerPosXMap + 1] != "STUL") && (map[playerPosYMap][playerPosXMap + 1] != "STDL")){
                    map[playerPosYMap][playerPosXMap] = "E"; //cambia la posizione nella mappa
                    activateTrap();
                    playerPosXMap++;
                    playerMovement.play();
                    activateTrap();
                    map[playerPosYMap][playerPosXMap] = "P";
                    player.x = ((playerPosXMap + 1) * oneBlockSize) - player.width / 2; //lo visualizza a schermo
                }
            }
        }
        if(event.key == "ArrowLeft"){ //verifica per la f reccia sinistra
            playerRotation = "left_player";
            playerSprites.src = "../Images/Player/"+ playerRotation + playerFrames + ".png";
            delay = true;
            setTimeout(function(){delay = false}, 70);
            for(let i = 0; i < map[0].length; i++){
                if(map[playerPosYMap][playerPosXMap - 1] == "S"){
                    starCount();
                }
                if(map[playerPosYMap][playerPosXMap - 1] == "C"){
                    coinPickUp.play();
                }
                if((map[playerPosYMap][playerPosXMap - 1] == "SR") || (map[playerPosYMap][playerPosXMap - 1] == "SUR")){
                    gameOver();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap - 1] == "TU") || (map[playerPosYMap][playerPosXMap - 1] == "TD")){
                    gameOver();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap - 1] == "SL") == "END"){
                    win();
                    break;
                }
                if((map[playerPosYMap][playerPosXMap - 1] != "WR") && (map[playerPosYMap][playerPosXMap - 1] != "WDR") && (map[playerPosYMap][playerPosXMap - 1] != "WUR") && (map[playerPosYMap][playerPosXMap - 1] != "WDL") && (map[playerPosYMap][playerPosXMap - 1] != "WUL") && (map[playerPosYMap][playerPosXMap - 1] != "WLR") && (map[playerPosYMap][playerPosXMap - 1] != "WNL") && (map[playerPosYMap][playerPosXMap - 1] != "WNU") && (map[playerPosYMap][playerPosXMap - 1] != "WND") && (map[playerPosYMap][playerPosXMap - 1] != "WF") && (map[playerPosYMap][playerPosXMap - 1] != "TS") && (map[playerPosYMap - 1][playerPosXMap] != "END") && (map[playerPosYMap][playerPosXMap - 1] != "SR") && (map[playerPosYMap][playerPosXMap - 1] != "SUR") && (map[playerPosYMap][playerPosXMap - 1] != "TU") && (map[playerPosYMap][playerPosXMap - 1] != "TD") && (map[playerPosYMap][playerPosXMap - 1] != "STR") && (map[playerPosYMap][playerPosXMap - 1] != "STUR") && (map[playerPosYMap][playerPosXMap - 1] != "STDR")){
                    map[playerPosYMap][playerPosXMap] = "E";
                    activateTrap();
                    playerPosXMap--;
                    playerMovement.play();
                    activateTrap();
                    map[playerPosYMap][playerPosXMap] = "P";
                    player.x = (playerPosXMap * oneBlockSize) + player.width / 2;
                }
            }
        }
        if(event.key == "ArrowUp"){ //verifica per la freccia su
            playerRotation = "up_player";
            playerSprites.src = "../Images/Player/"+ playerRotation + playerFrames + ".png";
            delay = true;
            setTimeout(function(){delay = false}, 70);
            for(let i = 0; i < map.length; i++){
                if(map[playerPosYMap - 1][playerPosXMap] == "S"){
                    starCount();
                }
                if(map[playerPosYMap - 1][playerPosXMap] == "C"){
                    coinPickUp.play();
                }
                if((map[playerPosYMap - 1][playerPosXMap] == "SD") || (map[playerPosYMap - 1][playerPosXMap] == "SUR")){
                    gameOver();
                    break;
                }
                if((map[playerPosYMap - 1][playerPosXMap] == "TL") || (map[playerPosYMap - 1][playerPosXMap] == "TR")){
                    gameOver();
                    break;
                }
                if(map[playerPosYMap - 1][playerPosXMap] == "END"){
                    win();
                    break;
                }
                if((map[playerPosYMap - 1][playerPosXMap] != "WD") && (map[playerPosYMap - 1][playerPosXMap] != "WDR") && (map[playerPosYMap - 1][playerPosXMap] != "WDL") && (map[playerPosYMap - 1][playerPosXMap] != "WUD") && (map[playerPosYMap - 1][playerPosXMap] != "WUL") && (map[playerPosYMap - 1][playerPosXMap] != "WUR") && (map[playerPosYMap - 1][playerPosXMap] != "WNR") && (map[playerPosYMap - 1][playerPosXMap] != "WNL") && (map[playerPosYMap - 1][playerPosXMap] != "WNU") && (map[playerPosYMap - 1][playerPosXMap] != "WF") && (map[playerPosYMap - 1][playerPosXMap] != "TS") && (map[playerPosYMap - 1][playerPosXMap] != "END") && (map[playerPosYMap - 1][playerPosXMap] != "SD") && (map[playerPosYMap - 1][playerPosXMap] != "SUR") && (map[playerPosYMap - 1][playerPosXMap] != "TL") && (map[playerPosYMap - 1][playerPosXMap] != "TR") && (map[playerPosYMap - 1][playerPosXMap] != "STD") && (map[playerPosYMap - 1][playerPosXMap] != "STDR") && (map[playerPosYMap - 1][playerPosXMap] != "STDL")){
                    map[playerPosYMap][playerPosXMap] = "E";
                    activateTrap();
                    playerPosYMap--;
                    playerMovement.play();
                    activateTrap();
                    map[playerPosYMap][playerPosXMap] = "P";
                    player.y = (playerPosYMap * oneBlockSize) + player.height / 2;
                }
            }
        }
        if(event.key == "ArrowDown"){ //verifica per la freccia giu
            playerRotation = "down_player";
            playerSprites.src = "../Images/Player/"+ playerRotation + playerFrames + ".png";
            delay = true;
            setTimeout(function(){delay = false}, 70);
            for(let i = 0; i < map.length; i++){
                if(map[playerPosYMap + 1][playerPosXMap] == "S"){
                    starCount();
                }
                if(map[playerPosYMap + 1][playerPosXMap] == "C"){
                    coinPickUp.play();
                }
                if((map[playerPosYMap + 1][playerPosXMap] == "SU") || (map[playerPosYMap + 1][playerPosXMap] == "SUL")){
                    gameOver();
                    break;
                }
                if((map[playerPosYMap + 1][playerPosXMap] == "TL") || (map[playerPosYMap + 1][playerPosXMap] == "TR")){
                    gameOver();
                    break;
                }
                if(map[playerPosYMap + 1][playerPosXMap] == "END"){
                    win();
                    break;
                }
                if((map[playerPosYMap + 1][playerPosXMap] != "WU") && (map[playerPosYMap + 1][playerPosXMap] != "WDL") && (map[playerPosYMap + 1][playerPosXMap] != "WDR") && (map[playerPosYMap + 1][playerPosXMap] != "WUL") && (map[playerPosYMap + 1][playerPosXMap] != "WUR") && (map[playerPosYMap + 1][playerPosXMap] != "WNL") && (map[playerPosYMap + 1][playerPosXMap] != "WNR") && (map[playerPosYMap + 1][playerPosXMap] != "WND") && (map[playerPosYMap + 1][playerPosXMap] != "WUD") && (map[playerPosYMap + 1][playerPosXMap] != "WF") && (map[playerPosYMap + 1][playerPosXMap] != "TS") && (map[playerPosYMap + 1][playerPosXMap] != "END") && (map[playerPosYMap + 1][playerPosXMap] != "SU") && (map[playerPosYMap + 1][playerPosXMap] != "SUL") && (map[playerPosYMap + 1][playerPosXMap] != "TL") && (map[playerPosYMap + 1][playerPosXMap] != "TR") && (map[playerPosYMap + 1][playerPosXMap] != "STU")&& (map[playerPosYMap + 1][playerPosXMap] != "STUR")&& (map[playerPosYMap + 1][playerPosXMap] != "STUL")){
                    map[playerPosYMap][playerPosXMap] = "E";
                    activateTrap();
                    playerPosYMap++;
                    playerMovement.play();
                    activateTrap();
                    map[playerPosYMap][playerPosXMap] = "P";
                    player.y = ((playerPosYMap + 1) * oneBlockSize) - player.height / 2;
                }
            }
        }
        trigger = 0;
    }
}


function handleGesture() {
    let x = touchendX - touchstartX; //area di inzio dello slide
    let y = touchendY - touchstartY; //area di fine dello slide
    let xy = Math.abs(x / y);
    let yx = Math.abs(y / x);
    if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
        if(delay == false)
        {
            if (yx <= limit) {
                if (x < 0) { //se trascini a sinistra
                    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
                }
                else{ //se trascini a destra
                    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
                }
            }
        }
        if(delay == false)
        {
            if (xy <= limit) {
                if (y < 0) { //se trascini su
                    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowUp'}));
                }
                else { //se trascini giu
                    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowDown'}));
                }
            }
        }
    }
}

function drawWall(){
    let ctxRect = gameArea.context; //prelevo il contesto 2d
    for(let i = 0; i < map.length; i++){ //scorro tutto l'array
        for(let j = 0; j < map[0].length; j++){ //scorro di riga in riga
            if(map[i][j] == "WD"){
                ctxRect.drawImage(wallDown, j * oneBlockSize, i * oneBlockSize); //creo il muro di sopra
            }
            if(map[i][j] == "WU"){
                ctxRect.drawImage(wallUp, j * oneBlockSize, i * oneBlockSize); //creo il muro sotto
            }
            if(map[i][j] == "WR"){
                ctxRect.drawImage(wallRight, j * oneBlockSize, i * oneBlockSize); //creo il muro di sinistra
            }
            if(map[i][j] == "WL"){
                ctxRect.drawImage(wallLeft, j * oneBlockSize, i * oneBlockSize); //creo il muro di destra
            }
            if(map[i][j] == "WDL"){
                ctxRect.drawImage(wallDownLeft, j * oneBlockSize, i * oneBlockSize); //creo il muro angolo basso a sinistra
            }
            if(map[i][j] == "WDR"){
                ctxRect.drawImage(wallDownRight, j * oneBlockSize, i * oneBlockSize); //creo il muro basso a destra
            }
            if(map[i][j] == "WUL"){
                ctxRect.drawImage(wallUpLeft, j * oneBlockSize, i * oneBlockSize); //creo il muro alto a sinistra
            }
            if(map[i][j] == "WUR"){
                ctxRect.drawImage(wallUpRight, j * oneBlockSize, i * oneBlockSize); //creo il muro alto a destra
            }
            if(map[i][j] == "WF"){
                ctxRect.drawImage(wallFull, j * oneBlockSize, i * oneBlockSize); //creo il muro di un blocco
            }
            if(map[i][j] == "WLR"){
                ctxRect.drawImage(wallLeftRight, j * oneBlockSize, i * oneBlockSize); //creo il muro destra e sinistra
            }
            if(map[i][j] == "WUD"){
                ctxRect.drawImage(wallUpDown, j * oneBlockSize, i * oneBlockSize); //creo il muro sopra e sotto
            }
            if(map[i][j] == "WND"){
                ctxRect.drawImage(wallNotDown, j * oneBlockSize, i * oneBlockSize); //creo il muro triplo(no parte sotto)
            }
            if(map[i][j] == "WNR"){
                ctxRect.drawImage(wallNotRight, j * oneBlockSize, i * oneBlockSize); //creo il muro triplo(no parte destra)
            }
            if(map[i][j] == "WNL"){
                ctxRect.drawImage(wallNotLeft, j * oneBlockSize, i * oneBlockSize); //creo il muro triplo(no parte sinistra)
            }
            if(map[i][j] == "WNU"){
                ctxRect.drawImage(wallNotUp, j * oneBlockSize, i * oneBlockSize); //creo il muro triplo(no parte sopra)
            }
            if(map[i][j] == "C"){
                ctxRect.drawImage(coinSprites, j * oneBlockSize, i * oneBlockSize); //creo la monetina
            }
            if(map[i][j] == "S"){
                ctxRect.drawImage(starSprites, j * oneBlockSize, i * oneBlockSize); //creo la stella  
            }
            if(map[i][j] == "TS"){
                ctxRect.drawImage(trapSquareImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STU"){ //arrowdown
                ctxRect.drawImage(spikeTrapTopImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STD"){ //arrowup
                ctxRect.drawImage(spikeTrapDownImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STR"){ //arrowleft
                ctxRect.drawImage(spikeTrapRightImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STL"){ //arrowright
                ctxRect.drawImage(spikeTrapLeftImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STUR"){ //arrowleft arrowdown
                ctxRect.drawImage(spikeTrapTopRightImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STUL"){ //arrowright arrowdown
                ctxRect.drawImage(spikeTrapTopLeftImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STDR"){ //arrowleft arrowup
                ctxRect.drawImage(spikeTrapDownRightImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "STDL"){ //arrowright arrowup
                ctxRect.drawImage(spikeTrapDownLeftImage, j * oneBlockSize, i * oneBlockSize); //creo la trappola spenta
            }
            if(map[i][j] == "TU"){
                ctxRect.drawImage(upSpikeTrap, j * oneBlockSize, i * oneBlockSize); //creo la trappola accesa sopra
            }
            if(map[i][j] == "TR"){
                ctxRect.drawImage(rightSpikeTrap, j * oneBlockSize, i * oneBlockSize); //creo la trappola accesa destra
            }
            if(map[i][j] == "TD"){
                ctxRect.drawImage(downSpikeTrap, j * oneBlockSize, i * oneBlockSize); //creo la trappola accesa sotto
            }
            if(map[i][j] == "TL"){
                ctxRect.drawImage(leftSpikeTrap, j * oneBlockSize, i * oneBlockSize); //creo la trappola accesa sinistra
            }
            if(map[i][j] == "SU"){
                ctxRect.drawImage(upSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike sopra
            }
            if(map[i][j] == "SR"){
                ctxRect.drawImage(rightSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike destra
            }
            if(map[i][j] == "SD"){
                ctxRect.drawImage(downSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike sotto
            }
            if(map[i][j] == "SL"){
                ctxRect.drawImage(leftSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike left
            }
            if(map[i][j] == "SUL"){
                ctxRect.drawImage(upLeftSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike left
            }
            if(map[i][j] == "SUR"){
                ctxRect.drawImage(upRightSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike left
            }
            if(map[i][j] == "SDL"){
                ctxRect.drawImage(downLeftSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike left
            }
            if(map[i][j] == "SDR"){
                ctxRect.drawImage(downRightSpike, j * oneBlockSize, i * oneBlockSize); //creo la trappola spike left
            }
            if(map[i][j] == "END"){
                ctxRect.drawImage(exitBox, j * oneBlockSize, i * oneBlockSize); //creo la endbox
            }

        } 
    }
}

function getPlayerPosition(){
    for(let i = 0; i < map.length; i++){ //scorro la matrice
        for(let j = 0; j < map[i].length; j++){
            if(map[i][j] == "P"){ // prelevo la posizione del player
                playerPosYMap = i;
                playerPosXMap = j;
                break;
            }
        }
    }
}

function starCount(){
    starUp++; //aumenta il numero di monete raccolte
    score.innerText = starUp; //lo stampa a video
    starPickUp.play();
}

function activateTrap(){
    if((map[playerPosYMap][playerPosXMap + 1]) == "TS" || (map[playerPosYMap][playerPosXMap + 1] == "STL") || (map[playerPosYMap][playerPosXMap + 1] == "STUL") || (map[playerPosYMap][playerPosXMap + 1] == "STDL")){
        let trapPosY = playerPosYMap; //prende la posizione y della trappola
        let trapPosX = playerPosXMap + 1; //prende la posizione x della trappola
        let left = map[trapPosY][trapPosX - 1];
        if(left == "P"){
            left = "E";
        }
        setTimeout(function(){
            trapOn.play();
            map[trapPosY][trapPosX - 1] = "TL";
        }, 550); //attiva la trappola
        setTimeout(function(){
            trapOff.play();
            map[trapPosY][trapPosX - 1] = left;
        }, 1550); //attiva la trappola
    }
    if((map[playerPosYMap][playerPosXMap - 1]) == "TS" || (map[playerPosYMap][playerPosXMap - 1] == "STR") || (map[playerPosYMap][playerPosXMap - 1] == "STUR") || (map[playerPosYMap][playerPosXMap - 1] == "STDR")){
        let trapPosY = playerPosYMap;
        let trapPosX = playerPosXMap - 1;
        let right = map[trapPosY][trapPosX + 1];
        if(right == "P"){
            right = "E";
        }
        setTimeout(function(){
            trapOn.play();
            map[trapPosY][trapPosX + 1] = "TR";
        }, 550); //attiva la trappola
        setTimeout(function(){
            trapOff.play();
            map[trapPosY][trapPosX + 1] = right;
        }, 1550); //attiva la trappola
    }
    if((map[playerPosYMap + 1][playerPosXMap]) == "TS" || (map[playerPosYMap + 1][playerPosXMap] == "STU") || (map[playerPosYMap + 1][playerPosXMap] == "STUR") || (map[playerPosYMap + 1][playerPosXMap] == "STUL")){
        let trapPosY = playerPosYMap + 1;
        let trapPosX = playerPosXMap;
        let up = map[trapPosY - 1][trapPosX];
        if(up == "P"){
            up = "E";
        }
        setTimeout(function(){
            trapOn.play();
            map[trapPosY - 1][trapPosX] = "TU";
        }, 550); //attiva la trappola
        setTimeout(function(){
            trapOff.play();
            map[trapPosY - 1][trapPosX] = up;
        }, 1550); //attiva la trappola
    }
    if((map[playerPosYMap - 1][playerPosXMap]) == "TS" || (map[playerPosYMap - 1][playerPosXMap] == "STD") || (map[playerPosYMap - 1][playerPosXMap] == "STDR") || (map[playerPosYMap - 1][playerPosXMap] == "STDL")){
        let trapPosY = playerPosYMap - 1;
        let trapPosX = playerPosXMap;
        let down = map[trapPosY + 1][trapPosX];
        if(down == "P"){
            down = "E";
        }
        setTimeout(function(){
            trapOn.play();
            map[trapPosY + 1][trapPosX] = "TD";
        }, 550); //attiva la trappola
        setTimeout(function(){
            trapOff.play();
            map[trapPosY + 1][trapPosX] = down;
        }, 1550); //attiva la trappola
    }
    onTrap();
}

function onTrap() {
    //se sei sopra ad una spike trap
    if((map[playerPosYMap][playerPosXMap]) == "TL" || (map[playerPosYMap][playerPosXMap]) == "TR" || (map[playerPosYMap][playerPosXMap]) == "TU" || (map[playerPosYMap][playerPosXMap]) == "TD"){
        gameOver();
        gameArea.stop();
    }
}

function win(){
    winSound.play();
    window.removeEventListener("keydown", getKey); //disattiva pressione tasti
    gestureZone.removeEventListener('touchstart', function(event) { //evento che prende il touch
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);
    gestureZone.removeEventListener('touchend', function(event) { //evento che prende il touch
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture(event);
    }, false);
    setTimeout(function(){
        addStarsToWin();
        document.getElementById('win-container').style.display = "block"; //allert win
        document.getElementById('button-win').addEventListener('click', () => {
            window.location.href = "../index.html"; //ricarica pagina
        });
    }, 100); 
}

function addStarsToWin(){
    for(let i = 0; i < starUp; i++){
        setTimeout(function(){
            if(i == 0){
                firstStar.play();
            }
            else if(i == 1){
                secondStar.play();
            }
            else{
                thirdStar.play();
            }
            document.getElementById('second-sep').innerHTML += "<img class='stars' src='../Images/Stars e coins/star0.png'>";
        }, 500 * i); 
    }
}


function gameOver(){
    deathSound.play();
    window.removeEventListener("keydown", getKey); //disattiva pressione tasti
    gestureZone.removeEventListener('touchstart', function(event) { //evento che prende il touch
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);
    gestureZone.removeEventListener('touchend', function(event) { //evento che prende il touch
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture(event);
    }, false);
    setTimeout(function(){
        document.getElementById('lose-container').style.display = "block"; //allert morte
        document.getElementById('button-lose').addEventListener('click', () => {
            window.location.reload(); //ricarica pagina
        });
    }, 100); 
}

function updateTextures(){ //aggiorna tutte le texture
    setInterval(function(){ //ogni tot millisecondi cambia l'immagine che si trova dentro la cartella
        playerSprites.src = "../Images/Player/"+ playerRotation + playerFrames + ".png"; //prelevo l'immagine
        playerFrames++; //aumento per il l'immagine successiva
        if(playerFrames == 10) //se arriva alla fine delle immagini reincomincia l'animazione da capo
            playerFrames = 0;
    }, 250);
    setInterval(function(){
        starSprites.src = '../Images/Stars e coins/star' + starFrames + '.png';
        starFrames++;
        if(starFrames == 2){
            starFrames = 0;
        }
    }, 250);
    setInterval(function(){
        coinSprites.src = '../Images/Stars e coins/coin' + coinFrames + '.png';
        coinFrames++;
        if(coinFrames == 2){
            coinFrames = 0;
        }
    }, 250);
    setInterval(function(){
        exitBox.src = '../Images/Exit/exit'+ exitFrames +'.png';
        exitFrames++;
        if(exitFrames == 4){
            exitFrames = 0;
        }
    }, 250);
}

function goBackToLevelSelection(){
    document.getElementById("arrow").addEventListener("click", function(){ //tornare alla selezione livelli
        window.location.href = "../index.html";
    });
}

function touchFix() {
    let bgPremi = document.createElement("h1");
    bgPremi.id="bg-premi";
    let premi = document.createElement("h1");
    premi.innerHTML = "Tap to start";
    premi.id="premi";
    premi.addEventListener('click', function() {premi.remove(); bgPremi.remove()})
    document.body.insertBefore(premi, document.body.firstChild);
    document.body.insertBefore(bgPremi, document.body.firstChild);
}

function mapResolutionManagement(){
    let miniMobileResolution = window.matchMedia("(max-width: 320px)"); 
    let averageMobileResolution = window.matchMedia("(min-width: 321px) and (max-width: 768px)");
    let tabeltResolution = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");

    if((stageLevel == 2) || (stageLevel == 3)){
        if(miniMobileResolution.matches){
            document.getElementById('map').style.height = "50vh";
            document.getElementById('map').style.width = "100%";
        }
        else if(averageMobileResolution.matches){
            document.getElementById('map').style.height = "60vh";
            document.getElementById('map').style.width = "100%";
        }
        else if(tabeltResolution.matches){
            document.getElementById('map').style.height = "70vh";
            document.getElementById('map').style.width = "100%";
        }
    }
}
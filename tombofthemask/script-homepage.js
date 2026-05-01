const soundtrack = new Audio('Music and sounds/Soundtrack.mp3'); //crea una variabile di tipo audio
let immagini = document.getElementById("images");
let mutato = true;

soundtrack.volume = 0.2; //attribuisco il volume al suono

window.addEventListener("keydown", (ev)=> {
    if(ev.key == "Enter"){   
        inizia();
    }
});

function inizia(){
    immagini.style.display = "none";
    document.getElementById("levels-container").style.display = "flex";
    document.getElementById("level-buttons").style.display = "flex";
    document.getElementsByTagName("body")[0].style.backgroundImage = "none"; //nasconde la parte precedente
    document.body.style.height = 0;
}

function muta(){
    if(mutato == true){ //se risulta gia mutato...
        soundtrack.play(); //parte la musica
        document.getElementById("mutebtn").src = "Images/Background/unmuted.png"; //cambia l'icona
        mutato = !mutato; //cambia lo stato di mutato
    }
    else if(mutato == false){
        soundtrack.pause();
        document.getElementById("mutebtn").src = "Images/Background/muted.png";
        mutato = !mutato;
    }
}

//mappa dove W-(Wall) sono i muri, E(Empty) sono gli spazi vuoti, C(Coin) le monete, S(Star) le stelle, P(player) il player, ST-(SpikeTrap) per le trappole ad attivazione, S-(Spike) per trapolle statiche
function levelOne(){
    map = [
        ["E","E","E","E","E","E","E","E","E","E","WD","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","WR","END","WL","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","WR","C","WL","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","WR","C","WL","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","WR","C","WL","E","E","E","E"],
        ["E","E","E","E","E","E","E","WD","WD","WDR","C","WL","E","E","E","E"],
        ["E","E","E","E","E","E","WR","S","C","C","C","WL","E","E","E","E"],
        ["E","E","E","E","E","E","WR","C","E","WUL","WU","E","E","E","E","E"],
        ["E","E","E","E","E","E","WR","C","E","WDL","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","WR","C","C","C","WL","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","WU","WUR","C","WL","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","WR","C","WL","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","WD","WDR","C","WDL","WD","E","E","E","E"],
        ["E","E","E","E","E","E","WR","C","C","C","C","C","WL","E","E","E"],
        ["E","E","E","E","E","E","WR","C","E","C","WND","C","WL","E","E","E"],
        ["E","E","E","E","E","E","WR","C","E","C","WLR","C","WL","E","E","E"],
        ["E","E","E","E","E","E","WR","C","C","S","WLR","C","WL","E","E","E"],
        ["E","E","E","E","WD","WD","WD","WUD","WUD","WU","WR","C","WL","E","E","E"],
        ["E","E","E","WR","C","C","C","C","C","WL","WR","C","WL","E","E","E"],
        ["E","E","E","WR","C","WUL","WU","WUR","C","WDL","WDR","C","WL","E","E","E"],
        ["E","E","E","WR","C","WL","E","WR","C","C","C","C","WL","E","E","E"],
        ["E","E","E","WR","C","WL","E","E","WU","WU","WU","WU","E","E","E","E"],
        ["E","WD","WD","WDR","C","WDL","WD","WD","WD","E","E","E","WD","WD","WD","E"],
        ["WR","C","C","C","C","C","C","C","C","WDL","WD","WDR","S","C","C","WL"],
        ["WR","C","E","E","C","WUL","WU","WUR","C","C","C","C","C","E","C","WL"],
        ["WR","C","E","E","C","WL","E","E","WU","WU","WUD","WUD","WNL","E","C","WL"],
        ["WR","C","C","C","C","WL","E","E","E","WR","E","E","E","E","C","WL"],
        ["E","WU","WU","WU","WU","E","E","E","E","WR","E","E","E","E","C","WL"],
        ["E","E","E","E","E","E","E","E","E","WR","E","E","P","E","C","WL"],
        ["E","E","E","E","E","E","E","E","E","E","WU","WU","WU","WU","WU","E"]
    ];
    window.localStorage.setItem('map', JSON.stringify(map)); //deposita la mappa nello storage locale
    window.localStorage.setItem('stage-level',  "1");//cambi il numero del livello
    window.location.href = "game/game.html"; //reindirizza l'utente nel livello selezionato
}

function levelTwo(){
    map = [
        ["E","E","E","E","E","E","E","E","E","WD","WD","WD","WD","WD","WD","WD","WD","WD","WD","WD","WD","E"],
        ["E","E","E","E","E","E","E","E","WR","C","C","C","C","C","C","C","C","C","C","C","C","WL"],
        ["E","E","E","E","E","E","E","E","WR","E","E","E","E","E","E","E","E","E","E","E","C","WL"],
        ["E","E","E","E","E","E","E","E","WR","E","E","E","E","E","SUL","SU","SU","SU","SU","SUR","C","WL"],
        ["E","E","E","E","E","E","E","E","WR","E","E","P","E","E","WL","E","E","E","E","WR","C","WL"],
        ["E","E","E","E","E","E","E","E","E","WU","WU","WU","WU","WU","E","E","E","E","E","WDR","C","WL"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","WR","C","C","WL"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","SD","SD","SD","SDR","C","WUL","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","WR","E","E","E","E","C","WL","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","WR","S","C","C","C","C","WL","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","WR","C","WUL","WU","WU","WU","E","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","WDR","C","WL","E","E","E"],
        ["E","E","E","WD","WD","WD","WD","E","E","WD","WD","WD","E","WR","C","C","WL","E","E","E"],
        ["E","WD","WDR","C","C","C","C","WL","WR","C","C","C","WL","WR","C","WNR","WD","WD","WD","E","E"],
        ["WR","E","E","C","E","E","C","WDL","WDR","C","WND","C","WDL","WDR","C","C","C","C","C","WL","E"],
        ["WR","C","C","C","S","WND","C","C","C","C","WLR","C","C","C","C","C","WNR","WNL","C","WL","E"],
        ["WR","C","WUL","WU","WU","E","WU","WU","WU","WU","E","WU","WU","WU","WUR","C","E","E","C","WL","E"],
        ["WR","C","WL","E","E","E","E","E","E","E","E","E","E","E","SR","C","E","E","C","WL","E"],
        ["WR","C","WL","E","E","E","E","E","E","E","E","E","E","E","SR","C","C","C","S","WL","E"],
        ["WR","C","WL","E","E","E","E","E","E","E","E","E","E","E","E","WU","WU","WU","WU","E","E"],
        ["WR","END","WL","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","WU","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],

    ];
    window.localStorage.setItem('map', JSON.stringify(map));
    window.localStorage.setItem('stage-level', "2");//cambi il numero del livello
    window.location.href = "game/game.html";
}

function levelThree(){
    map = [
        ["E","E","WD","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","WR","END","WL","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","WR","C","WL","E","E","WD","WD","WD","WD","WD","E","E","E","E","E","E","E","E","E"],
        ["E","WR","C","WL","E","WR","C","C","C","C","C","WL","E","E","E","E","E","E","E","E"],
        ["E","WR","C","WDL","WD","WDR","C","WUL","WU","WUR","C","WL","E","E","E","E","E","E","E","E"],
        ["E","WR","C","E","E","E","C","WL","E","WR","C","WL","E","E","E","E","E","E","E","E"],
        ["E","WR","C","C","S","C","C","WL","E","WR","C","WDL","WD","E","E","E","E","E","E","E"],
        ["E","E","WU","WU","WU","WU","WU","E","E","WR","C","C","C","WL","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","E","WUR","E","C","WL","E","E","E","E","E","E"],
        ["E","E","E","WD","STD","STD","STD","WD","E","E","WR","E","C","WL","E","E","E","E","E","E"],
        ["E","E","WDR","C","C","C","C","C","WL","E","WDR","E","C","WL","E","E","E","E","E","E"],
        ["E","WR","C","C","WUL","WU","WUR","C","WDL","WDR","C","C","C","WL","E","E","E","E","E","E"],
        ["E","WR","C","WNR","W","E","WR","C","E","E","C","WUL","WU","E","E","E","E","E","E","E"],
        ["E","WR","C","C","WDL","WD","WR","C","C","C","C","WL","E","E","E","E","E","E","E","E"],
        ["E","WD","WNL","C","C","C","WL","WU","WU","WU","WU","E","E","E","E","E","E","E","E","E"],
        ["WR","S","C","C","C","C","WL","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["WR","C","E","E","E","E","WL","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["WR","C","E","E","E","E","WL","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["WR","C","E","TS","E","E","WL","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["WR","C","E","C","E","E","WL","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["WR","C","C","C","WUL","WUD","WD","WD","WD","E","E","E","E","WD","WD","WD","WD","WD","WD","E"],
        ["E","WU","WUR","C","WLR","C","C","C","C","WL","E","E","WR","C","C","C","C","C","C","WL"],
        ["E","E","WR","C","WNU","C","E","E","C","STDL","STD","STD","STDR","C","E","E","E","E","E","WL"],
        ["E","E","WR","C","C","C","S","WF","C","C","C","C","C","C","E","E","E","E","E","WL"],
        ["E","E","E","WU","WU","WUR","C","E","C","WUL","WU","WU","WU","WUR","E","E","P","E","E","WL"],
        ["E","E","E","E","E","WR","C","C","C","WL","E","E","E","E","WU","WU","WU","WU","WU","E"],
        ["E","E","E","E","E","E","WU","WU","WU","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E"],
    ];
    window.localStorage.setItem('map', JSON.stringify(map));
    window.localStorage.setItem('stage-level', "3");//cambi il numero del livello
    window.location.href = "game/game.html";
}

function levelFour(){
    map = [
        ["E","E","E","E","E","E","WD","E","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","WR","END","WL","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","WR","C","WL","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","WR","C","WL","E","E","E","E","E","E","E"],
        ["E","E","E","E","E","WR","C","WDL","WD","WD","WD","WD","WD","WD","E"],
        ["E","E","E","E","E","WR","C","C","C","C","C","C","C","C","WL"],
        ["E","E","E","E","E","E","WU","WU","WU","WU","WU","WU","WUR","C","WL"],
        ["E","E","E","E","E","E","E","E","E","WD","WD","WD","WDR","C","WL"],
        ["E","E","E","E","WD","WD","WD","WD","WDR","C","C","C","C","C","WL"],
        ["E","E","E","WR","C","C","C","C","C","C","WUL","WUR","C","C","WL"],
        ["E","E","E","SR","C","E","C","STUL","STU","STU","E","E","WU","WU","E"],
        ["E","E","E","SR","C","E","C","STDL","STD","STD","WD","E","E","E","E"],
        ["E","E","E","SR","C","WF","C","C","C","C","C","WDL","WD","WD","E"],
        ["E","E","E","SR","C","E","C","WUL","WU","WUR","C","C","C","C","WL"],
        ["E","E","E","SR","S","C","C","WL","E","WD","WUD","WUD","WUR","C","WL"],
        ["E","E","E","E","WU","WU","WU","E","WR","C","C","C","WNU","C","WL"],
        ["E","E","E","E","E","E","WD","WD","WDR","C","WND","C","E","C","WL"],
        ["E","E","E","E","E","WR","C","C","C","C","WLR","C","C","C","WL"],
        ["E","E","E","E","E","WR","C","E","WNR","WUD","WD","WUD","WU","WU","E"],
        ["E","E","E","E","E","WR","C","C","C","C","E","E","SL","E","E"],
        ["E","E","E","E","E","E","WU","WU","WUR","C","E","E","SL","E","E"],
        ["E","E","E","E","E","E","E","E","WR","C","E","E","SL","E","E"],
        ["E","E","E","E","E","E","WD","WD","WDR","C","E","E","SL","E","E"],
        ["E","E","E","E","E","WR","C","C","C","C","WF","E","SL","E","E"],
        ["E","E","E","E","E","WR","C","E","E","E","E","E","SL","E","E"],
        ["E","WD","WD","WD","WD","WR","C","WUL","WU","SU","SU","SU","E","E","E"],
        ["WR","C","C","C","C","WNU","C","WL","E","E","E","E","E","E","E"],
        ["WR","C","WUL","WUR","S","C","C","WL","E","E","E","WD","WD","WD","E"],
        ["WR","C","WL","WD","WUD","WUD","WU","WD","WD","WD","WDR","C","C","C","WL"],
        ["WR","C","WNU","C","C","C","WNU","C","C","C","C","C","WND","C","WL"],
        ["WR","C","C","C","WND","C","C","C","WUL","WNL","E","WNR","WR","C","WL"],
        ["E","WUD","WUD","WUD","WD","WUD","WUD","WU","WR","C","C","C","WNU","C","WL"],
        ["WR","C","C","C","C","C","C","WL","WR","C","TS","C","E","C","WL"],
        ["WR","C","WUL","WU","WU","WUR","C","WDL","WDR","C","E","C","TS","C","WL"],
        ["WR","C","WDL","E","E","WR","C","C","C","C","WND","S","C","C","WL"],
        ["WR","C","C","WL","E","E","WU","WU","WU","WU","E","WU","WU","WU","E"],
        ["E","WUR","C","WDL","WD","E","E","WD","WD","WD","WD","WD","E","E","E"],
        ["E","WR","C","C","C","WDL","WR","C","C","C","C","C","WL","E","E"],
        ["E","WR","E","E","C","E","WNU","C","E","E","E","C","WDL","WD","E"],
        ["E","E","WU","WUR","C","C","C","C","WUL","WU","WUR","C","C","C","WL"],
        ["E","WD","WD","WD","WUD","WUD","WUD","WUD","WD","W","W","WU","WUR","C","WL"],
        ["WR","C","C","C","C","C","C","C","C","WL","E","E","WR","C","WL","E","E"],
        ["WR","E","E","E","E","E","WUL","WUR","C","WDL","WD","WD","WDR","C","WL"],
        ["WR","E","E","E","E","E","WL","WR","C","E","E","E","E","C","WL"],
        ["WR","E","E","P","E","E","WL","WR","C","C","C","C","C","C","WL"],
        ["E","WU","WU","WU","WU","WU","E","E","WU","WU","WU","WU","WU","WU","E"],
    ];
    window.localStorage.setItem('map', JSON.stringify(map));
    window.localStorage.setItem('stage-level', "4");//cambi il numero del livello
    window.location.href = "game/game.html";
}
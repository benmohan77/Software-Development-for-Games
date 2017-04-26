var queue; // LoadQueue
var stage; // Stage
var g; //main graphics object
var stageXdimens;
var stageYdimens;
var ticksPerSec = 60;
var numbPlayers = 2;

// Buttons
var btnIncreasePlayers;
var btnDecreasePlayers;

// Labels
var lblBanner;
var lblNumPlayersText;
var lblNumPlayers;

function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, this);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest([
        { id: "p1TankPNG", src: "red_tank.png" },
        { id: "tankBarrel", src: "barrel.png" },
        { id: "p2TankPNG", src: "green_tank.png" },
        { id: "smokeSheet", src: "smoke.png" },
        { id: "p3TankPNG", src: "orange_tank.png" },
        { id: "p4TankPNG", src: "black_tank.png" },
        { id: "p5TankPNG", src: "blue_tank.png" },
        { id: "p6TankPNG", src: "white_tank.png" }
    ]);
}

function init() {
    g = new createjs.Graphics();

    stage = new createjs.Stage("canvas");

    stageXdimens = stage.canvas.width;
    stageYdimens = stage.canvas.height;

    // Create start button
    stage.enableMouseOver(30);
    var button = new Button("Start");
    button.addEventListener("click", function() {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", game_tick);
        stage.enableMouseOver(0);
        newGame(numbPlayers);
    });
    button.x = (stageXdimens / 2) - 50;
    button.y = (stageYdimens / 2) - 20;

    // Create button for decreasing players
    btnDecreasePlayers = new createjs.Shape();
    btnDecreasePlayers.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 180);
    btnDecreasePlayers.x = (stageXdimens / 2) - 50;
    btnDecreasePlayers.y = (stageYdimens / 2) - 65;
    btnDecreasePlayers.on("click", function() {
        if (numbPlayers > 2) {
            numbPlayers--;
            lblNumPlayers.text = numbPlayers;
        }
    });
    btnDecreasePlayers.on("mouseover", changeColor);
    btnDecreasePlayers.on("mouseout", changeColor);

    // Create button for increasing players
    btnIncreasePlayers = new createjs.Shape();
    btnIncreasePlayers.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 0);
    btnIncreasePlayers.x = (stageXdimens / 2) + 20;
    btnIncreasePlayers.y = (stageYdimens / 2) - 65;
    btnIncreasePlayers.on("click", function() {
        if (numbPlayers < 6) {
            numbPlayers++;
            lblNumPlayers.text = numbPlayers;
        }
    });
    btnIncreasePlayers.on("mouseover", changeColor);
    btnIncreasePlayers.on("mouseout", changeColor);

    // Create labels for number of players
    lblNumPlayersText = new createjs.Text("Players", "30px Arial", "#000");
    lblNumPlayersText.x = (stageXdimens / 2) - 50;
    lblNumPlayersText.y = (stageYdimens / 2) - 105;
    lblNumPlayers = new createjs.Text("2", "38px Arial", "#000");
    lblNumPlayers.x = (stageXdimens / 2) - 10;
    lblNumPlayers.y = (stageYdimens / 2) - 67;

    // Add items to the stage
    stage.addChild(button);
    stage.addChild(btnDecreasePlayers);
    stage.addChild(btnIncreasePlayers);
    stage.addChild(lblNumPlayersText);
    stage.addChild(lblNumPlayers);

    createjs.Ticker.setFPS(ticksPerSec);
    createjs.Ticker.addEventListener("tick", menu_tick);
}

function changeColor(event) {
    event.target.alpha = (event.type == "mouseover") ? 0.65 : 1;
}

function menu_tick() {
    stage.update();
}
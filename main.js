var queue; // LoadQueue
var stage; // Stage
var g; //main graphics object
var stageXdimens;
var stageYdimens;
var ticksPerSec = 60;

function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, this);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest([
        { id: "p1TankPNG", src: "red_tank.png" },
        { id: "tankBarrel", src: "barrel.png" },
        { id: "p2TankPNG", src: "green_tank.png" },
        //{ id: "p2TankBarrel", src: "green_tank_barrel.png" }, <-- never used
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

    stage.enableMouseOver(30);
    var button = new Button("Start");
    button.addEventListener("click", function() {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", game_tick);
        stage.enableMouseOver(0);
        newGame(6);
    });
    button.x = (stageXdimens / 2) - 50;
    button.y = (stageYdimens / 2) - 20;
    stage.addChild(button);
    createjs.Ticker.setFPS(ticksPerSec);
    createjs.Ticker.addEventListener("tick", menu_tick);
}

function menu_tick() {
    stage.update();
}
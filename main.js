var queue; // LoadQueue
var stage; // Stage
var g; //main graphics object

function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, this);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest([
        { id: "p1TankPNG", src: "red_tank.png" },
        { id: "p1TankBarrel", src: "red_tank_barrel.png" },
        { id: "p2TankPNG", src: "green_tank.png" },
        { id: "p2TankBarrel", src: "green_tank_barrel.png" },
        { id: "smokeSheet", src: "smoke.png" },
        { id: "p3TankPNG", src: "orange_tank.png" },
        { id: "p4TankPNG", src: "black_tank.png" },
        { id: "p5TankPNG", src: "blue_tank.png" },
        { id: "p6TankPNG", src: "white_tank.png" }

    ]);
}


function init() {
    stage = new createjs.Stage("canvas");
    stage.enableMouseOver(10);
    g = new createjs.Graphics();
    var button = new Button("Start");
    button.addEventListener("click", function() {
        newGame(6);
    })
    button.x = 200;
    button.y = 200;
    stage.addChild(button);
    createjs.Ticker.setFPS(ticksPerSec);
    createjs.Ticker.addEventListener("tick", tick);
}
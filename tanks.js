var queue; // LoadQueue
var stage; // Stage
var blocks; // Our landscape in a 2D array
var dirt;

//Constants
const maxMoves = 4;
var gunSound = "gunSound";

// Landscape Generation Vars
var stageXdimens;
var stageYdimens;
var stageXblocks;
var stageYblocks;
var landMin;
var landMax;
var landBlockSize;
var maxLandDev;

// Player Tank Vars
var p1Tank;
var p1TankBitmap;
var p1TankBarrel;
var p2Tank;
var p2TankBitmap;
var p2TankBarrel;

//Player Control Vars
var p1Rright;
var p1Rleft;
var p1RrightPressed;
var p1RleftPressed;
var pRight;
var pLeft;
var fire;
var p1MovesLeft = maxMoves;
var p2MovesLeft = maxMoves;

//Key variables
const ARROW_KEY_LEFT = 37;
const ARROW_KEY_UP = 38;
const ARROW_KEY_RIGHT = 39;
const ARROW_KEY_DOWN = 40;
var upKeyDown = false;
var downKeyDown = false;
var leftKeyDown = false;
var rightKeyDown = false;

var g;

//Player Turn
var p1turn;
var RED_TURN = "Red";
var GREEN_TURN = "Green"


//Data displays
var p1elev;
var nowPlayingLabel;
var movesLeft;

//Tank x Index On GRID
var p1XGrid = 5;
var p2XGrid = 30;

function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, this);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest([
        { id: "p1TankPNG", src: "red_tank.png" },
        { id: "p1TankBarrel", src: "red_tank_barrel.png" },
        { id: "p2TankPNG", src: "green_tank.png" },
        { id: "p2TankBarrel", src: "green_tank_barrel.png" },
    ]);
}

function init() {
    stage = new createjs.Stage("canvas");
    g = new createjs.Graphics();
    createjs.Sound.registerSound("gun.wav", gunSound);
    initButtons();
    landGeneration();
    addTanks();



    p1elev = new createjs.Text(p1TankBarrel.rotation, "10px Arial", "#000000");
    p1elev.x = 95;
    p1elev.y = 12;
    stage.addChild(p1elev);

    nowPlayingLabel = new createjs.Text("Player: " + RED_TURN, "20px Arial", "#000000");
    nowPlayingLabel.x = 500;
    nowPlayingLabel.y = 25;
    stage.addChild(nowPlayingLabel);



    // KEYBOARD
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;

    p1turn = false;

    stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
}



function tick(event) {
    if (p1turn) {
        rotateBarrel(p1TankBarrel);
    } else {
        rotateBarrel(p2TankBarrel);
    }
    playerLabel();
    if (!event.paused) {
        stage.update();
    }

}

function addTanks() {
    // Get our images
    p1TankPNG = new createjs.Bitmap(queue.getResult("p1TankPNG"));
    p1TankBarrel = new createjs.Bitmap(queue.getResult("p1TankBarrel"));
    p2TankPNG = new createjs.Bitmap(queue.getResult("p2TankPNG"));
    p2TankBarrel = new createjs.Bitmap(queue.getResult("p2TankBarrel"));

    p1TankBarrel.regX = 0;
    p1TankBarrel.regY = 2.5;

    p2TankBarrel.regX = 0;
    p2TankBarrel.regY = 2.5;

    p1TankBarrel.x = 10;
    p1TankBarrel.y = 10;

    p2TankBarrel.y = 10;
    p2TankBarrel.x = 10;



    p1Tank = new createjs.Container();
    p1Tank.addChild(p1TankBarrel);

    p1Tank.addChild(p1TankPNG);

    p2Tank = new createjs.Container();
    p2Tank.addChild(p2TankBarrel);

    p2Tank.addChild(p2TankPNG);

    // Find the starting positions for the tanks
    var p1pos = (blocks[p1XGrid].length); // 0;
    var p2pos = (blocks[p2XGrid].length); // 0;
    p1Tank.x = landBlockSize * 5
    p1Tank.y = stageYdimens - (landBlockSize * p1pos);



    p2Tank.x = (30) * landBlockSize;
    p2Tank.y = stageYdimens - (landBlockSize * p2pos);

    stage.addChild(p1Tank);
    stage.addChild(p2Tank);
}

function playerLabel() {
    if (p1turn) {
        nowPlayingLabel.text = "Player: " + RED_TURN;
        p1elev.text = -(p1TankBarrel.rotation);
        movesLeft.text = p1MovesLeft;
    } else {
        nowPlayingLabel.text = "Player: " + GREEN_TURN;
        p1elev.text = -(p2TankBarrel.rotation);
        movesLeft.text = p2MovesLeft;
    }
}

//initializes the buttons for controlling the tanks
function initButtons() {

    //Control Button Initialization
    //Right Rotation button
    p1Rright = new createjs.Shape();
    p1Rright.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 0);


    p1Rright.on("mousedown", function() {
        p1RrightPressed = true;
    })

    p1Rright.on("pressup", function() {
        p1RrightPressed = false;
    });

    //Left rotation button
    p1Rleft = new createjs.Shape();
    p1Rleft.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 180);


    p1Rleft.on("mousedown", function() {
        p1RleftPressed = true;
    });
    p1Rleft.on("pressup", function() {
        p1RleftPressed = false;
    });

    //Fire button
    fire = new createjs.Shape();
    fire.graphics.beginStroke("#000000").beginFill("#ff0000").drawRect(0, 0, 100, 35);
    fire.x = 260;
    fire.y = 25;
    var text = new createjs.Text("FIRE", "20px Arial", "#000000");
    text.x = 285;
    text.y = 32;

    //Moves Left label
    movesLeft = new createjs.Text("", "10px Arial", "#000000");
    movesLeft.x = 205;
    movesLeft.y = 12;

    fire.addEventListener("click", shoot);
    stage.addChild(fire);

    //Right move button
    pRight = new createjs.Shape();
    pRight.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 0);
    pRight.addEventListener("click", moveTankRight);

    //Left move button
    pLeft = new createjs.Shape();
    pLeft.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 180);
    pLeft.addEventListener("click", moveTankLeft);

    //Misc Labels
    var moves = new createjs.Text("Moves Left:", "10px Arial", "#000000");
    moves.x = 145;
    moves.y = 12;

    var angle = new createjs.Text("Firing Angle:", "10px Arial", "#000000");
    angle.x = 35;
    angle.y = 12;

    p1Rright.x = 60;
    p1Rright.y = p1Rleft.y = pRight.y = pLeft.y = 25;
    p1Rleft.x = 40;
    pRight.x = 170;
    pLeft.x = 150;

    stage.addChild(p1Rright, p1Rleft, p1elev, pRight, pLeft, text, movesLeft, moves, angle);
}

function landGeneration() {
    stageXdimens = stage.canvas.width;
    stageYdimens = stage.canvas.height;
    landBlockSize = 20;
    maxLandDev = 1; // The max amount the land can deviate per step either way when generating
    landMin = (stageYdimens / landBlockSize) * 0.20; // Land must be at least 20% above bottom
    landMax = (stageYdimens / landBlockSize) * 0.60; // Land must not exceed 60% above bottom
    stage.update(); // why is this here?

    // Create the graphics block used to make landscape blocks
    g.beginStroke("#8B4513").beginFill("#D2691E");
    g.drawRect(0, 0, landBlockSize, landBlockSize);

    // Get the starting position for the landscape
    var m = getRandomInt(landMin, landMax);

    blocks = get2DArray(stageXdimens / landBlockSize);

    // Add random blocks as terrain
    for (i = 0; i < stageXdimens / landBlockSize; i++) {
        m = getRandomInt(m - maxLandDev, m + maxLandDev + 1);
        if (m < landMin) {
            m = landMin;
        }
        if (m > landMax) {
            m = landMax;
        }
        for (j = 0; j < m; j++) {
            blocks[i][j] = new createjs.Shape(g);
        }
    }

    // Place blocks on the correct screen positions
    for (i = 0; i < blocks.length; i++) {
        for (j = 0; j < blocks[i].length; j++) {
            blocks[i][j].x = landBlockSize * i;
            blocks[i][j].y = y_bot(landBlockSize * j);
            stage.addChild(blocks[i][j]);
        }
    }

    stageXblocks = blocks.length;
    stageYblocks = blocks[0].length;
}

function y_bot(y) {
    return (stageYdimens - y);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function get2DArray(size) {
    size = size > 0 ? size : 0;
    var arr = [];

    while (size--) {
        arr.push([]);
    }

    return arr;
}

function shoot() {
    if (p1turn) {
        p1turn = false;
        p1MovesLeft = maxMoves;
    } else {
        p1turn = true;
        p2MovesLeft = maxMoves;
    }
    createjs.Sound.play(gunSound); // play using id.  Could also use full source path or event.src.
}

function handleKeyDown(e) {
    switch (e.keyCode) {
        case ARROW_KEY_UP:
            upKeyDown = true;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = true;
            break;
        case ARROW_KEY_LEFT:
            leftKeyDown = true;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = true;
            break;
    }
}

function handleKeyUp(e) {
    switch (e.keyCode) {
        case ARROW_KEY_UP:
            upKeyDown = false;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = false;
            break;
        case ARROW_KEY_LEFT:
            leftKeyDown = false;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = false;
            break;
    }
}

function rotateBarrel(shape) {
    if ((p1RleftPressed || leftKeyDown) && (shape.rotation > -180)) {
        shape.rotation = shape.rotation - 1;
    }
    if ((p1RrightPressed || rightKeyDown) && (shape.rotation < 0)) {
        shape.rotation = shape.rotation + 1;
    }
}

function moveTankLeft() {
    if (p1turn && (p1MovesLeft > 0)) {
        if (p1Tank.x > 0) {
            p1XGrid--;
            var pos = (blocks[p1XGrid].length);
            p1Tank.x = landBlockSize * p1XGrid;
            p1Tank.y = stageYdimens - (landBlockSize * pos);
            p1MovesLeft--;
        }
    } else if (!p1turn && (p2MovesLeft > 0)) {
        if (p2Tank.x > 0) {
            p2XGrid--;
            var pos = (blocks[p2XGrid].length);
            p2Tank.x = landBlockSize * p2XGrid;
            p2Tank.y = stageYdimens - (landBlockSize * pos);
            p2MovesLeft--;
        }
    }
}

function moveTankRight() {
    if (p1turn && (p1MovesLeft > 0)) {
        if (p1Tank.x < stageXdimens) {
            p1XGrid++;
            var pos = (blocks[p1XGrid].length);
            p1Tank.x = landBlockSize * p1XGrid;
            p1Tank.y = stageYdimens - (landBlockSize * pos);
            p1MovesLeft--;
        }
    } else if (!p1turn && (p2MovesLeft > 0)) {
        if (p2Tank.x < stageXdimens) {
            p2XGrid++;
            var pos = (blocks[p2XGrid].length);
            p2Tank.x = landBlockSize * p2XGrid;
            p2Tank.y = stageYdimens - (landBlockSize * pos);
            p2MovesLeft--;
        }
    }
}
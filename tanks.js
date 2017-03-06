var queue; // LoadQueue
var stage; // Stage
var blocks; // Our landscape in a 2D array
var ticksPerSec = 60;
var updateDelay = 2; //ticksPerSec / 30;
var currentUpdateCount = 0;

//Constants
const maxMoves = 4;
var gunSound = "gunSound";
var boomSound = "boomSound";
var ripSound = "ripSound";
var smokeSheetIMG = "smokeSheet";
var smokeSheet;
var animation;


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

// Active Missile Vars
var activeMissiles = [];
var waitingForMissiles = false;

//Player Control Vars
var p1Rright;
var p1Rleft;
var p1RrightPressed;
var p1RleftPressed;
var pPowerUpPressed;
var pPowerDownPressed;
var pPowerUp;
var pPowerDown;
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
const SPACE_KEY = 32;
var upKeyDown = false;
var downKeyDown = false;
var leftKeyDown = false;
var rightKeyDown = false;
var spaceKeyDown = false;

var g;

//Player Turn
var p1turn;
var RED_TURN = "Red";
var GREEN_TURN = "Green"
var p1Power = 50;
var p2Power = 50;


//Data displays
var p1elev;
var nowPlayingLabel;
var healthLabel;
var movesLeft;
var powerLevel;

//Tank x Index On GRID
var p1XGrid;
var p2XGrid;




function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init, this);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest([
        { id: "p1TankPNG", src: "red_tank.png" },
        { id: "p1TankBarrel", src: "red_tank_barrel.png" },
        { id: "p2TankPNG", src: "green_tank.png" },
        { id: "p2TankBarrel", src: "green_tank_barrel.png" },
        { id: "smokeSheet", src: "smoke.png"},
    ]);
}

function init() {
    stage = new createjs.Stage("canvas");
    g = new createjs.Graphics();
    createjs.Sound.registerSound("gun.wav", gunSound);
    initButtons();
    landGeneration();
    addTanks();

    smokeSheetIMG = queue.getResult("smokeSheet");

    var data = {
        images: ["smoke.png"],
        frames: { width: 64, height: 64, regX: 32, regY: 32, count: 16 },
        animations: {
            start: {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                next: false
            },
        },
        framerate: 20
    };

    smokeSheet = new createjs.SpriteSheet(data);
    animation = new createjs.Sprite(smokeSheet, "start");

    createjs.Sound.registerSound("boom.wav", boomSound);
    createjs.Sound.registerSound("rip.wav", ripSound);


    p1elev = new createjs.Text(p1TankBarrel.rotation, "10px Arial", "#000000");
    p1elev.x = 95;
    p1elev.y = 12;
    stage.addChild(p1elev);

    nowPlayingLabel = new createjs.Text("Player: " + RED_TURN, "20px Arial", "#000000");
    nowPlayingLabel.x = 500;
    nowPlayingLabel.y = 10;

    healthLabel = new createjs.Text("Health: " + p1Tank.health + "/100", "15px Arial", "#000000");
    healthLabel.x = 500;
    healthLabel.y = 35;
    stage.addChild(nowPlayingLabel, healthLabel);



    // KEYBOARD
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;

    p1turn = true;

    stage.update();
    createjs.Ticker.setFPS(ticksPerSec);
    createjs.Ticker.addEventListener("tick", tick);
}


function tick(event) {
    // Check if either tank is dead
    if (p1Tank.health <= 0 || p2Tank.health <= 0) {
        createjs.Ticker.removeAllEventListeners();
        var gameover = new createjs.Text("Game Over", "30px Arial", "#000000");
        gameover.x = 225;
        gameover.y = 225;
        stage.addChild(gameover);
        if (p1Tank.health <= 0) {
            p1Tank.removeAllChildren();
        } else {
            p2Tank.removeAllChildren();
        }
        stage.update();
        createjs.Sound.play(ripSound);
        createjs.Sound.mute = true;
    }
    if (animation.currentFrame > 14) {
        stage.removeChild(animation);
    }

    // Rotate barrels
    if (p1turn) {
        rotateBarrel(p1TankBarrel);
    } else {
        rotateBarrel(p2TankBarrel);
    }

    // Update player labels
    playerLabel();

    // Update the power selections
    changePower();

    currentUpdateCount++;

    if (currentUpdateCount === updateDelay) {
        // Shoot if space bar is pressed
        if (spaceKeyDown && !waitingForMissiles)
            shoot();

        if (activeMissiles.length > 0) {
            //console.log("Number of missiles: " + activeMissiles.length);
            var elemsToRemove = [];
            for (i = activeMissiles.length - 1; i >= 0; i--) {
                // Do not interact with missile if it no longer exists on stage or has exploded
                if (activeMissiles[i].checkOutOfBounds() || activeMissiles[i].hasExploded()) {
                    //console.log("HERE");
                    elemsToRemove.push(i);
                } else {
                    activeMissiles[i].moveToNextPos();
                }
            }
            //console.log("Missiles to remove: " + elemsToRemove.length);

            // Remove the missiles from the stage and activeMissiles only when all are ready to be removed
            if (elemsToRemove.length === activeMissiles.length) {
                //console.log("Removing all missiles...");
                //for (var i in activeMissiles)
                //    stage.removeChild(activeMissiles[i]);
                activeMissiles = [];
                //console.log("Number of active missiles: " + activeMissiles.length);
            }

            waitingForMissiles = (activeMissiles.length > 0);
            console.log("Waiting for missiles: " + ((waitingForMissiles) ? "True" : "False"));
        }

        currentUpdateCount = 0;
    }
    stage.update();
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function createMissile(explosionRadius, startingAngle, velocity, damageAmount, startingX, startingY) {
    var graph = new createjs.Graphics();
    graph.beginStroke("#CCC").beginFill("#333");
    graph.drawCircle(0, 0, 3);
    var tempMissile = new createjs.Shape(graph);
    tempMissile.radius = 3.0;
    tempMissile.x = startingX;
    tempMissile.y = startingY;
    tempMissile.startingX = startingX;
    tempMissile.startingY = startingY;
    //console.log(startingY);

    tempMissile.time = 0;
    tempMissile.hasImpacted = false;
    tempMissile.isExploding = false;

    tempMissile.explosionRadius = explosionRadius;
    tempMissile.startingAngle = startingAngle;
    tempMissile.velocityX = velocity * Math.cos(toRadians(startingAngle));
    tempMissile.velocityY = -velocity * Math.sin(toRadians(startingAngle));
    tempMissile.damageAmount = damageAmount;

    tempMissile.moveToNextPos = function () {
        // Check if missile has impacted with anything
        var xBlockPos = Math.floor(this.x / landBlockSize);
        //console.log("-----------------------------------------------------------------------------------------");
        //console.log("this.y: " + this.y);
        //console.log("xBlockPos: " + xBlockPos);
        //console.log("blocks[xBlockPos].length: " + blocks[xBlockPos].length);
        //console.log("blocks[xBlockPos].length * landBlockSize: " + (blocks[xBlockPos].length * landBlockSize));
        //console.log("stageYdimens - (blocks[xBlockPos].length * landBlockSize): " + (landBlockSize + stageYdimens - (blocks[xBlockPos].length * landBlockSize)));
        if (!this.isExploding && xBlockPos > 0 && xBlockPos < blocks.length && this.y >= (landBlockSize + stageYdimens - (blocks[xBlockPos].length * landBlockSize))) {
            // The missile has now impacted
            //this.hasImpacted = true;
            console.log("has impacted");

            this.isExploding = true;
            createjs.Sound.play(boomSound);

            createjs.Tween.get(this).to({ scaleX: this.explosionRadius / this.radius, scaleY: this.explosionRadius / this.radius, alpha: 0 }, 750, createjs.Ease.quintOut()).call(function () {
                console.log("Hello.");
                stage.removeChild(this);

                // Remove health from tanks if they're close enough
                p1dist = Math.sqrt(Math.pow(this.x - (p1Tank.x + (landBlockSize / 2)), 2) + Math.pow(this.y - (p1Tank.y + (landBlockSize / 2)), 2));
                if (p1dist <= this.explosionRadius) {
                    p1Tank.health -= parseInt((1 - (p1dist / this.explosionRadius)) * this.damageAmount);
                }
                p2dist = Math.sqrt(Math.pow(this.x - (p2Tank.x + (landBlockSize / 2)), 2) + Math.pow(this.y - (p2Tank.y + (landBlockSize / 2)), 2));
                if (p2dist <= this.explosionRadius) {
                    p2Tank.health -= parseInt((1 - (p2dist / this.explosionRadius)) * this.damageAmount);
                }
                console.log("p1 health: " + p1Tank.health);
                console.log("p2 health: " + p2Tank.health);

                this.hasImpacted = true;
            });
        }

        if (!this.hasImpacted && !this.isExploding) {
            this.time += 1;
            createjs.Tween.get(this).to({
                x: this.x + this.velocityX,
                y: veloc(this.time, this.velocityY, this.startingY)
            }, (updateDelay / ticksPerSec) * 1000);
            // this.x += this.velocityX;
            // this.y = veloc(this.time, this.velocityY, this.startingY);
            //console.log("Y Pos: " + this.y);
        }
    }

    tempMissile.checkOutOfBounds = function () {
        //console.log(this.startingAngle + ": " + parseInt(this.x + this.radius));
        if (parseInt(this.x + this.radius) < 0)
            return true;
        //console.log(this.startingAngle + ": " + parseInt(this.x - this.radius));
        if (parseInt(this.x - this.radius) > stageXdimens)
            return true;
        //console.log(this.startingAngle + ": " + parseInt(this.y + this.radius));
        // We don't need to check top height. What goes up must come down.
        //if (parseInt(this.y + this.radius) < 0)
        //    return true;
        //console.log(this.startingAngle + ": " + parseInt(this.y - this.radius));
        if (parseInt(this.y - this.radius) > stageYdimens)
            return true;
        return false;
    }

    tempMissile.hasExploded = function () {
        return this.hasImpacted;
    }

    return tempMissile;
}

function veloc(time, Vo, X) {
    // -(1/2)at^2 + Vot + x
    var a = 0.2;
    var result = ((1 / 2) * a * (time * time)) + (Vo * time) + X;
    //console.log("Equat: -1/2 * " + a + " * " + time + "^2 + " + Vo + " * " + time + " + " + X);
    //console.log("Resul: " + result);
    return result;
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
    p2TankBarrel.rotation = -180;



    p1Tank = new createjs.Container();
    p1Tank.addChild(p1TankBarrel);
    p1Tank.addChild(p1TankPNG);
    p1Tank.health = 100;

    p2Tank = new createjs.Container();
    p2Tank.addChild(p2TankBarrel);
    p2Tank.addChild(p2TankPNG);
    p2Tank.health = 100;

    // Find the starting positions for the tanks
    p1XGrid = 4;
    p2XGrid = stageXblocks - 5;
    var p1pos = (blocks[p1XGrid].length); // 0;
    var p2pos = (blocks[p2XGrid].length); // 0;

    // Set the starting positions for the tanks
    p1Tank.x = landBlockSize * p1XGrid;
    p1Tank.y = stageYdimens - (landBlockSize * p1pos);
    p2Tank.x = p2XGrid * landBlockSize;
    p2Tank.y = stageYdimens - (landBlockSize * p2pos);

    stage.addChild(p1Tank);
    stage.addChild(p2Tank);
}

function playerLabel() {
    if (p1turn) {
        nowPlayingLabel.text = "Player: " + RED_TURN;
        healthLabel.text = "Health: " + p1Tank.health + "/100";
        p1elev.text = -(p1TankBarrel.rotation);
        movesLeft.text = p1MovesLeft;
        powerLevel.text = p1Power;
    } else {
        nowPlayingLabel.text = "Player: " + GREEN_TURN;
        healthLabel.text = "Health: " + p2Tank.health + "/100";
        p1elev.text = -(p2TankBarrel.rotation);
        movesLeft.text = p2MovesLeft;
        powerLevel.text = p2Power;
    }
}

//initializes the buttons for controlling the tanks
function initButtons() {

    //Control Button Initialization
    //Right Rotation button
    p1Rright = new createjs.Shape();
    p1Rright.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 0);


    p1Rright.on("mousedown", function () {
        p1RrightPressed = true;
    })

    p1Rright.on("pressup", function () {
        p1RrightPressed = false;
    });

    //Left rotation button
    p1Rleft = new createjs.Shape();
    p1Rleft.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 180);


    p1Rleft.on("mousedown", function () {
        p1RleftPressed = true;
    });
    p1Rleft.on("pressup", function () {
        p1RleftPressed = false;
    });

    //Fire button
    fire = new createjs.Shape();
    fire.graphics.beginStroke("#000000").beginFill("#ff0000").drawRect(0, 0, 100, 35);
    fire.x = 340;
    fire.y = 25;
    var text = new createjs.Text("FIRE", "22px Arial", "#000000");
    text.x = 365;
    text.y = 33;

    //Moves Left label
    movesLeft = new createjs.Text("", "10px Arial", "#000000");
    movesLeft.x = 202;
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

    //Power down button;
    pPowerDown = new createjs.Shape();
    pPowerDown.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 180);
    pPowerDown.on("mousedown", function () {
        pPowerDownPressed = true;
    });
    pPowerDown.on("pressup", function () {
        pPowerDownPressed = false;
    });

    //Power Up Button
    pPowerUp = new createjs.Shape();
    pPowerUp.graphics.beginStroke("#000000").beginFill("#000000").drawPolyStar(15, 15, 15, 3, .5, 0);
    pPowerUp.on("mousedown", function () {
        pPowerUpPressed = true;
    });
    pPowerUp.on("pressup", function () {
        pPowerUpPressed = false;
    });
    pPowerUp.x = 270;
    pPowerUp.y = 25;
    pPowerDown.x = 250;
    pPowerDown.y = 25;

    //Power Labels
    powerLevel = new createjs.Text("", "10px Arial", "#000000");
    powerLevel.x = 285;
    powerLevel.y = 12;

    //Misc Labels
    var moves = new createjs.Text("Moves Left:", "10px Arial", "#000000");
    moves.x = 143;
    moves.y = 12;

    var angle = new createjs.Text("Firing Angle:", "10px Arial", "#000000");
    angle.x = 30;
    angle.y = 12;

    var power = new createjs.Text("Power:", "10px Arial", "#000000");
    power.x = 250;
    power.y = 12;

    p1Rright.x = 60;
    p1Rright.y = p1Rleft.y = pRight.y = pLeft.y = 25;
    p1Rleft.x = 40;
    pRight.x = 170;
    pLeft.x = 150;

    stage.addChild(p1Rright, p1Rleft, p1elev, pRight, pLeft, text, movesLeft, moves, angle, pPowerDown, pPowerUp, power, powerLevel);
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
    if (!waitingForMissiles) {
        if (p1turn) {
            activeMissiles.push(createMissile(40, -p1TankBarrel.rotation, p1Power / 7, 50, p1Tank.x + (landBlockSize / 2), p1Tank.y + (landBlockSize / 2)));
            p1turn = false;
            p1MovesLeft = maxMoves;
        } else {
            activeMissiles.push(createMissile(40, -p2TankBarrel.rotation, p2Power / 7, 50, p2Tank.x + (landBlockSize / 2), p2Tank.y + (landBlockSize / 2)));
            p1turn = true;
            p2MovesLeft = maxMoves;
        }
        for (var i in activeMissiles) {
            stage.addChild(activeMissiles[i]);
        }
        createjs.Sound.play(gunSound); // play using id.  Could also use full source path or event.src.
    }
}

function handleKeyDown(e) {
    switch (e.keyCode) {
        case ARROW_KEY_UP:
            upKeyDown = true;
            console.log("up arrow up");
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
        case SPACE_KEY:
            spaceKeyDown = true;
            break;
        default:
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
        case SPACE_KEY:
            spaceKeyDown = false;
            break;
        default:
            break;
    }
}

function rotateBarrel(shape) {
    if (!waitingForMissiles) {
        if ((p1RleftPressed || leftKeyDown) && (shape.rotation > -180)) {
            shape.rotation = shape.rotation - 1;
        }
        if ((p1RrightPressed || rightKeyDown) && (shape.rotation < 0)) {
            shape.rotation = shape.rotation + 1;
        }
    }
}

function moveTankLeft() {
    if (!waitingForMissiles) {
        if (p1turn && (p1MovesLeft > 0)) {
            animation.x = p1Tank.x;
            animation.y = p1Tank.y;
            animation.scaleX = .5;
            animation.scaleY = .5;
            animation.gotoAndPlay("start");
            stage.addChild(animation);

            if (p1Tank.x > 0) {

                p1XGrid--;
                var pos = (blocks[p1XGrid].length);
                p1Tank.x = landBlockSize * p1XGrid;
                p1Tank.y = stageYdimens - (landBlockSize * pos);
                p1MovesLeft--;
            }
        } else if (!p1turn && (p2MovesLeft > 0)) {
            animation.x = p2Tank.x;
            animation.y = p2Tank.y;
            animation.scaleX = .5;
            animation.scaleY = .5;
            animation.gotoAndPlay("start");
            stage.addChild(animation);
            if (p2Tank.x > 0) {
                p2XGrid--;
                var pos = (blocks[p2XGrid].length);
                p2Tank.x = landBlockSize * p2XGrid;
                p2Tank.y = stageYdimens - (landBlockSize * pos);
                p2MovesLeft--;
            }
        }
    }
}

function moveTankRight() {
    if (!waitingForMissiles) {
        if (p1turn && (p1MovesLeft > 0)) {
            animation.x = p1Tank.x;
            animation.y = p1Tank.y;
            animation.scaleX = .5;
            animation.scaleY = .5;
            animation.gotoAndPlay("start");
            stage.addChild(animation);
            if (p1Tank.x < stageXdimens) {
                p1XGrid++;
                var pos = (blocks[p1XGrid].length);
                p1Tank.x = landBlockSize * p1XGrid;
                p1Tank.y = stageYdimens - (landBlockSize * pos);
                p1MovesLeft--;
            }
        } else if (!p1turn && (p2MovesLeft > 0)) {
            animation.x = p2Tank.x;
            animation.y = p2Tank.y;
            animation.scaleX = .5;
            animation.scaleY = .5;
            animation.gotoAndPlay("start");
            stage.addChild(animation);
            if (p2Tank.x < stageXdimens) {                
                p2XGrid++;
                var pos = (blocks[p2XGrid].length);
                p2Tank.x = landBlockSize * p2XGrid;
                p2Tank.y = stageYdimens - (landBlockSize * pos);
                p2MovesLeft--;
            }
        }
    }
}

function changePower() {
    if (!waitingForMissiles) {
        if (p1turn) {
            if ((pPowerUpPressed || upKeyDown) && p1Power < 100) {
                p1Power++;
            }
            if ((pPowerDownPressed || downKeyDown) && p1Power > 20) {
                p1Power--;
            }
        } else {
            if ((pPowerUpPressed || upKeyDown) && p2Power < 100) {
                p2Power++;
            }
            if ((pPowerDownPressed || downKeyDown) && p2Power > 20) {
                p2Power--;
            }
        }
    }
}
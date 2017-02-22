var queue; // LoadQueue
var stage; // Stage
var blocks;
var dirt;
var pB; // pause button
var stageXdimens = 640;
var stageYdimens = 480;

function load() {
    queue = new createjs.LoadQueue(false);
    queue.on("complete", init(), this);
    pB = document.getElementById("pauseBtn");
}

function init() {
    stage = new createjs.Stage("canvas");
    stage.update();

    var g = new createjs.Graphics();
    g.beginStroke("#8B4513").beginFill("#D2691E");
    g.drawRect(0, 0, 20, 20);
    var m = 7;

    blocks = get2DArray(stageXdimens / 20);
    for (i = 0; i < stageXdimens / 20; i++) {
        m = getRandomInt(m - 1, m + 2);
        if (m < 5) {
            m = 5;
        }
        for (j = 0; j < m; j++) {
            blocks[i][j] = new createjs.Shape(g);
        }
    }
    for (i = 0; i < blocks.length; i++) {
        for (j = 0; j < blocks[i].length; j++) {
            blocks[i][j].x = 20 * i;
            blocks[i][j].y = y_bot(20 * j);
            stage.addChild(blocks[i][j]);
        }
    }
    stage.update();


    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
}

function tick(event) { if (!event.paused) { stage.update(); } }

function y_bot(y) {
    return (460 - y);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function pause() {
    if (createjs.Ticker.getPaused()) {
        createjs.Ticker.setPaused(false);
        pB.textContent = "running";
    } else {
        createjs.Ticker.setPaused(true);
        pB.textContent = "paused";
    }
}

function drawGround(graphics) {
    var g = graphics;
    for (i = 0; i < (stageXdimens / 20); i++) {
        for (j = 0; j < (stageYdimens / 20) - 200; j++) {
            blocks
        }
    }
}

function buildGround(graphics) {
    var g = graphics;
    var arr = get2DArray(stageXdimens / 20);
    for (i = 0; i < (stageXdimens / 20); i++) {
        for (j = 0; j < (stageYdimens / 20) - 200; j++) {
            arr[i][j] = new createjs.Shape(g);
        }
    }

    return arr;
}

function get2DArray(size) {
    size = size > 0 ? size : 0;
    var arr = [];

    while (size--) {
        arr.push([]);
    }

    return arr;
}
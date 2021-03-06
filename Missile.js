window.MISSILES = [
    { id: "normal", name: "Single Shot", count: 20, cost: 5, radius: 40, damage: 60 },
    { id: "big", name: "Big Shot", count: 1, cost: 75, radius: 100, damage: 90 },
    { id: "sniper", name: "Sniper", count: 3, cost: 35, radius: 25, damage: 100 },
    { id: "triple", name: "Triple Shot", count: 1, cost: 50, radius: 40, damage: 50 },
    { id: "tracer", name: "Tracer", count: 2, cost: 5, radius: 0, damage: 0 }
];

(function() {

    var Missile = function(missileType, startingAngle, velocity, startingX, startingY) {
        var graph = new createjs.Graphics();
        graph.beginStroke("#CCC").beginFill("#333");
        graph.drawCircle(0, 0, 3);
        var tempMissile = new createjs.Shape(graph);
        tempMissile.radius = 3.0;
        tempMissile.x = startingX;
        tempMissile.y = startingY;
        tempMissile.startingX = startingX;
        tempMissile.startingY = startingY;

        tempMissile.time = 0;
        tempMissile.hasImpacted = false;
        tempMissile.isExploding = false;
        tempMissile.collidedWithTank = false;

        tempMissile.startingAngle = startingAngle;

        tempMissile.explosionRadius = missileType.radius;
        tempMissile.damageAmount = missileType.damage;

        tempMissile.velocityX = velocity * Math.cos(toRadians(startingAngle));
        tempMissile.velocityY = -velocity * Math.sin(toRadians(startingAngle));

        tempMissile.moveToNextPos = function() {
            // Check if missile has impacted with anything
            var xBlockPos = Math.floor(this.x / landBlockSize);
            //console.log("-----------------------------------------------------------------------------------------");
            //console.log("this.y: " + this.y);
            //console.log("xBlockPos: " + xBlockPos);
            //console.log("blocks[xBlockPos].length: " + blocks[xBlockPos].length);
            //console.log("blocks[xBlockPos].length * landBlockSize: " + (blocks[xBlockPos].length * landBlockSize));
            //console.log("stageYdimens - (blocks[xBlockPos].length * landBlockSize): " + (landBlockSize + stageYdimens - (blocks[xBlockPos].length * landBlockSize)));
            for (i = 0; i < playerTanks.length; i++) {
                var p = playerTanks[i].globalToLocal(this.x, this.y);
                if (
                    (this.time > 7) &&
                    playerTanks[i].hitTest(p.x, p.y)
                ) {
                    this.collidedWithTank = true;
                }
            };
            if ((!this.isExploding && xBlockPos >= 0 && xBlockPos < blocks.length && this.y >= (landBlockSize + stageYdimens - (blocks[xBlockPos].length * landBlockSize))) || (!this.isExploding && this.collidedWithTank)) {
                // The missile has now impacted
                //this.hasImpacted = true;
                console.log("has impacted");

                this.isExploding = true;
                createjs.Sound.play(boomSound);

                createjs.Tween.get(this).to({ scaleX: this.explosionRadius / this.radius, scaleY: this.explosionRadius / this.radius, alpha: 0 }, 750, createjs.Ease.quintOut()).call(function() {
                    console.log("Hello.");
                    stage.removeChild(this);

                    // Remove health from tanks if they're close enough
                    for (var i in playerTanks) {
                        tankDistance = Math.sqrt(Math.pow(this.x - (playerTanks[i].x + (landBlockSize / 2)), 2) + Math.pow(this.y - (playerTanks[i].y + (landBlockSize / 2)), 2));
                        if (tankDistance <= this.explosionRadius) {
                            var damage = parseInt((1 - (tankDistance / this.explosionRadius)) * this.damageAmount);
                            currentTank.addMoney(damage);
                            playerTanks[i].damageTank(parseInt((1 - (tankDistance / this.explosionRadius)) * this.damageAmount));
                        }
                    }

                    // Attempt block destruction
                    var blocksToDelete = [];
                    for (var x in blocks) {
                        for (var y in blocks[x]) {
                            //console.log("hi: " + x + ", " + y);
                            var blockDist = Math.sqrt(Math.pow(blocks[x][y].x + (landBlockSize / 2) - this.x, 2) + Math.pow(blocks[x][y].y + (landBlockSize / 2) - this.y, 2));
                            if (blockDist <= this.explosionRadius * 0.75) {
                                // Remove all blocks from here up
                                for (var i = y; i < blocks[x].length; i++) {
                                    blocks[x][i].initialX = x;
                                    blocks[x][i].initialY = i;
                                    blocksToDelete.push(blocks[x][i]);
                                    //console.log("marking: " + x + ", " + i);
                                }
                                break;
                            }
                        }
                    }
                    // Actually delete blocks
                    var currentX = -1;
                    var yOffset = 0;
                    for (var x in blocksToDelete) {
                        var block = blocksToDelete[x];
                        if (block.initialX !== currentX) {
                            currentX = block.initialX;
                            yOffset = 0;
                        }
                        stage.removeChild(block);
                        blocks[block.initialX].splice(block.initialY - yOffset, 1);
                        //console.log("deleting: " + block.initialX + ", " + block.initialY);
                        yOffset++;
                    }
                    blocksToDelete = null;
                    // Move tanks to correct heights
                    positionTanksHeight();

                    this.hasImpacted = true;
                });
            }

            if (!this.hasImpacted && !this.isExploding) {
                this.time += 1;
                createjs.Tween.get(this).to({
                    x: this.x + this.velocityX,
                    y: veloc(this.time, this.velocityY, this.startingY)
                }, (updateDelay / ticksPerSec) * 1000);
                //console.log("Y Pos: " + this.y);
            }
        }

        tempMissile.checkOutOfBounds = function() {
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

        tempMissile.hasExploded = function() {
            return this.hasImpacted;
        }

        return tempMissile;
    }

    window.Missile = Missile;
})();

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function veloc(time, Vo, X) {
    // -(1/2)at^2 + Vot + x
    var a = 0.2;
    var result = ((1 / 2) * a * (time * time)) + (Vo * time) + X;
    //console.log("Equat: -1/2 * " + a + " * " + time + "^2 + " + Vo + " * " + time + " + " + X);
    //console.log("Resul: " + result);
    return result;
}
(function() {
    var Tank = function(playerName, barrelRotation, tankPNG, barrelPNG) {
        var tank = new createjs.Container();

        // Create tank bitmap
        tank.bitmap = new createjs.Bitmap(queue.getResult(tankPNG));

        // Create tank barrel
        tank.barrel = new createjs.Bitmap(queue.getResult(barrelPNG));
        tank.barrel.regX = 0;
        tank.barrel.regY = 2.5;
        tank.barrel.x = 10;
        tank.barrel.y = 10;
        tank.barrel.rotation = -barrelRotation;

        tank.marker = new createjs.Shape();
        tank.marker.graphics.beginFill("#6F6").setStrokeStyle(2)
            .beginStroke("#26F").drawPolyStar(0, 0, 8, 3, 0.5, 90);
        tank.marker.alpha = 0;
        tank.marker.x = 10;
        tank.marker.y = -25;
        tank.marker.moveAnimation = createjs.Tween.get(tank.marker, { paused: true, loop: true })
            .to({ y: -35 }, 750).to({ y: -25 }, 750);

        // Add tank bitmap, barrel bitmap, and the marker shape to the tank container
        tank.addChild(tank.bitmap);
        tank.addChild(tank.barrel);
        tank.addChild(tank.marker);

        // Set common properties of the tank
        tank.name = playerName;
        tank.health = 100;
        tank.movesLeft = 0;
        tank.powerLevel = 50;

        // Set tank functions
        tank.damageTank = damageTank;
        tank.getHealth = getHealth;
        tank.killTank = killTank;
        tank.isDead = isDead;
        tank.rotateBarrelLeft = rotateBarrelLeft;
        tank.rotateBarrelRight = rotateBarrelRight;
        tank.getBarrelRotation = getBarrelRotation;
        tank.getMovesLeft = getMovesLeft;
        tank.useMove = useMove;
        tank.setMovesLeft = setMovesLeft;
        tank.getPowerLevel = getPowerLevel;
        tank.decreasePowerLevel = decreasePowerLevel;
        tank.increasePowerLevel = increasePowerLevel;
        tank.showMarker = showMarker;
        tank.hideMarker = hideMarker;
        tank.fireMissile = fireMissile;

        return tank;
    }

    /* FUNCTIONS RELATING TO HEALTH */
    function damageTank(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    function getHealth() {
        return this.health;
    }

    function killTank() {
        this.health = 0;
    }

    function isDead() {
        return this.health <= 0;
    }

    function fireMissile() {
        activeMissiles.push(new Missile("fast", this.getBarrelRotation(), this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
    }

    /* FUNCTIONS RELATING TO BARREL ROTATION */
    function rotateBarrelLeft() {
        if (this.barrel.rotation > -180) {
            this.barrel.rotation--;
        }
    }

    function rotateBarrelRight() {
        if (this.barrel.rotation < 0) {
            this.barrel.rotation++;
        }
    }

    function getBarrelRotation() {
        return -this.barrel.rotation;
    }

    /* FUNCTIONS RELATING TO TANK MOVEMENT */
    function getMovesLeft() {
        return this.movesLeft;
    }

    function useMove() {
        this.movesLeft--;
    }

    function setMovesLeft(amount) {
        this.movesLeft = amount;
    }

    /* FUNCTIONS RELATING TO TANK POWER LEVELS */
    function getPowerLevel() {
        return this.powerLevel;
    }

    function decreasePowerLevel() {
        this.powerLevel--;
    }

    function increasePowerLevel() {
        this.powerLevel++;
    }

    /* FUNCTIONS RELATING TO THE MARKER ABOVE THE TANK */
    function showMarker() {
        this.marker.moveAnimation.setPaused(false);
        this.marker.alpha = 1;
    }

    function hideMarker() {
        this.marker.moveAnimation.setPaused(true);
        this.marker.alpha = 0;
    }

    window.Tank = Tank;
})();
(function() {
    var Tank = function(playerName, barrelRotation, tankPNG, barrelPNG, initialMissiles) {
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

        tank.damageText = new createjs.Text("", "10px Arial", "#F00");

        // Add tank bitmap, barrel bitmap, and the marker shape to the tank container
        tank.addChild(tank.bitmap);
        tank.addChild(tank.barrel);
        tank.addChild(tank.marker);
        tank.addChild(tank.damageText);

        // Set common properties of the tank
        tank.name = playerName;
        tank.health = 100;
        tank.movesLeft = 0;
        tank.powerLevel = 50;
        tank.money = 100;

        // Set tank functions
        tank.damageTank = damageTank;
        tank.nextMissile = nextMissile;
        tank.previousMissile = previousMissile;
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
        tank.getMissiles = getMissiles;
        tank.getMoney = getMoney;
        // tank.getNormalCost = getNormalCost;
        // tank.getBigCost = getBigCost;
        // tank.getFastCost = getFastCost;
        tank.addMoney = addMoney;
        tank.removeMoney = removeMoney;
        tank.addMissiles = addMissiles;
        tank.resetHealth = resetHealth;
        tank.getAllMissiles = getAllMissiles;
        tank.missiles = JSON.parse(JSON.stringify(initialMissiles));
        tank.selectedIndex = 0;
        tank.selectedMissile = tank.missiles[tank.selectedIndex];

        return tank;
    }

    /* FUNCTIONS RELATING TO HEALTH */
    function damageTank(amount) {
        if (amount !== 0) {
            try {
                this.damageText.text = "-" + amount;
                this.damageText.y = -10;
                this.damageText.moveAnimation = createjs.Tween.get(this.damageText)
                    .to({ alpha: 1, y: -20 }, 500).wait(1000).to({ alpha: 0, y: -30 }, 500);
                this.health -= amount;
                if (this.health < 0) {
                    this.health = 0;
                }
            } catch (e) {}
        }
    }

    function nextMissile() {
        do {
            this.selectedIndex = ++this.selectedIndex % this.missiles.length;
            this.selectedMissile = this.missiles[this.selectedIndex];
        } while (this.selectedMissile.count === 0)
    }

    function previousMissile() {
        do {
            this.selectedIndex--;
            if (this.selectedIndex < 0)
                this.selectedIndex = this.missiles.length - 1;
            //this.selectedIndex = (--this.selectedIndex) % this.missiles.length; // Why doesn't mod work here??
            this.selectedMissile = this.missiles[this.selectedIndex];
        } while (this.selectedMissile.count === 0)
    }




    function getHealth() {
        return this.health;
    }

    function killTank() {
        damageTank(this.health);
    }

    function isDead() {
        return this.health <= 0;
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

    function addMoney(amount) {
        this.money += amount;
    }

    function removeMoney(amount) {
        this.money -= amount;
    }

    function getMoney() {
        return this.money;
    }

    function resetHealth() {
        this.health = 100;
    }

    // function getNormalCost() {
    //     return this.missiles.normal.cost;
    // }

    // function getBigCost() {
    //     return this.missiles.big.cost;
    // }

    // function getFastCost() {
    //     return this.missiles.fast.cost;
    // }

    function addMissiles(normal, big, fast) {
        // this.missiles.normal.count = this.missiles.normal.count + normal;
        // this.missiles.big.count = this.missiles.big.count + big;
        // this.missiles.fast.count = this.missiles.fast.count + fast;
    }

    /* FUNCTIONS RELATING TO THE SHOOTING OF missiles */
    function getMissiles(landBlockSize) {
        if (this.selectedMissile.count > 0) {
            this.selectedMissile.count--;
            var missileGroup = [];
            
            switch (this.selectedMissile.id) {
                case "tracer":
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() - 10, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() - 5, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation(), this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() + 5, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() + 10, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    break;
                case "triple":
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() - 5, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation(), this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation() + 5, this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
                    break;
                default:
                    missileGroup.push(Missile(this.selectedMissile, this.getBarrelRotation(), this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2)));
            }
            //Missile(this.selectedMissile.id, this.getBarrelRotation(), this.getPowerLevel() / 7, this.x + (landBlockSize / 2), this.y + (landBlockSize / 2));
            return missileGroup;
        }
    }

    function getAllMissiles() {
        return this.missiles;
    }

    window.Tank = Tank;
})();

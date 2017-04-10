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

	    // Add tank bitmap and barrel to the tank container
	    tank.addChild(tank.bitmap);
	    tank.addChild(tank.barrel);

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

	window.Tank = Tank;
})();
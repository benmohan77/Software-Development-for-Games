(function() {
	var StoreSelection = function(missileType) {
		var temp = new createjs.Container();
		temp.missileType = missileType;
		temp.buyCount = 0;

		temp.text = new createjs.Text(getTextString(temp.missileType, temp.buyCount), "20px Courier New", "#000");
		temp.text.x = 30;
		temp.text.y = 8;

		temp.btnIncrease = new ArrowButton(90);
		
		temp.btnIncrease.on("click", function() {
			this.buyCount++;
			this.text.text = getTextString(this.missileType, this.buyCount);
		}, temp);

		temp.btnDecrease = new ArrowButton(270);
		temp.btnDecrease.y = 60;
		temp.btnDecrease.on("click", function() {
			if (this.buyCount > 0) {
				this.buyCount--;
				this.text.text = getTextString(this.missileType, this.buyCount);
			}
		}, temp);

		temp.addChild(temp.text);
		temp.addChild(temp.btnIncrease);
		temp.addChild(temp.btnDecrease);

		temp.getBuyCount = getBuyCount;
		temp.getBuyCost = getBuyCost;
		temp.getMissileType = getMissileType;

		return temp;
	}

	function getTextString(missileType, buyCount) {
		return missileType.name + "\r\rOwn: " + missileType.count + "    Price: " + missileType.cost + "    Buy: " + buyCount;
	}

	function getBuyCount() {
		return this.buyCount;
	}

	function getBuyCost() {
		return this.buyCount * this.missileType.cost;
	}

	function getMissileType() {
		return this.missileType;
	}

	window.StoreSelection = StoreSelection;
})();
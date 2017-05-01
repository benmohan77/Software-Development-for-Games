function openMenu(tank, index, total) {
    createjs.Ticker.addEventListener("tick", store_tick);
    normalCount = 0;
    console.log(tank.isDead());
    fastCount = 0;
    bigCount = 0;
    totalCost = 0;
    normal = new createjs.Text("Normal: " + normalCount, "15px Courier New", "#000000");
    fast = new createjs.Text("Fast: " + fastCount, "15px Courier New", "#000000");
    big = new createjs.Text("Big: " + bigCount, "15px Courier New", "#000000");
    var CostText = new createjs.Text("Total Cost:" + 0, "15px Courier New", "#000000");
    CostText.x = (stageXdimens / 2) - 25;
    CostText.y = (stageYdimens - 100);
    btnNormalUp = new ArrowButton(180);
    btnNormalUp.addEventListener("click", function() {
        normalCount++;
        totalCost = totalCost + tank.getNormalCost();
        normal.text = "Normal: " + normalCount;
        CostText.text = "Total Cost: " + totalCost;
    });

    btnNormalDown = new ArrowButton(0);
    btnNormalDown.addEventListener("click", function() {
        if (normalCount > 0) {
            normalCount--;
            totalCost = totalCost - tank.getNormalCost();
            normal.text = "Normal: " + normalCount;
            CostText.text = "Total Cost: " + totalCost;

        }
    });
    btnFastUp = new ArrowButton(180);
    btnFastUp.addEventListener("click", function() {
        fastCount++;
        totalCost = totalCost + tank.getFastCost();
        fast.text = "Fast: " + fastCount;
        CostText.text = "Total Cost: " + totalCost;

    });
    btnFastDown = new ArrowButton(0);
    btnFastDown.addEventListener("click", function() {
        if (fastCount > 0) {
            fastCount--;
            totalCost = totalCost - tank.getFastCost();
            fast.text = "Fast: " + fastCount;
            CostText.text = "Total Cost: " + totalCost;

        }
    });
    btnBigUp = new ArrowButton(180);
    btnBigUp.addEventListener("click", function() {
        bigCount++;
        totalCost = totalCost + tank.getBigCost();
        big.text = "Big: " + bigCount;
        CostText.text = "Total Cost: " + totalCost;

    });
    btnBigDown = new ArrowButton(0);
    btnBigDown.addEventListener("click", function() {
        if (bigCount > 0) {
            bigCount--;
            totalCost = totalCost - tank.getBigCost();
            big.text = "Big: " + bigCount;
            CostText.text = "Total Cost: " + totalCost;

        }
    });
    btnNormalDown.x = btnFastDown.x = btnBigDown.x = 30;
    btnNormalUp.x = btnFastUp.x = btnBigUp.x = 200;


    var playerText = new createjs.Text(tank.name, "15px Courier New", "#000000");
    playerText.x = (stageXdimens / 2) - 75;
    playerText.y = 20;

    var moneyText = new createjs.Text("Available Funds: " + tank.getMoney(), "15px Courier New", "#000000");
    moneyText.x = (stageXdimens / 2) - 25;
    moneyText.y = (stageYdimens - 75);

    var btnBuy = new Button("Buy", 25);
    btnBuy.x = (stageXdimens / 2);
    btnBuy.y = (stageYdimens - 50);
    btnBuy.addEventListener("click", function() {
        console.log(totalCost <= tank.getMoney());
        if (totalCost <= tank.getMoney()) {
            stage.removeAllChildren();
            tank.addMissiles(normalCount, bigCount, fastCount);
            if (index < (total - 1)) {
                openMenu(playerTanks[index + 1]);
            } else {
                newGame(playerTanks.length);
            }
        }
    })


    normal.x = fast.x = big.x = 80;
    normal.y = 25;

    fast.y = 85;

    big.y = 145;



    btnNormalDown.y = btnNormalUp.y = 30;
    btnFastDown.y = btnFastUp.y = 90;
    btnBigDown.y = btnBigUp.y = 150;

    stage.addChild(playerText, btnBuy, moneyText, CostText, btnNormalDown, btnNormalUp, btnFastDown, btnFastUp, btnBigDown, btnBigUp, normal, fast, big);

}

function openStore() {
    for (i = 0; i < playerTanks.length; i++) {
        openMenu(playerTanks[i]);
    }
}

function store_tick() {
    stage.update();
}
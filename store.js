var selections = [];
var costText;
var btnBuy;
var totalCost;
var visitingTank;

function openMenu(tank, index, total) {
    totalCost = 0;
    visitingTank = tank;

    costText = new createjs.Text("Total Cost: 0", "15px Courier New", "#000000");
    costText.x = (stageXdimens / 2) - 25;
    costText.y = (stageYdimens - 100);

    var playerText = new createjs.Text(tank.name, "30px Courier New", "#000000");
    playerText.x = (stageXdimens / 2) - 150;
    playerText.y = 40;

    var moneyText = new createjs.Text("Available Funds: " + tank.getMoney(), "15px Courier New", "#000000");
    moneyText.x = (stageXdimens / 2) - 25;
    moneyText.y = (stageYdimens - 75);

    btnBuy = new Button("Buy", 25);
    btnBuy.x = (stageXdimens / 2);
    btnBuy.y = (stageYdimens - 50);
    btnBuy.addEventListener("click", function() {
        console.log(totalCost <= visitingTank.getMoney());
        if (totalCost <= visitingTank.getMoney()) {
            stage.removeAllChildren();

            for (var i in selections) {
                selections[i].getMissileType().count += selections[i].getBuyCount();
            }

            visitingTank.removeMoney(totalCost);

            if (index < (total - 1)) {
                openMenu(playerTanks[index + 1], index + 1, playerTanks.length);
            } else {
                newGame(playerTanks.length);
            }
        }
    });


    stage.addChild(playerText, btnBuy, moneyText, costText);


    var y = 100;
    for (var i in MISSILES) {
        var btn = StoreSelection(visitingTank.getAllMissiles()[i]);
        btn.x = 100;
        btn.y = y;
        y += 100;
        stage.addChild(btn);
        selections[i] = btn;
    }
    createjs.Ticker.addEventListener("tick", store_tick);
}

function openStore() {
    for (i = 0; i < playerTanks.length; i++) {
        openMenu(playerTanks[i]);
    }
}

function store_tick() {
    var total = 0;
    for (var i in selections) {
        total += selections[i].getBuyCost();
    }
    costText.text = "Total Cost: " + total;
    totalCost = total;
    if (totalCost > visitingTank.getMoney()) {
        btnBuy.alpha = 0.3;
    }
    else {
        btnBuy.alpha = 1.0;
    }

    stage.update();
}

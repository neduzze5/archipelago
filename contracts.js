// Contracts object - methods to initialise dashboards
let tradeContracts = {

    // Array to hold information on contracts issued and fulfilled and on Kingdom settlements
    // --------------------------------------------------------------------------------------
    contractsArray: [ {name: 'Narwhal'},
                      {name: 'Needlefish'},
                      {name: 'Seahorse'},
                      {name: 'Swordfish'},
                    ],


    // Method to populate contracts array
    // ----------------------------------
    populateContracts: function() {
        // Loop for each kingdom island
        for (var i = 0; i < this.contractsArray.length; i++) {
            // Totals for number of open contracts and number of unopened contracts
            this.contractsArray[i].totalOpen = 0;
            this.contractsArray[i].totalClosed = 0;
            this.contractsArray[i].totalUnopen = resourceManagement.resourcePieces.length;
            // Loop for each resource type
            let teamContracts = {};
            for (var j = 0; j < resourceManagement.resourcePieces.length; j++) {
                teamContracts[resourceManagement.resourcePieces[j].goods] = {created: false, struck: 'unopen', initial: 0, renewal: 0};
            }
            this.contractsArray[i].contracts = teamContracts;
            console.log(this.contractsArray[i]);
        }
    },

    // Method to randomly generate new contract
    // ----------------------------------------
    newContract: function() {
        // x% chance that a new contract is generated
        if (Math.random() > 0.75) {
            // Chooses a kingdom settlement at random
            let settlementNumber = Math.floor((Math.random() * this.contractsArray.length));
            let contractIsland = this.contractsArray[settlementNumber];
            //console.log(contractIsland.name);
            // Limits open trades to 2 and checks that there are still contract resource types to be opened
            if (this.contractsArray[settlementNumber].totalOpen < 2 && (this.contractsArray[settlementNumber].totalUnopen > 0)) {
                // TO ADD - not a resource that is on their island
                // Loops until an unopen resource type is found
                do {
                    var resourceNumber = Math.floor((Math.random() * resourceManagement.resourcePieces.length));
                    var resourceType = resourceManagement.resourcePieces[resourceNumber].goods;
                }
                while (this.contractsArray[settlementNumber].contracts[resourceType].struck != 'unopen')

                // Picks a random initial amount for delivery plus a recurring weekly amount
                let initialAmount = Math.floor((Math.random() * (resourceManagement.resourcePieces[resourceNumber].production * 4))) + 5;
                let renewalAmount = resourceManagement.resourcePieces[resourceNumber].production;
                //console.log(initialAmount, renewalAmount);

                // Put into array as open contract and updates totals
                this.contractsArray[settlementNumber].totalOpen += 1;
                this.contractsArray[settlementNumber].totalUnopen -= 1;
                this.contractsArray[settlementNumber].contracts[resourceType] = {created: true, struck: 'open', initial: initialAmount, renewal: renewalAmount};


                // Comment that a contract is generated
                commentary.style.bottom = 0;
                commentary.innerHTML = 'Contract issued by ' + contractIsland.name + ' island for ' + resourceType +'. <br> Initial delivery amount: ' + initialAmount + ' + Weekly trade amount: ' + renewalAmount;
            }

        } else {
            //console.log('no contract');
        }
    },


// Method to check possible delivery to fulfil open contract
// ---------------------------------------------------------
    checkDelivery : function(locali, localj, searchType, localStock) {
        // Determines which fort is being delivered to
        let chosenFort = -1;
        let delivery = false;
        for (var k = 0; k < this.contractsArray.length; k++) {
            if(this.contractsArray[k].row == locali && this.contractsArray[k].col == localj) {
                chosenFort = k;
            }
        }

        // Determines whether ship cargo meets criteria for delivery
        if(this.contractsArray[chosenFort].contracts[searchType].struck == 'open' && this.contractsArray[chosenFort].contracts[searchType].initial <= localStock) {
            delivery = true;
        }

        return delivery;
    },

    // Method to complete contract delivery
    // ------------------------------------
        fulfilDelivery : function() {
            // Determines which fort is being delivered to
            let chosenFort = -1;
            for (var k = 0; k < this.contractsArray.length; k++) {
                if(this.contractsArray[k].row == pieceMovement.movementArray.end.row && this.contractsArray[k].col == pieceMovement.movementArray.end.col) {
                    chosenFort = k;
                }
            }

            // Updates game board based on delivery
            deliveryGoods = gameBoard.boardArray[pieceMovement.movementArray.start.row][pieceMovement.movementArray.start.col].pieces.goods;
            deliveryStock = this.contractsArray[chosenFort].contracts[deliveryGoods].initial;
            gameBoard.boardArray[pieceMovement.movementArray.start.row][pieceMovement.movementArray.start.col].pieces.stock -= deliveryStock;
            if (gameBoard.boardArray[pieceMovement.movementArray.start.row][pieceMovement.movementArray.start.col].pieces.stock == 0) {
                gameBoard.boardArray[pieceMovement.movementArray.start.row][pieceMovement.movementArray.start.col].pieces.goods = 'none';
            }

            // Updates contracts array based on delivery
            this.contractsArray[chosenFort].contracts[deliveryGoods].struck = gameManagement.turn;
            this.contractsArray[chosenFort].totalOpen -=1;
            this.contractsArray[chosenFort].totalClosed +=1;

        },



// Method to populate contract dashboard on right-hand panel
// ---------------------------------------------------------

    drawContracts : function() {
        // Finds the stockDashboard holder in the left hand panel
        let contractDashboardNode = document.querySelector('div.contractDashboard');

        // Any existing dashboard is deleted
        while (contractDashboardNode.firstChild) {
            contractDashboardNode.removeChild(contractDashboardNode.firstChild);
        }

        if (gameManagement.turn != 'Pirate') {
            for (var i = 0; i < this.contractsArray.length; i++) {
                // Div to hold island is created and island title added
                var divIsland = document.createElement('div');
                divIsland.setAttribute('class', 'item_holder');
                contractDashboardNode.appendChild(divIsland);
                var divIslandTitle = document.createTextNode(this.contractsArray[i].name);
                divIsland.appendChild(divIslandTitle);

                // 'No contracts' shown if no contracts open
                if (this.contractsArray[i].totalOpen + this.contractsArray[i].totalClosed == 0) {
                    let divForStock = document.createElement('div');
                    divForStock.setAttribute('class', 'stock_item_holder');
                    divForStock.innerHTML = 'no contracts';
                    divIsland.appendChild(divForStock);

                // Contract details added if contracts open
                } else {

                    for (var j = 0; j < resourceManagement.resourcePieces.length; j++) {
                        //console.log(this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].created);
                        if(this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].created) {

                            // Div to hold contract is created and icon added
                            let divType = document.createElement('div');
                            divType.setAttribute('class', 'inner_item_holder');
                            divIsland.appendChild(divType);

                            // Contracts status added
                            let divForText = document.createElement('div');
                            divForText.setAttribute('class', 'dashboard_text');
                            divType.appendChild(divForText);

                            // Icon added
                            if (this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].struck == 'open') {
                                let divTypeIcon = gameBoard.createActionTile(0, 0, resourceManagement.resourcePieces[j].type, 'Unclaimed', 'dash_' + resourceManagement.resourcePieces[j].type, 2, 0, 1.5, 0);
                                divType.appendChild(divTypeIcon);
                                divForText.innerHTML = this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].struck;
                            } else {
                                let divTypeIcon = gameBoard.createActionTile(0, 0, resourceManagement.resourcePieces[j].type, this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].struck, 'dash_' + resourceManagement.resourcePieces[j].type, 2, 0, 1.5, 0);
                                divType.appendChild(divTypeIcon);
                                divForText.innerHTML = 'closed';
                            }

                            // Delivery amounts added
                            let divForStock = document.createElement('div');
                            divForStock.setAttribute('class', 'stock_item_holder');
                            divForStock.innerHTML = this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].initial + ' + ' + this.contractsArray[i].contracts[resourceManagement.resourcePieces[j].goods].renewal;
                            divIsland.appendChild(divForStock);

                        }
                    }
                }
            }
        }
    },


// LAST BRACKET OF OBJECT
}

pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract FoosballTable is AccessoriesToken {

  function FoosballTable() {
    name = "Foosball Table";
    decimals = 0;
    symbol = "TFT";

    variety = "Desk";
    material = [0, 2];
    space = 2;
    orientation = 0;
    rarity = 3;

    fundsWallet = msg.sender;
    balances[msg.sender] = 50;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 130;

    approveForSale(10, 7500000000000000);

  }
}

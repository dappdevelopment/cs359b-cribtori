pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenBed is AccessoriesToken {

  function WoodenBed() {
    name = "Wooden Bed";
    decimals = 0;
    symbol = "TWB";

    variety = "Bed";
    material = [0, 1];
    space = 2;
    orientation = 0;
    rarity = 2;

    fundsWallet = msg.sender;
    balances[msg.sender] = 55;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 300;

    approveForSale(30, 3000000000000000);
  }
}

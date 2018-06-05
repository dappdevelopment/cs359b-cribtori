pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenStool is AccessoriesToken {

  function WoodenStool() {
    name = "WoodenStool";
    decimals = 0;
    symbol = "TWS";

    variety = "Chair";
    material = [0];
    space = 1;
    orientation = 0;
    rarity = 1;

    fundsWallet = msg.sender;
    balances[msg.sender] = 55;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 1000;

    approveForSale(25, 1000000000000000);
  }
}

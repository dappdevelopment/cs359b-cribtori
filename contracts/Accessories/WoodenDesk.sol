pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenDesk is AccessoriesToken {

  function WoodenDesk() {
    name = "Wooden Desk";
    decimals = 0;
    symbol = "TWD";

    variety = "Desk";
    material = [0];
    space = 2;
    orientation = 0;

    fundsWallet = msg.sender;
    balances[msg.sender] = 10;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 50;

    approveForSale(5, 10000000000000);
  }
}

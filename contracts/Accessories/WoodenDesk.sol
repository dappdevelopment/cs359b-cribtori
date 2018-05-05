pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenDesk is AccessoriesToken {

  function WoodenDesk() {
    name = "Wooden Desk";
    decimals = 0;
    symbol = "TWD";

    variety = "Desk";
    material = "Wood";
    space = 2;

    fundsWallet = msg.sender;
    balances[msg.sender] = 1000;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 100;
  }
}

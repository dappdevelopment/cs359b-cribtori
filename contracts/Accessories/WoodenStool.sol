pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenStool is AccessoriesToken {

  function WoodenStool() {
    name = "WoodenStool";
    decimals = 0;
    symbol = "TWS";

    variety = "Chair";
    material = "Wood";
    space = 1;

    fundsWallet = msg.sender;
    balances[msg.sender] = 10;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 100;
  }
}

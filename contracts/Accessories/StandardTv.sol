pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract StandardTv is AccessoriesToken {

  function StandardTv() {
    name = "Standard TV";
    decimals = 0;
    symbol = "TST";

    variety = "Electronic";
    material = [0, 2];
    space = 1;
    orientation = 0;
    rarity = 2;

    fundsWallet = msg.sender;
    balances[msg.sender] = 10;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 50;
  }
}

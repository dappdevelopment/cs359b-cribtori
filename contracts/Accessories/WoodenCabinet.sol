pragma solidity ^0.4.21;

import './ToriAccessories.sol';

contract WoodenCabinet is ToriAccessories {

  function WoodenCabinet() {
    name = "Wooden Cabinet";
    decimals = 0;
    symbol = "TWC";

    variety = "Cabinet";
    material = "Wood";
    space = 1;

    fundsWallet = msg.sender;
    balances[msg.sender] = 1000;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 100;
  }
}

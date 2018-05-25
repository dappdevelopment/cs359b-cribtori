pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract PottedPlant is AccessoriesToken {

  function PottedPlant() {
    name = "Potted Plant";
    decimals = 0;
    symbol = "TPP";

    variety = "Plant";
    material = [0];
    space = 1;
    orientation = 0;
    rarity = 1;

    fundsWallet = msg.sender;
    balances[msg.sender] = 10;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 100;
  }
}

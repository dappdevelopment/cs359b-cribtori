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
    balances[msg.sender] = 55;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 500;

    approveForSale(20, 2000000000000000);
  }
}

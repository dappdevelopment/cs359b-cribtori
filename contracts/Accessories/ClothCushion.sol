pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract ClothCushion is AccessoriesToken {

  function ClothCushion() {
    name = "Cloth Cushion";
    decimals = 0;
    symbol = "TCC";

    variety = "Chair";
    material = [1];
    space = 1;
    orientation = 0;
    rarity = 1;

    fundsWallet = msg.sender;
    balances[msg.sender] = 10;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 80;
  }
}

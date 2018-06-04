pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract WoodenTable is AccessoriesToken {

  function WoodenTable() {
    name = "Wooden Table";
    decimals = 0;
    symbol = "TWT";

    variety = "Table";
    material = [0];
    space = 1;
    orientation = 0;
    rarity = 2;

    fundsWallet = msg.sender;
    balances[msg.sender] = 55;
    totalSupply_ = 10000;
    unitsOneEthCanBuy = 500;

    approveForSale(20, 2000000000000000);
  }
}

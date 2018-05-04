pragma solidity ^0.4.21;

import './AccessoriesToken.sol';

contract ToriAccessories is AccessoriesToken {

  string public name;
  uint8 public decimals;
  string public symbol;

  uint256 public unitsOneEthCanBuy;
  uint256 public totalEthInWei;
  address public fundsWallet;

  string public variety;
  string public material;
  uint32 public space;

  function() payable{
    totalEthInWei = totalEthInWei + msg.value;
    uint256 amount = msg.value * unitsOneEthCanBuy;
    require(balances[fundsWallet] >= amount);

    balances[fundsWallet] = balances[fundsWallet] - amount;
    balances[msg.sender] = balances[msg.sender] + amount;

    emit Transfer(fundsWallet, msg.sender, amount);

    //Transfer ether to fundsWallet
    fundsWallet.transfer(msg.value);
  }

  function retrieveAllInfo() public view returns(
    string _name,
    string _symbol,
    string _variety,
    string _material,
    uint32 _space) {
    _name = name;
    _symbol = symbol;
    _variety = variety;
    _material = material;
    _space = space;
  }
}

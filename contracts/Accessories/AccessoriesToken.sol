pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';

contract AccessoriesToken is ERC20Basic {
  using SafeMath for uint256;

  uint256 totalSupply_;
  mapping(address => uint256) balances;

  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    if (balances[_to] >= _value) {
      _transfer(msg.sender, _to, _value);
      return true;
    }
    return false;
  }

  function _transfer(address _from, address _to, uint256 _value) private {
    // Modify the counts.
    balances[_to] += _value;
    balances[msg.sender] -= _value;

    emit Transfer(_from, _to, _value);
  }
}

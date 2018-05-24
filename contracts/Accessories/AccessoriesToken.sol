pragma solidity ^0.4.21;

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract AccessoriesToken is StandardToken {

  string[] public MATERIAL_NAME = ["Wood", "Cloth", "Metal"];

  string public name;
  uint8 public decimals;
  string public symbol;

  uint256 public unitsOneEthCanBuy;
  uint256 public totalEthInWei;
  address public fundsWallet;

  string public variety;
  uint32[] public material;
  uint32 public space;
  // 0: horizontal, 1: vertical
  uint8 public orientation;
  uint8 public rarity;

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
    uint32[] _material,
    uint32 _space,
    uint8 _orientation,
    uint8 _rarity,
    uint256 _amount,
    uint256 _price) {
    _name = name;
    _symbol = symbol;
    _variety = variety;
    // TODO: workaround for returning multiple strings.
    _material = material;
    _space = space;
    _orientation = orientation;
    _rarity = rarity;
    _amount = allowance(msg.sender, this);
    _price = pricePerToken[msg.sender];
  }


  mapping (address => uint256) pricePerToken;
  mapping (address => uint256) addrToIndexes;
  address[] allowanceOwner;
  uint256 allowedSale;


  function approveForSale(uint256 _value, uint256 _pricePerToken) public returns (bool) {
    require((balances[msg.sender] >= _value) && (_pricePerToken > 0) && allowance(msg.sender, this) == 0);
    pricePerToken[msg.sender] = _pricePerToken;
    allowedSale = allowedSale.add(1);

    if (addrToIndexes[msg.sender] == 0) {
      uint256 id = allowanceOwner.push(msg.sender);
      addrToIndexes[msg.sender] = id;
    }
    return approve(this, _value);
  }

  // TODO: add decrease and increase Approval
  function removeForSale() public returns (bool) {
    uint256 value = allowance(msg.sender, this);
    require(value != 0);
    pricePerToken[msg.sender] = 0;
    allowedSale = allowedSale.sub(1);
    return decreaseApproval(this, value);
  }

  function buyForSale(address _owner, uint256 _value) public payable {
    uint256 allowedValue = allowance(_owner, this);
    uint256 price = pricePerToken[_owner];
    require((allowedValue >= _value) && (_value > 0) && (msg.value >= (_value * price)));
    // Send the ether.
    uint256 excess = msg.value - _value * price;
    if (excess > 0) {
      msg.sender.transfer(excess);
      _owner.transfer(_value * price);
    } else {
      _owner.transfer(msg.value);
    }
    this.transferFrom(_owner, msg.sender, _value);

    if (allowedValue == _value) {
      allowedSale -= 1;
    }
  }

  function retrieveAllForSales() public view returns (uint[], uint[], address[]) {
    uint[] memory values = new uint[](allowedSale);
    uint[] memory prices = new uint[](allowedSale);
    address[] memory owners = new address[](allowedSale);
    uint idx = 0;
    for (uint i = 0; i < allowanceOwner.length; i++) {
      address _owner = allowanceOwner[i];
      uint256 value = allowance(_owner, this);
      if (value > 0) {
        values[idx] = value;
        prices[idx] = pricePerToken[_owner];
        owners[idx] = _owner;
        idx += 1;
      }
    }
    return (values, prices, owners);
  }
}

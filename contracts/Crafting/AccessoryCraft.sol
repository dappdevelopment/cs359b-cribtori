pragma solidity ^0.4.21;

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract AccessoryInterface {
  function balanceOf(address _owner) public view returns (uint256);

  function mint(
    address _to,
    uint256 _amount
  ) public returns (bool);

  function burnRBAC(
    address _who,
    uint256 _value
  ) public;

  function retrieveAllInfo() public view returns(
    string _name,
    string _symbol,
    string _variety,
    uint32[] _material,
    uint32 _space,
    uint8 _orientation,
    uint8 _rarity,
    uint256 _amount,
    uint256 _price);
}

contract AccessoryCraft is Ownable {

  mapping (string => AccessoryInterface) tokenInterfaces;
  mapping (string => uint8) tokenRarity;

  uint256 maxRarity = 1;
  uint256 minRarity = 1;

  modifier hasEnough(string[] _symbols, uint256[] _amounts, address _owner) {
    require(_symbols.length == _amount.length);
    // TODO: Safe math for loop iteration.
    for (uint256 i = 0; i < _symbols.length; i ++) {
      string memory cs = _symbols[i];
      uint256 memory ca = _amounts[i];

      uint256 memory ba = tokenInterfaces[cs].balanceOf(_owner);
      require(ba >= ca);
    }
    _;
  }

  function setAcessoryAddress(string _symbol, address _address) external onlyOwner {
    tokenInterfaces[_symbol] = AccessoryInterface(_address);
    // Get token ranking information
    uint8 rarity;
    (,,,,,, rarity,,) = tokenInterfaces[_symbol].retrieveAllInfo();
    tokenRarity[_symbol] = rarity;

    maxRarity = max(maxRarity, rarity);
  }

  function craftAccessory(string[] _symbols, uint256 _amounts, address _owner)
    hasEnough(_symbols, _amounts, _owner)
    public returns (bool result) {
    require(_symbols.length > 1 && _amounts.length > 1);

    // Get all tokens rarity info
    uint256 rarityScore = 0;
    uint256 limitIdx = 0;
    for (uint256 i = 0; i < _symbols.length; i++) {
      // TODO: SafeMath
      rarityScore += tokenRarity[_symbols[i]];
      // TODO: for simplicity, if sender calls this function with rarity >= maxRarity,
      //       only use the first accessories that covers maxRarity.
      if (rarityScore >= maxRarity) {
        limitIdx = i;
        // No need to process the rest
        break;
      }
    }

    // Randomly choose which token to craft
    // For ex. given 1-1 acc --> 1: 15%, 2: 80%, 3: 5%
    // TODO:

    return true;
  }
}

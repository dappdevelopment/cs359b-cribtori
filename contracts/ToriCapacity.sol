pragma solidity ^0.4.21;

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/examples/RBACWithAdmin.sol';
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

//import 'openzeppelin-solidity/contracts/ownership/rbac/RBACWithAdmin.sol';
//import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriCapacity is RBACWithAdmin {

  using SafeMath for uint256;

  // Address to max level.
  mapping (address => uint) addressToMaxLevel;
  // Min level to maximum capacity.
  mapping (uint => uint) minLevelToCapacity;
  // Breakpoints for levels.
  uint[] minLevels;

  function ToriCapacity() {
    addLevelCapacity(1, 6);
    addLevelCapacity(4, 16);
    addLevelCapacity(8, 25);
  }

  function addLevelCapacity(uint _minLevel, uint _capacity) onlyAdmin public {
    require(minLevelToCapacity[_minLevel] == 0);
    minLevelToCapacity[_minLevel] = _capacity;
    minLevels.push(_minLevel);
  }

  function checkLevelCapacity(uint _level) public view returns (uint) {
    for (uint i = 0; i < minLevels.length; i = i.add(1)) {
      uint currentMinLevel = minLevels[minLevels.length - i - 1];
      if (currentMinLevel <= _level) {
        return minLevelToCapacity[currentMinLevel];
      }
    }
    // Defaults to 1.
    return minLevelToCapacity[1];
  }

  function getMaxCapacity(address _owner) public view returns (uint maxCapacity) {
    // Get the max level for this user.
    uint maxLevel = addressToMaxLevel[_owner];
    if (maxLevel == 0) {
      // Defaults to 1 if no entry.
      maxLevel = 1;
    }

    maxCapacity = checkLevelCapacity(maxLevel);
  }

  function updateMaxLevel(address _owner, uint level) internal {
    uint currentMaxLevel = addressToMaxLevel[_owner];
    if (currentMaxLevel < level) {
      addressToMaxLevel[_owner] = level;
    }
  }
}

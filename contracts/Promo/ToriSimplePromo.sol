pragma solidity ^0.4.21;

import '../DnaCore.sol';

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

//import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
//import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriTokenInterface {
  function generateSpecialTori(uint8[] _quizzes,
                               string _name,
                               uint256 _special,
                               address _owner) public returns (bool success);
  function balanceOf(address _owner) public view returns (uint256);
  function ownerOf(uint256 _tokenId) public view returns (address);
}

contract ToriSimplePromo is DnaCore, Ownable {

  using SafeMath for uint256;

  ToriTokenInterface toriTokenInterface;

  mapping (uint256 => uint256) limit;
  mapping (uint256 => uint256) special;
  mapping (uint256 => uint256) counter;

  mapping (address => mapping(uint256 => uint8)) claim;

  function setToriTokenAddress(address _address) external onlyOwner {
    toriTokenInterface = ToriTokenInterface(_address);

    // Code 0 is for initial Tori.
    limit[0] = 30;
    special[0] = 0;
  }

  function addPromoCode(string _code, uint256 _limit, uint256 _specialCode) onlyOwner public {
    uint256 hashCode = uint256(keccak256(_code));
    // We don't want to add the same code.
    require(limit[hashCode] == 0);

    limit[hashCode] = _limit;
    special[hashCode] = _specialCode;
  }

  function getLimit(string _code) public view returns (uint256 limitValue) {
    uint256 hashCode = uint256(keccak256(_code));
    limitValue = limit[hashCode];
  }

  function increaseLimit(string _code, uint256 _limitAddition) onlyOwner public {
    uint256 hashCode = uint256(keccak256(_code));
    // We don't want to add the same code.
    require(limit[hashCode] > 0);

    limit[hashCode] = limit[hashCode].add(_limitAddition);
  }

  function _claimPromoTori(uint8[] _quizzes,
                           string _name,
                           uint256 _hashCode,
                           uint256 _special) private returns (bool result) {
    // Valid code!
    result = toriTokenInterface.generateSpecialTori(_quizzes, _name, _special, msg.sender);

    // Update the counter.
    if (result) {
      counter[_hashCode] = counter[_hashCode].add(1);
      claim[msg.sender][_hashCode] = 1;
    }
  }

  function claimInitialTori(uint8[] _quizzes, string _name) public returns (bool result) {
    uint256 currentBalance = toriTokenInterface.balanceOf(msg.sender);
    require (currentBalance == 0 && claim[msg.sender][0] == 0);
    // Valid code!
    result = _claimPromoTori(_quizzes, _name, 0, 0);
  }

  function claimCode(uint8[] _quizzes,
                     string _name,
                     string _code) public returns (bool result) {
    uint256 hashCode = uint256(keccak256(_code));

    // Check if it's a valid promo code.
    // Promo code is only valid 1 per user.
    require(limit[hashCode] > 0 &&
            limit[hashCode] > counter[hashCode] &&
            claim[msg.sender][hashCode] == 0);
    // Valid code!
    result = _claimPromoTori(_quizzes, _name, hashCode, special[hashCode]);
  }
}

pragma solidity ^0.4.21;

/* import 'openzeppelin-solidity/contracts/ownership/Ownable.sol'; */

contract ToriAccessories {

  uint256 private VARIETY_DIGIT = 10;
  uint256 private RARITY_DIGIT = 2;
  uint256 private SPACE_DIGIT = 1;

  uint256 private VARIETY_LIMIT = 10**VARIETY_DIGIT;
  uint256 private RARITY_LIMIT = 10**RARITY_DIGIT;
  uint256 private SPACE_LIMIT = 10**SPACE_DIGIT;

  struct Accessories {
    uint32 variety;
    uint32 rarity;
    uint32 space;
  }

  Accessories[] accessories;

  mapping (uint256 => address) accIndexToAddr;
  mapping (address => uint256) addrToAccCount;

  event NewAccessories(address indexed _address, uint256 accIdx);


  function _generateRandomAccessories(string quiz) private view returns (Accessories) {
    // TODO: implement a more detailed Accessories generation.
    uint256 generatedRandomness = uint(keccak256(now, msg.sender, quiz));
    uint32 variety = uint32(generatedRandomness % VARIETY_LIMIT);
    uint32 rarity = uint32(generatedRandomness % RARITY_LIMIT);
    uint32 space = uint32(generatedRandomness % SPACE_LIMIT);
    return Accessories(variety, rarity, space);
  }

  function generateNewAccessories(string quiz) public returns (bool success) {
    // Generate three new toris.
    require (addrToAccCount[msg.sender] == 0);
    Accessories memory newAcc = _generateRandomAccessories(quiz);
    // Push to the book keeping array.
    uint256 id = accessories.push(newAcc) - 1;
    accIndexToAddr[id] = msg.sender;
    addrToAccCount[msg.sender] += 1;

    emit NewAccessories(msg.sender, id);
    return true;
  }

  function getAccessoriesIndexes(address _owner) public view returns (uint[]) {
    uint size = addrToAccCount[_owner];
    uint[] memory result = new uint[](size);

    uint idx = 0;
    for (uint i = 0; i < accessories.length; i++) {
      if (accIndexToAddr[i] == _owner) {
        result[idx] = i;
        idx++;
      }
      if (idx >= size) {
        break;
      }
    }
    return result;
  }

  function getAccessoriesInfo(uint256 _accId) public view returns
                    (uint256 accId, uint256 variety, uint256 rarity, uint32 space) {
    Accessories memory acc = accessories[_accId];
    return (_accId, acc.variety, acc.rarity, acc.space);
  }

  function getAccessoriesCount() public view returns (uint256 accCount) {
    return addrToAccCount[msg.sender];
  }

  function getAllAccessoriesCount() public view returns (uint) {
    return accessories.length;
  }
}

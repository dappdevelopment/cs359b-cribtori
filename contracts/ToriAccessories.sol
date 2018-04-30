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

  // accId to price (in wei)
  mapping (uint => uint256) accessoriesSale;
  uint256 accessoriesSaleCount;

  event NewAccessories(address indexed _address, uint256 accIdx);


  /* DEV USE */
  function ToriAccessories() {
    // Generate some Toris for the owner.
    uint n = 3;
    for (uint i = 0; i < n; i++) {
      Accessories memory newAcc = _generateRandomAccessories("sample", msg.sender);
      // Push to the book keeping array.
      uint256 id = accessories.push(newAcc) - 1;
      accIndexToAddr[id] = msg.sender;
      addrToAccCount[msg.sender] += 1;
    }

    accessoriesSale[0] = 2300000000000000;
    accessoriesSaleCount += 1;
  }



  function _generateRandomAccessories(string _quiz, address _owner) private view returns (Accessories) {
    // TODO: implement a more detailed Accessories generation.
    uint256 generatedRandomness = uint(keccak256(now, _owner, _quiz));
    uint32 variety = uint32(generatedRandomness % VARIETY_LIMIT);
    uint32 rarity = uint32(generatedRandomness % RARITY_LIMIT);
    uint32 space = uint32(generatedRandomness % SPACE_LIMIT);
    return Accessories(variety, rarity, space);
  }

  function generateNewAccessories(string _quiz) public returns (bool success) {
    // Generate three new toris.
    require (addrToAccCount[msg.sender] == 0);
    Accessories memory newAcc = _generateRandomAccessories(_quiz, msg.sender);
    // Push to the book keeping array.
    uint256 id = accessories.push(newAcc) - 1;
    accIndexToAddr[id] = msg.sender;
    addrToAccCount[msg.sender] += 1;

    emit NewAccessories(msg.sender, id);
    return true;
  }

  function getTokenIndexes(address _owner) public view returns (uint[]) {
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

  function getTokenInfo(uint256 _accId) public view returns
                    (uint256 accId, uint256 variety, uint256 rarity,
                      uint32 space, uint postingPrice) {
    Accessories memory acc = accessories[_accId];
    return (_accId, acc.variety, acc.rarity, acc.space, accessoriesSale[_accId]);
  }

  function getTokenCount() public view returns (uint256 accCount) {
    return addrToAccCount[msg.sender];
  }

  function getAllTokensCount() public view returns (uint) {
    return accessories.length;
  }
}

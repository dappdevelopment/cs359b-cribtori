pragma solidity ^0.4.21;

/* import 'openzeppelin-solidity/contracts/ownership/Ownable.sol'; */
import './VarietyCore.sol';

contract ToriAccessories is VarietyCore {

  struct Accessories {
    uint256 variety;
    uint32 material;
    uint32 space;
  }

  Accessories[] accessories;

  mapping (uint256 => address) accIndexToAddr;
  mapping (address => uint256) addrToAccCount;

  // accId to price (in wei)
  mapping (uint => uint256) accessoriesSale;
  uint256 accessoriesSaleCount;

  event NewAccessories(address indexed _address, uint256 accIdx);

  uint256 private nonce = 0;


  /* DEV USE */
  function ToriAccessories() {
    // Generate some Toris for the owner.
    uint n = 3;
    for (uint i = 0; i < n; i++) {
      Accessories memory newAcc = _generateRandomAccessories(msg.sender, nonce);
      // Push to the book keeping array.
      uint256 id = accessories.push(newAcc) - 1;
      accIndexToAddr[id] = msg.sender;
      addrToAccCount[msg.sender] += 1;

      nonce += 1;
    }

    accessoriesSale[0] = 2300000000000000;
    accessoriesSaleCount += 1;
  }



  function _generateRandomAccessories(address _owner, uint256 _nonce) private view returns (Accessories) {
    uint256 variety;
    uint32 material;
    uint32 space;
    (variety, material, space) = _generateRandomVariety(_owner, _nonce);
    return Accessories(variety, material, space);
  }

  function generateNewAccessories() public returns (bool success) {
    // Generate three new toris.
    require (addrToAccCount[msg.sender] == 0);
    Accessories memory newAcc = _generateRandomAccessories(msg.sender, nonce);
    // Push to the book keeping array.
    uint256 id = accessories.push(newAcc) - 1;
    accIndexToAddr[id] = msg.sender;
    addrToAccCount[msg.sender] += 1;

    nonce += 1;

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
                    (uint256 accId, uint256 variety, uint256 material,
                      uint32 space, uint postingPrice) {
    Accessories memory acc = accessories[_accId];
    return (_accId, acc.variety, acc.material, acc.space, accessoriesSale[_accId]);
  }

  function getTokenCount() public view returns (uint256 accCount) {
    return addrToAccCount[msg.sender];
  }

  function getAllTokensCount() public view returns (uint) {
    return accessories.length;
  }
}

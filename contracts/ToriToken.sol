pragma solidity ^0.4.21;

/* import 'openzeppelin-solidity/contracts/ownership/Ownable.sol'; */

contract ToriToken {

  uint256 private DNA_DIGIT = 10;
  uint256 private PROFICIENCY_DIGIT = 2;
  uint256 private PERSONALITY_DIGIT = 2;

  uint256 private DNA_LIMIT = 10**DNA_DIGIT;
  uint256 private PROFICIENCY_LIMIT = 10**PROFICIENCY_DIGIT;
  uint256 private PERSONALITY_LIMIT = 10**PERSONALITY_DIGIT;

  struct Tori {
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    uint32 readyTime;
  }

  Tori[] toris;

  mapping (uint256 => address) toriIndexToAddr;
  mapping (address => uint256) addrToToriCount;

  event NewTori(address indexed _address, uint256 toriIdx);


  /* DEV USE */
  function ToriToken() {
    // Generate some Toris for the owner.
    uint n = 3;
    for (uint i = 0; i < n; i++) {
      Tori memory newTori = _generateRandomTori("sample", "sample", msg.sender);
      // Push to the book keeping array.
      uint256 id = toris.push(newTori) - 1;
      toriIndexToAddr[id] = msg.sender;
      addrToToriCount[msg.sender] += 1;
    }
  }



  /*
  *   Generate random dna, personality, and proficiency level from
  *   the given quiz & sender address.
  */
  function _generateRandomTori(string _quiz, string _name, address _owner) private view returns (Tori) {
    // TODO: implement a more detailed Tori generation.
    uint256 generatedRandomness = uint(keccak256(now, _owner, _quiz, _name));
    uint256 dna = generatedRandomness % DNA_LIMIT;
    uint32 proficiency = uint32(generatedRandomness % PROFICIENCY_LIMIT);
    uint32 personality = uint32(generatedRandomness % PERSONALITY_LIMIT);
    return Tori(dna, proficiency, personality, uint32(now));
  }

  function generateNewTori(string _quiz, string _name) public returns (bool success) {
    // Generate three new toris.
    require (addrToToriCount[msg.sender] == 0);
    Tori memory newTori = _generateRandomTori(_quiz, _name, msg.sender);
    // Push to the book keeping array.
    uint256 id = toris.push(newTori) - 1;
    toriIndexToAddr[id] = msg.sender;
    addrToToriCount[msg.sender] += 1;

    emit NewTori(msg.sender, id);
    return true;
  }

  function getToriIndexes(address _owner) public view returns (uint[]) {
    uint size = addrToToriCount[_owner];
    uint[] memory result = new uint[](size);

    uint idx = 0;
    for (uint i = 0; i < toris.length; i++) {
      if (toriIndexToAddr[i] == _owner) {
        result[idx] = i;
        idx++;
      }
      if (idx >= size) {
        break;
      }
    }
    return result;
  }

  function getToriInfo(uint256 _toriId) public view returns
                    (uint256 toriId, uint256 toriDna, uint32 proficiency,
                      uint32 personality, uint32 readyTime) {
    Tori memory tori = toris[_toriId];
    return (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime);
  }

  function getToriCount() public view returns (uint256 toriCount) {
    return addrToToriCount[msg.sender];
  }

  function getAllToriCount() public view returns (uint) {
    return toris.length;
  }
}

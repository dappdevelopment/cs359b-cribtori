pragma solidity ^0.4.21;

import './DnaCore.sol';

contract ToriToken is DnaCore {

  struct Tori {
    uint256 dna;
    string name;
    uint32 proficiency;
    uint32 personality;
    uint32 readyTime;
  }

  Tori[] toris;

  mapping (uint256 => address) toriIndexToAddr;
  mapping (address => uint256) addrToToriCount;

  // toriId to price (in wei)
  mapping (uint => uint256) toriSale;
  uint256 toriSaleCount;

  event NewTori(address indexed _address, uint256 toriIdx);


  /* DEV USE */
  function ToriToken() {
    // Generate some Toris for the owner.

    // 1.
    uint8[] memory testQuiz = new uint8[](4);
    testQuiz[0] = 0;
    testQuiz[1] = 0;
    testQuiz[2] = 0;
    testQuiz[3] = 0;
    Tori memory newTori = _generateRandomTori(testQuiz, "Toto", msg.sender);
    uint256 id = toris.push(newTori) - 1;
    toriIndexToAddr[id] = msg.sender;
    addrToToriCount[msg.sender] += 1;
    // 2.
    testQuiz[1] = 1;
    newTori = _generateRandomTori(testQuiz, "Riri", msg.sender);
    id = toris.push(newTori) - 1;
    toriIndexToAddr[id] = msg.sender;
    addrToToriCount[msg.sender] += 1;

    // 3.
    testQuiz[0] = 1;
    testQuiz[3] = 1;
    newTori = _generateRandomTori(testQuiz, "Rito", msg.sender);
    id = toris.push(newTori) - 1;
    toriIndexToAddr[id] = msg.sender;
    addrToToriCount[msg.sender] += 1;

    toriSale[0] = 1000000000000000;
    toriSaleCount += 1;
  }



  /*
  *   Generate random dna, personality, and proficiency level from
  *   the given quiz & sender address.
  */
  function _generateRandomTori(uint8[] _quizzes, string _name, address _owner) private view returns (Tori) {
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (dna, proficiency, personality) = _generateRandomTraits(_quizzes, _name, _owner);
    return Tori(dna, _name, proficiency, personality, uint32(now));
  }

  function generateNewTori(uint8[] _quizzes, string _name) public returns (bool success) {
    // Generate three new toris.
    require (addrToToriCount[msg.sender] == 0);
    Tori memory newTori = _generateRandomTori(_quizzes, _name, msg.sender);
    // Push to the book keeping array.
    uint256 id = toris.push(newTori) - 1;
    toriIndexToAddr[id] = msg.sender;
    addrToToriCount[msg.sender] += 1;

    emit NewTori(msg.sender, id);
    return true;
  }

  function getTokenIndexes(address _owner) public view returns (uint[]) {
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

  function getTokenInfo(uint256 _toriId) public view returns
                    (uint256 toriId, uint256 toriDna, string name, uint32 proficiency,
                      uint32 personality, uint32 readyTime, uint postingPrice) {
    Tori memory tori = toris[_toriId];
    toriId = _toriId;
    toriDna = tori.dna;
    name = tori.name;
    proficiency = tori.proficiency;
    personality = tori.personality;
    readyTime = tori.readyTime;
    postingPrice = toriSale[_toriId];
  }

  function getTokenCount() public view returns (uint256 toriCount) {
    return addrToToriCount[msg.sender];
  }

  function getAllTokensCount() public view returns (uint) {
    return toris.length;
  }
}

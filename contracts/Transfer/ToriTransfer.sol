pragma solidity ^0.4.21;

//import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol';
//import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/lifecycle/Destructible.sol';
//import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriTokenInterface {
  function getTokenInfo(uint256 _toriId) public view returns
                    (uint256 toriId,
                      uint256 toriDna,
                      uint256 level,
                      string name,
                      uint32 proficiency,
                      uint32 personality,
                      uint32 readyTime,
                      uint256 generation,
                      uint256 special,
                      uint postingPrice,
                      address toriOwner);

  function generateNewTori(uint256 _dna,
                            uint256 _level,
                            uint32 _proficiency,
                            uint32 _personality,
                            uint256 _parent1,
                            uint256 _parent2,
                            string _name,
                            address _owner,
                            uint256 _special,
                            uint256 _generation) public returns (bool success);

  function getParentIds(uint256 _tokenId) public view returns (uint256 parent1, uint256 parent2);

  function burnTori(address _owner, uint256 _tokenId) public returns (bool success);

  function getAllTokensCount() public view returns (uint);
}

contract ToriTransfer is Ownable, Destructible {

  using SafeMath for uint256;

  ToriTokenInterface oldToriToken;
  ToriTokenInterface newToriToken;

  function setOldAddress(address _address) external onlyOwner {
    oldToriToken = ToriTokenInterface(_address);
  }

  function setNewAddress(address _address) external onlyOwner {
    newToriToken = ToriTokenInterface(_address);
  }

  function _getParents(uint256 _tokenId) private view returns (uint256[2] result){
    uint256 parent1;
    uint256 parent2;

    (parent1, parent2) = oldToriToken.getParentIds(_tokenId);

    result[0] = parent1;
    result[1] = parent2;
  }

  function _getInfo(uint256 _tokenId) private view returns (uint256[4] r1, uint32[2] r2, address owner) {
    uint256 toriDna;
    uint256 level;
    uint32 proficiency;
    uint32 personality;
    uint256 generation;
    uint256 special;
    (, toriDna, level, , proficiency, personality, , generation, special, , owner) = oldToriToken.getTokenInfo(_tokenId);

    r1[0] = toriDna;
    r1[1] = level;
    r1[2] = generation;
    r1[3] = special;

    r2[0] = proficiency;
    r2[1] = personality;
  }

  function transferTori(uint256 _tokenId, string name) external onlyOwner {
    uint256[4] memory r1;
    uint32[2] memory r2;
    address owner;
    (r1, r2, owner) = _getInfo(_tokenId);

    uint256[2] memory parents = _getParents(_tokenId);

    newToriToken.generateNewTori(r1[0],
                                 r1[1],
                                 r2[0],
                                 r2[1],
                                 parents[0],
                                 parents[1],
                                 name,
                                 owner,
                                 r1[2],
                                 r1[3]);
  }

  function getOldCount() public view returns (uint result) {
    result = oldToriToken.getAllTokensCount();
  }
}

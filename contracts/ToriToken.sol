pragma solidity ^0.4.21;

import './DnaCore.sol';

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol';
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/examples/RBACWithAdmin.sol';
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

//import 'openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol';
//import 'openzeppelin-solidity/contracts/ownership/rbac/RBACWithAdmin.sol';
//import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriToken is RBACWithAdmin, DnaCore, ERC721BasicToken {

  using SafeMath for uint256;

  struct Tori {
    uint256 dna;
    uint256 level;
    string name;
    uint32 proficiency;
    uint32 personality;
    uint32 readyTime;
    uint256 generation;
    uint256 special;
    // 0, 0 --> generation 1.
    uint256 parent1;
    uint256 parent2;
  }

  Tori[] toris;

  // toriId to price (in wei)
  mapping (uint => uint256) toriSale;
  uint256 toriSaleCount;

  event NewTori(address indexed _address, uint256 toriIdx);
  uint256 currentGeneration = 0;


  function updateGeneration() onlyAdmin public {
    currentGeneration = currentGeneration.add(1);
  }

  /*
  *   Generate random dna, personality, and proficiency level from
  *   the given quiz & sender address.
  */
  function _generateRandomTori(uint8[] _quizzes,
                               string _name,
                               address _owner,
                               uint256 _special) private view returns (Tori) {
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (dna, proficiency, personality) = _generateRandomTraits(_quizzes, _name, _owner);
    return Tori(dna, 1, _name, proficiency, personality, uint32(now), currentGeneration, _special, 0, 0);
  }

  function generateSpecialTori(uint8[] _quizzes,
                               string _name,
                               uint256 _special,
                               address _owner) onlyRole('promo') public returns (bool success) {
    Tori memory newTori = _generateRandomTori(_quizzes, _name, _owner, _special);
    // Push to the book keeping array.
    uint256 id = toris.push(newTori) - 1;
    _mint(_owner, id);

    emit NewTori(_owner, id);
    return true;
  }

  function _generateNewTori(uint256 _dna,
                            uint256 _level,
                            uint32 _proficiency,
                            uint32 _personality,
                            uint256 _parent1,
                            uint256 _parent2,
                            string _name,
                            address _owner,
                            uint256 _special,
                            uint256 _generation) private returns (bool success) {
    require((_dna / DNA_LIMIT == 0) &&
            (_proficiency >= 0) &&
            (_proficiency < PROFICIENCY_THRESHOLD.length) &&
            (_personality >= 0) &&
            (_personality < PERSONALITY_THRESHOLD.length));
    // Generate three new toris.
    Tori memory newTori = Tori(_dna,
                               _level,
                               _name,
                               _proficiency,
                               _personality,
                               uint32(now),
                               _generation,
                               _special,
                               _parent1,
                               _parent2);
    // Push to the book keeping array.
    uint256 id = toris.push(newTori) - 1;

    if (_owner == address(0)) {
      tokenOwner[id] = _owner;
    } else {
      _mint(_owner, id);
      emit NewTori(_owner, id);
    }
    return true;
  }

  function generateNewTori(uint256 _dna,
                           uint256 _level,
                           uint32 _proficiency,
                           uint32 _personality,
                           uint256 _parent1,
                           uint256 _parent2,
                           string _name,
                           address _owner,
                           uint256 _special,
                           uint256 _generation) onlyRole('visit') public returns (bool success) {
    return _generateNewTori(
      _dna,
      _level,
      _proficiency,
      _personality,
      _parent1,
      _parent2,
      _name,
      _owner,
      _special,
      _generation
    );
  }

  function generateNewTori(uint256 _dna,
                           uint256 _level,
                           uint32 _proficiency,
                           uint32 _personality,
                           uint256 _parent1,
                           uint256 _parent2,
                           string _name,
                           address _owner,
                           uint256 _special) onlyRole('visit') public returns (bool success) {
    return _generateNewTori(
      _dna,
      _level,
      _proficiency,
      _personality,
      _parent1,
      _parent2,
      _name,
      _owner,
      _special,
      currentGeneration
    );
  }

  function _burnTori(address _owner, uint256 _tokenId) onlyRole('visit') private returns (bool success) {
    // Check if for sale
    // TODO: remove it automatically for now.
    if (toriSale[_tokenId] > 0) {
      toriSale[_tokenId] = 0;
      toriSaleCount = toriSaleCount.sub(1);
    }
    _burn(_owner, _tokenId);
    // TODO: check if burn succeed
    return true;
  }

  function burnTori(address _owner, uint256 _tokenId) public returns (bool success) {
    return _burnTori(_owner, _tokenId);
  }

  function getTokenIndexes(address _owner) public view returns (uint[]) {
    uint size = ownedTokensCount[_owner];
    uint[] memory result = new uint[](size);

    uint idx = 0;
    for (uint i = 0; i < toris.length; i = i.add(1)) {
      if (tokenOwner[i] == _owner) {
        result[idx] = i;
        idx = idx.add(1);
      }
      if (idx >= size) {
        break;
      }
    }
    return result;
  }

  function getTokenIndexesWithMaxLevel(address _owner) public view returns (uint[], uint) {
    uint[] memory indexes = getTokenIndexes(_owner);
    uint maxLevel = 1;
    for (uint i = 0; i < indexes.length; i = i.add(1)) {
      uint currLevel = toris[indexes[i]].level;
      if (currLevel > maxLevel) {
        maxLevel = currLevel;
      }
    }
    return (indexes, maxLevel);
  }

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
                      address toriOwner) {
    Tori memory tori = toris[_toriId];
    toriId = _toriId;
    level = tori.level;
    toriDna = tori.dna;
    name = tori.name;
    proficiency = tori.proficiency;
    personality = tori.personality;
    readyTime = tori.readyTime;
    generation = tori.generation;
    special = tori.special;
    postingPrice = toriSale[_toriId];
    toriOwner = tokenOwner[_toriId];
  }

  function getParentIds(uint256 _tokenId) public view returns (uint256 parent1, uint256 parent2) {
    return (toris[_tokenId].parent1, toris[_tokenId].parent2);
  }

  function getTokenCount() public view returns (uint256 toriCount) {
    return ownedTokensCount[msg.sender];
  }

  function getAllTokensCount() public view returns (uint) {
    return toris.length;
  }


  // TODO: add functionality for users to change the sale price.
  function approveForSale(uint256 _tokenId, uint256 _salePrice) public onlyOwnerOf(_tokenId) {
    require((toriSale[_tokenId] == 0) && (_salePrice > 0));
    toriSale[_tokenId] = _salePrice;
    toriSaleCount = toriSaleCount.add(1);

    approve(this, _tokenId);
  }

  function removeForSale(uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    require(toriSale[_tokenId] > 0);
    toriSale[_tokenId] = 0;
    toriSaleCount = toriSaleCount.sub(1);

    clearApproval(msg.sender, _tokenId);
  }

  function buyForSale(uint256 _tokenId) public payable {
    // TODO: does msg.value needs to be exactly equal?
    require(isApprovedOrOwner(this, _tokenId) &&
            (toriSale[_tokenId] > 0) &&
            (msg.value >= toriSale[_tokenId]));

    address _from = ownerOf(_tokenId);
    // Send the ether.
    uint256 excess = msg.value.sub(toriSale[_tokenId]);
    if (excess > 0) {
      msg.sender.transfer(excess);
      _from.transfer(toriSale[_tokenId]);
    } else {
      _from.transfer(msg.value);
    }

    // Delete sale entry.
    toriSale[_tokenId] = 0;
    toriSaleCount = toriSaleCount.sub(1);

    // We want to call this from this contract.
    this.safeTransferFrom(_from, msg.sender, _tokenId);
  }

  function retrieveAllForSales() public view returns (uint[]) {
    uint[] memory result = new uint[](toriSaleCount);
    uint idx = 0;
    for (uint i = 0; i < toris.length; i = i.add(1)) {
      if (toriSale[i] > 0) {
        result[idx] = i;
        idx = idx.add(1);
      }
    }
    return result;
  }

  modifier minLevel(uint256 _tokenId, uint256 _minLevel) {
    require(toris[_tokenId].level >= _minLevel);
    _;
  }

  function updateName(uint256 _tokenId, string _newName) public onlyOwnerOf(_tokenId) minLevel(_tokenId, 4) returns (bool) {
    Tori storage tori = toris[_tokenId];
    tori.name = _newName;
    return true;
  }

  function updateTori(uint256 _tokenId,
                      string _name,
                      uint32 _proficiency,
                      uint32 _personality,
                      uint256 _special,
                      uint256 _minLevel) onlyRole('update') onlyOwnerOf(_tokenId) minLevel(_tokenId, _minLevel) public returns (bool result) {
    Tori storage tori = toris[_tokenId];
    tori.name = _name;
    tori.proficiency = _proficiency;
    tori.personality = _personality;
    tori.special = _special;
    return true;
  }
}

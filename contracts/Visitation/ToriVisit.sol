pragma solidity ^0.4.21;

import '../DnaCore.sol';

/* import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol'; */
/* import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol'; */

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriTokenInterface {
  function getTokenInfo(uint256 _toriId) public view returns
                    (uint256 toriId,
                      uint256 toriDna,
                      uint256 _level,
                      string name,
                      uint32 proficiency,
                      uint32 personality,
                      uint32 readyTime,
                      uint256 generation,
                      uint256 special,
                      uint postingPrice,
                      address toriOwner);

  function burnTori(address _owner, uint256 _tokenId) public returns (bool success);

  function generateNewTori(uint256 _dna,
                            uint256 _level,
                            uint32 _proficiency,
                            uint32 _personality,
                            uint256 _parent1,
                            uint256 _parent2,
                            string _name,
                            address _owner,
                            uint256 _special) public returns (bool success);

  function ownerOf(uint256 _tokenId) public view returns (address);
}

contract ToriVisit is DnaCore, Ownable {

  using SafeMath for uint256;

  ToriTokenInterface toriTokenInterface;
  // TODO change this!
  uint256 private TIME_LIMIT = 30 minutes;

  uint256 private BREED_RANDOMNESS = 4;
  uint256 private FUSE_RANDOMNESS = 0;

  mapping (uint256 => uint256) breedCount;

  struct VisitTicket {
    uint256 toriId;
    uint256 otherId;
    uint256 maxLevel;
    uint256 submitTime;
    address owner;
    bool claimed;
  }

  VisitTicket[] tickets;
  mapping (uint256 => address) ticketOwner;
  mapping (address => uint256) ticketCount;

  mapping (uint256 => bool) occupied;

  function setToriTokenAddress(address _address) external onlyOwner {
    toriTokenInterface = ToriTokenInterface(_address);
  }

  function _prepareFusion(uint256 _toriId, uint256 _otherToriId) private view returns (uint256 level, uint256 special) {
    uint256 price;
    address owner;
    (, , level, , , , , , special, price, owner) = toriTokenInterface.getTokenInfo(_toriId);
    uint256 otherLevel;
    uint256 otherPrice;
    address otherOwner;
    (, , otherLevel, , , , , , , otherPrice, otherOwner) = toriTokenInterface.getTokenInfo(_otherToriId);
    require((owner == msg.sender) &&
            (otherOwner == msg.sender) &&
            (level == otherLevel) &&
            (price == 0) &&
            (otherPrice == 0));
  }

  function fuseToris(uint256 _toriId, uint256 _otherToriId, string _name) public returns (bool success) {
    require(!occupied[_toriId] && !occupied[_otherToriId]);
    uint256 level;
    uint256 special;
    (level, special) = _prepareFusion(_toriId, _otherToriId);

    uint256 newDna;
    uint32 newProficiency;
    uint32 newPersonality;

    (newDna, newProficiency, newPersonality) = _combineTwoToris(_toriId,
                                                                _otherToriId,
                                                                _name,
                                                                FUSE_RANDOMNESS);

    success = toriTokenInterface.generateNewTori(
      newDna,
      level.add(1),
      newProficiency,
      newPersonality,
      _toriId,
      _otherToriId,
      _name,
      msg.sender,
      special);
    if (success) {
      // Burn the tokens
      // TODO: Evaluate gas
      success = toriTokenInterface.burnTori(msg.sender, _toriId);
      success = success && toriTokenInterface.burnTori(msg.sender, _otherToriId);

      // Check if success
      if (!success) {
        revert();
        return false;
      }
    } else {
      revert();
      return false;
    }
    return true;
  }

  function visit(uint256 _toriId, uint256 _otherToriId) public returns (uint256 id) {
    require(!(occupied[_toriId]));
    require((toriTokenInterface.ownerOf(_toriId) == msg.sender) &&
            (toriTokenInterface.ownerOf(_otherToriId) != msg.sender));
    // Get level information
    uint256 level;
    (, , level, , , , , , , ,) = toriTokenInterface.getTokenInfo(_toriId);
    uint256 otherLevel;
    (, , otherLevel, , , , , , , ,) = toriTokenInterface.getTokenInfo(_otherToriId);
    require(otherLevel <= level);
    id = tickets.push(VisitTicket(_toriId, _otherToriId,
                                  otherLevel, now,
                                  msg.sender, false)) - 1;

    ticketOwner[id] = msg.sender;
    ticketCount[msg.sender] = ticketCount[msg.sender].add(1);

    occupied[_toriId] = true;
    breedCount[_toriId] = breedCount[_toriId].add(1);
    // TODO: broadcast an event
  }

  function _getToriMaterials(uint256 _toriId) private view returns (uint256[3] result) {
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (, dna, , , proficiency, personality, , , , , ) = toriTokenInterface.getTokenInfo(_toriId);

    result[0] = dna;
    result[1] = uint256(proficiency);
    result[2] = uint256(personality);
  }

  function _combineTwoToris(uint256 _toriId,
                            uint256 _otherId,
                            string _name,
                            uint256 _threshold)
                            private view returns (uint256, uint32, uint32) {

     return _combineTwoTraits(_getToriMaterials(_toriId),
                              _getToriMaterials(_otherId),
                              _name,
                              msg.sender,
                              _threshold);
  }

  function _getTimeLimit(uint256 _toriId, uint256 _level) private view returns (uint256 limit) {
    limit = _level * TIME_LIMIT;

    uint256 divider = (_level - 1);
    if (divider == 0) {
      divider = 1;
    }
    limit = limit.add(breedCount[_toriId] * (limit / (divider * 10)));

    if (limit >= 3 days) {
      limit = 3 days;
    }
  }

  function claimTori(uint256 _ticketId, string _name) public returns (bool result) {
    VisitTicket storage ticket = tickets[_ticketId];
    uint256 timeLimit = _getTimeLimit(ticket.toriId, ticket.maxLevel);
    require((ticketOwner[_ticketId] == msg.sender) && (now.sub(ticket.submitTime)) >= timeLimit);
    uint256 newDna;
    uint32 newProficiency;
    uint32 newPersonality;

    (newDna, newProficiency, newPersonality) = _combineTwoToris(ticket.toriId,
                                                                ticket.otherId,
                                                                _name,
                                                                BREED_RANDOMNESS);

    // TODO decide on level
    result = toriTokenInterface.generateNewTori(
      newDna,
      _randomLevel(ticket.maxLevel, msg.sender),
      newProficiency,
      newPersonality,
      ticket.toriId,
      ticket.otherId,
      _name,
      msg.sender,
      0
    );
    if (result) {
      ticket.claimed = true;
      ticketCount[msg.sender] = ticketCount[msg.sender].sub(1);
      occupied[ticket.toriId] = false;
    } else {
      revert();
      return false;
    }

    return result;
  }

  function getTicketIndexes(address _owner) public view returns (uint[]) {
    uint size = ticketCount[_owner];
    uint[] memory result = new uint[](size);

    uint idx = 0;
    for (uint i = 0; i < tickets.length; i = i.add(1)) {
      if (ticketOwner[i] == _owner && !tickets[i].claimed) {
        result[idx] = i;
        idx = idx.add(1);
      }
      if (idx >= size) {
        break;
      }
    }
    return result;
  }

  function getToriTicket(address _owner, uint256 _toriId) public view returns (uint, bool found) {
    for (uint i = 0; i < tickets.length; i = i.add(1)) {
      if (ticketOwner[i] == _owner && !tickets[i].claimed && tickets[i].toriId == _toriId) {
        return (i, true);
      }
    }
    return (0, false);
  }

  function isOccupied(uint256 _tokenId) public view returns (bool result) {
    result = occupied[_tokenId];
  }

  function getTicketInfo(uint256 _ticketId) public view returns (uint256 toriId,
                                                                 uint256 otherId,
                                                                 uint256 maxLevel,
                                                                 uint256 submitTime,
                                                                 uint256 dueTime,
                                                                 address owner,
                                                                 bool claimed) {
    VisitTicket storage ticket = tickets[_ticketId];
    toriId = ticket.toriId;
    otherId = ticket.otherId;
    maxLevel = ticket.maxLevel;
    submitTime = ticket.submitTime;
    dueTime = submitTime.add(_getTimeLimit(toriId, maxLevel));
    owner = ticket.owner;
    claimed = ticket.claimed;
  }
}

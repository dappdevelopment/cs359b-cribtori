pragma solidity ^0.4.21;

import '../DnaCore.sol';

import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol';

contract ToriTokenInterface {
  function getTokenInfo(uint256 _toriId) public view returns
                    (uint256 toriId,
                      uint256 toriDna,
                      string name,
                      uint32 proficiency,
                      uint32 personality,
                      uint32 readyTime,
                      uint postingPrice,
                      address toriOwner);

  function burnTori(address _owner, uint256 _tokenId) public returns (bool success);

  function generateNewTori(uint256 _dna,
                            uint32 _proficiency,
                            uint32 _personality,
                            string _name,
                            address _owner) public returns (bool success);

  function ownerOf(uint256 _tokenId) public view returns (address);
}

contract ToriVisit is DnaCore, Ownable {

  using SafeMath for uint256;

  ToriTokenInterface toriTokenInterface;
  // TODO change this!
  uint256 private TIME_LIMIT = 5 minutes;

  struct VisitTicket {
    uint256 toriId;
    uint256 otherId;
    uint256 submitTime;
    uint256 dna;
    uint256 otherDna;
    uint32 proficiency;
    uint32 otherProficiency;
    uint32 personality;
    uint32 otherPersonality;
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

  function fuseToris(uint256 _toriId, uint256 _otherToriId, string _name) public returns (bool success) {
    require(toriTokenInterface.ownerOf(_toriId) == msg.sender &&
            toriTokenInterface.ownerOf(_otherToriId) == msg.sender &&
            !occupied[_toriId] && !occupied[_otherToriId]);
    // Get the dna, personality, and proficiency of each tori.
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (, dna, , proficiency, personality, , , ) = toriTokenInterface.getTokenInfo(_toriId);
    uint256 otherDna;
    uint32 otherProficiency;
    uint32 otherPersonality;
    (, otherDna, , otherProficiency, otherPersonality, , , ) = toriTokenInterface.getTokenInfo(_otherToriId);

    uint256 newDna;
    uint32 newProficiency;
    uint32 newPersonality;
    (newDna, newProficiency, newPersonality) = _combineTwoTraits(dna, proficiency,
                                                                 personality, otherDna,
                                                                 otherProficiency, otherPersonality,
                                                                 msg.sender);
    success = toriTokenInterface.generateNewTori(newDna, newProficiency, newPersonality, _name, msg.sender);
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
    require(toriTokenInterface.ownerOf(_toriId) == msg.sender &&
            toriTokenInterface.ownerOf(_otherToriId) != msg.sender &&
            !occupied[_toriId]);
    // Get the dna, personality, and proficiency of each tori.
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (, dna, , proficiency, personality, , , ) = toriTokenInterface.getTokenInfo(_toriId);
    uint256 otherDna;
    uint32 otherProficiency;
    uint32 otherPersonality;
    (, otherDna, , otherProficiency, otherPersonality, , , ) = toriTokenInterface.getTokenInfo(_otherToriId);

    id = tickets.push(VisitTicket(_toriId, _otherToriId,
                                  now, dna, otherDna,
                                  proficiency, otherProficiency,
                                  personality, otherPersonality,
                                  msg.sender, false)) - 1;

    ticketOwner[id] = msg.sender;
    ticketCount[msg.sender] = ticketCount[msg.sender].add(1);

    occupied[_toriId] = true;

    // TODO: broadcast an event
  }

  function claimTori(uint256 _ticketId, string _name) public returns (bool result) {
    VisitTicket storage ticket = tickets[_ticketId];
    require((ticketOwner[_ticketId] == msg.sender) && (now - ticket.submitTime) >= TIME_LIMIT);
    uint256 newDna;
    uint32 newProficiency;
    uint32 newPersonality;

    (newDna, newProficiency, newPersonality) = _combineTwoTraits(ticket.dna, ticket.proficiency,
                                                                 ticket.personality, ticket.otherDna,
                                                                 ticket.otherProficiency, ticket.otherPersonality,
                                                                 msg.sender);
    result = toriTokenInterface.generateNewTori(newDna, newProficiency, newPersonality, _name, msg.sender);
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
    for (uint i = 0; i < tickets.length; i++) {
      if (ticketOwner[i] == _owner && !tickets[i].claimed) {
        result[idx] = i;
        idx++;
      }
      if (idx >= size) {
        break;
      }
    }
    return result;
  }

  function getToriTicket(address _owner, uint256 _toriId) public view returns (uint, bool found) {
    for (uint i = 0; i < tickets.length; i++) {
      if (ticketOwner[i] == _owner && !tickets[i].claimed && tickets[i].toriId == _toriId) {
        return (i, true);
      }
    }
    return (0, false);
  }

  function getTicketInfo(uint256 _ticketId) public view returns (uint256 toriId,
                                                                uint256 otherId,
                                                                uint256 submitTime,
                                                                uint256 dueTime,
                                                                address owner,
                                                                bool claimed) {
    VisitTicket storage ticket = tickets[_ticketId];
    toriId = ticket.toriId;
    otherId = ticket.otherId;
    submitTime = ticket.submitTime;
    dueTime = submitTime + TIME_LIMIT;
    owner = ticket.owner;
    claimed = ticket.claimed;
  }
}

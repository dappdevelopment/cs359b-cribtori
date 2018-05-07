pragma solidity ^0.4.21;

import '../DnaCore.sol';

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

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
  uint256 private TIME_LIMIT = 5 * 60 * 1000;

  struct VisitTicket {
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

  function setToriTokenAddress(address _address) external onlyOwner {
    toriTokenInterface = ToriTokenInterface(_address);
  }

  function visit(uint256 _toriId, uint256 _otherToriId) public returns (uint256 id) {
    require(toriTokenInterface.ownerOf(_toriId) == msg.sender);
    // Get the dna, personality, and proficiency of each tori.
    uint256 dna;
    uint32 proficiency;
    uint32 personality;
    (, dna, , proficiency, personality, , , ) = toriTokenInterface.getTokenInfo(_toriId);
    uint256 otherDna;
    uint32 otherProficiency;
    uint32 otherPersonality;
    (, otherDna, , otherProficiency, otherPersonality, , , ) = toriTokenInterface.getTokenInfo(_otherToriId);

    id = tickets.push(VisitTicket(now, dna, otherDna, proficiency, otherProficiency,
                                  personality, otherPersonality,
                                  msg.sender, false)) - 1;

    ticketOwner[id] = msg.sender;
    ticketCount[msg.sender] = ticketCount[msg.sender].add(1);
  }

  function claimTori(uint256 _ticketId, string _name) public returns (bool result){
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
}

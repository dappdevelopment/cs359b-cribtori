pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';

contract ToriAccessories is ERC721, Ownable {

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


  /*
  ERC721 compliant functions
  */
  mapping (uint => address) accessoriesApprovals;

  modifier onlyOwnerOf(uint256 _tokenId) {
    require(accIndexToAddr[_tokenId] == msg.sender);
    _;
  }

  function name() public view returns (string _name) {
    return "Tori Accesories";
  }

  function symbol() public view returns (string _symbol) {
    return "TORIACC";
  }

  function balanceOf(address _owner) public view returns (uint256 _balance) {
    return addrToAccCount[_owner];
  }

  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
    return accIndexToAddr[_tokenId];
  }

  function _transfer(address _from, address _to, uint256 _tokenId) private {
    // Modify the counts.
    addrToAccCount[_to] += 1;
    addrToAccCount[msg.sender] -= 1;

    accIndexToAddr[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transfer(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    accessoriesApprovals[_tokenId] = _to;
    emit Approval(msg.sender, _to, _tokenId);
  }

  function takeOwnership(uint256 _tokenId) public {
    require(accessoriesApprovals[_tokenId] == msg.sender);
    address owner = ownerOf(_tokenId);
    _transfer(owner, msg.sender, _tokenId);
  }
}

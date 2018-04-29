pragma solidity ^0.4.21;

import './ToriAccessories.sol';
import './ERC721.sol';
/* import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol'; */

contract ToriAccessoriesOwnership is ToriAccessories, ERC721 {
  /*
  ERC721 compliant functions
  */
  mapping (uint => address) accessoriesApprovals;

  modifier onlyOwnerOf(uint256 _tokenId) {
    require(accIndexToAddr[_tokenId] == msg.sender);
    _;
  }

  function name() public view returns (string _name) {
    return "ToriAccesories";
  }

  function symbol() public view returns (string _symbol) {
    return "TORIACC";
  }

  function balanceOf(address _owner) external view returns (uint256 _balance) {
    return addrToAccCount[_owner];
  }

  function ownerOf(uint256 _tokenId) external view returns (address _owner) {
    return accIndexToAddr[_tokenId];
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable {
    // TODO:
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
    // TODO:
  }


  function _transfer(address _from, address _to, uint256 _tokenId) private {
    // Modify the counts.
    addrToAccCount[_to] += 1;
    addrToAccCount[msg.sender] -= 1;

    accIndexToAddr[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transferFrom(address _to, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    accessoriesApprovals[_tokenId] = _to;
    emit Approval(msg.sender, _to, _tokenId);
  }

  function setApprovalForAll(address _operator, bool _approved) external {
    // TODO
  }

  function getApproved(uint256 _tokenId) external view returns (address) {
    // TODO
    return msg.sender;
  }

  function isApprovedForAll(address _owner, address _operator) external view returns (bool) {
    // TODO
    return false;
  }


  function supportsInterface(bytes4 interfaceID) external view returns (bool) {
    // TODO
    return false;
  }
}

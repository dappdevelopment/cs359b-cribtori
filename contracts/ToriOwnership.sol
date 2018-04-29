pragma solidity ^0.4.21;

import './ToriToken.sol';
import './ERC721.sol';
/* import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol'; */

contract ToriOwnership is ToriToken, ERC721 {
  /*
  ERC721 compliant functions
  */
  mapping (uint => address) toriApprovals;

  modifier onlyOwnerOf(uint256 _tokenId) {
    require(toriIndexToAddr[_tokenId] == msg.sender);
    _;
  }

  function name() public view returns (string _name) {
    return "Tori Token";
  }

  function symbol() public view returns (string _symbol) {
    return "TORI";
  }

  function balanceOf(address _owner) external view returns (uint256 _balance) {
    return addrToToriCount[_owner];
  }

  function ownerOf(uint256 _tokenId) external view returns (address _owner) {
    return toriIndexToAddr[_tokenId];
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable {
    // TODO:
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
    // TODO:
  }


  function _transfer(address _from, address _to, uint256 _tokenId) private {
    // Modify the counts.
    addrToToriCount[_to] += 1;
    addrToToriCount[msg.sender] -= 1;

    toriIndexToAddr[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transferFrom(address _to, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    toriApprovals[_tokenId] = _to;
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
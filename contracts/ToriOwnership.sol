pragma solidity ^0.4.21;

import './ToriToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol';

contract ToriOwnership is ToriToken, ERC721Basic {
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

  function balanceOf(address _owner) public view returns (uint256 _balance) {
    return addrToToriCount[_owner];
  }

  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
    return toriIndexToAddr[_tokenId];
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public {
    // TODO:
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    public {
    // TODO:
  }


  function _transfer(address _from, address _to, uint256 _tokenId) private {
    // Modify the counts.
    addrToToriCount[_to] += 1;
    addrToToriCount[msg.sender] -= 1;

    toriIndexToAddr[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    _transfer(_from, _to, _tokenId);
  }

  function approve(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId) {
    toriApprovals[_tokenId] = _to;
    emit Approval(msg.sender, _to, _tokenId);
  }

  function setApprovalForAll(address _operator, bool _approved) public {
    // TODO
  }

  function getApproved(uint256 _tokenId) public view returns (address _operator) {
    // TODO
    return msg.sender;
  }

  function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
    // TODO
    return false;
  }

  function exists(uint256 _tokenId) public view returns (bool _exists) {
    // TODO
    return false;
  }


  // TODO: add functionality for users to change the sale price.
  function approveForSale(uint256 _tokenId, uint256 _salePrice) external payable onlyOwnerOf(_tokenId) {
    require((toriSale[_tokenId] == 0) && (_salePrice > 0));
    toriSale[_tokenId] = _salePrice;
    toriSaleCount += 1;
    // TODO: emit event here.
  }

  function removeForSale(uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
    require(toriSale[_tokenId] > 0);
    delete toriSale[_tokenId];
    toriSaleCount -= 1;
    // TODO: emit event here.
  }

  function buyForSale(uint256 _tokenId) external payable {
    require((toriSale[_tokenId] > 0) && (msg.value == toriSale[_tokenId]));
    address _from = toriIndexToAddr[_tokenId];
    _transfer(_from, msg.sender, _tokenId);
    // Send the ether.
    _from.transfer(msg.value);
    // Delete sale entry.
    delete toriSale[_tokenId];
    toriSaleCount -= 1;
    // TODO: emit event here.
  }

  function retrieveAllForSales() public view returns (uint[]) {
    uint[] memory result = new uint[](toriSaleCount);
    uint idx = 0;
    for (uint i = 0; i < toris.length; i++) {
      if (toriSale[i] > 0) {
        result[idx] = i;
        idx += 1;
      }
    }
    return result;
  }

}

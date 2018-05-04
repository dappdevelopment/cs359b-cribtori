pragma solidity ^0.4.21;

contract VarietyCore {

  uint32 private MATERIAL_TYPES = 4;
  uint32 private SPACE_TYPES = 2;

  uint256 private VARIETY_DIGIT = 10;
  uint256 private MATERIAL_DIGIT = 1;
  uint256 private SPACE_DIGIT = 2;

  uint256 private VARIETY_LIMIT = 10**VARIETY_DIGIT;
  uint256 private MATERIAL_LIMIT = 10**MATERIAL_DIGIT;
  uint256 private SPACE_LIMIT = 10**SPACE_DIGIT;
  uint256 private VARIETY_CUTOFF = 10**(SPACE_DIGIT);

  function _generateRandomVariety(address _owner, uint256 nonce)
                                internal view returns (uint256 variety,
                                                      uint32 material,
                                                      uint32 space){
    uint256 nameRandomness = uint(keccak256(now, _owner, nonce));
    uint256 ownerRandomness = uint(keccak256(now, _owner));

    uint256 varietyRandomness = uint(keccak256(nameRandomness, ownerRandomness));

    variety = varietyRandomness % VARIETY_LIMIT;

    material = uint32((variety % MATERIAL_LIMIT) % MATERIAL_TYPES);
    space = uint32(((variety % SPACE_LIMIT) / MATERIAL_LIMIT) % SPACE_LIMIT);

    variety = variety / VARIETY_CUTOFF;
  }
}

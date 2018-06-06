pragma solidity ^0.4.21;

/* import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol'; */
/* import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/rbac/RBAC.sol'; */
/* import 'github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol'; */

import 'openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title RBACBurnableToken
 * Implementation follows closely from RBACMintableToken
 */
contract RBACBurnableToken is BurnableToken, RBAC, Ownable {
  /**
   * A constant role name for indicating burners.
   */
  string public constant ROLE_BURNER = "burner";

  /**
   * @dev override the Burnable token modifier to add role based logic
   */
  modifier hasBurnPermission() {
    checkRole(msg.sender, ROLE_BURNER);
    _;
  }

  /**
   * @dev add a burner role to an address
   * @param _burner address
   */
  function addBurner(address _burner) onlyOwner public {
    addRole(_burner, ROLE_BURNER);
  }

  /**
   * @dev remove a burner role from an address
   * @param _burner address
   */
  function removeBurner(address _burner) onlyOwner public {
    removeRole(_burner, ROLE_BURNER);
  }

  function burnRBAC(
    address _who,
    uint256 _value
  ) hasBurnPermission
    public
  {
    _burn(_who, _value);
  }
}

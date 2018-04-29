var ToriToken = artifacts.require("ToriToken");
var ToriOwnership = artifacts.require("ToriOwnership");
module.exports = function(deployer) {
  deployer.deploy(ToriToken);
  // deployer.deploy(ToriOwnership, {gas: 20000000});
};

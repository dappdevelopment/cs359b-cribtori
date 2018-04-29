// var ToriAccessories = artifacts.require("ToriAccessories");
var ToriAccessoriesOwnership = artifacts.require("ToriAccessoriesOwnership");
module.exports = function(deployer) {
    deployer.deploy(ToriAccessoriesOwnership);
};

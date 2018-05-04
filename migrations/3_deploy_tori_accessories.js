var WoodenCabinet = artifacts.require("WoodenCabinet");
var WoodenDesk = artifacts.require("WoodenDesk");
module.exports = function(deployer) {
    deployer.deploy(WoodenCabinet);
    deployer.deploy(WoodenDesk);
};

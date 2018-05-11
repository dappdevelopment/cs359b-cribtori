var WoodenCabinet = artifacts.require("WoodenCabinet");
var WoodenDesk = artifacts.require("WoodenDesk");
var WoodenStool = artifacts.require("WoodenStool");
module.exports = function(deployer) {
    deployer.deploy(WoodenCabinet);
    deployer.deploy(WoodenDesk);
    deployer.deploy(WoodenStool);
};

var WoodenCabinet = artifacts.require("WoodenCabinet");
var WoodenDesk = artifacts.require("WoodenDesk");
var WoodenStool = artifacts.require("WoodenStool");
var ClothCushion = artifacts.require("ClothCushion");
var WoodenBed = artifacts.require("WoodenBed");
module.exports = function(deployer) {
    deployer.deploy(WoodenCabinet);
    deployer.deploy(WoodenDesk);
    deployer.deploy(WoodenStool);
    deployer.deploy(ClothCushion);
    deployer.deploy(WoodenBed);
};

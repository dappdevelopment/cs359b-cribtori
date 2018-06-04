var ClothCushion = artifacts.require("ClothCushion");
var FoosballTable = artifacts.require("FoosballTable");
var PottedPlant = artifacts.require("PottedPlant");
var StandardTv = artifacts.require("StandardTv");
var WoodenBed = artifacts.require("WoodenBed");
var WoodenCabinet = artifacts.require("WoodenCabinet");
var WoodenDesk = artifacts.require("WoodenDesk");
var WoodenStool = artifacts.require("WoodenStool");
var WoodenTable = artifacts.require("WoodenTable");

module.exports = function(deployer) {
  deployer.deploy(ClothCushion);
  deployer.deploy(FoosballTable);
  deployer.deploy(PottedPlant);
  deployer.deploy(StandardTv);
  deployer.deploy(WoodenBed);
  deployer.deploy(WoodenCabinet);
  deployer.deploy(WoodenDesk);
  deployer.deploy(WoodenStool);
  deployer.deploy(WoodenTable);
};

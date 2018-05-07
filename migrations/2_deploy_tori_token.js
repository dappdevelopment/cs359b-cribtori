var ToriToken = artifacts.require("ToriToken");
var ToriVisit = artifacts.require("ToriVisit");
module.exports = function(deployer) {
  deployer.deploy(ToriToken)
  .then(() => {
    return deployer.deploy(ToriVisit)
  })
  .then(() => {
    return deployer.deploy(ToriVisit)
  })
  .then(() => {
    return ToriToken.deployed();
  })
  .then((toriInstance) => {
    console.log('ToriVisit:', ToriVisit.address);
    return toriInstance.addAddressToWhitelist(ToriVisit.address);
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriVisit.deployed();
  })
  .then((visitInstance) => {
    console.log('ToriToken:', ToriToken.address);
    return visitInstance.setToriTokenAddress(ToriToken.address)
  })
  .then(() => {
    console.log('Done');
  });
};

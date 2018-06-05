var ToriToken = artifacts.require("ToriToken");
var ToriVisit = artifacts.require("ToriVisit");
var ToriSimplePromo = artifacts.require("ToriSimplePromo");

module.exports = function(deployer) {
  deployer.deploy(ToriToken)
  .then(() => {
    return deployer.deploy(ToriVisit)
  })
  .then(() => {
    return deployer.deploy(ToriSimplePromo)
  })
  .then(() => {
    return ToriToken.deployed();
  })
  .then((toriInstance) => {
    console.log('ToriVisit:', ToriVisit.address);
    return toriInstance.addAddressToWhitelist(ToriVisit.address)
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriToken.deployed();
  })
  .then((toriInstance) => {
    console.log('ToriSimplePromo:', ToriSimplePromo.address);
    return toriInstance.addAddressToWhitelist(ToriSimplePromo.address)
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
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriSimplePromo.deployed();
  })
  .then((promoInstance) => {
    console.log('ToriToken:', ToriToken.address);
    return promoInstance.setToriTokenAddress(ToriToken.address)
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriSimplePromo.deployed();
  })
  .then((promoInstance) => {
    console.log('ToriToken:', ToriToken.address);
    return promoInstance.addPromoCode("Cryptotrees", 30, 1);
  })
  .then((result) => {
    if (result) {
      console.log('Success in adding promo code');
    }
    console.log('Done');
  });
};

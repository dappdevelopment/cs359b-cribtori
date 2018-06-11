var ToriToken = artifacts.require("ToriToken");
var ToriVisit = artifacts.require("ToriVisit");
var ToriSimplePromo = artifacts.require("ToriSimplePromo");
var ToriTransfer = artifacts.require("ToriTransfer");

module.exports = function(deployer) {

  let toriInstance;
  let visitInstance;
  let promoInstance;
  let transferInstance;

  let oldAddress;
  let newAddress;

  let count;

  deployer.deploy(ToriToken)
  .then(() => {
    return deployer.deploy(ToriVisit)
  })
  .then(() => {
    return deployer.deploy(ToriSimplePromo)
  })
  .then(() => {
    return deployer.deploy(ToriTransfer)
  })
  .then(() => {
    return ToriToken.deployed();
  })
  .then((instance) => {
    console.log('ToriVisit:', ToriVisit.address);
    toriInstance = instance;
    return toriInstance.adminAddRole(ToriVisit.address, 'visit')
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    console.log('ToriSimplePromo:', ToriSimplePromo.address);
    return toriInstance.adminAddRole(ToriSimplePromo.address, 'promo')
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriVisit.deployed();
  })
  .then((instance) => {
    console.log('ToriToken:', ToriToken.address);
    visitInstance = instance;
    oldAddress = ToriToken.address;
    return visitInstance.setToriTokenAddress(ToriToken.address)
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    return ToriSimplePromo.deployed();
  })
  .then((instance) => {
    console.log('ToriToken:', ToriToken.address);
    promoInstance = instance;
    return promoInstance.setToriTokenAddress(ToriToken.address)
  })
  .then((result) => {
    if (result) {
      console.log('Success in whitelisting');
    }
    console.log('ToriToken:', ToriToken.address);
    return promoInstance.addPromoCode("Cryptotrees", 30, 1);
  })
  .then((result) => {
    if (result) {
      console.log('Success in adding promo code');
    }
    return ToriTransfer.deployed()
  })
  .then((instance) => {
    // 0xce269fc6daf688ddc615ef3b6d0c8a4eb2f25e61
    transferInstance = instance;
    return transferInstance.setOldAddress(oldAddress);
  })
  .then((result) => {
    return toriInstance.adminAddRole(ToriTransfer.address, 'visit')
  })
  .then((result) => {
    return deployer.deploy(ToriToken);
  })
  .then(() => {
    return ToriToken.deployed()
  })
  .then((instance) => {
    toriInstance = instance;
    newAddress = ToriToken.address;
    return toriInstance.adminAddRole(ToriTransfer.address, 'visit');
  })
  .then((result) => {
    console.log('Success in setting old address');
    return transferInstance.setNewAddress(ToriToken.address);
  })
  .then((result) => {
    console.log('Success in setting new address');
    return transferInstance.getOldCount()
  })
  .then((result) => {
    count = result.toNumber();
    console.log('Starting transfer of ' + count + ' Toris');

    let countLst = [];
    for (let i = 0; i < count; i++) countLst.push(i);

    Promise.all(countLst.map((c) => {
      return toriInstance.getTokenInfo(c);
    }))
    .then((results) => {
      let names = results.map((r) => { return r[3] });

      Promise.all(names.map((n, i) => {
        console.log(n, i)
        return transferInstance.transferTori(i, n);
      }))
      .then((results) => {
        console.log('SUCCESS', results);
      })
    });
  });
};

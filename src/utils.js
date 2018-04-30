/* TORI TOKEN */
export function retrieveToriInfo(contract, id) {
  return contract.getToriInfo.call(id);
}

export function retrieveToriCount(contract) {
  return contract.getToriCount.call();
}

export function retrieveAllToriCount(contract) {
  return contract.getAllToriCount.call();
}

export function retrieveToriIndexes(contract, addr) {
  return contract.getToriIndexes.call(addr);
}

export function generateNewTori(contract, quiz, name, addr) {
  return contract.generateNewTori(quiz, name, { from: addr });
}



/* TORI ACCESSORIES */
export function retrieveAccInfo(contract, id) {
  return contract.getAccessoriesInfo.call(id);
}

export function retrieveAccCount(contract) {
  return contract.getAccessoriesCount.call();
}

export function retrieveAllAccCount(contract) {
  return contract.getAllAccessoriesCount.call();
}

export function retrieveAccIndexes(contract, addr) {
  return contract.getAccessoriesIndexes.call(addr);
}

export function generateNewAccessories(contract, quiz, addr) {
  return contract.generateNewAccessories(quiz, { from: addr });
}


/* TORI SALE */
export function postToriForSale(contract, id, price, addr) {
  return contract.approveForSale(id, price, {from: addr});
}

export function removeToriForSale(contract, id, addr) {
  return contract.removeToriForSale(id, {from: addr});
}

export function buyTori(contract, id, price, addr) {
  return contract.buyToriForSale(id, {from: addr, value: price});
}

export function retrieveAllTorisForSale(contract) {
  return contract.retrieveAllTorisForSale.call();
}

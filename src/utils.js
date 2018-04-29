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

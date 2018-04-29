export function retrieveToriInfo(contract, id) {
  return contract.getToriInfo.call(id);
}

export function retrieveToriCount(contract) {
  return contract.getToriCount.call();
}

export function retrieveAllToriCount(contract) {
  return contract.getAllToriCount.call();
}

export function retrieveToriIndexes(contract) {
  return contract.getToriIndexes.call();
}

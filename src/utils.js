export function retrieveToriInfo(contract, id) {
  return contract.getToriInfo.call(id);
}

export function retrieveToriCount(contract) {
  return contract.getToriCount.call();
}

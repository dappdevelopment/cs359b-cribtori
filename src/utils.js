export function retrieveTokenInfo(contract, id) {
  return contract.getTokenInfo.call(id);
}

export function retrieveTokenCount(contract) {
  return contract.getTokenCount.call();
}

export function retrieveAllToriCount(contract) {
  return contract.getAllTokensCount.call();
}

export function retrieveTokenIndexes(contract, addr) {
  return contract.getTokenIndexes.call(addr);
}


export function generateNewTori(contract, quiz, name, addr) {
  return contract.generateNewTori(quiz, name, { from: addr });
}

export function generateNewAccessories(contract, quiz, addr) {
  return contract.generateNewAccessories(quiz, { from: addr });
}


export function postTokenForSale(contract, id, price, addr) {
  return contract.approveForSale(id, price, {from: addr});
}

export function removeTokenForSale(contract, id, addr) {
  return contract.removeForSale(id, {from: addr});
}

export function buyTokenForSale(contract, id, price, addr) {
  return contract.buyForSale(id, {from: addr, value: price});
}

export function retrieveAllTokensForSale(contract) {
  return contract.retrieveAllForSales.call();
}

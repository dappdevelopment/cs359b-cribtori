export function retrieveTokenInfo(contract, id, addr) {
  return contract.getTokenInfo.call(id, {from: addr});
}

export function retrieveTokenCount(contract, addr) {
  return contract.getTokenCount.call({from: addr});
}

export function retrieveAllToriCount(contract, addr) {
  return contract.getAllTokensCount.call({from: addr});
}

export function retrieveTokenIndexes(contract, addr) {
  return contract.getTokenIndexes.call({from: addr});
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

export function retrieveAllTokensForSale(contract, addr) {
  return contract.retrieveAllForSales.call({from: addr});
}

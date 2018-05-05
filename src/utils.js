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
  return contract.getTokenIndexes.call(addr);
}


export function generateNewTori(contract, quiz, name, addr) {
  return contract.generateNewTori(quiz, name, { from: addr });
}


export function retrieveAllTokenInfo(contract) {
  return contract.retrieveAllInfo();
}

export function parseAccInfo(result) {
  let info = {
    name: result[0],
    symbol: result[1],
    variety: result[2],
    material: result[3],
    space: result[4].toNumber(),
    amount: result[5].toNumber(),
    price: result[6].toNumber(),
  }
  return info;
}

/* TORI TOKEN */
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

/* ACCESSORY TOKEN */
export function postAccForSale(contract, amount, price, addr) {
  return contract.approveForSale(amount, price, {from: addr});
}

export function removeAccForSale(contract, addr) {
  return contract.removeForSale({from: addr});
}

export function buyAccForSale(contract, owner, amount, price, addr) {
  return contract.buyForSale(owner, amount, {from: addr, value: price});
}

export function retrieveAllAccsForSale(contract, addr) {
  return contract.retrieveAllForSales.call({from: addr});
}

const PROFICIENCY = ['Talented', 'Fast-learner', 'Clumsy', 'Procastinator', 'None'];
const PERSONALITY = ['Optimistic', 'Irritable', 'Melancholic', 'Placid'];

// Parser
export function parseToriResult(result) {
  let toriId = result[0].toNumber();
  let toriDna = result[1].toNumber();
  let toriName = result[2];
  let toriProficiency = result[3].toNumber();
  let toriPersonality = result[4].toNumber();
  let toriReadyTime = result[5].toNumber();
  let toriSalePrice = result[6].toNumber();
  let toriOwner = result[7];

  let toriInfo = {
    id: toriId,
    dna: toriDna,
    name: toriName,
    proficiency: toriProficiency,
    personality: toriPersonality,
    readyTime: toriReadyTime,
    salePrice: toriSalePrice,
    owner: toriOwner,
  }
  return toriInfo;
}

export function getProficiency(i) {
  return PROFICIENCY[i];
}

export function getPersonality(i) {
  return PERSONALITY[i];
}

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


export function generateInitialTori(contract, quiz, name, addr) {
  return contract.generateInitialTori(quiz, name, { from: addr });
}


export function retrieveAllTokenInfo(contract, addr) {
  return contract.retrieveAllInfo({ from: addr });
}


const MATERIALS = ['Wood', 'Cloth'];

export function parseAccInfo(result) {
  let info = {
    name: result[0],
    symbol: result[1],
    variety: result[2],
    material: result[3].map((m) => {return MATERIALS[m.toNumber()]}).join(', '),
    space: result[4].toNumber(),
    orientation: result[5].toNumber(),
    balance: result[6].toNumber(),
    amount: result[7].toNumber(),
    price: result[8].toNumber(),
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
  let toriLevel = result[2].toNumber();
  let toriName = result[3];
  let toriProficiency = result[4].toNumber();
  let toriPersonality = result[5].toNumber();
  let toriReadyTime = result[6].toNumber();
  let toriSalePrice = result[7].toNumber();
  let toriOwner = result[8];

  let toriInfo = {
    id: toriId,
    dna: toriDna,
    level: toriLevel,
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


export function retrieveRoomLayout(id) {
  return fetch('/cribtori/api/room/' + id)
  .then(function(response) {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
}


/* TORI VISIT */
export function fuseToris(contract, id, otherId, name, addr) {
  console.log(contract, id, otherId, name, addr)
  return contract.fuseToris(id, otherId, name, {from: addr});
}

export function visitTori(contract, id, otherId, addr) {
  return contract.visit(id, otherId, {from: addr});
}

export function claimTori(contract, ticketId, name, addr) {
  return contract.claimTori(ticketId, name, {from: addr});
}

export function getTicketIndexes(contract, addr) {
  return contract.getTicketIndexes(addr, {from: addr});
}

export function getToriTicket(contract, id, addr) {
  return contract.getToriTicket(addr, id, {from: addr});
}

export function getTicketInfo(contract, ticketId, addr) {
  return contract.getTicketInfo(ticketId, {from: addr});
}

export function parseTicketResult(result) {
  let toriId = result[0].toNumber();
  let otherId = result[1].toNumber();
  let submitTime = result[2].toNumber();
  let dueTime = result[3].toNumber();
  let owner = result[4];
  let claimed = result[5]; // TODO

  let ticketInfo = {
    toriId: toriId,
    otherId: otherId,
    submitTime: submitTime,
    dueTime: dueTime,
    owner: owner,
    claimed: claimed,
  }
  return ticketInfo;
}

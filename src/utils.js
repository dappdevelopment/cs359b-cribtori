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

export function retrieveTokenIndexesWithMaxLevel(contract, addr) {
  return contract.getTokenIndexesWithMaxLevel.call(addr);
}

export function changeToriName(contract, id, name, addr) {
  return contract.updateName(id, name, {from: addr});
}


export function retrieveAllTokenInfo(contract, addr) {
  return contract.retrieveAllInfo({ from: addr });
}


export function canChangeName(level) {
  return level >= 4;
}

export function canChangeGreetings(level) {
  return level >= 2;
}

export function getRoomSizes(maxLevel) {
  // TODO: refactor this.
  // 1 - 2: 3x2
  // 3 - 4: 3x3
  // 5 - ?: 3x4
  let sizes = [3, 2];
  if (maxLevel >= 5) {
    sizes[1] = 4;
  } else if (maxLevel >= 3) {
    sizes[1] = 3;
  }
  return sizes;
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
    rarity: result[6].toNumber(),
    balance: result[7].toNumber(),
    amount: result[8].toNumber(),
    price: result[9].toNumber(),
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
  let toriGeneration = result[7].toNumber();
  let toriSpecial = result[8].toNumber();
  let toriSalePrice = result[9].toNumber();
  let toriOwner = result[10];

  let toriInfo = {
    id: toriId,
    dna: toriDna,
    level: toriLevel,
    name: toriName,
    proficiency: toriProficiency,
    personality: toriPersonality,
    readyTime: toriReadyTime,
    generation: toriGeneration,
    special: toriSpecial,
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
  let maxLevel = result[2].toNumber();
  let submitTime = result[3].toNumber();
  let dueTime = result[4].toNumber();
  let owner = result[5];
  let claimed = result[6];

  let ticketInfo = {
    toriId: toriId,
    otherId: otherId,
    maxLevel: maxLevel,
    submitTime: submitTime,
    dueTime: dueTime,
    owner: owner,
    claimed: claimed,
  }
  return ticketInfo;
}


/* PROMO Utilities */
export function claimPromoCode(contract, quiz, name, addr, code) {
  return contract.claimCode(quiz, name, code, {from: addr});
}

export function claimInitialTori(contract, quiz, name, addr) {
  return contract.claimInitialTori(quiz, name, {from: addr});
}


/* HEARTS UTILITIES */
export function getBaseHearts(personality) {
  return 2.5;
}

export function activateTori(id, hearts) {
  return saveHearts(id, hearts, true);
}

export function deactivateTori(id, hearts) {
  return saveHearts(id, hearts, false);
}

export function saveHearts(id, hearts, active) {
  let data = {
    id: id,
    hearts: hearts,
    active: active,
  }
  return fetch('/cribtori/api/hearts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
  .then(function(response) {
    return response.status;
  });
}

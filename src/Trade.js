import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenInfo,
  retrieveAllTokensForSale,
  buyTokenForSale
} from './utils.js'

class Trade extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriSaleDisplay: [],
      accSaleDisplay: []
    };
    // this.context.toriToken
  }

  componentDidMount() {
    this.refreshDisplay();
  }

  refreshDisplay() {
    // Toris
    retrieveAllTokensForSale(this.context.toriToken)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []});

      toriIds.forEach(id => {
        retrieveTokenInfo(this.context.toriToken, id).then((result) => {
          this.setState({
            toriSaleDisplay: this.state.toriSaleDisplay.concat(this.constructToriSaleDisplay(result))
          });
        });
      });
    })
    // Accessories
    retrieveAllTokensForSale(this.context.accToken)
    .then((accIds) => {
      this.setState({accSaleDisplay: []});

      accIds.forEach(id => {
        retrieveTokenInfo(this.context.accToken, id).then((result) => {
          this.setState({
            accSaleDisplay: this.state.accSaleDisplay.concat(this.constructAccSaleDisplay(result))
          });
        });
      });
    })
  }

  buyForSale(tokenId, mode, e) {
    let contract = (mode === 'acc') ? this.context.accToken : this.context.toriToken;
    console.log('Buying:', tokenId, ' with mode: ', mode);
    buyTokenForSale(contract, tokenId, this.context.web3.toWei(1), this.context.userAccount)
    .then((result) => {
      console.log('After buying:', result);
      this.refreshDisplay();
    }).catch(console.error);
  }

  constructToriSaleDisplay(result) {
    // (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime)
    let toriId = result[0].toNumber();
    let toriDna = result[1].toNumber();
    let toriProficiency = result[2].toNumber();
    let toriPersonality = result[3].toNumber();
    let toriReadyTime = result[4].toNumber();
    let toriSalePrice = this.context.web3.fromWei(result[5].toNumber(), 'ether');

    let imgNum = parseInt(toriDna, 10) % 4 + 1;
    let imgName = 'mockimg/tori' + imgNum + '.png';
    return (
      <div key={toriId} className="toribox">
        <h3>Tori ID: {toriId} </h3>
        <img src={imgName} alt={'Tori for sale'} />
        <div className="tori-details">
          <span><label>DNA:</label> {toriDna} </span>
          <span><label>Proficiency:</label> {toriProficiency} </span>
          <span><label>Personality:</label> {toriPersonality} </span>
          <span><label>Ready Time:</label> {toriReadyTime} </span>
          <span><label>Is For Sale:</label> {toriSalePrice} ETH</span>
          <button onClick={(e) => this.buyToriSale(toriId, 'tori', e)}>Buy Tori</button>
        </div>
      </div>
    );
  }


  constructAccSaleDisplay(result) {
    // (_accId, acc.variety, acc.rarity, acc.space)
    let accId = result[0].toNumber();
    let accVariety = result[1].toNumber();
    let accRarity = result[2].toNumber();
    let accSpace = result[3].toNumber();
    let accSalePrice = this.context.web3.fromWei(result[4].toNumber(), 'ether');

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc.png';
    return (
      <div key={accId} className="accbox">
        <h3>Accessory ID: {accId} </h3>
        <img src={imgName} alt={'Accessory for sale'} />
        <div className="acc-details">
          <span><label>Variety:</label> {accVariety} </span>
          <span><label>Rarity:</label> {accRarity} </span>
          <span><label>Space:</label> {accSpace} </span>
          <span><label>Is For Sale:</label> {accSalePrice} ETH</span>
          <button onClick={(e) => this.buyForSale(accId, 'acc', e)}>Buy Accessory</button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="Trade">
        <h4>Toris For Sale</h4>
        <div id="tori-sale-display">
         {this.state.toriSaleDisplay}
        </div>
        <h4>Accessories For Sale</h4>
        <div id="acc-sale-display">
         {this.state.accSaleDisplay}
        </div>
      </div>
    );
  }
}

export default Trade

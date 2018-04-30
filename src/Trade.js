import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenCount,
  retrieveTokenInfo,
  retrieveAllTokensForSale,
  buyTokenForSale
} from './utils.js'

class Trade extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      toriSaleDisplay: []
    };
    // this.context.toriToken
  }

  componentDidMount() {
    this.refreshDisplay();
  }

  refreshDisplay() {
    retrieveAllTokensForSale(this.context.toriToken)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []});

      toriIds.map(id => {
        retrieveTokenInfo(this.context.toriToken, id).then((result) => {
          this.setState({
            toriSaleDisplay: this.state.toriSaleDisplay.concat(this.constructToriSaleDisplay(result))
          });
        });
      });
    })
  }

  buyToriForSale(toriId, e) {
    console.log('Buying:', toriId);
    buyTokenForSale(this.context.toriToken, toriId, this.context.web3.toWei(1), this.context.userAccount)
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

    let imgNum = parseInt(toriDna) % 4 + 1;
    let imgName = 'mockimg/tori' + imgNum + '.png';
    return (
      <div key={toriId} className="toribox">
        <h3>Tori ID: {toriId} </h3>
        <img src={imgName} />
        <div className="tori-details">
          <span><label>DNA:</label> {toriDna} </span>
          <span><label>Proficiency:</label> {toriProficiency} </span>
          <span><label>Personality:</label> {toriPersonality} </span>
          <span><label>Ready Time:</label> {toriReadyTime} </span>
          <span><label>Is For Sale:</label> {toriSalePrice} ETH</span>
          <button onClick={(e) => this.buyToriForSale(toriId, e)}>Buy Tori</button>
        </div>
      </div>
    );
  }

  render() {
    console.log(this.state.toriSaleDisplay)
    return (
      <div className="Trade">
        <h4>Toris For Sale</h4>
        <div id="tori-sale-display">
         {this.state.toriSaleDisplay}
        </div>
        <h4>Accessories For Sale</h4>
      </div>
    );
  }
}

export default Trade

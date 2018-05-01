import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenInfo,
  postTokenForSale,
  removeTokenForSale
} from './utils.js'

class ToriDetails extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {}

  }

  componentDidMount() {
    console.log('Tori Details for ID: ', this.props.toriId);
    retrieveTokenInfo(this.context.toriToken, this.props.toriId, this.context.userAccount).then((result) => {
      this.setState({
        toriDisplay: this.constructToriDisplay(result)
      });
    });
  }


  postToriForSale(toriId, e) {
    console.log('Posting:', toriId);
    postTokenForSale(this.context.toriToken, toriId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeToriForSale(toriId, e) {
    console.log('Revoking:', toriId);
    removeTokenForSale(this.context.toriToken, toriId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructToriDisplay(result) {
    // (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime)
    let toriId = result[0].toNumber();
    let toriDna = result[1].toNumber();
    let toriProficiency = result[2].toNumber();
    let toriPersonality = result[3].toNumber();
    let toriReadyTime = result[4].toNumber();
    let toriSalePrice = result[5].toNumber();

    // let imgNum = parseInt(toriDna, 10) % 4 + 1;
    let imgName = 'mockimg/tori-sample.png';
    return (
      <div key={toriId} className="toribox">
        <h3>Tori ID: {toriId} </h3>
        <img src={imgName} alt={'Tori'}/>
        <div className="tori-details">
          <span><label>DNA:</label> {toriDna} </span>
          <span><label>Proficiency:</label> {toriProficiency} </span>
          <span><label>Personality:</label> {toriPersonality} </span>
          <span><label>Ready Time:</label> {toriReadyTime} </span>
          <span><label>Is For Sale:</label> {toriSalePrice > 0 ? 'True' : 'False'} </span>
          {toriSalePrice > 0 ? (
            <button onClick={(e) => this.removeToriForSale(toriId, e)}>Revoke Sale Post</button>
          ) : (
            <button onClick={(e) => this.postToriForSale(toriId, e)}>Sell Tori</button>
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="tori-details-container">
        {this.state.toriDisplay}
        <div className="tori-action-container">
          <button>Feed</button>
          <button>Clean</button>
          <button>Play</button>
          <button>Craft</button>
          <button>Sell</button>
        </div>
      </div>
    );
  }
}

export default ToriDetails

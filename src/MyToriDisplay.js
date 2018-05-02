import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenCount,
  retrieveTokenInfo,
  retrieveTokenIndexes,
  generateNewTori,
  generateNewAccessories,
  postTokenForSale,
  removeTokenForSale
} from './utils.js'

import ToriDetails from './ToriDetails.js'

class MyToriDisplay extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriDisplay: [],
      currentTori: -1,
      detailIsShown: false,
    }

    this.generateInitToris = this.generateInitToris.bind(this);
    this.closeToriDetails = this.closeToriDetails.bind(this);
  }

  componentDidMount() {
    retrieveTokenCount(this.context.toriToken, this.context.userAccount)
    .then((result) => {
      console.log(result.toNumber());
      this.setState({isNewUser: result.toNumber() === 0})
      if (result.toNumber() > 0) {
        this.refreshToriDisplay();
      }
    })
  }

  refreshToriDisplay() {
    retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.toNumber()});
        this.setState({toriDisplay: []});

        toriIds.forEach(id => {
          retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))
            });
          });
        });
      }
    )
    .catch(console.error);
  }

  generateInitToris(e) {
    generateNewTori(this.context.toriToken, "test", "test", this.context.userAccount)
    .then((result) => {
      console.log('After generating new tori:', result);
      // Generate new accessories.
      generateNewAccessories(this.context.accToken, "test", this.context.userAccount)
      .then((result) => {
        console.log('After generating new accessories:', result);
      })
    })
    // .on("receipt", refreshToriDisplay)
    // .then(retrieveToriCount)
    // .catch(console.error);
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


  openToriDetails(toriId, e) {
    console.log("Showing details for:", toriId);
    this.setState({
      currentTori: toriId,
      detailIsShown: true,
    });
  }

  closeToriDetails() {
    console.log("Closing details for:", this.state.currentTori);
    this.setState({
      currentTori: -1,
      detailIsShown: false,
    });
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
        <img src={imgName} alt={'Tori'} onClick={(e) => this.openToriDetails(toriId, e)}/>
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
      <div className="tori-display-container">
        { this.state.detailIsShown &&
          <button className="back-button" onClick={this.closeToriDetails}>Back</button>
        }
        {this.state.isNewUser &&
          <button id="retrieve" onClick={this.generateInitToris}>Retrieve starter Toris</button>
        }
        <div id="tori-display">
          {this.state.detailIsShown ? (
            <ToriDetails toriId={this.state.currentTori} />
          ) : (
            this.state.toriDisplay
          )}
        </div>
      </div>
    );
  }
}

export default MyToriDisplay

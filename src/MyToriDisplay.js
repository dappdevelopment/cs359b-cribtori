import React, { Component, PropTypes } from 'react'

import {
  retrieveToriCount,
  retrieveToriInfo,
  retrieveToriIndexes,
  generateNewTori,
  generateNewAccessories
} from './utils.js'

class MyToriDisplay extends Component {
  static contextTypes = {
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriDisplay: [],
    }

    this.generateInitToris = this.generateInitToris.bind(this);
  }

  componentDidMount() {
    retrieveToriCount(this.context.toriToken)
    .then((result) => {
      this.setState({isNewUser: result.c[0] === 0})
      if (result.c[0] > 0) {
        this.refreshToriDisplay();
      }
    })
  }

  refreshToriDisplay() {
    retrieveToriIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.c[0]})
        this.setState({toriDisplay: []});

        toriIds.map(id => {
          retrieveToriInfo(this.context.toriToken, id).then((result) => {
            result = result.map((item) => {return item.c[0]});
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))
            });
          });
        });
      }
    ).catch(console.error);
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
    console.log(toriId);
  }


  constructToriDisplay(result) {
    // (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime)
    let toriId = result[0];
    let toriDna = result[1];
    let toriProficiency = result[2];
    let toriPersonality = result[3];
    let toriReadyTime = result[4];

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
          <button onClick={(e) => this.postToriForSale(toriId, e)}>Sell Tori</button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="tori-display-container">
        {this.state.isNewUser &&
          <button id="retrieve" onClick={this.generateInitToris}>Retrieve starter Toris</button>
        }
        <div id="tori-display">
         {this.state.toriDisplay}
        </div>
      </div>
    );
  }
}

export default MyToriDisplay

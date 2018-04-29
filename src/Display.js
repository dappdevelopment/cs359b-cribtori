import React, { Component } from 'react'

import { retrieveToriCount, retrieveToriInfo } from './utils.js'

class Display extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: this.props.web3,
      toriFactoryInstance: this.props.toriFactoryInstance,
      toriDisplay: [],
    }

    this.generateInitToris = this.generateInitToris.bind(this);
  }

  componentDidMount() {
    retrieveToriCount(this.state.toriFactoryInstance)
    .then((result) => {
      console.log('hello');
      this.setState({isNewUser: result.c[0] === 0})
      if (result.c[0] > 0) {
        this.refreshToriDisplay();
      }
    })
  }

  refreshToriDisplay() {
    this.state.toriFactoryInstance.getToriIds.call().then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.c[0]})
        console.log('Tori IDs: ', toriIds);
        this.setState({toriDisplay: []});

        toriIds.map(id => {
          retrieveToriInfo(this.state.toriFactoryInstance, id).then((result) => {
            result = result.map((item) => {return item.c[0]});
            console.log(result);
            this.setState({toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))});
            console.log(this.state.toriDisplay);
          });
        });
      }
    ).catch(console.error);
  }

  generateInitToris(e) {
    this.state.toriFactoryInstance.generateNewTori({ from: this.state.userAccount })
        .then((result) => {
          console.log(result);
        })
        // .on("receipt", refreshToriDisplay)
        // .then(retrieveToriCount)
        // .catch(console.error);
  }

  constructToriDisplay(result) {
    let toriId = result[0]
    let toriDna = result[1]
    let imgNum = parseInt(toriDna) % 4 + 1;
    let imgName = 'img/tori' + imgNum + '.png';
    return (
      <div key={toriId} className="toribox">
        <h3>Tori ID: {toriId} </h3>
        <img src={imgName} />
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

export default Display

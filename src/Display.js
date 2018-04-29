import React, { Component, PropTypes } from 'react'

import {
  retrieveToriCount,
  retrieveToriInfo,
  retrieveToriIndexes
} from './utils.js'

class Display extends Component {
  static contextTypes = {
    toriToken: PropTypes.object,
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
    retrieveToriIndexes(this.context.toriToken)
    .then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.c[0]})
        console.log('Tori IDs: ', toriIds);
        this.setState({toriDisplay: []});

        toriIds.map(id => {
          retrieveToriInfo(this.context.toriToken, id).then((result) => {
            result = result.map((item) => {return item.c[0]});
            console.log(result);
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))
            });
            console.log(this.state.toriDisplay);
          });
        });
      }
    ).catch(console.error);
  }

  generateInitToris(e) {
    this.context.toriToken.generateNewTori("test", "test", { from: this.context.userAccount })
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

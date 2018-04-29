import React, { Component, PropTypes } from 'react'

import {
  retrieveAccCount,
  retrieveAccInfo,
  retrieveAccIndexes
} from './utils.js'

class Inventory extends Component {

  static contextTypes = {
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      inventoryDisplay: []
    };
  }

  componentDidMount() {
    retrieveAccCount(this.context.accToken)
    .then((result) => {
      // TODO: what if user sell all of his items?
      this.setState({isNewUser: result.c[0] === 0})
      if (result.c[0] > 0) {
        this.refreshInventoryDisplay();
      }
    })
  }

  refreshInventoryDisplay() {
    retrieveAccIndexes(this.context.accToken, this.context.userAccount)
    .then(
      (accIds) => {
        accIds = accIds.map((id) => {return id.c[0]})
        this.setState({inventoryDisplay: []});

        accIds.map(id => {
          retrieveAccInfo(this.context.accToken, id).then((result) => {
            result = result.map((item) => {return item.c[0]});
            this.setState({
              inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(result))
            });
          });
        });
      }
    ).catch(console.error);
  }

  constructInventoryDisplay(result) {
    // (_accId, acc.variety, acc.rarity, acc.space)
    let accId = result[0];
    let accVariety = result[1];
    let accRarity = result[2];
    let accSpace = result[3];

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc.png';
    return (
      <div key={accId} className="accbox">
        <h3>Accessory ID: {accId} </h3>
        <img src={imgName} />
        <div className="acc-details">
          <span><label>Variety:</label> {accVariety} </span>
          <span><label>Rarity:</label> {accRarity} </span>
          <span><label>Space:</label> {accSpace} </span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="inventory-display-container">
        {this.state.isNewUser ? (
          <span>Generate your first Tori first!</span>
        ) : (
          <div id="inventory-display">
           {this.state.inventoryDisplay}
          </div>
        )}
      </div>
    );
  }

}

export default Inventory

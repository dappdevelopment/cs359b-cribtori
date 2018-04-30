import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenCount,
  retrieveTokenInfo,
  retrieveTokenIndexes,
  postTokenForSale,
  removeTokenForSale
} from './utils.js'

class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
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
    retrieveTokenCount(this.context.accToken, this.context.userAccount)
    .then((result) => {
      // TODO: what if user sell all of his items?
      this.setState({isNewUser: result.c[0] === 0})
      if (result.c[0] > 0) {
        this.refreshInventoryDisplay();
      }
    })
  }

  refreshInventoryDisplay() {
    retrieveTokenIndexes(this.context.accToken, this.context.userAccount)
    .then(
      (accIds) => {
        accIds = accIds.map((id) => {return id.c[0]})
        this.setState({inventoryDisplay: []});

        accIds.forEach(id => {
          retrieveTokenInfo(this.context.accToken, id, this.context.userAccount).then((result) => {
            this.setState({
              inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(result))
            });
          });
        });
      }
    ).catch(console.error);
  }


  postAccForSale(accId, e) {
    console.log('Posting:', accId);
    postTokenForSale(this.context.accToken, accId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeAccForSale(accId, e) {
    console.log('Revoking:', accId);
    removeTokenForSale(this.context.accToken, accId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructInventoryDisplay(result) {
    // (_accId, acc.variety, acc.rarity, acc.space)
    let accId = result[0].toNumber();
    let accVariety = result[1].toNumber();
    let accRarity = result[2].toNumber();
    let accSpace = result[3].toNumber();
    let accSalePrice = result[4].toNumber();

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc.png';
    return (
      <div key={accId} className="accbox">
        <h3>Accessory ID: {accId} </h3>
        <img src={imgName} alt={'Accessory'} />
        <div className="acc-details">
          <span><label>Variety:</label> {accVariety} </span>
          <span><label>Rarity:</label> {accRarity} </span>
          <span><label>Space:</label> {accSpace} </span>
          <span><label>Is For Sale:</label> {accSalePrice > 0 ? 'True' : 'False'} </span>
          {accSalePrice > 0 ? (
            <button onClick={(e) => this.removeAccForSale(accId, e)}>Revoke Sale Post</button>
          ) : (
            <button onClick={(e) => this.postAccForSale(accId, e)}>Sell Accessory</button>
          )}
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

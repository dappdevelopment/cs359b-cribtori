import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js'

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';

import AccImg from './mockimg/acc-sample.png'

import TradeDialog from './TradeDialog.js';

const cardStyle = {
  height: 200
}

class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      inventoryDisplay: [],
      inventoryTypes: [],
      usedInventories: {},
      dialogOpen: false,
    };

    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  componentDidMount() {
    // Get info on how many inventories have been used.
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.toNumber()});
        let iCounter = {};
        // Get info about each toris' layout
        let layoutPromises = toriIds.map((id) => {
          return util.retrieveRoomLayout(id)
        });
        Promise.all(layoutPromises)
        .then((results) => {
          results.forEach((res) => {
            if (res.tori_id !== undefined) {
              // Parse locations
              let locations = JSON.parse(res.locations);
              locations.forEach((l) => {
                if (iCounter[l.key]) {
                  iCounter[l.key] += 1;
                } else {
                  iCounter[l.key] = 1;
                }
              });
            }
          });
          this.setState({
            usedInventories: iCounter,
          });
        })
        .then(() => {
          this.context.accContracts.forEach((contract) => {
            // Get the info.
            let info;
            util.retrieveAllTokenInfo(contract)
            .then((result) => {
              info = util.parseAccInfo(result);
              contract.balanceOf(this.context.userAccount)
              .then((result) => {
                info.balance = result.toNumber();
                this.setState({
                  inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(contract, info))
                });
              })
            })
            .catch(console.error);
          });
        });
      }
    )
    .catch(console.error);
  }


  handleDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  handleDialogSubmit(contract, data) {
    if (data.price === 0 || data.amount === 0) {
      // TODO: show error
      console.log('Not valid amount or price');
    } else {
      util.postAccForSale(contract, data.amount, this.context.web3.toWei(data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        console.log('After posting:', result);
      }).catch(console.error);
    }
    this.setState({
      dialogOpen: false,
    })
  }

  postAccForSale(contract, accId, e) {
    this.setState({
      dialogOpen: true,
      currContract: contract
    })
  }

  removeAccForSale(contract, accId, e) {
    util.removeAccForSale(contract, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructInventoryDisplay(contract, info) {
    // TODO: implement image mapping.
    let imgName = AccImg;

    return (
      <Grid key={info.symbol} item sm={4}>
        <Card className="accbox">
          <CardHeader title={info.name} />
          <CardMedia
            image={imgName}
            title={'Accessory'}
            style={cardStyle}
            />
          <CardContent>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={info.variety} /></ListItem>
              <ListItem><ListItemText primary="Material:"/><ListItemText primary={info.material} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={info.space} /></ListItem>
              <ListItem><ListItemText primary="Amount:"/><ListItemText primary={info.balance} /></ListItem>
              { this.state.usedInventories[info.symbol] &&
                <ListItem><ListItemText primary={`${this.state.usedInventories[info.symbol]} Placed`}/></ListItem>
              }
              { info.price > 0 && (
                <ListItem><ListItemText primary={`${info.amount} For Sale`}/></ListItem>
              )}
            </List>
          </CardContent>
          <CardActions>
            {info.price > 0 ? (
              <Button variant="raised" color="primary" onClick={(e) => this.removeAccForSale(contract, info.id, e)}>
                Revoke Sale Post
              </Button>
            ) : (
              <Button variant="raised" color="primary" onClick={(e) => this.postAccForSale(contract, info.id, e)}>
                Sell Accessory
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  }

  render() {
    return (
      <div className="inventory-display-container">
        {this.state.isNewUser ? (
          <Typography variant="headline" gutterBottom>
            Generate your first Tori first!
          </Typography>
        ) : (
          <Grid container className="inventory-display"
                          spacing={8}
                          alignItems={'center'}
                          direction={'row'}
                          justify={'center'}>
            {this.state.inventoryDisplay}
          </Grid>
        )}
        <TradeDialog open={this.state.dialogOpen}
                     amountNeeded={true}
                     contract={this.state.currContract}
                     handleClose={this.handleDialogClose}
                     handleSubmit={this.handleDialogSubmit}/>
      </div>
    );
  }

}

export default Inventory

import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js';
import { assets } from './assets.js';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import TradeDialog from './TradeDialog.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  card: {
    maxWidth: 275,
    flexGrow: 1
  },
  inventoryImg: {
    width: `100%`,
  }
});

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
      openSnackBar: false,
    };

    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);

    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
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
            util.retrieveAllTokenInfo(contract, this.context.userAccount)
            .then((result) => {
              info = util.parseAccInfo(result);
              contract.balanceOf(this.context.userAccount)
              .then((result) => {
                info.balance = result.toNumber();
                if (info.balance !== 0) {
                  this.setState({
                    inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(contract, info))
                  });
                }
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

  handleDialogSubmit(contract, data, info) {
    if (data.price === 0 || data.amount === 0) {
      // TODO: show error
      this.handleMessage('Not valid amount or price');
    } else if (info.balance - this.state.usedInventories[info.symbol] < data.amount) {
      this.handleMessage('Insufficient amount. Check if placed.');
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

  postAccForSale(contract, item, e) {
    this.setState({
      dialogOpen: true,
      currContract: contract,
      currItem: item,
    })
  }

  removeAccForSale(contract, accId, e) {
    util.removeAccForSale(contract, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }

  handleCloseSnackBar() {
    this.setState({
      openSnackBar: false,
    });
  }

  handleMessage(message) {
    this.setState({
      openSnackBar: true,
      snackBarMessage: message,
    });
  }

  constructInventoryDisplay(contract, info) {
    let imgName = assets.accessories[info.symbol];

    let buttonDisabled = info.balance === this.state.usedInventories[info.symbol];
    return (
      <Grid key={info.symbol} item sm={4}>
        <Card className={this.props.classes.card}>
          <CardHeader title={info.name} />
          <CardContent>
            <img src={imgName} alt={info.name} className={this.props.classes.inventoryImg}/>
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
              <Button disabled={buttonDisabled} variant="raised" color="primary" onClick={(e) => this.postAccForSale(contract, info, e)}>
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
          <Grid container className={this.props.classes.root}
                          spacing={8}
                          alignItems={'flex-start'}
                          direction={'row'}
                          justify={'center'}>
            {this.state.inventoryDisplay}
          </Grid>
        )}
        <TradeDialog open={this.state.dialogOpen}
                     amountNeeded={true}
                     contract={this.state.currContract}
                     handleClose={this.handleDialogClose}
                     handleSubmit={this.handleDialogSubmit}
                     info={this.state.currItem}/>
         <Snackbar
           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
           open={this.state.openSnackBar}
           onClose={this.handleCloseSnackBar}
           SnackbarContentProps={{
             'aria-describedby': 'message-id',
           }}
           message={<span id="message-id">{this.state.snackBarMessage}</span>}
         />
      </div>
    );
  }

}

export default withStyles(styles)(Inventory)

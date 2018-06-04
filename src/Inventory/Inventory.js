import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import TokenInfo from '../Components/TokenInfo.js';
import TradeDialog from '../Components/TradeDialog.js';

import * as util from '../utils.js';

const styles = theme => ({
  title: {
    textAlign: 'center'
  },
  container: {
    padding: 32,
  },
  gridContainer: {
    width: '100%'
  }
});

class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);

    this.context = context;

    this.state = {
      toriItems: [],
      accItems: [],
      dialogOpen: false,
    }

    // Function BINDS
    this.retrieveAccessories = this.retrieveAccessories.bind(this);
    this.retrieveToris = this.retrieveToris.bind(this);
    this.initToriItems = this.initToriItems.bind(this);
    this.initAccessoryItem = this.initAccessoryItem.bind(this);
    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.postAccForSale = this.postAccForSale.bind(this);
    this.removeAccForSale = this.removeAccForSale.bind(this);
  }

  componentDidMount() {
    this.retrieveAccessories();
    this.retrieveToris();
  }

  retrieveAccessories() {
    this.setState({
      accItems: [],
    }, () => {
      this.context.accContracts.forEach((contract) => {
        contract.balanceOf(this.context.userAccount)
        .then((result) => {
          let balance = result.toNumber();
          if (balance !== 0) {
            this.initAccessoryItem(contract);
          }
        })
        .catch(console.error);
      });
    });
  }

  retrieveToris() {
    this.setState({
      toriItems: [],
    }, () => {
      util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
      .then((toriIds) => {
          toriIds = toriIds.map((id) => { return id.toNumber() });
          this.initToriItems(toriIds);
      })
      .catch(console.error);
    });
  }

  initToriItems(ids) {
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id}/>
        </Grid>
      );
    });
    this.setState({
      toriItems: items,
    });
  }

  initAccessoryItem(contract) {
    let item = (
      <Grid item sm={3} key={this.state.accItems.length}>
        <TokenInfo contract={contract}
                   onRevokeSale={this.removeAccForSale}
                   onPostSale={this.postAccForSale} />
      </Grid>
    );
    this.setState({
      accItems: this.state.accItems.concat(item),
    })
  }

  handleDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  handleDialogSubmit(contract, data, info) {
    if (data.price === 0 || data.amount === 0) {
      // TODO: show error
      this.context.onMessage('Not a valid amount or price');
    } else if (info.balance - info.used < data.amount) {
      this.context.onMessage('Insufficient amount. Check if accessories are currently placed in room.');
    } else {
      util.postAccForSale(contract, data.amount, this.context.web3.toWei(data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        if (!result) this.context.onMessage("Uh oh, something went wrong. Please try again later");
        this.context.onMessage("Posting accessory for sale in progress, TXHash: " + result.receipt.transactionHash);
        this.setState({
          dialogOpen: false,
        });
      }).catch(console.error);
    }
  }

  postAccForSale(contract, item, e) {
    this.setState({
      dialogOpen: true,
      currContract: contract,
      currItem: item,
    })
  }

  removeAccForSale(contract, e) {
    util.removeAccForSale(contract, this.context.userAccount)
    .then((result) => {
      this.context.onMessage("Revoking sale post in progress...")
    }).catch(console.error);
  }


  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        <Grid item sm={12}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Toris
            </Typography>
            <Divider/>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              { this.state.toriItems }
            </Grid>
          </div>
        </Grid>
        <Grid item sm={12} className={this.props.classes.gridContainer}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Accessories
            </Typography>
            <Divider/>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              { this.state.accItems }
            </Grid>
          </div>
        </Grid>
        <TradeDialog open={this.state.dialogOpen}
                     amountNeeded={true}
                     contract={this.state.currContract}
                     handleClose={this.handleDialogClose}
                     handleSubmit={this.handleDialogSubmit}
                     info={this.state.currItem}/>
      </Grid>
    );
  }
}

export default withStyles(styles)(Inventory)

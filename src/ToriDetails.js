import React, { Component } from 'react'
import PropTypes from 'prop-types';

import Snackbar from 'material-ui/Snackbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';
import List, { ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

import * as util from './utils.js';
import { assets } from './assets.js';

import ToriRoom from './ToriRoom.js'
import ToriActivityLogs from './ToriActivityLogs.js'
import TradeDialog from './TradeDialog.js';


const styles = theme => ({
  menuItem: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& $primary, & $icon': {
        color: theme.palette.common.white,
      },
    },
  },
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
  },
  primary: {},
  icon: {},
});

class ToriDetails extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    toriSiblings: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = {
      toriInfo: this.props.info,
      roomLayout: this.props.layout,
      dialogOpen: false,
      lastUpdate: new Date(),
    }

    this.feedTori = this.feedTori.bind(this);
    this.cleanTori = this.cleanTori.bind(this);
    this.playWithTori = this.playWithTori.bind(this);
    this.craftAccessory = this.craftAccessory.bind(this);

    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
  }


  handleDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  handleDialogSubmit(contract, data) {
    // TODO: show error message
    if (data.price === 0) {
      console.log('Not valid amount or price');
    } else {
      util.postTokenForSale(this.context.toriToken, this.state.currentTori, this.context.web3.toWei(data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        console.log('After posting:', result);
      }).catch(console.error);
    }
    this.setState({
      dialogOpen: false,
    })
  }

  postToriForSale(toriId, e) {
    console.log('Posting:', toriId);
    this.setState({
      dialogOpen: true,
    })
  }

  removeToriForSale(toriId, e) {
    console.log('Revoking:', toriId);
    util.removeTokenForSale(this.context.toriToken, toriId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }

  feedTori() {
    // Construct the POST body.
    let data = {
      id: this.state.toriInfo.id,
      activity_type: 'feed',
      description: '',
    };
    fetch('/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(function(response) {
      return response.status;
    })
    .then(function(status) {
      let message = 'Yum! ' + this.state.toriInfo.name + ' is full!';
      if (status === 406) {
        message = this.state.toriInfo.name + ' has been recently fed!';
      } else if (status === 400) {
        message = 'Feeding ' + this.state.toriInfo.name + ' failed, try again later';
      } else {
        // Tell activity logs to update.
        this.setState({
          lastUpdate: new Date(),
        });
      }
      this.props.onMessage(message);
    }.bind(this))
    .catch(console.err);
  }

  cleanTori() {
    // Construct the POST body.
    let data = {
      id: this.state.toriInfo.id,
      activity_type: 'clean',
      description: '',
    };
    fetch('/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(function(response) {
      return response.status;
    })
    .then(function(status) {
      let message = this.state.toriInfo.name + '\'s room is clean!';
      if (status === 406) {
        message = this.state.toriInfo.name + '\'s is still clean!';
      } else if (status === 400) {
        message = 'Cleaning ' + this.state.toriInfo.name + '\'s room failed, try again later';
      } else {
        this.setState({
          lastUpdate: new Date(),
        });
      }
      this.props.onMessage(message);
    }.bind(this))
    .catch(console.err);
  }

  playWithTori() {
    // TODO:
    console.log('Playing with tori...');
  }

  craftAccessory() {
    // TODO:
    console.log('Crafting accessory...');
  }

  visitTori() {
    console.log('Visit Tori');
  }


  constructToriActions() {
    return (
      <Paper className={this.props.classes.paper}>
        { this.props.isOther ? (
          <MenuList>
            <MenuItem onClick={this.visitTori}>Visit</MenuItem>
          </MenuList>
        ) : (
          <MenuList>
            <MenuItem onClick={this.feedTori}>Feed</MenuItem>
            <MenuItem onClick={this.cleanTori}>Clean</MenuItem>
            <MenuItem onClick={this.playWithTori}>Play</MenuItem>
            <MenuItem onClick={this.craftAccessory}>Craft</MenuItem>
            <Divider />
            <MenuItem onClick={this.switchEdit}>Edit Room</MenuItem>
            {this.state.salePrice > 0 ? (
              <MenuItem onClick={(e) => this.removeToriForSale(this.state.toriId, e)}>Revoke Sale Post</MenuItem>
            ) : (
              <MenuItem onClick={(e) => this.postToriForSale(this.state.toriId, e)}>Sell Tori</MenuItem>
            )}
          </MenuList>
        )}
      </Paper>
    );
  }


  render() {
    return (
      <Grid item sm={12}>
        <Grid container className="tori-details-container"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={3}>
            {!this.props.isOther && (
              <ToriActivityLogs toriId={this.state.toriInfo.id}
                                name={this.state.toriInfo.name}
                                lastUpdate={this.state.lastUpdate} />
            )}
          </Grid>
          <Grid item sm={6}>
            <ToriRoom dna={this.state.toriInfo.dna}
                      acc={this.state.accSelected}
                      onItemPlaced={this.onItemPlaced}
                      layout={this.state.roomLayout} />
          </Grid>
          <Grid item sm={3}>
            { this.constructToriActions() }
          </Grid>
        </Grid>
        <TradeDialog open={this.state.dialogOpen}
                     amountNeeded={false}
                     contract={this.context.toriToken}
                     handleClose={this.handleDialogClose}
                     handleSubmit={this.handleDialogSubmit}/>
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriDetails)

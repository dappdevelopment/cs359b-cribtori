import React, { Component } from 'react'
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

import * as util from './utils.js';
import { assets } from './assets.js';

import ToriRoom from './ToriRoom.js'


const styles = theme => ({
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
  },
});

class ToriEdit extends Component {
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
      inventoryItems: [],
      accSelected: {},
      usedInventories: {},
      isSelecting: false,
    }

    this.retrieveUsedInventories = this.retrieveUsedInventories.bind(this);
    this.saveEdit = this.saveEdit.bind(this);

    this.onUnselectItem = this.onUnselectItem.bind(this);
    this.onAccessorySelected = this.onAccessorySelected.bind(this);
    this.onItemPlaced = this.onItemPlaced.bind(this);
  }

  componentDidMount() {
    // Get the inventory list as well.
    this.context.accContracts.forEach((contract) => {
      // Get the info.
      let info;
      util.retrieveAllTokenInfo(contract, this.context.userAccount)
      .then((result) => {
        info = util.parseAccInfo(result);
        contract.balanceOf(this.context.userAccount)
        .then((result) => {
          info.balance = result.toNumber();
          this.setState({
            inventoryItems: this.state.inventoryItems.concat(info)
          }, this.retrieveUsedInventories);
        })
      });
    });
  }

  retrieveUsedInventories() {
    // Fetch all used inventories.
    let iCounter = {};
    // Get info about each toris' layout
    let layoutPromises = this.context.toriSiblings.map((id) => {
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
    });
  }

  saveEdit() {
    let layout = this.state.roomLayout;
    let data = {
      id: this.state.toriInfo.id,
      locations: JSON.stringify(layout),
    }
    fetch('/cribtori/room', {
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
      let message = 'New room layout saved!';
      if (status !== 200) {
        message = 'Failed in saving room layout. Please try again layer.'
      }
      this.props.onMessage(message);
      if (status === 200) {
        this.props.onSwitch();
      }
    }.bind(this))
    .catch(console.err);
  }

  onAccessorySelected(item, e) {
    this.setState({
      isSelecting: true,
      accSelected: item,
    });
  }

  onItemPlaced(layout, valid) {
    if (!valid) {
      this.props.onMessage('Not a valid placement');
      return;
    }
    // Filter tori.
    layout = layout.filter((l) => l.key !== 'tori');

    // Update the used inventory list by checking the differences between
    // the new layout and the old layout.
    let iCounter = {};
    this.state.roomLayout.forEach((l) => {
      if (!(iCounter[l.key])) iCounter[l.key] = 0;
      iCounter[l.key] -= 1;
    });
    layout.forEach((l) => {
      if (!(iCounter[l.key])) iCounter[l.key] = 0;
      iCounter[l.key] += 1;
    });
    let usedInventories = this.state.usedInventories;
    Object.keys(iCounter).forEach((symbol) => {
      if (!(usedInventories[symbol])) usedInventories[symbol] = 0;
      usedInventories[symbol] += iCounter[symbol];
    });
    this.setState({
      usedInventories: usedInventories,
      roomLayout: layout,
      accSelected: {},
      isSelecting: false,
    })
  }

  constructInventoryItem(info) {
    let imgName = assets.accessories[info.symbol];
    let amount = info.balance;
    if (this.state.usedInventories[info.symbol]) {
      amount -= this.state.usedInventories[info.symbol];
    }

    let item = {key: info.symbol,
                space: info.space,
                orientation: info.orientation,
                img: imgName};
    return (
      <MenuItem key={info.symbol} onClick={(e) => this.onAccessorySelected(item, e)}>
        <Avatar alt={info.name} src={imgName} />
        <Typography variant="caption" gutterBottom>
          {`x ${amount}`}
        </Typography>
        <ListItemText primary={`Space: ${info.space}`} />
      </MenuItem>
    );
  }

  onUnselectItem() {
    this.setState({
      isSelecting: false,
      accSelected: {},
    });
  }

  render() {
    return (
      <Grid item sm={12} >
        <Grid container className="tori-details-container"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={3}>
            { this.state.isSelecting && (
              <Chip
                avatar={<Avatar alt={this.state.accSelected.key} src={this.state.accSelected.img} />}
                label="Selected accessory"
                onDelete={this.onUnselectItem}
              />
            )}
            <List>
              {this.state.inventoryItems
                .filter((info) => (info.balance !== 0))
                .map((info) => this.constructInventoryItem(info))}
            </List>
          </Grid>
          <Grid item sm={6}>
            <ToriRoom dna={this.state.toriInfo.dna}
                      acc={this.state.accSelected}
                      onItemPlaced={this.onItemPlaced}
                      layout={this.state.roomLayout}
                      edit={true} />
          </Grid>
          <Grid item sm={3}>
            <Paper className={this.props.classes.paper}>
              <Button variant="raised" color="primary" onClick={this.saveEdit}>
                Save Room
              </Button>
              <Button variant="raised" color="secondary" onClick={this.props.onSwitch}>
                Cancel Edit
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriEdit)

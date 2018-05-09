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
      toriId: -1,
      isEditRoom: false,
      inventoryItems: [],
      accSelected: {},
      openSnackBar: false,
      newRoomLayout: [],
      roomLayout: [],
      usedInventories: {},
      dialogOpen: false,
    }

    this.saveEdit = this.saveEdit.bind(this);
    this.onAccessorySelected = this.onAccessorySelected.bind(this);
    this.onItemPlaced = this.onItemPlaced.bind(this);
  }

  componentDidMount() {
    // Get the inventory list as well.
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
            inventoryItems: this.state.inventoryItems.concat(info)
          });
        })
      });
    });
  }

  switchEdit() {
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
        isEditRoom: !this.state.isEditRoom,
        newRoomLayout: [],
        accSelected: {
          refresh: this.state.isEditRoom
        },
        usedInventories: iCounter,
      });
    });
  }

  saveEdit() {
    let layout = this.state.newRoomLayout;
    if (this.state.roomLayout !== this.state.newRoomLayout) {
      this.setState({
        roomLayout: this.state.newRoomLayout,
        newRoomLayout: [],
      });

      let data = {
        id: this.state.toriId,
        locations: JSON.stringify(layout),
      }
      fetch('/room', {
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
        this.setState({
          openSnackBar: true,
          snackBarMessage: message,
        });
      }.bind(this))
      .catch(console.err);
    }
    this.switchEdit();
  }

  onAccessorySelected(item, e) {
    this.setState({
      accSelected: item,
    });
  }

  onItemPlaced(layout) {
    // Filter the layout, only include key, col, row, space.
    // Filter tori as well.
    layout = layout.filter((l) => l.key !== 'tori');
    // TODO: remove this filter.
    layout = layout.map((l) => {
      return {
        key: l.key,
        c: l.c,
        r: l.r,
        s: l.s
      }
    });

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
      newRoomLayout: layout,
      accSelected: {},
    })
  }

  constructInventoryItem(info) {
    let imgName = assets.accessories[info.symbol];
    let amount = info.balance;
    if (this.state.usedInventories[info.symbol]) {
      amount -= this.state.usedInventories[info.symbol];
    }

    let item = {key: info.symbol, space: info.space, img: imgName};
    return (
      <MenuItem key={info.symbol} className={this.props.classes.menuItem} onClick={(e) => this.onAccessorySelected(item, e)}>
        <Avatar alt={info.name} src={imgName} />
        <Typography variant="caption" gutterBottom>
          {`x ${amount}`}
        </Typography>
        <ListItemText primary={`Space: ${info.space}`} />
      </MenuItem>
    );
  }

  render() {
    let tori = this.props.toriInfo;

    return (
      <Grid item sm={12} >
        <Grid container className="tori-details-container"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={3}>
            <List>
              {this.state.inventoryItems.map((info) => this.constructInventoryItem(info))}
            </List>
          </Grid>
          <Grid item sm={6}>
            <ToriRoom dna={tori.dna}
                      acc={this.state.accSelected}
                      onItemPlaced={this.onItemPlaced}
                      layout={this.state.roomLayout}
                      isEdit={true} />
          </Grid>
          <Grid item sm={3}>
            <Paper className={this.props.classes.paper}>
              <Button variant="raised" color="primary" onClick={this.saveEdit}>
                Save Room
              </Button>
              <Button variant="raised" color="secondary" onClick={this.switchEdit}>
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

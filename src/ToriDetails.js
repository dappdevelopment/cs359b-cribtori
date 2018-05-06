import React, { Component, PropTypes } from 'react'

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

import * as util from './utils.js'

import ToriRoom from './ToriRoom.js'
import ToriActivityLogs from './ToriActivityLogs.js'

import AccImg from './mockimg/acc-sample.png'


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
    userAccount: PropTypes.string
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
    }

    this.switchEdit = this.switchEdit.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    this.onAccessorySelected = this.onAccessorySelected.bind(this);
    this.onItemPlaced = this.onItemPlaced.bind(this);

    this.feedTori = this.feedTori.bind(this);
    this.cleanTori = this.cleanTori.bind(this);
    this.playWithTori = this.playWithTori.bind(this);
    this.craftAccessory = this.craftAccessory.bind(this);

    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.props.toriId, this.context.userAccount).then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        toriId: info.id,
        name: info.name,
        proficiency: info.proficiency,
        personality: info.personality,
        salePrice: info.salePrice,
        actionPaper: this.constructToriActions(),
      });
    });

    // Fetch the room layout.
    util.retrieveRoomLayout(this.props.toriId)
    .then((result) => {
      this.setState({
          roomLayout: JSON.parse(result.locations),
      });
    })
    .catch(console.error);

    // Get the inventory list as well.
    let inventoryList = [];
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
            inventoryItems: this.state.inventoryItems.concat(this.constructInventoryItem(info))
          });
        })
      });
    });
  }




  postToriForSale(toriId, e) {
    console.log('Posting:', toriId);
    util.postTokenForSale(this.context.toriToken, toriId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeToriForSale(toriId, e) {
    console.log('Revoking:', toriId);
    util.removeTokenForSale(this.context.toriToken, toriId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  switchEdit() {
    this.setState({
      isEditRoom: !this.state.isEditRoom,
      newRoomLayout: [],
      accSelected: {
        refresh: this.state.isEditRoom
      },
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
    console.log('Item is placed!', layout);
    // TODO: remove this filter.
    layout = layout.map((l) => {
      return {
        key: l.key,
        c: l.c,
        r: l.r,
        s: l.s
      }
    });
    this.setState({
      newRoomLayout: layout,
      accSelected: {},
    })
  }

  feedTori() {
    // Construct the POST body.
    let data = {
      id: this.state.toriId,
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
      let message = 'Yum! ' + this.state.name + ' is full!';
      if (status === 406) {
        message = this.state.name + ' has been recently fed!';
      } else if (status === 400) {
        message = 'Feeding ' + this.state.name + ' failed, try again later';
      }
      this.setState({
        openSnackBar: true,
        snackBarMessage: message,
      });
    }.bind(this))
    .catch(console.err);
  }

  cleanTori() {
    // Construct the POST body.
    let data = {
      id: this.state.toriId,
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
      let message = this.state.name + '\'s room is clean!';
      if (status === 406) {
        message = this.state.name + '\'s is still clean!';
      } else if (status === 400) {
        message = 'Cleaning ' + this.state.name + '\'s room failed, try again later';
      }
      this.setState({
        openSnackBar: true,
        snackBarMessage: message,
      });
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


  constructToriActions() {
    return (
      <Paper className={this.props.classes.paper}>
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
      </Paper>
    );
  }

  constructInventoryItem(info) {
    // TODO: implement image mapping.
    let imgName = AccImg;

    let item = {key: info.symbol, space: info.space, img: imgName};
    return (
      <MenuItem key={info.symbol} className={this.props.classes.menuItem} onClick={(e) => this.onAccessorySelected(item, e)}>
        <Avatar alt={info.name} src={imgName} />
        <Typography variant="caption" gutterBottom>
          {`x ${info.balance}`}
        </Typography>
        <ListItemText primary={`Space: ${info.space}`} />
      </MenuItem>
    );
  }

  handleCloseSnackBar() {
    this.setState({
      openSnackBar: false,
    });
  }


  render() {
    return (
      <Grid container className="tori-details-container"
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12}>
          <Typography variant="headline" gutterBottom>
            {this.state.name}
          </Typography>
        </Grid>
        <Grid item sm={3}>
          {this.state.isEditRoom ? (
            <List>
              {this.state.inventoryItems}
            </List>
          ) : (
            <ToriActivityLogs toriId={this.state.toriId} name={this.state.name} />
          )}
        </Grid>
        <Grid item sm={6}>
          {this.state.toriId !== -1 &&
            <ToriRoom acc={this.state.accSelected} onItemPlaced={this.onItemPlaced} layout={this.state.roomLayout}/>
          }
        </Grid>
        <Grid item sm={3}>
          {this.state.isEditRoom ? (
            <Paper className={this.props.classes.paper}>
              <Button variant="raised" color="primary" onClick={this.saveEdit}>
                Save Room
              </Button>
              <Button variant="raised" color="secondary" onClick={this.switchEdit}>
                Cancel Edit
              </Button>
            </Paper>
          ) : (
            this.state.actionPaper
          )}
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.openSnackBar}
          onClose={this.handleCloseSnackBar}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriDetails)

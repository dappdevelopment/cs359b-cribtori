import React, { Component, PropTypes } from 'react'

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
      accSelected: {}
    }

    this.switchEdit = this.switchEdit.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
    this.onAccessorySelected = this.onAccessorySelected.bind(this);

    this.feedTori = this.feedTori.bind(this);
    this.cleanTori = this.cleanTori.bind(this);
    this.playWithTori = this.playWithTori.bind(this);
    this.craftAccessory = this.craftAccessory.bind(this);
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
    });
  }

  saveEdit() {
    // TODO: save state to database.
    this.switchEdit();
  }

  onAccessorySelected(item, e) {
    this.setState({
      accSelected: item,
    });
  }

  feedTori() {
    // TODO:
    console.log('Feeding tori...');
  }

  cleanTori() {
    // TODO:
    console.log('Cleaning tori\'s room...');
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
            "Details"
          )}
        </Grid>
        <Grid item sm={6}>
          {this.state.toriId !== -1 &&
            <ToriRoom acc={this.state.accSelected}/>
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
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriDetails)

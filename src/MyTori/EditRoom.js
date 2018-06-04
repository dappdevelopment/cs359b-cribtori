import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Cancel from '@material-ui/icons/Cancel';
import Save from '@material-ui/icons/Save';

import Room from '../Components/Room.js';
import TokenItem from '../Components/TokenItem.js';
import ToriImage from '../Components/ToriImage.js';

import * as util from '../utils.js';
import { assets } from '../assets.js';


const styles = theme => ({
  grid: {
    padding: 50,
  },
  paper: {
    margin: '16px 32px 16px 0',
    padding: 16
  },
  paperBlue: {
    backgroundColor: theme.palette.primary.light,
  }
});

class EditRoom extends Component {

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
      loaded: false,
      isSelecting: false,
    }

    // FUNCTION BIND
    this.renderAvailableToris = this.renderAvailableToris.bind(this);
    this.renderAvailableAccessories = this.renderAvailableAccessories.bind(this);
    this.retrieveLayout = this.retrieveLayout.bind(this);
    this.constructChip = this.constructChip.bind(this);
    this.onItemSelected = this.onItemSelected.bind(this);
    this.onUnselectItem = this.onUnselectItem.bind(this);
    this.onItemPlaced = this.onItemPlaced.bind(this);
    this.onItemRemoved = this.onItemRemoved.bind(this);
    this.saveLayout = this.saveLayout.bind(this);
  }

  componentDidMount() {
    // Get all toris.
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      toriIds = toriIds.map((id) => { return id.toNumber() });

      this.setState({
        loaded: true,
        toriIds: toriIds,
      }, this.retrieveLayout);
    })
    .catch(console.error);

    // Get accessories.
    let accPromises = this.context.accContracts.map((contract) => { return contract.balanceOf(this.context.userAccount) });
    Promise.all(accPromises)
    .then((results) => {
      let activeContracts = [];
      results.forEach((balance, i) => {
        if (balance >= 0) activeContracts.push(this.context.accContracts[i]);
      });
      this.setState({
        accList: activeContracts,
      });
    });
  }

  retrieveLayout() {
    util.retrieveRoomLayout(this.context.userAccount)
    .then((result) => {
      let layout = (result.locations) ? JSON.parse(result.locations) : [];

      layout = layout.filter((l) => (l.key !== 'tori' || this.state.toriIds.indexOf(l.id) !== -1));

      // Check if layout is empty.
      if (layout.length === 0) {
        layout = layout.concat({
          // TODO: custom width and height
          c: 3 - Math.floor(2 / 2) - 1,
          r: 0,
          key: 'tori',
          id: this.state.toriIds[0],
        });
      }

      let activeToris = layout.map((item) => {
        if (item.key === 'tori') {
          return item.id;
        } else {
          return -1;
        }
      }).filter((item) => item !== -1);

      let activeAccs = {};
      layout.forEach((item) => {
        if (item.key !== 'tori') {
          if (activeAccs[item.key] === undefined) activeAccs[item.key] = 0;
          activeAccs[item.key] += 1;
        }
      });

      this.setState({
        roomLayout: layout,
        activeToris: activeToris,
        activeAccs: activeAccs
      });
    })
    .catch(console.error);
  }

  renderAvailableToris() {
    let content;
    if (this.state.toriIds && this.state.activeToris) {
      let activeToris = this.state.activeToris;

      content = this.state.toriIds.map((id) => {
        return (
          <TokenItem key={id}
                     id={id}
                     active={ activeToris }
                     onItemSelected={this.onItemSelected} />
        );
      });
    }

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Toris</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          { this.state.toriIds && this.state.activeToris ? (
            <List>
              { content }
            </List>
          ) : (
            <CircularProgress  color="secondary" />
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  renderAvailableAccessories() {
    let content;
    if (this.state.accList && this.state.activeAccs) {
      content = this.state.accList.map((contract, i) => {
        return (
          <TokenItem key={i}
                     contract={contract}
                     active={ this.state.activeAccs }
                     onItemSelected={this.onItemSelected} />
        );
      });
    }
    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Accessories</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          { this.state.accList && this.state.activeAccs ? (
            <List>
              { content }
            </List>
          ) : (
            <CircularProgress  color="secondary" />
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  onItemSelected(info, e) {
    if (info.symbol) {
      info.key = info.symbol;
    } else {
      info.key = 'tori';
      info.space = 1;
    }
    this.setState({
      isSelecting: true,
      selectedItem: info,
    });
  }

  onUnselectItem() {
    this.setState({
      isSelecting: false,
      selectedItem: {},
    });
  }

  constructChip() {
    let avatar;
    let label = this.state.selectedItem.name + ' selected';
    if (this.state.selectedItem.symbol) {
      // Accessory
      let img = assets.accessories[this.state.selectedItem.symbol];
      avatar = (<Avatar alt={this.state.selectedItem.key} src={img} />);
    } else {
      // Tori
      avatar = (
        <Avatar>
          T
        </Avatar>
      );
    }
    return (
      <Chip
        avatar={avatar}
        label={label}
        onDelete={this.onUnselectItem}
      />
    );
  }

  onItemPlaced(updatedLayout, item) {
    // Update the layout and active lists.
    let newLayout = updatedLayout;
    let newActiveToris = this.state.activeToris;
    let newActiveAccs = this.state.activeAccs;
    if (item.key === 'tori') {
      newActiveToris = newActiveToris.concat(item.id);
    } else {
      if (newActiveAccs[item.key] === undefined) newActiveAccs[item.key] = 0;
      newActiveAccs[item.key] += 1;
    }

    this.setState({
      isSelecting: false,
      selectedItem: {},
      roomLayout: newLayout,
      activeToris: newActiveToris,
      activeAccs: newActiveAccs,
    });
  }

  onItemRemoved(filteredLayout, item) {
    // Update the layout and active lists.
    let newLayout = filteredLayout;
    let newActiveToris = this.state.activeToris;
    let newActiveAccs = this.state.activeAccs;
    if (item.key === 'tori') {
      newActiveToris = newActiveToris.filter((id) => id !== item.id);
    } else {
      newActiveAccs[item.key] -= 1;
    }
    this.setState({
      roomLayout: newLayout,
      activeToris: newActiveToris,
      activeAccs: newActiveAccs,
    });
  }

  saveLayout() {
    // Check if there's at least one tori.
    let valid = this.state.roomLayout.filter((item) => item.key === 'tori').length > 0;

    if (!valid) {
      this.context.onMessage("Need to have at least ONE tori in the room.");
      return;
    }

    let data = {
      id: this.context.userAccount,
      locations: JSON.stringify(this.state.roomLayout),
    }
    fetch('/cribtori/api/room', {
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
      this.context.onMessage(message);
    }.bind(this))
    .catch(console.err);
  }

  render() {
    return (
      <Grid container className={this.props.classes.grid}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={3}>
          <Paper className={this.props.classes.paper + ' ' + this.props.classes.paperBlue}
                 elevation={4}>
            <Typography variant="title" color="inherit" component="h3">
              Items
            </Typography>
            { this.state.isSelecting && this.constructChip() }
            <Divider />
            { this.renderAvailableToris() }
            { this.renderAvailableAccessories() }
          </Paper>
        </Grid>
        <Grid item sm={6}>
          { (this.state.loaded && this.state.roomLayout && this.state.toriIds) ? (
            <Room width={3}
                  height={2}
                  layout={this.state.roomLayout}
                  firstTori={this.state.toriIds[0]}
                  selectedItem={this.state.selectedItem}
                  isEdit={true}
                  onItemPlaced={this.onItemPlaced}
                  onItemRemoved={this.onItemRemoved} />
          ) : (
            <CircularProgress  color="secondary" />
          )}
        </Grid>
        <Grid item sm={3}>
          <Paper className={this.props.classes.paper + ' ' + this.props.classes.paperBlue}
                 elevation={4}>
           <Typography variant="title" color="inherit" component="h3">
             Manual
           </Typography>
           <Divider />
           <Typography variant="body2" color="inherit">
             Veniam cupidatat et senserit, quo iis elit probant non qui eu praesentibus se
             doctrina amet commodo, officia ita labore mandaremus o summis commodo quo
             nostrud, sed nisi legam te appellat sed aut ubi quis malis veniam. Probant id
             minim, se sunt probant quibusdam te esse do pariatur an quis, irure o vidisse te
             eram. Qui quorum possumus imitarentur e magna coniunctione incididunt tamen
             incurreret.Iudicem ut elit proident, aute voluptate de amet aliqua, ad arbitror
             senserit.
           </Typography>
          </Paper>
          <Button variant="raised"
                  color="secondary"
                  component={Link}
                  to="/mytoris" >
            <Cancel /> Cancel Edit
          </Button>
          <Button variant="raised"
                  color="primary"
                  onClick={this.saveLayout} >
            <Save /> Save Layout
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(EditRoom))

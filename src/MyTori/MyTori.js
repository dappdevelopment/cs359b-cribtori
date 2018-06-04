import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import Status from '../Components/Status.js';
import Room from '../Components/Room.js';

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
  primary: {
    backgroundColor: theme.palette.primary.light,
  },
  secondary: {
    backgroundColor: theme.palette.secondary.light,
  },
  feed: {
    cursor: `url(${assets.food}), auto`,
  },
  clean: {
    cursor: `url(${assets.clean}), auto`,
  }
});

class MyTori extends Component {

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

    let acc = this.context.userAccount;
    let locationState = this.props.history.location.state
    if (locationState != null && locationState.account !== undefined) acc = locationState.account;

    this.state = {
      loaded: false,
      feeding: false,
      cleaning: false,
      userAccount: acc
    }

    // FUNCTION BIND
    this.renderActions = this.renderActions.bind(this);
    this.renderGrid = this.renderGrid.bind(this);
    this.retrieveLayout = this.retrieveLayout.bind(this);
    this.feedTori = this.feedTori.bind(this);
    this.feedingSwitch = this.feedingSwitch.bind(this);
    this.cleanTori = this.cleanTori.bind(this);
    this.cleaningSwitch = this.cleaningSwitch.bind(this);
    this.onToriClick = this.onToriClick.bind(this);
    this.postActivity = this.postActivity.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenIndexes(this.context.toriToken, this.state.userAccount)
    .then((toriIds) => {
      toriIds = toriIds.map((id) => { return id.toNumber() });

      this.setState({
        loaded: true,
        toriIds: toriIds,
      }, this.retrieveLayout);
    })
    .catch(console.error);
  }

  retrieveLayout() {
    util.retrieveRoomLayout(this.state.userAccount)
    .then((result) => {
      let layout = (result.locations) ? JSON.parse(result.locations) : [];

      // Need to filter out the layout.
      layout = layout.filter((l) => (l.key !== 'tori' || this.state.toriIds.indexOf(l.id) !== -1));

      // Check the layout. If the layout is empty, then this is the very first
      // time the user has ever visited their tori.
      // First, check if the user has any tori at all.
      if (layout.length === 0 && this.state.toriIds.length > 0) {
        // Okay, there's at least one tori. Let's default to this.
        // Let's save the layout for this one tori.
        // TODO: customizable width and height.
        layout.push({
          c: 3 - Math.floor(2 / 2) - 1,
          r: 0,
          key: 'tori',
          id: this.state.toriIds[0],
        });

        // Now, save the layout (silently)...
        let data = {
          id: this.state.userAccount,
          locations: JSON.stringify(layout),
        }
      }
      // Get active toris.
      let activeToris = layout.filter((l) => l.key === 'tori').map((l) => { return l.id; });
      this.setState({
        roomLayout: layout,
        activeToris: activeToris,
      });
    })
    .catch(console.error);
  }

  postActivity(id, type) {
    // Construct the POST body.
    util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount)
    .then((result) => {
      let info = util.parseToriResult(result);

      let data = {
        id: id,
        activity_type: type,
        description: '',
        info: info
      };

      fetch('/cribtori/api/activity', {
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
        // Get the name.
        let message;
        if (type === 'feed') {
          message = this.feedTori(info, status);
        } else {
          message = this.cleanTori(info, status);
        }

        let ids = this.state.toriIds;
        this.setState({
          feeding: false,
          cleaning: false,
          toriIds: []
        }, () => {
          this.setState({
            toriIds: ids
          });
        });
        this.context.onMessage(message);
      }.bind(this))
      .catch(console.error);
    })
    .catch(console.error);
  }

  feedTori(info, status) {
    let message = 'Yum! ' + info.name + ' is full!';
    if (status === 406) {
      message = info.name + ' has been recently fed!';
    } else if (status === 400) {
      message = 'Feeding ' + info.name + ' failed, try again later';
    }
    return message;
  }

  cleanTori(info, status) {
    let message = info.name + '\'s room is clean!';
    if (status === 406) {
      message = info.name + '\'s is still clean!';
    } else if (status === 400) {
      message = 'Cleaning ' + info.name + '\'s room failed, try again later';
    }
    return message;
  }

  feedingSwitch() {
    this.setState({
      feeding: !this.state.feeding,
      cleaning: false,
    });
  }

  cleaningSwitch() {
    this.setState({
      cleaning: !this.state.cleaning,
      feeding: false,
    });
  }

  onToriClick(id) {
    // Check if feeding or cleaning.
    if (this.state.feeding) {
      this.postActivity(id, 'feed');
    } else if (this.state.cleaning) {
      this.postActivity(id, 'clean');
    }
  }

  renderActions() {
    let feedingText = this.state.feeding ? 'Feed - Click again to cancel' : 'Feed';
    let cleaningText = this.state.cleaning ? 'Clean - Click again to cancel' : 'Clean';
    return (
      <MenuList>
        <MenuItem onClick={ this.feedingSwitch }>{ feedingText }</MenuItem>
        <MenuItem onClick={ this.cleaningSwitch }>{ cleaningText }</MenuItem>
        <MenuItem disabled >Craft</MenuItem>
        <Divider />
        <MenuItem component={Link}
                  to={'/mytoris/edit'}
                  className={ this.props.classes.primary }>
          Edit Room
        </MenuItem>
      </MenuList>
    );
  }

  renderGrid() {
    let actionCursor = (
      this.state.feeding ?
        this.props.classes.feed
      :
        this.state.cleaning ?
          this.props.classes.clean
        :
          ''
      );

    return (
      <Grid container className={this.props.classes.grid}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={3}>
          <Paper className={this.props.classes.paper}
                 elevation={4}>
            <Typography variant="title" color="inherit" component="h3">
              Status
            </Typography>
            <Divider />
            { this.state.activeToris && (
              <Status ids={this.state.activeToris}/>
            )}
          </Paper>
        </Grid>
        <Grid item sm={6} className={actionCursor}>
          { (this.state.loaded && this.state.roomLayout && this.state.toriIds) ? (
            <Room width={3}
                  height={2}
                  layout={this.state.roomLayout}
                  firstTori={this.state.toriIds[0]}
                  onToriClick={this.onToriClick} />
          ) : (
            <CircularProgress  color="secondary" />
          )}
        </Grid>
        <Grid item sm={3}>
          { this.state.userAccount === this.context.userAccount && (
            <Paper className={this.props.classes.paper}
                   elevation={4}>
              <Typography variant="title" color="inherit" component="h3">
                Actions
              </Typography>
              <Divider />
              { this.renderActions() }
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  }

  render() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.loaded) {
      if (this.state.toriIds.length === 0) {
        // TODO: show a more meaningful message
        content = (
          <Paper style={{
            padding: 20,
          }}>
            <Typography variant="title" color="inherit" component="h3" align="center">
              "Oh.. You don't have any Tori :( *sad*"
            </Typography>
          </Paper>
        );
      } else {
        content = this.renderGrid();
      }
    }
    return content;
  }
}

export default withStyles(styles)(withRouter(MyTori))

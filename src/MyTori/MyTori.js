import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

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
import IsometricRoom from '../Components/IsometricRoom.js';

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
  },
  roomWrapper: {
    textAlign: 'center'
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
      userAccount: acc,
      bubbles: {},
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
    // Get the tori indexes and room size.
    Promise.all([
      util.retrieveTokenIndexes(this.context.toriToken, this.state.userAccount),
      util.getRoomLimit(this.context.toriToken, this.state.userAccount)
    ])
    .then((results) => {
      let toriIds = results[0];
      let roomLimit = results[1].toNumber();

      toriIds = toriIds.map((id) => { return id.toNumber() });

      this.setState({
        loaded: true,
        toriIds: toriIds,
        size: util.getRoomSize(roomLimit),
        limit: roomLimit,
      }, this.retrieveLayout);
    })
    .catch(console.error);
  }

  retrieveLayout() {
    let layout = this.state.toriIds.map((id, i) => {
      let r = Math.floor(i / this.state.size);
      let c = i % this.state.size;
      return {
        c: c,
        r: r,
        key: 'tori',
        id: id
      }
    });
    this.setState({
      roomLayout: layout,
      activeToris: this.state.toriIds,
    })
    // util.retrieveRoomLayout(this.state.userAccount)
    // .then((result) => {
    //   let layout = (result.locations) ? JSON.parse(result.locations) : [];
    //
    //   // Need to filter out the layout.
    //   layout = layout.filter((l) => (l.key !== 'tori' || this.state.toriIds.indexOf(l.id) !== -1));
    //
    //   // Check the layout. If the layout is empty, then this is the very first
    //   // time the user has ever visited their tori.
    //   // First, check if the user has any tori at all.
    //   if (layout.length === 0 && this.state.toriIds.length > 0) {
    //     // Okay, there's at least one tori. Let's default to this.
    //     // Let's save the layout for this one tori.
    //     // TODO: customizable width and height.
    //     layout.push({
    //       c: this.state.sizes[0] - Math.floor(this.state.sizes[0] / 2) - 1,
    //       r: 0,
    //       key: 'tori',
    //       id: this.state.toriIds[0],
    //     });
    //
    //     // Now, save the layout (silently)...
    //     // let data = {
    //     //   id: this.state.userAccount,
    //     //   locations: JSON.stringify(layout),
    //     // }
    //   }
    //   // Get active toris.
    //   let activeToris = layout.filter((l) => l.key === 'tori').map((l) => { return l.id; });
    //   this.setState({
    //     roomLayout: layout,
    //     activeToris: activeToris,
    //   });
    // })
    // .catch(console.error);
  }

  postActivity(id, type) {
    /*
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

        let bubbles = this.state.bubbles;
        if (status === 200) {
          bubbles[id] = assets.reactions.smile;
        } else {
          bubbles[id] = assets.reactions.surprised;
        }

        let ids = this.state.toriIds;
        this.setState({
          feeding: false,
          cleaning: false,
          toriIds: [],
          bubbles: bubbles,
        }, () => {
          // Disable the bubble.
          setTimeout(function() {
            this.setState({
              bubbles: {}
            });
          }.bind(this), 1500);

          this.setState({
            toriIds: ids
          });
        });
        this.context.onMessage(message);
      }.bind(this))
      .catch(console.error);
    })
    .catch(console.error);
    */
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
    // TODO: <MenuItem disabled >Craft</MenuItem>
    return (
      <MenuList>
        <MenuItem onClick={ this.feedingSwitch }>{ feedingText }</MenuItem>
        <MenuItem onClick={ this.cleaningSwitch }>{ cleaningText }</MenuItem>
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

    /*
    { (this.state.loaded && this.state.roomLayout && this.state.toriIds) ? (
      <Room width={this.state.sizes[0]}
            height={this.state.sizes[1]}
            layout={this.state.roomLayout}
            firstTori={this.state.toriIds[0]}
            onToriClick={this.onToriClick}
            bubbles={this.state.bubbles} />
    ) : (
      <CircularProgress  color="secondary" />
    )}
    */

    return (
      <Grid container className={this.props.classes.grid}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12} className={actionCursor}>
          <div className={this.props.classes.roomWrapper}>
            <IsometricRoom toris={this.state.toriIds}
                           size={this.state.size}
                           limit={this.state.limit}/>
          </div>
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
              "Oh.. You don't have any Tori yet :("
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

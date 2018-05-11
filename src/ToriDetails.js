import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import { HeartHalfFull } from 'mdi-material-ui';

import * as util from './utils.js';

import ToriRoom from './ToriRoom.js'
import ToriActivityLogs from './ToriActivityLogs.js'
import TradeDialog from './TradeDialog.js';

const HEART_LIM = 5;

const styles = theme => ({
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
  },
  icon: {
    color: 'red',
  },
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

    let p = this.props.info.personality;

    this.state = {
      toriInfo: this.props.info,
      roomLayout: this.props.layout,
      dialogOpen: false,
      lastUpdate: new Date(),
      heartBase: (p % 3) === 0 ? (p === 0) ? 3 : 2 : p,
      heartAdjust: 0,
      logged: false,
    }

    this.feedTori = this.feedTori.bind(this);
    this.cleanTori = this.cleanTori.bind(this);
    this.playWithTori = this.playWithTori.bind(this);
    this.craftAccessory = this.craftAccessory.bind(this);

    this.adjustStatus = this.adjustStatus.bind(this);
    this.onToriClick = this.onToriClick.bind(this);

    this.constructHearts = this.constructHearts.bind(this);
    this.updateHearts = this.updateHearts.bind(this);

    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
  }

  componentDidMount() {
    // TODO: show error message
    fetch('/hearts/' + this.props.info.id)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(function(data) {
      if (data.hearts) {
        this.setState({
          heartBase: Math.max(data.hearts, 0),
        });
      }
    }.bind(this))
    .catch(console.err);
  }

  componentWillUnmount() {
    // TODO: handle error
    let h = this.state.heartBase + this.state.heartAdjust;
    h = Math.floor(h * 10) / 10;
    let data = {
      id: this.state.toriInfo.id,
      hearts: h,
    }
    fetch('/hearts', {
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
      let message = 'Hearts are stored!';
      if (status === 406) {
        message = this.state.toriInfo.name + ' forgots hearts';
      } else if (status === 400) {
        message = 'Saving ' + this.state.toriInfo.name + '\'s hearts failed, try again later';
      }
      this.props.onMessage(message);
    }.bind(this))
    .catch(console.err);
  }


  handleDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  handleDialogSubmit(contract, data, info) {
    if (data.price === 0) {
      this.props.onMessage('Not valid amount or price');
    } else {
      util.postTokenForSale(this.context.toriToken, this.state.toriInfo.id, this.context.web3.toWei(data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        console.log('After posting:', result);
        this.props.onMessage('Sale post transaction has been submitted');
      }).catch(console.error);
    }
    this.setState({
      dialogOpen: false,
    })
  }

  postToriForSale(toriId, e) {
    this.setState({
      dialogOpen: true,
    })
  }

  removeToriForSale(toriId, e) {
    util.removeTokenForSale(this.context.toriToken, toriId, this.context.userAccount)
    .then((result) => {
      console.log(result)
      console.log('After revoking:', result);
      this.props.onMessage('Revoke sale transaction has been submitted');
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
      this.updateHearts(1);
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
      this.updateHearts(1);
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

  onToriClick() {
    // TODO: Save this state to the DB
    this.updateHearts(0.05);
  }

  updateHearts(val) {
    let p = this.state.toriInfo.personality
    let prop;
    if (val > 0) {
      // Rise
      prop = p % 2 === 0 ? 1 : 0.5;
    } else {
      // Fall
      prop = p % 3 === 0 ? 0.5 : 1;
    }
    this.setState({
      heartAdjust: this.state.heartAdjust + prop * val,
    })
  }

  adjustStatus(timestamp) {
    if (!this.state.logged) {
      let now = new Date();
      let val = -5;
      if (timestamp.feed !== -1) {
        let feed = new Date(timestamp.feed);
        let diff = now - feed;
        if (diff >= 3 * 36e5) {
          val = -((diff / 36e5) - 3) * 0.1;
        } else {
          val = 0;
        }
      }
      this.setState({
        logged: false
      }, this.updateHearts(val));
    }
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
            <MenuItem onClick={this.props.onEdit}>Edit Room</MenuItem>
            {this.state.toriInfo.salePrice > 0 ? (
              <MenuItem onClick={(e) => this.removeToriForSale(this.state.toriInfo.id, e)}>Revoke Sale Post</MenuItem>
            ) : (
              <MenuItem onClick={(e) => this.postToriForSale(this.state.toriInfo.id, e)}>Sell Tori</MenuItem>
            )}
          </MenuList>
        )}
      </Paper>
    );
  }

  constructHearts() {
    let totalHearts = this.state.heartBase + this.state.heartAdjust;
    totalHearts = Math.max(Math.min(totalHearts, 5), 0);
    let hearts = [];
    for (var i = 0; i < Math.floor(totalHearts); i++) {
      hearts.push(
        <Favorite key={`heart_${i}`} className={this.props.classes.icon}/>
      );
    }
    if (totalHearts - Math.floor(totalHearts) > 0) {
      hearts.push(
        <HeartHalfFull key={`heart_${i}`} className={this.props.classes.icon}/>
      );
    }
    for (i = Math.ceil(totalHearts); i < HEART_LIM; i++) {
      hearts.push(
        <FavoriteBorder key={`heart_${i}`} className={this.props.classes.icon}/>
      );
    }
    return hearts;
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
                                lastUpdate={this.state.lastUpdate}
                                onFilled={this.adjustStatus} />
            )}
          </Grid>
          <Grid item sm={6}>
            <ToriRoom dna={this.state.toriInfo.dna}
                      edit={false}
                      acc={this.state.accSelected}
                      onItemPlaced={this.onItemPlaced}
                      layout={this.state.roomLayout}
                      handleToriClick={this.onToriClick} />
          </Grid>
          <Grid item sm={3}>
            { this.constructToriActions() }
          </Grid>
          <Grid item sm={6}>
            <Paper>
              <Typography variant="subheading" gutterBottom align="center">
                Status:
              </Typography>
              <Grid container className="tori-details-container"
                              spacing={8}
                              alignItems={'center'}
                              direction={'row'}
                              justify={'space-around'}>
                <Grid item sm={3}>
                  <Typography variant="body1" gutterBottom align="right">
                    Personality: { util.getPersonality(this.state.toriInfo.personality) }
                  </Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography variant="body1" gutterBottom align="center">
                    { this.constructHearts() }
                  </Typography>
                </Grid>
                <Grid item sm={3}>
                  <Typography variant="body1" gutterBottom align="left">
                    Proficiency: { util.getProficiency(this.state.toriInfo.proficiency) }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';

import ToriImage from '../Components/ToriImage.js';
import Hearts from '../Components/Hearts.js';
import TradeDialog from '../Components/TradeDialog.js';
import BuyInput from '../Components/BuyInput.js';
import LevelStepper from '../Components/LevelStepper.js';

import * as util from '../utils.js';

const styles = theme => ({
  grid: {
    padding: 50,
  },
  paper: {
    margin: '16px 32px 16px 32px',
    padding: 16
  },
  paperContainer: {
    padding: 16
  },
  primary: {
    backgroundColor: theme.palette.primary.light
  },
  secondary: {
    backgroundColor: theme.palette.secondary.light
  }
});


class ToriDetails extends Component {

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
      id: this.props.match.params.id,
      dialogOpen: false,
      name: '',
      isEditName: false,
      canChangeName: false,
      greetings: '',
      isEditGreetings: false,
      canChangeGreetings: false,
    }

    // Function BINDS
    this.renderInfo = this.renderInfo.bind(this);
    this.renderDetails = this.renderDetails.bind(this);
    this.renderGreetings = this.renderGreetings.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.handleDialogSubmit = this.handleDialogSubmit.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.postToriForSale = this.postToriForSale.bind(this);
    this.removeToriForSale = this.removeToriForSale.bind(this);
    this.nameEditSwitch = this.nameEditSwitch.bind(this);
    this.greetingsEditSwitch = this.greetingsEditSwitch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeName = this.changeName.bind(this);
    this.changeGreetings = this.changeGreetings.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.state.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseToriResult(result);

      info.owner = this.context.web3.utils.toChecksumAddress(info.owner);
      this.setState({
        info: info,
        isOwned: info.owner === this.context.userAccount,
        canChangeName: util.canChangeName(info.level),
        canChangeGreetings: util.canChangeGreetings(info.level),
      });

      // Get the greetings.
      fetch('/cribtori/api/greetings/' + info.id)
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(function(data) {
        let txt = data.greetings;
        if (txt === undefined) txt = `Hi there! My name is ${info.name}`;

        this.setState({
          originalGreetings: txt,
        });
      }.bind(this))
      .catch(console.err);
    })
    .catch(console.error);
  }

  nameEditSwitch() {
    this.setState({
      isEditName: !this.state.isEditName,
      name: ''
    });
  }

  greetingsEditSwitch() {
    this.setState({
      isEditGreetings: !this.state.isEditGreetings,
      greetings: ''
    });
  }

  handleChange(prop, e) {
    this.setState({
      [prop]: e.target.value,
    });
  }

  changeName() {
    this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');

    util.changeToriName(this.context.toriToken, this.state.info.id, this.state.name, this.context.userAccount)
    .then((result) => {
      let message = 'Name change is in progress';
      if (!result) message = "Uh oh, error in changing name. Please try again later.";

      let info = this.state.info;
      if (result) {
        info.name = this.state.name;
      }
      this.setState({
        isEditName: false,
        info: info
      })

      if (result) {
        this.props.history.push({
          pathname: '/confirmation',
          state: {
            receipt: result.receipt,
            status: 'Changing Tori name'
          }
        });
      }
      this.context.onMessage(message);
    })
  }

  changeGreetings() {
    let data = {
      id: this.state.info.id,
      greetings: this.state.greetings
    };

    fetch('/cribtori/api/greetings', {
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
      let message = 'Greetings updated!';
      if (status !== 200) message = "Uh oh, error in updating greetings. Please try again later.";

      this.setState({
        isEditGreetings: false,
        originalGreetings: this.state.greetings,
      })
      this.context.onMessage(message);
    }.bind(this))
    .catch(console.error);
  }

  renderGreetings() {
    let content = (
      <Typography variant="body2" color="inherit" component="h1" align="left">
        { this.state.originalGreetings }
      </Typography>
    );
    if (this.state.isEditGreetings && util.canChangeGreetings(this.state.info.level)) {
      content = (
        <div>
          <TextField label={'Fill greetings here'}
                     value={this.state.greetings}
                     type="text"
                     name={"greetings"}
                     onChange={(e) => this.handleChange('greetings', e)} />
          <IconButton variant="raised"
                      color="primary"
                      aria-label="Save"
                      onClick={this.changeGreetings}>
            <Save />
          </IconButton>
        </div>
      );
    }

    return (
      <Paper className={this.props.classes.paper + ' ' + this.props.classes.primary}>
        <Typography variant="subheading" color="inherit" component="h3" align="left">
          { this.state.info.name }:
          { this.state.isOwned && this.state.canChangeGreetings && (
            <IconButton aria-label="Edit"
                        onClick={this.greetingsEditSwitch}>
              { !this.state.isEditGreetings ? (
                <Edit />
              ) : (
                <Cancel />
              )}
            </IconButton>
          )}
        </Typography>
        <Divider />
        { content }
      </Paper>
    );
  }

  renderInfo() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.info) {
      let nameContent = (
        <Typography variant="title" color="inherit" component="h3" align="center">
          {this.state.info.name}
          { this.state.isOwned && this.state.canChangeName && (
            <IconButton aria-label="Edit"
                        onClick={this.nameEditSwitch}>
              { !this.state.isEditName ? (
                <Edit />
              ) : (
                <Cancel />
              )}
            </IconButton>
          )}
        </Typography>
      );
      if (this.state.isEditName) {
        nameContent = (
          <div>
            <TextField label={'Fill name here'}
                       value={this.state.name}
                       type="text"
                       name={"name"}
                       onChange={(e) => this.handleChange('name', e)} />
            <IconButton variant="raised"
                        color="primary"
                        aria-label="Save"
                        onClick={this.changeName}>
              <Save />
            </IconButton>
          </div>
        );
      }
      content = (
        <Grid container className={this.props.classes.grid}
                        spacing={8}
                        alignItems={'center'}
                        direction={'column'}
                        justify={'center'}>
          <Grid item sm={12}>
            { nameContent }
            <Divider />
            <Typography variant="subheading" color="inherit" component="h3" align="center">
              Level: { this.state.info.level }
            </Typography>
            <Hearts id={this.state.id} />
          </Grid>
          <Grid item sm={12}>
            { this.state.info && (
              <ToriImage special={this.state.info.special}
                         generation={this.state.info.generation}
                         dna={this.state.info.dna}
                         size={150} />
            )}
          </Grid>
          <Grid item sm={12}>
            { this.renderGreetings() }
          </Grid>
        </Grid>
      );
    }
    return content;
  }

  renderDetails() {
    let content = (<CircularProgress  color="secondary" />);
    if (!this.state.info) return content;

    return (
      <Paper className={this.props.classes.paper + ' ' + this.props.classes.secondary}
             elevation={4} >
        <Typography variant="title" color="inherit" component="h3">
          Details
        </Typography>
        <Divider />
        <div className={this.props.classes.paperContainer}>
          <Typography variant="subheading" color="inherit" component="h3" align="left">
            Personality: { util.getPersonality(this.state.info.personality) }
          </Typography>
          <Typography variant="subheading" color="inherit" component="h3" align="left">
            Proficiency: { util.getProficiency(this.state.info.proficiency) }
          </Typography>
        </div>
      </Paper>
    );
  }

  renderActions() {
    let content = (<CircularProgress  color="secondary" />);
    if (!this.state.info) return content;

    if (this.state.isOwned) {
      let tradeAction = (
        <MenuItem className={this.props.classes.secondary}
                  onClick={this.postToriForSale}>
          Sell
        </MenuItem>
      );
      if (this.state.info.salePrice > 0) {
        tradeAction = (
          <MenuItem className={this.props.classes.secondary}
                    onClick={this.removeToriForSale}>
            Revoke Sale Post
          </MenuItem>
        );
      }
      return (
        <MenuList>
          <MenuItem component={Link}
                    to={{ pathname: '/mytoris', state: { account: this.state.info.owner} }}>
            Visit Room
          </MenuItem>
          <Divider />
          { tradeAction }
        </MenuList>
      );
    } else {
      return (
        <MenuList>
          <MenuItem component={Link}
                    to={{ pathname: '/mytoris', state: { account: this.state.info.owner} }}>
            Visit Room
          </MenuItem>
          <Divider />
          <MenuItem component={Link}
                    to={{ pathname: '/nursery/breed/' + this.state.info.id, state: { info: this.state.info} }}>
            Breed With {this.state.info.name}
          </MenuItem>
          { this.state.info.salePrice > 0 && (
            <BuyInput contract={this.context.toriToken}
                      addr={this.state.info.id}
                      price={this.state.info.salePrice}
                      total={1}
                      custom={false} />
          )}
        </MenuList>
      );
    }
  }

  handleDialogClose() {
    this.setState({
      dialogOpen: false,
    })
  }

  handleDialogSubmit(contract, data, info) {
    if (data.price === 0) {
      this.context.onMessage('Not a valid amount or price');
    } else {
      this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');

      util.postTokenForSale(this.context.toriToken, this.state.id, this.context.web3.utils.toWei('' + data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        if (!result) this.context.onMessage("Uh oh, something went wrong. Please try again later");
        this.context.onMessage("Posting Tori for sale in progress, TXHash: " + result.receipt.transactionHash);
        this.setState({
          dialogOpen: false,
        })
        if (result) {
          this.props.history.push({
            pathname: '/confirmation',
            state: {
              receipt: result.receipt,
              status: 'Posting Tori for sale'
            }
          });
        }
      }).catch(console.error);
    }
  }

  postToriForSale() {
    this.setState({
      dialogOpen: true,
    });
  }

  removeToriForSale() {
    this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');

    util.removeTokenForSale(this.context.toriToken, this.state.id, this.context.userAccount)
    .then((result) => {
      this.context.onMessage("Revoking sale post in progress...")

      if (result) {
        this.props.history.push({
          pathname: '/confirmation',
          state: {
            receipt: result.receipt,
            status: 'Revoking sale post'
          }
        });
      }
    }).catch(console.error);
  }

  render() {
    return (
      <Grid container className={this.props.classes.grid}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
          <Grid item sm={4}>
            { this.renderDetails() }
            <Divider />
            { false /* TODO */ && (
              <Paper className={this.props.classes.paper}
                     elevation={4}>
                <Typography variant="title" color="inherit" component="h3">
                  Logs
                </Typography>
                <Divider />
                [ TBA ]
              </Paper>
            )}
          </Grid>
          <Grid item sm={4}>
            { this.renderInfo() }
          </Grid>
          <Grid item sm={4}>
            <Paper className={this.props.classes.paper}
                   elevation={4}>
              { this.renderActions() }
            </Paper>
          </Grid>
          <Grid item sm={12}>
            <Typography variant="body2" color="inherit" component="h3" align="center">
              Abilities unlocked by level:
            </Typography>
            <LevelStepper level={this.state.info ? this.state.info.level : 1} />
          </Grid>
          <TradeDialog open={this.state.dialogOpen}
                       amountNeeded={false}
                       contract={this.context.toriToken}
                       handleClose={this.handleDialogClose}
                       handleSubmit={this.handleDialogSubmit}
                       info={this.state.currItem}/>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(ToriDetails))

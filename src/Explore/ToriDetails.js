import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import ToriImage from '../Components/ToriImage.js';
import Hearts from '../Components/Hearts.js';
import TradeDialog from '../Components/TradeDialog.js';
import BuyInput from '../Components/BuyInput.js';

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
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.state.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        info: info,
        isOwned: info.owner === this.context.userAccount,
      });
    })
    .catch(console.error);
  }

  renderGreetings() {
    return (
      <Paper className={this.props.classes.paper + ' ' + this.props.classes.primary}>
        <Typography variant="subheading" color="inherit" component="h3" align="left">
          { this.state.info.name }:
        </Typography>
        <Divider />
        <Typography variant="body2" color="inherit" component="h1" align="left">
          "Quis laborum ad nisi minim nam non laboris o constias."
        </Typography>
      </Paper>
    );
  }

  renderInfo() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.info) {
      content = (
        <Grid container className={this.props.classes.grid}
                        spacing={8}
                        alignItems={'center'}
                        direction={'column'}
                        justify={'center'}>
          <Grid item sm={12}>
            <Typography variant="title" color="inherit" component="h3" align="center">
              { this.state.info.name }
            </Typography>
            <Divider />
            <Typography variant="subheading" color="inherit" component="h3" align="center">
              Level: { this.state.info.level }
            </Typography>
            <Hearts id={this.state.id} />
          </Grid>
          <Grid item sm={12}>
            { this.state.info && (
              <ToriImage dna={this.state.info.dna}
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
          <MenuItem>Visit Room</MenuItem>
          <Divider />
          { tradeAction }
        </MenuList>
      );
    } else {
      return (
        <MenuList>
          <MenuItem>Visit Room</MenuItem>
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
      util.postTokenForSale(this.context.toriToken, this.state.id, this.context.web3.toWei(data.price, 'ether'), this.context.userAccount)
      .then((result) => {
        if (!result) this.context.onMessage("Uh oh, something went wrong. Please try again later");
        this.context.onMessage("Posting Tori for sale in progress, TXHash: " + result.receipt.txhash);
        this.setState({
          dialogOpen: false,
        })
      }).catch(console.error);
    }
  }

  postToriForSale() {
    this.setState({
      dialogOpen: true,
    });
  }

  removeToriForSale() {
    util.removeTokenForSale(this.context.toriToken, this.state.id, this.context.userAccount)
    .then((result) => {
      this.context.onMessage("Revoking sale post in progress...")
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
            <Paper className={this.props.classes.paper}
                   elevation={4}>
              <Typography variant="title" color="inherit" component="h3">
                History
              </Typography>
              <Divider />
              [ TBA ]
            </Paper>
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

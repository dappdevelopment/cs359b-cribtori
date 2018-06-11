import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import TokenItem from './TokenItem.js';
import Timer from './Timer.js';

import * as util from '../utils.js';

const styles = theme => ({

});

class TicketItem extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriVisit: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      name: ''
    };

    // Function BINDS
    this.onToriSelected = this.onToriSelected.bind(this);
    this.renderAction = this.renderAction.bind(this);
    this.claimTicket = this.claimTicket.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    util.getTicketInfo(this.context.toriVisit, this.props.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseTicketResult(result);

      let myId = info.toriId;
      let otherId = info.otherId;
      let dueTime = info.dueTime;
      this.setState({
        id: myId,
        otherId: otherId,
        dueTime: dueTime,
      })
    })
    .catch(console.error);
  }

  claimTicket() {
    this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');

    util.claimTori(this.context.toriVisit, this.props.id, this.state.name, this.context.userAccount)
    .then((result) => {
      let message = 'Claim unsuccessful, try again later :(';
      if (result) {
        // this.updateClaim();
        message = 'Claim successful! Refresh to see your new Tori!';
      }
      this.context.onMessage(message);

      if (result) {
        this.props.history.push({
          pathname: '/confirmation',
          state: {
            receipt: result.receipt,
            status: 'Claiming new Tori'
          }
        });
      }
    })
    .catch(console.error);
  }

  onToriSelected() {
    this.props.history.push('/explore/' + this.props.id);
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  renderAction() {
    if (this.state.dueTime - new Date().getTime() / 1000 > 0) {
      return (
        <Timer dueTime={this.state.dueTime} />
      );
    } else {
      return (
        <div>
          <TextField label={'New Tori name*'}
                     value={this.state.name}
                     type="text"
                     onChange={this.handleChange} />
          <Button disabled={this.state.name === ''}
                  variant="raised"
                  color="primary"
                  onClick={this.claimTicket} >
            Claim
          </Button>
        </div>
      );
    }
  }

  render() {
    if (this.state.id === undefined) return (<CircularProgress  color="secondary" />);
    return (
      <Grid item sm={12}>
        <Grid container spacing={16}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <TokenItem id={this.state.id}
                     onItemSelected={this.onToriSelected}
                     showLevel={true} />
          <TokenItem id={this.state.otherId}
                     onItemSelected={this.onToriSelected}
                     showLevel={true} />
          { this.renderAction() }
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(TicketItem))

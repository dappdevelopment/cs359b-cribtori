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
import EggImage from './EggImage.js';

import ArrowForward from '@material-ui/icons/ArrowForward';
import AddBox from '@material-ui/icons/AddBox';

import * as util from '../utils.js';
import { assets } from '../assets.js';

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
      name: '',
      claiming: false,
    };

    // Function BINDS
    this.onToriSelected = this.onToriSelected.bind(this);
    this.renderAction = this.renderAction.bind(this);
    this.claimTicket = this.claimTicket.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onTimerDone = this.onTimerDone.bind(this);
  }

  componentDidMount() {
    util.getTicketInfo(this.context.toriVisit, this.props.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseTicketResult(result);

      let myId = info.toriId;
      let otherId = info.otherId;
      let dueTime = info.dueTime;
      let submitTime = info.submitTime;

      // Calculate egg state.
      let totalTime = dueTime - submitTime;
      let currentTime = (new Date().getTime() / 1000) - submitTime;
      let percentageTime = Math.min((currentTime / totalTime) * 100, 100);
      let eggState = Math.floor(percentageTime / 25) - 1;

      this.setState({
        id: myId,
        otherId: otherId,
        dueTime: dueTime,
        submitTime: submitTime,
        eggState: eggState
      })
    })
    .catch(console.error);
  }

  claimTicket() {
    this.setState({
      claiming: true,
    }, () => {
      this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');

      util.claimTori(this.context.toriVisit, this.props.id, this.state.name, this.context.userAccount)
      .then((result) => {
        let message = 'Claim unsuccessful, try again later :(';
        if (result) {
          // this.updateClaim();
          message = 'Claim successful! Refresh to see your new Tori!';
        }
        this.setState({
          claiming: false,
        });
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
    });
  }

  onToriSelected(id) {
    this.props.history.push('/explore/' + id);
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  onTimerDone() {
    // Get the timer switch.
    let dueTime = this.state.dueTime;
    this.setState({
      dueTime: 0
    }, () => {
      this.setState({
        dueTime: dueTime,
      });
    });
  }

  renderAction() {
    if (this.state.dueTime - new Date().getTime() / 1000 > 0) {
      return (
        <Timer dueTime={this.state.dueTime}
               timerCallback={this.onTimerDone}
               className={this.props.classes.timer} />
      );
    } else {
      return (
        <div>
          <TextField label={'New Tori name*'}
                     value={this.state.name}
                     type="text"
                     onChange={this.handleChange} />
          { this.state.claiming ? (
            <CircularProgress  color="secondary" />
          ) : (
            <Button disabled={this.state.name === ''}
                    variant="raised"
                    color="primary"
                    onClick={this.claimTicket} >
              Claim
            </Button>
          )}
        </div>
      );
    }
  }

  render() {
    if (this.state.id === undefined) return (<CircularProgress  color="secondary" />);
    return (
      <Grid item sm={12}>
        <Grid container spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <TokenItem id={this.state.id}
                     onItemSelected={() => this.onToriSelected(this.state.id)}
                     showLevel={true} />
          <AddBox />
          <TokenItem id={this.state.otherId}
                     onItemSelected={() => this.onToriSelected(this.state.otherId)}
                     showLevel={true} />
          <ArrowForward />
          <EggImage state={this.state.eggState}/>
          { this.renderAction() }
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(TicketItem))

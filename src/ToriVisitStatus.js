import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';

import * as util from './utils.js';

import Timer from './Timer.js';

const styles = theme => ({
  visitStatus: {
    width: '100%',
  },
  visitPanel: {
    width: 300,
    margin: 'auto',
  }
});

class ToriVisitStatus extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriVisit: PropTypes.object,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      name: '',
    };

    this.claimTori = this.claimTori.bind(this);
    this.updateClaim = this.updateClaim.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // Fetch the time remaining.
    util.getToriTicket(this.context.toriVisit, this.props.toriId, this.context.userAccount)
    .then((result) => {
      // Check if ticket is still ongoing...
      if (result[1]) {
        // TODO: add a link here to redirect to the target tori.
        let ticket = result[0].toNumber();
        util.getTicketInfo(this.context.toriVisit, ticket, this.context.userAccount)
        .then((result) => {
          let info = util.parseTicketResult(result);
          this.setState({
            ticket: ticket,
            dueTime: info.dueTime,
          })
        })
      } else {
        // Need to update the database...
        this.updateClaim();
      }
    })
    .catch(console.error);
  }

  updateClaim() {
    let data = {
      id: this.props.toriId,
      targetId: this.props.targetId,
      claimed: 1
    }
    fetch('/cribtori/visit', {
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
      let message = 'Tori is already claimed.';
      if (status === 400) {
        // TODO: handle this...
        message = 'Error in updating claim';
      }
      this.props.onMessage(message);
    }.bind(this))
    .catch(console.err);
  }

  claimTori() {
    util.claimTori(this.context.toriVisit, this.state.ticket, this.state.name, this.context.userAccount)
    .then((result) => {
      // TODO: how to handle error ?
      let message = 'Claim unsuccessful, try again later :(';
      if (result) {
        this.updateClaim();
        let message = 'Claim successful! Refresh to see your new Tori!';
      }
      this.props.onMessage(message);
    })
    .catch(console.error);
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  render() {
    let timeToClaim = true//(new Date(this.state.dueTime * 1000) < new Date());
    return (
      <div className={this.props.classes.visitStatus}>
        <Chip label="Out for visitation ..." />
        { this.state.dueTime &&
          (<Timer dueTime={this.state.dueTime}/>)
        }
        { timeToClaim && (
          <ExpansionPanel className={this.props.classes.visitPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Time to claim your new Tori</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <TextField
                label={'Name'}
                value={this.state.name}
                type="text"
                onChange={this.handleChange}
              />
              <Button disabled={this.state.name === ''}
                      variant="raised"
                      color="primary"
                      onClick={this.claimTori}>
                Claim
              </Button>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ToriVisitStatus)

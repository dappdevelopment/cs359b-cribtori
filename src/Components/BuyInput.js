import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import * as util from '../utils.js';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const styles = theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
    height: 151,
  },
  inventoryImg: {
    width: `100%`,
  }
});



class BuyInput extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props)
    this.context = context;

    this.state = {
      amount: 0,
      total: this.props.total,
    };

    this.handleBuy = this.handleBuy.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.constructSelectOptions = this.constructSelectOptions.bind(this);
  }

  handleChange(e) {
    this.setState({
      amount: e.target.value,
    })
  }

  constructSelectOptions() {
    let items = [];
    for (var idx = 1; idx < this.state.total + 1; idx++) {
      items.push(
        <MenuItem key={`op_${idx}`} value={idx}>{idx}</MenuItem>
      );
    }
    return items;
  }

  handleBuy() {
    let amount = 1;
    if (this.props.custom) {
      amount = this.state.amount;
      this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');
      util.buyAccForSale(this.props.contract,
                         this.props.addr,
                         amount,
                         amount * this.props.price,
                         this.context.userAccount)
      .then((result) => {
        let message = 'Buy transaction submitted';
        if (!result) {
          message = 'Transaction failed :(';
          this.context.onMessage(message);
          return;
        }

        this.props.history.push({
          pathname: '/confirmation',
          state: {receipt: result.receipt}
        });
      })
      .catch(console.err);
    } else {
      this.context.onMessage('Transaction is being processed. You can check the progress of your transaction through Metamask.');
      
      util.buyTokenForSale(this.props.contract,
                           this.props.addr,
                           this.props.price,
                           this.context.userAccount)
      .then((result) => {
        let message = 'Buy transaction submitted';
        if (!result) message = 'Transaction failed :(';
        this.context.onMessage(message);
        if (result && !this.props.custom) {
          // TODO: do a confirmation here from the smart contract side.
          let data = {
            id: this.props.addr,
            locations: JSON.stringify([]),
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
            // Updated!
          })
          .catch(console.err);
        }
      })
      .catch(console.err);
    }
  }

  render() {
    return (
      <div>
        { this.props.custom &&
          <Select
            value={this.state.amount}
            onChange={this.handleChange}
            inputProps={{
              name: 'amount',
            }}
          >
            <MenuItem value={0}>
              <em>0</em>
            </MenuItem>
            {this.constructSelectOptions()}
          </Select>
        }
        <Button disabled={this.props.custom && this.state.amount === 0}
                variant="raised"
                color="primary"
                onClick={this.handleBuy} >
          Buy { !this.props.custom && (`for ${this.context.web3.fromWei(this.props.price, 'ether')} ETH`) }
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(BuyInput))

import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';

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
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

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
      util.buyAccForSale(this.props.contract,
                         this.props.addr,
                         amount,
                         amount * this.props.price,
                         this.context.userAccount)
      .then((result) => {
        let message = 'Buy transaction submitted';
        if (!result) message = 'Transaction failed :(';
        this.props.onMessage(message);
      })
      .catch(console.err);
    } else {
      console.log(this.props.contract,
                           this.props.addr,
                           this.props.price,
                           this.context.userAccount)
      util.buyTokenForSale(this.props.contract,
                           this.props.addr,
                           this.props.price,
                           this.context.userAccount)
      .then((result) => {
        let message = 'Buy transaction submitted';
        if (!result) message = 'Transaction failed :(';
        this.props.onMessage(message);
        console.log(result)
        if (result && !this.props.custom) {
          // TODO: do a confirmation here from the smart contract side.
          let data = {
            id: this.props.addr,
            locations: JSON.stringify([]),
          }
          fetch('/room', {
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
          Buy
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(BuyInput)

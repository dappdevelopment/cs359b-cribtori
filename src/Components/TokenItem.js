import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import ToriImage from './ToriImage.js';

import * as util from '../utils.js';
import { assets } from '../assets.js';

const styles = theme => ({

});

class TokenItem extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      info: {}
    }

    // Function BINDS
    this.renderMenuItem = this.renderMenuItem.bind(this);
  }

  componentDidMount() {
    if (this.props.id === undefined) {
      // Accessory
      util.retrieveAllTokenInfo(this.props.contract, this.context.userAccount)
      .then((result) => {
        let info = util.parseAccInfo(result);
        this.setState({
          mode: 1,
          info: info,
        });
      })
      .catch(console.error);
    } else {
      // Tori
      util.retrieveTokenInfo(this.context.toriToken, this.props.id, this.context.userAccount)
      .then((result) => {
        let info = util.parseToriResult(result);
        this.setState({
          mode: 0,
          info: info,
        });
      })
      .catch(console.error);
    }
  }

  renderMenuItem() {
    let key = (this.state.info.symbol) ? this.state.info.symbol : this.state.info.id;
    let space = this.state.mode ? this.state.info.space : 1;
    let amount = 0;

    let disabled = false;
    if (this.state.mode === 0) {
      // Check for tori.
      disabled = this.props.active.indexOf(this.state.info.id) !== -1;
    } else {
      // Check for accessory
      amount = this.state.info.balance - this.state.info.amount;
      if (this.props.active[this.state.info.symbol] !== undefined) amount -= this.props.active[this.state.info.symbol];
      disabled = amount === 0;
    }

    return (
      <MenuItem key={key}
                disabled={disabled}
                onClick={(e) => this.props.onItemSelected(this.state.info, e)}>
        { !this.state.mode ? (
          <ToriImage dna={this.state.info.dna}
                     size={80} />
        ) : (
          <Avatar alt={this.state.info.name} src={assets.accessories[this.state.info.symbol]} />
        )}
        <ListItemText primary={ this.state.mode ? `x ${amount}` : this.state.info.name } />
        <Typography variant="caption" gutterBottom>
          Space: {space}
        </Typography>

      </MenuItem>
    );
  }

  render() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.mode !== undefined) content = this.renderMenuItem();
    return content;
  }
}

export default withStyles(styles)(TokenItem)

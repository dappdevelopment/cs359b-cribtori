import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Hearts from './Hearts.js';
import TokenItem from './TokenItem.js';

import * as util from '../utils.js';

const styles = theme => ({

});

class StatusItem extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    // Function BINDS
    this.onToriSelected = this.onToriSelected.bind(this);
  }

  onToriSelected() {
    this.props.history.push('/explore/' + this.props.id);
  }

  render() {
    return (
      <Grid item sm={12}>
        <TokenItem id={this.props.id}
                   onItemSelected={this.onToriSelected}
                   showLevel={true} />
        <Hearts id={this.props.id} />
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(StatusItem))

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
    marginTop: 100,
  },
});

class Confirmation extends Component {
  constructor(props, context) {
    super(props);
    this.context = context;

    // Check if there a transaction...
    let receipt = this.props.history.location.state;
    if (receipt !== undefined) receipt = receipt.receipt;
    if (receipt === undefined) {
      receipt = {};
      // Redirect to info.
      this.props.history.push('/');
    }

    this.state ={
      txhash: receipt.transactionHash
    }
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'flex-start'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12}>
          <Typography variant="title" color="inherit" component="h3" align="center">
            Your transaction has been submitted.
          </Typography>
          <Typography variant="subheading" color="inherit" component="h3" align="center">
            Transaction Hash:
          </Typography>
          <Typography variant="subheading" color="primary" component="h3" align="center">
            { this.state.txhash }
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Confirmation))

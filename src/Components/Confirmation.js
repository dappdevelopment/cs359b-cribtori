import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import ConfirmationNumber from '@material-ui/icons/ConfirmationNumber';

import { assets } from '../assets.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
    marginTop: 50,
    marginBottom: 25,
  },
  button: {
    margin: 5
  },
  waitingContainer: {
    width: '100%',
    position: 'relative',
    height: 200,
    textAlign: 'center'
  },
  waitingImg: {
    height: '100%'
  }
});

class Confirmation extends Component {

  static contextTypes = {
    pushToDrawer: PropTypes.func,
    openDrawer: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state ={
      txhash: '',
      status: ''
    }

    // Check if there a transaction...
    let historyState = this.props.history.location.state;

    if (historyState === undefined) {
      // Redirect to info.
      this.props.history.push('/');
      return;
    } else {
      let receipt = historyState.receipt;
      let status = historyState.status;

      if ((receipt === undefined) || (status === undefined)) {
        // Redirect to info.
        this.props.history.push('/');
        return;
      }

      this.state = {
        txhash: receipt.transactionHash,
      }

      this.context.pushToDrawer(receipt.transactionHash, historyState.status);
    }
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'flex-start'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item className={this.props.classes.root} sm={12}>
          <Typography variant="title" color="inherit" component="h3" align="center">
            Your transaction has been submitted.
          </Typography>
          <Typography variant="subheading" color="inherit" component="h3" align="center">
            Transaction Hash:
          </Typography>
          <Typography variant="subheading" color="primary" component="h3" align="center">
            { this.state.txhash }
          </Typography>
          <Divider />
        </Grid>
        <Grid item sm={12}>
          <div className={this.props.classes.waitingContainer}>
            <img className={this.props.classes.waitingImg} src={assets.pending} alt={'Waiting'} />
          </div>
          <Typography variant="subheading" color="inherit" component="h3" align="center">
            While you wait:
          </Typography>
          <Typography variant="subheading" color="inherit" component="h3" align="center">
            <Button
              className={this.props.classes.button}
              variant="raised"
              color="primary"
              component={Link}
              to={'/mytoris'} >
              Visit your Toris
            </Button>
            <Button
              className={this.props.classes.button}
              variant="raised"
              color="secondary"
              onClick={this.context.openDrawer} >
              <ConfirmationNumber /> Check Transactions Progress
            </Button>
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Confirmation))

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

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

class Prompt extends Component {
  constructor(props, context) {
    super(props);
    this.context = context;

    // Check if there a transaction...
    let historyState = this.props.history.location.state;
    if (historyState !== undefined) historyState = historyState.mode;
    if (historyState === undefined) {
      historyState = {};
      // Redirect to info.
      this.props.history.push('/');
    }

    this.state ={
      mode: historyState
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
          { this.state.mode === 0 ? (
            <Typography variant="title" color="inherit" component="h3" align="center">
              Please install and login to MetaMask to play Cribtori.
            </Typography>
          ) : (
            <Typography variant="title" color="inherit" component="h3" align="center">
              Please connect to Rinkeby Test Network.
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Prompt))

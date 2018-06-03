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

/*
{tx: "0xc85fd0849fafcb327580195d05f5d9b9c7638a5a0c0cf1734e4b0399d9f8d771", receipt: {…}, logs: Array(1)}
logs
:
[{…}]
receipt
:
blockHash
:
"0xeb5ab8d4df1bb6dea6ccc3ec0656ef0e8664bea1a8252693726108b6c57b772d"
blockNumber
:
40
contractAddress
:
null
cumulativeGasUsed
:
53323
gasUsed
:
53323
logs
:
[{…}]
logsBloom
:
"0x00000800000000000000000000000000000000000000000004000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000100000000000020000000000000000000000000000000000000000000000000000000000000008000010000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000"
status
:
"0x01"
transactionHash
:
"0xc85fd0849fafcb327580195d05f5d9b9c7638a5a0c0cf1734e4b0399d9f8d771"
transactionIndex
:
0
__proto__
:
Object
tx
:
"0xc85fd0849fafcb327580195d05f5d9b9c7638a5a0c0cf1734e4b0399d9f8d771"
__proto__
:
Object
*/

class Confirmation extends Component {
  constructor(props, context) {
    super(props);
    this.context = context;

    // Check if there a transaction...
    if (this.props.history.state.receipt === undefined) {
      // Redirect to info.
      this.props.history.push('/');
    }
  }

  render() {
    let txhash = tthis.props.history.location.state.receipt.txhash;
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
            Transaction Hash: {this.props.txhash}
          </Typography>
          <Typography variant="subheading" color="primary" component="h3" align="center">
            { txhash }
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Confirmation))

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';


const styles = theme => ({

});

class Status extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        <Grid item sm={3}>
          Tori 1
        </Grid>
        <Grid item sm={6}>
          Tori 2
        </Grid>
        <Grid item sm={3}>
          Tori 3
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Status)

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  
});

class OtherToris extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={3}>
          [ Tori ]
        </Grid>
        <Grid item sm={3}>
          [ Tori ]
        </Grid>
        <Grid item sm={3}>
          [ Tori ]
        </Grid>
        <Grid item sm={3}>
          [ Tori ]
        </Grid>
        <Grid item sm={3}>
          [ Tori ]
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(OtherToris)

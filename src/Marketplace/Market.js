import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  title: {
    textAlign: 'center'
  },
  container: {
    padding: 32,
  }
});

class Market extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        <Grid item sm={12}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Toris for Sale
            </Typography>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'space-around'}>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item sm={12}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Accessories for Sale
            </Typography>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'space-around'}>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
              <Grid item sm={4}>
                [ Item goes here ]
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Market)

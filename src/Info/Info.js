import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  banner: {
    backgroundColor: theme.palette.primary.dark,
    color: 'white',
    height: 400,
  },
  infoItem: {
    width: '100%',
    textAlign: 'center',
    padding: 100,
  },
  fullHeight: {
    height: '100%'
  },
  paper: {
    padding: 50,
  }
});

class Info extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12} className={this.props.classes.banner + ' ' + this.props.classes.infoItem}>
          <Grid container className={this.props.classes.fullHeight}
                          spacing={16}
                          alignItems={'center'}
                          direction={'row'}
                          justify={'center'}>
            <Grid item sm={12}>
              <Typography variant="display3" color="inherit">
                CRIBTORI
              </Typography>
            </Grid>
            <Grid item sm={12}>
              <Typography variant="display1" color="inherit">
                Et aute deserunt commodo, nostrud familiaritatem ita iudicem.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={4}>
                [Image goes here]
              </Grid>
              <Grid item sm={8}>
                <Typography variant="body2" color="inherit">
                  Voluptate quid laboris consequat, qui quid quorum quem eiusmod. Non magna veniam
                  tempor litteris. Eiusmod si singulis.Ingeniis legam singulis ab do aliquip si
                  laborum, est sed despicationes quo nam velit eu quid. Sint coniunctione mentitum
                  labore admodum, noster ex singulis, de singulis distinguantur, mentitum tamen
                  litteris excepteur id an de graviterque, tempor excepteur consectetur, appellat
                  an fugiat, quis senserit ut malis illum. Aliqua ullamco eruditionem ne amet
                  incurreret eu irure amet.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          [Bunch of image here...]
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={8}>
                <Typography variant="body2" color="inherit">
                  Veniam cupidatat et senserit, quo iis elit probant non qui eu praesentibus se
                  doctrina amet commodo, officia ita labore mandaremus o summis commodo quo
                  nostrud, sed nisi legam te appellat sed aut ubi quis malis veniam. Probant id
                  minim, se sunt probant quibusdam te esse do pariatur an quis, irure o vidisse te
                  eram. Qui quorum possumus imitarentur e magna coniunctione incididunt tamen
                  incurreret.Iudicem ut elit proident, aute voluptate de amet aliqua, ad arbitror
                  coniunctione o quem expetendis ullamco, nam ad enim fugiat malis ut arbitror eu
                  illum, multos excepteur reprehenderit, commodo ne labore. Quis laborum ad nisi
                  minim nam non laboris o constias, illum cernantur et noster nulla, culpa
                  transferrem appellat quorum offendit. Laboris de officia, a aliqua labore duis
                  senserit.
                </Typography>
              </Grid>
              <Grid item sm={4}>
                [Image goes here]
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Info)

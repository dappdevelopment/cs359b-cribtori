import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import { assets } from '../assets.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  banner: {
    backgroundColor: theme.palette.secondary.dark,
    color: 'white',
    width: '100%',
    textAlign: 'center',
    padding: 100,
    marginBottom: 20
  },
  infoItem: {
    width: '100%',
    textAlign: 'center',
    padding: 100,
    marginBottom: 20
  },
  fullHeight: {
    height: '100%'
  },
  paper: {
    padding: 50,
  },
  sampleImage: {
    width: '80%'
  },
  bannerImage: {
    marginTop: 10,
    height: 150
  },
  promo: {
    width: '100%'
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
        <Grid item sm={12} className={this.props.classes.banner}>
          <Grid container className={this.props.classes.fullHeight}
                          spacing={16}
                          alignItems={'center'}
                          direction={'row'}
                          justify={'center'}>
            <Grid item sm={12}>
              <img src={assets.logoWhite} alt={"Cribtori"} className={this.props.classes.bannerImage} />
              <div className={this.props.classes.promo}>
                <Button variant="raised"
                        color="primary"
                        component={Link}
                        to={'/promo'}>
                  First-time user? Get your Promo On!
                </Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Typography variant="subheading" color="inherit">
            Cribtori is a blockchain-based game where users own and can
            interact with their own decentralized virtual pets.
          </Typography>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={5}>
                <img src={assets.info[0]} alt={"Tori sample"} className={this.props.classes.sampleImage}/>
              </Grid>
              <Grid item sm={7}>
                <Typography variant="title" color="primary">
                  Unique Toris with Unique Personalities
                </Typography>
                <Divider/>
                <Typography variant="subheading" color="inherit">
                  One-of-kind appearrances with new twists.
                  Each Tori is tailored with unique personalities and different level of
                  cuteness. Interact with your Toris through feeding, cleaning, and playing-
                  and see how much they love you!
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={7}>
                <Typography variant="title" color="secondary">
                  Customizable Room & Cool Accessories
                </Typography>
                <Divider/>
                <Typography variant="subheading" color="inherit">
                  Customize your Room with Toris and unique accessories.
                  {'Arrange them to your heart\'s content!'}
                </Typography>
              </Grid>
              <Grid item sm={5}>
                <img src={assets.info[1]} alt={"Accessories sample"} className={this.props.classes.sampleImage}/>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={5}>
                <img src={assets.info[2]} alt={"Breeding sample"} className={this.props.classes.sampleImage}/>
              </Grid>
              <Grid item sm={7}>
                <Typography variant="title" color="primary">
                  Breed Toris to Multiply, Fuse to Level up
                </Typography>
                <Divider/>
                <Typography variant="subheading" color="inherit">
                  {"Breed with other owners' Toris to add more to you Tori family."}
                  Fuse your Toris together to level up your Toris and unlock hidden features in Cribtori.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
        </Grid>
        <Grid item sm={12} className={this.props.classes.infoItem}>
          <Paper className={this.props.classes.paper}>
            <Grid container className={this.props.classes.fullHeight}
                            spacing={16}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={7}>
                <Typography variant="title" color="secondary">
                  Level up and go beyond!
                </Typography>
                <Divider/>
                <Typography variant="subheading" color="inherit">
                  Unlock hidden potentials in your Toris.
                  Witness as more abilities are unlocked as your Tori grows.
                </Typography>
              </Grid>
              <Grid item sm={5}>
                <img src={assets.info[3]} alt={"Level sample"} className={this.props.classes.sampleImage}/>
              </Grid>
            </Grid>
            <Grid item sm={12} className={this.props.classes.infoItem}>
              <Paper className={this.props.classes.paper}>
                <Typography variant="title" color="inherit">
                  More to come!
                </Typography>
                <Divider/>
                <Typography variant="subheading" color="inherit" style={{marginBottom: 20}}>
                  Interested in knowing more? Sign up for Cribtori mailing list below.
                </Typography>
                <a href="https://goo.gl/forms/7gIlC2rFhQfyYUEW2" >
                  <Button variant="raised"
                          color="primary" >
                    Sign me up!
                  </Button>
                </a>
              </Paper>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Info)

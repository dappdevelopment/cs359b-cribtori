import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';

import { assets } from '../assets.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  banner: {
    backgroundColor: theme.palette.secondary.dark,
    color: 'white',
    height: 20,
  },
  infoItem: {
    width: '100%',
    textAlign: 'center',
    padding: 100,
  },
  card: {
    maxWidth: 300,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 16,
    flexGrow: 1,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 255, 0.1)',
    },
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  cardHeaderFuse: {
    backgroundColor: theme.palette.primary.light,
  },
  cardHeaderBreed: {
    backgroundColor: theme.palette.secondary.light,
  },
  grid: {
    marginTop: 16,
  }
});

class Nursery extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'flex-start'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={6} className={this.props.classes.infoItem}>
          <Card className={this.props.classes.card} onClick={()=> this.props.history.push('/nursery/fuse')}>
            <CardMedia className={this.props.classes.media}
                       image={assets.fuse}
                       title="Fusion diagram"
            />
            <CardHeader title={"Fusion"} className={this.props.classes.cardHeaderFuse} />
            <Divider/>
            <CardContent>
              <Typography variant="body2" color="inherit" component="h3" align="center">
                Fuse two of your Toris together to create a higher level Tori and unlock more features!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={6} className={this.props.classes.infoItem}>
        <Card className={this.props.classes.card} onClick={()=> this.props.history.push('/nursery/breed')}>
          <CardMedia className={this.props.classes.media}
                     image={assets.breed}
                     title="Breeding diagram"
          />
          <CardHeader title={"Breed"} className={this.props.classes.cardHeaderBreed} />
          <Divider/>
          <CardContent>
            <Typography variant="body2" color="inherit" component="h3" align="center">
              {"Breed your Toris with other owners' Toris and get more unique Toris!"}
            </Typography>
          </CardContent>
        </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Nursery))

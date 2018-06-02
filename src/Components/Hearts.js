import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import { HeartHalfFull } from 'mdi-material-ui';

const styles = theme => ({
  icon: {
      color: 'red',
    },
});

const HEART_LIM = 5;

class Hearts extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    // Function BINDS
    this.renderHearts = this.renderHearts.bind(this);
  }

  componentDidMount() {
    // Get info about hearts
    fetch('/cribtori/api/hearts/' + this.props.id)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(function(data) {
      let hearts = (data.hearts === undefined) ? 2.5 : data.hearts;
      let lastUpdate = (data.hearts === undefined) ? new Date() : new Date(data.last_update);
      this.setState({
        hearts: hearts,
        lastUpdate: lastUpdate,
      });
    }.bind(this))
    .catch(console.err);
  }

  renderHearts() {
    let content = [];
    let count = this.state.hearts;
    for (let i = 0; i < HEART_LIM; i++) {
      let h;
      if (count >= 1) {
        // Full heart.
        h = (<Favorite key={`heart_${i}`} className={this.props.classes.icon}/>);
      } else if (count >= 0.5) {
        // Half heart.
        h = (<HeartHalfFull key={`heart_${i}`} className={this.props.classes.icon}/>);
      } else {
        // Empty heart.
        h = (<FavoriteBorder key={`heart_${i}`} className={this.props.classes.icon}/>);
      }
      count -= 1;
      content.push(h);
    }
    return content;
  }

  render() {
    return (
      <div>
        { this.state.hearts !== undefined ?
          this.renderHearts()
        : (
          <CircularProgress  color="secondary" />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Hearts)

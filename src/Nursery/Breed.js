import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({

});

class Breed extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div>Breed { this.props.location.pathname }</div>
    );
  }
}

export default withStyles(styles)(Breed)

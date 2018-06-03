import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({

});

class Confirmation extends Component {
  constructor(props, context) {
    super(props);

  }

  render() {
    return (
      <div>Hello { this.props.location.pathname }</div>
    );
  }
}

export default withStyles(styles)(Confirmation)

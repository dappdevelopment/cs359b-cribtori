import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import IsometricRoom from '../Components/IsometricRoom.js';

const styles = theme => ({
  roomWrapper: {
    textAlign: 'center'
  }
});

class Introduction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toriIds: [],
      size: 3
    }
  }

  render() {
    return (
      <Grid item xs={12}>
        <div className={this.props.classes.roomWrapper}>
          <IsometricRoom toris={this.state.toriIds}
                         size={this.state.size} />
        </div>
      </Grid>
    );
  }
}

export default withStyles(styles)(Introduction)

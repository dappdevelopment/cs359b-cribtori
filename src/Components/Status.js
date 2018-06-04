import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import StatusItem from './StatusItem.js';

const styles = theme => ({

});

class Status extends Component {
  constructor(props, context) {
    super(props);
    this.context = context;

    // Function BINDS
    this.renderStatusItem = this.renderStatusItem.bind(this);
  }

  renderStatusItem() {
    return this.props.ids.map((id) => {
      return (
        <StatusItem id={id} key={`item_${id}`}/>
      );
    });
  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        { this.renderStatusItem() }
      </Grid>
    );
  }
}

export default withStyles(styles)(Status)

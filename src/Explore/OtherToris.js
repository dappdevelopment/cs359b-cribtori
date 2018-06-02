import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import TokenInfo from '../Components/TokenInfo.js';

import * as util from '../utils.js';

const styles = theme => ({

});

class OtherToris extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      otherToris: [],
    }
  }

  componentDidMount() {
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
        toriIds = toriIds.map((id) => { return id.toNumber() });

        util.retrieveAllToriCount(this.context.toriToken, this.context.userAccount)
        .then((count) => {
          count = count.toNumber();
          // Filter from the current owner indexes.
          let otherIds = [];
          for (let i = 0; i < count; i++) {
            if (toriIds.indexOf(i) === -1) {
              otherIds.push(i);
            }
          }

          this.initDisplay(otherIds);
        })
        .catch(console.error);
    })
    .catch(console.error);
  }

  initDisplay(ids) {
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id}/>
        </Grid>
      );
    });
    this.setState({
      otherToris: items,
    });
  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        { this.state.otherToris }
      </Grid>
    );
  }
}

export default withStyles(styles)(OtherToris)

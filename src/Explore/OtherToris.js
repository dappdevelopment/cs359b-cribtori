import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import TokenInfo from '../Components/TokenInfo.js';

import * as util from '../utils.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
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
      empties: [],
    }

    // Function BINDS
    this.onEmpty = this.onEmpty.bind(this);
    this.renderDisplay = this.renderDisplay.bind(this);
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

          // Check which ones are currently active.
          fetch('/cribtori/api/hearts?active=1')
          .then(function(response) {
            if (response.ok) {
              return response.json();
            }
            throw response;
          })
          .then(function(data) {
            // Filter the toris.
            data = data.map((d) => { return d.tori_id; });
            otherIds = otherIds.filter((id) => data.indexOf(id) !== -1);
            this.setState({
              ids: otherIds
            });
          }.bind(this))
          .catch(console.err);
        })
        .catch(console.error);
    })
    .catch(console.error);
  }

  renderDisplay() {
    if (this.state.ids === undefined) return (<div></div>);

    let ids = this.state.ids;
    ids = ids.filter((id) => this.state.empties.indexOf(id) === -1);
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id}
                     onEmpty={this.onEmpty}/>
        </Grid>
      );
    });
    return items;
  }

  onEmpty(id) {
    let empties = this.state.empties;
    if (empties.indexOf(id) === -1) empties.push(id);
    this.setState({
      empties: empties,
    })
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        { this.renderDisplay() }
      </Grid>
    );
  }
}

export default withStyles(styles)(OtherToris)

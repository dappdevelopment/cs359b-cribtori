import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import TokenInfo from '../Components/TokenInfo.js';

import * as util from '../utils.js';

const styles = theme => ({
  title: {
    textAlign: 'center'
  },
  container: {
    padding: 32,
  },
  gridContainer: {
    width: '100%'
  }
});

class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);

    this.context = context;

    this.state = {
      toriItems: [],
      accItems: [],
    }

    // Function BINDS
    this.retrieveAccessories = this.retrieveAccessories.bind(this);
    this.retrieveToris = this.retrieveToris.bind(this);
    this.initToriItems = this.initToriItems.bind(this);
    this.initAccessoryItem = this.initAccessoryItem.bind(this);

  }

  componentDidMount() {
    this.retrieveAccessories();
    this.retrieveToris();
  }

  retrieveAccessories() {
    this.setState({
      accItems: [],
    }, () => {
      this.context.accContracts.forEach((contract) => {
        contract.balanceOf(this.context.userAccount)
        .then((result) => {
          let balance = result.toNumber();
          if (balance !== 0) {
            this.initAccessoryItem(contract);
          }
        })
        .catch(console.error);
      });
    });
  }

  retrieveToris() {
    this.setState({
      toriItems: [],
    }, () => {
      util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
      .then((toriIds) => {
          toriIds = toriIds.map((id) => { return id.toNumber() });
          this.initToriItems(toriIds);
      })
      .catch(console.error);
    });
  }

  initToriItems(ids) {
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id}/>
        </Grid>
      );
    });
    this.setState({
      toriItems: items,
    });
  }

  initAccessoryItem(contract) {
    let item = (
      <Grid item sm={3} key={this.state.accItems.length}>
        <TokenInfo contract={contract} />
      </Grid>
    );
    this.setState({
      accItems: this.state.accItems.concat(item),
    })
  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        <Grid item sm={12}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Toris
            </Typography>
            <Divider/>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              { this.state.toriItems }
            </Grid>
          </div>
        </Grid>
        <Grid item sm={12} className={this.props.classes.gridContainer}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Accessories
            </Typography>
            <Divider/>
            <Grid container spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              { this.state.accItems }
            </Grid>
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Inventory)

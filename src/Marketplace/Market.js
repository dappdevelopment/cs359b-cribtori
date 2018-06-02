import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

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

class Market extends Component {

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
      accItems: [],
      toriItem: []
    }

    // Function BINDS
    this.initToriItems = this.initToriItems.bind(this);
    this.initAccessoryItem = this.initAccessoryItem.bind(this);
  }

  componentDidMount() {
    // Toris
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      toriIds = toriIds.map((id) => { return id.toNumber() });
      util.retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
      .then((saleIds) => {
        saleIds = saleIds.map((id) => { return id.toNumber() })
        saleIds = saleIds.filter((id) => toriIds.indexOf(id) === -1);
        // Contruct the display.
        this.initToriItems(saleIds);
      })
      .catch(console.error);
    })
    .catch(console.error);

    // Accessories
    this.setState({
      accItems: [],
    }, () => {
      this.context.accContracts.forEach((contract) => {
        let sales = [];
        util.retrieveAllAccsForSale(contract, this.context.userAccount)
        .then((result) => {
          result[0].forEach((val, i) => {
            let price = result[1][i];
            let addr = result[2][i];
            let item = {
              amount: val,
              price: price,
              addr: addr
            };
            sales.push(item);
          });
          // Filter sales
          sales = sales.filter((item) => (item.addr !== this.context.userAccount));
          if (sales.length !== 0) {
            this.initAccessoryItem(contract, sales);
          }
        })
      });
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

  initAccessoryItem(contract, sales) {
    let item = (
      <Grid item sm={3} key={this.state.accItems.length}>
        <TokenInfo contract={contract} sales={sales} />
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
        <Grid item sm={12} className={this.props.classes.gridContainer}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Toris for Sale
            </Typography>
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
              Accessories for Sale
            </Typography>
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

export default withStyles(styles)(Market)

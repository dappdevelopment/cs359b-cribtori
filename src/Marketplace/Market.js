import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
      accSelfItems: [],
      toriItem: [],
      toriSelfItems: []
    }

    // Function BINDS
    this.initToriItems = this.initToriItems.bind(this);
    this.initSelfToriItems = this.initSelfToriItems.bind(this);
    this.initAccessoryItem = this.initAccessoryItem.bind(this);
    this.initSelfAccessoryItem = this.initSelfAccessoryItem.bind(this);
    this.renderMyItems = this.renderMyItems.bind(this);
  }

  componentDidMount() {
    // Toris
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      toriIds = toriIds.map((id) => { return id.toNumber() });
      util.retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
      .then((saleIds) => {
        saleIds = saleIds.map((id) => { return id.toNumber() })
        let selfSales = saleIds.filter((id) => toriIds.indexOf(id) !== -1);
        saleIds = saleIds.filter((id) => toriIds.indexOf(id) === -1);
        // Contruct the display.
        this.initToriItems(saleIds);
        this.initSelfToriItems(selfSales);
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
              addr: this.context.web3.utils.toChecksumAddress(addr)
            };
            sales.push(item);
          });
          // Filter sales
          let selfSales = sales.filter((item) => (item.addr === this.context.userAccount));
          sales = sales.filter((item) => (item.addr !== this.context.userAccount));
          if (sales.length !== 0) {
            this.initAccessoryItem(contract, sales);
          }
          if (selfSales.length !== 0) {
            this.initSelfAccessoryItem(contract, selfSales);
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
          <TokenInfo id={id}
                     forSale={true} />
        </Grid>
      );
    });
    this.setState({
      toriItems: items,
    });
  }

  initSelfToriItems(ids) {
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id} />
        </Grid>
      );
    });
    this.setState({
      toriSelfItems: items,
    });
  }

  initAccessoryItem(contract, sales) {
    let item = (
      <Grid item sm={3} key={this.state.accItems.length}>
        <TokenInfo contract={contract}
                   sales={sales}
                   forSale={true} />
      </Grid>
    );
    this.setState({
      accItems: this.state.accItems.concat(item),
    })
  }

  initSelfAccessoryItem(contract, sales) {
    let item = (
      <Grid item sm={3} key={this.state.accSelfItems.length}>
        <TokenInfo contract={contract}
                   sales={sales} />
      </Grid>
    );
    this.setState({
      accSelfItems: this.state.accSelfItems.concat(item),
    })
  }

  renderMyItems() {
    return (
      <Grid item sm={12} className={this.props.classes.gridContainer}>
        <div className={this.props.classes.container} >
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>My Items for Sale</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container spacing={8}
                              alignItems={'center'}
                              direction={'row'}
                              justify={'center'}>
                { this.state.toriSelfItems }
                { this.state.accSelfItems }
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </Grid>
    )
  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'column'}
                      justify={'center'}>
        { (this.state.toriSelfItems.length !== 0 || this.state.accSelfItems.length !== 0) &&
          this.renderMyItems()
        }
        <Grid item sm={12} className={this.props.classes.gridContainer}>
          <div className={this.props.classes.container} >
            <Typography className={this.props.classes.title}
                        variant="title"
                        color="inherit"
                        component="h1">
              Toris for Sale
            </Typography>
            <Divider />
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
            <Divider />
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

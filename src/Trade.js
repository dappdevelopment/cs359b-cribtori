import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js'

import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';


import AccImg from './mockimg/acc-sample.png'
import ToriImg from './mockimg/tori-sample.png'

const styles = theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
    height: 151,
  },
});



class Trade extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriSaleDisplay: [],
      accSaleDisplay: []
    };
  }

  componentDidMount() {
    this.refreshDisplay();
  }

  refreshDisplay() {
    // Toris
    util.retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []});

      toriIds.forEach(id => {
        util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
          let info = util.parseToriResult(result);
          if (info.owner !== this.context.userAccount) {
            this.setState({
              toriSaleDisplay: this.state.toriSaleDisplay.concat(this.constructToriSaleDisplay(info))
            });
          }
        });
      });
    })
    // Accessories
    this.context.accContracts.forEach((contract) => {
      util.retrieveAllTokenInfo(contract)
      .then((result) => {
        let info = util.parseAccInfo(result);
        info.contract = contract;
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
          info.sales = sales;
          if (sales.length !== 0) {
            this.setState({
              accSaleDisplay: this.state.accSaleDisplay.concat(this.constructAccSaleDisplay(info))
            });
          }
        })
      })
      .catch(console.error);
    });
  }

  buyForSale(contract, rep, mode, e) {
    if (mode === 'acc') {
      // TODO: customize amount
      util.buyAccForSale(contract, rep, 1, this.context.web3.toWei(1), this.context.userAccount)
      .then((result) => {
        this.refreshDisplay();
      }).catch(console.error);
    } else {
      util.buyTokenForSale(contract, rep, this.context.web3.toWei(1), this.context.userAccount)
      .then((result) => {
        this.refreshDisplay();
      }).catch(console.error);
    }
  }

  constructToriSaleDisplay(info) {
    let proficiency = util.getProficiency(info.proficiency);
    let personality = util.getPersonality(info.personality);

    let imgName = ToriImg;

    return (
      <Grid key={info.id} item sm={4}>
        <Card className="toribox">
          <CardMedia
            image={imgName}
            title={'Tori for sale'}
            className={this.props.classes.cover}
            />
          <div className={this.props.classes.details}>
            <CardContent className={this.props.classes.content}>
              <Typography variant="headline">{info.name}</Typography>
              <List>
                <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={proficiency} /></ListItem>
                <ListItem><ListItemText primary="Personality:"/><ListItemText primary={personality} /></ListItem>
                <ListItem><ListItemText primary="Price:"/><ListItemText primary={this.context.web3.fromWei(info.salePrice, 'ether') + ' ETH'} /></ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(this.props.toriToken, info.id, 'tori', e)}>
                Buy Tori
              </Button>
            </CardActions>
          </div>
        </Card>
      </Grid>
    );
  }


  constructAccSaleDisplay(info) {
    // TODO: implement image mapping.
    let imgName = AccImg;
    let i = 0;
    let offer = info.sales.map((item) => {
      i += 1;
      return (
        <ListItem key={`${info.symbol}_${i}`}>
          <ListItemText primary={`${item.amount} for ${this.context.web3.fromWei(item.price, 'ether')} ETH/token`}/>
          <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(item.contract, item.addr, 'acc', e)}>
            Buy
          </Button>
        </ListItem>
      );
    });

    return (
      <Grid key={info.symbol} item sm={4}>
        <Card className="accbox">
          <CardMedia
            image={imgName}
            title={'Accessory for sale'}
            className={this.props.classes.cover} />
          <div className={this.props.classes.details}>
            <CardContent>
              <Typography variant="headline">{info.name}</Typography>
              <List className="acc-details">
                <ListItem><ListItemText primary="Variety:"/><ListItemText primary={info.variety} /></ListItem>
                <ListItem><ListItemText primary="Material:"/><ListItemText primary={info.material} /></ListItem>
                <ListItem><ListItemText primary="Space:"/><ListItemText primary={info.space} /></ListItem>
              </List>
              <Typography variant="subheading">Offer</Typography>
              { info.sales.length > 0 && (
                <List className="offer">
                  {offer}
                </List>
              )}
            </CardContent>
          </div>
        </Card>
      </Grid>
    );
  }


  render() {
    return (
      <div className="Trade">
        <Typography variant="headline" gutterBottom>
          Toris For Sale
        </Typography>
        <Grid container className="tori-sale-display"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          {this.state.toriSaleDisplay}
        </Grid>
        <Typography variant="headline" gutterBottom>
          Accessories For Sale
        </Typography>
        <Grid container className="acc-sale-display"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          {this.state.accSaleDisplay}
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Trade)

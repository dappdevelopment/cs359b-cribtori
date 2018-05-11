import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js';
import { assets } from './assets.js'

import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';

import BuyInput from './BuyInput.js';
import ToriImage from './ToriImage.js'

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
  inventoryImg: {
    width: `100%`,
  }
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
      accSaleDisplay: [],
      openSnackBar: false,
      snackBarMessage: '',
    };

    this.handleMessage = this.handleMessage.bind(this);
    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
  }

  componentDidMount() {
    this.refreshDisplay();
  }

  refreshDisplay() {
    // Toris
    util.retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []},
        () => {
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
      });
    })
    // Accessories
    this.setState({accSaleDisplay: []},
      () => {
        this.context.accContracts.forEach((contract) => {
          util.retrieveAllTokenInfo(contract, this.context.userAccount)
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
      });
  }

  handleCloseSnackBar() {
    this.setState({
      openSnackBar: false,
    });
  }

  handleMessage(message) {
    this.setState({
      openSnackBar: true,
      snackBarMessage: message,
    }, this.refreshDisplay);
  }

  constructToriSaleDisplay(info) {
    let proficiency = util.getProficiency(info.proficiency);
    let personality = util.getPersonality(info.personality);

    return (
      <Grid key={info.id} item sm={4}>
        <Card className="toribox">
          <CardContent className={this.props.classes.content}>
            <Typography variant="headline">{info.name}</Typography>
            <ToriImage dna={info.dna} size={150} />
            <List>
              <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={proficiency} /></ListItem>
              <ListItem><ListItemText primary="Personality:"/><ListItemText primary={personality} /></ListItem>
              <ListItem><ListItemText primary="Price:"/><ListItemText primary={this.context.web3.fromWei(info.salePrice, 'ether') + ' ETH'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <BuyInput contract={this.context.toriToken}
                      addr={info.id}
                      price={info.salePrice}
                      total={1}
                      custom={false}
                      onMessage={this.handleMessage}/>
          </CardActions>
        </Card>
      </Grid>
    );
  }


  constructAccSaleDisplay(info) {
    let imgName = assets.accessories[info.symbol];
    let i = 0;
    let offer = info.sales.map((item) => {
      i += 1;
      return (
        <ListItem key={`${info.symbol}_${i}`}>
          <ListItemText primary={`${item.amount.toNumber()} for ${this.context.web3.fromWei(item.price, 'ether')} ETH/token`}/>
          <BuyInput contract={info.contract}
                    addr={item.addr}
                    price={item.price.toNumber()}
                    total={item.amount.toNumber()}
                    custom={true}
                    onMessage={this.handleMessage}/>
        </ListItem>
      );
    });

    return (
      <Grid key={info.symbol} item sm={4}>
        <Card className="accbox">
          <CardContent>
            <Typography variant="headline">{info.name}</Typography>
            <img src={imgName} alt={info.name} className={this.props.classes.inventoryImg}/>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={info.variety} /></ListItem>
              <ListItem><ListItemText primary="Material:"/><ListItemText primary={info.material} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={info.space} /></ListItem>
            </List>
            <Typography variant="subheading">Offers:</Typography>
            { info.sales.length > 0 && (
              <List className="offer">
                {offer}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  }


  render() {
    return (
      <div className="Trade">
        <Grid container className="tori-sale-display"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={12}>
            <Typography variant="headline" gutterBottom align="center">
              Toris For Sale
            </Typography>
          </Grid>
          {this.state.toriSaleDisplay}
        </Grid>
        <Divider />
        <Grid container className="acc-sale-display"
                        spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={12}>
            <Typography variant="headline" gutterBottom align="center">
              Accessories For Sale
            </Typography>
          </Grid>
          {this.state.accSaleDisplay}
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.openSnackBar}
          onClose={this.handleCloseSnackBar}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Trade)

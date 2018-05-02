import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenInfo,
  retrieveAllTokensForSale,
  buyTokenForSale
} from './utils.js'

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';


const cardStyle = {
  height: 200
}


class Trade extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriSaleDisplay: [],
      accSaleDisplay: []
    };
    // this.context.toriToken
  }

  componentDidMount() {
    this.refreshDisplay();
  }

  refreshDisplay() {
    // Toris
    retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []});

      toriIds.forEach(id => {
        retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
          this.setState({
            toriSaleDisplay: this.state.toriSaleDisplay.concat(this.constructToriSaleDisplay(result))
          });
        });
      });
    })
    // Accessories
    retrieveAllTokensForSale(this.context.accToken, this.context.userAccount)
    .then((accIds) => {
      this.setState({accSaleDisplay: []});

      accIds.forEach(id => {
        retrieveTokenInfo(this.context.accToken, id, this.context.userAccount).then((result) => {
          this.setState({
            accSaleDisplay: this.state.accSaleDisplay.concat(this.constructAccSaleDisplay(result))
          });
        });
      });
    })
  }

  buyForSale(tokenId, mode, e) {
    let contract = (mode === 'acc') ? this.context.accToken : this.context.toriToken;
    console.log('Buying:', tokenId, ' with mode: ', mode);
    buyTokenForSale(contract, tokenId, this.context.web3.toWei(1), this.context.userAccount)
    .then((result) => {
      console.log('After buying:', result);
      this.refreshDisplay();
    }).catch(console.error);
  }

  constructToriSaleDisplay(result) {
    // (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime)
    let toriId = result[0].toNumber();
    let toriDna = result[1].toNumber();
    let toriProficiency = result[2].toNumber();
    let toriPersonality = result[3].toNumber();
    let toriReadyTime = result[4].toNumber();
    let toriSalePrice = this.context.web3.fromWei(result[5].toNumber(), 'ether');

    let imgNum = parseInt(toriDna, 10) % 4 + 1;
    let imgName = 'mockimg/tori' + imgNum + '.png';
    return (
      <Grid key={toriId} item sm={4}>
        <Card className="toribox">
          <CardHeader title={'Tori ID: ' + toriId} />
          <CardMedia
            image={imgName}
            title={'Tori for sale'}
            style={cardStyle}
            />
          <CardContent>
            <List className="tori-details">
              <ListItem><ListItemText primary="DNA:"/><ListItemText primary={toriDna} /></ListItem>
              <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={toriProficiency} /></ListItem>
              <ListItem><ListItemText primary="Personality:"/><ListItemText primary={toriPersonality} /></ListItem>
              <ListItem><ListItemText primary="Ready Time:"/><ListItemText primary={toriReadyTime} /></ListItem>
              <ListItem><ListItemText primary="Price:"/><ListItemText primary={toriSalePrice + ' ETH'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(toriId, 'tori', e)}>
              Buy Tori
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }
  

  constructAccSaleDisplay(result) {
    // (_accId, acc.variety, acc.rarity, acc.space)
    let accId = result[0].toNumber();
    let accVariety = result[1].toNumber();
    let accRarity = result[2].toNumber();
    let accSpace = result[3].toNumber();
    let accSalePrice = this.context.web3.fromWei(result[4].toNumber(), 'ether');

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc.png';
    return (
      <Grid key={accId} item sm={4}>
        <Card className="accbox">
          <CardHeader title={'Accessory ID: ' + accId} />
          <CardMedia
            image={imgName}
            title={'Accessory for sale'}
            style={cardStyle}
            />
          <CardContent>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={accVariety} /></ListItem>
              <ListItem><ListItemText primary="Rarity:"/><ListItemText primary={accRarity} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={accSpace} /></ListItem>
              <ListItem><ListItemText primary="Price:"/><ListItemText primary={accSalePrice + ' ETH'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(accId, 'acc', e)}>
              Buy Accessory
            </Button>
          </CardActions>
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
                        spacing={2}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          {this.state.toriSaleDisplay}
        </Grid>
        <Typography variant="headline" gutterBottom>
          Accessories For Sale
        </Typography>
        <Grid container className="acc-sale-display"
                        spacing={2}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          {this.state.accSaleDisplay}
        </Grid>
      </div>
    );
  }
}

export default Trade

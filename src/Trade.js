import React, { Component, PropTypes } from 'react'

import * as util from './utils.js'

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemText } from 'material-ui/List';
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
    util.retrieveAllTokensForSale(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      this.setState({toriSaleDisplay: []});

      toriIds.forEach(id => {
        util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
          this.setState({
            toriSaleDisplay: this.state.toriSaleDisplay.concat(this.constructToriSaleDisplay(result))
          });
        });
      });
    })
    // Accessories
    util.retrieveAllTokensForSale(this.context.accToken, this.context.userAccount)
    .then((accIds) => {
      this.setState({accSaleDisplay: []});

      accIds.forEach(id => {
        util.retrieveTokenInfo(this.context.accToken, id, this.context.userAccount).then((result) => {
          this.setState({
            accSaleDisplay: this.state.accSaleDisplay.concat(this.constructAccSaleDisplay(result))
          });
        });
      });
    })
  }

  buyForSale(tokenId, mode, e) {
    let contract = (mode === 'acc') ? this.context.accToken : this.context.toriToken;
    util.buyTokenForSale(contract, tokenId, this.context.web3.toWei(1), this.context.userAccount)
    .then((result) => {
      this.refreshDisplay();
    }).catch(console.error);
  }

  constructToriSaleDisplay(result) {
    let info = util.parseToriResult(result);
    let proficiency = util.getProficiency(info.proficiency);
    let personality = util.getPersonality(info.personality);

    let imgName = 'mockimg/tori-sample.png';

    return (
      <Grid key={info.id} item sm={4}>
        <Card className="toribox">
          <CardHeader title={info.name} />
          <CardMedia
            image={imgName}
            title={'Tori for sale'}
            style={cardStyle}
            />
          <CardContent>
            <List className="tori-details">
              <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={proficiency} /></ListItem>
              <ListItem><ListItemText primary="Personality:"/><ListItemText primary={personality} /></ListItem>
              <ListItem><ListItemText primary="Price:"/><ListItemText primary={info.salePrice + ' ETH'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(info.id, 'tori', e)}>
              Buy Tori
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }


  constructAccSaleDisplay(result) {
    let info = util.parseAccessoryResult(result);

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc-sample.png';
    return (
      <Grid key={info.id} item sm={4}>
        <Card className="accbox">
          <CardHeader title={'Accessory ID: ' + info.id} />
          <CardMedia
            image={imgName}
            title={'Accessory for sale'}
            style={cardStyle}
            />
          <CardContent>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={info.variety} /></ListItem>
              <ListItem><ListItemText primary="Material:"/><ListItemText primary={`${info.materiall}`} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={info.space} /></ListItem>
              <ListItem><ListItemText primary="Price:"/><ListItemText primary={info.salePrice + ' ETH'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.buyForSale(info.id, 'acc', e)}>
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

export default Trade

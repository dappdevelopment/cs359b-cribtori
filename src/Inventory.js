import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenCount,
  retrieveTokenInfo,
  retrieveTokenIndexes,
  postTokenForSale,
  removeTokenForSale
} from './utils.js'


import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';


const cardStyle = {
  height: 200
}


class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      inventoryDisplay: []
    };
  }

  componentDidMount() {
    retrieveTokenCount(this.context.accToken, this.context.userAccount)
    .then((result) => {
      // TODO: what if user sell all of his items?
      this.setState({isNewUser: result.c[0] === 0})
      if (result.c[0] > 0) {
        this.refreshInventoryDisplay();
      }
    })
  }

  refreshInventoryDisplay() {
    retrieveTokenIndexes(this.context.accToken, this.context.userAccount)
    .then(
      (accIds) => {
        accIds = accIds.map((id) => {return id.c[0]})
        this.setState({inventoryDisplay: []});

        accIds.forEach(id => {
          retrieveTokenInfo(this.context.accToken, id, this.context.userAccount).then((result) => {
            this.setState({
              inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(result))
            });
          });
        });
      }
    ).catch(console.error);
  }


  postAccForSale(accId, e) {
    console.log('Posting:', accId);
    postTokenForSale(this.context.accToken, accId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeAccForSale(accId, e) {
    console.log('Revoking:', accId);
    removeTokenForSale(this.context.accToken, accId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructInventoryDisplay(result) {
    // (_accId, acc.variety, acc.rarity, acc.space)
    let accId = result[0].toNumber();
    let accVariety = result[1].toNumber();
    let accRarity = result[2].toNumber();
    let accSpace = result[3].toNumber();
    let accSalePrice = result[4].toNumber();

    // TODO: implement image mapping.
    let imgName = 'mockimg/acc-sample.png';
    return (
      <Grid key={accId} item sm={4}>
        <Card className="accbox">
          <CardHeader title={'Accessory ID: ' + accId} />
          <CardMedia
            image={imgName}
            title={'Accessory'}
            style={cardStyle}
            />
          <CardContent>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={accVariety} /></ListItem>
              <ListItem><ListItemText primary="Rarity:"/><ListItemText primary={accRarity} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={accSpace} /></ListItem>
              <ListItem><ListItemText primary="Is For Sale:"/><ListItemText primary={accSalePrice > 0 ? 'True' : 'False'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            {accSalePrice > 0 ? (
              <Button variant="raised" color="primary" onClick={(e) => this.removeAccForSale(accId, e)}>
                Revoke Sale Post
              </Button>
            ) : (
              <Button variant="raised" color="primary" onClick={(e) => this.postAccForSale(accId, e)}>
                Sell Accessory
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  }

  render() {
    return (
      <div className="inventory-display-container">
        {this.state.isNewUser ? (
          <Typography variant="headline" gutterBottom>
            Generate your first Tori first!
          </Typography>
        ) : (
          <Grid container className="inventory-display"
                          spacing={2}
                          alignItems={'center'}
                          direction={'row'}
                          justify={'center'}>
            {this.state.inventoryDisplay}
          </Grid>
        )}
      </div>
    );
  }

}

export default Inventory

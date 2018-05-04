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


class Inventory extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      inventoryDisplay: [],
      inventoryTypes: [],
    };
  }

  componentDidMount() {
    this.context.accContracts.forEach((contract) => {
      // Get the info.
      let info;
      util.retrieveAllTokenInfo(contract)
      .then((result) => {
        info = util.parseAccInfo(result);
        contract.balanceOf(this.context.userAccount)
        .then((result) => {
          info.balance = result.toNumber();
          this.setState({
            inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(info))
          });
        })
      });
    });
  }


  postAccForSale(accId, e) {
    console.log('Posting:', accId);
    util.postTokenForSale(this.context.accToken, accId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeAccForSale(accId, e) {
    console.log('Revoking:', accId);
    util.removeTokenForSale(this.context.accToken, accId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructInventoryDisplay(info) {
    // { info.salePrice > 0 && (
    //    <ListItem><ListItemText primary="For Sale"/></ListItem>
    // )}
    /*
    <CardActions>
      {info.salePrice > 0 ? (
        <Button variant="raised" color="primary" onClick={(e) => this.removeAccForSale(info.id, e)}>
          Revoke Sale Post
        </Button>
      ) : (
        <Button variant="raised" color="primary" onClick={(e) => this.postAccForSale(info.id, e)}>
          Sell Accessory
        </Button>
      )}
    </CardActions>
    */
    // TODO: implement image mapping.
    let imgName = 'mockimg/acc-sample.png';
    return (
      <Grid key={info.symbol} item sm={4}>
        <Card className="accbox">
          <CardHeader title={info.name} />
          <CardMedia
            image={imgName}
            title={'Accessory'}
            style={cardStyle}
            />
          <CardContent>
            <List className="acc-details">
              <ListItem><ListItemText primary="Variety:"/><ListItemText primary={info.variety} /></ListItem>
              <ListItem><ListItemText primary="Material:"/><ListItemText primary={info.material} /></ListItem>
              <ListItem><ListItemText primary="Space:"/><ListItemText primary={info.space} /></ListItem>
              <ListItem><ListItemText primary="Amount:"/><ListItemText primary={info.balance} /></ListItem>
            </List>
          </CardContent>
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
                          spacing={8}
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

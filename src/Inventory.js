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
            inventoryDisplay: this.state.inventoryDisplay.concat(this.constructInventoryDisplay(contract, info))
          });
        })
      })
      .catch(console.error);
    });
  }


  postAccForSale(contract, accId, e) {
    // TODO: customize price and amount.
    util.postAccForSale(contract, 1, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeAccForSale(contract, accId, e) {
    util.removeAccForSale(contract, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  constructInventoryDisplay(contract, info) {
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
              { info.price > 0 && (
                 <ListItem><ListItemText primary={`${info.amount} For Sale`}/></ListItem>
              )}
            </List>
          </CardContent>
          <CardActions>
            {info.price > 0 ? (
              <Button variant="raised" color="primary" onClick={(e) => this.removeAccForSale(contract, info.id, e)}>
                Revoke Sale Post
              </Button>
            ) : (
              <Button variant="raised" color="primary" onClick={(e) => this.postAccForSale(contract, info.id, e)}>
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

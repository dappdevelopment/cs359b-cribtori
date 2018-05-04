import React, { Component, PropTypes } from 'react'

import {
  retrieveTokenCount,
  retrieveTokenInfo,
  retrieveTokenIndexes,
  generateNewTori,
  generateNewAccessories,
  postTokenForSale,
  removeTokenForSale
} from './utils.js'

import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';


import ToriDetails from './ToriDetails.js'


const cardStyle = {
  height: 200
}


class MyToriDisplay extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      toriDisplay: [],
      currentTori: -1,
      detailIsShown: false,
    }

    this.generateInitToris = this.generateInitToris.bind(this);
    this.closeToriDetails = this.closeToriDetails.bind(this);
  }

  componentDidMount() {
    retrieveTokenCount(this.context.toriToken, this.context.userAccount)
    .then((result) => {
      console.log(result.toNumber());
      this.setState({isNewUser: result.toNumber() === 0})
      if (result.toNumber() > 0) {
        this.refreshToriDisplay();
      }
    })
  }

  refreshToriDisplay() {
    retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        toriIds = toriIds.map((id) => {return id.toNumber()});
        this.setState({toriDisplay: []});

        toriIds.forEach(id => {
          retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))
            });
          });
        });
      }
    )
    .catch(console.error);
  }

  generateInitToris(e) {
    generateNewTori(this.context.toriToken, [0, 1, 0, 0], "test", this.context.userAccount)
    .then((result) => {
      console.log('After generating new tori:', result);
      // Generate new accessories.
      generateNewAccessories(this.context.accToken, this.context.userAccount)
      .then((result) => {
        console.log('After generating new accessories:', result);
      })
    })
    // .on("receipt", refreshToriDisplay)
    // .then(retrieveToriCount)
    // .catch(console.error);
  }


  postToriForSale(toriId, e) {
    console.log('Posting:', toriId);
    postTokenForSale(this.context.toriToken, toriId, this.context.web3.toWei(1, 'ether'), this.context.userAccount)
    .then((result) => {
      console.log('After posting:', result);
    }).catch(console.error);
  }

  removeToriForSale(toriId, e) {
    console.log('Revoking:', toriId);
    removeTokenForSale(this.context.toriToken, toriId, this.context.userAccount)
    .then((result) => {
      console.log('After revoking:', result);
    }).catch(console.error);
  }


  openToriDetails(toriId, e) {
    console.log("Showing details for:", toriId);
    this.setState({
      currentTori: toriId,
      detailIsShown: true,
    });
  }

  closeToriDetails() {
    console.log("Closing details for:", this.state.currentTori);
    this.setState({
      currentTori: -1,
      detailIsShown: false,
    });
  }


  constructToriDisplay(result) {
    // (_toriId, tori.dna, tori.proficiency, tori.personality, tori.readyTime)
    let toriId = result[0].toNumber();
    let toriDna = result[1].toNumber();
    let toriName = result[2];
    let toriProficiency = result[3].toNumber();
    let toriPersonality = result[4].toNumber();
    let toriReadyTime = result[5].toNumber();
    let toriSalePrice = result[6].toNumber();

    // let imgNum = parseInt(toriDna, 10) % 4 + 1;
    let imgName = 'mockimg/tori-sample.png';
    return (
      <Grid key={toriId} item sm={4}>
        <Card className="toribox">
          <CardHeader title={toriName} />
          <CardMedia
            image={imgName}
            title={'Tori'}
            style={cardStyle}
            />
          <CardContent>
            <List className="tori-details">
              <ListItem><ListItemText primary="DNA:"/><ListItemText primary={toriDna} /></ListItem>
              <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={toriProficiency} /></ListItem>
              <ListItem><ListItemText primary="Personality:"/><ListItemText primary={toriPersonality} /></ListItem>
              <ListItem><ListItemText primary="Ready Time:"/><ListItemText primary={toriReadyTime} /></ListItem>
              <ListItem><ListItemText primary="Is For Sale:"/><ListItemText primary={toriSalePrice > 0 ? 'True' : 'False'} /></ListItem>
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.openToriDetails(toriId, e)}>
              Visit Tori
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  }

  render() {
    return (
      <div className="tori-display-container">
        { this.state.detailIsShown &&
          <Button variant="raised" color="primary" className="back-button" onClick={this.closeToriDetails}>
            Back
          </Button>
        }
        {this.state.isNewUser &&
          <Button variant="raised" color="primary" className="retrieve-button" onClick={this.generateInitToris}>
            Retrieve starter Toris
          </Button>
        }
        <div id="tori-display">
          {this.state.detailIsShown ? (
            <ToriDetails toriId={this.state.currentTori} />
          ) : (
            <Grid container className="tori-details-container"
                            spacing={8}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'}>
              {this.state.toriDisplay}
            </Grid>
          )}
        </div>
      </div>
    );
  }
}

export default MyToriDisplay

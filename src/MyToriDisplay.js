import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js'

import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardHeader } from 'material-ui/Card';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';

import ToriDetailsContainer from './ToriDetailsContainer.js'
import ToriImage from './ToriImage.js'

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  card: {
    maxWidth: 275,
    flexGrow: 1
  },
});


class MyToriDisplay extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  static childContextTypes = {
    toriSiblings: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = {
      toriDisplay: [],
      currentTori: -1,
      detailIsShown: false,
      toriSiblings: [],
      otherToriDisplay: [],
    }

    this.generateInitToris = this.generateInitToris.bind(this);
    this.closeToriDetails = this.closeToriDetails.bind(this);
  }

  getChildContext() {
    return {
      toriSiblings: this.state.toriSiblings,
    };
  }

  componentDidMount() {
    util.retrieveTokenCount(this.context.toriToken, this.context.userAccount)
    .then((result) => {
      this.setState({
        isNewUser: result.toNumber() === 0,
        detailIsShown: false
      })
      if (result.toNumber() > 0) {
        this.refreshToriDisplay();
      }
    })
    .catch(console.error);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      if (this.props.mode !== prevProps.mode) {
        this.setState({
          detailIsShown: false,
        })
      }
    }
  }

  refreshToriDisplay() {
    // otherToriDisplay
    let ownerIds;
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        ownerIds = toriIds.map((id) => {return id.toNumber()});
        this.setState({
          otherToriDisplay: [],
          toriDisplay: [],
          usedInventories: {},
          toriSiblings: toriIds,
        });

        ownerIds.forEach(id => {
          util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result))
            });
          });
        });
      }
    )
    .then(() => {
      util.retrieveAllToriCount(this.context.toriToken, this.context.userAccount)
      .then((count) => {
        count = count.toNumber();
        // TODO: randomly choose which id to include
        // TODO: remove line below after testing.
        let otherIds = [];
        for (let i = 0; i < count; i++) {
          if (ownerIds.indexOf(i) === -1) {
            otherIds.push(i);
          }
        }
        otherIds.forEach((id) => {
          util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
            this.setState({
              otherToriDisplay: this.state.otherToriDisplay.concat(this.constructToriDisplay(result))
            });
          });
        });
      })
    })
    .catch(console.error);
  }

  generateInitToris(e) {
    util.generateInitialTori(this.context.toriToken, [0, 1, 0, 0], "test", this.context.userAccount)
    .then((result) => {
      console.log('After generating new tori:', result);
      // TODO: Generate new accessories.
      // util.generateNewAccessories(this.context.accToken, this.context.userAccount)
      // .then((result) => {
      //   console.log('After generating new accessories:', result);
      // })
    })
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
    let info = util.parseToriResult(result);
    let proficiency = util.getProficiency(info.proficiency);
    let personality = util.getPersonality(info.personality);

    return (
      <Grid key={info.id} item xs={4} style={{ flexBasis: 0}}>
        <Card className={this.props.classes.card}>
          <CardHeader title={info.name} />
          <CardContent>
            <ToriImage dna={info.dna} size={150} />
            <List className="tori-details" >
              <ListItem><ListItemText primary="Proficiency:"/><ListItemText primary={proficiency} /></ListItem>
              <ListItem><ListItemText primary="Personality:"/><ListItemText primary={personality} /></ListItem>
              { info.salePrice > 0 && (
                  <ListItem><ListItemText primary="For Sale"/></ListItem>
              )}
            </List>
          </CardContent>
          <CardActions>
            <Button variant="raised" color="primary" onClick={(e) => this.openToriDetails(info.id, e)}>
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
        {this.state.isNewUser && this.props.mode === 0 &&
          <Button variant="raised" color="primary" className="retrieve-button" onClick={this.generateInitToris}>
            Retrieve starter Toris
          </Button>
        }
        <div id="tori-display">
          {this.state.detailIsShown ? (
            <ToriDetailsContainer toriId={this.state.currentTori} isOther={this.props.mode !== 0}/>
          ) : (
            <Grid container className={this.props.classes.root}
                            spacing={16}
                            alignItems={'flex-start'}
                            direction={'row'}
                            justify={'center'}>
              {this.props.mode === 0 ?
                this.state.toriDisplay
              :
                this.state.otherToriDisplay
              }
            </Grid>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MyToriDisplay)

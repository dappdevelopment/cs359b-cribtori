import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js'

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import ToriWelcome from './ToriWelcome.js';
import ToriDetailsContainer from './ToriDetailsContainer.js';
import ToriImage from './ToriImage.js';

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
      isOther: this.props.location.pathname === '/others'
    }

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
    if (prevProps === this.props) {
      return;
    }
    let isOther = this.props.location.pathname === '/others';

    if (this.state.isOther != isOther) {
      this.setState({
        isOther: isOther
      }, this.refreshToriDisplay);
    }
  }

  refreshToriDisplay() {
    // otherToriDisplay
    let ownerIds;
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then(
      (toriIds) => {
        ownerIds = toriIds.map((id) => {return id.toNumber()});
        console.log(ownerIds)
        this.setState({
          otherToriDisplay: [],
          toriDisplay: [],
          usedInventories: {},
          toriSiblings: ownerIds,
          toriInfos: [],
        });

        ownerIds.forEach(id => {
          util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount).then((result) => {
            let info = util.parseToriResult(result);
            this.setState({
              toriDisplay: this.state.toriDisplay.concat(this.constructToriDisplay(result)),
              toriInfos: this.state.toriInfos.concat(info),
            });
          });
        });
      }
    )
    .then(() => {
      if (!this.state.isOther) return;
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
            let info = util.parseToriResult(result);
            this.setState({
              otherToriDisplay: this.state.otherToriDisplay.concat(this.constructToriDisplay(result)),
              toriInfos: this.state.toriInfos.concat(info),
            });
          });
        });
      })
    })
    .catch(console.error);
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
          <Button variant="raised" color="secondary" className="back-button" onClick={this.closeToriDetails}>
            Back
          </Button>
        }
        {this.state.isNewUser && !this.state.isOther &&
          <ToriWelcome onSubmit={() => console.log('submit')} />
        }
        <div id="tori-display">
          {this.state.detailIsShown ? (
            <ToriDetailsContainer toriId={this.state.currentTori}
                                  toriInfo={this.state.toriInfos.filter((i) => i.id == this.state.currentTori)[0]}
                                  isOther={this.state.isOther}/>
          ) : (
            <Grid container className={this.props.classes.root}
                            spacing={16}
                            alignItems={'flex-start'}
                            direction={'row'}
                            justify={'center'}>
              {!this.state.isOther ?
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

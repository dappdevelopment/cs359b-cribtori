import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import ToriImage from './ToriImage.js';

import * as util from '../utils.js';
import { assets } from '../assets.js';


// TODO
import sampleImg from '../img/accessories/TCC.png';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  card: {
    maxWidth: 300,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 16,
    flexGrow: 1,
  },
  cardHeaderTori: {
    backgroundColor: theme.palette.primary.light,
  },
  cardHeaderAcc: {
    backgroundColor: theme.palette.secondary.light,
  },
  img: {
    height: `100%`,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex'
  },
  imgContainer: {
    height: 120,
  },
  grid: {
    marginTop: 16,
  }
});

class TokenInfo extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      mode: -1, // 0 - Tori, 1 - Accessory
      info: {},
    };

    // Function BINDS
    this.renderCardContext = this.renderCardContext.bind(this);
    this.renderAccessoryAction = this.renderAccessoryAction.bind(this);
  }

  componentDidMount() {
    if (this.props.id === undefined) {
      // Accessory
      util.retrieveAllTokenInfo(this.props.contract, this.context.userAccount)
      .then((result) => {
        let info = util.parseAccInfo(result);
        // Need to know how many has been used for room.
        util.retrieveRoomLayout(this.context.userAccount)
        .then((result) => {
          let layout = (result.locations) ? JSON.parse(result.locations) : [];
          layout = layout.filter((item) => item.key === info.symbol);
          info.used = layout.length;
          this.setState({
            mode: 1,
            info: info,
          });
        })
        .catch(console.error);
      })
      .catch(console.error);
    } else {
      // Tori
      util.retrieveTokenInfo(this.context.toriToken, this.props.id, this.context.userAccount)
      .then((result) => {
        let info = util.parseToriResult(result);
        this.setState({
          mode: 0,
          info: info,
        });
      })
      .catch(console.error);
    }
  }

  renderAccessoryAction() {
    if (this.props.forSale) {
      // Render all the offers.
      return (
        <CardActions></CardActions>
      );
    } else {
      // Render for owner.
      let buttonDisabled = this.state.info.balance - this.state.info.used === 0;
      return (
        <CardActions>
          {this.state.info.price > 0 ? (
            <Button variant="raised"
                    color="secondary"
                    onClick={(e) => this.props.onRevokeSale(this.props.contract, e)}>
              Revoke Sale Post
            </Button>
            ) : (
            <Button disabled={buttonDisabled}
                    variant="raised"
                    color="primary"
                    onClick={(e) => this.props.onPostSale(this.props.contract, this.state.info, e)}>
              Sell Accessory
            </Button>
          )}
        </CardActions>
      );
    }
  }

  renderCardContext() {
    if (this.state.mode === 0) {
      // Tori
      return (
        <Card className={this.props.classes.card}>
          <CardHeader title={this.state.info.name}
                      className={this.props.classes.cardHeaderTori}/>
          <Divider/>
          <CardContent>
            <ToriImage dna={this.state.info.dna}
                       size={150} />
            <Divider/>
            <Grid container className={this.props.classes.grid}
                            spacing={32}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'} >
              <Grid item sm={6}>
                Level:
              </Grid>
              <Grid item sm={6}>
                { this.state.info.level }
              </Grid>
              <Grid item sm={6}>
                Personality:
              </Grid>
              <Grid item sm={6}>
                { util.getPersonality(this.state.info.personality) }
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
          </CardActions>
        </Card>
      );
    } else {
      // Accessory
      let saleInfo = 'None';
      if (this.state.info.amount > 0) {

        saleInfo = `${this.state.info.amount} for ${this.context.web3.fromWei(this.state.info.price, 'ether')} ETH / item`;
      }
      return (
        <Card className={this.props.classes.card}>
          <CardHeader title={this.state.info.name}
                      className={this.props.classes.cardHeaderAcc}/>
          <Divider/>
          <CardContent>
            <div className={this.props.classes.imgContainer}>
              <img src={assets.accessories[this.state.info.symbol]}
                   alt={this.state.info.name}
                   className={this.props.classes.img}/>
            </div>
            <Divider/>
            <Grid container className={this.props.classes.grid}
                            spacing={32}
                            alignItems={'center'}
                            direction={'row'}
                            justify={'center'} >
              <Grid item sm={6}>
                Size:
              </Grid>
              <Grid item sm={6}>
                { this.state.info.space }
              </Grid>
              <Grid item sm={6}>
                Balance:
              </Grid>
              <Grid item sm={6}>
                { this.state.info.balance }
              </Grid>
              <Grid item sm={6}>
                Currently placed:
              </Grid>
              <Grid item sm={6}>
                { `${this.state.info.used}` }
              </Grid>
              <Grid item sm={6}>
                Currently for sale:
              </Grid>
              <Grid item sm={6}>
                { saleInfo }
              </Grid>
            </Grid>
          </CardContent>
          { this.renderAccessoryAction() }
        </Card>
      );
    }
  }

  render() {
    return (
      <div>
        { this.state.mode === -1 ? (
          <CircularProgress  color="secondary" />
        ) :
          this.renderCardContext()
        }
      </div>
    );
  }
}

export default withStyles(styles)(TokenInfo)

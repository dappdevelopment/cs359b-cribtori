import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import ToriImage from './ToriImage.js';
import BuyInput from './BuyInput.js';

import * as util from '../utils.js';
import { assets } from '../assets.js';

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
    this.renderToriAction = this.renderToriAction.bind(this);
    this.renderAccessoryAction = this.renderAccessoryAction.bind(this);
    this.renderAccessoryContext = this.renderAccessoryContext.bind(this);
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

        let empty = '0x0000000000000000000000000000000000000000';
        if (info.owner === empty) {
          this.props.onEmpty(info.id);
        } else {
          this.setState({
            mode: 0,
            info: info,
          });
        }
      })
      .catch(console.error);
    }
  }

  renderAccessoryAction() {
    if (this.props.forSale) {
      // Render all the offers.
      let offer = this.props.sales.map((item, i) => {
        return (
          <ListItem key={`${this.state.info.symbol}_${i}`}>
            <ListItemText primary={`${item.amount.toNumber()} for ${this.context.web3.utils.fromWei('' + item.price, 'ether')} ETH/token`}/>
            <BuyInput contract={this.props.contract}
                      addr={this.context.web3.utils.toChecksumAddress(item.addr)}
                      price={item.price.toNumber()}
                      total={item.amount.toNumber()}
                      custom={true} />
          </ListItem>
        );
      });
      return (
        <CardActions>
          <List>
            { offer }
          </List>
        </CardActions>
      );
    } else {
      // Render for owner.
      if (this.props.onRevokeSale === undefined && this.props.onPostSale === undefined) {
        return (
          <CardActions></CardActions>
        );
      }
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

  renderAccessoryContext() {
    let content;
    if (this.props.forSale) {
      content = (
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
        </Grid>
      );
    } else {
      let saleInfo = 'None';
      if (this.state.info.amount > 0) {
        saleInfo = `${this.state.info.amount} for ${this.context.web3.utils.fromWei('' + this.state.info.price, 'ether')} ETH / item`;
      }
      content = (
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
      );
    }

    return (
      <Card className={this.props.classes.card}>
        <div className={this.props.classes.imgContainer}>
          <img src={assets.accessories[this.state.info.symbol]}
               alt={this.state.info.name}
               className={this.props.classes.img}/>
        </div>
        <CardHeader title={this.state.info.name}
                    className={this.props.classes.cardHeaderAcc}/>
        <CardContent>
          { content }
        </CardContent>
        { this.renderAccessoryAction() }
      </Card>
    );
  }

  renderToriAction() {
    if (this.props.forSale) {
      // Show buy button and sale info
      return (
        <BuyInput contract={this.context.toriToken}
                  addr={this.state.info.id}
                  price={this.state.info.salePrice}
                  total={1}
                  custom={false} />
      );
    } else {
      // Show visit button
      let visitLink = '/explore/' + this.state.info.id;
      return (
        <Button variant="raised"
                color="primary"
                component={Link}
                to={visitLink} >
          Show details
        </Button>
      );
    }
  }

  renderCardContext() {
    if (this.state.mode === 0) {
      // Tori
      return (
        <Card className={this.props.classes.card}>
          <ToriImage special={this.state.info.special}
                     generation={this.state.info.generation}
                     dna={this.state.info.dna}
                     size={150} />
          <CardHeader title={this.state.info.name}
                      className={this.props.classes.cardHeaderTori}/>
          <CardContent>
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
            { this.renderToriAction() }
          </CardActions>
        </Card>
      );
    } else {
      // Accessory
      return this.renderAccessoryContext();
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

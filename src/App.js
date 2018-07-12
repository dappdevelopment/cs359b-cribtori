import "babel-polyfill";
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter, Redirect } from 'react-router-dom';

// Tori contracts
import ToriToken from '../build/contracts/ToriToken.json';
import ToriVisit from '../build/contracts/ToriVisit.json';
import ToriSimplePromo from '../build/contracts/ToriSimplePromo.json';

// Accessories contract
import ClothCushion from '../build/contracts/ClothCushion.json';
import FoosballTable from '../build/contracts/FoosballTable.json';
import PottedPlant from '../build/contracts/PottedPlant.json';
import StandardTv from '../build/contracts/StandardTv.json';
import WoodenBed from '../build/contracts/WoodenBed.json';
import WoodenCabinet from '../build/contracts/WoodenCabinet.json';
import WoodenDesk from '../build/contracts/WoodenDesk.json';
import WoodenStool from '../build/contracts/WoodenStool.json';
import WoodenTable from '../build/contracts/WoodenTable.json';

import getWeb3 from './utils/getWeb3';


import Info from './Info/Info.js';
import MyTori from './MyTori/MyTori.js';
import EditRoom from './MyTori/EditRoom.js';
import Nursery from './Nursery/Nursery.js';
import Fuse from './Nursery/Fuse.js';
import BreedHome from './Nursery/BreedHome.js';
import Breed from './Nursery/Breed.js';
import Inventory from './Inventory/Inventory.js';
import OtherToris from './Explore/OtherToris.js';
import ToriDetails from './Explore/ToriDetails.js';
import Market from './Marketplace/Market.js';
import Confirmation from './Components/Confirmation.js';
import Promo from './Promo/Promo.js';
import Register from './Registration/Register.js';
import Admin from './Admin/Admin.js';


import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ConfirmationNumber from '@material-ui/icons/ConfirmationNumber';
import AccountCircle from '@material-ui/icons/AccountCircle';
import CheckCircle from '@material-ui/icons/CheckCircle';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Feedback from '@material-ui/icons/Feedback';

import { assets } from './assets.js';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  logo: {
    height: '30px'
  },
  tab: {
    position: 'absolute',
    right: 0,
    marginRight: 20,
  },
  banner: {
    backgroundColor: theme.palette.secondary.dark,
    height: 20,
    width: `100%`,
  },
  footer: {
    backgroundColor: theme.palette.primary.dark,
    height: 20,
    width: `100%`,
  },
  transactionButton: {
    backgroundColor: '#e53100',
    color: 'white',
    position: 'fixed',
    bottom: 10,
    left: 10,
    boxShadow: '1px 1px grey'
  },
  transactionDrawer: {
  },
  list: {
    maxHeight: 400
  },
  txEntry: {
    marginLeft: 10,
    marginRight: 30
  },
  feedBackButton: {
    backgroundColor: '#FF6F00',
    color: 'white',
    position: 'fixed',
    bottom: 100,
    left: 10,
    boxShadow: '1px 1px grey',
    '&:hover': {
      backgroundColor: '#e53100',
    },
  },
  user: {
    marginLeft: 30,
    padding: 10,
    border: '1px solid',
    borderColor: theme.palette.secondary.main,
    borderRadius: '10%',
    color: theme.palette.secondary.main,
  }
});

class App extends Component {

  static childContextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriVisit: PropTypes.object,
    toriPromo: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
    pushToDrawer: PropTypes.func,
    openDrawer: PropTypes.func,
  }

  constructor(props) {
    super(props)

    let loc = this.props.history.location.pathname;
    loc = loc.split('/')[1];

    const locMode = {'': 5, 'mytoris': 0, 'nursery': 1, 'inventory': 2, 'explore': 3, 'market': 4}
    let currentMode = locMode[loc];

    this.state = {
      storageValue: 0,
      web3: null,
      mode: currentMode === undefined ? locMode[''] : currentMode,
      accessoriesTokenInstances: [],
      accNum: 100,
      openSnackBar: false,
      loaded: false,
      openDrawer: false,
      transactions: [],
      transactionItems: [],
    }

    // Function BINDS
    this.switchDisplay = this.switchDisplay.bind(this);
    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpenDrawer = this.handleOpenDrawer.bind(this);
    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
    this.pushToDrawer = this.pushToDrawer.bind(this);
  }

  getChildContext() {
    return {
      web3: this.state.web3,
      toriToken: this.state.toriTokenInstance,
      toriVisit: this.state.toriVisitInstance,
      toriPromo: this.state.toriPromoInstance,
      accContracts: this.state.accessoriesTokenInstances,
      userAccount: this.state.userAccount,
      onMessage: this.handleMessage,
      pushToDrawer: this.pushToDrawer,
      openDrawer: this.handleOpenDrawer
    };
  }

  async componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      // Instantiate contract once web3 provided.
      this.setState({
        web3: results.web3
      }, this.instantiateContract);
    })
    .catch(() => {
      // Error finding web3.
      this.setState({
        loaded: true,
      })
      this.handleMessage('Please install MetaMask to play Cribtori');
    });

    // Periodically check if the metamask account has changed
    let timer = setInterval( async () => {
      if (this.state.web3 !== undefined) {
        // Check if local.
        if (this.state.web3.currentProvider.host !== undefined) {
          this.setState({
            loaded: true,
          })
          this.handleMessage('Please install MetaMask to play Cribtori');
          // Disable the interval.
          clearInterval(timer);
          return;
        }
        this.state.web3.eth.getAccounts((error, accounts) => {
          if (accounts === undefined) {
            this.setState({
              loaded: true,
            })
            this.handleMessage('Please install MetaMask to play Cribtori');
            // Disable the interval.
            clearInterval(timer);
          } else if (this.state.userAccount !== accounts[0]) {
            // Redirect ...
            this.setState({
              userAccount: accounts[0],
              loaded: true,
              mode: 5,
            }, () => {
              if (this.props.history.location.pathname !== "/") this.props.history.push('/');
            });
          }
        });
      }
    }, 1000);
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
     // Check if local.
     if (this.state.web3.currentProvider.host !== undefined) {
       this.setState({
         loaded: true,
       })
       this.handleMessage('Please install MetaMask to play Cribtori');
       return;
     }
    const contract = require('truffle-contract');
    const toriToken = contract(ToriToken);
    const toriVisit = contract(ToriVisit);
    const toriPromo = contract(ToriSimplePromo);
    toriToken.setProvider(this.state.web3.currentProvider);
    toriVisit.setProvider(this.state.web3.currentProvider);
    toriPromo.setProvider(this.state.web3.currentProvider);

    // Accessories
    const cc = contract(ClothCushion);
    const ft = contract(FoosballTable);
    const pp = contract(PottedPlant);
    const st = contract(StandardTv);
    const wb = contract(WoodenBed);
    const wc = contract(WoodenCabinet);
    const wd = contract(WoodenDesk);
    const ws = contract(WoodenStool);
    const wt = contract(WoodenTable);

    let accessories = [cc, ft, pp, st, wb, wc, wd, ws, wt];
    this.setState({
      accNum: accessories.length,
    });
    accessories.forEach((c) => c.setProvider(this.state.web3.currentProvider));
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      if (accounts === undefined) {
        this.setState({
          loaded: true,
        })
        this.handleMessage('Please install MetaMask to play Cribtori');
        return;
      }

      // Get info about the user here.
      if (sessionStorage.getItem('pk') === accounts[0]) {
        this.setState({
          username: sessionStorage.getItem('username')
        });
      } else {
        fetch('/cribtori/api/user/' + this.context.userAccount)
        .then(function(response) {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then(function(result) {
          if (result.username !== undefined) {
            // Save the username
            sessionStorage.setItem('username', result.username);
            sessionStorage.setItem('pk', accounts[0]);
            this.setState({
              username: result.username
            })
          }
        }.bind(this))
        .catch(console.error);
      }

      this.setState({userAccount: accounts[0]});
      // Tori Token
      toriToken.deployed().then((toriTokenInstance) => {
        // Tori Visit
        toriVisit.deployed().then((toriVisitInstance) => {
          // Tori Promo
          toriPromo.deployed().then((toriPromoInstance) => {
            this.setState({
              toriTokenInstance: toriTokenInstance,
              toriVisitInstance: toriVisitInstance,
              toriPromoInstance: toriPromoInstance
            }, () => {
              // Tori Accessories
              Promise.all(accessories.map((c) => c.deployed()))
              .then((instances) => {
                instances.forEach((instance) =>
                  this.setState({
                    accessoriesTokenInstances: this.state.accessoriesTokenInstances.concat(instance),
                  })
                );
              })
              .then(() => {
                this.setState({
                  loaded: true
                });
              });
            });
          });
        });
      })
      .catch(() => {
        this.setState({
          loaded: true
        });
        this.handleMessage('Please connect to Rinkeby Test Network to play Cribtori.')
      });
    });
  }

  switchDisplay(e, mode) {
    this.setState({
      mode: mode,
    });
  }

  handleCloseSnackBar() {
    this.setState({
      openSnackBar: false,
    });
  }

  handleMessage(message) {
    this.setState({
      openSnackBar: true,
      snackBarMessage: message,
    });
  }

  async handleOpenDrawer() {
    // Check the transaction status.
    // if status is already checked --> remove from transactions
    let txs = this.state.transactions.filter((entry) => entry[2] === -1);

    if (txs.length === 0) {
      this.setState({
        openDrawer: true,
        transactions: txs,
        transactionItems: [],
      });
      return;
    }

    await Promise.all(txs.map((entry) => {
      let txhash = entry[0];
      let txText = entry[1];
      let status = entry[2];

      return this.state.web3.eth.getTransaction(txhash);
    }))
    .then((results) => {
      txs = results.map((entry, i) => {
        let txhash = entry.hash;
        let bn = entry.blockNumber;
        let txText = txs[i][1];

        let st = (<CheckCircle />);
        if (bn === null) {
          // Pending.
          st = 1
        }
        return [txhash, txText, st];
      });

      let txEntries = results.map((entry, i) => {
        let txhash = entry.hash;
        let bn = entry.blockNumber;
        let txText = txs[i][1];

        let st = (<CheckCircle />);
        if (bn === null) {
          // Pending.
          st = (<MoreHoriz/>);
        }

        return (
          <ListItem key={i} >
            <Typography
              className={this.props.classes.txEntry}
              variant="subheading"
              color="inherit"
              component="p"
              align="left">
              {txText}
            </Typography>
            <Typography
              className={this.props.classes.txEntry}
              variant="subheading"
              color="inherit"
              component="p"
              align="center">
              <b>TxHash: </b> {txhash}
            </Typography>
            <Typography
              className={this.props.classes.txEntry}
              variant="subheading"
              color="inherit"
              component="p"
              align="right">
              <b>Status:</b> {st}
            </Typography>
          </ListItem>
        )
      });

      this.setState({
        openDrawer: true,
        transactions: txs,
        transactionItems: txEntries,
      });
    });
  }

  handleCloseDrawer() {
    this.setState({
      openDrawer: false,
    });
  }

  pushToDrawer(txhash, status) {
    this.setState({
      transactions: this.state.transactions.concat([[txhash, status, -1]])
    });
  }

  render() {
    let disabled = this.state.toriTokenInstance === undefined;
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Link to={'/'}>
              <img src={assets.logoWhite}
                   alt={"Cribtori"}
                   className={this.props.classes.logo} />
            </Link>
            { this.state.username && (
              <Typography className={this.props.classes.user}
                          variant="caption"
                          color="inherit"
                          align="center">
                <AccountCircle /> { this.state.username }
              </Typography>
            )}
            <Tabs value={this.state.mode}
                  onChange={this.switchDisplay}
                  className={this.props.classes.tab}>
              <Tab disabled={disabled} label="My Room" component={Link} to={'/mytoris'} />
              <Tab disabled={disabled} label="Nursery" component={Link} to={'/nursery'} />
              <Tab disabled={disabled} label="Inventory" component={Link} to={'/inventory'} />
              <Tab disabled={disabled} label="Explore" component={Link} to={'/explore'} />
              <Tab disabled={disabled} label="Marketplace" component={Link} to={'/market'} />
              <Tab label="Info" component={Link} to={'/'} />
            </Tabs>
          </Toolbar>
        </AppBar>
        <div className={this.props.classes.banner}>
        </div>
        { this.state.loaded ?
          this.state.toriTokenInstance ? (
            <Switch>
              <Route exact path='/' component={Info} />
              <Route exact path='/mytoris' component={MyTori} />
              <Route exact path='/mytoris/edit' component={EditRoom} />
              <Route exact path='/nursery' component={Nursery} />
              <Route exact path='/nursery/fuse' component={Fuse} />
              <Route exact path='/nursery/breed' component={BreedHome} />
              <Route exact path='/nursery/breed/:id' component={Breed} />
              <Route exact path='/inventory' component={Inventory} />
              <Route exact path='/explore' component={OtherToris} />
              <Route exact path='/explore/:id' component={ToriDetails} />
              <Route exact path='/market' component={Market} />
              <Route exact path='/confirmation' component={Confirmation} />
              <Route exact path='/promo' component={Promo} />
              <Route exact path='/signup' component={Register} />
              { false && (
                  <Route exact path='/admin' component={Admin} />
              )}
            </Switch>
          ) : (
            <Switch>
              <Route exact path='/' component={Info} />
              <Redirect to={{
                pathname: "/",
                state: { mode: -1 }
              }} />
            </Switch>
          )
         : (
          <CircularProgress  color="primary" />
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.openSnackBar}
          onClose={this.handleCloseSnackBar}
          snackbarcontentprops={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
        <div className={this.props.classes.footer}>
        </div>
        <a href="https://goo.gl/forms/UMr3APBwfBVZ4C1D2" >
          <IconButton
            className={this.props.classes.feedBackButton}
            variant="raised"
            color="secondary" >
            <Feedback />
          </IconButton>
        </a>
        <IconButton
          className={this.props.classes.transactionButton}
          variant="raised"
          color="primary"
          onClick={this.handleOpenDrawer} >
          <ConfirmationNumber />
        </IconButton>
        <Drawer
          className={this.props.classes.transactionDrawer}
          anchor="bottom"
          open={this.state.openDrawer}
          onClose={this.handleCloseDrawer}>
          <List className={this.props.classes.list}>
            {this.state.transactionItems.length === 0 ? (
              <ListItem>No Pending Transactions</ListItem>
            ) :
              this.state.transactionItems
            }
          </List>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(App))

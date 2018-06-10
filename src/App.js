import "babel-polyfill";
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

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
import Prompt from './Components/Prompt.js';
import Promo from './Promo/Promo.js';


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
    }

    // Function BINDS
    this.switchDisplay = this.switchDisplay.bind(this);
    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  getChildContext() {
    return {
      web3: this.state.web3,
      toriToken: this.state.toriTokenInstance,
      toriVisit: this.state.toriVisitInstance,
      toriPromo: this.state.toriPromoInstance,
      accContracts: this.state.accessoriesTokenInstances,
      userAccount: this.state.userAccount,
      onMessage: this.handleMessage
    };
  }

  async componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract();
    })
    .catch(() => {
      this.onMessage('Error finding web3.');
      this.props.history.push({
        pathname: '/prereq',
        state: {mode: 0}
      });
    });

    // Periodically check if the metamask account has changed
    setInterval( async () => {
      if (this.state.web3 !== undefined) {
        this.state.web3.eth.getAccounts((error, accounts) => {
          if (this.state.userAccount !== accounts[0]) {
            // Redirect ...
            this.setState({
              userAccount: accounts[0],
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
      this.setState({userAccount: accounts[0]});

      // Tori Token
      toriToken.deployed().then((instance) => {
        this.setState({toriTokenInstance: instance})
      })
      .catch(() => {
        this.props.history.push({
          pathname: '/prereq',
          state: {mode: 0}
        });
      });

      // Tori Visit
      toriVisit.deployed().then((instance) => {
        this.setState({toriVisitInstance: instance})
      })
      .catch(() => {
        this.props.history.push({
          pathname: '/prereq',
          state: {mode: 0}
        });
      });

      // Tori Promo
      toriPromo.deployed().then((instance) => {
        this.setState({toriPromoInstance: instance})
      })
      .catch(() => {
        this.props.history.push({
          pathname: '/prereq',
          state: {mode: 0}
        });
      });

      // Tori Accessories
      Promise.all(accessories.map((c) => c.deployed()))
      .then((instances) => {
        instances.forEach((instance) =>
          this.setState({
            accessoriesTokenInstances: this.state.accessoriesTokenInstances.concat(instance),
          })
        );
      })
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

  render() {
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Link to={'/'}>
              <img src={assets.logoWhite}
                   alt={"Cribtori"}
                   className={this.props.classes.logo} />
            </Link>
            <Tabs value={this.state.mode}
                  onChange={this.switchDisplay}
                  className={this.props.classes.tab}>
              <Tab label="My Toris" component={Link} to={'/mytoris'} />
              <Tab label="Nursery" component={Link} to={'/nursery'} />
              <Tab label="Inventory" component={Link} to={'/inventory'} />
              <Tab label="Explore" component={Link} to={'/explore'} />
              <Tab label="Marketplace" component={Link} to={'/market'} />
              <Tab label="Info" component={Link} to={'/'} />
            </Tabs>
          </Toolbar>
        </AppBar>
        <div className={this.props.classes.banner}>
        </div>
        {(this.state.accessoriesTokenInstances.length === this.state.accNum) &&
         (this.state.userAccount) &&
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
            <Route exact path='/prereq' component={Prompt} />
            <Route exact path='/promo' component={Promo} />
          </Switch>
        }
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
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(App))

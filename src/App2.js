import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

// Tori contracts
import ToriToken from '../build/contracts/ToriToken.json';
import ToriVisit from '../build/contracts/ToriVisit.json';
// Accessories contract
import WoodenDesk from '../build/contracts/WoodenDesk.json';
import WoodenCabinet from '../build/contracts/WoodenCabinet.json';
import WoodenStool from '../build/contracts/WoodenStool.json';
import WoodenBed from '../build/contracts/WoodenBed.json';
import ClothCushion from '../build/contracts/ClothCushion.json';

import getWeb3 from './utils/getWeb3';


import Info from './Info/Info.js';
import MyTori from './MyTori/MyTori.js';
import Inventory from './Inventory/Inventory.js';
import OtherToris from './Explore/OtherToris.js';
import Market from './Marketplace/Market.js';

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
  tab: {
    position: 'absolute',
    right: 0,
    marginRight: 20,
  }
});

class App extends Component {

  static childContextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriVisit: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props)

    let loc = window.location.href;
    loc = loc.split('#')[1];
    loc = loc.split('/')[1];

    const locMode = {'': 4, 'mytoris': 0, 'inventory': 1, 'explore': 2, 'market': 3}
    let currentMode = locMode[loc];

    this.state = {
      storageValue: 0,
      web3: null,
      mode: currentMode === undefined ? 4 : currentMode,
      accessoriesTokenInstances: [],
      accNum: 100,
    }

    this.switchDisplay = this.switchDisplay.bind(this);
  }

  getChildContext() {
    return {
      web3: this.state.web3,
      toriToken: this.state.toriTokenInstance,
      toriVisit: this.state.toriVisitInstance,
      accContracts: this.state.accessoriesTokenInstances,
      userAccount: this.state.userAccount,
    };
  }

  componentWillMount() {
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
      console.log('Error finding web3.')
    })
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
    toriToken.setProvider(this.state.web3.currentProvider);
    const toriVisit = contract(ToriVisit);
    toriVisit.setProvider(this.state.web3.currentProvider);
    // Accessories
    const wd = contract(WoodenDesk);
    const wc = contract(WoodenCabinet);
    const ws = contract(WoodenStool);
    const wb = contract(WoodenBed);
    const cc = contract(ClothCushion);

    let accessories = [wd, wc, ws, wb, cc];
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
      });

      // Tori Visit
      toriVisit.deployed().then((instance) => {
        this.setState({toriVisitInstance: instance})
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

  render() {
    // this.state.currentDisplay
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Cribtori
            </Typography>
            <Tabs value={this.state.mode} onChange={this.switchDisplay} className={this.props.classes.tab}>
              <Tab label="My Toris" component={Link} to={'/mytoris'} />
              <Tab label="Inventory" component={Link} to={'/inventory'} />
              <Tab label="Explore" component={Link} to={'/explore'} />
              <Tab label="Marketplace" component={Link} to={'/market'} />
              <Tab label="Info" component={Link} to={'/'} />
            </Tabs>
          </Toolbar>
        </AppBar>
        {(this.state.accessoriesTokenInstances.length === this.state.accNum) &&
         (this.state.userAccount) &&
          <Switch>
            <Route exact path='/' component={Info} />
            <Route path='/mytoris' component={MyTori} />
            <Route exact path='/inventory' component={Inventory} />
            <Route exact path='/explore' component={OtherToris} />
            <Route exact path='/market' component={Market} />
          </Switch>
        }
      </div>
    );
  }
  //            <Route exact path='/inventory' render={(props) => (<Inventory {...props} contract={this.state.}/>)} />
}

export default withStyles(styles)(App)

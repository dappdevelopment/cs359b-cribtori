import React, { Component,  PropTypes} from 'react'

import ToriOwnership from '../build/contracts/ToriOwnership.json'
import ToriAccessoriesOwnership from '../build/contracts/ToriAccessoriesOwnership.json'
import getWeb3 from './utils/getWeb3'

import MyToriDisplay from './MyToriDisplay.js'
import Inventory from './Inventory.js'
import OtherToriDisplay from './OtherToriDisplay.js'
import Trade from './Trade.js'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Toolbar from 'material-ui/Toolbar';


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


class App extends Component {

  static childContextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accToken: PropTypes.object,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      mode: 0//,
    }

    this.switchDisplay = this.switchDisplay.bind(this);
  }

  getChildContext() {
    return {
      web3: this.state.web3,
      toriToken: this.state.toriTokenInstance,
      accToken: this.state.accessoriesTokenInstance,
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
    const toriToken = contract(ToriOwnership);
    const accToken = contract(ToriAccessoriesOwnership);
    toriToken.setProvider(this.state.web3.currentProvider);
    accToken.setProvider(this.state.web3.currentProvider);

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({userAccount: accounts[0]});

      // Tori Token
      toriToken.deployed().then((instance) => {
        this.setState({toriTokenInstance: instance})
      });

      // Tori Accessories
      accToken.deployed().then((instance) => {
        this.setState({accessoriesTokenInstance: instance})
      });
    })
  }

  switchDisplay(e, mode) {
    this.setState({mode: mode});
  }

  renderSwitch() {
    switch(this.state.mode) {
      case 1:
          return <Inventory />;
      case 2:
          return <OtherToriDisplay />;
      case 3:
          return <Trade />;
      default:
        return <MyToriDisplay/>;
    }
  }

  render() {
    // console.log(this.state.toriTokenInstance);
    let currentDisplay = this.renderSwitch();
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Cribtori
            </Typography>
          </Toolbar>
          <Tabs value={this.state.mode} onChange={this.switchDisplay}>
            <Tab label="My Toris" href="#home" />
            <Tab label="Inventories" />
            <Tab label="Other Toris" />
            <Tab label="Yard Sale" />
          </Tabs>
        </AppBar>
          {this.state.toriTokenInstance &&
            currentDisplay
          }
      </div>
    );
  }
}

export default App

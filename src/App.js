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
      mode: 2//,
    }
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

  switchDisplay(mode, e) {
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
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Cribtori</a>
        </nav>

        <main className="container">
          <div className="tabs">
            <button onClick={(e) => this.switchDisplay(0, e)} >My Toris</button>
            <button onClick={(e) => this.switchDisplay(1, e)} >Inventories</button>
            <button onClick={(e) => this.switchDisplay(2, e)} >Other Toris</button>
            <button onClick={(e) => this.switchDisplay(3, e)} >Yard Sale</button>

          </div>
          {this.state.toriTokenInstance &&
            currentDisplay
          }
        </main>
      </div>
    );
  }
}

export default App

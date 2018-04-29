import React, { Component,  PropTypes} from 'react'

import ToriOwnership from '../build/contracts/ToriOwnership.json'
import getWeb3 from './utils/getWeb3'

import Trade from './Trade.js'
import Display from './Display.js'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

  static childContextTypes = {
    toriToken: PropTypes.object,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      mode: 0,
    }
  }

  getChildContext() {
    return {
      toriToken: this.state.toriTokenInstance,
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
      this.instantiateContract()
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

    const contract = require('truffle-contract')
    const toriToken = contract(ToriOwnership)
    toriToken.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({userAccount: accounts[0]});

      toriToken.deployed().then((instance) => {
        this.setState({toriTokenInstance: instance})
      })
    })
  }

  switchDisplay(mode, e) {
    this.setState({mode: mode});
  }

  renderSwitch() {
    switch(this.state.mode) {
      case 3:
          return <Trade />;
      default:
        return <Display/>;
    }
  }

  render() {
    console.log(this.state.toriTokenInstance);
    let currentDisplay = this.renderSwitch();
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <h1>Criptori</h1>
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

import React, { Component } from 'react'
import ToriFactory from '../build/contracts/ToriFactory.json'
import getWeb3 from './utils/getWeb3'

import Trade from './Trade.js'
import Display from './Display.js'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      mode: 'display',
    }
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
    const toriFactory = contract(ToriFactory)
    toriFactory.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({userAccount: accounts[0]});

      toriFactory.deployed().then((instance) => {
        this.setState({toriFactoryInstance: instance})
      })
    })
  }

  switchTrade = () => {
    this.setState({mode: 'trade'});
  }

  switchPlay = () => {
    this.setState({mode: 'play'});
  }

  switchDisplay = () => {
    this.setState({mode: 'display'});
  }

  render() {
    console.log(this.state.toriFactoryInstance)
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <h1>Criptori</h1>
          <div className="tabs">
            <button id="trade-switch" onClick={this.switchTrade} >Trade</button>
            <button id="play-switch" onClick={this.switchPlay} >Play</button>
            <button id="display-switch" onClick={this.switchDisplay} >Display</button>
          </div>
          {this.state.toriFactoryInstance && this.state.mode === 'display' &&
            <Display toriFactoryInstance={this.state.toriFactoryInstance}
                     web3={this.state.web3} />
          }
          {this.state.toriFactoryInstance && this.state.mode === 'trade' &&
            <Trade toriFactoryInstance={this.state.toriFactoryInstance}
                   web3={this.state.web3} />
          }
        </main>
      </div>
    );
  }
}

export default App

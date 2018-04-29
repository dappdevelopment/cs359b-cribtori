import React, { Component } from 'react'

import { retrieveToriCount, retrieveToriInfo } from './utils.js'

class Trade extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: this.props.web3,
      toriFactoryInstance: this.props.toriFactoryInstance,
    }

  }

  componentWillMount() {

  }

  render() {
    return (
      <div className="Trade">
        <h4>Hello World</h4>
      </div>
    );
  }
}

export default Trade

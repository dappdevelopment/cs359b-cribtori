import React, { Component, PropTypes } from 'react'

import { retrieveToriCount, retrieveToriInfo } from './utils.js'

class Trade extends Component {

  static contextTypes = {
    toriToken: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {};
    // this.context.toriToken
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

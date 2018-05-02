import React, { Component, PropTypes } from 'react'

import ToriRoom from './ToriRoom.js'

class OtherToriDisplay extends Component {

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
        <h4>Other Tori Display TBA</h4>
        <ToriRoom/>
      </div>
    );
  }
}

export default OtherToriDisplay

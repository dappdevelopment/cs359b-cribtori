import React, { Component } from 'react'
import PropTypes from 'prop-types';

class OtherToriDisplay extends Component {

  static contextTypes = {
    toriToken: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {};
  }

  render() {
    return (
      <div className="Trade">
        <h4>Other Tori Display TBA</h4>
      </div>
    );
  }
}

export default OtherToriDisplay

import React, { Component } from 'react'

import { assets } from '../assets.js';

class EggImage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    // Get the current egg status.
    let eggImg = assets.eggs[this.props.state];

    return (
      <img src={eggImg}
           style={{
             height: 75
           }}/>
    );
  }
}

export default (EggImage)

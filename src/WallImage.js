import React, { Component } from 'react'

import { assets } from './assets.js';


class WallImage extends Component {

  constructWall(orientation) {
    if (orientation === 0) {
      return (
        <div>
          <img
            src={assets.background.wall[0]}
            alt="Top wall"
            style={{
              position: 'absolute',
              zIndex: 100,
              width: `100%`,
            }} />
          <img
            src={assets.background.wall[1]}
            alt="Base wall"
            style={{
              position: 'absolute',
              zIndex: 50,
              width: `100%`,
            }} />
        </div>
      );
    } else {
      return (
        <img
          src={assets.background.wall[2]}
          alt="Base wall"
          style={{
            position: 'absolute',
            zIndex: 50,
            width: `100%`,
            transform: `rotate(${360 - (orientation - 1)*90}deg)`,
          }} />
      );
    }
  }

  render() {
    // 1: no rotate, 2: 180 rotate, 3: 270 rotate
    let orientation = this.props.orientation;
    let size = this.props.size;

    return (
      <div style={{ height: size, width: size, position: 'relative', margin: `0 auto` }}>
        { this.constructWall(orientation) }
      </div>
    );
  }
}

export default (WallImage)

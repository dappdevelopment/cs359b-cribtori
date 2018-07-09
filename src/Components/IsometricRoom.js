import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Tile from '../img/background/isometric_floor.png';

const tileWidth = 150;
const tileHeight = 75;

const xCount = 3;
const yCount = 3;

const roomWidth = tileWidth * xCount;
const roomHeight = tileHeight * xCount;

const styles = theme => ({
  room: {
    position: 'relative',
    width: roomWidth,
    height: roomHeight,
  },
  tile: {
    position: 'absolute',
    width: tileWidth,
    height: tileHeight,
    '&:hover': {
      filter: 'sepia(1)'
    }
  }
});

class IsometricRoom extends Component {
  constructor(props) {
    super(props);

    this.renderFloor = this.renderFloor.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  }

  onMouseOver(e) {
    //console.log(e.clientX)
  }

  renderFloor() {
    let floor = [];
    let count = 0;
    let top;
    let left;
    // First, build the top pyramid.
    for (let r = 0; r < yCount - 1; r++) {
      for (let c = 0; c <= r; c++) {
        top = r * tileHeight / 2;
        left = roomWidth / 2 - (r + 1) * tileWidth / 2 + c * tileWidth;
        floor.push(
          <img key={`floor_${count}`}
               src={Tile}
               className={this.props.classes.tile}
               style={{
                 top: top,
                 left: left,
               }} />
        );
        count += 1;
      }
    }

    // Second, build the mid.
    for (let c = 0; c < xCount; c++) {
      top = (yCount - 1) * tileHeight / 2;
      left = c * tileWidth;
      floor.push(
        <img key={`floor_${count}`}
             src={Tile}
             className={this.props.classes.tile}
             style={{
               top: top,
               left: left,
             }} />
      );
      count += 1;
    }

    // Third, build the bottom pyramid.
    for (let r = 0; r < yCount - 1; r++) {
      for (let c = 0; c < yCount - 1 - r; c++) {
        top = yCount * tileHeight / 2 + r * tileHeight / 2;
        left = roomWidth / 2 - (yCount - r - 1) * tileWidth / 2 + c * tileWidth;
        floor.push(
          <img key={`floor_${count}`}
               src={Tile}
               className={this.props.classes.tile}
               style={{
                 top: top,
                 left: left,
               }} />
        );
        count += 1;
      }
    }
    return floor;
  }

  render() {
    return (
      <div className={this.props.classes.room}
           onMouseOver={this.onMouseOver}>
        { this.renderFloor() }
      </div>
    );
  }
}

export default withStyles(styles)(IsometricRoom)

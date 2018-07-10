import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import ToriImage from './ToriImage.js';
import IsometricToriCell from './IsometricToriCell.js';

import Tile from '../img/background/isometric_floor.png';

import * as util from '../utils.js';

const DISTANCE_MARGIN = 50;

const tileWidth = 280;
const tileHeight = 140;
const tileSide = Math.sqrt(tileWidth * tileWidth / 4 + tileHeight * tileHeight / 4);

const xCount = 4;
const yCount = 4;

const roomWidth = tileWidth * xCount;
const roomHeight = tileHeight * yCount;

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
  },
  tori: {
    position: 'absolute',
  },
  center: {
    width: 50,
    height: 50,
    backgroundColor: 'red',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    zIndex: 1000,
    '&:hover': {
      backgroundColor: 'blue'
    }
  }
});

class IsometricRoom extends Component {
  constructor(props) {
    super(props);

    this.renderFloor = this.renderFloor.bind(this);
    this.renderToris = this.renderToris.bind(this);
    this.getRandomCoordinates = this.getRandomCoordinates.bind(this);
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

  getRandomCoordinates(isoX, isoY) {
    let totalXSide = tileSide * xCount;
    let totalYSide = tileSide * yCount;
    // Then randomly choose the offset inside the tile (with a bit of margin).
    let offsetX = Math.random() * tileSide * 0.6 + 0.2 * tileSide;
    let offsetY = Math.random() * tileSide * 0.6 + 0.2 * tileSide;
    // Finally, compose the real coordinates.
    isoX = isoX * tileSide + offsetX;
    isoY = isoY * tileSide + offsetY;

    let nx = 0;
    let ny = roomHeight / 2;

    // First, translate nx and ny by isoX, parallel to the upward slope.
    nx += (isoX / totalXSide) * roomWidth / 2;
    ny -= (isoX / totalXSide) * roomHeight / 2;

    // Next, translate nx and ny by isoY, parallel to the downward slope.
    nx += (isoY / totalYSide) * roomWidth / 2;
    ny += (isoY / totalYSide) * roomHeight / 2;

    return [nx, ny];
  }

  eucledianDistance(arr1, arr2) {
    let x = arr1[0] - arr2[0];
    let y = arr1[1] - arr2[1];
    return Math.sqrt(x*x + y*y);
  }

  renderToris() {
    let coordinates = [];
    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < yCount; j++) {
        // Only TWO toris can occupy the same tile.
        // So, when we get the random coordinates for each tile,
        // we need to make sure that they are appart by a certain margin.
        let coor1 = this.getRandomCoordinates(i, j);
        let coor2 = this.getRandomCoordinates(i, j);
        while (this.eucledianDistance(coor1, coor2) < DISTANCE_MARGIN) {
          coor1 = this.getRandomCoordinates(i, j);
          coor2 = this.getRandomCoordinates(i, j);
        }
        coordinates.push(coor1);
        coordinates.push(coor2);
      }
    }
    // Shuffle the coordinates array.
    coordinates = util.shuffle(coordinates);
    // Slice by the number of toris.
    coordinates = coordinates.slice(0, 5);

    // Sort the coordinates by y.
    coordinates.sort((a, b) => {
      return a[1] - b[1];
    });

    return coordinates.map((coor, i) => {
      return (
        <IsometricToriCell key={`tori_${i}`}
                           index={i}
                           size={165}
                           coor={coor} />
      )
    })
  }

  render() {
    return (
      <div className={this.props.classes.room}
           onMouseOver={this.onMouseOver}>
        { this.renderFloor() }
        { this.renderToris() }
      </div>
    );
  }
}

export default withStyles(styles)(IsometricRoom)

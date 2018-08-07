import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MenuList from '@material-ui/core/MenuList';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import FormatPaintIcon from '@material-ui/icons/FormatPaint';
import RestaurantIcon from '@material-ui/icons/Restaurant';

import ToriImage from './ToriImage.js';
import IsometricToriCell from './IsometricToriCell.js';
import Activation from './Activation.js';

import Tile from '../img/background/isometric_floor.png';
import ToriIcon from '../img/toriIcon_secondary.png';

import * as util from '../utils.js';
import { assets } from '../assets.js';

const DISTANCE_MARGIN = 50;

const tileWidth = 280;
const tileHeight = 140;
const tileSide = Math.sqrt(tileWidth * tileWidth / 4 + tileHeight * tileHeight / 4);

const styles = theme => ({
  room: {
    position: 'relative',
    display: 'inline-block'
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
  },
  roomWrapper: {
    marginTop: 100,
    position: 'relative'
  },
  menuList: {
    zIndex: 1100,
    display: 'block'
  },
  menuItem: {
    display: 'inline-block',
    height: 'auto'
  },
  menuBorder: {
    height: 5,
    backgroundColor: theme.palette.primary.dark,
  },
  chip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    fontSize: 18,
    padding: 10
  },
  feed: {
    cursor: `url(${assets.food}), auto`,
  }
});

class IsometricRoom extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      roomWidth: tileWidth * this.props.size,
      roomHeight: tileHeight * this.props.size,
      maxCapacity: this.props.limit,
    }

    this.renderFloor = this.renderFloor.bind(this);
    this.renderToris = this.renderToris.bind(this);
    this.getRandomCoordinates = this.getRandomCoordinates.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.handleFeed = this.handleFeed.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.refreshToris = this.refreshToris.bind(this);
  }

  componentDidMount() {
    this.refreshToris();
  }

  refreshToris() {
    // Check if toris are active.
    Promise.all(this.props.toris.map((id) => {
      return fetch(`/cribtori/api/hearts?id=${id}`)
    }))
    .then((responses) => {
      return Promise.all(responses.map((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      }))
    })
    .then((results) => {
      let activateFeed = false;
      let activeToris = this.props.toris.filter((id, i) => {
        let isActive = (results[i].id !== undefined) && (results[i].owner === this.context.userAccount);
        if (isActive) {
          activateFeed = activateFeed || results[i].is_hungry;
        }
        return isActive;
      });
      let nonactiveToris = this.props.toris.filter((id, i) => {
        return (results[i].id === undefined) || (results[i].owner !== this.context.userAccount);
      });

      this.setState({
        activateFeed: activateFeed,
        activeToris: activeToris,
        nonactiveToris: nonactiveToris
      })
    })
    .catch(console.error);
  }

  handleFeed() {
    console.log(this.state.isFeeding)
    this.setState({
      isFeeding: !this.state.isFeeding
    });
  }

  handleEdit() {

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
    for (let r = 0; r < this.props.size - 1; r++) {
      for (let c = 0; c <= r; c++) {
        top = r * tileHeight / 2;
        left = this.state.roomWidth / 2 - (r + 1) * tileWidth / 2 + c * tileWidth;
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
    for (let c = 0; c < this.props.size; c++) {
      top = (this.props.size - 1) * tileHeight / 2;
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
    for (let r = 0; r < this.props.size - 1; r++) {
      for (let c = 0; c < this.props.size - 1 - r; c++) {
        top = this.props.size * tileHeight / 2 + r * tileHeight / 2;
        left = this.state.roomWidth / 2 - (this.props.size - r - 1) * tileWidth / 2 + c * tileWidth;
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
    let totalXSide = tileSide * this.props.size;
    let totalYSide = tileSide * this.props.size;
    // Then randomly choose the offset inside the tile (with a bit of margin).
    let offsetX = Math.random() * tileSide * 0.6 + 0.2 * tileSide;
    let offsetY = Math.random() * tileSide * 0.6 + 0.2 * tileSide;
    // Finally, compose the real coordinates.
    isoX = isoX * tileSide + offsetX;
    isoY = isoY * tileSide + offsetY;

    let nx = 0;
    let ny = this.state.roomHeight / 2;

    // First, translate nx and ny by isoX, parallel to the upward slope.
    nx += (isoX / totalXSide) * this.state.roomWidth / 2;
    ny -= (isoX / totalXSide) * this.state.roomHeight / 2;

    // Next, translate nx and ny by isoY, parallel to the downward slope.
    nx += (isoY / totalYSide) * this.state.roomWidth / 2;
    ny += (isoY / totalYSide) * this.state.roomHeight / 2;

    return [nx, ny];
  }

  eucledianDistance(arr1, arr2) {
    let x = arr1[0] - arr2[0];
    let y = arr1[1] - arr2[1];
    return Math.sqrt(x*x + y*y);
  }

  renderToris() {
    if (this.state.activeToris === undefined) {
      return (<CircularProgress />);
    }
    let coordinates = [];
    for (let i = 0; i < this.props.size; i++) {
      for (let j = 0; j < this.props.size; j++) {
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
    coordinates = coordinates.slice(0, this.state.activeToris.length);

    // Sort the coordinates by y.
    coordinates.sort((a, b) => {
      return a[1] - b[1];
    });

    return coordinates.map((coor, i) => {
      return (
        <IsometricToriCell key={`tori_${i}`}
                           index={i}
                           id={this.state.activeToris[i]}
                           size={165}
                           coor={coor} />
      )
    })
  }

  render() {
    let actionCursor = (
      this.state.feeding ?
        this.props.classes.feed
      : '');

    return (
      <div className={this.props.classes.room}>
        <MenuList className={this.props.classes.menuList}>
          <Grid container spacing={8}
                          alignItems={'center'}
                          direction={'row'}
                          justify={'center'}>
            <Grid item xs={4}>
              <Typography variant="caption" color="inherit" align="center">
                Room Limit
              </Typography>
              { this.state.maxCapacity ? (
                <Chip avatar={<Avatar src={ToriIcon} />}
                      label={`${this.props.toris.length} / ${this.state.maxCapacity}`}
                      className={this.props.classes.chip}/>
              ) : (
                <CircularProgress />
              )}
            </Grid>
            <Grid item xs={3}>
              <Button disabled={!this.state.activateFeed}
                      variant="contained"
                      color="secondary"
                      onClick={this.handleFeed}
                      className={this.props.classes.menuItem}>
                <Typography variant="caption" color="inherit" align="center">
                  <RestaurantIcon />
                </Typography>
                <Typography variant="caption" color="inherit" align="center">
                  Feed Tori
                </Typography>
              </Button>
            </Grid>
            { false && (
              <Grid item xs={3}>
                <Button disabled // TODO
                        variant="contained"
                        color="secondary"
                        onClick={this.handleEdit}
                        className={this.props.classes.menuItem}>
                  <Typography variant="caption" color="inherit" align="center">
                    <FormatPaintIcon />
                  </Typography>
                  <Typography variant="caption" color="inherit" align="center">
                    Edit Room
                  </Typography>
                </Button>
              </Grid>
            )}
            <Grid item xs={3}>
              { this.state.nonactiveToris === undefined ? (
                <CircularProgress />
              ) : (
                <Activation nonactiveToris={this.state.nonactiveToris}
                            refreshToris={this.refreshToris}/>
              )}
            </Grid>
            <Grid item xs={12} className={this.props.classes.menuBorder}>
            </Grid>
          </Grid>
        </MenuList>
        <div className={`${this.props.classes.roomWrapper} ${actionCursor}`}
             style={{
               height: this.state.roomHeight,
               width: this.state.roomWidth
             }}>
          { this.renderFloor() }
          { this.renderToris() }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(IsometricRoom)

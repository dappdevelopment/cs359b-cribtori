import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { assets } from '../assets.js';

import WallImage from './WallImage.js';
import ToriCell from './ToriCell.js';

const unit = 80;
const LIM = 5;

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    minWidth: unit * (LIM + 2),
    width: unit * (LIM + 2),
  },
  gridTile: {
    backgroundImage: `url(${assets.background.floor[0]})`,
    backgroundSize: unit,
  },
  gridEmpty: {
    backgroundColor: theme.palette.primary.main,
    width: `90%`,
    height: `90%`,
    opacity: 0.3,
    margin: `5%`
  },
  perspectiveRoot: {
    perspective: 200,
  }
});

class Room extends Component {

  static contextTypes = {
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    // Function BINDS
    this.constructGrid = this.constructGrid.bind(this);
    this.constructEmptyGrid = this.constructEmptyGrid.bind(this);
    this.constructWall = this.constructWall.bind(this);
    this.constructTori = this.constructTori.bind(this);
    this.constructAccessory = this.constructAccessory.bind(this);
    this.reassignLayout = this.reassignLayout.bind(this);
    this.onEmptyTileClick = this.onEmptyTileClick.bind(this);
    this.onFullTileClick = this.onFullTileClick.bind(this);
  }

  constructWall(o, key) {
    return (
      <GridListTile key={key}
                    cols={1}>
        { o !== -1 &&
          <WallImage size={unit}
                     orientation={o} />
        }
      </GridListTile>
    );
  }

  constructEmptyGrid(x, y) {
    if (this.props.isEdit && this.props.selectedItem && this.props.selectedItem.name) {
      return (
        <GridListTile key={`cell_${x}_${y}`}
                      onClick={(e) => this.onEmptyTileClick(x, y, e)}
                      className={this.props.classes.gridTile}
                      cols={1}>
          <div className={this.props.classes.gridEmpty}></div>
        </GridListTile>
      );
    } else {
      return (
        <GridListTile key={`cell_${x}_${y}`}
                      className={this.props.classes.gridTile}
                      cols={1}>
        </GridListTile>
      );
    }
  }

  constructGrid() {
    let cells = [];
    // Construct top wall.
    for (let x = 0; x < this.props.width + 2; x++) {
      let o = (x === 0) ? 1 : (x === this.props.width + 2 - 1) ? 3 : 0;
      cells.push(this.constructWall(o, `wall_${x}_top`));
    }

    for (let y = 0; y < this.props.height; y++) {
      for (let x = 0; x < this.props.width + 2; x++) {
        if (y === this.props.height - 1 && x === this.props.width - Math.floor(this.props.width / 2)) {
          cells.push(
            <GridListTile key={`wall_${x}`}
                            className={this.props.classes.gridTile}
                            cols={1}>
              <img src={assets.background.door} alt={'Door'} />
            </GridListTile>
          );
        } else if (x === 0 || x === this.props.width + 1) {
          // Construct wall.
          let o = (x === 0) ? 1 : (x === this.props.width + 2 - 1) ? 3 : 0;
          cells.push(this.constructWall(o, `wall_${o}_${y}`));
        } else {
          // Empty Grid.
          cells.push(this.constructEmptyGrid(x - 1, y));
        }
      }
    }

    // Construct bottom wall.
    for (let x = 0; x < this.props.width + 2; x++) {
      if (x === this.props.width - Math.floor(this.props.width / 2)) {
        // Construct door.
        cells.push(this.constructWall(-1, `wall_${x}_bottom`));
      } else {
        let o = (x === 0 || x === this.props.width + 1) ? -1 : 2;
        cells.push(this.constructWall(o, `wall_${x}_bottom`));
      }
    }
    return cells;
  }

  constructTori(id, x, y) {
    let bubble;
    if (this.props.bubbles !== undefined) {
      bubble = this.props.bubbles[id];
    }
    if (this.props.isEdit && (!this.props.selectedItem || !this.props.selectedItem.name)) {
      return (
        <GridListTile key={`tori_${x}_${y}`}
                      onClick={(e) => this.onFullTileClick(x, y, e)}
                      className={this.props.classes.gridTile}
                      cols={1}
                      rows={1} >
          <ToriCell id={id}
                    unit={unit}
                    bubble={bubble} />
        </GridListTile>
      );
    } else {
      return (
        <GridListTile key={`tori_${x}_${y}`}
                      onClick={ () => this.props.onToriClick(id) }
                      className={this.props.classes.gridTile}
                      cols={1}
                      rows={1} >
          <ToriCell id={id}
                    unit={unit}
                    bubble={bubble} />
        </GridListTile>
      );
    }
  }

  constructAccessory(key, space, x, y) {
    if (this.props.isEdit && (!this.props.selectedItem || !this.props.selectedItem.name)) {
      return (
        <GridListTile key={`${key}_${x}_${y}`}
                      onClick={(e) => this.onFullTileClick(x, y, e)}
                      className={this.props.classes.gridTile}
                      cols={space}
                      rows={1} >
          <img src={assets.accessories[key]} alt={key} />
        </GridListTile>
      );
    } else {
      return (
        <GridListTile key={`${key}_${x}_${y}`}
                      className={this.props.classes.gridTile}
                      cols={space}
                      rows={1} >
          <img src={assets.accessories[key]} alt={key} />
        </GridListTile>
      );
    }
  }

  reassignLayout(cells) {
    // Check the layout.
    let layout = this.props.layout;
    // if (!this.props.isEdit &&
    //     this.props.layout.length === 0 &&
    //     this.props.firstTori !== undefined) {
    //     // Fill in with the first tori, if any.)
    //     layout = [{
    //       c: this.props.width - Math.floor(this.props.width / 2) - 1,
    //       r: 0,
    //       key: 'tori',
    //       id: this.props.firstTori,
    //     }];
    // }

    layout.forEach((content) => {
      let x = content.c;
      let y = content.r;
      let key = content.key;
      let space = content.s;

      let c;
      if (key === 'tori') {
        c = this.constructTori(content.id, x, y);
      } else {
        c = this.constructAccessory(content.key, space, x, y);
      }

      // Filterout the cells
      cells = cells.map((oldC) => {
        let oKey = oldC.key;
        let temp = oKey.split('_');

        if (temp[0] === 'wall') {
          return oldC;
        } else {
          let oX = parseInt(temp[1], 10);
          let oY = parseInt(temp[2], 10);

          if (oX === x && oY === y) {
            return c;
          } else {
            return oldC;
          }
        }
      });

      if (space > 1) {
        // Horizontal by default
        let nX = x + 1;
        let nY = y;

        cells = cells.filter((c) => {
          let oKey = c.key;
          let temp = oKey.split('_');
          if (temp[0] === 'wall') {
            return true;
          }
          let oX = parseInt(temp[1], 10);
          let oY = parseInt(temp[2], 10);

          return (oY !== nY || oX !== nX);
        });
      }
    });

    return cells;
  }

  onEmptyTileClick(x, y, e) {
    // Update cell.
    let key = this.props.selectedItem.key;
    let space = this.props.selectedItem.space;
    let layout = this.props.layout;

    // TODO: support different orientation.
    if (space > 1) {
      let valid = true;
      // Check if on edge
      // TODO: give error message, for now, just ignore.
      if (x === this.props.width - 1) valid = false;

      let nX = x + 1;
      let nY = y;

      // Check if it collides with entrane
      if (nX === this.props.width - Math.floor(this.props.width / 2) - 1 &&
          nY === this.props.height - 1) {
        valid = false;
      }

      // Check if collide with other accessories.
      layout.forEach((l) => {
        if (l.c === nX && l.r === nY) {
          valid = false;
        }
      });

      if (!valid) {
        this.context.onMessage('Not a valid placement.');
        return;
      }
    }

    let l = {
      key: key,
      id: (this.props.selectedItem.id === undefined) ? -1 : this.props.selectedItem.id,
      c: x,
      r: y,
      s: space,
    };

    layout = layout.concat(l);
    this.props.onItemPlaced(layout, l);
  }

  onFullTileClick(x, y, e) {
    // Get the item we're selecting.
    let item;
    let filtered = this.props.layout.filter((l) => {
      if (l.c === x && l.r === y) item = l;
      return !(l.c === x && l.r === y);
    });

    this.props.onItemRemoved(filtered, item);
  }

  render() {
    let cells = this.constructGrid();

    // Iterate through layout and reassign.
    cells = this.reassignLayout(cells);

    return (
      <div className={this.props.classes.root}>
        <GridList cellHeight={unit}
                  style={{
                    minWidth: unit * (this.props.width + 2),
                    width: unit * (this.props.width + 2)
                  }}
                  cols={this.props.width + 2}
                  spacing={0}>
          {cells}
        </GridList>
      </div>
    );
  }
}

export default withStyles(styles)(Room)

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

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
  constructor(props) {
    super(props);

    // Function BINDS
    this.constructGrid = this.constructGrid.bind(this);
    this.constructWall = this.constructWall.bind(this);
    this.constructTori = this.constructTori.bind(this);
    this.reassignLayout = this.reassignLayout.bind(this);
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
          cells.push(
            <GridListTile key={`cell_${x - 1}_${y}`}
                          className={this.props.classes.gridTile}
                          cols={1}>
            </GridListTile>
          );
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
    return (
      <GridListTile key={`tori_${x}_${y}`}
                    className={this.props.classes.gridTile}
                    cols={1}
                    rows={1} >
        <ToriCell id={id} unit={unit} />
      </GridListTile>
    );
  }

  reassignLayout(cells) {
    // TODO: remove this
    let layout = [{
      c: 0,
      r: 0,
      key: 'tori',
      id: 0,
    }];

    layout.forEach((content) => {
      let x = content.c;
      let y = content.r;
      let key = content.key;

      let c;
      if (key === 'tori') {
        c = this.constructTori(content.id, x, y);
      } else {
        // TODO
        c = this.constructTori(content.id, x, y);
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
    });

    return cells;
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

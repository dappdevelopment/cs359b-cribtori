import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { assets } from './assets.js';

import ToriImage from './ToriImage.js';
import WallImage from './WallImage.js';

const LIM = 5;
const unit = 80;

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


class ToriRoom extends Component {

  constructor(props) {
    super(props)

    this.state = {
      cells: [],
      isSelecting: false,
      layout: [],
      isEdit: this.props.edit,
    }
  }

  componentDidMount() {
    this.constructLayout();
  }

  constructLayout() {
    // Construct the initial layout.
    let layout = [
      {
          key: 'tori',
          c: 2,
          r: 2,
          s: 1,
          o: 0,
      },
    ];

    this.props.layout.forEach((l) => {
      // Modify the layout indicator.
      layout = layout.concat(l)
    });

    this.setState({
      layout: layout,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props && this.props.acc) {
      if (this.props.acc.key !== undefined) {
        this.onItemSelected();
      } else if (prevProps.acc.key) {
        // We just unselect an item.
        this.setState({
          isSelecting: false,
        }, () => this.constructLayout());
      }
    }
  }

  constructToriCell(col, row, unit) {
    let toriCell;
    if (this.props.visitDna !== undefined) {
      toriCell = (
        <div className={this.props.classes.perspectiveRoot}>
          <ToriImage dna={this.props.visitDna}
                     size={unit}
                     sharing={'guest'} />
          <ToriImage dna={this.props.dna}
                     size={unit}
                     sharing={'host'} />
        </div>
      );
    } else {
      console.log('other', this.props.visitDna)
      toriCell = (<ToriImage dna={this.props.dna} size={unit} />);
    }
    return toriCell;
  }

  constructCells() {
    // First, construct all grid with Wall.
    let cells = [];
    for (var idx = 0; idx < LIM + 2; idx++) {
      let o = (idx === 0) ? 1 : (idx === LIM + 2 - 1) ? 3 : 0;
      let c = (
        <GridListTile key={`wall_${idx}_top`}
                      cols={1}>
          <WallImage size={unit}
                     orientation={o} />
        </GridListTile>
      );
      cells.push(c);
    }

    for (idx = 0; idx < LIM * (LIM + 2); idx++) {
      let x = idx % (LIM + 2) - 1;
      let y = Math.floor(idx / (LIM + 2));

      let o = (x === -1) ? 1 : 3;
      let c;
      if (x === -1 || x === LIM) {
        c = (
          <GridListTile key={`wall_${o}_${y}`}
                        cols={1}>
            <WallImage size={unit}
                       orientation={o} />
          </GridListTile>
        );
      } else if (x === 2 && y === LIM - 1) {
        c = (
          <GridListTile key={`cell_${x}_${y}`}
                        className={this.props.classes.gridTile}
                        cols={1}>
            <img src={assets.background.door} alt={'Door'} />
          </GridListTile>
        )
      } else if (this.state.isSelecting) {
        c = (
          <GridListTile onClick={(e) => this.onEmptyTileClick(x, y, e)}
                        key={`cell_${x}_${y}`}
                        className={this.props.classes.gridTile}
                        cols={1}>
            <div className={this.props.classes.gridEmpty}></div>
          </GridListTile>
        )
      } else {
        c = (
          <GridListTile key={`cell_${x}_${y}`}
                        className={this.props.classes.gridTile}
                        cols={1}>
          </GridListTile>
        )
      }
      cells.push(c);
    };

    for (idx = 0; idx < LIM + 2; idx++) {
      let c = (
        <GridListTile key={`wall_${idx}_bottom`}
                      cols={1}>
          {idx !== 0 && idx !== 3 && idx !== LIM + 1 && (
            <WallImage size={unit}
                       orientation={2} />
          )}
        </GridListTile>
      );
      cells.push(c);
    }

    // Second, iterate through layout and reassign cells.
    this.state.layout.forEach((content) => {
      let x = content.c;
      let y = content.r;
      let key = content.key;
      let space = content.s;
      let orientation = content.o;
      let col = 1;
      let row = 1;
      if (space > 1) {
        if (orientation === 0) {
          col = space;
        } else {
          row = space;
        }
      }

      let c;
      if (key === 'tori') {
        let toriCell = this.constructToriCell(col, row, unit);
        if (this.state.isEdit) {
          c = (
            <GridListTile key={`${key}_${x}_${y}`}
                          className={this.props.classes.gridTile}
                          cols={col}
                          rows={row} >
              { !this.props.isVisit &&
                toriCell
              }
            </GridListTile>
          );
        } else {
          c = (
            <GridListTile key={`${key}_${x}_${y}`}
                          onClick={this.props.handleToriClick}
                          className={this.props.classes.gridTile}
                          cols={col}
                          rows={row} >
              { !this.props.isVisit &&
                toriCell
              }
            </GridListTile>
          );
        }
      } else if (this.state.isEdit && !this.state.isSelecting) {
        c = (
          <GridListTile key={`${key}_${x}_${y}`}
                        onClick={(e) => this.onFullTileClick(x, y, e)}
                        className={this.props.classes.gridTile}
                        cols={col}
                        rows={row} >
            <img src={assets.accessories[key]} alt={key} />
          </GridListTile>
        );
      } else {
        c = (
          <GridListTile key={`${key}_${x}_${y}`}
                        className={this.props.classes.gridTile}
                        cols={col}
                        rows={row} >
            <img src={assets.accessories[key]} alt={key} />
          </GridListTile>
        );
      }

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

      // TODO: how about orientation? For now only handle horizontal orientation.
      if (space > 1) {
        // Horizontal by default
        let nX = x + 1;
        let nY = y;
        if (orientation === 1) {
          nX = x;
          nY = y + 1;
        }

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

  onItemSelected() {
    this.setState({
      isSelecting: true,
    })
  }

  onFullTileClick(x, y, e) {
    let layout = this.state.layout;
    layout = layout.filter((l) => {
      return !(l.c === x && l.r === y);
    });

    this.setState({
      layout: layout,
      isSelecting: false,
    }, () => this.props.onItemPlaced(layout, true));
  }

  onEmptyTileClick(x, y, e) {
    // Update cell.
    let key = this.props.acc.key;
    let space = this.props.acc.space;
    let orientation = this.props.acc.orientation;
    let layout = this.state.layout;

    if ((x === LIM - 1 && space > 1 && orientation === 0) ||
        (y === LIM - 1 && space > 1 && orientation === 1)) {
      this.setState({
        isSelecting: false,
      }, () => this.props.onItemPlaced(layout, false));
      return;
    }
    // Check if it collides with other accessories.
    if (space > 1) {
      // Horizontal by default
      let nX = x + 1;
      let nY = y;
      if (orientation === 1) {
        nX = x;
        nY = y + 1;
      }
      // Check if it collides with the entrance.
      let notValid = (nX === 2 && nY === LIM - 1);
      layout.forEach((l) => {
        if (l.c === nX && l.r === nY) {
          notValid = true;
        }
      });
      if (notValid) {
        this.setState({
          isSelecting: false,
        }, () => this.props.onItemPlaced(layout, false));
        return;
      }
    }

    let l = {
      key: key,
      c: x,
      r: y,
      s: space,
      o: orientation,
    };

    layout = layout.concat(l);

    this.setState({
      layout: layout,
      isSelecting: false,
    }, () => this.props.onItemPlaced(layout, true));
  }

  render() {
    let cells = this.constructCells();
    return (
      <div className={this.props.classes.root}>
        <GridList cellHeight={unit}
                  className={this.props.classes.gridList}
                  cols={7}
                  spacing={0}>
          {cells}
        </GridList>
      </div>
    );
  }
}

export default withStyles(styles)(ToriRoom)

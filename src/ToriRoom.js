import React, { Component } from 'react'

import { withStyles } from 'material-ui/styles';
import GridList, { GridListTile } from 'material-ui/GridList';

import { assets } from './assets.js';

import ToriImage from './ToriImage.js';

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
    width: 400,
    height: 400,
  },
  gridTile: {
    backgroundImage: `url(${assets.background.floor[0]})`,
    backgroundSize: 80,
  },
  gridEmpty: {
    backgroundColor: theme.palette.primary.main,
    width: `90%`,
    height: `90%`,
    opacity: 0.3,
    margin: `5%`
  }
});


class ToriRoom extends Component {

  constructor(props) {
    super(props)

    this.state = {
      cells: [],
      isSelecting: false,
      layout: [],
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
      },
    ];

   this.props.layout.forEach((l) => {
     l.img = assets.accessories[l.key];

     // Modify the layout indicator.
     layout = layout.concat(l)
   });

    this.setState({
      layout: layout,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      // TODO: check if empty.
      // if (this.props.acc && this.props.acc.key !== undefined) {
      //   this.onItemSelected();
      // } else {
      //   // TODO: Reset the layout.
      //   if (this.props.acc.refresh || (prevProps.layout.length === 0 && this.props.layout.length > 0)) {
      //     this.constructLayout();
      //   }
      // }
    }
  }

  constructCells() {
    // First, construct all grid with Floor.
    let cells = [];
    for (var idx = 0; idx < LIM * LIM; idx++) {
      let x = idx % LIM;
      let y = Math.floor(idx / LIM);
      let c;
      if (this.state.isSelecting) {
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
      cells[idx] = c;
    };

    // Second, iterate through layout and reassign cells.
    this.state.layout.forEach((content) => {
      let x = content.c;
      let y = content.r;
      let img = content.img;
      let key = content.key;
      let space = content.s;

      let c;
      if (key === 'tori') {
        c = (
          <GridListTile key={`${key}_${x}_${y}`} onClick={(e) => this.onFullTileClick(x, y, e)} className={this.props.classes.gridTile} cols={space}>
            <ToriImage dna={this.props.dna} size={80} />
          </GridListTile>
        );
      } else if (key !== 'tori' && !this.state.isSelecting) {
        c = (
          <GridListTile key={`${key}_${x}_${y}`} onClick={(e) => this.onFullTileClick(x, y, e)} className={this.props.classes.gridTile} cols={space}>
            <img src={img} alt={key} />
          </GridListTile>
        );
      } else {
        c = (
          <GridListTile key={`${key}_${x}_${y}`} className={this.props.classes.gridTile} cols={space}>
            <img src={img} alt={key} />
          </GridListTile>
        );
      }

      cells = cells.map((oldC) => {
        let oKey = oldC.key;
        let temp = oKey.split('_');
        let oX = parseInt(temp[1], 10);
        let oY = parseInt(temp[2], 10);

        if (oX === x && oY === y) {
          return c;
        } else {
          return oldC;
        }
      });

      // TODO: how about orientation? For now only handle horizontal orientation.
      if (space > 1) {
        cells = cells.filter((c) => {
          let oKey = c.key;
          let temp = oKey.split('_');
          let oX = parseInt(temp[1], 10);
          let oY = parseInt(temp[2], 10);

          return (oY !== y || oX !== x + 1);
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
    }, () => this.props.onItemPlaced(layout));
  }

  onEmptyTileClick(x, y, e) {
    // Update cell.
    let key = this.props.acc.key;
    let space = this.props.acc.space;
    let img = this.props.acc.img;
    let layout = this.state.layout;

    // TODO: Check if valid size.
    // TODO: handle different orientation.
    if (x === LIM - 1 && space > 1) {
      this.setState({
        isSelecting: false,
      }, () => this.props.onItemPlaced(layout));
      return;
    }

    // TODO: update with size.
    let l = {
      key: key,
      img: img,
      c: x,
      r: y,
      s: space,
    };

    layout = layout.concat(l);

    this.setState({
      layout: layout,
      isSelecting: false,
    }, () => this.props.onItemPlaced(layout));
  }

  render() {
    let cells = this.constructCells();
    return (
      <div className={this.props.classes.root}>
        <GridList cellHeight={80}
                  className={this.props.classes.gridList}
                  cols={5}
                  spacing={0}>
          {cells}
        </GridList>
      </div>
    );
  }
}

export default withStyles(styles)(ToriRoom)

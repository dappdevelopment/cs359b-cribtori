import React, { Component } from 'react'

import { withStyles } from 'material-ui/styles';
import GridList, { GridListTile } from 'material-ui/GridList';

// Import Image
import Floor from '../public/img/floor.png';

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
    backgroundImage: `url(${Floor})`,
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
      layoutIndicator: []
    }
  }

  componentDidMount() {
    // TODO: get info about the layout here.

    // Construct the initial layout.
    let layout = [
      {
          key: 'tori',
          img: 'mockimg/tori-sample.png',
          col: 2,
          row: 2,
          space: 1,
      },
    ];

    let layoutIndicator = [0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0,
                           0, 0, 1, 0, 0,
                           0, 0, 0, 0, 0,
                           0, 0, 0, 0, 0]

    // TODO: modify the layoutIndicator based on the retrieved layout.

    this.setState({
      layout: layout,
      layoutIndicator: layoutIndicator
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      // TODO: check if empty.
      if (this.props.acc.key !== undefined) {
        this.onItemSelected();
      }
    }
  }

  constructCells() {
    let idx = 0;
    // First, construct all grid with Floor.
    let cells = this.state.layoutIndicator.map((val) => {
      let x = idx % LIM;
      let y = Math.floor(idx / LIM);
      let c;
      if (val === 0 && this.state.isSelecting) {
        c = (
          <GridListTile onClick={(e) => this.onTileClick(x, y, e)}
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
      idx += 1;
      return c;
    });

    // Second, iterate through layout and reassign cells.
    this.state.layout.forEach((content) => {
      let x = content.col;
      let y = content.row;
      let img = content.img;
      let key = content.key;
      let space = content.space;

      let c = (
        <GridListTile key={`${key}_${x}_${y}`} className={this.props.classes.gridTile} cols={space}>
          <img src={img} alt={key} />
        </GridListTile>
      );

      cells[y*LIM + x] = c;

      // TODO: how about orientation?
      if (space > 1) {
        cells.splice(y*LIM + x + 1, 1);
      }
    });

    return cells;
  }

  onItemSelected() {
    this.setState({
      isSelecting: true,
    })
  }

  onTileClick(x, y, e) {
    console.log('clicked', x, y)
    // TODO: Check if valid size.

    // Update cell.
    let key = this.props.acc.key;
    let space = this.props.acc.space;
    let img = this.props.acc.img;

    // TODO: update with size.
    let l = {
      key: key,
      img: img,
      col: x,
      row: y,
      space: space,
    };

    let layoutIndicator = this.state.layoutIndicator;
    layoutIndicator[y*LIM + x] = 1;
    let layout = this.state.layout;

    this.setState({
      layoutIndicator: layoutIndicator,
      layout: layout.concat(l),
      isSelecting: false,
    })
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

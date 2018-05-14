import React, { Component } from 'react'

import { withStyles } from 'material-ui/styles';
import GridList, { GridListTile } from 'material-ui/GridList';

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
    display: `inline-block`
  },
  gridEmpty: {
    backgroundColor: theme.palette.primary.main,
    width: `90%`,
    height: `90%`,
    opacity: 0.3,
    margin: `5%`
  }
});


class Example extends Component {

  constructor(props) {
    super(props)

  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <GridList cellHeight={unit}
                  className={this.props.classes.gridList}
                  cols={2}
                  spacing={0}
                  component={'div'}>
          <GridListTile className={this.props.classes.gridTile}
                        cols={1}
                        rows={2}
                        component={'div'}>
            <div className={this.props.classes.gridEmpty}></div>
          </GridListTile>
          <GridListTile className={this.props.classes.gridTile}
                        cols={1}
                        rows={1}
                        component={'div'}>
            <div className={this.props.classes.gridEmpty}></div>
          </GridListTile>
          <GridListTile className={this.props.classes.gridTile}
                        cols={1}
                        rows={1}
                        component={'div'}>
            <div className={this.props.classes.gridEmpty}></div>
          </GridListTile>
        </GridList>
      </div>
    );
  }
}

export default withStyles(styles)(Example)

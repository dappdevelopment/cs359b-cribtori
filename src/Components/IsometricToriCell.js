import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';

import ToriImage from './ToriImage.js';

import * as util from '../utils.js';
import { assets } from '../assets.js';

const styles = theme => ({
  tori: {
    position: 'absolute',
  },
  center: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    '&:hover': {
    },
  },
  chip: {
    position: 'absolute',
    top: -10,
    left: -20,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    margin: theme.spacing.unit,
    zIndex: 1001
  },
});

class IsometricToriCell extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      showChip: false,
      bubble: undefined,
    }

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.props.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        loaded: true,
        info: info,
      })
    })
    .catch(console.error);
  }

  onMouseOver(e) {
    this.setState({
      bubble: assets.reactions.hearts,
      showChip: true,
    })
  }

  onMouseOut(e) {
    this.setState({
      bubble: undefined,
      showChip: false
    })
  }

  onClick() {
    console.log('clicked');
  }

  render() {
    if (!this.state.loaded) return (<CircularProgress  color="secondary" />);

    return (
      <div className={this.props.classes.tori}
           style={{
             left: this.props.coor[0] - this.props.size / 2,
             top: this.props.coor[1] - this.props.size * 0.9,
           }} >
        <div style={{zIndex: this.props.index}}>
          <ToriImage special={this.state.info.special}
                     generation={this.state.info.generation}
                     dna={this.state.info.dna}
                     size={this.props.size}
                     bubble={this.state.bubble}/>
        </div>
        <div className={this.props.classes.center}
             onClick={this.onClick}
             onMouseOver={this.onMouseOver}
             onMouseOut={this.onMouseOut}
             style={{
               width: this.props.size / 3,
               height: this.props.size / 3,
               marginLeft: - this.props.size / 6,
             }}>
        </div>
        {this.state.showChip && (
          <Chip label={`${this.state.info.name} (Lvl. ${this.state.info.level})`}
                className={this.props.classes.chip} />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(IsometricToriCell)

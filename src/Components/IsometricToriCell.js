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
    backgroundColor: 'red',
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    '&:hover': {
      backgroundColor: 'blue'
    }
  },
  chip: {
    position: 'absolute',
    top: 0,
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
      loaded: true,//false,
      showChip: false,
      special: 0,
      generation: 1,
      dna: 0,
      bubble: undefined,
    }

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    // util.retrieveTokenInfo(this.context.toriToken, this.props.id, this.context.userAccount)
    // .then((result) => {
    //   let info = util.parseToriResult(result);
    //   this.setState({
    //     loaded: true,
    //     info: info,
    //   })
    // })
    // .catch(console.error);
  }

  onMouseOver(e) {
    this.setState({
      bubble: assets.reactions.hearts
    })
  }

  onMouseOut(e) {
    this.setState({
      bubble: undefined
    })
  }

  onClick() {
    this.setState({
      showChip: !this.state.showChip
    })
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
          <ToriImage special={this.state.special}
                     generation={this.state.generation}
                     dna={this.state.dna}
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
          <Chip label="Tori. Lvl. 1" className={this.props.classes.chip} />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(IsometricToriCell)

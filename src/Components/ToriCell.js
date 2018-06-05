import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import ToriImage from './ToriImage.js';

import * as util from '../utils.js';


const styles = theme => ({

});

class ToriCell extends Component {
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
    }
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

  render() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.loaded) {
      content = (
        <ToriImage special={this.state.info.special}
                   generation={this.state.info.generation}
                   dna={this.state.info.dna}
                   size={this.props.unit}
                   bubble={this.props.bubble} />
      );
    }
    return content;
  }
}

export default withStyles(styles)(ToriCell)

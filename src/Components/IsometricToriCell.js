import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

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
  },
  hover: {
    '&:hover': {
      cursor: 'pointer'
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
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
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
    this.feedTori = this.feedTori.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.props.id, this.context.userAccount)
    .then((result) => {
      let info = util.parseToriResult(result);

      fetch(`/cribtori/api/hearts?id=${this.props.id}`)
      .then((response) => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then((result) => {
        this.setState({
          loaded: true,
          info: info,
          hearts: result.hearts
        })
      })
      .catch(console.error);
    })
    .catch(console.error);
  }

  feedTori() {
    let data = {
      id: this.props.id
    }
    fetch('/cribtori/api/hearts/feed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
      this.props.feedHandler();
      if (response.ok) {
        return response.json();
      } else {
        // TODO: show different error message for feeding / disable feeding if not valid.
        this.context.onMessage(`${this.state.info.name} feeding failed.`);
      }
    })
    .then((result) => {
      this.setState({
        hearts: result.hearts,
      })
      this.context.onMessage(`${this.state.info.name} eats happily.`);
    })
    .catch(console.error)
  }

  onMouseOver(e) {
    if (this.props.isFeeding) return;
    let bubble;
    if (this.state.hearts < 0) {
      bubble = assets.reactions.sad;
    } else if (this.state.hearts > 0.75) {
      bubble = assets.reactions.hearts;
    } else {
      bubble = assets.reactions.smile;
    }
    this.setState({
      bubble: bubble,
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
    if (this.props.isFeeding) {
      this.feedTori();
    } else {
      // Redirect to details page.
      this.props.history.push('/explore/' + this.props.id);
    }
  }

  render() {
    if (!this.state.loaded) return (<CircularProgress  color="secondary" />);

    let actionCursor = (this.props.isFeeding ? '' : this.props.classes.hover);

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
                     bubble={this.state.bubble}
                     index={this.props.index} />
        </div>
        <div className={`${this.props.classes.center} ${actionCursor}`}
             onClick={this.onClick}
             onMouseOver={this.onMouseOver}
             onMouseOut={this.onMouseOut}
             style={{
               width: this.props.size / 3,
               height: this.props.size / 3,
               marginLeft: - this.props.size / 6,
               zIndex: 1000 ,
             }}>
        </div>
        {this.state.showChip && (
          <Chip label={`${this.state.info.name} (Lvl. ${this.state.info.level})`}
                className={this.props.classes.chip}
                style={{
                  zIndex: 10 * this.props.index + 1,
                }}/>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(IsometricToriCell))

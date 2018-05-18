import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import { HeartHalfFull } from 'mdi-material-ui';

import Button from '@material-ui/core/Button';

import * as util from './utils.js';

import ToriImage from './ToriImage.js';

const HEART_LIM = 5;

const styles = theme => ({

});

class ToriVisitItem extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    // TODO: get the heart from the activities
    fetch('/cribtori/hearts/' + this.props.toriId)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(function(data) {
      if (data.hearts) {
        this.setState({
          hearts: Math.max(data.hearts, 0),
        });
      }
    }.bind(this))
    .catch(console.err);

    util.retrieveTokenInfo(this.context.toriToken, this.props.toriId, this.context.userAccount).then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        toriInfo: info,
      });
    });
  }


  render() {
    return (
      <ListItem>
        { this.state.toriInfo &&
          <div>
            {this.state.toriInfo.name}
            <ToriImage dna={this.state.toriInfo.dna} size={50} />
            <Button variant="raised" color="secondary">
              Select
            </Button>
          </div>
        }
      </ListItem>
    );
  }
}

export default withStyles(styles)(ToriVisitItem)

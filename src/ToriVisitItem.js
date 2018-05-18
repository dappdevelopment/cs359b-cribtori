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

    this.selectTori = this.selectTori.bind(this);
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

  selectTori() {
    // TODO: Call contract here for generating new tori.
    // TODO: add label for My tori that the selected tori is visiting (disable any actions)
    // TODO: create a 'mapping' (?) so we know whether our tori is being visited or not
    // TODO: create a timer on when the visitation is going to end
    // TODO: for now, ask user to manually call the smart contract to generate a new tori
    // TODO: new tori is assigned to the user, and all flags are resetted. 
    console.log('Tori selected');
  }

  render() {
    return (
      <ListItem>
        { this.state.toriInfo &&
          <div>
            {this.state.toriInfo.name}
            <ToriImage dna={this.state.toriInfo.dna} size={50} />
            <Button variant="raised" color="secondary" onClick={this.selectTori}>
              Select
            </Button>
          </div>
        }
      </ListItem>
    );
  }
}

export default withStyles(styles)(ToriVisitItem)

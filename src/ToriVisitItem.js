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
    toriVisit: PropTypes.object,
    userAccount: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {};

    this.selectTori = this.selectTori.bind(this);
    this.handleVisit = this.handleVisit.bind(this);
    this.handleFuse = this.handleFuse.bind(this);
  }

  componentDidMount() {
    // TODO: get the heart from the activities
    fetch('/cribtori/api/hearts/' + this.props.toriId)
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

    // Get the visitation info.
    fetch('/cribtori/api/visit/' + this.props.toriId)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(function(data) {
      if (data.target !== undefined) {
        this.setState({
          visitTarget: data.target,
        });
      }
    }.bind(this))
    .catch(console.err);
  }

  selectTori() {
    if (this.props.mode === 'visit') {
      this.handleVisit();
    } else {
      // TODO: show warning
      this.handleFuse();
    }
  }

  handleVisit() {
    util.visitTori(this.context.toriVisit, this.props.toriId, this.props.targetId, this.context.userAccount)
    .then((result) => {
      let data = {
        id: this.props.toriId,
        targetId: this.props.targetId,
        claimed: 0
      }
      fetch('/cribtori/api/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
      .then(function(response) {
        return response.status;
      })
      .then(function(status) {
        let message = this.state.toriInfo.name + '\'s on its way!';
        if (status === 400) {
          // TODO: handle this...
          message = this.state.toriInfo.name + '\'s lost ...';
        }
        this.props.onMessage(message);
      }.bind(this))
      .catch(console.err);
    })
    .catch(console.error);
  }

  handleFuse() {
    // TODO: future feature: make the name custom.
    // Create a new name
    let fuseName = this.props.targetName.substring(0, Math.floor(this.props.targetName.length / 2)) +
                    this.state.toriInfo.name.substring(0, Math.floor(this.state.toriInfo.name.length / 2));
    util.fuseToris(this.context.toriVisit, this.props.targetId, this.props.toriId, fuseName, this.context.userAccount)
    .then((result) => {
      // TODO: Maybe update the DB?
      let message = this.state.toriInfo.name + '\'s been fused';
      if (!result) {
        message = this.state.toriInfo.name + '\'s fusion failed';
      }
      this.props.onMessage(message);
    })
    .catch(console.error);
  }

  render() {
    let buttonInfo = (this.props.mode === 'visit') ?
                     'Send for Visitation' :
                     'Select as Benefactor';
    return (
      <ListItem>
        { this.state.toriInfo &&
          <div>
            {this.state.toriInfo.name}
            <ToriImage dna={this.state.toriInfo.dna} size={50} />
            <Button disabled={this.state.visitTarget !== undefined}
                    variant="raised"
                    color="secondary"
                    onClick={this.selectTori}>
              { buttonInfo }
            </Button>
          </div>
        }
      </ListItem>
    );
  }
}

export default withStyles(styles)(ToriVisitItem)
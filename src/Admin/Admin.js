import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import ToriToken from '../../build/contracts/ToriToken.json';
import ToriTransfer from '../../build/contracts/ToriTransfer.json';

import Button from '@material-ui/core/Button';

import * as util from '../utils.js';

const styles = theme => ({
  root: {
    padding: 30
  },
  entry: {
    marginBottom: 10
  },
  textEntry: {
    marginRight: 10
  }
});

class Admin extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      names: [],
      infos: []
    };

    // Function BINDS
    this.startTransfer = this.startTransfer.bind(this);
    this.prepareTransfer = this.prepareTransfer.bind(this);
    this.renderInfos = this.renderInfos.bind(this);
  }

  componentDidMount() {
    const contract = require('truffle-contract');
    const toriTransfer = contract(ToriTransfer);
    const oldToriToken = contract(ToriToken);
    toriTransfer.setProvider(this.context.web3.currentProvider);
    oldToriToken.setProvider(this.context.web3.currentProvider);

    oldToriToken.at('0xfb6fee1ff31132c35f2023f0eae8277b9355ff49')
    .then((instance) => {
      this.setState({
        oldInstance: instance
      })
      return toriTransfer.deployed();
    })
    .then((instance) => {
      this.setState({
        transferInstance: instance
      }, this.prepareTransfer);
    });
  }

  prepareTransfer() {
    this.state.transferInstance.getOldCount()
    .then((result) => {
      let count = result.toNumber();
      let countLst = [];
      for (let i = 0; i < count; i++) countLst.push(i);
      Promise.all(countLst.map((c) => {
        return this.state.oldInstance.getTokenInfo(c);
      }))
      .then((results) => {
        let infos = results.map((r) => { return util.parseToriResult(r) });
        let names = results.map((r) => { return r[3] });
        this.setState({
          names: names,
          infos: infos,
        })
      });
    });
  }

  startTransfer(id, name) {
    this.state.transferInstance.transferTori(id, name, { from: this.context.userAccount })
    .then((results) => {
      console.log('SUCCESS')
    });
  }

  renderInfos() {
    return this.state.infos.map((info) => {
      return (
        <div className={this.props.classes.entry} key={info.id}>
          <span className={this.props.classes.textEntry}>
            <b>Id:</b> {info.id}
          </span>
          <span className={this.props.classes.textEntry}>
            <b>Name:</b> {info.name}
          </span>
          <span className={this.props.classes.textEntry}>
            <b>DNA:</b> {info.dna}
          </span>
          <span className={this.props.classes.textEntry}>
            <b>Proficiency:</b> {info.proficiency}
          </span>
          <span className={this.props.classes.textEntry}>
            <b>Personality:</b> {info.personality}
          </span>
          <div>
            <Button disabled={this.state.names.length === 0}
                    variant="raised"
                    color="primary"
                    onClick={() => this.startTransfer(info.id, info.name) } >
              Start Transfer
            </Button>
          </div>
        </div>
      )
    })
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        {this.renderInfos()}
      </div>
    );
  }
}

export default withStyles(styles)(Admin)

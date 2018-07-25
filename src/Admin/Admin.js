import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

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
    this.renderBatch = this.renderBatch.bind(this);
  }

  componentDidMount() {
    const contract = require('truffle-contract');
    const toriTransfer = contract(ToriTransfer);
    toriTransfer.setProvider(this.context.web3.currentProvider);

    toriTransfer.deployed()
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
      console.log('Count:', count)
      for (let i = 0; i < count; i++) countLst.push(i);
      Promise.all(countLst.map((c) => {
        return this.context.toriToken.getTokenInfo(c, {from: this.context.userAccount});
      }))
      .then((results) => {
        let infos = results.map((r) => { return util.parseToriResult(r) });
        let names = results.map((r) => { return r[3] });

        // Divide the toris by batches of 6.
        let batchDna = [];
        let batchName = [];
        let batchId = [];
        let currDna = [];
        let currName = [];
        let currId = [];
        let currCount = 0;

        let dct = {}
        countLst.forEach((id) => {
          if (currCount === 6) {
            batchDna.push(currDna);
            batchName.push(currName);
            batchId.push(currId);
            currDna = [];
            currName = [];
            currId = [];
            currCount = 0;
          }

          if (dct[infos[id].owner] === undefined) dct[infos[id].owner] = 0
          dct[infos[id].owner] += 1;

          currDna.push(infos[id].dna);
          currName.push(infos[id].name);
          currId.push(id);
          currCount += 1;
        })
        console.log(dct)
        batchDna.push(currDna);
        batchName.push(currName);
        batchId.push(currId);

        this.setState({
          batchDna: batchDna,
          batchName: batchName,
          batchId: batchId,
        })
      });
    });
  }

  startTransfer(names, ids) {
    console.log(names, ids)
    this.state.transferInstance.batchTransfer(ids, ids.length, ...names, { from: this.context.userAccount })
    .then((results) => {
      console.log('SUCCESS', ids)
    });
  }

  renderBatch(names, ids, i) {
    return (
      <div className={this.props.classes.entry} key={`batch_${i}`}>
        <span className={this.props.classes.textEntry}>
          <b>Id:</b> {ids.join(', ')}
        </span>
        <span className={this.props.classes.textEntry}>
          <b>Name:</b> {names.join(', ')}
        </span>
        <div>
          <Button disabled={this.state.batchName.length === 0}
                  variant="raised"
                  color="primary"
                  onClick={() => this.startTransfer(names, ids) } >
            Start Transfer
          </Button>
        </div>
      </div>
    );
  }

  renderInfos() {
    return this.state.batchName.map((names, i) => {
      let ids = this.state.batchId[i];
      return this.renderBatch(names, ids, i);
    })
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        {this.state.batchDna !== undefined && this.renderInfos()}
      </div>
    );
  }
}

export default withStyles(styles)(Admin)

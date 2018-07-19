import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import TokenInfo from '../Components/TokenInfo.js';
import Pagination from '../Components/Pagination.js';

import * as util from '../utils.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
});

const MAX_PER_PAGE = 10;

class OtherToris extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      otherToris: [],
      empties: [],
      currentPage: 1,
      totalPage: 1
    }

    // Function BINDS
    this.onEmpty = this.onEmpty.bind(this);
    this.renderDisplay = this.renderDisplay.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
        toriIds = toriIds.map((id) => { return id.toNumber() });

        util.retrieveAllToriCount(this.context.toriToken, this.context.userAccount)
        .then((count) => {
          count = count.toNumber();
          // Filter from the current owner indexes.
          let otherIds = [];
          for (let i = 0; i < count; i++) {
            if (toriIds.indexOf(i) === -1) {
              otherIds.push(i);
            }
          }

          Promise.all(otherIds.map((id) => this.context.toriToken.exists(id)))
          .then((results) => {
            let filteredOthers = [];
            results.forEach((res, i) => {
              if (res) filteredOthers.push(otherIds[i]);
            });

            Promise.all(filteredOthers.map((id) => this.context.toriToken.ownerOf(id)))
            .then((results) => {
              let count = {}
              results.forEach((owner, i) => {
                if (count[owner] === undefined) count[owner] = 0;
                count[owner] += 1;
              });

              console.log('owners', count)
            })

            this.setState({
              ids: filteredOthers,
              totalPage: Math.ceil(filteredOthers.length / MAX_PER_PAGE)
            });
          });
        })
        .catch(console.error);
    })
    .catch(console.error);
  }

  renderDisplay() {
    if (this.state.ids === undefined) return (<div></div>);

    let ids = this.state.ids;
    ids = ids.filter((id) => this.state.empties.indexOf(id) === -1);
    let minSize = (ids.length >= 4) ? 3 : Math.floor(12 / ids.length);
    // Pagination.
    ids = ids.slice(MAX_PER_PAGE * (this.state.currentPage - 1), MAX_PER_PAGE * this.state.currentPage);
    let items = ids.map((id) => {
      return (
        <Grid item sm={minSize} key={id} >
          <TokenInfo id={id}
                     onEmpty={this.onEmpty}/>
        </Grid>
      );
    });
    return items;
  }

  onEmpty(id) {
    let empties = this.state.empties;
    if (empties.indexOf(id) === -1) empties.push(id);
    this.setState({
      empties: empties,
    })
  }

  handlePrev() {
    this.setState({
      currentPage: Math.max(1, this.state.currentPage - 1)
    });
  }

  handleNext() {
    this.setState({
      currentPage: Math.min(this.state.totalPage, this.state.currentPage + 1)
    });
  }

  render() {
    if (this.state.ids === undefined) return (<CircularProgress />);
    return (
      <Grid container className={this.props.classes.root}
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Pagination currentPage={this.state.currentPage}
                    totalPage={this.state.totalPage}
                    handlePrev={this.handlePrev}
                    handleNext={this.handleNext} />
        { this.renderDisplay() }
        <Pagination currentPage={this.state.currentPage}
                    totalPage={this.state.totalPage}
                    handlePrev={this.handlePrev}
                    handleNext={this.handleNext} />
      </Grid>
    );
  }
}

export default withStyles(styles)(OtherToris)

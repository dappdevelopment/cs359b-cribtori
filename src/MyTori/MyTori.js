import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


import Status from '../Components/Status.js';
import Room from '../Components/Room.js';

import * as util from '../utils.js';


const styles = theme => ({
  paper: {
    margin: '16px 32px 16px 0',
    padding: 16
  }
});

class MyTori extends Component {

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

    // FUNCTION BIND
    this.renderActions = this.renderActions.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
        toriIds = toriIds.map((id) => { return id.toNumber() });

        this.setState({
          loaded: true,
          toriIds: toriIds,
        });
    })
    .catch(console.error);
  }

  renderActions() {
    return (
      <MenuList>
        <MenuItem>Feed</MenuItem>
        <MenuItem>Clean</MenuItem>
        <MenuItem disabled >Craft</MenuItem>
        <Divider />
        <MenuItem>Edit Room</MenuItem>
        <Divider />
        <MenuItem>Fusion</MenuItem>
      </MenuList>
    );
  }

  render() {
    return (
      <Grid container spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={3}>
          <Paper className={this.props.classes.paper}
                 elevation={4}>
            <Typography variant="title" color="inherit" component="h3">
              Status
            </Typography>
            <Divider />
            <Status />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          { this.state.loaded &&
            <Room width={3}
                  height={2} />
          }
        </Grid>
        <Grid item sm={3}>
          <Paper className={this.props.classes.paper}
                 elevation={4}>
            <Typography variant="title" color="inherit" component="h3">
              Actions
            </Typography>
            <Divider />
            { this.renderActions() }
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(MyTori)

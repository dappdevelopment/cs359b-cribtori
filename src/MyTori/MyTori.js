import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';


import Status from '../Components/Status.js';
import Room from '../Components/Room.js';

import * as util from '../utils.js';


const styles = theme => ({
  grid: {
    padding: 50,
  },
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
    this.renderGrid = this.renderGrid.bind(this);
    this.retrieveLayout = this.retrieveLayout.bind(this);
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

    this.retrieveLayout();
  }

  retrieveLayout() {
    util.retrieveRoomLayout(this.context.userAccount)
    .then((result) => {
      let layout = (result.locations) ? JSON.parse(result.locations) : [];
      // TODO: Check which tori is currently active.

      this.setState({
        roomLayout: layout,
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
        <MenuItem component={Link} to={'/mytoris/edit'}>Edit Room</MenuItem>
      </MenuList>
    );
  }

  renderGrid() {
    return (
      <Grid container className={this.props.classes.grid}
                      spacing={8}
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
          { (this.state.loaded && this.state.roomLayout && this.state.toriIds) ? (
            <Room width={3}
                  height={2}
                  layout={this.state.roomLayout}
                  firstTori={this.state.toriIds[0]} />
          ) : (
            <CircularProgress  color="secondary" />
          )}
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

  render() {
    let content = (<CircularProgress  color="secondary" />);
    if (this.state.loaded) {
      if (this.state.toriIds.length === 0) {
        // TODO: show a more meaningful message
        content = (
          <Paper style={{
            padding: 20,
          }}>
            <Typography variant="title" color="inherit" component="h3" align="center">
              No Tori Found
            </Typography>
          </Paper>
        );
      } else {
        content = this.renderGrid();
      }
    }
    return content;
  }
}

export default withStyles(styles)(withRouter(MyTori))

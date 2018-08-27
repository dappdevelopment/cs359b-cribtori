import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBox from '@material-ui/icons/CheckBox';

import TokenItem from './TokenItem.js';

import * as util from '../utils.js';

const styles = theme => ({
  button: {
    display: 'inline-block',
    height: 'auto'
  },
  dialog: {
    zIndex: 1200
  }
});

class Activation extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  // TODO: make activation item.
  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      open: false,
      onActivate: false,
    }

    // Function binds.
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.renderToris = this.renderToris.bind(this);
    this.activateTori = this.activateTori.bind(this);
  }

  handleClickOpen() {
    this.setState({ open: true });
  };

  handleClose() {
    if (!this.state.onActivate) {
      this.setState({ open: false });
    }
  };

  activateTori(id) {
    this.setState({
      onActivate: true,
    }, () => {
      // Get the personality.
      let name = '';
      util.retrieveTokenInfo(this.context.toriToken, id, this.context.userAccount)
      .then((result) => {
        let info = util.parseToriResult(result);
        let personality = info.personality;
        name = info.name;

        let data = {
          id: id,
          owner: this.context.userAccount,
          personality: personality
        };
        return fetch('/cribtori/api/hearts/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        });
      })
      .then(function(response) {
        this.setState({
          onActivate: false,
        }, () => {
          if (response.ok) {
            // Refresh the inactive tori list.
            this.props.refreshToris();
            this.context.onMessage(`${name} has been succesffully activated.`);
          } else {
            this.context.onMessage(`${name} activation failed.`);
          }
        });
      }.bind(this))
      .catch(console.error)
    })
  }

  renderToris() {
    return this.props.nonactiveToris.map((id) => {
      return (
        <Grid container key={`inactive_${id}`}
                        spacing={0}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item xs={8}>
            <TokenItem id={id} showLevel={true} />
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained"
                    color="primary"
                    onClick={() => this.activateTori(id)}>
              Activate
            </Button>
          </Grid>
        </Grid>
      );
    });
  }

  render() {
    let disabled = this.state.onActivate || (this.props.nonactiveToris.length === 0);
    return (
      <div>
        <Button disabled={disabled}
                variant="contained"
                color="secondary"
                onClick={this.handleClickOpen}
                className={this.props.classes.button}>
          <Typography variant="caption" color="inherit" align="center">
            { disabled ? (
              <CheckBox />
            ) : (
              <CheckBoxOutlineBlank />
            )}
          </Typography>
          <Typography variant="caption" color="inherit" align="center">
            Activate Tori
          </Typography>
        </Button>
        <Dialog
          className={this.props.classes.dialog}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="activation-dialog-title"
          aria-describedby="activation-dialog-description">
          <DialogTitle id="activation-dialog-title">{"Activating your Toris"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="activation-dialog-description">
              Here are your currently inactive Toris.
              <Typography variant="caption" color="inherit" align="center">
                (Inactive Toris will not show up in your room.)
              </Typography>
            </DialogContentText>
            <Divider />
            { this.renderToris() }
          </DialogContent>
          <DialogActions>
            <Button disabled={this.state.onActivate}
                    onClick={this.handleClose}
                    color="primary"
                    autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Activation)

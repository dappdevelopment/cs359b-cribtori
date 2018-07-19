import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import Introduction from './Introduction.js';

import { assets } from '../assets.js';

const styles = theme => ({
  logo: {
    height: '30px'
  },
  tab: {
    position: 'absolute',
    right: 0,
    marginRight: 20,
  },
  banner: {
    backgroundColor: theme.palette.secondary.dark,
    height: 20,
    width: `100%`,
  },
  dialog: {
    zIndex: 1000
  }
});

class TutorialWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 0,
      openDialog: true
    }

    // Function BINDS
    this.switchDisplay = this.switchDisplay.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  switchDisplay(e) {

  }

  handleClose() {
    this.setState({
      openDialog: false
    });
  }

  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Link to={'/'}>
              <img src={assets.logoWhite}
                   alt={"Cribtori"}
                   className={this.props.classes.logo} />
            </Link>
            <Tabs value={this.state.mode}
                  onChange={this.switchDisplay}
                  className={this.props.classes.tab}>
              <Tab disabled={false} label="My Room" component={Link} to={'/tutorial/mytoris'} />
              <Tab disabled={true} label="Nursery" component={Link} to={'/tutorial/nursery'} />
              <Tab disabled={true} label="Explore" component={Link} to={'/tutorial/explore'} />
              <Tab disabled={true} label="Marketplace" component={Link} to={'/tutorial/market'} />
            </Tabs>
          </Toolbar>
        </AppBar>
        <div className={this.props.classes.banner}>
        </div>
        <Grid container spacing={8}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Introduction />
        </Grid>
        <Dialog
          className={this.props.classes.dialog}
          disableBackdropClick={true}
          open={this.state.openDialog}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title">
          <DialogTitle id="responsive-dialog-title">{"Use Google's location service?"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Let Google help apps determine location. This means sending anonymous location data to
              Google, even when no apps are running.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Disagree
            </Button>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(TutorialWrapper)

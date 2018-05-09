import React, { Component } from 'react'
import PropTypes from 'prop-types';

import Snackbar from 'material-ui/Snackbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';
import List, { ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

import * as util from './utils.js';
import { assets } from './assets.js';

import ToriDetails from './ToriDetails.js';

const styles = theme => ({
  menuItem: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& $primary, & $icon': {
        color: theme.palette.common.white,
      },
    },
  },
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
  },
  root: {
    flexGrow: 1,
  },
  primary: {},
  icon: {}
});

class ToriDetailsContainer extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    toriSiblings: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = {
      toriId: -1,
      isEditRoom: false,
      openSnackBar: false,
      dialogOpen: false,
      toriInfo: {},
    }

    this.switchEdit = this.switchEdit.bind(this);
    this.saveEdit = this.saveEdit.bind(this);

    this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.props.toriId, this.context.userAccount).then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        toriId: info.id,
        toriInfo: info,
      });
    });
    // Fetch the room layout.
    util.retrieveRoomLayout(this.props.toriId)
    .then((result) => {
      if (result.locations) {
        this.setState({
          roomLayout: JSON.parse(result.locations),
        });
      }
    })
    .catch(console.error);
  }

  switchEdit() {
    this.setState({
      isEditRoom: !this.state.isEditRoom,
    });
  }

  saveEdit(newLayout) {
    this.setState({
      roomLayout: newLayout,
      isEditRoom: !this.state.isEditRoom,
    });
  }

  handleCloseSnackBar() {
    this.setState({
      openSnackBar: false,
    });
  }

  handleMessage(message) {
    console.log('Message', message)
    this.setState({
      openSnackBar: true,
      snackBarMessage: message,
    });
  }

  constructMainDetails() {
    if (this.state.isEditRoom) {
      return ('Hello');
    } else if (this.props.isOther) {
      return ('World');
    } else {
      return (<ToriDetails info={this.state.toriInfo}
                           layout={this.state.roomLayout}
                           onMessage={this.handleMessage}
                           onEdit={this.switchEdit} />);
    }
  }

  render() {
    console.log(this.state.toriId, this.state.toriInfo)
    return (
      <Grid container className="tori-details-container"
                      spacing={8}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        { this.state.toriId !== -1 && (
          <Grid item sm={12}>
            <Typography variant="headline" gutterBottom align="center">
              {this.state.toriInfo.name}
            </Typography>
          </Grid>
        )}
        { this.state.toriId !== -1  && this.state.roomLayout && (
          this.constructMainDetails()
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.openSnackBar}
          onClose={this.handleCloseSnackBar}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
        />
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriDetailsContainer)

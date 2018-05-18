import React, { Component } from 'react'
import PropTypes from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import * as util from './utils.js';

import ToriDetails from './ToriDetails.js';
import ToriEdit from './ToriEdit.js';


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

    this.retrieveLayout = this.retrieveLayout.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenInfo(this.context.toriToken, this.props.toriId, this.context.userAccount).then((result) => {
      let info = util.parseToriResult(result);
      this.setState({
        toriId: info.id,
        toriInfo: info,
      });
    });
    this.retrieveLayout(false);
  }

  retrieveLayout(afterSwitch) {
    // Fetch the room layout.
    util.retrieveRoomLayout(this.props.toriId)
    .then((result) => {
      if (afterSwitch) {
        this.setState({
          roomLayout: (result.locations) ? JSON.parse(result.locations) : [],
          isEditRoom: !this.state.isEditRoom,
        });
      } else {
        this.setState({
          roomLayout: (result.locations) ? JSON.parse(result.locations) : [],
        });
      }
    })
    .catch(console.error);
  }

  switchEdit() {
    this.retrieveLayout(true);
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
    this.setState({
      openSnackBar: true,
      snackBarMessage: message,
    });
  }

  constructMainDetails() {
    if (this.state.isEditRoom) {
      return (<ToriEdit info={this.state.toriInfo}
                        layout={this.state.roomLayout}
                        onMessage={this.handleMessage}
                        onSwitch={this.switchEdit}
                        onSaveEdit={this.saveEdit} />);
    } else if (this.props.isOther) {
      return (<ToriDetails info={this.state.toriInfo}
                           layout={this.state.roomLayout}
                           onMessage={this.handleMessage}
                           onEdit={this.switchEdit}
                           isOther={true} />);
    } else {
      return (<ToriDetails info={this.state.toriInfo}
                           layout={this.state.roomLayout}
                           onMessage={this.handleMessage}
                           onEdit={this.switchEdit}
                           isOther={false} />);
    }
  }

  render() {
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

export default ToriDetailsContainer

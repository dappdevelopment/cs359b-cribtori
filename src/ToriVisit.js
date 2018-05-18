import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import { HeartHalfFull } from 'mdi-material-ui';

import * as util from './utils.js';

import ToriRoom from './ToriRoom.js'
import ToriActivityLogs from './ToriActivityLogs.js'
import TradeDialog from './TradeDialog.js';

const HEART_LIM = 5;

const styles = theme => ({
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0',
  },
  icon: {
    color: 'red',
  },
});

class ToriVisit extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    toriSiblings: PropTypes.array,
  }

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  componentDidMount() {
    // TODO: show error message
    // fetch('/cribtori/hearts/' + this.props.info.id)
    // .then(function(response) {
    //   if (response.ok) {
    //     return response.json();
    //   }
    //   throw response;
    // })
    // .then(function(data) {
    //   if (data.hearts) {
    //     this.setState({
    //       heartBase: Math.max(data.hearts, 0),
    //     });
    //   }
    // }.bind(this))
    // .catch(console.err);
    //  { this.props.name }
    /*

    */
  }


  render() {
    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Visit {this.props.name}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(ToriVisit)

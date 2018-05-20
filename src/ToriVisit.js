import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';

import * as util from './utils.js';

import ToriVisitItem from './ToriVisitItem.js';

const styles = theme => ({

});

class ToriVisit extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    userAccount: PropTypes.string,
    toriSiblings: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState({
      visitList: this.context.toriSiblings.map((id) => {
        return (<ToriVisitItem key={id} toriId={id} targetId={this.props.targetId} onMessage={this.props.onMessage}/>);
      })
    })
  }


  render() {
    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Visit {this.props.name}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List>
            { this.state.visitList }
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(ToriVisit)

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
  warning: {
    color: 'red'
  }
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
    let ids = this.context.toriSiblings;
    ids = ids.filter((id) => id !== this.props.targetId);
    this.setState({
      visitList: ids.map((id) => {
        return (<ToriVisitItem key={id}
                               toriId={id}
                               targetName={this.props.name}
                               targetId={this.props.targetId}
                               onMessage={this.props.onMessage}
                               mode={this.props.mode}/>);
      })
    })
  }


  render() {
    let title = (this.props.mode === 'visit') ?
                `Visit ${this.props.name}` :
                `Fuse ${this.props.name}`;
    let warning = 'WARNING: Fusing will COMBINE the two Toris!';

    let disabled = this.props.disabled;

    return (
      <ExpansionPanel disabled={disabled}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{title}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {this.props.mode === 'fuse' && (
            <div>
              <Typography className={this.props.classes.warning}>{warning}</Typography>
            </div>
          )}
          <List>
            { this.state.visitList }
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(ToriVisit)

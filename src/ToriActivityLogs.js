import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  base: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
  },
});

class ToriActivityLogs extends Component {

  constructor(props) {
    super(props)

    this.state = {
      toriId: -1,
      activityItems: [],
    }

  }

  componentDidMount() {
    if (this.props.toriId !== -1) {
      this.fetchActivityLogs();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps === this.props) {
      return;
    }
    if (this.state.toriId === this.props.toriId || this.props.toriId === -1 ) {
      return;
    }
    // TODO: get info about the top 7 activities here.
    this.fetchActivityLogs();

    // TODO: maybe validate activity with smart contract (?)

  }

  fetchActivityLogs() {
    this.setState({
      toriId: this.props.toriId,
      activityItems: [],
    }, () => {
      fetch('/cribtori/api/activity/' + this.props.toriId + '?limit=5')
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        let timestamp = {
          clean: -1,
          feed: -1,
        }
        result.forEach((data, i) => {
          if (timestamp[data.activity_type] === -1) timestamp[data.activity_type] = data.timestamp;
          this.setState({
            activityItems: this.state.activityItems.concat(this.constructActivityDisplay(data, i)),
          });
        });
        this.props.onFilled(timestamp);
      }.bind(this))
      .catch(console.err);
    })
  }

  constructActivityDisplay(data, i) {
    /*
    tori_id: row.tori_id,
    timestamp: row.time,
    activity_type: row.activity_type,
    description: row.description,
    */
    let timestamp = new Date(data.timestamp);
    timestamp = timestamp.toTimeString();

    let activity = (data.activity_type === 'feed') ?
                    'You fed ' + this.props.name :
                    'You cleaned ' + this.props.name + '\'s room';

    return (
      <ListItem key={`activity_${i}`}>
        <ListItemText
          primary={activity}
          secondary={timestamp}
        />
      </ListItem>
    );
  }

  render() {
    return (
      <Paper className={this.props.classes.root} elevation={4}>
        <Typography variant="title" className={this.props.classes.title}>
        Activity Log
        </Typography>
        <div className={this.props.classes.base}>
          <List dense={true}>
            {this.state.activityItems}
          </List>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(ToriActivityLogs)

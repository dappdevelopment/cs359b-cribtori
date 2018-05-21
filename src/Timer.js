import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  countdown: {
    display: 'inline-block',
  }
});

class Timer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      countdown: (this.props.dueTime - new Date().getTime() / 1000),
    };

    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    if (this.props.dueTime - new Date().getTime() / 1000 <= 0) {
      this.setState({
        countdown: 0,
      });
    } else {
      this.timer = setInterval(this.tick, 1000);
    }
  }

  tick() {
    if (this.state.countdown - 1 < 0) {
      clearInterval(this.timer);
      this.props.timerCallback();
    }
    this.setState({
      countdown: Math.max(0, (this.state.countdown - 1)),
    });
  }

  render() {
    let hour = Math.floor(this.state.countdown / 3600);
    let minute = Math.floor((this.state.countdown - hour * 3600) / 60);
    let second = Math.floor(this.state.countdown - hour * 3600 - minute * 60);
    return (
      <div className={this.props.classes.countdown}>
        {hour} : {minute} : {second}
      </div>
    );
  }
}

export default withStyles(styles)(Timer)

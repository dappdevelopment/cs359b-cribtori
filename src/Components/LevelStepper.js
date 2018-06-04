import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const styles = theme => ({

});

const LEVEL_DESC = [
  '',
  'Change Tori\'s name',
  'Increase in room size',
  '',
  'Change Tori\'s greetings',
  'Increase in room size'
];

const DEFAULT_DESC = 'TBA';

class LevelStepper extends Component {
  constructor(props) {
    super(props);

    let currentLevel = 4; // this.props.currentLevel

    let start = Math.max(0, currentLevel - 1);
    let levels = [];
    for (let i = start; i < start + 3; i++) levels.push(i);

    this.state = {
      levelDisplay: levels,
    }

    // Function BINDS.
    this.renderStep = this.renderStep.bind(this);
  }

  renderStep() {
    return this.state.levelDisplay.map((l, i) => {
      let desc = LEVEL_DESC[l];
      if (desc === undefined) desc = DEFAULT_DESC;
      return (
        <Step key={i}>
          <StepLabel icon={l}>{ desc }</StepLabel>
        </Step>
      );
    });
  }

  render() {
    return (
      <Stepper nonLinear activeStep={2} orientation="horizontal">
        <Step>
          <StepLabel icon={'...'}></StepLabel>
        </Step>
        { this.renderStep() }
        <Step>
          <StepLabel icon={'...'}></StepLabel>
        </Step>
      </Stepper>
    );
  }
}

export default withStyles(styles)(LevelStepper)

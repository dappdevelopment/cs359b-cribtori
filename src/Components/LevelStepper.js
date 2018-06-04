import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const styles = theme => ({

});

const LEVEL_DESC = [
  '',
  'Change Tori\'s greetings',
  'Increase in room size',
  '',
  'Change Tori\'s name',
  'Increase in room size'
];

const DEFAULT_DESC = 'TBA';

class LevelStepper extends Component {
  constructor(props) {
    super(props);

    let currentLevel = this.props.level;

    let start = currentLevel - 1;
    let levels = [];
    if (currentLevel !== 1) levels.push(0);
    for (let i = start; i < start + 3; i++) levels.push(i);
    levels.push(0);

    this.state = {
      levelDisplay: levels,
    }

    // Function BINDS.
    this.renderStep = this.renderStep.bind(this);
  }

  renderStep() {
    return this.state.levelDisplay.map((l, i) => {
      if (l < 1) {
        return (
          <Step key={`step_${i}`}>
            <StepLabel icon={l === 0 ? '...' : 'X'}></StepLabel>
          </Step>
        );
      }
      let desc = LEVEL_DESC[l-1];
      if (desc === undefined) desc = DEFAULT_DESC;
      return (
        <Step key={`step_${i}`} active={l <= this.props.level}>
          <StepLabel icon={l}>{ desc }</StepLabel>
        </Step>
      );
    });
  }

  render() {
    return (
      <Stepper nonLinear orientation="horizontal">
        { this.renderStep() }
      </Stepper>
    );
  }
}

export default withStyles(styles)(LevelStepper)

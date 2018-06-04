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
import List from '@material-ui/core/List';

import TicketItem from '../Components/TicketItem.js';

import { assets } from '../assets.js';
import * as util from '../utils.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
    marginTop: 10,
  },
  primary: {
    backgroundColor: theme.palette.primary.light
  }
});

class BreedHome extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriVisit: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.state = {
      tickets: [],
    }

    // Function BINDS
    this.renderStepper = this.renderStepper.bind(this);
    this.renderTickets = this.renderTickets.bind(this);
  }

  componentDidMount() {
    util.getTicketIndexes(this.context.toriVisit, this.context.userAccount)
    .then((result) => {
      let indexes = result.map((r) => { return r.toNumber() });
      this.setState({
        tickets: indexes,
      })
    })
    .catch(console.error);
  }

  renderTickets() {
    let items = this.state.tickets.map((id) => {
      return (
        <TicketItem key={id} id={id} />
      );
    });
    return items;
  }

  renderStepper() {
    return (
      <Stepper activeStep={0} orientation="vertical">
        <Step active={true}>
          <StepLabel>Go to "Explore" Tab</StepLabel>
        </Step>
        <Step active={true}>
          <StepLabel>Visit Chosen Tori</StepLabel>
        </Step>
        <Step active={true}>
          <StepLabel>Click on "Breed with"</StepLabel>
        </Step>
      </Stepper>
    );
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'flex-start'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12}>
          <Typography variant="title" color="inherit" component="h1" align="center">
            Breeding
          </Typography>
          <Divider />
        </Grid>
        <Grid item sm={8}>
          <Typography variant="subheading" color="inherit" component="h1" align="center">
            Currently In Progress
          </Typography>
          <Divider />
          <Grid container className={this.props.classes.root}
                          spacing={16}
                          alignItems={'flex-start'}
                          direction={'column'}
                          justify={'center'}>
            { this.renderTickets() }
          </Grid>
        </Grid>
        <Grid item sm={4} className={this.props.classes.primary}>
          <Typography variant="subheading" component="h1" align="center">
            Start New
          </Typography>
          <Divider />
          { this.renderStepper() }
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(BreedHome)

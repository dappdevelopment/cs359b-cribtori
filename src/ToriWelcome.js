import React, { Component } from 'react'
import PropTypes from 'prop-types';

import * as util from './utils.js'

import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Radio, { RadioGroup } from 'material-ui/Radio';
import TextField from 'material-ui/TextField';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  formControl: {
    margin: theme.spacing.unit * 3,
  }
});


class ToriWelcome extends Component {
  static contextTypes = {
    toriToken: PropTypes.object,
    userAccount: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      toriName: '',
    }

    this.generateInitToris = this.generateInitToris.bind(this);
    this.constructRadioGroup = this.constructRadioGroup.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  generateInitToris(e) {
    let quizzes = [this.state.q1, this.state.q2, this.state.q3, this.state.q4];
    quizzes = quizzes.map((q) => parseInt(q, 10));
    util.generateInitialTori(this.context.toriToken, quizzes, this.state.toriName, this.context.userAccount)
    .then((result) => {
      console.log('After generating new tori:', result);
      // TODO: Generate new accessories.
      // TODO: reroute to tori display
      // util.generateNewAccessories(this.context.accToken, this.context.userAccount)
      // .then((result) => {
      //   console.log('After generating new accessories:', result);
      // })
    })
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  constructRadioGroup(label, name, options) {
    return (
      <FormControl component="fieldset" required className={this.props.classes.formControl}>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup
          aria-label={name}
          value={this.state[name]}
          name={name}
          onChange={this.handleChange}
        >
          <FormControlLabel value={'1'} control={<Radio />} label={options[0]} />
          <FormControlLabel value={'0'} control={<Radio />} label={options[1]} />
        </RadioGroup>
      </FormControl>
    );
  }


  render() {
    let buttonDisabled = this.state.q1 === '' ||
                         this.state.q2 === '' ||
                         this.state.q3 === '' ||
                         this.state.q4 === '' ||
                         this.state.toriName === '';
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'flex-start'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={6}>
          <Paper className={this.props.classes.root}>
            <Grid container className={this.props.classes.root}
                            spacing={8}
                            alignItems={'flex-start'}
                            direction={'row'}
                            justify={'center'}>
              <Grid item sm={12}>
                <Typography variant="headline" gutterBottom align="center">
                  Hello!
                </Typography>
              </Grid>
              <Grid item sm={12}>
                <Typography variant="body1" gutterBottom align="center">
                  Welcome to Cribtori. Before you explore all the features in Cribtori,
                  you would need to generate your very first tori! Please fill in the
                  questions below and choose a name for your starter tori. Then, we
                  will generate a suitable tori for you!
                </Typography>
                <Divider />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name={'toriName'}
                  label="Tori name"
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item sm={6}>
                { this.constructRadioGroup('Full or Empty?', 'q1', ['Full', 'Empty']) }
              </Grid>
              <Grid item sm={6}>
                { this.constructRadioGroup('Complex or Simple?', 'q2', ['Complex', 'Simple']) }
              </Grid>
              <Grid item sm={6}>
                { this.constructRadioGroup('Night or Day?', 'q3', ['Night', 'Day']) }
              </Grid>
              <Grid item sm={6}>
                { this.constructRadioGroup('Idle or Active?', 'q4', ['Idle', 'Active']) }
              </Grid>
              <Grid item sm={12}>
                <Button disabled={buttonDisabled}
                        variant="raised"
                        color="primary"
                        className="retrieve-button"
                        onClick={this.generateInitToris} >
                  Retrieve starter Tori
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ToriWelcome)

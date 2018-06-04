import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import * as util from '../utils.js'


const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  retrieveButton: {
    marginTop: 10,
    backgroundColor: theme.palette.secondary.dark,
  }
});


class Promo extends Component {

  static contextTypes = {
    web3: PropTypes.object,
    toriToken: PropTypes.object,
    toriPromo: PropTypes.object,
    accContracts: PropTypes.array,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props)
    this.context = context;

    this.state = {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      toriName: '',
      promoCode: '',
    }

    // Function BINDS
    this.generateInitToris = this.generateInitToris.bind(this);
    this.constructRadioGroup = this.constructRadioGroup.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    // Check if this user already has a tori.
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((results) => {
      let toriIds = results.map((id) => { return id.toNumber() });

      if (toriIds.length > 0) {
        // Hey.. you're not a new user!
        this.props.history.push('/mytoris');
      }
    })
    .catch(console.error);
  }

  generateInitToris(e) {
    let quizzes = [this.state.q1, this.state.q2, this.state.q3, this.state.q4];
    quizzes = quizzes.map((q) => parseInt(q, 10));

    if (this.state.promoCode !== '') {
      util.claimPromoCode(this.context.toriPromo, quizzes, this.state.toriName, this.context.userAccount, this.state.promoCode)
      .then((result) => {
        let message = 'Transaction has been subitted';
        if (!result) {
          message = 'Uh oh, something went wrong. Please try again later.';
        }
        this.context.onMessage(message);

        if (result) {
          this.props.history.push({
            pathname: '/confirmation',
            state: {receipt: result.receipt}
          });
        }
      })
    } else {
      util.claimInitialTori(this.context.toriPromo, quizzes, this.state.toriName, this.context.userAccount)
      .then((result) => {
        let message = 'Transaction has been subitted';
        if (!result) {
          message = 'Uh oh, something went wrong. Please try again later.';
        }
        this.context.onMessage(message);

        if (result) {
          this.props.history.push({
            pathname: '/confirmation',
            state: {receipt: result.receipt}
          });
        }
      })
    }
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
                  you would need to get your very first tori!
                </Typography>
                <Typography variant="body1" gutterBottom align="center">
                  For a <b>limited number of first users</b>, {'we\'re'} offering
                  free alpha-generation Tori.
                  Please fill in the personality quiz below and choose a name
                  for your starter tori. Then, we will generate a suitable tori for you!
                </Typography>
                <Divider />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name={'toriName'}
                  label="Fill Tori name here *"
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
                <Typography variant="subheading" color="primary" gutterBottom align="center">
                  Do you have a special promo code?
                </Typography>
                <TextField
                  name={'promoCode'}
                  label="Fill in promo code here (if any)"
                  onChange={this.handleChange}
                  fullWidth
                  align="center"
                />
              </Grid>
              <Grid item sm={12}>
                <Button disabled={buttonDisabled}
                        variant="raised"
                        color="primary"
                        className={this.props.classes.retrieveButton}
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

export default withStyles(styles)(withRouter(Promo))

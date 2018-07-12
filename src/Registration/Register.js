import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
  submitButton: {
    marginTop: 10,
    backgroundColor: theme.palette.secondary.dark,
  }
});

class Register extends Component {
  static contextTypes = {
    web3: PropTypes.object,
    userAccount: PropTypes.string,
    onMessage: PropTypes.func,
  }

  constructor(props, context) {
    super(props);
    this.context = context;

    this.state = {
      username: '',
      email: '',
    }

    this.handleChange = this.handleChange.bind(this);
    this.signUp = this.signUp.bind(this);
  }

  componentDidMount() {
    // Check if user has already sign up.
    if ((sessionStorage.getItem('pk') === this.context.userAccount) &&
        (sessionStorage.getItem('username') !== undefined)) {
      // Redirect user.
    }
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  signUp() {
    let data = {
      pk: this.context.userAccount,
      username: this.state.username,
      // TODO: validate email
      email: this.state.email
    }
    // Sign up the user and redirects.
    fetch('/cribtori/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(function(response) {
      return response.status;
    })
    .then(function(result) {
      // Redirects the user.
      sessionStorage.setItem('username', this.state.username);
      sessionStorage.setItem('pk', this.context.userAccount);
      console.log(result);
    }.bind(this))
    .catch(console.error);
  }

  render() {
    let buttonDisabled = this.state.username === '' ||
                         this.state.email === '';
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
                  Before you explore all the wonderfule features in Cribtori,
                  you would need to sign up! Please fill in the form below
                  with your email and username. Your username will be used
                  as your identifier in the Tori world.
                </Typography>
                <Divider />
              </Grid>
              <Grid item sm={12}>
                <Typography variant="caption" gutterBottom align="left">
                  Your public key:
                </Typography>
                <Typography variant="body1" gutterBottom align="center">
                  { this.context.userAccount }
                </Typography>
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name={'email'}
                  label="Email"
                  required
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name={'username'}
                  label="User name"
                  required
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item sm={12}>
                <Button disabled={buttonDisabled}
                        variant="raised"
                        color="primary"
                        className={this.props.classes.submitButton}
                        onClick={this.signUp} >
                  Sign up
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Register)

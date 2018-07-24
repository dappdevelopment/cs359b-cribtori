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
  submitButton: {
    marginTop: 10,
    backgroundColor: theme.palette.secondary.dark,
  }
});

class LoginHub extends Component {
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

    this.login = this.login.bind(this);
    this.handleSigning = this.handleSigning.bind(this);
    this.handleAuthenticate = this.handleAuthenticate.bind(this);
  }

  componentDidMount() {
  }

  handleSigning(res) {
    this.context.web3.personal.sign(
      this.context.web3.fromUtf8(`Signing one-time nonce: ${res.nonce}`), this.context.userAccount, (err, signature) => {
        if (err) return reject(err);
        return resolve({ signature });
      }
    );
  }

  handleAuthenticate({ signature }) {
    let data = {
      pk: this.context.userAccount,
      signature: signature,
    }
    fetch('/cribtori/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(function(response) {
      if (response.ok) {
        return resolve();
      }
      reject(response);
    });
  }

  login() {
    // Check if user already exist.
    fetch(`/cribtori/api/user?pk=${this.context.userAccount}`)
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(function(result) {
      if (result.nonce === undefined) {
        // TODO: Redirect to register page.
        this.props.history.push('/register');
        // Throw error to exit the Promise chain.
        throw 'Not registered yet';
      } else {
        // Sign the message.
        return result;
      }
    })
    .then(this.handleSigning)
    .then(this.handleAuthenticate)
    .then(() => {
      // Successfully logged in.
      // TODO: Redirects.
    })
    .catch(console.error);
  }

  render() {
    let buttonDisabled = this.state.username === '' ||
                         this.state.email === '';
    return (
      <Button variant="raised"
              color="primary"
              className={this.props.classes.submitButton}
              onClick={this.login} >
        Log in / Register
      </Button>
    );
  }
}

export default withStyles(styles)(LoginHub)

import React, { Component } from 'react'

// import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { Input, InputAdornment } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class TradeDialog extends Component {

  constructor(props) {
    super(props)

    this.state = {
      open: this.props.open,
      price: 0,
      amount: 0,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(prop, e) {
    this.setState({
      [prop]: e.target.value,
    })
  }

  handleSubmit() {
    let data = {
      price: this.state.price,
      amount: this.state.amount,
    }
    this.props.handleSubmit(this.props.contract, data)
  }

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="trade-dialog">
        <DialogTitle id="trade-dialog">Post For Sale</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set your sale information.
          </DialogContentText>
          { this.props.amountNeeded &&
            <TextField
              label={'Amount'}
              value={this.state.amount}
              type="number"
              onChange={(e) => this.handleChange('amount', e)}
            />
          }
          <TextField
            value={this.state.price}
            label="Price"
            onChange={e => this.handleChange('price', e)}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">ETH</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default (TradeDialog)

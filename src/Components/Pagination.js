import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const styles = theme => ({
  grid: {
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10
  },
  paginationElement: {
    display: 'inline-block'
  },
  info: {
    marginLeft: 20,
    marginRight: 20
  }
});

class Pagination extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Grid item
            xs={12}
            className={this.props.classes.grid} >
        <Button disabled={this.props.currentPage === 1}
                variant="raised"
                color="primary"
                onClick={this.props.handlePrev}
                className={this.props.classes.paginationElement} >
          <KeyboardArrowLeftIcon />
        </Button>
        <Typography variant="caption"
                    color="inherit"
                    align="center"
                    className={this.props.classes.paginationElement + ' ' + this.props.classes.info} >
          {this.props.currentPage} of {this.props.totalPage}
        </Typography>
        <Button disabled={this.props.currentPage === this.props.totalPage}
                variant="raised"
                color="primary"
                onClick={this.props.handleNext}
                className={this.props.classes.paginationElement} >
          <KeyboardArrowRightIcon />
        </Button>
      </Grid>
    );
  }
}

export default withStyles(styles)(Pagination)

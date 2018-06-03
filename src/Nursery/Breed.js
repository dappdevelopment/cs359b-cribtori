import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MergeTypeIcon from '@material-ui/icons/MergeType';

import TokenItem from '../Components/TokenItem.js';
import ToriImage from '../Components/ToriImage.js';

import { assets } from '../assets.js';
import * as util from '../utils.js';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  card: {
    maxWidth: 300,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 16,
    flexGrow: 1,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.light,
  },
  cardHeaderOther: {
    backgroundColor: theme.palette.secondary.light,
  },
  paper: {
    padding: 16,
  },
  fuseButton: {
    marginTop: 10
  }
});

class Breed extends Component {

    static contextTypes = {
      web3: PropTypes.object,
      toriToken: PropTypes.object,
      toriVisit: PropTypes.object,
      accContracts: PropTypes.array,
      userAccount: PropTypes.string,
      onMessage: PropTypes.func,
    }

    constructor(props, context) {
      super(props);
      this.context = context;

      this.state = {
        id: this.props.match.params.id,
        offering: {},
        info: {}
      };

      // Function BINDS
      this.renderToriList = this.renderToriList.bind(this);
      this.renderBreedAction = this.renderBreedAction.bind(this);
      this.onOfferingSelected = this.onOfferingSelected.bind(this);
      this.breedToris = this.breedToris.bind(this);
    }

    componentDidMount() {
      let info = this.props.history.location.state;
      if (info === undefined) {
        info = {};
      } else {
        info = info.info;
      }

      this.setState({
        info: info
      })

      // Check for props.
      if ((info.id === undefined) ||
          (info.id === this.props.match.params.id) ||
          (info.owner === this.context.userAccount)) {
        // Redirect to info.
        this.props.history.push('/nursery/breed');
        return;
      }

      util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
      .then((toriIds) => {
        toriIds = toriIds.map((id) => { return id.toNumber() });

        this.setState({
          toriIds: toriIds,
        });
      })
      .catch(console.error);
    }

    onOfferingSelected(info, e) {
      if (this.state.offering.id === undefined) {
        // User just selected an item.
        this.setState({
          offering: info,
        });
      } else {
        // User just deselected an item.
        this.setState({
          offering: info === this.state.offering ? {} : info,
        })
      }
    }

    renderToriList() {
      let content;
      if (this.state.toriIds) {
        // Filter the list based on the type.
        let callback = this.onOfferingSelected;
        let selectedCom = this.state.offering.id;

        content = this.state.toriIds.map((id) => {
          return (
            <TokenItem key={id}
                       id={id}
                       selected={id === selectedCom}
                       onItemSelected={callback} />
          );
        });
      }
      return (
        <ExpansionPanelDetails>
          { this.state.toriIds !== undefined ? (
            <List>
              { content }
            </List>
          ) : (
            <CircularProgress  color="secondary" />
          )}
        </ExpansionPanelDetails>
      );
    }

    breedToris() {
      util.visitTori(this.context.toriVisit, this.state.offering.id, this.state.info.id, this.context.userAccount)
      .then((result) => {
        if (!result) {
          let message = this.state.offering.name + '\'s breeding failed';
          this.props.onMessage(message);
          return;
        }

        let data = {
          id: this.state.offering.id,
          targetId: this.state.info.id,
          claimed: 0
        }

        fetch('/cribtori/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        })
        .then(function(response) {
          return response.status;
        })
        .then(function(status) {
          let message = this.state.offering.name + '\'s breeding is in progress';

          if (status === 400) {
            message = this.state.offering.name + '\'s breeding failed';
          }
          this.props.onMessage(message);

          if (result) {
            this.props.history.push({
              pathname: '/confirmation',
              state: {receipt: result.receipt}
            });
          }
        }.bind(this))
        .catch(console.err);
      })
      .catch(console.error);
    }

    renderBreedAction() {
      let disabled = this.state.offering.id === undefined;
      return (
        <Button className={this.props.classes.fuseButton}
                variant="raised"
                color="primary"
                disabled={disabled}
                onClick={this.breedToris} >
          <MergeTypeIcon /> Breed Toris
        </Button>
      );
    }

    render() {
      if (this.state === null) return (<div></div>);
      return (
        <Grid container className={this.props.classes.root}
                        spacing={16}
                        alignItems={'center'}
                        direction={'row'}
                        justify={'center'}>
          <Grid item sm={12}>
            <Typography variant="title" color="inherit" component="h1" align="center">
              Breeding
            </Typography>
            <Divider />
          </Grid>
          <Grid item sm={5}>
            <Card className={this.props.classes.card}>
              <ToriImage dna={this.state.info.dna}
                         size={100}
                         animate={true} />
              <CardHeader title={"Base: " + this.state.info.name}
                          className={this.props.classes.cardHeaderOther} />
            </Card>
          </Grid>
          <Grid item sm={2}>
            { this.renderBreedAction() }
          </Grid>
          <Grid item sm={5}>
            <Card className={this.props.classes.card} >
              { this.state.offering.id === undefined ? (
                <CardMedia className={this.props.classes.media}
                           image={assets.breed}
                           title="Offering Tori"
                />
              ) : (
                <ToriImage dna={this.state.offering.dna}
                           size={100}
                           animate={true} />
              )}
              <CardHeader title={"Offering" + (this.state.offering.name ? `: ${this.state.offering.name}` : '')}
                          className={this.props.classes.cardHeader} />
              <CardContent>
                <ExpansionPanel>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Choose your offering</Typography>
                  </ExpansionPanelSummary>
                  { this.renderToriList() }
                </ExpansionPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
}

export default withStyles(styles)(withRouter(Breed))

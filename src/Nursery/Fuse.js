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
  paper: {
    padding: 16,
  },
  fuseButton: {
    marginTop: 10
  }
});

class Fuse extends Component {

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
      base: {},
      offering: {},
    };

    // Function BINDS
    this.renderToriList = this.renderToriList.bind(this);
    this.renderFusionAction = this.renderFusionAction.bind(this);
    this.onBaseSelected = this.onBaseSelected.bind(this);
    this.onOfferingSelected = this.onOfferingSelected.bind(this);
    this.fuseToris = this.fuseToris.bind(this);
  }

  componentDidMount() {
    util.retrieveTokenIndexes(this.context.toriToken, this.context.userAccount)
    .then((toriIds) => {
      toriIds = toriIds.map((id) => { return id.toNumber() });

      this.setState({
        loaded: true,
        toriIds: toriIds,
      });
    })
    .catch(console.error);
  }

  onBaseSelected(info, e) {
    if (this.state.base.id === undefined) {
      // User just selected an item.
      this.setState({
        base: info,
      });
    } else {
      // User just deselected an item.
      this.setState({
        base: info === this.state.base ? {} : info,
      })
    }
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

  renderToriList(type) {
    let content;
    if (this.state.toriIds) {
      // Filter the list based on the type.
      let callback;
      let ids;
      let selectedCom;
      if (type === 0) {
        callback = this.onBaseSelected;
        selectedCom = this.state.base.id;
        ids = this.state.toriIds.filter((id) => id !== this.state.offering.id);
      } else {
        callback = this.onOfferingSelected;
        selectedCom = this.state.offering.id;
        ids = this.state.toriIds.filter((id) => id !== this.state.base.id);
      }
      content = ids.map((id) => {
        return (
          <TokenItem key={id}
                     id={id}
                     selected={id === selectedCom}
                     showLevel={true}
                     onItemSelected={callback} />
        );
      });
    }
    return (
      <ExpansionPanelDetails>
        { this.state.loaded ? (
          <List>
            { content }
          </List>
        ) : (
          <CircularProgress  color="secondary" />
        )}
      </ExpansionPanelDetails>
    );
  }

  fuseToris() {
    let fuseName = this.state.base.name.substring(0, Math.floor(this.state.base.name.length / 2)) +
                this.state.offering.name.substring(0, Math.floor(this.state.offering.name.length / 2));
    util.fuseToris(this.context.toriVisit, this.state.base.id, this.state.offering.id, fuseName, this.context.userAccount)
    .then((result) => {
      let message = this.state.base.name + '\'s fusion is in progress';
      if (!result) {
        message = this.state.offering.name + '\'s fusion failed';
      }
      this.context.onMessage(message);

      if (result) {
        this.props.history.push({
          pathname: '/confirmation',
          state: {receipt: result.receipt}
        });
      }
    })
    .catch(console.error);
  }

  renderFusionAction() {
    let valid = this.state.base.id !== undefined && this.state.offering.id !== undefined;
    return (
      <Paper className={this.props.classes.paper}>
        { !valid ? (
          <Typography variant="subheading" color="inherit" component="p" align="center">
            Choose your two Toris to combine.
          </Typography>
        ) : (
          <Button className={this.props.classes.fuseButton}
                  variant="raised"
                  color="primary"
                  onClick={this.fuseToris} >
            <MergeTypeIcon /> Fuse Toris
          </Button>
        )}
      </Paper>
    );
  }

  render() {
    return (
      <Grid container className={this.props.classes.root}
                      spacing={16}
                      alignItems={'center'}
                      direction={'row'}
                      justify={'center'}>
        <Grid item sm={12}>
          <Typography variant="title" color="inherit" component="h1" align="center">
            Fusion
          </Typography>
          <Divider />
        </Grid>
        <Grid item sm={5}>
          <Card className={this.props.classes.card}>
            { this.state.base.id === undefined ? (
              <CardMedia className={this.props.classes.media}
                         image={assets.breed}
                         title="Base Tori"
              />
            ) : (
              <ToriImage dna={this.state.base.dna}
                         size={100}
                         animate={true} />
            )}
            <CardHeader title={"Base" + (this.state.base.name ? `: ${this.state.base.name}` : '')}
                        className={this.props.classes.cardHeader} />
            <CardContent>
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Choose your base Tori</Typography>
                </ExpansionPanelSummary>
                { this.renderToriList(0) }
              </ExpansionPanel>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={2}>
          { this.renderFusionAction() }
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
                { this.renderToriList(1) }
              </ExpansionPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withRouter(Fuse))

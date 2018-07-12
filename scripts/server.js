var express = require('express');

var path = require('path');
var chalk = require('chalk');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var async = require("async");

var devServer = express();

var paths = require('../config/paths');
// SQL connection.
var sqlConfig = require('../config/sql.js');
var connection = mysql.createConnection(sqlConfig.cred);

var DEFAULT_PORT = process.env.PORT || 3000;
var protocol = process.env.HTTPS === 'true' ? "https" : "http";
var host = process.env.HOST || 'localhost';

var DIST_DIR = paths.appBuild;

// devServer.use(express.static('/cribtori/build_webpack'));

devServer.use(express.static(path.join(__dirname, '..', 'build_webpack/')));
devServer.use(bodyParser.urlencoded({ extended: false }));
devServer.use(bodyParser.json());

// Defining the endpoints.
var EndpointsLib = require('./endpoints.js');
let endpoints = new EndpointsLib(devServer);
endpoints.createAllEndpoints(mysql, connection);

// Launch WebpackDevServer.
devServer.listen(DEFAULT_PORT, (err, result) => {
  if (err) {
    return console.log(err);
  }

  console.log(chalk.cyan('Starting the Express server...'));
  console.log();
});

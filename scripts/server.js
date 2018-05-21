var express = require('express');

var path = require('path');
var chalk = require('chalk');
var mysql = require('mysql');
var bodyParser = require('body-parser');

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

function createEndpoints(devServer) {
  devServer.use(bodyParser.urlencoded({ extended: false }));
  devServer.use(bodyParser.json());

  devServer.get('/cribtori/api/hello', function(req, res) {
    res.status(200).send('hello world');
  });

  devServer.get('/cribtori/api/test/:id', function(req, res) {
    var id = req.params.id;
    res.status(200).send(id);
  });

  devServer.post('/cribtori/api/test', function(req, res) {
    res.status(200).send('hello!');
  });

  // Retrieving activities.
  devServer.get('/cribtori/api/activity/:id', function(req, res) {
    var id = req.params.id;
    var limit = req.query.limit;
    var query = 'SELECT * from activity where tori_id = ? ORDER BY time DESC';
    var inserts = [id];
    if (limit !== undefined) {
      query = 'SELECT * from activity where tori_id = ? ORDER BY time DESC LIMIT ?';
      inserts = [id, parseInt(limit)];
    }

    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) res.status(400).send({ message: 'invalid tori ID' });

      var results = rows.map((row) => {
        var data = {
          tori_id: row.tori_id,
          timestamp: row.time,
          activity_type: row.activity_type,
          description: row.description,
        }
        return data;
      });
      res.status(200).send(results);
    })
  });

  // Posting activities.
  devServer.post('/cribtori/api/activity', function(req, res) {
    // TODO: activity validation and authentication.
    var ONE_HOUR = 6 * 60 * 60 * 1000;
    var PERIOD = (req.activity_type === 'feed') ? 1 : 2;

    var actTime = new Date();

    if ((req.body.activity_type !== 'feed') && (req.body.activity_type !== 'clean')) {
      return res.status(400).send({ message: 'activity not recognized' });
    }

    var query = 'SELECT * from activity WHERE tori_id = ? AND activity_type = ? ORDER BY time DESC';
    var inserts = [req.body.id, req.body.activity_type];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) return res.status(400).send({ message: 'activity log failed, Error: ' + err });

      if (rows.length > 0) {
        var prevTime = new Date(rows[0].time);
        if (actTime - prevTime < PERIOD * ONE_HOUR) {
          return res.status(406).send({ message: 'Previous activity occur less than allowed period!'});
        }
      }

      // Check if more than 10
      if (rows.length > 20) {
        query = 'UPDATE activity SET time = ?, activity_type = ?, description = ? WHERE tori_id = ? AND ' +
                'time = (SELECT time from activity WHERE tori_id = ? ORDER BY time ASC);'
        inserts = [actTime, req.body.activity_type, req.body.description, req.body.id, req.body.id];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) return res.status(400).send({ message: 'activity log failed, Error: ' + err });
          return res.status(200).end();
        });
      } else {
        query = 'INSERT INTO activity (tori_id, time, activity_type, description) VALUES (?, ?, ?, ?)';
        inserts = [req.body.id, actTime, req.body.activity_type, req.body.description];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) return res.status(400).send({ message: 'activity log failed, Error: ' + err });
          return res.status(200).end();
        });
      }
    })
  });

  // Retrieving room arrangements.
  devServer.get('/cribtori/api/room/:id', function(req, res) {
    var id = req.params.id;
    var query = 'SELECT * from arrangement where tori_id = ?';
    var inserts = [id];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) return res.status(400).send({ message: 'invalid tori ID' });

      if (rows.length > 0) {
        var data = {
          tori_id: rows[0].tori_id,
          locations: rows[0].locations,
        }
        return res.status(200).send(data);
      }
      return res.status(200).send({});
    })
  });

  // Posting arrangements.
  devServer.post('/cribtori/api/room', function(req, res) {
    // TODO: room validation and authentication.
    var query = 'INSERT INTO arrangement (tori_id, locations) VALUES (?, ?) ON DUPLICATE KEY UPDATE locations = ?';
    var inserts = [req.body.id, req.body.locations, req.body.locations];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) res.status(400).send({ message: 'saving room failed, Error: ' + err });
      res.status(200).end();
    })
  });

  // Retrieving hearts.
  devServer.get('/cribtori/api/hearts/:id', function(req, res) {
    var id = req.params.id;
    var query = 'SELECT * from hearts where tori_id = ?';
    var inserts = [id];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) return res.status(400).send({ message: 'invalid tori ID' });

      if (rows.length > 0) {
        var data = {
          tori_id: rows[0].tori_id,
          hearts: rows[0].hearts,
        }
        return res.status(200).send(data);
      }
      return res.status(200).send({});
    })
  });

  // Posting hearts.
  devServer.post('/cribtori/api/hearts', function(req, res) {
    // TODO: room validation and authentication.
    var query = 'INSERT INTO hearts (tori_id, hearts) VALUES (?, ?) ON DUPLICATE KEY UPDATE hearts = ?';
    var inserts = [req.body.id, req.body.hearts, req.body.hearts];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) res.status(400).send({ message: 'saving hearts failed, Error: ' + err });
      res.status(200).end();
    })
  });

  // Retrieving visit.
  devServer.get('/cribtori/api/visit/:id', function(req, res) {
    var id = req.params.id;
    var query = 'SELECT * from visit where tori_id = ? AND claimed = 0';
    var inserts = [id];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) return res.status(400).send({ message: 'invalid tori ID' });

      if (rows.length > 0) {
        return res.status(200).send({target: rows[0].target_id});
      } else {
        return res.status(200).send({});
      }
    })
  });

  devServer.get('/cribtori/api/visitTarget/:id', function(req, res) {
    var id = req.params.id;
    var query = 'SELECT * from visit where target_id = ? AND claimed = 0';
    var inserts = [id];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) return res.status(400).send({ message: 'invalid tori ID' });

      if (rows.length > 0) {
        return res.status(200).send({target: rows[0].tori_id});
      } else {
        return res.status(200).send({});
      }
    })
  });

  // Posting visits.
  devServer.post('/cribtori/api/visit', function(req, res) {
    // TODO: room validation and authentication.
    var query = 'INSERT INTO visit (tori_id, target_id, claimed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE target_id = ?, claimed = ?';
    var inserts = [req.body.id, req.body.targetId, req.body.claimed, req.body.targetId, req.body.claimed];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) res.status(400).send({ message: 'saving visitation failed, Error: ' + err });
      res.status(200).end();
    })
  });
}

// Defining the endpoints.
createEndpoints(devServer);

// Launch WebpackDevServer.
devServer.listen(DEFAULT_PORT, (err, result) => {
  if (err) {
    return console.log(err);
  }

  console.log(chalk.cyan('Starting the Express server...'));
  console.log();
});

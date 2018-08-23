module.exports = function(devServer) {
  this.devServer = devServer;
  var session = require('express-session')
  var sessionConfig = require('../config/session.js');
  var ethUtil = require('ethereumjs-util');

  var ONE_HOUR = 60 * 60 * 1000;
  var NONCE_DIGIT = sessionConfig.sess.nonceDigit;

  // Set up the session.
  this.devServer.use(
    session({
      secret: sessionConfig.sess.secret,
      // Set the expiration for a day
      cookie: {
        maxAge: 24 * ONE_HOUR,
      }
    })
  );

  function restrict(req, res, next) {
    if ((req.session.loggedIn) && (req.session.pk)) {
      next();
    } else {
      res.status(400).send('Access denied!');
    }
  }

  this.createAllEndpoints = function(mysql, connection) {
    this.createTestEndpoints();
    this.createUserEndpoints(mysql, connection);
    //this.createActivityEndpoints(mysql, connection);
    this.createHeartsEndpoints(mysql, connection);
    //this.createVisitEndpoints(mysql, connection);
    this.createGreetingsEndpoints(mysql, connection);
  }

  // TEST
  this.createTestEndpoints = function() {
    this.devServer.get('/cribtori/api/hello', function(req, res) {
      res.status(200).send('hello world');
    });

    this.devServer.get('/cribtori/api/test/:id', function(req, res) {
      var id = req.params.id;
      res.status(200).send(id);
    });

    this.devServer.post('/cribtori/api/test', function(req, res) {
      res.status(200).send('hello!');
    });
  };

  // USER
  this.createUserEndpoints = function(mysql, connection) {
    // Get user.
    this.devServer.get('/cribtori/api/user', function(req, res) {
      var pk = req.query.pk;
      var query = 'SELECT username from user WHERE public_key = ?';
      var inserts = [pk];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: ('invalid request, Error: ' + err) });

        let data = {};
        if (rows.length > 0) {
          data = {
            pk: pk,
            username: rows[0].username,
            nonce: rows[0].nonce
          }
        }
        res.status(200).send(data);
      });
    });

    // Sign up user.
    this.devServer.post('/cribtori/api/user', function(req, res) {
      var pk = req.body.pk;
      var username = req.body.username;
      var email = req.body.email;

      // Assert the values.
      if (pk === '' || username === '' || email === '') {
        return res.status(400).send({message: 'invalid values to sign up.'});
      }

      // Generate random nonce
      let nonce = Math.floor(Math.random() * NONCE_DIGIT);;

      let query = 'INSERT INTO user (public_key, username, email, time, nonce) VALUES (?, ?, ?, ?, ?)';
      let inserts = [pk, username, email, new Date(), nonce];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) {
          return res.status(400).send({ message: 'sign up failed. User already signed up, Error: ' + err });
        }

        // Return the nonce
        let data = {
          pk: pk,
          username: username,
          nonce: nonce
        }
        res.status(200).send(data);
      });
    });

    // Authenticate user.
    this.devServer.post('/cribtori/api/user/auth', function(req, res) {
      var signature = req.body.signature;
      var pk = req.body.pk;

      connection.beginTransaction(function(err) {
        if (err) {
          return res.status(400).send({ message: 'authentication failed, Error: ' + err });
        }

        // Get the nonce from the pk.
        var query = 'SELECT username from user WHERE public_key = ?';
        var inserts = [pk];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) {
            return connection.rollback(function() {
              throw 'Getting user failed';
            });
          }

          if (rows.length == 0) {
            return connection.rollback(function() {
              throw 'User is not registered';
            });
          }

          let nonce = rows[0].nonce;

          var message = 'Signing one-time nonce: ' + nonce;

          const messageBuffer = ethUtil.toBuffer(message);
          const messageHash = ethUtil.hashPersonalMessage(messageBuffer);
          const signatureBuffer = ethUtil.toBuffer(signature);
          const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
          const publicKey = ethUtil.ecrecover(
            messageHash,
            signatureParams.v,
            signatureParams.r,
            signatureParams.s
          );
          const addressBuffer = ethUtil.publicToAddress(pk);
          const address = ethUtil.bufferToHex(addressBuffer);

          // Confirm address.
          if (address.toLowerCase() === pk.toLowerCase()) {
            // Matches. Now generate a new nonce for this user.
            let newNonce = Math.floor(Math.random() * NONCE_DIGIT);

            query = 'UPDATE user SET nonce = ? where public_key = ?';
            inserts = [newNonce, pk];
            connection.query(query, function (err, rows, fields) {
              return connection.rollback(function() {
                throw 'Saving new nonce failed';
              });

              connection.commit(function(err) {
                if (err) {
                  return connection.rollback(function() {
                    throw 'Commit failed';
                  });
                }

                // Update the session.
                req.session.loggedIn = true;
                req.session.pk = pk;

                return res.status(200).end();
              });
            });
          } else {
            return connection.rollback(function() {
              throw 'Signature doesn\'t match';
            });
          }
        });
      });
    });
  }

  // ACTIVITY
  this.createActivityEndpoints = function(mysql, connection) {
    // Retrieving activities.
    this.devServer.get('/cribtori/api/activity/:id', function(req, res) {
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

    let checkActive = function(req, res, next) {
      let id = req.body.id;

      var query = "SELECT * FROM hearts WHERE tori_id = ?";
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'invalid id' });

        if (rows.length > 0 && rows[0].active) {
          req.body.lastUpdate = rows[0].last_update;
          req.body.hearts = rows[0].hearts;
          next();
        } else {
          return res.status(400).send({ message: 'Tori is not currently active' });
        }
      })
    }

    // Posting activities.
    this.devServer.post('/cribtori/api/activity', /*checkActive,*/ function(req, res) {
      // TODO: activity validation and authentication.
      var PERIOD = (req.activity_type === 'feed') ? 2 : 4;

      var actTime = new Date();
      req.body.actTime = actTime;

      if ((req.body.activity_type !== 'feed') && (req.body.activity_type !== 'clean')) {
        return res.status(400).send({ message: 'activity not recognized' });
      }

      connection.beginTransaction(function(err) {
        if (err) { return res.status(400).send({ message: 'activity log failed, Error: ' + err }); }

        var query = 'SELECT * from activity WHERE tori_id = ? AND activity_type = ? ORDER BY time DESC';
        var inserts = [req.body.id, req.body.activity_type];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) {
            return connection.rollback(function() {
              throw error;
            });
          }
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
              if (err) {
                return connection.rollback(function() {
                  throw error;
                });
              }
              updateHearts(req, res);
            });
          } else {
            query = 'INSERT INTO activity (tori_id, time, activity_type, description) VALUES (?, ?, ?, ?)';
            inserts = [req.body.id, actTime, req.body.activity_type, req.body.description];
            query = mysql.format(query, inserts);
            connection.query(query, function (err, rows, fields) {
              if (err) {
                return connection.rollback(function() {
                  throw error;
                });
              }
              updateHearts(req, res);
            });
          }
        });
      });
    });
  };

  // HEARTS
  this.createHeartsEndpoints = function(mysql, connection) {
    const MIN_HEARTS = -1;
    const NEUTRAL_HEARTS = 0;
    const MAX_HEARTS = 1;
    const HOUR_DURATION = 3;
    const FEED_LIMIT = 1.5;
    const FEED_INCREMENT = 1;

    let calculateHearts = function(hearts, lastUpdate) {
      let currentTime = new Date();
      let hourPassed = (currentTime - lastUpdate) / ONE_HOUR;

      // TODO: enable personality effect.
      // -1 for every 3 hours.
      let decrement = hourPassed / HOUR_DURATION;
      let currentHearts = Math.max(hearts - decrement, MIN_HEARTS);
      return currentHearts;
    }

    // Retrieving hearts.
    this.devServer.get('/cribtori/api/hearts', function(req, res) {
      let id = req.query.id;

      var query = 'SELECT * FROM hearts WHERE tori_id = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'failed in retrieving hearts, Error: ' + err });

        let data = {}
        if (rows.length > 0) {

          data.id = rows[0].tori_id;
          data.saved = rows[0].hearts;
          data.hearts = calculateHearts(rows[0].hearts, rows[0].last_update);
          data.personality = rows[0].personality;
          data.last_update = rows[0].last_update;
          data.is_hungry = (new Date() - rows[0].last_update > (FEED_LIMIT * ONE_HOUR));
          data.feed_limit = FEED_LIMIT;
          data.next_feed = (FEED_LIMIT * ONE_HOUR) - (new Date() - rows[0].last_update);
          data.owner = rows[0].owner;
        }

        return res.status(200).send(data);
      });
    });

    // Update hearts (+1).
    this.devServer.post('/cribtori/api/hearts/feed', function(req, res) {
      let id = req.body.id;
      // TODO: check if pk match.
      // TODO: enable feeding limit.
      var query = 'SELECT * FROM hearts WHERE tori_id = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'failed in updating hearts, Error: ' + err });

        if (rows.length === 0) {
          return res.status(400).send({ message: 'failed in updating hearts. Invalid Tori, Error: ' + err });
        }

        let currentTime = new Date();
        let hourPassed = (currentTime - rows[0].last_update) / ONE_HOUR;
        if (hourPassed < FEED_LIMIT) {
          let result = {
            success: false,
            hearts: calculateHearts(rows[0].hearts, rows[0].last_update),
            last_update: rows[0].last_update,
            feed_limit: FEED_LIMIT,
          }
          return res.status(200).send(result);
        }

        let hearts = calculateHearts(rows[0].hearts, rows[0].last_update) + FEED_INCREMENT;

        query = 'UPDATE hearts SET hearts = ?, last_update = ? WHERE tori_id = ?';
        inserts = [hearts, currentTime, id];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) return res.status(400).send({ message: 'failed in updating hearts, Error: ' + err });

          let result = {
            success: true,
            hearts: hearts,
            last_update: currentTime,
            feed_limit: FEED_LIMIT,
          }

          return res.status(200).send(result);
        });
      });
    });

    // Only for activating and deactivating Toris + saving initial hearts.
    this.devServer.post('/cribtori/api/hearts/activate', function(req, res) {
      let id = req.body.id;
      let owner = req.body.owner;
      let personality = req.body.personality;

      var query = 'SELECT * FROM hearts WHERE tori_id = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'failed in activating tori, Error: ' + err });

        if ((rows.length !== 0) && (rows[0].owner === owner)) {
          // Existing tori. Already activated.
          return res.status(400).send({ message: 'failed in activating tori. Tori is already activated.'});
        }

        let now = new Date();
        query = 'INSERT INTO hearts (tori_id, owner, hearts, personality, last_update) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE owner = ?, hearts = ?, last_update = ?';
        inserts = [id, owner, NEUTRAL_HEARTS, personality, now, owner, NEUTRAL_HEARTS, now];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) return res.status(400).send({ message: 'failed in activating tori, Error: ' + err });

          return res.status(200).end();
        });
      });
    });
  };


  // VISIT
  this.createVisitEndpoints = function(mysql, connection) {
    // Retrieving visit.
    this.devServer.get('/cribtori/api/visit/:id', function(req, res) {
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

    this.devServer.get('/cribtori/api/visitTarget/:id', function(req, res) {
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
    this.devServer.post('/cribtori/api/visit', function(req, res) {
      // TODO: room validation and authentication.
      var query = 'INSERT INTO visit (tori_id, target_id, claimed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE target_id = ?, claimed = ?';
      var inserts = [req.body.id, req.body.targetId, req.body.claimed, req.body.targetId, req.body.claimed];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: 'saving visitation failed, Error: ' + err });
        res.status(200).end();
      })
    });
  };

  // GREETINGS
  this.createGreetingsEndpoints = function(mysql, connection) {
    this.devServer.get('/cribtori/api/greetings/:id', function(req, res) {
      var id = req.params.id;
      var query = 'SELECT * from greetings where tori_id = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'invalid tori ID' });

        if (rows.length > 0) {
          return res.status(200).send({greetings: rows[0].greetings});
        } else {
          return res.status(200).send({});
        }
      })
    });

    // Posting greetings.
    this.devServer.post('/cribtori/api/greetings', function(req, res) {
      var query = 'INSERT INTO greetings (tori_id, greetings) VALUES (?, ?) ON DUPLICATE KEY UPDATE greetings = ?';
      var inserts = [req.body.id, req.body.greetings, req.body.greetings];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: 'saving greetings failed, Error: ' + err });
        res.status(200).end();
      })
    });
  };
}

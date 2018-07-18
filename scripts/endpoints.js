module.exports = function(devServer) {
  this.devServer = devServer;
  var ONE_HOUR = 60 * 60 * 1000;

  this.createAllEndpoints = function(mysql, connection) {
    this.createTestEndpoints();
    this.createUserEndpoints(mysql, connection);
    //this.createActivityEndpoints(mysql, connection);
    //this.createHeartsEndpoints(mysql, connection);
    this.createRoomEndpoints(mysql, connection);
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
    this.devServer.get('/cribtori/api/user/:pk', function(req, res) {
      var pk = req.params.pk;
      var query = 'SELECT username from user WHERE public_key = ?';
      var inserts = [pk];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: ('invalid request, Error: ' + err) });

        let data = {};
        if (rows.length > 0) {
          data = {
            pk: pk,
            username: rows[0].username
          }
        }
        res.status(200).send(data);
      });
    });

    // Post user.
    this.devServer.post('/cribtori/api/user', function(req, res) {
      var pk = req.body.pk;
      var username = req.body.username;
      var email = req.body.email;

      // Assert the values.
      if (pk === '' || username === '' || email === '') {
        return res.status(400).send({message: 'invalid values to sign up.'});
      }

      connection.beginTransaction(function(err) {
        if (err) {
          return res.status(400).send({ message: 'sign up failed, Error: ' + err });
        }

        // Check if public key already exist.
        var query = 'SELECT username from user WHERE public_key = ?';
        var inserts = [pk];
        query = mysql.format(query, inserts);
        connection.query(query, function (err, rows, fields) {
          if (err) {
            return connection.rollback(function() {
              res.status(400).send({ message: 'sign up failed, Error: ' + err });
            });
          }

          if (rows.length > 0) {
            return connection.rollback(function() {
              res.status(400).send({ message: 'sign up failed, Error: ' + err });
            });
          }

          // Seems like it's a new user.
          query = 'INSERT INTO user (public_key, username, email, time) VALUES (?, ?, ?, ?)';
          inserts = [pk, username, email, new Date()];
          query = mysql.format(query, inserts);
          connection.query(query, function (err, rows, fields) {
            if (err) {
              return connection.rollback(function() {
                res.status(400).send({ message: 'sign up failed, Error: ' + err });
              });
            }
            // Success! Now also push to room.
            // TODO: should we check if pk exists in room?
            query = 'INSERT INTO room (public_key, room_id, room_size, max_level) VALUES (?, ?, ?, ?)';
            inserts = [pk, 1, 2, 1];
            query = mysql.format(query, inserts);
            connection.query(query, function (err, rows, fields) {
              if (err) {
                return connection.rollback(function() {
                  res.status(400).send({ message: 'sign up failed, Error: ' + err });
                });
              }
              connection.commit(function(err) {
                if (err) {
                  return connection.rollback(function() {
                    res.status(400).send({ message: 'sign up failed, Error: ' + err });
                  });
                }
                res.status(200).end();
              });
            });
          });
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
    let calculateHearts = function(hearts, type, personality, lastUpdate, currentTime) {
      // Check how much we should decrement the hearts.
      // For every 4 HOURS (TODO: ?)
      // Optimistic:   +1    -0.5
      // Irritable:    +0.5  -1
      // Melancholic:  +1    -1
      // Placid:       +0.5  -0.5
      let increment = [1, 0.5, 1, 0.5];
      let decrement = [0.5, 1, 1, 0.5];

      let denom = (type === 'feed') ? 2 : 1;
      let plus = (type === -1) ? 0 : (increment[personality] / denom);
      let hourPassed = (currentTime - lastUpdate) / ONE_HOUR;

      hearts = Math.max(0, hearts - decrement[personality] * (hourPassed / 4));
      hearts = hearts + plus;
      hearts = Math.max(0, Math.min(5, hearts));

      return hearts;
    }

    // TODO: what if this failed?
    let updateHearts = function(req, res) {
      let info = req.body.info;
      let personality = info.personality;
      let actTime = req.body.actTime;

      var query = 'SELECT * from hearts where tori_id = ?';
      var inserts = [req.body.id]
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }

        if (rows.length === 0) {
          // Insert the new Tori.
          let hearts = calculateHearts(2.6, req.activity_type, req.body.info.personality, actTime, actTime);

          query = 'INSERT IGNORE INTO hearts (tori_id, hearts, personality, last_update, active) VALUES (?, ?, ?, ?, ?)';
          inserts = [req.body.id, hearts, req.body.info.personality, actTime, 1];
          query = mysql.format(query, inserts);
          connection.query(query, function (err, rows, fields) {
            if (err) {
              return connection.rollback(function() {
                throw err;
              });
            }
            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  throw err;
                });
              }
              res.status(200).end();
            });
          });
        } else {
          // TODO: assuming there's already an entry.
          let hearts = rows[0].hearts;
          let lastUpdate = rows[0].last_update;

          hearts = calculateHearts(hearts, req.activity_type, personality, lastUpdate, actTime);

          // We're updating the hearts!
          query = 'UPDATE hearts SET hearts = ?, last_update = ? WHERE tori_id = ?';
          inserts = [hearts, actTime, req.body.id];

          query = mysql.format(query, inserts);
          connection.query(query, function (err, rows, fields) {
            if (err) {
              return connection.rollback(function() {
                throw err;
              });
            }
            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  throw err;
                });
              }
              res.status(200).end();
            });
          });
        }
      });
    }

    // Retrieving hearts.
    this.devServer.get('/cribtori/api/hearts', function(req, res) {
      // Check if there's extra query.
      let limit = req.query.limit;
      let active = req.query.active;

      var query = 'SELECT * from hearts';
      var inserts = [];
      if (active !== undefined) {
        query += ' WHERE active = ?';
        inserts.push(active);
      }
      if (limit !== undefined) {
        query += ' ORDER BY tori_id LIMIT ?';
        inserts.push(parseInt(limit, 10));
      }

      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'failed in retrieving hearts, Error: ' + err });
        let now = new Date();
        rows = rows.map((r) => {
          let rCopy = r;
          rCopy.hearts = calculateHearts(r.hearts, -1, r.personality, r.last_update, now);
          return rCopy;
        });

        return res.status(200).send(rows);
      })
    });

    this.devServer.get('/cribtori/api/hearts/:id', function(req, res) {
      var id = req.params.id;
      var query = 'SELECT * from hearts where tori_id = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'invalid tori ID' });

        if (rows.length > 0) {
          let now = new Date();
          let hearts = calculateHearts(rows[0].hearts, -1, rows[0].personality, rows[0].last_update, now);

          var data = {
            tori_id: rows[0].tori_id,
            hearts: hearts,
          }
          return res.status(200).send(data);
        }
        return res.status(200).send({});
      })
    });

    // Only for activating and deactivating Toris + saving initial hearts.
    this.devServer.post('/cribtori/api/hearts', function(req, res) {
      // If user is deactivating tori, we want to freeze the heart.
      // When the user is activating the tori, we want to start the counter from now --> so update the last_update.
      // User can only update the hearts for active tori.
      let now = new Date();
      // Check if we're activating or deactivating.
      // We're activating or deactivating. So no need to update the hearts.
      // When we're activating, we want to reset the last update to now.
      var query = 'INSERT IGNORE INTO hearts (tori_id, hearts, personality, last_update, active) VALUES (?, ?, ?, ?, ?)';
      var inserts = [req.body.id, 2.6, req.body.personality, now, req.body.active];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: 'hearts activation failed, Error: ' + err });
        res.status(200).end();
      });
    });
  };


  // ROOM
  this.createRoomEndpoints = function(mysql, connection) {
    // Retrieve room info.
    this.devServer.get('/cribtori/api/room/:pk', function(req, res) {
      var pk = req.params.pk;
      var query = 'SELECT * from room WHERE public_key = ?';
      var inserts = [pk];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
          if (err) return res.status(400).send({ message: 'invalid key, Error: ' + err });

          let result = rows.map((item) => {
            return {
              roomId: item.room_id,
              roomSize: item.room_size,
              maxLevel: item.max_level
            };
          });
          return res.status(200).send(result);
      });
    });

    // Update room info.
    this.devServer.post('/cribtori/api/room', function(req, res) {
      // TODO: add a middleware to check registered user.
      let maxLevel = req.body.maxLevel;
      // Get the appropriate room size.
      let roomSize = (maxLevel < 4) ? 2 : (maxLevel < 8) ? 3 : 4;
      var query = 'UPDATE room SET max_level = ?, room_size = ? WHERE public_key = ? AND room_id = ? AND max_level < ?';
      var inserts = [maxLevel, roomSize, req.body.pk, req.body.roomId, maxLevel];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'error in saving max level, Error: ' + err });

        return res.status(200).end();
      })
    });

    /*
    // Retrieving room arrangements.
    this.devServer.get('/cribtori/api/room/:id', function(req, res) {
      var id = req.params.id;
      var query = 'SELECT * from arrangement where public_key = ?';
      var inserts = [id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) return res.status(400).send({ message: 'invalid key' });

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
    this.devServer.post('/cribtori/api/room', function(req, res) {
      let actTime = new Date();

      var query = 'SELECT * FROM arrangement WHERE public_key = ?';
      var inserts = [req.body.id];
      query = mysql.format(query, inserts);
      connection.query(query, function (err, rows, fields) {
        if (err) res.status(400).send({ message: 'saving room failed, Error: ' + err });

        let layout = (rows.length === 0) ? [] : JSON.parse(rows[0].locations);
        layout = layout.filter((l) => l.key === 'tori').map((l) => { return l.id });
        let newLayout = JSON.parse(req.body.locations);
        newLayout = newLayout.filter((l) => l.key === 'tori').map((l) => { return l.id });

        // Filter out the list.
        layout = layout.filter((l) => newLayout.indexOf(l) === -1);     // Set in active
        newLayout = newLayout.filter((l) => layout.indexOf(l) === -1);  // Set active

        connection.beginTransaction(function(err) {
          if (err) { return res.status(400).send({ message: 'saving room failed, Error: ' + err }); }

          query = 'INSERT INTO arrangement (public_key, locations) VALUES (?, ?) ON DUPLICATE KEY UPDATE locations = ?';
          inserts = [req.body.id, req.body.locations, req.body.locations];
          query = mysql.format(query, inserts);
          connection.query(query, function (err, rows, fields) {
            if (err) {
              return connection.rollback(function() {
                throw error;
              });
            }
            // Now, set inactive and active.
            // First, set inactive.
            async.forEach(layout, function(id_old, callback_old) {
              query = 'UPDATE hearts SET active = ? WHERE tori_id = ?';
              inserts = [0, id_old];
              query = mysql.format(query, inserts);
              connection.query(query, function (err, rows, fields) {
                if (err) {
                  return connection.rollback(function() {
                    throw error;
                  });
                }
                callback_old();
              });
            }, function(err, result) {
              if (err) {
                return connection.rollback(function() {
                  throw error;
                });
              }
              // Second, set active.
              async.forEach(newLayout, function(id, callback) {
                query = 'UPDATE hearts SET active = ?, last_update = ? WHERE tori_id = ?';
                inserts = [1, actTime, id];
                query = mysql.format(query, inserts);
                connection.query(query, function (err, rows, fields) {
                  if (err) {
                    return connection.rollback(function() {
                      throw err;
                    });
                  }
                  callback();
                });
              }, function(err, result) {
                if (err) {
                  return connection.rollback(function() {
                    throw err;
                  });
                }
                connection.commit(function(err) {
                  if (err) {
                    return connection.rollback(function() {
                      throw err;
                    });
                  }
                  res.status(200).end();
                });
              });
            });
          });
        });
      })
    });
    */
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

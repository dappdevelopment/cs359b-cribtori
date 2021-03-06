process.env.NODE_ENV = 'development';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true});

// Adding express
var express = require('express');
var webpackdevMiddleware = require('webpack-dev-middleware');
var webpackhotMiddleware = require("webpack-hot-middleware");
var path = require('path');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var chalk = require('chalk');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var getProcessForPort = require('react-dev-utils/getProcessForPort');
var openBrowser = require('react-dev-utils/openBrowser');
var prompt = require('react-dev-utils/prompt');
var pathExists = require('path-exists');
var config = require('../config/webpack.config.dev');
var paths = require('../config/paths');
var async = require("async");

var useYarn = pathExists.sync(paths.yarnLockFile);
var cli = useYarn ? 'yarn' : 'npm';
var isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;
var compiler;
var handleCompile;

// You can safely remove this after ejecting.
// We only use this block for testing of Create React App itself:
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

// SQL connection.
var sqlConfig = require('../config/sql.js');
var connection = mysql.createConnection(sqlConfig.cred);


function setupCompiler(host, port, protocol) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  compiler = webpack(config, handleCompile);

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', function() {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  var isFirstCompile = true;

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', function(stats) {
    if (isInteractive) {
      clearConsole();
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    var messages = formatWebpackMessages(stats.toJson({}, true));
    var isSuccessful = !messages.errors.length && !messages.warnings.length;
    var showInstructions = isSuccessful && (isInteractive || isFirstCompile);

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }

    if (showInstructions) {
      console.log();
      console.log('The app is running at:');
      console.log();
      console.log('  ' + chalk.cyan(protocol + '://' + host + ':' + port + '/'));
      console.log();
      console.log('Note that the development build is not optimized.');
      console.log('To create a production build, use ' + chalk.cyan(cli + ' run build') + '.');
      console.log();
      isFirstCompile = false;
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      messages.errors.forEach(message => {
        console.log(message);
        console.log();
      });
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      messages.warnings.forEach(message => {
        console.log(message);
        console.log();
      });
      // Teach some ESLint tricks.
      console.log('You may use special comments to disable some warnings.');
      console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
      console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
    }
  });
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return function(err, req, res){
    var host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') + ' Could not proxy request ' + chalk.cyan(req.url) +
      ' from ' + chalk.cyan(host) + ' to ' + chalk.cyan(proxy) + '.'
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) + ').'
    );
    console.log();

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
        res.writeHead(500);
    }
    res.end('Proxy error: Could not proxy request ' + req.url + ' from ' +
      host + ' to ' + proxy + ' (' + err.code + ').'
    );
  }
}

function addMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  var proxy = require(paths.appPackageJson).proxy;
  devServer.use(historyApiFallback({
    // Paths with dots should still use the history fallback.
    // See https://github.com/facebookincubator/create-react-app/issues/387.
    disableDotRule: true,
    // For single page apps, we generally want to fallback to /index.html.
    // However we also want to respect `proxy` for API calls.
    // So if `proxy` is specified, we need to decide which fallback to use.
    // We use a heuristic: if request `accept`s text/html, we pick /index.html.
    // Modern browsers include text/html into `accept` header when navigating.
    // However API calls like `fetch()` won’t generally accept text/html.
    // If this heuristic doesn’t work well for you, don’t use `proxy`.
    htmlAcceptHeaders: proxy ?
      ['text/html'] :
      ['text/html', '*/*']
  }));
  if (proxy) {
    if (typeof proxy !== 'string') {
      console.log(chalk.red('When specified, "proxy" in package.json must be a string.'));
      console.log(chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'));
      console.log(chalk.red('Either remove "proxy" from package.json, or make it a string.'));
      process.exit(1);
    }

    // Otherwise, if proxy is specified, we will let it handle any request.
    // There are a few exceptions which we won't send to the proxy:
    // - /index.html (served as HTML5 history API fallback)
    // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
    // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
    // Tip: use https://jex.im/regulex/ to visualize the regex
    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;

    // Pass the scope regex both to Express and to the middleware for proxying
    // of both HTTP and WebSockets to work without false positives.
    var hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
      target: proxy,
      logLevel: 'silent',
      onProxyReq: function(proxyReq, req, res) {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', proxy);
        }
      },
      onError: onProxyError(proxy),
      secure: false,
      changeOrigin: true,
      ws: true
    });
    devServer.use(mayProxy, hpm);

    // Listen for the websocket 'upgrade' event and upgrade the connection.
    // If this is not done, httpProxyMiddleware will not try to upgrade until
    // an initial plain HTTP request is made.
    devServer.listeningApp.on('upgrade', hpm.upgrade);
  }

  // Finally, by now we have certainly resolved the URL.
  // It may be /index.html, so let the dev server try serving it again.
  // devServer.use(devServer.middleware);
}


function createEndpoints(devServer) {
  devServer.use(bodyParser.urlencoded({ extended: false }));
  devServer.use(bodyParser.json());

  var ONE_HOUR = 60 * 60 * 1000;

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

  // Posting activities.
  devServer.post('/cribtori/api/activity', /*checkActive,*/ function(req, res) {
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

  // Retrieving room arrangements.
  devServer.get('/cribtori/api/room/:id', function(req, res) {
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
  devServer.post('/cribtori/api/room', function(req, res) {
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

  // Retrieving hearts.
  devServer.get('/cribtori/api/hearts', function(req, res) {
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

  devServer.get('/cribtori/api/hearts/:id', function(req, res) {
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
  devServer.post('/cribtori/api/hearts', function(req, res) {
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


  devServer.get('/cribtori/api/greetings/:id', function(req, res) {
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
  devServer.post('/cribtori/api/greetings', function(req, res) {
    var query = 'INSERT INTO greetings (tori_id, greetings) VALUES (?, ?) ON DUPLICATE KEY UPDATE greetings = ?';
    var inserts = [req.body.id, req.body.greetings, req.body.greetings];
    query = mysql.format(query, inserts);
    connection.query(query, function (err, rows, fields) {
      if (err) res.status(400).send({ message: 'saving greetings failed, Error: ' + err });
      res.status(200).end();
    })
  });
}


function runDevServer(host, port, protocol) {
  const devServer = express();
  devServer.use(webpackdevMiddleware(webpack(config), {
    // var devServer = new WebpackDevServer(compiler, {
      // Enable gzip compression of generated files.
      compress: true,
      // Silence WebpackDevServer's own logs since they're generally not useful.
      // It will still show compile warnings and errors with this setting.
      clientLogLevel: 'none',
      // By default WebpackDevServer serves physical files from current directory
      // in addition to all the virtual build products that it serves from memory.
      // This is confusing because those files won’t automatically be available in
      // production build folder unless we copy them. However, copying the whole
      // project directory is dangerous because we may expose sensitive files.
      // Instead, we establish a convention that only files in `public` directory
      // get served. Our build script will copy `public` into the `build` folder.
      // In `index.html`, you can get URL of `public` folder with %PUBLIC_PATH%:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
      // Note that we only recommend to use `public` folder as an escape hatch
      // for files like `favicon.ico`, `manifest.json`, and libraries that are
      // for some reason broken when imported through Webpack. If you just want to
      // use an image, put it in `src` and `import` it from JavaScript instead.
      contentBase: paths.appPublic,
      // Enable hot reloading server. It will provide /sockjs-node/ endpoint
      // for the WebpackDevServer client so it can learn when the files were
      // updated. The WebpackDevServer client is included as an entry point
      // in the Webpack development configuration. Note that only changes
      // to CSS are currently hot reloaded. JS changes will refresh the browser.
      // hot: true,
      // It is important to tell WebpackDevServer to use the same "root" path
      // as we specified in the config. In development, we always serve from /.
      publicPath: config.output.publicPath,
      // WebpackDevServer is noisy by default so we emit custom message instead
      // by listening to the compiler events with `compiler.plugin` calls above.
      quiet: true,
      // Reportedly, this avoids CPU overload on some systems.
      // https://github.com/facebookincubator/create-react-app/issues/293
      watchOptions: {
        ignored: /node_modules/
      },
      // Enable HTTPS if the HTTPS environment variable is set to 'true'
      https: protocol === "https",
      host: host
    })
  );
  devServer.use(webpackhotMiddleware(compiler, {
    heartbeat: 10 * 1000
  }));

  devServer.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(paths.appPublic, '/favicon.ico'));
  });

  // Defining the endpoints.
  createEndpoints(devServer);

  // Our custom middleware proxies requests to /index.html or a remote API.
  addMiddleware(devServer);

  // Launch WebpackDevServer.
  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.cyan('Starting the development server...'));
    console.log();

    // if (isInteractive) {
    //   openBrowser(protocol + '://' + host + ':' + port + '/');
    // }
  });
}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  var host = process.env.HOST || 'localhost';
  setupCompiler(host, port, protocol);
  runDevServer(host, port, protocol);
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  if (isInteractive) {
    clearConsole();
    var existingProcess = getProcessForPort(DEFAULT_PORT);
    var question =
      chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.' +
        ((existingProcess) ? ' Probably:\n  ' + existingProcess : '')) +
        '\n\nWould you like to run the app on another port instead?';

    prompt(question, true).then(shouldChangePort => {
      if (shouldChangePort) {
        run(port);
      }
    });
  } else {
    console.log(chalk.red('Something is already running on port ' + DEFAULT_PORT + '.'));
  }
});

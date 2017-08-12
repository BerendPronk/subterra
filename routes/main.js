const path = require('path');
const multer = require('multer');
const database = require('../assets/script/modules/database');
const password = require('../assets/script/modules/password');
const express = require('express');
const router = express.Router();

// Initialize multer storage
const fileStorage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, path.dirname(require.main.filename) + '/media');
  },
  filename: function (req, file, callBack) {
    callBack(null, file.originalname);
  }
});

// Apply configured storage to multer
const upload = multer({
  storage: fileStorage
});

// Define subterra routing
router.use('/menus', require('./menus'));
router.use('/types', require('./types'));
router.use('/pages', upload.any(), require('./pages'));

// [GET] /subterra
router.get('/', (req, res) => {
  console.log(`[${ req.method }] /subterra`);

  // Object containing system data, after MySQL query
  let system = {
    types: []
  };

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch all page types from database
    connection.query(`
      SELECT * FROM types
    `, [], (err, types) => {
      // Push page types in system object
      types.forEach(type => {
        system.types.push(type.name);
      });

      res.render('dashboard', {
        username: req.session.username,
        pathname: '/subterra',
        feedback: req.query.feedback,
        feedbackState: req.query.state,
        system: {
          types: system.types
        }
      });
    });
  });
});

// [GET] /subterra/login
router.get('/login', (req, res) => {
  console.log(`[${ req.method }] /subterra/login`);

  // Check if a session already exists
  if (req.session.username) {
    // Navigate to subterra dashboard
    res.redirect(`/subterra'`);
  } else {
    res.render('login', {
      username: false,
      pathname: '/login',
      feedback: req.query.feedback,
      feedbackState: req.query.state
    });
  }
});

// [POST] /subterra/login
router.post('/login', (req, res) => {
  console.log(`[${ req.method }] /subterra/login`);

  const data = {
    username: req.body.username,
    password: password.encrypt(process.env.CRYPTO_KEY, req.body.password)
  };

  req.getConnection((err, connection) => {
    // Select the subterra database
    connection.query(`
      USE ${ process.env.DB_DATABASE }
    `, [], (err, log) => {

      // Select user from database based on submitted form
      connection.query(`
        SELECT * FROM users
        WHERE username = '${ data.username }'
      `, [], (err, users) => {

        // Check if username is contained in database
        if (users.length > 0) {
          // Check if given password the one of the user
          if (users[0].password === data.password) {
            // Apply username from database to session
            req.session.username = users[0].username;

            // Navigate to subterra dashboard and provide feedback with username
            res.redirect(`/subterra?feedback=Welcome back ${ req.session.username }!&state=positive`);
          } else {
            // Provide feedback that wrong password has been entered
            res.redirect(`/subterra/login?feedback=Password was incorrect. Are you sure you entered it properly?&state=negative`);
          }
        } else {
          // Provide feedback that wrong username has been entered
          res.redirect(`/subterra/login?feedback=Username not found. Are you sure you entered it correctly?&state=negative`);
        }
      });
    });
  });
});

// [GET] /subterra/logout
router.get('/logout', (req, res) => {
  console.log(`[${ req.method }] /subterra/logout`);

  // Remove everything that is stored in the session
  req.session.destroy();

  res.redirect('/');
});

// [GET] /subterra/search/?query
router.get('/search/*', (req, res) => {
  console.log(`[${ req.method }] /subterra/search`);

  const query = req.query.query;
  const queryString = () => req.query.query === '' ? 'All' : req.query.query;

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
  }

  req.getConnection((err, connection) => {
    // Search database on query
    database.search(connection, {
      query: query,
      callback: results => {
        res.render('search', {
          username: req.session.username,
          pathname: '/search',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          query: queryString(),
          results: results
        });
      }
    });
  });
});

module.exports = router;

const database = require('../assets/script/modules/database');
const express = require('express');
const router = express.Router();

// [GET] /subterra/types
router.get('/', (req, res) => {
  console.log(`[${ req.method }] /subterra/types`);

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
        system.types.push({
          id: type.id,
          name: type.name,
          defaultModules: type.defaultModules
        });
      });

      res.render('types/index', {
        username: req.session.username,
        pathname: '/subterra/types',
        feedback: req.query.feedback,
        feedbackState: req.query.state,
        system: {
          types: system.types
        }
      });
    });
  });
});

// [GET] /subterra/types/add
router.get('/add', (req, res) => {
  console.log(`[${ req.method }] /subterra/types/add`);

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Fetch all system page modules from database
    database.retrieve(connection, {
      category: 'types',
      tables: ['modules'],
      callback: systemData => {
        res.render('types/add', {
          username: req.session.username,
          pathname: '/subterra/types',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: systemData
        });
      }
    });
  });
});

// [POST] /subterra/types/add
router.post('/add', (req, res) => {
  console.log(`[${ req.method }] /subterra/types/add`);

  const data = {
    name: req.body.name.replace(/'/, '"').toLowerCase(),
    defaultModules: req.body.modules,
    isCategory: req.body.category
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
      let exists;

      // Check if page type name already exists
      types.forEach(type => {
        if (type.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO types SET ?
        `, [data], (err, log) => {
          // Navigate to /subterra/types overview and provide feedback that page type was successfully added
          res.redirect(`/subterra/types?feedback='${ data.name }' was successfully added.&state=positive`);
        });
      } else {
        // Provide feedback that page type name already exists
        res.redirect(`/subterra/types/add?feedback=Page type with name '${ data.name.toLowerCase() }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/types/edit/:id
router.get('/edit/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/types/edit/${ req.params.id }`);

  // Check if a session already exists
  if (!req.session.username) {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
    return;
  }

  req.getConnection((err, connection) => {
    // Select page type with ID from GET parameter
    connection.query(`
      SELECT * FROM types
      WHERE id = '${ req.params.id }'
    `, [], (err, types) => {
      const type = types[0];

      // Fetch all system page modules from database
      database.retrieve(connection, {
        category: 'types',
        tables: ['modules'],
        callback: systemData => {
          res.render('types/edit', {
            username: req.session.username,
            pathname: '/subterra/types',
            feedback: req.query.feedback,
            feedbackState: req.query.state,
            system: systemData,
            type: {
              id: type.id,
              name: type.name,
              modules: type.defaultModules.split(',').filter(e => {
                // Removes empty data fields
                return e;
              }),
              isCategory: type.isCategory
            }
          });
        }
      });
    });
  });
});

// [POST] /subterra/types/edit/:id
router.post('/edit/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/types/edit/${ req.params.id }`);

  const data = {
    name: req.body.name.replace(/'/, '"').toLowerCase(),
    defaultModules: req.body.modules,
    isCategory: req.body.category
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
      let exists;

      // Check if page type name already exists
      types.forEach(type => {
        if (type.id != req.params.id && type.name === data.name) {
          exists = true;
        }
      });

      if (!exists) {
        // Update page type in database
        connection.query(`
          UPDATE types SET ?
          WHERE id = ${ req.params.id }
        `, [data], (err, log) => {
          // Navigate to /subterra/types overview and provide feedback that page type was successfully edited
          res.redirect(`/subterra/types?feedback='${ data.name }' was successfully edited.&state=positive`);
        });
      } else {
        // Provide feedback that page type name already exists
        res.redirect(`/subterra/types/edit/${ req.params.id }/?feedback=Page type with name '${ data.name.toLowerCase() }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/types/delete/:id
router.get('/delete/:id', (req, res) => {
  console.log(`[${ req.method }] /subterra/types/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Remove page type from database
    connection.query(`
      DELETE FROM types
      WHERE id = ${ req.params.id }
    `, [], (err, log) => {
      // Redirect to page type overview page and provide feedback that page type is successfully deleted
      res.redirect(`/subterra/types?feedback=Successfully deleted the page type.&state=positive`);
    });
  });
});

module.exports = router;

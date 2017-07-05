const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const mySQL = require('mysql');
const myConnection = require('express-myconnection');
const database = require('./assets/script/modules/database');
const password = require('./assets/script/modules/password');
const session = require('express-session');
const express = require('express');

// Configure subterra
const config = opts => {
  // Set body-parser
  opts.application.use(bodyParser.urlencoded({ extended: false }));

  // Set subterra assets
  opts.application.use('/subterra/assets', express.static(__dirname + '/assets'));

  // Check if database already exists
  const connection = mySQL.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  });

  // Connect to subterra database
  opts.application.use(myConnection(mySQL, {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: database.create(connection, {
      subterraDB: process.env.DB_DATABASE,
      subterraUsername: process.env.SUBTERRA_USERNAME,
      subterraPassword: password.encrypt(process.env.CRYPTO_KEY, process.env.SUBTERRA_PASSWORD)
    }),
    port: process.env.DB_PORT
  }, 'single'));

  // Set application session
  opts.application.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false
  }));

  // Set subterra routing
  opts.application.use('/subterra', require('./routes/main'));

  // Set subterra views to application views
  return opts.views.push(__dirname + '/views');
};

module.exports.config = config;

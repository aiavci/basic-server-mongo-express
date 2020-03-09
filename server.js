/*
 * Copyright (c) 2019 Ali I. Avci
 */

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const config = require('config');
const logger = require('morgan');
const cors = require('cors');

var bodyParser = require('body-parser')

const app = express();

app.use(logger('dev'));

app.use(cors())

// Bodyparser Middleware
app.use(express.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

// DB Config
const db = config.mongoURI

// Connect to Mongo
mongoose
  .connect(db, { 
    useNewUrlParser: true,
    useCreateIndex: true
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

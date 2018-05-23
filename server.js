'use strict';

const express = require('express');
const morgan = require('morgan');

const {PORT} = require('./config.js');
const notesRouter = require('./routes/notes-router.js');

const app = express();

// this logs all incoming requests
app.use(morgan('dev'));
// this was the old custom logger middleware
// const logger = function (req, res, next) {
//   const now = new Date();
//   console.log(`${now.toLocaleDateString()} ${now.toLocaleTimeString()} ${req.method} ${req.url}`);
//   next();
// };
//app.use(logger);

// static server here
app.use(express.static('public'));

// parses incoming req's with JSON bodies and adds them to req.body
app.use(express.json());

// transfers all requests to notesRouter
app.use(notesRouter);

// 404 error handler function below
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
  // this is redundant as we have another error handler that responds with err.message in the bottom
  // res.status(404).json({ message: 'Not Found' });
});

// 500 error handler function below
app.use(function (err, req, res, next) {
  res.status(err.status || 500); // if anything is assigned to err.status (such as 400), it will use that; otherwise it will use 500
  // instead of returning the entire error object for security purposes, we just return a json response with particular keys of the error object
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
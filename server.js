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


// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err);
    });
  });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}



// Listen for incoming connections, changed to below to include normal or test services
// app.listen(PORT, function () {
//   console.info(`Server listening on ${this.address().port}`);
// }).on('error', err => {
//   console.error(err);
// });

// node sets require.main to current module when server is ran with '$npm start' or '$node server.js'
// if not started by these commands, it prevents the server to start normally, meaning it's for testing
if(require.main === module) {
  app.listen(PORT, function() {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}

module.exports = {app, runServer, closeServer}; // Export for testing

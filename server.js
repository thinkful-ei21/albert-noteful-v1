'use strict';

const express = require('express');
const app = express();

const { PORT } = require('./config.js');
const { logger } = require('./middleware/logger.js');

// Simple In-Memory Database
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

// static server here
app.use(express.static('public'));

// use our own custom logger here
app.use(logger);

// temp code just for the sake of generating an error
app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// GET function to support search query
// http://127.0.0.1:8080/api/notes?searchTerm=cats this is an example query
// app.get('/api/notes/', (req, res) => {
//   const searchTerm = req.query.searchTerm;
//   if(searchTerm) {
//     const foundData = data.filter(item => item.title.includes(searchTerm));
//     res.json(foundData);
//   } else {
//     res.json(data);
//   }
// this is the short-hand method of the above
// const {searchTerm} = req.query;
// res.json(searchTerm ? data.filter(item => item.title.includes(searchTerm)) : data);
// });

// GET Notes with search, replaces the above GET endpoint
app.get('/api/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

// GET /api/notes/:id returns a specific note based on the ID provided.
// http://127.0.0.1:8080/api/1005 this is an example of id search endpoint
app.get('/api/notes/:id', (req, res) => {
  const foundId = data.find(item => item.id === Number(req.params.id));
  res.json(foundId);
});

// 404 error handler function below
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

// 500 error handler function below
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
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
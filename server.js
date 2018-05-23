'use strict';

const express = require('express');
const app = express();

const { PORT } = require('./config.js');
const { logger } = require('./middleware/logger.js');
// this would also do for logger inline
// app.use(require('./middleware/logger.js'));

// Simple In-Memory Database
const data = require('./db/notes.json');
const simDB = require('./db/simDB.js');
const notes = simDB.initialize(data);

// this logs all incoming requests
app.use(logger);

// static server here
app.use(express.static('public'));

// parses incoming req's with JSON bodies and adds them to req.body
app.use(express.json());

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
// app.get('/api/notes/:id', (req, res) => {
//   const foundId = data.find(item => item.id === Number(req.params.id));
//   res.json(foundId);
// });

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  notes.find(id, (err, item) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(item); // responds with item of matching id
  });
});

// PUT (update notes by ID)
app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});


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
'use strict';

const express = require('express');
const app = express();

const data = require('./db/notes');

// ADD STATIC SERVER HERE
app.use(express.static('public'));

// GET function to support search query
// http://127.0.0.1:8080/api/notes?searchTerm=cats this is an example query
app.get('/api/notes/', (req, res) => {
  const searchTerm = req.query.searchTerm;
  const foundData = data.filter(item => item.title.includes(searchTerm));
  res.json(foundData);
});


// GET /api/notes/:id returns a specific note based on the ID provided.
app.get('/api/notes/:id', (req, res) => {
  const foundData = data.find(item => item.id === Number(req.params.id));
  res.json(foundData);
});


app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});
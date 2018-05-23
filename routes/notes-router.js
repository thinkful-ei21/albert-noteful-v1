'use strict';

const express = require('express');

const router = express.Router();

// Simple In-Memory Database
const data = require('../db/notes.json');
const simDB = require('../db/simDB.js');
const notes = simDB.initialize(data);

// temp code just for the sake of generating an error
router.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

// GET Notes with search, replaces the above GET endpoint
router.get('/api/notes', (req, res, next) => {
  const {searchTerm} = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});

// GET /api/notes/:id returns a specific note based on the ID provided.
router.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  notes.find(id, (err, item) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(item); // responds with item of matching id
  });
});

// PUT (update notes by ID)
router.put('/api/notes/:id', (req, res, next) => {
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

// POST (insert) an item
router.post('/api/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});

// DELETE (delete notes by ID)
router.delete('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;

  notes.delete(id, (err) => {
    if (err) {
      return next(err);
    }
    res.sendStatus(204);
  });
});

module.exports = router;
'use strict';

const {app, runServer, closeServer} = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Noteful App', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });


  describe('Express static', function () {

    it('GET request "/" should return the index page', function () {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });


  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });


  describe('GET /api/notes', function() {

    it('should return the default of 10 Notes as an array', function() {
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.at.least(10);
        });
    });

    it('should return an array of objects with the id, title and content', function() {
      return chai.request(app)
        .get('/api/notes')
        .then(function(res) {
          const expectedKeys = ['id', 'title', 'content'];
          res.body.forEach(function(each) {
            expect(each).to.be.a('object');
            expect(each).to.include.keys(expectedKeys);
          });
        });
    });

    it('should return correct search results for a valid query', function() {
      const validSearchTerm = 'cats';
      return chai.request(app)
        .get(`/api/notes/?searchTerm=${validSearchTerm}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body[0].title).to.include(validSearchTerm);
        });
    });

    it('should return an empty array for an incorrect query', function() {
      const invalidSearchTerm = 'a;sdlkfja;lsdkjfa;lsdkfj';
      return chai.request(app)
        .get(`/api/notes/?searchTerm=${invalidSearchTerm}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.equal(0);
        });
    });

  });


  describe('GET /api/notes/:id', function() {

    it('should return correct note object with id, title and content for a given id', function() {
      const validId = 1000;
      return chai.request(app)
        .get(`/api/notes/${validId}`)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.equal(validId);
        });
    });

    it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function() {
      const invalidId = 'DOESNOTEXIST';
      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });

  });


  describe('POST /api/notes', function() {

    it('should create and return a new item with location header when provided valid data', function() {
      const validData = {title: 'test title', content: 'test content'};
      const expectedKeys = ['id', 'title', 'content'];
      return chai.request(app)
        .post('/api/notes')
        .send(validData)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.have.header('location'); // wat???
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(expectedKeys);
          expect(res.body.id).to.equal(1010);
          expect(res.body.title).to.equal(validData.title);
          expect(res.body.content).to.equal(validData.content);
        });
    });

    it('should return an object with a message property "Missing title in request body" when missing "title" field', function() {
      const invalidData = {};
      return chai.request(app)
        .post('/api/notes')
        .send(invalidData)
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });


  describe('PUT /api/noes', function() {

    it('should update and return a note object when given valid data', function() {
      const validId = 1000;
      const validData = {title: 'test update title', content: 'test update content'};
      return chai.request(app)
        .put(`/api/notes/${validId}`)
        .send(validData)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.id).to.equal(validId);
          expect(res.body.title).to.equal(validData.title);
          expect(res.body.content).to.equal(validData.content);
        });
    });

    it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function() {
      const invalidId = 'DOESNOTEXIST';
      const validData = {title: 'test update title', content: 'test update content'};
      return chai.request(app)
        .put(`/api/notes/${invalidId}`)
        .send(validData)
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });

    it('should return an object with a message property "Missing title in request body" when missing "title" field', function() {
      const validId = 1000;
      const invalidData = {oops: 'missing title property', content: 'test update content'};
      return chai.request(app)
        .put(`/api/notes/${validId}`)
        .send(invalidData)
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });


  describe('DELETE /api/notes/:id', function() {

    it('should delete an item by id', function() {
      const validId = 1000;
      return chai.request(app)
        .delete(`/api/notes/${validId}`)
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });

  });


});



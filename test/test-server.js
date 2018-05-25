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


  describe('GET /api.notes/:id', function() {

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
      const invalidId = 9999;
      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .then(function(res) {
          expect(res).to.have.status(404);
        });
    });

  });




});



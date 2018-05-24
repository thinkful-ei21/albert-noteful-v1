/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();

  api.search({})
    .then(response => {
      store.notes = response;
      noteful.render();
    });
  // api.search({}, response => {
  //   store.notes = response;
  //   noteful.render();
  // });

});
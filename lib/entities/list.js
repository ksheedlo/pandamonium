'use strict';

var maas = require('../maas');

function list (cb) {
  maas.query({
    cacheKey: 'entities',
    path: '/entities'
  }, cb);
}

module.exports = {
  list: list
};

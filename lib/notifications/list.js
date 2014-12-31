'use strict';

var maas = require('../maas');

function list(cb) {
  maas.query({
    cacheKey: 'notifications',
    path: '/notifications'
  }, cb);
}

module.exports = {
  list: list
};

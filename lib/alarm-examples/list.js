'use strict';

var maas = require('../maas');

function list (cb) {
  maas.query({
    cacheKey: 'alarm_examples',
    path: '/alarm_examples'
  }, cb);
}

module.exports = {
  list: list
};

'use strict';

var maas = require('./maas');

exports.list = function list (cb) {
  maas.query({
    cacheKey: 'alarm_examples',
    path: '/alarm_examples'
  }, cb);
};

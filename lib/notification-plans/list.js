'use strict';

var maas = require('../maas');

function list(cb) {
  maas.query({
    cacheKey: 'notification_plans',
    path: '/notification_plans'
  }, cb);
}

module.exports = {
  list: list
};

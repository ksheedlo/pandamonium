'use strict';

var maas = require('../maas');

function list (cb) {
  maas.request({ path: '/entities' }, function (err, res, body) {
    if (err) {
      return cb(err);
    }
    cb(null, body.values);
  });
}

module.exports = {
  list: list
};

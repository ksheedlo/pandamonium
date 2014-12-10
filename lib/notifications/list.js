'use strict';

var auth = require('../auth'),
  catalog = require('../catalog'),
  request = require('request');

function list(cb) {
  auth.getAuthTokenAndServiceCatalog(function (err, tokenAndCatalog) {
    var endpoint;

    if (err) {
      return cb(err);
    }
    endpoint = catalog.getCloudMonitoringEndpoint(tokenAndCatalog);

    request({
      method: 'GET',
      uri: endpoint + '/notifications',
      json: true,
      headers: {
        'x-auth-token': tokenAndCatalog.access.token.id,
        'accept': 'application/json'
      }
    }, function (err, res, body) {
      if (err) {
        return cb(err);
      }
      cb(null, body.values);
    });
  });
}

module.exports = {
  list: list
};

'use strict';

var auth = require('../auth'),
  catalog = require('../catalog'),
  request = require('request');

function requestOne(props, cb) {
  auth.getAuthTokenAndServiceCatalog(function (err, tokenAndCatalog) {
    var endpoint, options;

    if (err) {
      return cb(err);
    }

    endpoint = catalog.getCloudMonitoringEndpoint(tokenAndCatalog);
    options = {
      method: props.method || 'GET',
      uri: endpoint + props.path,
      json: true,
      headers: {
        'x-auth-token': tokenAndCatalog.access.token.id,
        'accept': 'application/json'
      }
    };

    if (props.body) {
      options.body = props.body;
    }

    request(options, function (err, res, body) {
      if (err) {
        return cb(err);
      }
      if (res.statusCode && res.statusCode >= 400) {
        return cb(new Error('[maas:request] ' + (props.method || 'GET') +
          ' ' + endpoint + props.path + ' ' + res.statusCode));
      }
      cb(err, res, body);
    });
  });
}

module.exports = {
  request: requestOne
};

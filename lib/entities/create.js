'use strict';

var Chance = require('chance'),
  request = require('request'),
  auth = require('../auth'),
  catalog = require('../catalog');

var chance = new Chance();

function create(cb) {
  var label = [
    chance.word(),
    chance.word(),
    chance.word(),
    chance.word()
  ].join(' ');

  var ips = {
    internet0_v6: chance.ipv6(),
    internet0_v4: chance.ip()
  };

  var entity = {
    label: label,
    ip_addresses: ips,
    metadata: {
      'pandamonium': Date.now()
    }
  };

  auth.getAuthTokenAndServiceCatalog(function (err, tokenAndCatalog) {
    var endpoint;

    if (err) {
      return cb(err);
    }
    endpoint = catalog.getCloudMonitoringEndpoint(tokenAndCatalog);

    request({
      method: 'POST',
      uri: endpoint + '/entities',
      json: true,
      headers: {
        'x-auth-token': tokenAndCatalog.access.token.id,
        'accept': 'application/json'
      },
      body: entity,
    }, function (err, res, body) {
      if (err) {
        return cb(err);
      }
      entity.id = res.headers['x-object-id'];
      cb(null, entity);
    });
  });
}

module.exports = {
  create: create
};

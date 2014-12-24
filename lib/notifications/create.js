'use strict';

var async = require('async'),
  auth = require('../auth'),
  catalog = require('../catalog'),
  Chance = require('chance'),
  request = require('request');

var chance = new Chance();

function getDetailsByType(type) {
  if (type === 'email') {
    return {
      address: chance.email()
    };
  } else if (type === 'sms') {
    return {
      phone_number: '+1' + chance.string({
        pool: '0123456789',
        length: 9
      })
    };
  } else if (type === 'webhook') {
    return {
      url: chance.url()
    };
  } else {
    // pagerduty
    return {
      service_key: chance.string({
        pool: '0123456789abcdef',
        length: 32
      })
    };
  }
}

function createOne(cb) {
  var type = chance.pick(['email', 'sms', 'webhook', 'pagerduty']);

  var label = [
    chance.word(),
    chance.twitter()
  ].join(' ');

  var notification = {
    label: label,
    type: type,
    details: getDetailsByType(type),
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
      uri: endpoint + '/notifications',
      json: true,
      headers: {
        'x-auth-token': tokenAndCatalog.access.token.id,
        'accept': 'application/json'
      },
      body: notification
    }, function (err, res) {
      if (err) {
        return cb(err);
      }
      notification.id = res.headers['x-object-id'];
      cb(null, notification);
    });
  });
}

function create(props, cb) {
  var count = props.count || 1;

  async.eachLimit(new Array(count), 10, function (x, cb) {
    createOne(cb);
  }, function (err) {
    if (err) {
      return cb(err);
    }
    cb(null);
  });
}

module.exports = {
  create: create
};

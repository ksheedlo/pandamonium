'use strict';

var cache = require('../cache'),
  config = require('../../config'),
  ksks = require('ksks'),
  request = require('request'),
  PiggybackBuffer = require('piggyback-buffer'),
  buffer,
  client;

buffer = new PiggybackBuffer();

client = ksks({
  identityEndpoint: config.IDENTITY_ENDPOINT,
  cache: {
    set: function (key, val, ttl, cb) {
      cache.put(key, val);
      process.nextTick(function () {
        cb(null, val);
      });
    },
    get: function (key, cb) {
      process.nextTick(function () {
        cb(null, cache.get(key));
      });
    },
    del: function () {}
  }
});

function requestOne(props, cb) {
  client.authenticate({
    username: config.RACKSPACE_USERNAME,
    apiKey: config.RACKSPACE_API_KEY
  }, function (err, catalog) {
    var endpoint, options;

    if (err) {
      return cb(err);
    }

    endpoint = ksks.endpoint(catalog, { service: 'cloudMonitoring' });
    options = {
      method: props.method || 'GET',
      uri: endpoint + props.path,
      json: true,
      headers: {
        'x-auth-token': ksks.token(catalog),
        accept: 'application/json'
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

function getterFn (bodyTransform) {
  return function (props, cb) {
    var cacheKey = props.cacheKey, value;

    if ((value = cache.get(cacheKey))) {
      process.nextTick(function () {
        cb(null, value);
      });
    } else if (buffer.isPending(cacheKey)) {
      buffer.queue(cacheKey, cb);
    } else {
      buffer.queue(cacheKey, cb);
      requestOne({
        path: props.path
      }, function (err, res, body) {
        var resultObj;

        if (err) {
          return buffer.reject(cacheKey, err);
        }
        resultObj = bodyTransform(body);
        cache.put(cacheKey, resultObj);
        buffer.resolve(cacheKey, resultObj);
      });
    }
  };
}

module.exports = {
  get: getterFn(function (x) { return x; }),
  query: getterFn(function (body) { return body.values; }),
  request: requestOne
};

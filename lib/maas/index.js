'use strict';

var auth = require('../auth'),
  cache = require('../cache'),
  catalog = require('../catalog'),
  request = require('request'),
  RequestBuffer = require('../request-buffer').RequestBuffer,
  buffer;

buffer = new RequestBuffer();

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

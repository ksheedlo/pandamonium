'use strict';

var cache = require('../cache'),
  config = require('../../config'),
  request = require('request'),
  RequestBuffer = require('../request-buffer').RequestBuffer;

/**
 * @module auth
 * @description
 * Handles requests to the Rackspace Cloud Identity API.
 */

function authenticate (cb) {
  var auth = {
    'RAX-KSKEY:apiKeyCredentials': {
      username: config.RACKSPACE_USERNAME,
      apiKey: config.RACKSPACE_API_KEY
    }
  };

  if (config.TENANT_ID) {
    auth.tenantId = config.TENANT_ID;
  }

  var options = {
    url: config.IDENTITY_ENDPOINT ||
      'https://identity.api.rackspacecloud.com/v2.0/tokens',
    method: 'POST',
    headers: {
      accept: 'application/json'
    },
    body: {
      auth: auth
    },
    json: true,
    strictSSL: true
  };

  request(options, function (err, res, body) {
    if (err) {
      cb(err);
    } else {
      cb(null, body);
    }
  });
}

function needsRefresh (catalog) {
  var expireDate;

  if (!catalog) {
    return true;
  }
  expireDate = new Date(catalog.access.token.expires);
  return expireDate < Date.now();
}

var buffer = new RequestBuffer(),
  CACHE_KEY = 'service_catalog';

/**
 * @function cloudidentity.getAuthTokenAndServiceCatalog
 * @description
 * Gets a valid Keystone authentication token and service catalog.
 *
 * The auth token and service catalog will be cached on a per-process basis
 * and returned from the cache if still valid. If this function is called after
 * the cached token and catalog expire, a new token and catalog will be fetched.
 * Otherwise, it returns the token from the cache if available, and by
 * requesting the Rackspace Cloud Identity API if necessary. This behavior can
 * be overridden by setting the optional `forceRefresh` argument to true.
 *
 * @param {boolean} [forceRefresh] - Whether to force invalidating the cached
 *    auth token and service catalog. If not specified, defaults to false.
 * @param {Function} cb - A Node.js-style callback for the result.
 */
function getAuthTokenAndServiceCatalog (cb) {
  var serviceCatalog = cache.get(CACHE_KEY);

  if (needsRefresh(serviceCatalog)) {
    if (buffer.isPending(CACHE_KEY)) {
      buffer.queue(CACHE_KEY, cb);
    } else {
      buffer.queue(CACHE_KEY, cb);
      authenticate(function (err, res) {
        if (err) {
          buffer.reject(CACHE_KEY, err);
        } else if (res.unauthorized) {
          buffer.reject(CACHE_KEY, new Error('(' + res.unauthorized.code + ')' +
            '[cloudidentity:unauth] ' + res.unauthorized.message));
        } else {
          cache.put(CACHE_KEY, res);
          buffer.resolve(CACHE_KEY, res);
        }
      });
    }
  } else {
    process.nextTick(function () {
      cb(null, serviceCatalog);
    });
  }
}

module.exports = {
  getAuthTokenAndServiceCatalog: getAuthTokenAndServiceCatalog
};

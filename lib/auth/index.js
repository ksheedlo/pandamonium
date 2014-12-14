'use strict';

var config = require('../../config'),
    request = require('request');

var RACKSPACE_IDENTITY_ENDPOINT = config.IDENTITY_ENDPOINT ||
  'https://identity.api.rackspacecloud.com/v2.0/tokens';

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
    url: RACKSPACE_IDENTITY_ENDPOINT,
    method: 'POST',
    headers: {
      'accept': 'application/json'
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

var serviceCatalog; // cache

function needsRefresh () {
  var expireDate;

  if (!serviceCatalog) {
    return true;
  }
  expireDate = new Date(serviceCatalog.access.token.expires);
  return expireDate < Date.now();
}

var requestBuffer;

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
  if (needsRefresh()) {
    if (requestBuffer) {
      requestBuffer.push(cb);
    } else {
      requestBuffer = [cb];
      authenticate(function (err, res) {
        if (err) {
          requestBuffer.forEach(function (cb) {
            cb(err);
          });
        } else if (res.unauthorized) {
          requestBuffer.forEach(function (cb) {
            cb(new Error('(' + res.unauthorized.code + ')[cloudidentity:unauth] ' +
              res.unauthorized.message));
          });
        } else {
          serviceCatalog = res;
          requestBuffer.forEach(function (cb) {
            cb(null, res);
          });
        }
        requestBuffer = undefined;
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

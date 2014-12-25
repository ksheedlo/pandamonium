'use strict';

var auth = require('../lib/auth'),
  cache = require('../lib/cache'),
  config = require('../config'),
  expect = require('chai').expect,
  MOCK = require('./mocks'),
  nock = require('nock');

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function currentServiceCatalog () {
  var catalog = deepClone(MOCK.serviceCatalog);
  catalog.access.token.expires = Date.now() + (1000 * 60 * 60); // 1 hour
  return catalog;
}

function expiredServiceCatalog() {
  var catalog = deepClone(MOCK.serviceCatalog);
  catalog.access.token.expires = Date.now() - (1000 * 60 * 60); // 1 hour
  return catalog;
}

describe('auth', function () {
  var oldUsername, oldApiKey, oldTenantId, oldIdentityEndpoint;

  before(function () {
    oldUsername = config.RACKSPACE_USERNAME;
    oldApiKey = config.RACKSPACE_API_KEY;
    oldTenantId = config.TENANT_ID;
    oldIdentityEndpoint = config.IDENTITY_ENDPOINT;
  });

  after(function () {
    config.RACKSPACE_USERNAME = oldUsername;
    config.RACKSPACE_API_KEY = oldApiKey;
    config.TENANT_ID = oldTenantId;
    config.IDENTITY_ENDPOINT = oldIdentityEndpoint;
  });

  beforeEach(function () {
    config.RACKSPACE_USERNAME = 'test.user';
    config.RACKSPACE_API_KEY = 'deadbeefdeadbeefdeadbeefdeadbeef';
    config.TENANT_ID = undefined;
    config.IDENTITY_ENDPOINT = undefined;

    cache.put('service_catalog', undefined); // clear the cache
  });

  it('gets the service catalog from the identity endpoint', function (done) {
    var scope = nock('https://identity.api.rackspacecloud.com')
      .post('/v2.0/tokens', {
        auth: {
          'RAX-KSKEY:apiKeyCredentials': {
            username: 'test.user',
            apiKey: 'deadbeefdeadbeefdeadbeefdeadbeef'
          }
        }
      })
      .reply(200, currentServiceCatalog());

    auth.getAuthTokenAndServiceCatalog(function (err, catalog) {
      if (err) {
        return done(err);
      }
      scope.done();
      expect(catalog).to.exist();
      done();
    });
  });

  it('uses the configured identity endpoint', function (done) {
    var scope;

    config.IDENTITY_ENDPOINT = 'http://localhost:8900/identity/v2.0/tokens';
    scope = nock('http://localhost:8900')
      .post('/identity/v2.0/tokens')
      .reply(200, currentServiceCatalog());

    auth.getAuthTokenAndServiceCatalog(function (err, catalog) {
      if (err) {
        return done(err);
      }
      scope.done();
      expect(catalog).to.exist();
      done();
    });
  });

  it('sends the tenant id if present', function (done) {
    var scope;

    config.TENANT_ID = '123456';
    scope = nock('https://identity.api.rackspacecloud.com')
      .post('/v2.0/tokens', {
        auth: {
          'RAX-KSKEY:apiKeyCredentials': {
            username: 'test.user',
            apiKey: 'deadbeefdeadbeefdeadbeefdeadbeef'
          },
          tenantId: '123456'
        }
      })
      .reply(200, currentServiceCatalog());

    auth.getAuthTokenAndServiceCatalog(function (err, catalog) {
      if (err) {
        return done(err);
      }
      scope.done();
      expect(catalog).to.exist();
      done();
    });
  });

  it('returns the cached service catalog', function (done) {
    cache.put('service_catalog', currentServiceCatalog());
    auth.getAuthTokenAndServiceCatalog(function (err, catalog) {
      if (err) {
        return done(err);
      }
      expect(catalog).to.exist();
      done();
    });
  });

  it('refreshes an expired service catalog', function (done) {
    var scope;

    cache.put('service_catalog', expiredServiceCatalog());
    scope = nock('https://identity.api.rackspacecloud.com')
      .post('/v2.0/tokens')
      .reply(200, currentServiceCatalog());

    auth.getAuthTokenAndServiceCatalog(function (err, catalog) {
      if (err) {
        return done(err);
      }
      scope.done();
      expect(catalog).to.exist();
      done();
    });
  });

  it('propagates authentication failures', function (done) {
    var scope = nock('https://identity.api.rackspacecloud.com')
      .post('/v2.0/tokens')
      .reply(401, { unauthorized: { code: 401, message: 'Oops!' } });

    auth.getAuthTokenAndServiceCatalog(function (err) {
      scope.done();
      expect(err.message).to.equal('(401)[cloudidentity:unauth] Oops!');
      done();
    });
  });
});

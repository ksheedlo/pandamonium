'use strict';

var async = require('async'),
  expect = require('chai').expect,
  cache = require('../lib/cache'),
  rewire = require('rewire'),
  maas = rewire('../lib/maas'),
  MOCK = require('./mocks'),
  nock = require('nock'),
  serviceCatalogCalls;

maas.__set__('auth', {
  getAuthTokenAndServiceCatalog: function (cb) {
    serviceCatalogCalls++;
    process.nextTick(function () {
      cb(null, MOCK.serviceCatalog);
    });
  }
});

describe('maas', function () {
  beforeEach(function () {
    serviceCatalogCalls = 0;
    cache.put('entities', undefined);
    cache.put('entity.en31337AC', undefined);
  });

  describe('.request', function () {
    it('calls auth.getAuthTokenAndServiceCatalog', function (done) {
      nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities')
        .reply(200, { values: [], metadata: {} });

      maas.request({
        path: '/entities'
      }, function (err) {
        if (err) {
          return done(err);
        }
        expect(serviceCatalogCalls).to.equal(1);
        done();
      });
    });

    it('sends the request to the Cloud Monitoring endpoint', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities')
        .reply(200, { values: [{ id: 'enWOW123' }], metadata: {} });

      maas.request({
        path: '/entities'
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }
        scope.done();
        expect(body.values[0].id).to.equal('enWOW123');
        done();
      });
    });

    it('sends a POST with a body', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .post('/v1.0/987654/entities', { label: 'test entity' })
        .reply(204, '');

      maas.request({
        path: '/entities',
        method: 'POST',
        body: { label: 'test entity' }
      }, function (err) {
        if (err) {
          return done(err);
        }
        scope.done();
        done();
      });
    });

    it('turns 400 status codes into errors', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities/enBADREF')
        .reply(404, { type: 'notFound' });

      maas.request({
        path: '/entities/enBADREF'
      }, function (err) {
        expect(err.message).to.match(/^\[maas:request\]/);
        scope.done();
        done();
      });
    });

    it('turns 500 status codes into errors', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities/en123ABC')
        .reply(500, { type: 'serverError' });

      maas.request({
        path: '/entities/en123ABC'
      }, function (err) {
        expect(err.message).to.match(/^\[maas:request\]/);
        scope.done();
        done();
      });
    });
  });

  describe('.query', function () {
    it('fetches the result from the cache', function (done) {
      cache.put('entities', [{ id: 'en31337AC' }]);
      maas.query({
        path: '/entities',
        cacheKey: 'entities'
      }, function (err, entities) {
        if (err) {
          return done(err);
        }
        expect(entities.length).to.equal(1);
        expect(entities[0].id).to.equal('en31337AC');
        done();
      });
    });

    it('gets the result from Cloud Monitoring if the cache misses', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities')
        .reply(200, { values: [{ id: 'en31337AC' }], metadata: {} });

      maas.query({
        path: '/entities',
        cacheKey: 'entities'
      }, function (err, entities) {
        if (err) {
          return done(err);
        }
        expect(entities.length).to.equal(1);
        expect(entities[0].id).to.equal('en31337AC');
        scope.done();
        done();
      });
    });

    it('buffers subsequent requests', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities')
        .reply(200, { values: [{ id: 'en31337AC' }], metadata: {} });

      async.parallel([
        function (cb) {
          maas.query({
            path: '/entities',
            cacheKey: 'entities'
          }, cb);
        },
        function (cb) {
          maas.query({
            path: '/entities',
            cacheKey: 'entities'
          }, cb);
        }
      ], function (err, res) {
        if (err) {
          return done(err);
        }
        expect(res[0][0].id).to.equal('en31337AC');
        expect(res[1][0].id).to.equal('en31337AC');
        scope.done();
        done();
      });
    });
  });

  describe('.get', function () {
    it('fetches the result from the cache', function (done) {
      cache.put('entity.en31337AC', { id: 'en31337AC' });
      maas.get({
        path: '/entities/en31337AC',
        cacheKey: 'entity.en31337AC'
      }, function (err, entity) {
        if (err) {
          return done(err);
        }
        expect(entity.id).to.equal('en31337AC');
        done();
      });
    });

    it('gets the result from Cloud Monitoring if the cache misses', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities/en31337AC')
        .reply(200, { id: 'en31337AC' });

      maas.get({
        path: '/entities/en31337AC',
        cacheKey: 'entity.en31337AC'
      }, function (err, entity) {
        if (err) {
          return done(err);
        }
        expect(entity.id).to.equal('en31337AC');
        scope.done();
        done();
      });
    });

    it('buffers subsequent requests', function (done) {
      var scope = nock('https://monitoring.api.rackspacecloud.com')
        .get('/v1.0/987654/entities/en31337AC')
        .reply(200, { id: 'en31337AC' });

      async.parallel([
        function (cb) {
          maas.get({
            path: '/entities/en31337AC',
            cacheKey: 'entity.en31337AC'
          }, cb);
        },
        function (cb) {
          maas.get({
            path: '/entities/en31337AC',
            cacheKey: 'entity.en31337AC'
          }, cb);
        }
      ], function (err, res) {
        if (err) {
          return done(err);
        }
        expect(res[0].id).to.equal('en31337AC');
        expect(res[1].id).to.equal('en31337AC');
        scope.done();
        done();
      });
    });
  });
});

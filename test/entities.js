'use strict';

var Chance = require('chance'),
  expect = require('chai').expect,
  MaasMock = require('./maas-mock'),
  rewire = require('rewire'),
  entities = rewire('../lib/entities'),
  maasQueryCalls,
  maasRequestCalls;

describe('Entity', function () {
  beforeEach(function () {
    maasQueryCalls = [];
    maasRequestCalls = [];
  });

  describe('.list', function () {
    var revert, maasMock;

    before(function () {
      maasMock = new MaasMock();
      revert = entities.__set__('maas', maasMock);
    });

    afterEach(function () {
      maasMock.verifyNoOutstandingExpectation();
      maasMock.reset();
    });

    after(function () {
      revert();
    });

    it('calls maas.query', function (done) {
      maasMock.expectQuery({
        path: '/entities'
      }).respond([{ id: 'fakeEntityId' }]);

      entities.list(function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasMock.queryCalls()[0].args[0]).to.eql({
          cacheKey: 'entities',
          path: '/entities'
        });
        expect(res).to.exist();
        done();
      });
    });
  });

  describe('.create', function () {
    var chance, maasMock, oldDateNow, revert;

    before(function () {
      oldDateNow = Date.now;
      Date.now = function () {
        return 1419544462490;
      };
      maasMock = new MaasMock();
      revert = entities.__set__('maas', maasMock);
    });

    beforeEach(function () {
      chance = new Chance(1);
    });

    afterEach(function () {
      maasMock.verifyNoOutstandingExpectation();
      maasMock.reset();
    });

    after(function () {
      Date.now = oldDateNow;
      revert();
    });

    it('makes the request to maas', function (done) {
      maasMock.expectRequest({
        path: '/entities',
        method: 'POST'
      }).respond({ headers: { 'x-object-id': 'en123456' } });

      entities.create(chance, function (err) {
        var requestArgs;

        if (err) {
          return done(err);
        }

        requestArgs = maasMock.requestCalls()[0].args[0];
        expect(requestArgs.path).to.equal('/entities');
        expect(requestArgs.method).to.equal('POST');
        expect(requestArgs.body.label).to.equal('wubju de ko rukvi');
        done();
      });
    });

    it('creates a random entity', function (done) {
      maasMock.expectRequest({
        path: '/entities',
        method: 'POST'
      }).respond({ headers: { 'x-object-id': 'en123456' } });

      entities.create(chance, function (err, entity) {
        if (err) {
          return done(err);
        }
        expect(entity).to.eql({
          label: "wubju de ko rukvi",
          ip_addresses: {
            internet0_v6: "37e3:08ae:6786:2f3c:cbfc:51b8:eded:1d04",
            internet0_v4: "43.15.224.171"
          },
          metadata: {
            pandamonium: "1419544462490"
          },
          id: "en123456"
        });
        done();
      });
    });
  });

  describe('.rollback', function () {
    var maasMock, revert;

    before(function () {
      maasMock = new MaasMock();
      revert = entities.__set__('maas', maasMock);
    });

    afterEach(function () {
      maasMock.verifyNoOutstandingExpectation();
      maasMock.reset();
    });

    after(function () {
      revert();
    });

    it('rolls back the pandamonium entity', function (done) {
      maasMock.expectQuery({
        path: '/entities'
      }).respond([{
        id: 'has-no-metadata'
      }, {
        id: 'pandamonium-server',
        metadata: {
          pandamonium: '1429305949665'
        }
      }, {
        id: 'distracting-metadata',
        metadata: {
          foo: 'bar'
        }
      }]);

      maasMock.expectRequest({
        path: '/entities/pandamonium-server',
        method: 'DELETE'
      }).respond('');

      entities.rollback(null, done);
    });

    it('rolls back entities since a given timestamp', function (done) {
      maasMock.expectQuery({
        path: '/entities'
      }).respond([{
        id: 'pandamonium-1',
        metadata: {
          pandamonium: '1429311751886'
        }
      }, {
        id: 'pandamonium-2',
        metadata: {
          pandamonium: '1429311951886'
        }
      }, {
        id: 'pandamonium-3',
        metadata: {
          pandamonium: '1429312051886'
        }
      }]);

      maasMock.whenRequest({
        path: '/entities/pandamonium-2',
        method: 'DELETE'
      }).respond('');

      maasMock.whenRequest({
        path: '/entities/pandamonium-3',
        method: 'DELETE'
      }).respond('');

      entities.rollback({
        since: '1429311851886'
      }, function (err) {
        if (err) {
          return done(err);
        }
        expect(maasMock.requestCalls().length).to.equal(2);
        done();
      });
    });

    it('rolls back entities until a given timestamp', function (done) {
      maasMock.expectQuery({
        path: '/entities'
      }).respond([{
        id: 'pandamonium-1',
        metadata: {
          pandamonium: '1429311751886'
        }
      }, {
        id: 'pandamonium-2',
        metadata: {
          pandamonium: '1429311951886'
        }
      }, {
        id: 'pandamonium-3',
        metadata: {
          pandamonium: '1429312051886'
        }
      }]);

      maasMock.whenRequest({
        path: '/entities/pandamonium-1',
        method: 'DELETE'
      }).respond('');

      maasMock.whenRequest({
        path: '/entities/pandamonium-2',
        method: 'DELETE'
      }).respond('');

      entities.rollback({
        until: 1429311951887
      }, function (err) {
        if (err) {
          return done(err);
        }

        expect(maasMock.requestCalls().length).to.equal(2);
        done();
      });
    });

    it('rolls back entities from since until until', function (done) {
      maasMock.expectQuery({
        path: '/entities'
      }).respond([{
        id: 'pandamonium-1',
        metadata: {
          pandamonium: '1429311751886'
        }
      }, {
        id: 'pandamonium-2',
        metadata: {
          pandamonium: '1429311951886'
        }
      }, {
        id: 'pandamonium-3',
        metadata: {
          pandamonium: '1429312051886'
        }
      }, {
        id: 'pandamonium-4',
        metadata: {
          pandamonium: '1429312251886'
        }
      }]);

      maasMock.whenRequest({
        path: '/entities/pandamonium-2',
        method: 'DELETE'
      }).respond('');

      maasMock.whenRequest({
        path: '/entities/pandamonium-3',
        method: 'DELETE'
      }).respond('');

      entities.rollback({
        since: 1429311851886,
        until: 1429312151886
      }, function (err) {
        if (err) {
          return done(err);
        }

        expect(maasMock.requestCalls().length).to.equal(2);
        done();
      });
    });
  });
});

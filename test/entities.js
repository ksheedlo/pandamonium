'use strict';

var Chance = require('chance'),
  expect = require('chai').expect,
  rewire = require('rewire'),
  entitiesCreate = rewire('../lib/entities/create'),
  entitiesList = rewire('../lib/entities/list'),
  maasQueryCalls,
  maasRequestCalls;

var MaasMock = {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeEntityExample' }]);
    });
  },
  request: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasRequestCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, { headers: { 'x-object-id': 'en123456' } });
    });
  }
};

entitiesCreate.__set__('maas', MaasMock);
entitiesList.__set__('maas', MaasMock);

describe('Entity', function () {
  beforeEach(function () {
    maasQueryCalls = [];
    maasRequestCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      entitiesList.list(function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasQueryCalls[0].args[0]).to.eql({
          cacheKey: 'entities',
          path: '/entities'
        });
        expect(res).to.exist();
        done();
      });
    });
  });

  describe('.create', function () {
    var chance, oldDateNow;

    before(function () {
      oldDateNow = Date.now;
      Date.now = function () {
        return 1419544462490;
      };
    });

    beforeEach(function () {
      chance = new Chance(1);
    });

    after(function () {
      Date.now = oldDateNow;
    });

    it('makes the request to maas', function (done) {
      entitiesCreate.create(chance, function (err) {
        var requestArgs;

        if (err) {
          return done(err);
        }

        requestArgs = maasRequestCalls[0].args[0];
        expect(requestArgs.path).to.equal('/entities');
        expect(requestArgs.method).to.equal('POST');
        expect(requestArgs.body.label).to.equal('wubju de ko rukvi');
        done();
      });
    });

    it('creates a random entity', function (done) {
      entitiesCreate.create(chance, function (err, entity) {
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
            pandamonium: 1419544462490
          },
          id: "en123456"
        });
        done();
      });
    });
  });
});

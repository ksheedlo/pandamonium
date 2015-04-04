'use strict';

var expect = require('chai').expect,
  Chance = require('chance'),
  rewire = require('rewire'),
  checks = rewire('../lib/checks'),
  maasQueryCalls,
  maasRequestCalls;

var MaasMock = {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeCheckExample' }]);
    });
  },
  request: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasRequestCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, { headers: { 'x-object-id': 'ch101C0D' } });
    });
  }
};

checks.__set__('maas', MaasMock);

describe('Check', function () {
  beforeEach(function () {
    maasQueryCalls = [];
    maasRequestCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      checks.list({ entityId: 'en123FOO' }, function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasQueryCalls[0].args[0]).to.eql({
          cacheKey: 'entity.en123FOO.checks',
          path: '/entities/en123FOO/checks'
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
      checks.create(chance, { entityId: 'en123456' }, function (err) {
        var requestArgs;

        if (err) {
          return done(err);
        }

        requestArgs = maasRequestCalls[0].args[0];
        expect(requestArgs.path).to.equal('/entities/en123456/checks');
        expect(requestArgs.method).to.equal('POST');
        expect(requestArgs.body.label).to.equal('wubju de ko');
        done();
      });
    });

    it('creates a random check', function (done) {
      checks.create(chance, {
        entityId: 'en123456'
      }, function (err, check) {
        if (err) {
          return done(err);
        }

        expect(check).to.eql({
          type: "agent.filesystem",
          label: "wubju de ko",
          metadata: {
            pandamonium: "1419544462490"
          },
          details: {
            target: "/var"
          },
          id: "ch101C0D"
        });
        done();
      });
    });
  });
});

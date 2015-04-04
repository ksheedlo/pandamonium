'use strict';

var Chance = require('chance'),
  expect = require('chai').expect,
  rewire = require('rewire'),
  notifications = rewire('../lib/notifications'),
  maasQueryCalls,
  maasRequestCalls;

var MaasMock = {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeNotificationExample' }]);
    });
  },
  request: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasRequestCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, { headers: { 'x-object-id': 'nt123456' } });
    });
  }
};

notifications.__set__('maas', MaasMock);

describe('Notification', function () {
  beforeEach(function () {
    maasQueryCalls = [];
    maasRequestCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      notifications.list(function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasQueryCalls[0].args[0]).to.eql({
          cacheKey: 'notifications',
          path: '/notifications'
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
      notifications.create(chance, function (err) {
        var maasRequestArg;

        if (err) {
          return done(err);
        }

        maasRequestArg = maasRequestCalls[0].args[0];
        expect(maasRequestArg.path).to.equal('/notifications');
        expect(maasRequestArg.method).to.equal('POST');
        expect(maasRequestArg.body.label).to.equal('obaudde @ko');
        done();
      });
    });

    it('creates a random notification', function (done) {
      notifications.create(chance, function (err, notification) {
        if (err) {
          return done(err);
        }
        expect(notification).to.eql({
          label: "obaudde @ko",
          type: "sms",
          details: {
            phone_number: "+1395843652"
          },
          metadata: {
            pandamonium: "1419544462490"
          },
          id: "nt123456"
        });
        done();
      });
    });
  });
});

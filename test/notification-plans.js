'use strict';

var expect = require('chai').expect,
  rewire = require('rewire'),
  npList = rewire('../lib/notification-plans/list'),
  maasQueryCalls;

npList.__set__('maas', {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeNotificationPlanExample' }]);
    });
  }
});

describe('NotificationPlan', function () {
  beforeEach(function () {
    maasQueryCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      npList.list(function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasQueryCalls[0].args[0]).to.eql({
          cacheKey: 'notification_plans',
          path: '/notification_plans'
        });
        expect(res).to.exist();
        done();
      });
    });
  });
});

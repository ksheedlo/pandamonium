'use strict';

var expect = require('chai').expect,
  rewire = require('rewire'),
  ntList = rewire('../lib/notifications/list'),
  maasQueryCalls;

ntList.__set__('maas', {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeNotificationExample' }]);
    });
  }
});

describe('Notification', function () {
  beforeEach(function () {
    maasQueryCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      ntList.list(function (err, res) {
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
});

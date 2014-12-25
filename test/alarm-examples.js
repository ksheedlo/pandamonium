'use strict';

var expect = require('chai').expect,
  rewire = require('rewire'),
  alarmExamplesList = rewire('../lib/alarm-examples/list'),
  maasQueryCalls;

alarmExamplesList.__set__('maas', {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeAlarmExample' }]);
    });
  }
});

describe('AlarmExample', function () {
  beforeEach(function () {
    maasQueryCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      alarmExamplesList.list(function (err, res) {
        if (err) {
          return done(err);
        }
        expect(maasQueryCalls[0].args[0]).to.eql({
          cacheKey: 'alarm_examples',
          path: '/alarm_examples'
        });
        expect(res).to.exist();
        done();
      });
    });
  });
});

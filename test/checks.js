'use strict';

var expect = require('chai').expect,
  rewire = require('rewire'),
  checksList = rewire('../lib/checks/list'),
  maasQueryCalls;

checksList.__set__('maas', {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeCheckExample' }]);
    });
  }
});

describe('Check', function () {
  beforeEach(function () {
    maasQueryCalls = [];
  });

  describe('.list', function () {
    it('calls maas.query', function (done) {
      checksList.list({ entityId: 'en123FOO' }, function (err, res) {
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
});

'use strict';

var expect = require('chai').expect,
  rewire = require('rewire'),
  entitiesList = rewire('../lib/entities/list'),
  maasQueryCalls;

entitiesList.__set__('maas', {
  query: function () {
    var args = Array.prototype.slice.call(arguments, 0),
      cb = args[1];

    maasQueryCalls.push({ args: args });
    process.nextTick(function () {
      cb(null, [{ id: 'fakeEntityExample' }]);
    });
  }
});

describe('Entity', function () {
  beforeEach(function () {
    maasQueryCalls = [];
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
});

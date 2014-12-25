'use strict';

var cache = require('../lib/cache'),
  expect = require('chai').expect;

describe('cache', function () {
  it('returns undefined if there is nothing in the cache', function () {
    expect(cache.get('I_DO_NOT_EXIST')).to.be.undefined();
  });

  it('puts things in and gets them back', function () {
    var importantThing;

    cache.put('TEST_CACHE_KEY', { foo: 'bar' });
    importantThing = cache.get('TEST_CACHE_KEY');
    expect(importantThing.foo).to.equal('bar');
  });
});

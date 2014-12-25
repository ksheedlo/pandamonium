'use strict';

var async = require('async'),
  expect = require('chai').expect,
  RequestBuffer = require('../lib/request-buffer').RequestBuffer;

describe('RequestBuffer', function () {
  var buffer;

  beforeEach(function () {
    buffer = new RequestBuffer();
  });

  it('queues and resolves a request', function (done) {
    buffer.queue('foo', function (err, res) {
      if (err) {
        return done(err);
      }
      expect(res).to.equal('test message');
      done();
    });

    process.nextTick(function () {
      buffer.resolve('foo', 'test message');
    });
  });

  it('resolves multiple requests', function (done) {
    async.parallel([
      function (cb) {
        buffer.queue('foo', function (err, res) {
          if (err) {
            return cb(err);
          }
          cb(null, res);
        });
      },
      function (cb) {
        buffer.queue('foo', function (err, res) {
          if (err) {
            return cb(err);
          }
          cb(null, res);
        });
      }
    ], function (err, msg) {
      if (err) {
        return done(err);
      }
      expect(msg[0]).to.equal('test 2');
      expect(msg[1]).to.equal('test 2');
      done();
    });

    process.nextTick(function () {
      buffer.resolve('foo', 'test 2');
    });
  });

  it('can tell if a request is pending', function () {
    buffer.queue('foo', function(){});
    expect(buffer.isPending('foo')).to.be.true();
    expect(buffer.isPending('bar')).to.be.false();
  });

  it('can have different queues according to different cache keys', function () {
    var foo, bar;

    buffer.queue('foo', function (err, _foo_) {
      foo = _foo_;
    });
    buffer.queue('bar', function (err, _bar_) {
      bar = _bar_;
    });
    buffer.resolve('foo', 'resolving foo');

    expect(foo).to.equal('resolving foo');
    expect(bar).to.be.undefined();

    buffer.resolve('bar', 'resolving bar');
    expect(bar).to.equal('resolving bar');
  });

  it('throws an error if it tries to resolve a nonexistent key', function () {
    expect(function () {
      buffer.resolve('foo', 'nonexistent key');
    }).to.throw(/^\[RequestBuffer:notpending\]/);
  });

  it('throws an error if it tries to reject a nonexistent key', function () {
    expect(function () {
      buffer.reject('foo', 'nonexistent key');
    }).to.throw(/^\[RequestBuffer:notpending\]/);
  });
});

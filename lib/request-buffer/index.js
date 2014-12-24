'use strict';

var _ = require('underscore');

function assertPending (requestBuffer, cacheKey) {
  if (!requestBuffer.isPending(cacheKey)) {
    throw new Error('[RequestBuffer:notpending] Tried to resolve or reject ' +
        'a nonexistent buffered request for key: ' + cacheKey);
  }
}

function RequestBuffer () {
  this.$$buffer = {};
}

RequestBuffer.prototype.queue = function (cacheKey, cb) {
  if (_.isUndefined(this.$$buffer[cacheKey])) {
    this.$$buffer[cacheKey] = [];
  }
  this.$$buffer[cacheKey].push(cb);
};

RequestBuffer.prototype.resolve = function (cacheKey, value) {
  assertPending(this, cacheKey);
  _.each(this.$$buffer[cacheKey], function (cb) {
    cb(null, value);
  });
  delete this.$$buffer[cacheKey];
};

RequestBuffer.prototype.reject = function (cacheKey, reason) {
  assertPending(this, cacheKey);
  _.each(this.$$buffer[cacheKey], function (cb) {
    cb(reason);
  });
  delete this.$$buffer[cacheKey];
};

RequestBuffer.prototype.isPending = function (cacheKey) {
  return !_.isUndefined(this.$$buffer[cacheKey]);
};

module.exports = {
  RequestBuffer: RequestBuffer
};

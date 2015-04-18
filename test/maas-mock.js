'use strict';

var _ = require('underscore');

function stringifyRequest(req) {
  var parts = ['path:', req.path];

  if (req.method) {
    parts.push('method:');
    parts.push(req.method);
  }

  if (req.cacheKey) {
    parts.push('cacheKey:');
    parts.push(req.cacheKey);
  }

  if (req.body) {
    parts.push('body:');
    parts.push(JSON.stringify(req.body));
  }

  return parts.join(' ');
}

function Expectation (props) {
  this.$props = props;
  this.$response = null;
}

Expectation.prototype.$matches = function (req) {
  if (this.$props.path !== req.path) {
    return false;
  }

  if ((this.$props.method || 'GET') !== (req.method || 'GET')) {
    return false;
  }

  // If this expectation specifies a cache key and the request
  // key does not match, there is no match. If this expectation
  // does not specify a cache key, the request may specify a cache
  // key and still match.
  if (this.$props.cacheKey) {
    if (!req.cacheKey) {
      return false;
    }
    if (this.$props.cacheKey !== req.cacheKey) {
      return false;
    }
  }

  // Likewise, we only match against the body if this expectation
  // specifies a body.
  if (this.$props.body) {
    if (!req.body) {
      return false;
    }
    if (!_.isEqual(this.$props.body, req.body)) {
      return false;
    }
  }

  return true;
};

Expectation.prototype.respond = function (resp) {
  this.$response = resp;
};

Expectation.prototype.toString = function () {
  return stringifyRequest(this.$props);
};

function MaasMock() {
  this.$expectedQueries = [];
  this.$queryCalls = [];

  this.$whenRequests = [];
  this.$expectedRequests = [];
  this.$requestCalls = [];
}

MaasMock.prototype.query = function () {
  var args = Array.prototype.slice.call(arguments, 0),
    cb = args[args.length - 1],
    matchingExpectation;

  this.$queryCalls.push({ args: args });
  if (!this.$expectedQueries.length) {
    throw new Error('[MaasMock:noexpect] No outstanding expectation for query!');
  }

  if (!this.$expectedQueries[0].$matches(args[0])) {
    throw new Error('[MaasMock:nomatch] Expected ' + this.$expectedQueries[0] +
      ', but got ' + stringifyRequest(args[0]));
  }

  matchingExpectation = this.$expectedQueries.shift();
  process.nextTick(function () {
    var response = matchingExpectation.$response;

    if (_.isUndefined(response) || _.isNull(response)) {
      return cb(new Error('[MaasMock:noresp] No response defined for query: ' +
        stringifyRequest(args[0])));
    }
    cb(null, response);
  });
};

MaasMock.prototype.expectQuery = function (query) {
  var expectation = new Expectation(query);
  this.$expectedQueries.push(expectation);
  return expectation;
};

MaasMock.prototype.queryCalls = function () {
  return this.$queryCalls;
};

MaasMock.prototype.requestCalls = function () {
  return this.$requestCalls;
};

MaasMock.prototype.request = function () {
  var args = Array.prototype.slice.call(arguments, 0),
    cb = args[args.length - 1],
    matchingExpectation;

  this.$requestCalls.push({ args: args });
  if (!this.$expectedRequests.length && !this.$whenRequests.length) {
    throw new Error('[MaasMock:noexpect] No outstanding expectation for request!');
  }

  if (this.$expectedRequests.length &&
    this.$expectedRequests[0].$matches(args[0])) {
    matchingExpectation = this.$expectedRequests.shift();
  } else {
    matchingExpectation = _.find(this.$whenRequests, function (expectation) {
      return expectation.$matches(args[0]);
    });
  }

  if (!matchingExpectation) {
    throw new Error('[MaasMock:nomatch] No matching expectation for request: ' +
      stringifyRequest(args[0]));
  }

  process.nextTick(function () {
    var response = matchingExpectation.$response;

    if (_.isUndefined(response) || _.isNull(response)) {
      return cb(new Error('[MaasMock:noresp] No response defined for request: ' +
        stringifyRequest(args[0])));
    }
    cb(null, response);
  });
};

MaasMock.prototype.expectRequest = function (req) {
  var expectation = new Expectation(req);
  this.$expectedRequests.push(expectation);
  return expectation;
};

MaasMock.prototype.whenRequest = function (req) {
  var expectation = new Expectation(req);
  this.$whenRequests.push(expectation);
  return expectation;
};

MaasMock.prototype.reset = function () {
  this.$whenRequests = [];
  this.$expectedRequests = [];
  this.$requestCalls = [];

  this.$expectedQueries = [];
  this.$queryCalls = [];
};

MaasMock.prototype.verifyNoOutstandingExpectation = function () {
  if (this.$expectedQueries.length || this.$expectedRequests.length) {
    throw new Error('[MaasMock:outstanding] There are outstanding requests!');
  }
};

module.exports = MaasMock;

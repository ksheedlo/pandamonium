'use strict';

var NodCache = require('node-cache'),
  theCache;

theCache = new NodCache(); // wow so nod.js

module.exports = {
  get: function (key) {
    var res = theCache.get(key);
    return res[key];
  },
  put: function (key, val) {
    theCache.set(key, val);
  }
};

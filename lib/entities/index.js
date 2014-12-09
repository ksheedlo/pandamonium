'use strict';

var async = require('async'),
  create = require('./create'),
  parseArgs = require('minimist');

function usage () {
  console.log('Usage: pm entities COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      count;
    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      count = parsed.n || parsed.count || 1;
      async.eachLimit(new Array(count), 10, function (x, cb) {
        create.create(cb);
      }, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
};

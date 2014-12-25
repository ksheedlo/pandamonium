'use strict';

var async = require('async'),
  Chance = require('chance'),
  create = require('./create'),
  list = require('./list').list,
  parseArgs = require('minimist');

function usage () {
  console.log('Usage: pm notifications COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  list: list,
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      chance,
      count;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      chance = new Chance();
      count = parsed.n || parsed.count || 1;

      async.eachLimit(new Array(count), 10, function (x, cb) {
        create.create(chance, cb);
      }, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
};

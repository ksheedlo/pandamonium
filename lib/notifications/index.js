'use strict';

var create = require('./create'),
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
      count;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      count = parsed.n || parsed.count || 1;
      create.create({ count: count }, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
};

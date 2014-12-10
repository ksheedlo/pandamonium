'use strict';

var create = require('./create'),
  parseArgs = require('minimist');

function usage () {
  console.log('Usage: pm checks COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      count,
      entityId,
      spread;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      count = parsed.n || parsed.count || 1;
      entityId = parsed.e || parsed.entity;
      spread = !!(parsed.s || parsed.spread);
      create.create({
        count: count,
        entityId: entityId,
        spread: spread
      }, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
};

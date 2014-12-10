'use strict';

var create = require('./create'),
  parseArgs = require('minimist');

function usage () {
  console.log('Usage: pm notification_plans COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      count,
      notifications;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      count = parsed.n || parsed.count || 1;
      if (parsed.notifications) {
        notifications = parsed.notifications.split(',')
      }
      create.create({
        count: count,
        notifications: notifications
      }, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
}

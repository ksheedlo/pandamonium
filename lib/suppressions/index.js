'use strict';

var create = require('./create'),
  parseArgs = require('minimist'),
  _ = require('underscore');

function usage () {
  console.log('Usage: pm suppressions COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      props;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      props = {
        count: parsed.n || parsed.count || 1,
        spread: !!(parsed.s || parsed.spread)
      };
      if (parsed.entities) {
        props.entities = parsed.entities.split(',');
      }
      if (parsed.alarms) {
        props.alarms = parsed.alarms.split(',');
      }
      if (parsed.checks) {
        props.checks = parsed.checks.split(',');
      }
      if (parsed.notification_plans) {
        props.notification_plans = parsed.notification_plans.split(',');
      }
      _.extend(props, _.pick(parsed, 'start_time', 'end_time'));
      create.create(props, cb);
    } else {
      usage();
      process.nextTick(function () {
        cb(new Error('Unrecognized command'));
      });
    }
  }
};

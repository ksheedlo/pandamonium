'use strict';

var create = require('./create').create,
  parseArgs = require('minimist');

function usage () {
  console.log('Usage: pm alarms COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

module.exports = {
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      command = parsed._[0],
      count,
      entityId,
      checkIds,
      notificationPlanIds,
      spread;

    if (command === 'help') {
      usage();
      process.nextTick(cb);
    } else if (command === 'create') {
      count = parsed.n || parsed.count || 1;
      entityId = parsed.e || parsed.entity;

      checkIds = parsed.c || parsed.checks;
      if (checkIds) {
        checkIds = checkIds.split(',');
      }

      notificationPlanIds = parsed.p || parsed.notification_plans;
      if (notificationPlanIds) {
        notificationPlanIds = notificationPlanIds.split(',');
      }

      spread = !!(parsed.s || parsed.spread);

      create({
        count: count,
        entityId: entityId,
        checkIds: checkIds,
        notificationPlanIds: notificationPlanIds,
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

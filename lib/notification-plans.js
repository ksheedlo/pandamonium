'use strict';

var async = require('async'),
  Chance = require('chance'),
  maas = require('./maas'),
  notifications = require('./notifications'),
  parseArgs = require('minimist'),
  _ = require('underscore');

exports.list = function list (cb) {
  maas.query({
    cacheKey: 'notification_plans',
    path: '/notification_plans'
  }, cb);
};

function createOne(chance, props, cb) {
  var label = [
    chance.pick(['Call', 'Email', 'Text', 'Yo', 'FaceTime']),
    chance.name({ prefix: true })
  ].join(' ');

  var selectedPlans = props.notifications || [];

  var notificationPlan = {
    label: label,
    critical_state: selectedPlans,
    warning_state: selectedPlans,
    ok_state: selectedPlans,
    metadata: {
      pandamonium: ''+Date.now()
    }
  };

  maas.request({
    method: 'POST',
    path: '/notification_plans',
    body: notificationPlan
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    notificationPlan.id = res.headers['x-object-id'];
    cb(null, notificationPlan);
  });
}

function getNotificationsAsync(notificationIds, cb) {
  if (notificationIds) {
    process.nextTick(function () {
      cb(null, notificationIds);
    });
  } else {
    notifications.list(function (err, notifications) {
      if (err) {
        return cb(err);
      }
      cb(null, _.pluck(notifications, 'id'));
    });
  }
}

function create(chance, props, cb) {
  var count = props.count || 1;

  getNotificationsAsync(props.notifications, function (err, nts) {
    if (err) {
      return cb(err);
    }

    async.eachLimit(new Array(count), 10, function (x, cb) {
      var notifications = [],
        ntsCount = chance.natural({
          min: 1,
          max: Math.max(10, nts.length)
        });

      if (props.notifications) {
        notifications = nts;
      } else {
        if (nts.length && ntsCount > 1) {
          notifications = chance.pick(nts, ntsCount);
        } else if (nts.length && ntsCount === 1) {
          notifications = [chance.pick(nts)];
        }
      }

      createOne(chance, { notifications: notifications }, cb);
    }, function (err) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  });
}
exports.create = create;

function usage () {
  console.log('Usage: pm notification_plans COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

exports.runCommand = function runCommand (argv, cb) {
  var parsed = parseArgs(argv),
    chance,
    command = parsed._[0],
    count,
    notifications;

  if (command === 'help') {
    usage();
    process.nextTick(cb);
  } else if (command === 'create') {
    chance = new Chance();
    count = parsed.n || parsed.count || 1;

    if (parsed.notifications) {
      notifications = parsed.notifications.split(',');
    }
    create(chance, {
      count: count,
      notifications: notifications
    }, cb);
  } else {
    usage();
    process.nextTick(function () {
      cb(new Error('Unrecognized command'));
    });
  }
};

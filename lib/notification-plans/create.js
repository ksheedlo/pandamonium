'use strict';

var async = require('async'),
  Chance = require('chance'),
  maas = require('../maas'),
  notifications = require('../notifications'),
  _ = require('underscore');

var chance = new Chance();

function createOne(props, cb) {
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
      pandamonium: Date.now()
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

function create(props, cb) {
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

      createOne({ notifications: notifications }, cb);
    }, function (err) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  });
}

module.exports = {
  create: create
};

'use strict';

var alarmExamples = require('../alarm-examples'),
  async = require('async'),
  Chance = require('chance'),
  checks = require('../checks'),
  criteria = require('./criteria'),
  entities = require('../entities'),
  notificationPlans = require('../notification-plans'),
  maas = require('../maas'),
  _ = require('underscore'),
  chance;

chance = new Chance();

function createOne(props, cb) {
  var label, alarm;

  label = [
    chance.word(),
    chance.word(),
    chance.word()
  ].join(' ');

  alarm = {
    label: label,
    check_id: props.check.id,
    notification_plan_id: props.notificationPlanId,
    metadata: {
      'pandamonium': Date.now()
    }
  };

  alarmExamples.list(function (err, examples) {
    var examplesWithThisCheckType;

    if (err) {
      return cb(err);
    }
    examplesWithThisCheckType = _.where(examples,
      { check_type: props.check.type });
    if (examplesWithThisCheckType.length > 0) {
      alarm.criteria = criteria.generate(chance,
        chance.pick(examplesWithThisCheckType));
    }

    maas.request({
      method: 'POST',
      path: '/entities/' + props.entityId + '/alarms',
      body: alarm
    }, function (err, res) {
      if (err) {
        return cb(err);
      }
      alarm.id = res.headers['x-object-id'];
      cb(null, alarm);
    });
  });
}

function getEntity (props, cb) {
  if (props.entityId) {
    process.nextTick(function () {
      cb(null, { id: props.entityId });
    });
  } else {
    entities.list(function (err, entities) {
      if (err) {
        return cb(err);
      } else if (entities.length === 0) {
        return cb(new Error('[alarms.create:noentity] Alarms must be ' +
          'associated with an Entity! No Entities were found on this account.'));
      }
      cb(null, chance.pick(entities));
    });
  }
}

function getNotificationPlans (props, cb) {
  var notificationPlanIds;

  if (props.notificationPlanIds) {
    notificationPlanIds = props.notificationPlanIds.map(function (npId) {
      return { id: npId };
    });
    process.nextTick(function () {
      cb(null, notificationPlanIds);
    });
  } else {
    notificationPlans.list(function (err, plans) {
      if (err) {
        return cb(err);
      } else if (plans.length === 0) {
        return cb(new Error('[alarms.create:nonp] Alarms must be associated ' +
          'with a Notification Plan! No Notification Plans were found on this ' +
          'account.'));
      }
      cb(null, plans);
    });
  }
}

function getChecks (entityId, props, cb) {
  checks.list({ entityId: entityId }, function (err, checks) {
    var checks_;

    if (err) {
      return cb(err);
    }

    checks_ = checks;
    if (props.checkIds) {
      checks_ = _.filter(checks_, function (check) {
        return _.contains(props.checkIds, check.id);
      });
    }

    if (checks_.length === 0) {
      return cb(new Error('[alarms.create:nocheck] Alarms must be associated' +
        ' with a Check! No Checks were found on this account for this ' +
        'entity.'));
    }

    if (!props.spread) {
      checks_ = [chance.pick(checks_)];
    }

    cb(null, checks_);
  });
}

function create(props, cb) {
  async.auto({
    entity: function (cb) {
      getEntity(props, cb);
    },
    notificationPlans: function (cb) {
      getNotificationPlans(props, cb);
    },
    checks: ['entity', function (cb, res) {
      getChecks(res.entity.id, props, cb);
    }]
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    async.eachLimit(new Array(props.count), 10, function (x, cb) {
      var entityId = res.entity.id,
        notificationPlanId = chance.pick(res.notificationPlans).id,
        check = chance.pick(res.checks);

      createOne({
        check: check,
        entityId: entityId,
        notificationPlanId: notificationPlanId
      }, cb);
    }, cb);
  });
}

module.exports = {
  create: create
};

'use strict';

var alarmExamples = require('./alarm-examples'),
  async = require('async'),
  Chance = require('chance'),
  checks = require('./checks'),
  entities = require('./entities'),
  notificationPlans = require('./notification-plans'),
  maas = require('./maas'),
  parseArgs = require('minimist'),
  _ = require('underscore');

var VARIABLE_REGEX = /\$\{([a-zA-Z0-9._-]+)\}/g,
  INTEGER_REGEX = /^(integer|whole number)/,
  PERCENTAGE_REGEX = /percentage/;

var FIELD_GENERATORS = [{
  field: 'percentage',
  test: function (field) {
    return INTEGER_REGEX.test(field.type) &&
      PERCENTAGE_REGEX.test(field.description);
  },
  gen: function (chance) {
    return chance.integer({ min: 1, max: 99 });
  }
}, {
  field: 'integer',
  test: function (field) {
    return INTEGER_REGEX.test(field.type);
  },
  gen: function (chance) {
    return chance.integer({ min: 1, max: 31337 });
  }
}, {
  field: 'string',
  test: _.constant(true), // default type
  gen: function (chance) {
    return chance.word({ syllables: 5 });
  }
}];

function generateCriteria(chance, example) {
  var env = {};

  return example.criteria.replace(VARIABLE_REGEX, function (match, name) {
    var field, fieldGen;

    if (env[name]) {
      // Reuse previously computed fields.
      return env[name];
    } else {
      field = _.findWhere(example.fields, { name: name });
      fieldGen = _.find(FIELD_GENERATORS, function (fg) {
        return fg.test(field);
      });
      env[name] = fieldGen.gen(chance);
      return env[name];
    }
  });
}

function createOne(chance, props, cb) {
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
      pandamonium: ''+Date.now()
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
      alarm.criteria = generateCriteria(chance,
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

function getEntity (chance, props, cb) {
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

function getChecks (chance, entityId, props, cb) {
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

function create(chance, props, cb) {
  async.auto({
    entity: function (cb) {
      getEntity(chance, props, cb);
    },
    notificationPlans: function (cb) {
      getNotificationPlans(props, cb);
    },
    checks: ['entity', function (cb, res) {
      getChecks(chance, res.entity.id, props, cb);
    }]
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    async.eachLimit(new Array(props.count), 10, function (x, cb) {
      var entityId = res.entity.id,
        notificationPlanId = chance.pick(res.notificationPlans).id,
        check = chance.pick(res.checks);

      createOne(chance, {
        check: check,
        entityId: entityId,
        notificationPlanId: notificationPlanId
      }, cb);
    }, cb);
  });
}
exports.create = create;

function usage () {
  console.log('Usage: pm alarms COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

exports.runCommand = function runCommand (argv, cb) {
  var parsed = parseArgs(argv),
    chance,
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
    chance = new Chance();

    checkIds = parsed.c || parsed.checks;
    if (checkIds) {
      checkIds = checkIds.split(',');
    }

    notificationPlanIds = parsed.p || parsed.notification_plans;
    if (notificationPlanIds) {
      notificationPlanIds = notificationPlanIds.split(',');
    }

    spread = !!(parsed.s || parsed.spread);

    create(chance, {
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
};

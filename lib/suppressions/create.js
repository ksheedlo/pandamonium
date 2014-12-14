'use strict';

var async = require('async'),
  Chance = require('chance'),
  entities = require('../entities'),
  maas = require('../maas'),
  _ = require('underscore'),
  chance;

chance = new Chance();

var SECONDS = 1000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES;

function createOne(props, cb) {
  var sp = _.pick(props, 'alarms', 'checks', 'entities', 'notification_plans',
    'start_time', 'end_time'),
    now = Date.now();

  if (!sp.start_time) {
    sp.start_time = chance.integer({
      min: now + (20*MINUTES),
      max: now + (1*HOURS)
    });
  }

  if (!sp.end_time) {
    sp.end_time = chance.integer({
      min: now + (2*HOURS),
      max: now + (6*HOURS)
    });
  }

  sp.label = [
    chance.pick(['quiet', 'stop', 'shutup', 'suppress', 'hold']),
    chance.word(),
    chance.word()
  ].join(' ');

  maas.request({
    method: 'POST',
    path: '/suppressions',
    body: sp
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    sp.id = res.headers['x-object-id'];
    cb(null, sp);
  });
}

function hasKey(props) {
  return function (key) {
    return !!props[key];
  };
}

function hasAnySuppressableKey(props) {
  return _.some(['alarms', 'checks', 'entities', 'notification_plans'],
    hasKey(props));
}

function getProps (props, cb) {
  if (hasAnySuppressableKey(props)) {
    process.nextTick(function () {
      cb(null, _.clone(props));
    });
  } else {
    entities.list(function (err, entities) {
      if (err) {
        return cb(err);
      }
      cb(null, {
        entitiesList: _.pluck(entities, 'id')
      });
    });
  }
}

function create(props, cb) {
  var createSuppressables;

  getProps(props, function (err, _props) {
    var _entityIds;

    if (err) {
      return cb(err);
    }

    if (!(_props.spread || hasAnySuppressableKey(props))) {
      // Choose one entity ID
      _entityIds = [chance.pick(_props.entitiesList)];
    }

    createSuppressables = function () {
      if (hasAnySuppressableKey(_props)) {
        return _props;
      } else if (_entityIds) {
        return { entities: _entityIds };
      } else {
        return {
          entities: chance.pick(_props.entitiesList, chance.integer({
            min: 1,
            max: Math.max(10, _props.entitiesList.length)
          }))
        };
      }
    };

    async.eachLimit(new Array(props.count || 1), 10, function (x, cb) {
      createOne(createSuppressables(), cb);
    }, cb);
  });
}

module.exports = {
  create: create
};

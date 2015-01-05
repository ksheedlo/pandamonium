'use strict';

var async = require('async'),
  Chance = require('chance'),
  create = require('./create').create,
  entities = require('../entities'),
  get = require('./get').get,
  list = require('./list').list,
  parseArgs = require('minimist'),
  _ = require('underscore');

function usage () {
  console.log('Usage: pm checks COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

function getEntityIdsListOrOverride(override, cb) {
  if (override) {
    process.nextTick(function () {
      cb(null, [override]);
    });
  } else {
    entities.list(function (err, entities) {
      if (err) {
        return cb(err);
      }
      cb(null, _.pluck(entities, 'id'));
    });
  }
}

function createChecksWithOptionalEntity(chance, props, cb) {
  getEntityIdsListOrOverride(props.entityId, function (err, entityIds) {
    var _entityIds = entityIds,
      count = props.count || 1;

    if (!props.spread) {
      _entityIds = [chance.pick(_entityIds)];
    }

    async.eachLimit(new Array(count), 10, function (x, cb) {
      var entityId = chance.pick(_entityIds);
      create(chance, { entityId: entityId }, cb);
    }, cb);
  });
}

module.exports = {
  get: get,
  list: list,
  runCommand: function (argv, cb) {
    var parsed = parseArgs(argv),
      chance = new Chance(),
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
      createChecksWithOptionalEntity(chance, {
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

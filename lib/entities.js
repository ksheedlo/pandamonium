'use strict';

var async = require('async'),
  Chance = require('chance'),
  maas = require('./maas'),
  parseArgs = require('minimist'),
  _ = require('underscore'),
  cliCommands;

function list (cb) {
  maas.query({
    cacheKey: 'entities',
    path: '/entities'
  }, cb);
}
exports.list = list;

function create(chance, cb) {
  var label = [
    chance.word(),
    chance.word(),
    chance.word(),
    chance.word()
  ].join(' ');

  var ips = {
    internet0_v6: chance.ipv6(),
    internet0_v4: chance.ip()
  };

  var entity = {
    label: label,
    ip_addresses: ips,
    metadata: {
      pandamonium: ''+Date.now()
    }
  };

  maas.request({
    path: '/entities',
    method: 'POST',
    body: entity
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    entity.id = res.headers['x-object-id'];
    cb(null, entity);
  });
}
exports.create = create;

function rollback(props, cb) {
  var props_ = props || {};

  list(function (err, entities) {
    if (err) {
      return cb(err);
    }

    async.eachLimit(entities, 10, function (entity, cb) {
      var createdOn;

      if (!(entity.metadata && entity.metadata.pandamonium)) {
        // Entity is malformatted, or entity was not created using
        // Pandamonium.
        return process.nextTick(cb);
      }

      createdOn = new Date(+entity.metadata.pandamonium);
      if ((props_.since && createdOn < new Date(+props_.since)) ||
        (props_.until && new Date(+props_.until) < createdOn)) {
        // Entity creation timestamp is out of the range to be purged.
        return process.nextTick(cb);
      }

      maas.request({
        path: '/entities/' + entity.id,
        method: 'DELETE'
      }, cb);
    }, cb);
  });
}
exports.rollback = rollback;

function usage () {
  console.log('Usage: pm entities COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|rollback|help)');
}

cliCommands = [{
  command: 'help',
  action: function (parsed, cb) {
    usage();
    process.nextTick(cb);
  }
}, {
  command: 'create',
  action: function (parsed, cb) {
    var chance = new Chance(),
      count = parsed.n || parsed.count || 1;

    async.eachLimit(new Array(count), 10, function (x, cb) {
      create(chance, cb);
    }, cb);
  }
}, {
  command: 'rollback',
  action: function (parsed, cb) {
    var options = {};

    if (parsed.since) {
      options.since = parsed.since;
    }
    if (parsed.until) {
      options.until = parsed.until;
    }

    rollback(options, cb);
  }
}];

exports.runCommand = function runCommand (argv, cb) {
  var parsed = parseArgs(argv),
    command = parsed._[0],
    cliAction;

  cliAction = _.findWhere(cliCommands, { command: command });
  if (cliAction) {
    return cliAction.action(parsed, cb);
  }

  usage();
  process.nextTick(function () {
    cb(new Error('Unrecognized command'));
  });
};

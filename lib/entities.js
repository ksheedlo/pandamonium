'use strict';

var async = require('async'),
  Chance = require('chance'),
  maas = require('./maas'),
  parseArgs = require('minimist');

exports.list = function list (cb) {
  maas.query({
    cacheKey: 'entities',
    path: '/entities'
  }, cb);
};

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

function usage () {
  console.log('Usage: pm entities COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

exports.runCommand = function runCommand (argv, cb) {
  var parsed = parseArgs(argv),
    chance = new Chance(),
    command = parsed._[0],
    count;

  if (command === 'help') {
    usage();
    process.nextTick(cb);
  } else if (command === 'create') {
    count = parsed.n || parsed.count || 1;
    async.eachLimit(new Array(count), 10, function (x, cb) {
      create(chance, cb);
    }, cb);
  } else {
    usage();
    process.nextTick(function () {
      cb(new Error('Unrecognized command'));
    });
  }
};

'use strict';

var async = require('async'),
  Chance = require('chance'),
  maas = require('./maas'),
  parseArgs = require('minimist');

exports.list = function list (cb) {
  maas.query({
    cacheKey: 'notifications',
    path: '/notifications'
  }, cb);
};

function getDetailsByType(chance, type) {
  if (type === 'email') {
    return {
      address: chance.email()
    };
  } else if (type === 'sms') {
    return {
      phone_number: '+1' + chance.string({
        pool: '0123456789',
        length: 9
      })
    };
  } else if (type === 'webhook') {
    return {
      url: chance.url()
    };
  } else {
    // pagerduty
    return {
      service_key: chance.string({
        pool: '0123456789abcdef',
        length: 32
      })
    };
  }
}

function create(chance, cb) {
  var type = chance.pick(['email', 'sms', 'webhook', 'pagerduty']);

  var label = [
    chance.word(),
    chance.twitter()
  ].join(' ');

  var notification = {
    label: label,
    type: type,
    details: getDetailsByType(chance, type),
    metadata: {
      pandamonium: ''+Date.now()
    }
  };

  maas.request({
    path: '/notifications',
    method: 'POST',
    body: notification
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    notification.id = res.headers['x-object-id'];
    cb(null, notification);
  });
}
exports.create = create;

function usage () {
  console.log('Usage: pm notifications COMMAND [OPTIONS]\n\n' +
    '\twhere COMMAND can be one of: (create|help)');
}

exports.runCommand = function runCommand (argv, cb) {
  var parsed = parseArgs(argv),
    command = parsed._[0],
    chance,
    count;

  if (command === 'help') {
    usage();
    process.nextTick(cb);
  } else if (command === 'create') {
    chance = new Chance();
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

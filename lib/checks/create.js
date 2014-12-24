'use strict';

var async = require('async'),
  Chance = require('chance'),
  entities = require('../entities'),
  maas = require('../maas'),
  _ = require('underscore');

var chance = new Chance();

var checkTypes = [{
  type: 'agent.memory',
  details: _.constant(null)
}, {
  type: 'agent.cpu',
  details: _.constant(null)
}, {
  type: 'agent.disk',
  details: _.constant({ target: '/dev/xvda1' })
}, {
  type: 'agent.load_average',
  details: _.constant(null)
}, {
  type: 'agent.filesystem',
  details: _.constant({ target: '/var' })
}, {
  type: 'agent.network',
  details: _.constant({ target: 'eth0' })
}, {
  type: 'remote.ssh',
  details: _.constant({ port: 22 })
}, {
  type: 'remote.smtp',
  details: function () {
    return {
      port: 25,
      from: chance.email(),
      to: chance.email(),
      payload: chance.paragraph()
    };
  }
}, {
  type: 'remote.http',
  details: function () {
    return { url: chance.url() };
  }
}, {
  type: 'remote.tcp',
  details: function () {
    return { port: chance.integer({ min: 1, max: 65535 }) };
  }
}, {
  type: 'remote.ping',
  details: function () {
    return { count: chance.integer({ min: 1, max: 10 }) };
  }
}];

function createOne(props, cb) {
  var label, checkType, checkDetails, check;

  label = [
    chance.word(),
    chance.word(),
    chance.word()
  ].join(' ');

  checkType = chance.pick(checkTypes);

  check = {
    type: checkType.type,
    label: label,
    metadata: {
      'pandamonium': Date.now()
    }
  };

  if ((checkDetails = checkType.details())) {
    check.details = checkDetails;
  }

  if (/^remote\./.test(check.type)) {
    check.monitoring_zones_poll = ['mzdfw', 'mzord', 'mzlon'];
    check.target_hostname = chance.ip();
    check.target_resolver = 'IPv4';
  }

  maas.request({
    method: 'POST',
    path: '/entities/' + props.entityId + '/checks',
    body: check
  }, function (err, res) {
    if (err) {
      return cb(err);
    }
    check.id = res.headers['x-object-id'];
    cb(null, check);
  });
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

function create(props, cb) {
  getEntityIdsListOrOverride(props.entityId, function (err, entityIds) {
    var _entityIds = entityIds,
      count = props.count || 1;

    if (!props.spread) {
      _entityIds = [chance.pick(_entityIds)];
    }

    async.eachLimit(new Array(count), 10, function (x, cb) {
      var entityId = chance.pick(_entityIds);
      createOne({ entityId: entityId }, cb);
    }, cb);
  });
}

module.exports = {
  create: create
};

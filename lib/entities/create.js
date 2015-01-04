'use strict';

var maas = require('../maas');

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

module.exports = {
  create: create
};

'use strict';

var maas = require('../maas');

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
      pandamonium: Date.now()
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

module.exports = {
  create: create
};

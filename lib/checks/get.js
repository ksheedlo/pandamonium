'use strict';

var maas = require('../maas');

function get(props, cb) {
  maas.get({
    cacheKey: 'entity.' + props.entityId + '.check.' + props.id,
    path: '/entities/' + props.entityId + '/checks/' + props.id
  }, cb);
}

module.exports = {
  get: get
};

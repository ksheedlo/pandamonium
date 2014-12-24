'use strict';

var maas = require('../maas');

function list(props, cb) {
  maas.query({
    cacheKey: 'entity.' + props.entityId + '.checks',
    path: '/entities/' + props.entityId + '/checks'
  }, cb);
}

module.exports = {
  list: list
};

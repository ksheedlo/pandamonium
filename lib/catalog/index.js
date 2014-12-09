'use strict';

var _ = require('underscore');

module.exports = {
  getCloudMonitoringEndpoint: function (catalog) {
    var cloudMonitoring = _.findWhere(catalog.access.serviceCatalog,
      { name: 'cloudMonitoring' });
    return cloudMonitoring.endpoints[0].publicURL;
  }
};

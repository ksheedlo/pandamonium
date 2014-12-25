'use strict';

var MOCK = require('./mocks'),
  catalog = require('../lib/catalog'),
  expect = require('chai').expect;

describe('catalog', function () {
  it('gets the Cloud Monitoring endpoint', function () {
    expect(catalog.getCloudMonitoringEndpoint(MOCK.serviceCatalog)).to.equal(
      'https://monitoring.api.rackspacecloud.com/v1.0/987654');
  });
});

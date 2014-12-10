'use strict';

var fs = require('graceful-fs'),
  path = require('path');

var filename = process.env.PM_SETTINGS || path.join(process.env.HOME, '.pmrc'),
  configFile;

try {
  configFile = fs.readFileSync(filename, 'utf8');
  configFile = JSON.parse(configFile);
} catch (err) {
  if (err.code === 'ENOENT') {
    configFile = {};
  } else {
    console.error('Error loading config file:', filename);
    process.exit(1);
  }
}

module.exports = {
  RACKSPACE_USERNAME: configFile.username || '',
  RACKSPACE_API_KEY: configFile.api_key || '',
  IDENTITY_ENDPOINT: configFile.identity_endpoint || null
};

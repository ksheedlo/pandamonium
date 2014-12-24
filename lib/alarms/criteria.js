'use strict';

var _ = require('underscore');

var VARIABLE_REGEX = /\$\{([a-zA-Z0-9._-]+)\}/g,
  INTEGER_REGEX = /^(integer|whole number)/,
  PERCENTAGE_REGEX = /percentage/;

var FIELD_GENERATORS = [{
  field: 'percentage',
  test: function (field) {
    return INTEGER_REGEX.test(field.type) &&
      PERCENTAGE_REGEX.test(field.description);
  },
  gen: function (chance) {
    return chance.integer({ min: 1, max: 99 });
  }
}, {
  field: 'integer',
  test: function (field) {
    return INTEGER_REGEX.test(field.type);
  },
  gen: function (chance) {
    return chance.integer({ min: 1, max: 31337 });
  }
}, {
  field: 'string',
  test: _.constant(true), // default type
  gen: function (chance) {
    return chance.word({ syllables: 5 });
  }
}];

function generate (chance, example) {
  var env = {};

  return example.criteria.replace(VARIABLE_REGEX, function (match, name) {
    var field, fieldGen;

    if (env[name]) {
      // Reuse previously computed fields.
      return env[name];
    } else {
      field = _.findWhere(example.fields, { name: name });
      fieldGen = _.find(FIELD_GENERATORS, function (fg) {
        return fg.test(field);
      });
      env[name] = fieldGen.gen(chance);
      return env[name];
    }
  });
}

module.exports = {
  generate: generate
};

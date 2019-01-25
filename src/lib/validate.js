var isValidPath = require('is-valid-path');
var err = require('./throwError.js');

module.exports = function(rules) {
  if (!Array.isArray(rules)) {
    err('rules must be an array');
  }

  rules.forEach(function(rule) {
    if (!isValidPath(rule.module)) {
      err('Invalid path for targetModule ' + rule.module);
    }

    if (
      !!rule.proxy &&
      !(
        typeof rule.proxy === 'string' &&
        rule.proxy.includes('${target}') &&
        !rule.proxy.includes('/${target}')
      )
    ) {
      err('Invalid rule for targetModule ' + rule.module + ', proxy must be string and contains ${resolveModule}, will use targetModule by default');
    }

    if (
      !!rule.targetCase &&
      !(
        rule.targetCase === 'camel' ||
        rule.targetCase === 'react' ||
        rule.targetCase === 'snake' ||
        rule.targetCase === 'kebab'
      )
    ) {
      err('Invalid rule for targetModule ' + rule.module + ', targetCase should be either "camel", "snake", "kebab" or null, will use "camel" by default');
    }
  });

  return true;
};

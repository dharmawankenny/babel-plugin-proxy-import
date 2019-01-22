var isValidPath = require('is-valid-path');
var err = require('./throwError.js');

module.exports = function(sourceModule, options) {
  if (sourceModule[sourceModule.length - 1] === '/') {
    err('Invalid source for ' + sourceModule + ', unnecessary closing "/"');
  }

  if (!Array.isArray(options)) {
    err('Options must be an array');
  }

  options.forEach(function(option) {
    if (!isValidPath(option.module)) {
      err('Invalid path for targetModule ' + option.module);
    }

    if (
      !!option.proxy &&
      !(
        typeof option.proxy === 'string' &&
        option.proxy.includes('${target}') &&
        !option.proxy.includes('/${target}')
      )
    ) {
      err('Invalid option for targetModule ' + option.module + ', proxy must be string and contains ${resolveModule}, will use targetModule by default');
    }

    if (
      !!option.targetCase &&
      !(
        option.targetCase === 'camel' ||
        option.targetCase === 'snake' ||
        option.targetCase === 'kebab'
      )
    ) {
      err('Invalid option for targetModule ' + option.module + ', targetCase should be either "camel", "snake", "kebab" or null, will use "camel" by default');
    }
  });

  return true;
};

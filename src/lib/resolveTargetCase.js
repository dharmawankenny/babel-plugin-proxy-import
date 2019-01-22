var toCamel = require('lodash.camelcase');
var toSnake = require('lodash.snakecase');
var toKebab = require('lodash.kebabcase');

module.exports = function(targetCase) {
  return function(name) {
    var result = name;

    switch (targetCase) {
      case 'camel':
        result = toCamel(name);
        break;
      case 'snake':
        result = toSnake(name);
        break;
      case 'kebab':
        result = toKebab(name);
        break;
      default:
        result = toCamel(name);
        break;
    }

    return result;
  };
};

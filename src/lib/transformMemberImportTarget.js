var resolveBaseTargetModule = require('./resolveBaseTargetModule.js');
var resolveTargetCase = require('./resolveTargetCase.js');

module.exports = function(sourceModule, option, importName) {
  var transformCase = resolveTargetCase(option.targetCase);
  var target = '/' + transformCase(importName);

  if (importName.includes('___')) {
    var importNames = importName.split('___');
    target = '/' + transformCase(importNames[0]) + '/' + transformCase(importNames[1]);
  } else if (option.noIndex) {
    target = '/' + transformCase(importName) + '/' + transformCase(importName);
  }

  return resolveBaseTargetModule(sourceModule, option, target)
}

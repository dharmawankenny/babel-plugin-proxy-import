var resolveBaseTargetModule = require('./resolveBaseTargetModule.js');
var resolveTargetCase = require('./resolveTargetCase.js');

module.exports = function(sourceModule, rule, importName) {
  var transformCase = resolveTargetCase(rule.targetCase);
  var target = '/' + transformCase(importName);

  if (importName.includes('___')) {
    var importNames = importName.split('___');
    target = '/' + transformCase(importNames[0]) + '/' + transformCase(importNames[1]);
  } else if (rule.noIndex) {
    target = '/' + transformCase(importName) + '/' + transformCase(importName);
  }

  return resolveBaseTargetModule(sourceModule, rule, target)
}

module.exports = function(sourceModule, rule, target) {
  if (!!rule.proxy) {
    return rule.proxy.replace(
      '${target}',
      sourceModule.replace(rule.module, target)
    );
  }

  return sourceModule + target;
};

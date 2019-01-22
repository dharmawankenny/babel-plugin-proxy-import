module.exports = function(sourceModule, option, target) {
  if (!!option.proxy) {
    return option.proxy.replace(
      '${target}',
      sourceModule.replace(option.module, target)
    );
  }

  return sourceModule + target;
};

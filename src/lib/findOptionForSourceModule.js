// Resolve option by checking if source module path exists in option or starts with one of the options
// @param sourceModule string
// @param options object
// @return option: object || null
module.exports = function(sourceModule, options, filename) {
  var option = options.find(function (opt) {
    return sourceModule.startsWith(opt.module);
  });

  return option !== undefined ? option : null;
};

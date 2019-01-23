// Resolve rule by checking if source module path exists in rule or starts with one of the rules
// @param sourceModule string
// @param rules object
// @return rule: object || null
module.exports = function(sourceModule, rules, filename) {
  var rule = rules.find(function (opt) {
    return sourceModule.startsWith(opt.module);
  });

  return rule !== undefined ? rule : null;
};

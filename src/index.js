var err = require('./lib/throwError.js');
var validate = require('./lib/validate.js');
var findRuleForSourceModule = require('./lib/findRuleForSourceModule.js');
var resolveBaseTargetModule = require('./lib/resolveBaseTargetModule.js');
var transformMemberImportTarget = require('./lib/transformMemberImportTarget.js');

module.exports = function(babel) {
  var t = babel.types;

  return {
    name: 'babel-plugin-proxy-import',
    // eslint-disable-next-line
    pre(state) {
      this.visited = {};
    },
    visitor: {
      ImportDeclaration(path, state) {
        var sourceModule = path.node.source.value;
        var rules = state.opts.rules;
        var filename = state.file.opts.filename;

        if (validate(rules)) {
          var rule = findRuleForSourceModule(sourceModule, rules, filename);

          if (!!rule) {
            var newPaths = [];
            var fullImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type !== 'ImportSpecifier'});
            var memberImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type === 'ImportSpecifier'});

            if (fullImportDeclarations.length > 0) {
              // check if a full import happens and is not the newly created path from before
              if (rule.blockFullImport && !this.visited[sourceModule]) {
                err('Importing entire module of ' + sourceModule + ' is not allowed due to blockFullImport rule for this module');
              }

              if (memberImportDeclarations.length > 0) {
                newPaths.push(t.importDeclaration(fullImportDeclarations, t.stringLiteral(resolveBaseTargetModule(sourceModule, rule, ''))))
              }
            }

            memberImportDeclarations.forEach(function(memberImportDeclaration) {
              newPaths.push(t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(memberImportDeclaration.local.name))],
                t.stringLiteral(transformMemberImportTarget(sourceModule, rule, memberImportDeclaration.imported.name))
              ));
              this.visited[transformMemberImportTarget(sourceModule, rule, memberImportDeclaration.imported.name)] = true;
            }, this);

            if (newPaths.length > 0) {
              path.replaceWithMultiple(newPaths);
            }
          }
        }
      }
    }
  };
};

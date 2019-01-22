var err = require('./lib/throwError.js');
var validate = require('./lib/validate.js');
var findOptionForSourceModule = require('./lib/findOptionForSourceModule.js');
var resolveBaseTargetModule = require('./lib/resolveBaseTargetModule.js');
var transformMemberImportTarget = require('./lib/transformMemberImportTarget.js');

module.exports = function(babel) {
  var t = babel.types;

  return {
    name: 'babel-plugin-proxy-import',
    visitor: {
      ImportDeclaration: function(path, state) {
        var sourceModule = path.node.source.value;
        var options = state.opts;
        var filename = state.file.opts.filename;

        if (validate(sourceModule, options)) {
          var option = findOptionForSourceModule(sourceModule, options, filename);

          if (!!option) {
            var newPaths = [];
            var fullImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type !== 'ImportSpecifier'});
            var memberImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type === 'ImportSpecifier'});

            if (fullImportDeclarations.length > 0) {
              if (option.blockFullImport) {
                err('Importing entire module of ' + sourceModule + ' is not allowed due to blockFullImport option for this module');
              }

              if (memberImportDeclarations.length > 0) {
                newPaths.push(t.importDeclaration(fullImportDeclarations, t.stringLiteral(resolveBaseTargetModule(sourceModule, option, ''))))
              }
            }

            memberImportDeclarations.forEach(function(memberImportDeclaration) {
              newPaths.push(t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(memberImportDeclaration.local.name))],
                t.stringLiteral(transformMemberImportTarget(sourceModule, option, memberImportDeclaration.imported.name))
              ))
            });

            if (newPaths.length > 0) {
              path.replaceWithMultiple(newPaths);
            }
          }
        }
      }
    }
  };
};

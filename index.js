var pathLib = require('path');
var isValidPath = require('is-valid-path');
var toCamel = require('lodash.camelcase');
var toSnake = require('lodash.snakecase');
var toKebab = require('lodash.kebabcase');

// options:
// [
//   ...,
//   {
//     module: string,
//     proxy: regexp,
//     blockFullImport: boolean,
//     targetCase: 'camel' || 'snake' || 'kebab',
//     noIndex: true,
//   },
//   ...
// ]

function err(message) {
  throw new Error('babel-plugin-proxy-imports: ' + message);
}

function validate(sourceModule, options) {
  if (sourceModule[sourceModule.length - 1] === '/') {
    err('Invalid source for ' + sourceModule + ', unnecessary closing "/"');
    return false;
  }

  if (!Array.isArray(options)) {
    err('Options must be an array');
    return false;
  }

  var isOptionsValid = true;

  // Validate module paths
  options.forEach(function(option) {
    if (!isValidPath(option.module)) {
      err('Invalid path for targetModule ' + option.module);
      isOptionValid = false;
    }

    if (
      !!option.proxy &&
      !(
        typeof option.proxy === 'string' &&
        option.proxy.includes('${resolveModule}')
      )
    ) {
      err('Invalid option for targetModule ' + option.module + ', proxy must be string and contains ${resolveModule}, will use targetModule by default');
      isOptionValid = false;
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
      isOptionsValid = false;
    }
  });

  return isOptionsValid;
}

// Resolve option by checking if source module path exists in option or starts with one of the options
// @param sourceModule string
// @param options object
// @return option: object || null
function findOptionForSourceModule(sourceModule, options, filename) {
  var toFind = sourceModule;

  if (sourceModule.match(/^\.{0,2}\//)) {
    toFind = pathLib.resolve(pathLib.join(sourceModule[0] === '/' ? '' : filename, sourceModule));
  };

  var option = options.find(function (opt) {
    return toFind.startsWith(opt.module);
  });

  return option !== undefined ? option : null;
}

function resolveBaseTargetModule(sourceModule, option) {
  if (!!option.proxy) {
    return option.proxy.replace(
      '${resolveModule}',
      sourceModule.replace(option.module[option.module.length - 1] === '/' ? option.module : option.module + '/', '')
    );
  }

  return sourceModule;
}

function resolveTargetCase(targetCase) {
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
  }
}

function transformMemberImportTarget(sourceModule, option, importName) {
  var base = resolveBaseTargetModule(sourceModule, option);
  var transformCase = resolveTargetCase(option.targetCase);

  // escape hatch for subfile (e.g. module/moduleUtil)
  if (importName.includes('___')) {
    var importNames = importName.split('___');
    return base + '/' + transformCase(importNames[0]) + '/' + transformCase(importNames[1]);
  }

  if (option.noIndex) {
    return base + '/' + transformCase(importName, option.targetCase) + '/' + transformCase(importName);
  }

  return base + '/' + transformCase(importName);
}

module.exports = function(babel) {
  var t = babel.types;

  return {
    visitor: {
      ImportDeclaration: function(path, state) {
        var sourceModule = path.node.source.value;
        var options = state.opts;
        var filename = state.file.opts.filename;

        if (validate(sourceModule, options)) {
          var option = findOptionForSourceModule(sourceModule, options, filename);

          if (!!option) {
            var newPaths = [];
            // get all ImportDefaultSpecifier and ImportNamespaceSpecifier
            var fullImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type !== 'ImportSpecifier'});
            // get target member imports (ImportSpecifier)
            var memberImportDeclarations = path.node.specifiers.filter(function(specifier) { return specifier.type === 'ImportSpecifier'});

            if (fullImportDeclarations.length > 0) {
              if (option.blockFullImport) {
                err('Importing entire module of ' + sourceModule + ' is not allowed due to blockFullImport option for this module');
              }

              if (memberImportDeclarations.length > 0) {
                newPaths.push(t.importDeclaration(fullImportDeclarations, t.stringLiteral(resolveBaseTargetModule(sourceModule, option))))
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

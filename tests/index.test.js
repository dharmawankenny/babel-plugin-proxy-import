var pluginTester = require('babel-plugin-tester');
var plugin = require('../src/index.js');

pluginTester({
  plugin,
  pluginName: 'babel-plugin-proxy-import',
  pluginOptions: {
    rules: [
      {
        module: '@module',
        noIndex: true,
      },
    ],
  },
  tests: {
    // test behavior with unrelated code
    'should leave other module import as is': 'import { some } from "another";',
    'should leave full import as is': 'import some from "@module";',
    'should leave full alias import as is': 'import * as some from "@module";',

    // test bad rules
    'should check imported path does not have a closing /': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
          },
        ],
      },
      code: 'import full from "@module/";',
      error: true,
    },
    'should check if rules is an array': {
      pluginOptions: {
        rules: {
          module: '>this.is.not.a.valid path',
        },
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should check if module key exist in rule': {
      pluginOptions: {
        rules: [
          {
            bad: 'rule',
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should check if module path is not valid': {
      pluginOptions: {
        rules: [
          {
            module: '>this.is.not.a.valid path',
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should check if proxy contains ${target} string': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            proxy: '@module/not-a-valid-proxy',
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should check if proxy ${target} string doesnt have / before it': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            proxy: '@module/${target}',
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should check if targetCase is valid when provided': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            targetCase: 'not-a-valid-case',
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },

    // test transformation cases
    'should correctly transform member style import to default import targeting a directory with index.js': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
          },
        ],
      },
      code: 'import { foo } from "@module";',
      output: 'import foo from "@module/foo";',
    },
    'should correctly transform member style import to default import': {
      code: 'import { foo } from "@module";',
      output: 'import foo from "@module/foo/foo";',
    },
    'should correctly preserve member style alias when transforming to default import': {
      code: 'import { foo as bar } from "@module";',
      output: 'import bar from "@module/foo/foo";',
    },
    'should correctly transform multiple member style import to multiple default import': {
      code: `
        import {
          foo,
          lorem,
        } from "@module";
      `,
      output: `
        import foo from "@module/foo/foo";
        import lorem from "@module/lorem/lorem";
      `,
    },
    'should correctly preserve all member style alias when transforming to multiple default import': {
      code: `
        import {
          foo as bar,
          lorem as ipsum,
        } from "@module";
      `,
      output: `
        import bar from "@module/foo/foo";
        import ipsum from "@module/lorem/lorem";
      `,
    },
    'should correctly transform escape hatch ___ to target specific file of a submodule': {
      code: `
        import {
          foo___bar as bar,
          lorem__ipsum as ipsum,
        } from "@module";
      `,
      output: `
        import bar from "@module/foo/bar";
        import ipsum from "@module/loremIpsum/loremIpsum";
      `,
    },
    'should correctly block full import when configured to do so': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            blockFullImport: true,
          },
        ],
      },
      code: 'import full from "@module";',
      error: true,
    },
    'should correctly skip generated full import code when configured to block full import': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            blockFullImport: true,
          },
        ],
      },
      code: 'import { fully, something } from "@module";',
      output: `
        import fully from "@module/fully";
        import something from "@module/something";
      `,
    },
    'should correctly transform multiple member style import and full import to multiple default import when allowed': {
      code: `
        import module, {
          foo,
          lorem,
        } from "@module";
      `,
      output: `
        import module from "@module";
        import foo from "@module/foo/foo";
        import lorem from "@module/lorem/lorem";
      `,
    },
    'should correctly transform subdirectory targetting': {
      code: `
        import module, {
          foo,
          lorem,
        } from "@module/some/subdirectory";
      `,
      output: `
        import module from "@module/some/subdirectory";
        import foo from "@module/some/subdirectory/foo/foo";
        import lorem from "@module/some/subdirectory/lorem/lorem";
      `,
    },
    'should correctly transform target module to proxy module as configured': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            proxy: '@module${target}.container',
            noIndex: true,
          },
        ],
      },
      code: `
        import module, {
          foo,
          lorem,
        } from "@module";
      `,
      output: `
        import module from "@module.container";
        import foo from "@module/foo/foo.container";
        import lorem from "@module/lorem/lorem.container";
      `,
    },
    'should correctly transform target module case to camel case by default': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            noIndex: true,
          },
        ],
      },
      code: `
        import {
          foo_bar,
          lorem_ipsum,
        } from "@module";
      `,
      output: `
        import foo_bar from "@module/fooBar/fooBar";
        import lorem_ipsum from "@module/loremIpsum/loremIpsum";
      `,
    },
    'should correctly transform target module case to camel case as configured': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            noIndex: true,
            targetCase: 'camel',
          },
        ],
      },
      code: `
        import {
          foo_bar,
          lorem_ipsum,
        } from "@module";
      `,
      output: `
        import foo_bar from "@module/fooBar/fooBar";
        import lorem_ipsum from "@module/loremIpsum/loremIpsum";
      `,
    },
    'should correctly transform target module case to React component case convention as configured': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            noIndex: true,
            targetCase: 'react',
          },
        ],
      },
      code: `
        import {
          fubar,
          SomeComp,
          foo_bar as FooBar,
          lorem_ipsum,
        } from "@module";
      `,
      output: `
        import fubar from "@module/Fubar/Fubar";
        import SomeComp from "@module/SomeComp/SomeComp";
        import FooBar from "@module/FooBar/FooBar";
        import lorem_ipsum from "@module/LoremIpsum/LoremIpsum";
      `,
    },
    'should correctly transform target module case to snake case as configured': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            noIndex: true,
            targetCase: 'snake',
          },
        ],
      },
      code: `
        import {
          fooBar,
          loremIpsum,
        } from "@module";
      `,
      output: `
        import fooBar from "@module/foo_bar/foo_bar";
        import loremIpsum from "@module/lorem_ipsum/lorem_ipsum";
      `,
    },
    'should correctly transform target module case to kebab case as configured': {
      pluginOptions: {
        rules: [
          {
            module: '@module',
            noIndex: true,
            targetCase: 'kebab',
          },
        ],
      },
      code: `
        import {
          foo_bar,
          lorem_ipsum,
        } from "@module";
      `,
      output: `
        import foo_bar from "@module/foo-bar/foo-bar";
        import lorem_ipsum from "@module/lorem-ipsum/lorem-ipsum";
      `,
    },
  },
});

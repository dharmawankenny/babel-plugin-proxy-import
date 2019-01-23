# babel-plugin-proxy-import

![](https://img.shields.io/circleci/project/github/dharmawankenny/babel-plugin-proxy-import/master.svg?logo=circleci&logoColor=ffffff) ![](https://img.shields.io/codecov/c/gh/dharmawankenny/babel-plugin-proxy-import.svg?logo=codecov&logoColor=ffffff) ![](https://img.shields.io/david/dharmawankenny/babel-plugin-proxy-import.svg?logo=node.js&logoColor=ffffff) ![](https://img.shields.io/github/license/dharmawankenny/babel-plugin-proxy-import.svg) ![](https://img.shields.io/github/issues-raw/dharmawankenny/babel-plugin-proxy-import.svg?logo=github&logoColor=ffffff)


Transform any member style `import { foo as bar } from 'module'` to default direct style `import bar from '{any}/foo'` with ease to enable tree shaking with any module.

## Motivation

Tree shaking is awesome, but most library does not directly support it yet and this plugin is made to enable tree shaking on any library that we need.

But its not just performance, this library is made to improve the developer experience of big projects that has many modules that may be confusing to read due to the big overhead in learning the project structure and the bad discoverability of the right module for the job. This module is aimed to give a simple singular member-style import statement (import { a } from 'b') that will be proxied/transformed to multiple default style direct import (import a from 'b/a') to bridge the ease of development and performance issue when importing a single module.

## Setup

```
  npm install --save-dev babel-plugin-proxy-import
 ```

Simply install this package as a devDependency to your babel app and use it as a plugin on your babel configuration.


## Configuration

Pass down an option when using this plugin on your babel configuration as such:

```js
  {
    plugins: [
      ...
      [
        'babel-plugin-proxy-import',
        {
          rules: [
            {
              ...proxyConfiguration
            },
          ],
        }
      ],
      ...
    ],
  }
```

this plugin only accepts an array of proxy configuration objects as an options and will throw an error when given a bad option. (refer to src/lib/validate.js for clarity)

## Proxy Configuration

To configure a proxy for your module, simply add an object with the shape:

```js
  {
    // your target module name to be replaced, this is required
    module: 'my-module',
    // template of your target module import location, must contain ${target} that will be replaced with the import target,
    // must not have / before ${target}
    // this example proxy will transform import a from 'my-module' to import a from '@myModule.container' and
    // import { a } from 'my-module' to import a from '@myModule/a.container', refer to src/lib/resolveBaseTargetModule.js for clarity
    proxy: '@myModule${target}.container',
    // this option will determine wether target module location should be transformed to one of the three case structure
    // e.g. import { a_module } from '@myLib' to import a_module from '@myLib/aModule', will default to camel case
    targetCase: 'camel' || 'snake' || 'kebab',
    // this config will determine wether outright full import of your module is not allowed or not
    // i.e. import a from 'your-module' or import * as a from 'your-module'
    blockFullImport: true,
    // this config will enable specific file targeting instead of the root folder targeting when importing a module
    // i.e. import { a } from 'your-module' to import a from 'your-module/a/a' instead of 'your-module/a'
    // this is useful when your project doesnt use index.js as the root of your module
    noIndex: true,
  }
```

## Escape Hatch for noIndex option

Wait, what if i want to import another file inside of a folder of my module, i.e. i want to target module B inside folder A that also contains module A? Well, for this specific utility you can use an escape hatch `FOLDER___MODULE` in your import, preferably you would alias that as such:

`import { MyFolder_MyModule as myModule } from '@myLib'`

that import line will be transformed to:

`import myModule from '@myLib/MyFolder/MyModule`

of course when a target case configuration is given, it will respect that, the example above is just using the default camel case configuration.


## Credit

This plugin is heavily inspired by the [babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports).

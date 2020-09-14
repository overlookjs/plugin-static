[![NPM version](https://img.shields.io/npm/v/@overlook/plugin-static.svg)](https://www.npmjs.com/package/@overlook/plugin-static)
[![Build Status](https://img.shields.io/travis/overlookjs/plugin-static/master.svg)](http://travis-ci.org/overlookjs/plugin-static)
[![Dependency Status](https://img.shields.io/david/overlookjs/plugin-static.svg)](https://david-dm.org/overlookjs/plugin-static)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookjs/plugin-static.svg)](https://david-dm.org/overlookjs/plugin-static)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookjs/plugin-static.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookjs/plugin-static/master.svg)](https://coveralls.io/r/overlookjs/plugin-static)

# Overlook framework static file plugin

Part of the [Overlook framework](https://overlookjs.github.io/).

## Usage

Serve a static file for a route.

### Standard usage

Use this plugin on a route and set file to be served with `[STATIC_FILE]` or `[GET_STATIC_FILE]()` method.`

The file should be provided as an instance of [@overlook/plugin-fs](https://www.npmjs.com/package/@overlook/plugin-fs)'s `File` class (re-exported as `File` property on this plugin).

```js
const Route = require('@overlook/route');
const staticPlugin = require('@overlook/plugin-static');
const { STATIC_FILE, File } = staticPlugin;
const StaticRoute = Route.extend( staticPlugin );

const route = new StaticRoute( {
  [STATIC_FILE]: new File( `${__dirname}/file.html` )
} );
```

or:

```js
const { GET_STATIC_FILE, File } = staticPlugin;

class CustomRoute extends StaticRoute {
  [GET_STATIC_FILE]() {
    return new File( `${__dirname}/file.html` );
  }
}

const route = new CustomRoute();
```

The plugin extends the `.handle()` method to serve the specified file to requests for that route.

`Content-Type` header will automatically be set with MIME type according to file extension.

### Usage with match routes

This plugin works with routes which use [@overlook/plugin-match](https://www.npmjs.com/package/@overlook/plugin-match) (and plugins which extend it like [@overlook/plugin-path](https://www.npmjs.com/package/@overlook/plugin-path)).

If a Route has already been extended with [@overlook/plugin-match](https://www.npmjs.com/package/@overlook/plugin-match), this plugin will extend the `[HANDLE_ROUTE]()` method, rather than `.handle()`, to serve the specified file just for this specific route.

NB [@overlook/plugin-match](https://www.npmjs.com/package/@overlook/plugin-match) must be applied *before* this plugin.

### Headers

Custom HTTP headers can be defined as an object `[STATIC_FILE_HEADERS]` or by defining a method `[GET_STATIC_FILE_HEADERS]()`.

```js
const { STATIC_FILE, STATIC_FILE_HEADERS, File } = staticPlugin;

const route = new StaticRoute( {
  [STATIC_FILE]: new File( `${__dirname}/file.html` ),
  [STATIC_FILE_HEADERS]: {
    'X-Foo': 'foobar'
  }
} );
```

```js
const { GET_STATIC_FILE, GET_STATIC_FILE_HEADERS, File } = staticPlugin;

class CustomRoute extends StaticRoute {
  [GET_STATIC_FILE]() {
    return new File( `${__dirname}/file.html` );
  }
  [GET_STATIC_FILE_HEADERS]() {
    return {
      'X-Foo': 'foobar'
    };
  }
}

const route = new CustomRoute();
```

## Versioning

This module follows [semver](https://semver.org/). Breaking changes will only be made in major version updates.

All active NodeJS release lines are supported (v10+ at time of writing). After a release line of NodeJS reaches end of life according to [Node's LTS schedule](https://nodejs.org/en/about/releases/), support for that version of Node may be dropped at any time, and this will not be considered a breaking change. Dropping support for a Node version will be made in a minor version update (e.g. 1.2.0 to 1.3.0). If you are using a Node version which is approaching end of life, pin your dependency of this module to patch updates only using tilde (`~`) e.g. `~1.2.3` to avoid breakages.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookjs/plugin-static/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookjs/plugin-static/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add tests for new features
* document new functionality/API additions in README
* do not add an entry to Changelog (Changelog is created when cutting releases)

# SkyayJS

> WebRTC real-time video conversation library

[![browser support](https://ci.testling.com/TemasysCommunications/SkywayJS.png)
](https://ci.testling.com/TemasysCommunications/SkywayJS)

## Setup

- Install `grunt-cli` (See: http://gruntjs.com/getting-started)
- Run `npm install` to install dev dependencies.
- Run `npm install -g testling` (might require sudo) to install browserify and testling for local testing
- Run `node start` to start a local webserver to be able access the demo and doc folders (WebRTC won't work from your local file-system)

## Development

- Run `npm test` to execute jshint and run the tests in your local Chrome (Mac). You can configure this in the `test.sh` file.
- Run `grunt jshint` to run jshint on its own.
- Run `grunt publish` to create production version in `publish` folder and generate the documentation in `doc` folder

## Folders

### demo

Some demos to help with the development

### doc

YUI Documentation for the Skyway object and its events

### publish

The production version of the library and a minified copy of it

### source

The skyway.js library development files

### tests

Tape tests

# SkywayJS

> SkywayJS is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

You'll need a Temasys Developer Account and an API key to use this. [Register here to get your API key](https://developers.temasys.com.sg).

We've gone to great length to make this library work in as many browsers as possible. SkywayJS is build on top of [AdapterJS](https://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins) even in Internet Explorer and Safari on Mac and PC.

- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkywayJS/)
- [SkywayJS API Docs](http://cdn.temasys.com.sg/skyway/skywayjs/0.3.x/doc/classes/Skyway.html)
- [Introducing SkywayJS](http://temasys.atlassian.net/wiki/display/TPD/Introducing+SkywayJS)
- [Developer Console](https://developer.temasys.com.sg) - Get your API key


#### Need help or want something changed?

Please read how you can find help, contribute and support us advancing SkywayJS on [our Github Page](http://temasys.github.io/support).


## How to setup this project

- Install or update to the latest version of node and npm
- Install `grunt-cli` (See: http://gruntjs.com/getting-started)
- Run `npm install` to install dev dependencies.
- Run `npm install -g browserify` and `npm install -g testling` (might require sudo) to install the necessary tools to test locally
- Run `npm start` to start a local webserver to be able access the demo and doc folders (WebRTC won't work from your local file-system). This will popup Chrome (Mac). You can configure a different browsers in the `start.sh` file.

## Development

- Run `npm test` to execute jshint and run the tests in your local Chrome (Mac). You can configure this in the `test.sh` file.
- Run `grunt jshint` to run jshint on its own.
- Run `grunt publish` to create production version in `publish` folder and generate the documentation in `doc` folder


## What's included?

#### demo

Some demos to help with the development

#### doc

YUI documentation for the Skyway object and its events

#### doc-style

Template for our YUI documentation

#### publish

The production version of the library and a minified copy of it

#### source

The skyway.js library development files

#### tests

Tape/Testling tests, currently work-in-progress


## License

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)



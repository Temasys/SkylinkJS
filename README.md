# ![SkylinkJS](http://temasys.github.io/resources/img/skylinkjs.svg)

> SkylinkJS is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

We've gone to great length to make this library work in as many browsers as possible. SkylinkJS is build on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins) even in Internet Explorer and Safari on Mac and PC.

You'll need a Temasys Developer Account and an API key to use this. [Register here to get your API key](https://developer.temasys.com.sg).

- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [API Docs](http://cdn.temasys.com.sg/skylink/skylinkjs/latest/doc/classes/Skylink.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Developer Console  - Get your API key](https://developer.temasys.com.sg)

#### Need help or want something changed?
Please read how you can find help, contribute and support us advancing SkylinkJS on [our Github Page](http://temasys.github.io/support).

## How to setup this project
1. Clone or download this repository via [Git](http://git-scm.com/download) terminal:
```
git clone https://github.com/Temasys/SkylinkJS.git
```
2. Install all required SkylinkJS dependencies:
```
npm install
```
3. Install Grunt to run tasks:
```
npm install grunt -g
npm install grunt-cli -g
```
4. Install Browserify and Testling to run test scripts :
```
npm install browserify -g
npm install testling -f
```
5. Run the start script to start a local webserver to be able access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browsers in the `start.sh` file.
```
npm start
# or
sh start.sh
```

## Development

For developers making edits on the source code, here are the commands to make sure it is Skylink friendly:

- `grunt jshint` : To check for code formatting and syntax errors.
- `grunt yuidoc` : To generate document from code.
- `grunt dev` : To run and compile all the codes.
- `grunt publish` : To run when code is ready for next release.


#### Commit message format

Here's the format to push commits into Skylink:

`[Ticket][Type: DOC|DEMO|STY|ENH|REF|DEP|BUG][WIP|<null>]: Commit name`

- `DOC` : This commit is related to documentation changes.
- `DEMO` : This commit is related to demo changes.
- `STY` : This commit is related to interface styling changes.
- `ENH` : This commit is related to an enhancement of a feature or new feature. Some improvements.
- `REF` : This commit is to upgrade the dependencies reference or changes to the references in Skylink.
- `DEP` : This commit is to upgrade the dependencies. _e.g. socket.io-client 1.2.1 upgrade_
- `BUG` : This commit is to fix a bug.
- `WIP` : This commit related to the ticket state is still in progress. Incomplete

__Examples:__<br>
- Commit that's a new feature but still in progress<br>
  `[#12][ENH][WIP]: New feature in progress.`<br>
- Commit that's a bug fix that has been completed<br>
  `[#15][BUG]: Fix for new bug found.`

## What's included?

#### demo

Some demos to help with the development.

Create your own `config.js` file with your own API keys to use demo.

#### doc

YUI documentation for the SkylinkJS object and its events

#### doc-style

Template for our YUI documentation

#### publish

The production version of the library and a minified copy of it

#### source

The skylink.js library development files

#### tests

Run `sh test.sh <type> <param>` to test SkylinkJS, where `<type>` is either `bot` for running a bot required for test and `test` for running the test.

__Available tests__
- `event`: Tests the events triggering, subscription and unsubscription.
```
sh test.sh test event
```
- `socket` : Tests the socket connection reliability and fallback.
```
sh test.sh test socket
```
- `api` : Tests api server parsing and connection.
```
sh test.sh test api
```
- `peer` : Tests the peer connection signaling state and ice connection state.
```
#run first
sh test.sh bot peer
#then in another terminal
sh test.sh test peer
```
- `message` : Tests the messaging system like sendMessage or sendP2PMessage.
```
#run first
sh test.sh bot message
#then in another terminal
sh test.sh test message
```
- `transfer` : Tests the data transfer with blob data like sendBlobData.
```
#run first
sh test.sh bot transfer
#then in another terminal
sh test.sh test transfer
```
- `debug` : Tests the debug mode. Currently, it is able to test if the SkylinkLogs are enabled or not.
```
sh test.sh bot debug
```
- `async` : Tests the async callbacks.
```
#run first
sh test.sh bot async
#then in another terminal
sh test.sh test async
```

## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

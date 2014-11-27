# ![SkylinkJS](http://temasys.github.io/resources/img/skylinkjs.svg)

> SkylinkJS is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

You'll need a Temasys Developer Account and an API key to use this. [Register here to get your API key](https://developer.temasys.com.sg).

We've gone to great length to make this library work in as many browsers as possible. SkylinkJS is build on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins) even in Internet Explorer and Safari on Mac and PC.

- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [API Docs](http://cdn.temasys.com.sg/skylink/skylinkjs/latest/doc/classes/Skylink.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Developer Console](https://developer.temasys.com.sg) - Get your API key


#### Need help or want something changed?

Please read how you can find help, contribute and support us advancing SkylinkJS on [our Github Page](http://temasys.github.io/support).


## How to setup this project

- Install or update to the latest version of node and npm
- Install `grunt-cli` (See: http://gruntjs.com/getting-started)
- Run `npm install` to install dev dependencies.
- Run `npm install -g browserify` and `npm install -g testling` (might require sudo) to install the necessary tools to test locally
- Run `npm start` to start a local webserver to be able access the demo and doc folders (WebRTC won't work from your local file-system). This will popup Chrome (Mac). You can configure a different browsers in the `start.sh` file.

## Development

For developers making edits on the source code, here are the steps to make sure it is Skylink friendly:

1. Run `grunt jshint` to check for code formatting and syntax errors.
2. Run `test.sh test <testname>` to run the tests in your local Chrome to check for any broken functionalities.<br>
   You can configure this in the `test.sh` file.
3. Run `grunt publish` to create production version in `publish` folder and generate the documentation in `doc` folder.
4. Note that commits should usually push the edited source and published files from the documentation unless it's documentation changes.<br>
   To achieve this, run `git checkout doc`, and commit your files. After that, do a `grunt yuidoc` to commit documentation changes.


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

<small>
__Examples:__<br>
" Commit that's a new feature but still in progress<br>
  `[#12][ENH][WIP]: New feature in progress.`<br>
" Commit that's a bug fix that has been completed<br>
  `[#15][BUG]: Fix for new bug found.`
</small>

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

Run `test.sh <type> <param>` to test SkylinkJS, where `<type>` is either `bot` for running a bot required for test and `test` for running the test.

- Running on Windows `test.sh <type> <param>`.<br>
  : <small>_Requires [Git](http://git-scm.com/download/win) to be installed in PC._</small>
- Running on a Mac `sh test.sh <type> <param>`.

__Available tests__
- `event` : Tests the events triggering, subscription and unsubscription.<br>
   " <small>_Command `test.sh test event`_</small>
- `socket` : Tests the socket connection reliability and fallback.<br>
   " <small>_Command `test.sh test socket`_</small>
- `api` : Tests api server parsing and connection.<br>
   " <small>_Command `test.sh test api`_</small>
- `peer` : Tests the peer connection signaling state and ice connection state.<br>
   " <small>_Command (run first) `test.sh bot peer`_</small><br>
   " <small>_Command (then in another terminal) `test.sh test peer`_</small>
- `message` : Tests the messaging system like sendMessage or sendP2PMessage.<br>
   " <small>_Command (run first) `test.sh bot message`_</small><br>
   " <small>_Command (then in another terminal) `test.sh test message`_</small>
- `transfer` : Tests the data transfer with blob data like sendBlobData.<br>
   " <small>_Command (run first) `test.sh bot transfer`_</small><br>
   " <small>_Command (then in another terminal) `test.sh test transfer`_</small>



## License

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

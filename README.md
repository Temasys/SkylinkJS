# ![SkylinkJS](http://temasys.github.io/resources/img/skylinkjs.svg)

> SkylinkJS is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

We've gone to great length to make this library work in as many browsers as possible. SkylinkJS is build on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](http://skylink.io/plugin/) even in Internet Explorer and Safari on Mac and PC.


```
npm install skylinkjs
bower install skylinkjs
```

You'll need a Temasys Developer Account and an App key to use this. [Register here to get your App key](https://developer.temasys.com.sg).

- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [API Docs](http://cdn.temasys.com.sg/skylink/skylinkjs/latest/doc/classes/Skylink.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Developer Console  - Get your App key](https://developer.temasys.com.sg)




##### Need help or want something changed?
Please read how you can find help, contribute and support us advancing SkylinkJS on [our Github Page](https://developer.temasys.com.sg/support).

##### Current versions and stability
Always use the latest versions of the SkylinkJS library as WebRTC is still evolving and we adapt to changes very frequently.

[Latest version: 0.5.9](https://github.com/Temasys/SkylinkJS/releases/tag/0.5.9).

##### Issues faced in 0.5.7 and above:
It's recommended to use the `init()` callback instead of using `readyStateChange` event state to go completed as this may result in an infinite loop.

Ready state change triggers whenever the current room information is retrieved,  and joining another room instead of the default room will result in a re-retrieval to the API server, causing readyStateChange to trigger again and making SkylinkJS to re-join the room over and over again.
```
// Use this
sw.init(data, function () {
  sw.joinRoom('name');
});

// Instead of
sw.on('readyStateChange', function (state) {
  if (state === sw.READY_STATE_CHANGE.COMPLETED) {
     sw.joinRoom('name');
  }
});
```

## How to build your own SkylinkJS
In your [Git](http://git-scm.com/download) terminal, execute the following commands:
```
# 1. Clone or download this repository via git terminal.

git clone https://github.com/Temasys/SkylinkJS.git

# 2. Install all required SkylinkJS dependencies. Use (sudo npm install) if required.

npm install

# 3. Install Grunt to run tasks.

npm install grunt -g
npm install grunt-cli -g

# 4. Install Browserify and Testling to run test scripts :

npm install browserify -g
npm install testling -f

# 5. Run the start script to start a local webserver to be able access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browsers in the start.sh file. Alternatively, you can run (sh start.sh)

npm start
```

After making edits, here are some commands to run and build Skylink:

- `grunt jshint` : To check for code formatting and syntax errors.
- `grunt yuidoc` : To generate document from code.
- `grunt dev` : To run and compile all the codes.
- `grunt publish` : To run when code is ready for next release.

__What's included in the repository?__

- `demo` : Contains the sample demos.

- `doc` : Contains the generated YUI documentation for the SkylinkJS.

- `doc-style` : Contains the template for our YUI documentation.

- `publish` : Contains the production version of the library and a minified copy of it

- `source` : Contains the skylink.js library development files

- `tests` : Contains the list of test scripts.


## Committing to the SkylinkJS branch

For developers who wants to contribute to the source code, you would require to fork your own repostiory and create a pull-request to a new branch.

Branch name format: `#< TICK_NO >-FEATURE_NAME`.

For example, if I'm fixing a bug for safari's video stream, I'll have a branch name called `#12-bugfix-safari-video`. If there is any tickets relating to the feature, do put a ticket for it.

Alternatively, you may just simply have your branch name `FEATURE_NAME` if this is for improvements to the code structure. But it is usually recommended to open a new ticket in github, linking the branch to the ticket number and pushing it.

All pull-requests requires a descripttion on what changes are made.




##### Commit message format

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

Commit message format examples:

- Commit that's a new feature but still in progress<br>
  `[#12][ENH][WIP]: New feature in progress.`<br>
- Commit that's a bug fix that has been completed<br>
  `[#15][BUG]: Fix for new bug found.`

## SkylinkJS code demos
In the `demo` folder, it contains the following code samples for developers to test and try on. You will require to create your own `config.js` file and setup with your own App Key CORS url tied to the `localhost` or your own local network IP address (whichever way you like it). Check the `config-example.js` file in the `demo` folder on how to configure the `config.js` file. Once you are done, save it in the `demo` folder.

Here's the list of sample demos available:

- `app`: The demo that tests all of SkylinkJS functionalities.
- `simple-app`: The demo that tests a simple peer-to-peer video call functionalities.
- `chat-room`: The demo that tests on the chat functionality.
- `file-transfer`: The demo that tests on the data transfers functionality.
- `mute-stream`: The demo that tests the muting of stream in a peer-to-peer video call functionality.
- `connection-status`: The demo that tests all the state changes and connectivity status like ICE connection, gathering states, peer connection states etc.
- `datachannel`: The demo that tests on datachannel connectivity.
- `voice-call`: The demo that simulates a voice call connection.


## Running tests

Run `sh test.sh <type> <param>` to test SkylinkJS, where `<type>` is either `bot` for running a bot required for test and `test` for running the test.

Our tests are built on [`tape` testing framework](https://ci.testling.com/guide/tape), and you may modify the `test.sh` file to run on different browsers.

Here's the list of available tests:

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

- `helper` : Tests helper functions.
```
sh test.sh test helper
```

- `peer` : Tests the peer connection signaling state and ice connection state.
```
# run first
sh test.sh bot peer
# then in another terminal
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

- `stream` : Tests the stream sending and parsing like getUserMedia, sendStream and joinRoom mediaConstraints.
```
#run first
sh test.sh bot stream
#then in another terminal
sh test.sh test stream
```

- `debug` : Tests the debug mode. Currently, it is able to test if the SkylinkLogs are enabled or not.
```
sh test.sh test debug
```

- `async` : Tests the async callbacks.
```
#run first
sh test.sh bot async
#then in another terminal
sh test.sh test async
```

- `sdp` : Tests the SDP modifications.
```
#run first
sh test.sh bot sdp
#then in another terminal
sh test.sh test sdp
```

## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

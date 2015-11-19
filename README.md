# ![SkylinkJS](http://temasys.github.io/resources/img/skylinkjs.svg)

> SkylinkJS is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

We've gone to great length to make this library work in as many browsers as possible. SkylinkJS is build on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](http://skylink.io/plugin/) even in Internet Explorer and Safari on Mac and PC.

To install SkylinkJS with [npm](https://www.npmjs.com/):
```
npm install skylinkjs
```
To install SkylinkJS with [bower](http://bower.io/):
```
bower install skylinkjs
```

You'll need a Temasys Developer Account and an App key to use this. [Register here to get your App key](https://developer.temasys.com.sg).


- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [API Docs](http://cdn.temasys.com.sg/skylink/skylinkjs/latest/doc/classes/Skylink.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Developer Console  - Get your App key](https://developer.temasys.com.sg)
- [View Code Examples](https://github.com/Temasys/SkylinkJS/tree/master/demo)
- [Run tests](https://github.com/Temasys/SkylinkJS/tree/master/tests)


##### Need help or want something changed?
You can raise tickets on [http://support.temasys.com.sg) our support portal or on [our Github Page](https://developer.temasys.com.sg/support).

##### Current versions and stability
Always use the latest versions of the SkylinkJS library as WebRTC is still evolving and we adapt to changes very frequently.

[Latest version: 0.6.1](https://github.com/Temasys/SkylinkJS/releases/tag/0.6.1).

##### Upgrading from 0.5.7 and below:
It's now recommended to use the `init()` callback instead of using `readyStateChange` event state to go completed as this may result in an infinite loop.

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

##### Issues faced with script encoding
If you are facing any encoding issues, it is recommended for you to add the `charset` property to the `<script>` element referencing our code. The encoding to use is `UTF-8`.
```
<script src="//cdn.temasys.com.sg/skylink/skylinkjs/latest/skylink.complete.min.js" charset="UTF-8"></script>
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
npm install testling -g

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


## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

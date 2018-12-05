> Temasys SkylinkJS Web SDK is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

We've gone to great length to make this library work in as many browsers as possible. Temasys SkylinkJS Web SDK is built on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](http://temasys.io/plugin/) even in Internet Explorer and Safari on Mac and PC.

You'll need a Temasys Account and an App key to use this. [Register here to get your App key](https://console.temasys.io).

#### Supported Browsers

> ##### Browsers in Beta (Edge/Bowser/Safari):
> _Note that for beta supported browsers, some of the audio / video functionalities may not work well. Some older versions of Edge may require you to enable experimental support for H.264 video codec to interop with Chrome and Firefox browsers._

| Features       | Chrome | Firefox | Opera | IE (plugin) | Safari (beta) | Safari (plugin) | Edge (beta) | Bowser (beta) | 
| -------------- | ---------- | ----------- | --------- | ---------- | ------ | ---------- | ---- | ----- |
| **Platforms:** | Win, Mac, Ubuntu, Android | Win, Mac, Ubuntu, Android | Win, Mac, Ubuntu, Android | Win | Mac | Mac | Win | iOS |
| **Minimum Recommended Versions:** | `52` | `48` | `38` | `9` | `11` | `7` | `15` | `0.6.1` |
| **Screensharing**  | Yes with [Chrome Extension**](https://chrome.google.com/webstore/detail/skylink-webrtc-tools/ljckddiekopnnjoeaiofddfhgnbdoafc)  |  Yes with [Firefox Extension**](https://addons.mozilla.org/en-US/firefox/addon/skylink-webrtc-tools/) |     -     | Yes with [Commercial Temasys Plugin*](https://temasys.io/plugin/#commercial-licensing)  | - | Yes with [Commercial Temasys Plugin*](https://temasys.io/plugin/#commercial-licensing) | No | No |
| **Video Call**     | Yes        | Yes         | Yes       | Yes with [Temasys Plugin](http://temasys.io/plugin/)  | Yes | Yes [Temasys Plugin](http://temasys.io/plugin/)  | Yes (with H264 flag enabled) | Yes |
| **Audio Call**     | Yes        | Yes         |  Yes       | Yes with [Temasys Plugin](http://temasys.io/plugin/) | Yes | Yes with [Temasys Plugin](http://temasys.io/plugin/)  | Yes | Yes |
| **File Transfers** | Yes        | Yes         | Yes       | Yes with [Temasys Plugin](http://temasys.io/plugin/)  | Yes | Yes with [Temasys Plugin](http://temasys.io/plugin/)  | No | No |
| **Chat Messaging** | Yes        | Yes         | Yes       | Yes with [Temasys Plugin](http://temasys.io/plugin/) for P2P | Yes | Yes with [Temasys Plugin](http://temasys.io/plugin/) for P2P  | Yes (Signaling only) | Yes (Signaling only) |

- (+) Latest browser versions indicates the last tested browser version. It should work with the updated next versions, but if it doesn't, open a bug ticket.
- (*) Custom Branded Temasys WebRTC Plugin incorporates additional features not available in the free plugin.
- (**) Our extensions works with Temasys demos and localhost demos. You will have to modify the extension to work on your hosted Web Applications. For Chrome extensions source code, [contact us](http://support.temasys.io). For Firefox extensions source code, [you may download from your Application Key in console.temasys.io](https://console.temasys.io).

##### Installation
Install Temasys SkylinkJS Web SDK with [npm](https://www.npmjs.com/):
```
npm install skylinkjs@0.6.x
```
Install Temasys SkylinkJS Web SDK with [bower](http://bower.io/):
```
bower install skylinkjs
```


#### Read more
- [Getting started](https://temasys.io/getting-started-with-webrtc-and-skylinkjs/)
- [API Docs](http://cdn.temasys.io/skylink/skylinkjs/latest/doc/classes/Skylink.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Temasys Console  - Get your App key](https://console.temasys.io)
- [View Code Examples](https://github.com/Temasys/SkylinkJS/tree/master/demo)
- [Run tests](https://github.com/Temasys/SkylinkJS/tree/master/tests)



##### Need help or want something changed?
You can raise tickets on [our support portal](http://support.temasys.io) or on [our Github Page](https://console.temasys.io/support).

##### Current versions and stability
We recommend that you always use the latest versions of the Temasys SkylinkJS Web SDK as WebRTC is still evolving and we adapt to changes very frequently.

[Latest version: `1.0.0`](https://github.com/Temasys/SkylinkJS/releases/tag/1.0.0).

##### Setting AdapterJS flags
If you require to set Temasys AdapterJS flags (e.g. forcing Temasys WebRTC plugin), we recommend the following method:

```
<script>
  // Example options.
  var AdapterJS = {
    options: {
      forceSafariPlugin: [Boolean],
      hidePluginInstallPrompt: [Boolean],
      getAllCams: [Boolean]
    }
  };
</script>
<! -- Now reference AdapterJS or SkylinkJS (complete version) -->
<script src="https://cdn.temasys.io/skylink/skylinkjs/0.6.x/skylink.complete.js"></script>
```

For more details, please read the documentation in [Temasys AdapterJS](https://github.com/Temasys/AdapterJS).

#### Noted Issues and Solutions
##### Installing `0.6.3` - `0.6.10` versions in NPM
Due to corrupt files issues for versions `0.6.3` - `0.6.10`, we have removed these versions from the NPM repository.
You may still install these versions using this command:
```
npm install git://github.com/Temasys/SkylinkJS#<version_tag>
```

##### Encoding issues from AdapterJS dependency
There is a [known issue](https://github.com/Temasys/AdapterJS/issues/240) caused by AdapterJS `0.14.0` which manifests as incorrectly encoded characters. To resolve this, it is recommended that charset is set the HTML file:

```
<meta charset="utf-8">
```

##### Upgrading from `0.5.7` and below:
It's now recommended to use the `init()` callback instead of using `readyStateChange` complete state as this may result in an infinite loop.

readyStateChange triggers each time the current room information is recieved, and joining a room other than default room will result in a re-fetch from the API server. This can result in a endless re-join loop. 
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

## How to build your own Temasys SkylinkJS Web SDK
Using [Git](http://git-scm.com/download) command line tools, execute the following:
```
# 1. Clone or download this repository via git terminal.

git clone https://github.com/Temasys/SkylinkJS.git

# 2. Install all required dependencies. Use (sudo npm install) if required.

npm install

# 3. Install Grunt to run tasks.

npm install grunt -g
npm install grunt-cli -g

# 4. Install Browserify and Testling to run test scripts :

> **Note** that currently the test scripts are outdated and may not work as we are evaluating to upgrade the test scripts in the future.

npm install browserify -g
npm install testling -g

# 5. Run the start script to start a local webserver to be able access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browsers in the start.sh file. Alternatively, you can run (sh start.sh)

npm start # note that this runs in Chrome currently..
```

After making edits, here are some commands to run and build the Temasys Web SDK:

- `grunt jshint` : Validate for formatting and syntax errors.
- `grunt yuidoc` : To generate the SDK documentation.
- `grunt dev` : Compile the SDK.
- `grunt publish` : Publish a release.

__What's included in the repository?__

- `demo` : Reference Code Examples.
- `doc` : Generated documentation for the Temasys Web SDK.
- `doc-style` : Templates used documentation.
- `publish` : Production version of the library as well as minified variants
- `source` : Temasys Web SDK source
- `tests` : Test suite.


## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

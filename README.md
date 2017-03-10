# Temasys Web SDK
Temasys Web SDK (formerly SkylinkJS) is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer. It is built on top of [AdapterJS](http://github.com/Temasys/AdapterJS) and works with our [Temasys WebRTC Plugin](http://skylink.io/plugin/) even in Internet Explorer and Safari on Mac and PC.

### Start using it!
To start using the Temasys Web SDK, you'll need a Temasys Account and an App key to use this. [Register here to get your App key](https://console.temasys.io).

And to start integrating the Temasys Web SDK, here's just a few lines of code to get you started for a simple video call:

```
<html>
<head></head>
<body>
<div id="peersVideo"></div>
<script src="https://cdn.temasys.io/skylink/skylinkjs/0.7.x/skylink.complete.js"></script>
<script>
var skylink = new Skylink();

skylink.on("incomingStream", function (peerId, stream, peerInfo, isSelf) {
  if (isSelf) {
    attachMediaStream(document.getElementById("selfVideo"), stream);
  } else {
    var peerVideo = document.createElement("video");
    peerVideo.id = peerId;
    peerVideo.autoplay = "autoplay";
    document.getElementById("peersVideo").appendChild(peerVideo);
    attachMediaStream(peerVideo, stream);
  }
});

skylink.on("peerLeft", function (peerId, peerInfo, isSelf) {
  if (!isSelf) {
    var peerVideo = document.getElementById(peerId);
    if (peerVideo) {
      document.getElementById("peersVideo").removeChild(peerVideo);
    } else {
      console.error("Peer video for " + peerId + " is not found.");
    }
  }
});

skylink.init("<% Your App Key %>", function (error, success) {
  if (success) {
    skylinkDemo.joinRoom("<% Room name %>", {
      audio: true,
      video: true
    });
  }
});
</body>
</html>
```

If you want to integrate even more features like chat, custom data or learn more about our features, you can check out the [documentation API here](cdn.temasys.com.sg/skylink/skylinkjs/0.7.x/doc/classes/Skylink.html).

You may also install the Temasys Web SDK (formerly SkylinkJS) with [npm](https://www.npmjs.com/):
```
npm install skylinkjs@0.6.x
```

Or with [bower](http://bower.io/):
```
bower install skylinkjs
```

To get started more about WebRTC and SkylinkJS, you can [follow this article here](https://temasys.io/getting-started-with-webrtc-and-skylinkjs/). If need help or want something changed, you can raise tickets on [our support portal](http://support.temasys.io). It is also recommended that you always use the latest versions of the Temasys Web SDK as WebRTC is still evolving and we adapt to changes very frequently.


## Browser WebRTC Supports
Regardless of WebRTC supports, signaling chat functionality is still available.

#### Chrome

- Recommended min version: `52`
- Platforms: Win / Mac / Ubuntu / Android
- Supports: Audio / Video / Datachannel (File & Data transfers)
- Screensharing extension: [Chrome Web Store](https://chrome.google.com/webstore/detail/skylink-webrtc-tools/ljckddiekopnnjoeaiofddfhgnbdoafc).

For custom Chrome screensharing extension, you may contact [our support team](mailto:support@temasys.io) to built one.

#### Firefox

- Recommended min version: `48`
- Platforms: Win / Mac / Ubuntu / Android
- Supports: Audio / Video / Datachannel (File & Data transfers)
- Screensharing extension: [Firefox Add-ons Directory](https://addons.mozilla.org/en-US/firefox/addon/skylink-webrtc-tools/).

For custom Firefox screensharing extension, you generate one in the [Developer Console](https://console.temasys.io).

#### Safari (Requires [Temasys WebRTC Plugin](https://temasys.io/plugin))

- Recommended min version: `7`
- Platforms: Mac
- Supports: Audio / Video / Datachannel (File & Data transfers)

For screensharing functionalities or custom built Temasys WebRTC Plugin, you may consider signing up for [Commercial Licensed Plugin](https://temasys.io/plugin/#commercial-licensing)

#### IE (Requires [Temasys WebRTC Plugin](https://temasys.io/plugin))

- Recommended min version: `9`
- Platforms: Win
- Supports: Audio / Video / Datachannel (File & Data transfers)(Binary transfers from IE ver `10` onwards)

For screensharing functionalities or custom built Temasys WebRTC Plugin, you may consider signing up for [Commercial Licensed Plugin](https://temasys.io/plugin/#commercial-licensing)

#### Edge (Beta)

- Recommended min version: `14.14352`
- Platforms: Win
- Supports: Audio / Video (With H264 experimental flag enabled)

Note that Edge will not work with MCU enabled App Keys.

#### Bowser (Beta)

- Recommended min version: `0.6.1` (only iOS `9.x` and below)
- Platforms: iOS
- Supports: Audio / Video

Note that Bowser will not work in iOS ver `10.x` and above.

#### Android (Beta)

- Recommended min version: Android OS ver `6.x`
- Platforms: Android
- Supports: Audio / Video


## Building the Temasys Web SDK Project
> Before contributing, please read the [CONTRIBUTING.md README first](CONTRIBUTING.md).

1. Clone the Temasys Web SDK Project: `git clone https://github.com/Temasys/SkylinkJS.git`
2. Install Grunt and its command line tools: `npm install grunt grunt-cli -g`
3. Start localhost server to play around with demos or do manual testing: `npm start`. Note that will install all required dependencies in `sudo` mode first before running the server.

Here are some common grunt tasks:

- `grunt dev`: Compiles the `source/` files to `publish/` for testing and development.
- `grunt publish`: Compiles the `source/` files for production ready code to `publish/` and `release/` for CDN ready release files.

These are the directories:

- `demo/`: The demos. Ensure that you configure with your own App Key based on the example on `config-example.js`.
- `doc/` : Compiled documentation from `source/` files and basing off the theme on `doc-style/`.
- `doc-style/` : The documentation theme for YUIDOC.
- `publish/` : The compiled `source/` files for testing or production ready SDK.
- `release/` : The compiled `source/` files for publishing into the CDN.
- `source/` : The source code.

## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

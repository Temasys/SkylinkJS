# SKYLINK WEB SDK 2.1.0
> Temasys SkylinkJS Web SDK is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing or file transfer.

You'll need a Temasys Account and an App key to use this. [Register here to get your App key](https://console.temasys.io).

#### Supported Browsers

> ##### Browsers in Beta (Edge):
> _Note that for beta supported browsers, some of the audio / video functionality may not work well. Some older versions of Edge may require you to enable experimental support for H.264 video codec to interop with Chrome and Firefox browsers._

| Features                      | Chrome                   | Firefox                  | Opera                    | Safari | Edge (beta)                  |
|-------------------------------|--------------------------|--------------------------|--------------------------|--------|------------------------------|
| Platforms:                    | Win, Mac, Linux, Android | Win, Mac, Linux, Android | Win, Mac, Linux, Android | Mac    | Win                          |
| Minimum Recommended Versions: | 52                       | 48                       | 38                       | 11     | 14.14352                     |
| Screensharing                 | Yes                      | Yes                      | -                        | -      | No                           |
| Video Call                    | Yes                      | Yes                      | Yes                      | Yes    | Yes (with H264 flag enabled) |
| Audio Call                    | Yes                      | Yes                      | Yes                      | Yes    | Yes                          |
| File Transfers                | Yes                      | Yes                      | Yes                      | Yes    | No                           |

- (+) Latest browser versions indicates the last tested browser version. It should work with the updated next versions, but if it doesn't, open a bug ticket.


#### Read more
- [Getting started](https://temasys.io/getting-started-with-webrtc-and-skylinkjs/)
- [API Docs](http://cdn.temasys.io/skylink/skylinkjs/latest/docs/index.html)
- [Versions](http://github.com/Temasys/SkylinkJS/releases)
- [Temasys Console  - Get your App key](https://console.temasys.io)
- [Demos](https://cdn.temasys.io/skylink/skylinkjs/latest/demos/collection/index.html)
- [View Code Examples](https://github.com/Temasys/SkylinkJS/tree/master/demos)


##### Need help or want something changed?
You can raise tickets on [our support portal](http://support.temasys.io) or on [our Github Page](https://console.temasys.io/support).

##### Current versions and stability
We recommend that you always use the latest versions of the Temasys SkylinkJS Web SDK as WebRTC is still evolving and we adapt to changes very frequently.

[Latest version: 2.1.0](https://github.com/Temasys/SkylinkJS/releases/tag/2.1.0).


## How to build your own Temasys SkylinkJS Web SDK
Using [Git](http://git-scm.com/download) command line tools, execute the following:
```
# 1. Clone or download this repository via git terminal.

git clone https://github.com/Temasys/SkylinkJS.git

# 2. Install all required dependencies. Use (sudo npm install) if required.

npm install

# 3. Run the start script to start a local webserver to access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browser in the start.sh file. Alternatively, you can run (sh start.sh)

npm start # Note that this runs in Chrome currently.
```

__What's included in the repository?__

- `demos` : Reference Code Examples.
- `docs` : Generated documentation for the Temasys Web SDK.
- `temasys-jsdoc-template` : Templates used documentation.
- `publish` : Production version of the library as well as minified variants
- `src` : Temasys Web SDK source


## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

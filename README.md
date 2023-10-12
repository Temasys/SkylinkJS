# SKYLINK WEB SDK 2.6.2
> Temasys SkylinkJS Web SDK is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between peers for audio/video conferencing.

You'll need a Temasys Account, and an App key to use this. [Register here to get your App key](https://console.temasys.io).

#### Supported Browsers
| Features                      | Chrome                   | Firefox                  | Safari                   | Edge (Chromium) | 
|-------------------------------|--------------------------|--------------------------|--------------------------|-----------------|
| Platforms:                    | Win, Mac, Linux, Android | Win, Mac, Linux, Android | Mac, iOS                 | Win, Mac        |
| Minimum Recommended Versions: | 72                       | 66                       | 13                       | 80              |
| Screensharing                 | Yes                      | Yes                      | Yes                      | Yes             |
| Video Call                    | Yes                      | Yes                      | Yes                      | Yes             |
| Audio Call                    | Yes                      | Yes                      | Yes                      | Yes             |
| Messaging                     | Yes                      | Yes                      | Yes                      | Yes             |

- (+) Latest browser versions indicates the last tested browser version. It should work with the updated next versions, but if it doesn't, open a bug ticket.

#### Read more
- [Getting started](https://github.com/Temasys/GettingStarted)
- [API Docs](https://cdn.temasys.io/skylink/skylinkjs/latest/docs/index.html)
- [Versions](https://github.com/Temasys/SkylinkJS/releases)
- [Temasys Console  - Get your App key](https://console.temasys.io)
- [View Code Examples](https://github.com/Temasys/SkylinkJS/tree/2.x.x/master/demos/collection/README.md)

#### MCU Behaviour
- There are certain considerations to note when using an MCU key. Read more [here](https://github.com/Temasys/SkylinkJS/tree/2.x.x/master/MCU_BEHAVIOUR.md)


#### Need help or want something changed?
- You can raise tickets at our [support portal](https://support.temasys.io/) or on our [Github Page](https://github.com/Temasys/SkylinkJS/issues).


#### Current versions and stability
- We recommend that you always use the latest versions of the Temasys SkylinkJS Web SDK as WebRTC is still evolving and we adapt to changes very frequently.
- It is advised to not attach any event handlers to the WebRTC APIs as doing so may override the handlers set in SkylinkJS and result in unexpected behaviour.

[Latest version: 2.6.2](https://github.com/Temasys/SkylinkJS/releases/tag/2.6.2)


## How to build your own Temasys SkylinkJS Web SDK
Using [Git](https://git-scm.com/download) command line tools, execute the following:

Node version: `14.17.5`

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
[APACHE 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)

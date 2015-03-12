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

More links:
- [Read here on how to build the project](build-own-skylink.md)
- [Read here on how you can contribute](contribute.md)
- [Read here on how you can test your skylink build](testing-skylink.md)


## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

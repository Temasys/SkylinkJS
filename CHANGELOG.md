# Migration

#### Description
* The following guide will help you move your current application code to our new Skylink 2.x SDK.

#### Migrating from 0.6.x / 0.9.x to 2.x
* While Skylink 2.x is a major version bump and indicates breaking changes, we kept changes you have to make to a minimum.

#### Motivations
* There have been many rapid and welcomed changes on the WebRTC front. In light of that, an update of our SDK was timely and necessary in order to take full advantage of these new changes.

#### New features
* Our new SDK is module based with full compatibility with ES6
* All callbacks have been promisified
* Multiple rooms support
_______________________

### Importing the SDK
#### SDK 0.6.x / 0.9.x

Method 1: Include in script tag of `index.html`
``` 
<script src="./path/to/skylink.complete.js"></script>
```

#### SDK 2.x

Method 1: Import as type `module` in script tag of `index.html`
```
 <script type="module">
    import Skylink, { SkylinkEventManager, SkylinkLogger, SkylinkConstants } from 'https://cdn.temasys.io/skylink/skylinkjs/latest/skylink.complete.js'; 
    window.Skylink = Skylink; // assign to the window object if Skylink needs to be accessed in other scripts
 </script>
 <script defer src="index.js"></script>
```
- access `Skylink` class in `index.js` or directly in the script tag
```
 const skylink = new Skylink(config);
```
Method 2: Import in `index.js`
- from cdn
```
 import Skylink, { SkylinkEventManager, SkylinkLogger, SkylinkConstants } from 'https://cdn.temasys.io/skylink/skylinkjs/latest/skylink.complete.js';
 const skylink = new Skylink(config);
```
- from NPM module
```
 import Skylink, { SkylinkEventManager, SkylinkLogger, SkylinkConstants } from 'skylinkjs';
 const skylink = new Skylink(config);
```
- reference `index.js` as type `module` in `index.html`
```
 <script src="index.js" type="module"></script>
```

### Including dependencies
#### SDK 0.6.x / 0.9.x

`socket.io` and `adapterjs` dependency is bundled into `skylink.complete.js`

#### SDK 2.x

`socket.io` dependency is no longer bundled into `skylink.complete.js`

Include `socket.io` in script tag.
```
 <script src="./path/to/socket.io.js"></script>
```

`socket.io.js` can be obtained from the [socket.io cdn](https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js). Check that the version is `2.2.0`

### Initialising Skylink
#### SDK 0.6.x / 0.9.x

Step 1: Instantiate Skylink
```
skylink = new Skylink();
```
Step 2: Init Skylink with config and call joinRoom in success callback function
```
const config = {
    appKey: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX',
    defaultRoom: 'skylinkRoom',
    enableDataChannel: true,
    forceSSL: true,
};

const joinRoomOptions = {
    audio: { stereo: true },
    video: true,
};

skylink.init(config, function (error, success) {
    if (success) {
        skylink.joinRoom(joinRoomOptions);
    }
});
```

Step 3: Listen on 'incomingStream' event with isSelf=true for self MediaStream
```
skylink.on('incomingStream', function(peerId, stream, isSelf, peerInfo) {
    // do something
});
```

Step 4: Listen on 'peerJoined' event with isSelf=true for self join room success outcome
```
skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
    // do something
});
```

#### SDK 2.x
 
Step 1: Instantiate Skylink and init with config 
```
const config = {
    appKey: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX',
    defaultRoom: 'skylinkRoom',
    enableDataChannel: true,
    forceSSL: true,
};

skylink = new Skylink(config);
```

Step 2: Call joinRoom with options and obtain MediaStreams from Promise resolve 
```
const joinRoomOptions = {
    audio: { stereo: true },
    video: true,
};

skylink.joinRoom(joinRoomOptions)
.then((streams) => {
    // if there is an audio stream
    if (streams[0]) {
        window.attachMediaStream(audioEl, streams[0]);
    }
    // if there is a video stream
    if (streams[1]) {
        window.attachMediaStream(videoEl, streams[1]);
    }
})
.catch();
```
 Step 3: Listen on 'peerJoined' event with `isSelf=true` for self join room success outcome
```
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
    const { isSelf, peerId, peerInfo } = evt.detail;
    // do something
});
``` 

### Event Handling
#### SDK 0.6.x / 0.9.x
 
Subscribing to an event
```
skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
    // do something
});
``` 
 Unsubscribing from an event
```
skylink.off('peerJoined');
```
#### SDK 2.x

Subscribing to an event
```
const peerJoinedHandler = (evt) => {
    const { isSelf, peerId, peerInfo } = evt.detail;
    // do something
};
 
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, peerJoinedHandler);
``` 
Unsubscribing from an event
```
SkylinkEventManager.removeEventListener(SkylinkConstants.EVENTS.PEER_JOINED, peerJoinedHandler);
```

### Logging
#### SDK 0.6.x / 0.9.x
```
skylink.setLogLevel(skylink.LOG_LEVEL.DEBUG);
``` 
#### SDK 2.x
```
SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG);
```

## Changed APIs
 |Key            |Description                                  |
 |---------------|---------------------------------------------|
 |UNCHANGED      |Params unchanged                             |
 |NEW            |New method                                   |
 |PARAM          |Params changed                               |
 |RENAME         |Method renamed                               |
 |PROMISIFIED    |Callback promisified                         |
 |NOT IMPLEMENTED|Method not implemented in the current release|
 |DEPRECATED     |Deprecated                                   |

|                            |0.6.x / **0.9.x**                                                                     |                  |      **2.x**      |                                       |
|----------------------------|----------------------------------------------------------------------------------|------------------|---------------|---------------------------------------|
|Methods                     |Params                                                                            |Status            |Renamed to     |Params                                 |
|~~init~~                        |( options ,   callback )                                                          | DEPRECATED       |               |                                       |
|joinRoom                   |( room ,   options ,   callback )                                                 | PROMISIFIED, PARAM|               |( options ,   prefetchedStream )       |
|leaveRoom                   |( stopMediaOptions=true ,   callback )                                            | PROMISIFIED, PARAM|               |( roomName )                           |
|lockRoom()                  |()                                                                                | PARAM            |               |( roomName )                           |
|unlockRoom                  |()                                                                                | PARAM            |               |( roomName )                           |
|leaveAllRooms               |                                                                                  | NEW              |               |()                                     |
|introducePeer               |( sendingPeerId ,   receivingPeerId )                                             | NOT IMPLEMENTED  |               |                                       |
|getConnectionStatus         |( targetPeerId , callback )                                                       | PROMISIFIED, PARAM|               |( roomName , peerId )                  |
|sendMessage                 |( message ,   targetPeerId )                                                      | PARAM            |               |( roomName , message ,   targetPeerId )|
|sendP2PMessage              |( message ,   targetPeerId )                                                      | PARAM            |               |( roomName , message ,   targetPeerId )|
|getMessageHistory           |()                                                                                | NOT IMPLEMENTED  |               |                                       |
|getPeerCustomSettings       |()                                                                                | PARAM            |               |( roomName )                           |
|getPeerInfo                 |( peerId )                                                                        | PARAM            |               |( roomName , peerId )                  |
|getPeers                    |( showAll=false ,   callback )                                                    | PROMISIFIED, PARAM|               |( roomName ,   showAll = false )       |
|getPeersInRoom              |()                                                                                | PARAM            |               |( roomName )                           |
|getPeersStream              |()                                                                                | PARAM, RENAME     |getPeersStreams|( roomName , includeSelf = true )      |
|getUserData                 |( peerId )                                                                        | PARAM            |               |( roomName, peerId )                   |
|getStreams                  |                                                                                  | NEW              |               |( roomName )                           |
|setUserData                 |( userData )                                                                      | PARAM            |               |( roomName, userData )                 |
|getUserMedia                |( options ,   callback )                                                          | PROMISIFIED, PARAM|               |( options ,   options )                |
|muteStream                  |( options )                                                                       | PARAM, RENAME     |muteStreams    |( roomName , options , streamId )      |
|sendStream                  |( options ,   callback )                                                          | PROMISIFIED, PARAM|               |( roomName , options )                 |
|shareScreen                 |( enableAudio=false ,   mediaSource=screen ,   callback )                         | PARAM            |               |( roomName )                           |
|stopScreen                  |()                                                                                | PARAM            |               |( roomName )                           |
|stopStream                  |()                                                                                | PARAM, RENAME            |stopStreams    |( roomName , streamId )                |
|getPeersScreenshare         |                                                                                  | NEW              |               |( roomName )                           |
|stopPrefetchedStream        |                                                                                  | NEW              |               |( stream )                             |
|acceptDataTransfer          |( peerId , transferId , accept=false )                                            | NOT IMPLEMENTED  |               |                                       |
|cancelDataTransfer          |( peerId , transferId )                                                           | NOT IMPLEMENTED  |               |                                       |
|getCurrentDataStreamsSession|()                                                                                  | NOT IMPLEMENTED  |               |                                       |
|getCurrentDataTransfers     |()                                                                                  | NOT IMPLEMENTED  |               |                                       |
|getPeersDatachannels        |()                                                                                | PARAM            |               |( roomName )                           |
|refreshDatachannel          |( peerId )                                                                        | PARAM            |               |( roomName , peerId )                  |
|sendBlobData                |( data ,   timeout=60 ,   targetPeerId ,   sendChunksAsBinary=false ,   callback )| NOT IMPLEMENTED  |               |                                       |
|sendURLData                 |( data ,   timeout = 60 ,   targetPeerId ,   callback )                           | NOT IMPLEMENTED  |               |                                       |
|startStreamingData          |( isStringStream=false ,   targetPeerId )                                         | NOT IMPLEMENTED  |               |                                       |
|stopStreamingData           |( streamId )                                                                      | NOT IMPLEMENTED  |               |                                       |
|streamData                  |( streamId ,   chunk )                                                            | NOT IMPLEMENTED  |               |                                       |
|getRecordings               |()                                                                                | PARAM            |               |( roomName )                           |
|startRecording              |( callback )                                                                      | PROMISIFIED, PARAM|               |( roomName )                           |
|stopRecording               |( callback ,   callbackSuccessWhenLink=false )                                    | PROMISIFIED, PARAM|               |( roomName )                           |
|startRTMPSession            |( callback )                                                                      | PROMISIFIED, PARAM|               |( roomName , streamId , endpoint)      |
|stopRTMPSession             |( callback )                                                                      | PROMISIFIED, PARAM|               |( roomName , rtmpId )                  |
|generateUUID                |()                                                                                | UNCHANGED        |               |()                                     |
|getScreenSources            |( callback )                                                                      | PROMISIFIED, PARAM|               |()                                     |
|getStreamSources            |( callback )                                                                      | PROMISIFIED, PARAM|               |()                                     |
|~~off~~                         |( eventName ,   callback )                                                        | DEPRECATED       |               |                                       |
|~~on~~                          |( eventName ,   callback )                                                        | DEPRECATED       |               |                                       |
|~~once~~                        |( eventName ,   callback ,   condition ,   fireAlways=false )                     | DEPRECATED       |               |                                       |
|setDebugMode                |( options = false )                                                               | NOT IMPLEMENTED  |               |                                       |
|~~setLogLevel~~                 |( logLevel )                                                                      | DEPRECATED       |               |                                       |

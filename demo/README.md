## Running the demos
### 1. Hosting the project repo files in a `localhost` server
In order to run these demos locally, firstly, you will require to host the demos in your localhost. You may use the `server.js` that uses [NodeJS](https://nodejs.org) to start the localhost server. Simply invoke `node server` when you are in the SkylinkJS project repository folder.

For windows, you will require to use the Node shell to run the NodeJS server.
For mac / linux, simple invoke the command from the terminal.

You may choose to use other types of hosting servers like python etc. It's recommended to make sure the encoding used to intepret the file is using `UTF-8` encoding.

### 2. Setting up the Demo Configuration (`config.js`) file
Before you run any demos, you will require to create a `config.js` file in the `/demo` folder. The sample format is provided in the `config-example.js` file. Modify the `config-example.js` file and simply replace the Application key with your own and save it as `config.js`.

Please check that in your own Application key, the CORS has been configured with `localhost` as the domain. You may check your [Developer Console](http://developer.temasys.com.sg) account Application key settings.

## List of Demos
In the `/demo` folder, this contains all the examples of how you can use Skylink for your solutions.

You may also choose to access the `/demo/index.html` page for the list of all demos available.

### demo/app
In this demo, you can find an example of the overview of all functionalities of Skylink which you can choose to integrate in your Web Application.

##### Functionalities covered
`disableAudio()`, `disableVideo()`, `enableAudio()`, `enableVideo()`, `getPeerInfo()`, `getUserData()`, `init()`, `getUserMedia()`, `joinRoom()`, `leaveRoom()`, `lockRoom()`, `muteStream()`, `on()`, `refreshConnection()`, `respondBlobRequest()`, `sendBlobData()`, `sendMessage()`, `sendP2PMessage()`, `sendStream()`, `setUserData()`, `shareScreen()`, `stopScreen()`, `stopStream()`, `unlockRoom()`

##### Events used
`candidateGenerationState`, `channelClose`, `channelError`, `channelMessage`, `channelOpen`, `dataChannelState`, `dataTransferState`, `handshakeProgress`, `incomingMessage`, `incomingStream`, `mediaAccessError`, `mediaAccessSuccess`, `peerConnectionState`, `peerJoined`, `peerLeft`, `peerRestart`, `peerUpdated`, `readyStateChange`, `roomLock`

### demo/audio-only-call
In this demo, you can find an example of how you can use Skylink to make an audio only call.

##### Functionalities covered
`init()`, `joinRoom()`

##### Events used
`incomingStream`, `peerLeft`

### demo/chat-room
In this demo, you can find an example of how you can stimulate a chat room like environment with leaving and joining rooms.

##### Functionalities covered
`init()`, `joinRoom()`, `sendP2PMessage()`, `on()`, `setUserData()`

##### Events used
`peerJoined`, `peerUpdated`, `peerLeft`, `incomingMessage`

### demo/connection-status
In this demo, you can find an example of a more advanced connection statuses and information - ICE connection, Peer Connection, DataChannel connections, signalling connection and Peer Recognition (handshake) progress.

##### Functionalities covered
`init()`, `joinRoom()`

##### Events used
`peerJoined`, `serverPeerJoined`, `peerUpdated`, `peerLeft`, `serverPeerLeft`, `on()`, `readyStateChange`, `channelOpen`, `channelMessage`, `channelClose`, `channelError`, `peerConnectionState`, `candidateGenerateState`, `dataChannelState`, `handshakeProgress`

### demo/file-transfer
In this demo, you can find an example of how you can do a simple file transfer to all peers or a targeted peer.

##### Functionalities covered
`init()`, `joinRoom()`, `getPeerInfo()`, `respondBlobRequest()`, `on()`, `sendBlobData()`

##### Events used
`peerJoined`, `peerLeft`, `dataTransferState`

### demo/gridster-integration
In this demo, you can find an example of an integration of [gridster](http://gridster.net/), a drag-and-drop grid like UI with Skylink functionalities that enables users to send files, send text messages and make video calls.

##### Functionalities covered
`getPeerInfo()`, `getUserData()`, `init()`, `getUserMedia()`, `joinRoom()`,  `on()`, `respondBlobRequest()`, `sendBlobData()`, `sendMessage()`, `sendP2PMessage()`

##### Events used
`dataTransferState`, `incomingMessage`, `peerJoined`, `incomingStream`, `mediaAccessSuccess`, `mediaAccessError`, `peerLeft`, `channelError`, `mediaAccessError`

### demo/messaging
In this demo, you can find an example of all the ways to do messaging with Skylink - P2P (secure) or socket. Private (targeted) or public (broadcasted) messages.

##### Functionalities covered
`sendP2PMessage()`, `sendMessage()`, `setUserData()`, `init()`, `joinRoom()`,  `on()`

##### Events used
`incomingMessage`, `peerJoined`, `peerLeft`

### demo/request-call
In this demo, you can find an example of an use-call to request call to other peers and start a video call.

##### Functionalities covered
`enableVideo()`, `joinRoom()`, `leaveRoom()`, `sendMessage()`, `setUserData()`, `init()`, `on()`

##### Events used
`peerJoined`, `peerLeft`, `incomingStream`, `mediaAccessSuccess`, `incomingMessage`

### demo/stream-settings
In this demo, you can find an example of the overview of all types of stream settings you could use to join a room.

##### Functionalities covered
`enableAudio()`, `disableAudio()`, `enableVideo()`, `disableVideo()`, `init()`, `on()`

##### Events used
`peerJoined`, `peerLeft`, `incomingStream`, `mediaAccessSuccess`, `incomingMessage`


### demo/video-call
In this demo, you can find an example of how you can create a simple video call with Skylink.

##### Functionalities covered
`init()`, `joinRoom()`, `on()`, `getPeerInfo()`

##### Events used
`mediaAccessSuccess`, `incomingStream`, `streamEnded`, `peerLeft`
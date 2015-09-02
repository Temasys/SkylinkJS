## List of Demos
In the `/demo` folder, this contains all the examples of how you can use Skylink for your solutions.

You may also choose to access the `/demo/index.html` page for the list of all demos available.

### demo/app
In this demo, it contains the overview of all functionalities of Skylink which you can choose to integrate in your Web Application.

##### Functionalities covered
`disableAudio()`, `disableVideo()`, `enableAudio()`, `enableVideo()`, `getPeerInfo()`, `getUserData()`, `init()`, `getUserMedia()`, `joinRoom()`, `leaveRoom()`, `lockRoom()`, `muteStream()`, `on()`, `refreshConnection()`, `respondBlobRequest()`, `sendBlobData()`, `sendMessage()`, `sendP2PMessage()`, `sendStream()`, `setUserData()`, `shareScreen()`, `stopScreen()`, `stopStream()`, `unlockRoom()`

##### Events used
`candidateGenerationState`, `channelClose`, `channelError`, `channelMessage`, `channelOpen`, `dataChannelState`, `dataTransferState`, `handshakeProgress`, `incomingMessage`, `incomingStream`, `mediaAccessError`, `mediaAccessSuccess`, `peerConnectionState`, `peerJoined`, `peerLeft`, `peerRestart`, `peerUpdated`, `readyStateChange`, `roomLock`

### demo/audio-only-call
In this demo, it contains a simple example how you can use Skylink to make an audio only call.

##### Functionalities covered
`init()`, `joinRoom()`

##### Events used
`incomingStream`, `peerLeft`

### demo/chat-room
In this demo, it contains an example of how you can stimulate a chat room like environment with leaving and joining rooms.

##### Functionalities covered
`init()`, `joinRoom()`, `sendP2PMessage()`, `setUserData()`

##### Events used
`peerJoined`, `peerUpdated`, `peerLeft`, `incomingMessage`

### demo/chat-room
In this demo, it contains an example of how you can stimulate a chat room like environment with leaving and joining rooms.

##### Functionalities covered
`init()`, `joinRoom()`, `sendP2PMessage()`, `setUserData()`

##### Events used
`peerJoined`, `peerUpdated`, `peerLeft`, `incomingMessage`
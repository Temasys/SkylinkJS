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
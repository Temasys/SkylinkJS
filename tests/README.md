> **Note** that currently the test scripts are outdated and may not work as we are evaluating to upgrade the test scripts in the future.

## Running the tests

### 1. Setting up the Configuration (`config.js`) file
To run the test scripts, firstly you have to create your own `config.js` file in the `/tests` folder. The sample format is provided in the `config-example.js` file. Modify the `config-example.j`s file and simply replace the Application key with your own and save it as `config.js`.

### 2. Running the test scripts
In some tests, you may require an extra bot to enable the test scripts to run successfully. 

Our tests are built on [`tape` testing framework](https://ci.testling.com/guide/tape), and you may modify the `test.sh` file in the repo folder to run on different browsers.

Here's a sample format on how you can run the test scripts.
```
sh test.sh <bot|test> <*testName*>
```
Run the test.sh file from the repo folder in your terminal. `bot` indicates running a bot required for test and `test` that runs the actual test itself.

## List of Tests

### Test `event`
Tests the events triggering, subscription and unsubscription. 

Invoke `sh test.sh test event` to run test.

### Test `socket`
Tests the socket connection reliability and fallback. 

Invoke `sh test.sh test socket` to run test.

### Test `api`
Tests api server parsing and connection.

Invoke `sh test.sh test api` to run test.

### Test `helper`
Tests helper functions.

Invoke `sh test.sh test helper` to run test.

### Test `peer`
Tests the peer connection signaling state and ice connection state.

Invoke `sh test.sh bot peer` first to run the bot and then invoke `sh test.sh test peer` in another terminal to run test.

### Test `message`
Tests the messaging system like sendMessage or sendP2PMessage.

Invoke `sh test.sh bot message` first to run the bot and then invoke `sh test.sh test message` in another terminal to run test.

### Test `transfer`
Tests the data transfer with blob data like sendBlobData.

Invoke `sh test.sh bot transfer` first to run the bot and then invoke `sh test.sh test transfer` in another terminal to run test.

### Test `stream`
Tests the stream sending and parsing like getUserMedia, sendStream and joinRoom mediaConstraints.

Invoke `sh test.sh bot stream` first to run the bot then invoke `sh test.sh test stream` in another terminal to run test.

### Test `debug`
Tests the debug mode. Currently, it is able to test if the SkylinkLogs are enabled or not.

Invoke `sh test.sh test debug` to run test.

### Test `async`
Tests the async callbacks.

Invoke `sh test.sh bot async` first to run the bot and then invoke `sh test.sh test async` in another terminal to run test.

### Test `sdp`
Tests the SDP modifications.

Invoke `sh test.sh bot sdp` first to run the bot and then invoke `sh test.sh test sdp` in another terminal to run test.
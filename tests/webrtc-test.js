(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

var userID, peerID;
var expectedMessage = navigator.userAgent;
var expectedBlobName = 'testingBlob';
var expectedBlob = new Blob(['<a id="a"><b id="b">test</b></a>'],
  { type: 'text/html' });

// Test 1: Retrieving server information
test('Retrieving information from API server', function (t) {
  t.plan(1);

  var array = [];

  sw.on('readyStateChange', function (state) {
    array.push(state);
  });

  sw.init(apikey);

  setTimeout(function () {
    t.deepEqual(array, [
      sw.READY_STATE_CHANGE.INIT,
      sw.READY_STATE_CHANGE.LOADING,
      sw.READY_STATE_CHANGE.COMPLETED
    ]);
  }, 8000);
});

// Test 2: Joining the room
test('Joining Room', function (t) {
  t.plan(2);

  var ic_array = [], dc_array = [];

  sw.on('iceConnectionState', function (state, user) {
    ic_array.push(state);
  });

  sw.on('dataChannelState', function (state, user) {
    dc_array.push(state);
  });

  sw.on('peerJoined', function (_peerID, peerInfo, isSelf) {
    peerID = _peerID;
  });

  sw.joinRoom();

  setTimeout(function () {
    t.deepEqual(ic_array, [
      sw.ICE_CONNECTION_STATE.CHECKING,
      sw.ICE_CONNECTION_STATE.CONNECTED,
      sw.ICE_CONNECTION_STATE.COMPLETED
    ]);
    t.deepEqual(dc_array, [
      sw.DATA_CHANNEL_STATE.CONNECTING,
      sw.DATA_CHANNEL_STATE.OPEN
    ]);
    t.end();
  }, 8000);
});

// Test 3: Relaying messages
test('Send Message', function (t) {
  t.plan(1);

  var msg_array = [];

  sw.on('incomingMessage', function (message) {
    if (message.isPrivate) {
      if (message.targetPeerId === peerID &&
        message.content === expectedMessage) {
        msg_array.push(1);
      }
    } else {
      if (message.content === expectedMessage) {
        msg_array.push(1)
      }
    }
  });

  sw.sendMessage(expectedMessage, peerID);
  sw.sendP2PMessage(expectedMessage);

  setTimeout(function () {
    t.deepEqual(msg_array, [1, 1]);
  }, 8000);
});

// Test 4: Sending Blobs/Files
test('Sending Blob', function (t) {
  t.plan(1);

  sw.sendBlobData(expectedBlob, {
    name : expectedBlobName,
    size : expectedBlob.size
  }, peerID);

  sw.on('dataTransferState', function (state) {
    switch (state) {
    case sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
      t.pass();
      break;
    case sw.DATA_TRANSFER_STATE.REJECTED :
    case sw.DATA_TRANSFER_STATE.ERROR :
      t.fail();
    }
  });

  setTimeout(function () {
    t.end();
  }, 12000);
});

// Test 5: Leaving the room
test('Leave Room', function (t) {
  t.plan(1);

  var cb = function (state) {
    if(state === sw.PEER_CONNECTION_STATE.CLOSED) {
      sw.off('peerConnectionState', cb);
      t.pass();
    }
  };

  sw.on('peerConnectionState', cb);

  sw.leaveRoom();

  setTimeout(function () {
    t.end();
  }, 2000);
});

})();
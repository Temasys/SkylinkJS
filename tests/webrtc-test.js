var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skyway  = require('./../source/skyway.js');

var sw = new skyway.Skyway();

var server = 'http://sgbeta.signaling.temasys.com.sg:8018/';
var apikey = 'ac5acbc3-48d9-40c3-9470-9dc1308bc22a';
var room  = 'test';

var peerID = '';

test('WebRTC/XHR init', function (t) {
  t.plan(1);

  var array = [];

  sw.on('readyStateChange', function (state) {
    array.push(state);
  });

  sw.init({
    roomserver: server,
    appID: apikey,
    room: room
  });

  setTimeout(function () {
    t.deepEqual(array, [
      sw.READY_STATE_CHANGE.INIT,
      sw.READY_STATE_CHANGE.LOADING,
      sw.READY_STATE_CHANGE.COMPLETED
    ]);
  }, 8000);
});

test('Joining Room', function (t) {
  t.plan(2);

  var ic_array = [], dc_array = [];

  sw.on('iceConnectionState', function (state, user) {
    ic_array.push(state);
  });

  sw.on('dataChannelState', function (state, user) {
    dc_array.push(state);
  });

  sw.on('peerJoined', function (_peerID) {
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
      sw.DATA_CHANNEL_STATE.NEW,
      sw.DATA_CHANNEL_STATE.LOADED,
      sw.DATA_CHANNEL_STATE.CONNECTING,
      sw.DATA_CHANNEL_STATE.OPEN
    ]);
    t.end();
  }, 15000);
});

test('Send Chat Message', function (t) {
  t.plan(1);

  // Not the best way to test just yet, as it could be another random chatMsg
  sw.on('chatMessage', function (msg) {
    if(msg === navigator.userAgent) {
      t.pass();
    }
  });

  sw.sendChatMsg(navigator.userAgent);

  setTimeout(function () {
    t.end();
  }, 3000);
});

test('Sending Blob', function (t) {
  t.plan(1);

  var text_blob = new Blob(
    ['<a id="a"><b id="b">test</b></a>'], { type: 'text/html' });

  sw.sendBlobData(text_blob, {
    name : 'test_upload',
    size : text_blob.size
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
  }, 15000);
});

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
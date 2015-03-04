(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var apikey = '5c111af5-03cd-4d6b-ba58-4334551fcb74';

console.log('API: Tests peer connection');
console.log('===============================================================================================');

sw.init(apikey);

test('joinRoom(): Joining Room', function (t) {
  t.plan(5);

  var peer_array = [];
  var userdata_array = [];
  var peerconn_array = [];
  var ic_array = [];
  var dc_array = [];
  var compare_dc_array = [
    sw.DATA_CHANNEL_STATE.OPEN
  ];

  sw.on('peerConnectionState', function (state) {
    peerconn_array.push(state);

    if (state === sw.PEER_CONNECTION_STATE.STABLE) {
      // check peer connection state
      t.deepEqual([
        peerconn_array[0] === sw.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER ||
          peerconn_array[0] === sw.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER,
        peerconn_array[1] === sw.PEER_CONNECTION_STATE.STABLE
      ], [true, true], 'Peer connection state triggers correctly');
    }
  });

  sw.on('iceConnectionState', function (state) {
    ic_array.push(state);

    if (state === sw.ICE_CONNECTION_STATE.COMPLETED) {
      // check ice connection state
      t.deepEqual(ic_array, [
        sw.ICE_CONNECTION_STATE.CHECKING,
        sw.ICE_CONNECTION_STATE.CONNECTED,
        sw.ICE_CONNECTION_STATE.COMPLETED
      ], 'Ice connection state triggers correctly');
    }
  });

  sw.on('dataChannelState', function (state) {
    dc_array.push(state);

    if (state === sw.DATA_CHANNEL_STATE.CONNECTING) {
      compare_dc_array =  [
        sw.DATA_CHANNEL_STATE.CONNECTING,
        sw.DATA_CHANNEL_STATE.OPEN
      ];
    }

    if (state === sw.DATA_CHANNEL_STATE.OPEN) {
      // check the datachannel connection state
      t.deepEqual(dc_array, compare_dc_array, 'Datachannel connection state triggers correctly');
    }
  });

  sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      peer_array.push(1);
      // check the user data
      if (peerInfo.userData === 'PEER1') {
        userdata_array.push(1);
        console.log('User "PEER1" has joined the room');
      }
    } else {
      peer_array.push(2);
      // check the user data
      if (peerInfo.userData === 'PEER2') {
        userdata_array.push(2);
        console.log('Peer "PEER2" has joined the room');
      }
      // check peer handshake state
      t.deepEqual(peer_array, [1, 2], 'Peer handshake state triggers correctly');

      // check peer userdata reliablity
      t.deepEqual(userdata_array, [1, 2], 'User data is set correctly');
    }
  });

  sw.joinRoom({
    userData: 'PEER1'
  });

  console.log('User "PEER1" is joining the room');

  setTimeout(function () {
    t.end();
  }, 85000);
});

test('leaveRoom(): Leave Room', function (t) {
  t.plan(4);

  var peer_array = [];

  sw.on('peerConnectionState', function (state) {
    t.deepEqual(state, sw.PEER_CONNECTION_STATE.CLOSED, 'Peer connection state is closed');
  });

  sw.on('iceConnectionState', function (state) {
    t.deepEqual(state, sw.ICE_CONNECTION_STATE.CLOSED, 'Ice connection state is closed');
  });

  sw.on('dataChannelState', function (state) {
    t.deepEqual(state, sw.DATA_CHANNEL_STATE.CLOSED, 'Datachannel state is closed');
  });

  sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      peer_array.push(2);
      console.log('User "' + peerInfo.userData + '" has left the room');
    } else {
      peer_array.push(1);
      console.log('User "' + peerInfo.userData + '" has left the room');
    }
  });

  setTimeout(function () {
    // check peer connection state
    t.deepEqual(peer_array, [1, 2], 'User has left the room');
    t.end();
  }, 8000);

  window.test = sw;

  setTimeout(function () {
    sw.leaveRoom();
  }, 1000);
});

})();
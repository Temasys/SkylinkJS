var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


sw.init(apikey);

test('Joining Room', function (t) {
  t.plan(5);

  var peer_array = [];
  var userdata_array = [];
  var peerconn_array = [];
  var ic_array = [];
  var dc_array = [];

  sw.on('peerConnectionState', function (state) {
    peerconn_array.push(state);
  });

  sw.on('iceConnectionState', function (state) {
    ic_array.push(state);
  });

  sw.on('dataChannelState', function (state) {
    dc_array.push(state);
  });

  sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      peer_array.push(1);
      // check the user data
      if (peerInfo.userData === 'PEER1') {
        userdata_array.push(1);
      }
    } else {
      peer_array.push(2);
      // check the user data
      if (peerInfo.userData === 'PEER2') {
        userdata_array.push(2);
      }
    }
  });

  sw.joinRoom({
    userData: 'PEER1'
  });

  setTimeout(function () {
    // check peer connection state
    t.deepEqual(peerconn_array, [
      sw.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER,
      sw.PEER_CONNECTION_STATE.STABLE
    ], 'Peer connection state triggers correctly');
    // check ice connection state
    t.deepEqual(ic_array, [
      sw.ICE_CONNECTION_STATE.CHECKING,
      sw.ICE_CONNECTION_STATE.CONNECTED,
      sw.ICE_CONNECTION_STATE.COMPLETED
    ], 'Ice connection state triggers correctly');
    // check the datachannel connection state
    t.deepEqual(dc_array, [
      sw.DATA_CHANNEL_STATE.CONNECTING,
      sw.DATA_CHANNEL_STATE.OPEN
    ], 'Datachannel connection state triggers correctly');
    // check peer handshake state
    t.deepEqual(peer_array, [1, 2], 'Peer handshake state triggers correctly');
    // check peer userdata reliablity
    t.deepEqual(userdata_array, [1, 2], 'User data is set correctly');
    t.end();
  }, 8000);
});

test('Leave Room', function (t) {
  t.plan(4);

  var peer_array = [];

  sw.on('peerConnectionState', function (state) {
    t.deepEqual(state, sw.PEER_CONNECTION_STATE.CLOSED, 'Peer connection state is closed');
  });

  sw.on('iceConnectionState', function (state) {
    t.deepEqual(state, sw.ICE_CONNECTION_STATE.CLOSED, 'Peer connection state is closed');
  });

  sw.on('dataChannelState', function (state) {
    t.deepEqual(state, sw.DATA_CHANNEL_STATE.CLOSED, 'Datachannel state is closed');
  });

  sw.on('peerLeft', function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      peer_array.push(2);
    } else {
      peer_array.push(1);
    }
  });

  setTimeout(function () {
    // check peer connection state
    t.deepEqual(peer_array, [1, 2], 'User has left the room');
    t.end();
  }, 8000);

  sw.leaveRoom();
});

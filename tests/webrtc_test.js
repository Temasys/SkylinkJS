var test = require('tape');

//window.io = require('socket.io-client');
// This is kinda ugly. Don't fully understand why I need this...

var adapter = require('./../source/adapter.js');
var skyway  = require('./../source/skyway.js');

var sw = new skyway.Skyway();

var server = 'http://sgbeta.signaling.temasys.com.sg:8018/';
var apikey = 'fcc1ef3a-8b75-47a5-8325-3e34cabf768d';
//Leticia - 'fcc1ef3a-8b75-47a5-8325-3e34cabf768d'
//Thomas - 'a5aff4a5-78e4-4964-a589-54c99b963f53';
var room  = 'test';

test('WebRTC/XHR init', function (t) {
	t.plan(1);

	var array = [];

	sw.on('readyStateChange', function (state) {
		array.push(state);
	});

	sw.init(server, apikey, room);

	setTimeout(function () {
		t.deepEqual(array, [
      sw.READY_STATE_CHANGE.INIT,
      sw.READY_STATE_CHANGE.LOADING,
      sw.READY_STATE_CHANGE.COMPLETED
    ]);
	}, 5000);
});

test('Joining Room', function (t) {
  // NOTE: Leticia - To discuss with Thomas regarding this implementation
	// 'completed' gets called as 'completed'.
  // So either way the connection has to be connected and completed
  // 'connected' && 'completed' || 'completed' && 'completed'
  t.plan(2);

  var ic_array = [], dc_array = [];

	sw.on('iceConnectionState', function (state, user) {
		console.log('Received Status From User [\'' + user + '\'] : ' + state);
    ic_array.push(state);
	});

  sw.on('dataChannel', function (state, user) {
    dc_array.push(state);
  });

	sw.joinRoom();

	setTimeout(function () {
    t.deepEqual(ic_array, [
      sw.ICE_CONNECTION_STATE.CONNECTED,
      sw.ICE_CONNECTION_STATE.COMPLETED
    ]);
		t.deepEqual(dc_array, [
      sw.DATA_CHANNEL_STATE.NEW,
      sw.DATA_CHANNEL_STATE.LOADED,
      sw.DATA_CHANNEL_STATE.OPEN
    ]);
    t.end();
	}, 8000);
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
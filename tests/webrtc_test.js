var test = require('tape');
window.io = require('socket.io-client');

var adapter = require('./../source/adapter.js');
var skyway = require('./../source/skyway.js');

var sw = new skyway.Skyway();

var server = 'http://54.251.99.180:8080/';
var apikey = 'apitest';
var room  = null;

test('WebRTC/XHR init', function (t) {
	t.plan(1);

	var array = [];

	sw.on('readyStateChange', function (state) {
		array.push(state);
	});

	sw.init(server, apikey, room);

	setTimeout(function () {
		t.deepEqual(array, [0,1,2]);
	}, 2000);
});

test('Joining Room', function (t) {
	t.plan(1);

	sw.on('iceConnectionState', function (state) {
		if(state === 'connected') {
			t.pass();
		}
	});

	sw.joinRoom();

	setTimeout(function () {
		t.end();
	}, 5000);
});

test('Send Chat Message', function (t) {
	t.plan(1);

	sw.on('chatMessage', function (msg) {
		if(msg === navigator.userAgent) {
			t.pass();
		}
	});

	sw.sendChatMsg(navigator.userAgent);

	setTimeout(function () {
		t.end();
	}, 2000);
});

test('Leave Room', function (t) {
	t.plan(1);

	sw.on('peerConnectionState', function (state) {
		if(state === 'closed') {
			t.pass();
		}
	});

	sw.leaveRoom();

	setTimeout(function () {
		t.end();
	}, 2000);
});


'use strict';

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

	var array = [];

	sw.on('iceConnectionState"', function (state) {
		t.equal(state, 'connected');
	});

	sw.joinRoom();

	setTimeout(function () {
		t.end();
	}, 5000);
});


'use strict';

var skyway = require('./../source/skyway.js');
var test = require('tape');

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


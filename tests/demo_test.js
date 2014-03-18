'use strict';

var skyway = require('./../lib/skyway.js');

exports['SkyWay Hello World Test'] = {

	setUp: function (callback) {
		callback();
	},

	tearDown: function (callback) {
		callback();
	},

	'Hello': function (test) {
		test.equals('Hello World', 'Hello World');
		test.done();
	}

};

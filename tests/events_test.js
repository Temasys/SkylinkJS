'use strict';

var skyway = require('./../publish/skyway.js');
var test = require('tape');

var sw = new skyway.Skyway();
var array = [];

var pushToArrayPlusOne = function (value) {
		array.push(value + 1);
	};
var pushToArrayPlusTwo = function (value) {
		array.push(value + 2);
	};
var pushToArrayPlusThree = function (value) {
		array.push(value + 3);
	};
var cancelTrigger = function (value) {
		return false;
	};

test('Event Binding and Triggering', function (t) {
	t.plan(1);

	array = [];

	sw.on('someevent', pushToArrayPlusOne);

	sw._trigger('someotherevent', 0);
	sw._trigger('someevent', 0);

	t.deepEqual(array, [1]);
});

test('Event Triggering in Order', function (t) {
	t.plan(1);

	array = [];

	sw.on('somenewevent', pushToArrayPlusOne);
	sw.on('somenewevent', pushToArrayPlusTwo);
	sw.on('somenewevent', pushToArrayPlusThree);

	sw._trigger('somenewevent', 0);

	t.deepEqual(array, [1,2,3]);
});

test('Event Unbinding', function (t) {
	t.plan(1);

	array = [];

	sw.on('unbindevent', pushToArrayPlusOne);
	sw.on('unbindevent', pushToArrayPlusTwo);
	sw.on('unbindevent', pushToArrayPlusThree);

	sw.off('unbindevent', pushToArrayPlusOne);

	sw.on('unbindevent', pushToArrayPlusOne);

	sw._trigger('unbindevent', 0);

	t.deepEqual(array, [2,3,1]);
});

test('Cancel Event Triggering', function (t) {
	t.plan(1);

	array = [];

	sw.on('cancelevent', pushToArrayPlusOne);
	sw.on('cancelevent', pushToArrayPlusTwo);
	sw.on('cancelevent', cancelTrigger);
	sw.on('cancelevent', pushToArrayPlusThree);

	sw._trigger('cancelevent', 0);

	t.deepEqual(array, [1,2]);
});

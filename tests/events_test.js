'use strict';

var skyway = require('./../source/skyway.js');

exports['Event Binding/Unbinding'] = {

	setUp: function (callback) {
		var self = this;

		this.skyway = new skyway.Skyway();
		this.array = [];

		// Example functions
		this.pushToArrayPlusOne = function (value) {
			self.array.push(value + 1);
		};
		this.pushToArrayPlusTwo = function (value) {
			self.array.push(value + 2);
		};
		this.pushToArrayPlusThree = function (value) {
			self.array.push(value + 3);
		};
		this.cancelTrigger = function (value) {
			return false;
		};

		callback();
	},

	'Binding and Triggering': function (test) {
		this.skyway.on('someevent', this.pushToArrayPlusOne);

		this.skyway._trigger('someotherevent', 0);
		this.skyway._trigger('someevent', 0);

		test.equals(this.array.join(), '1');
		test.done();
	},

	'Triggering in Order': function (test) {
		this.skyway.on('someevent', this.pushToArrayPlusOne);
		this.skyway.on('someevent', this.pushToArrayPlusTwo);
		this.skyway.on('someevent', this.pushToArrayPlusThree);

		this.skyway._trigger('someevent', 0);

		test.equals(this.array.join(), '1,2,3');
		test.done();
	},

	'Unbinding': function (test) {
		this.skyway.on('someevent', this.pushToArrayPlusOne);
		this.skyway.on('someevent', this.pushToArrayPlusTwo);
		this.skyway.on('someevent', this.pushToArrayPlusThree);

		this.skyway.off('someevent', this.pushToArrayPlusOne);

		this.skyway.on('someevent', this.pushToArrayPlusOne);

		this.skyway._trigger('someevent', 0);

		test.equals(this.array.join(), '2,3,1');
		test.done();
	},

	'Cancel Triggering': function (test) {
		this.skyway.on('someevent', this.pushToArrayPlusOne);
		this.skyway.on('someevent', this.pushToArrayPlusTwo);
		this.skyway.on('someevent', this.cancelTrigger);
		this.skyway.on('someevent', this.pushToArrayPlusThree);

		this.skyway._trigger('someevent', 0);

		test.equals(this.array.join(), '1,2');
		test.done();
	}

};

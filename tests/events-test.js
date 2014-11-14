var test = require('tape');

var skylink = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();
var array = [];

var pushToArrayPlusOne = function(value) {
  array.push(value + 1);
};
var pushToArrayPlusTwo = function(value) {
  array.push(value + 2);
};
var pushToArrayPlusThree = function(value) {
  array.push(value + 3);
};
var pushToArrayPlusFour = function(value) {
  array.push(value + 4);
};
var cancelTrigger = function(value) {
  return false;
};

test('Event Binding and Triggering', function(t) {
  t.plan(2);

  array = [];

  sw.on('someevent', pushToArrayPlusOne);
  sw.once('someevent', pushToArrayPlusTwo, function () {
  	return true;
  });

  sw._trigger('someotherevent', 0);
  sw._trigger('someevent', 0);

  t.deepEqual(array, [1, 2], 'Correct event is triggered');

  sw._trigger('someevent', 0);

  setTimeout(function () {
  	t.deepEqual(array, [1, 2, 1], 'Once event is unsubscribed');
  }, 1000);
});

test('Event Triggering in Order', function(t) {
  t.plan(1);

  array = [];

  sw.on('somenewevent', pushToArrayPlusOne);
  sw.on('somenewevent', pushToArrayPlusTwo);
  sw.on('somenewevent', pushToArrayPlusThree);
  sw.once('somenewevent', pushToArrayPlusFour, function () {
  	return true;
  });

  sw._trigger('somenewevent', 0);

  t.deepEqual(array, [1, 2, 3, 4], 'Events are triggered in order - 1, 2, 3, 4');
});

test('Event Unbinding', function(t) {
  t.plan(1);

  array = [];

  // normal event unsubscription
  sw.on('unbindevent', pushToArrayPlusOne);
  sw.on('unbindevent', pushToArrayPlusTwo);
  sw.on('unbindevent', pushToArrayPlusThree);

  sw.off('unbindevent', pushToArrayPlusOne);

  sw.on('unbindevent', pushToArrayPlusOne);

  sw._trigger('unbindevent', 0);

  // once event unsubscription
  sw.on('unbindonceevent', pushToArrayPlusOne);
  sw.once('unbindonceevent', pushToArrayPlusTwo);

  sw.off('unbindonceevent', pushToArrayPlusTwo);

  sw._trigger('unbindonceevent', 0);

  t.deepEqual(array, [2, 3, 1, 1], 'Events unbinded are not trigged');
});

test('Unbind all Events', function(t) {
  t.plan(1);

  array = [];

  sw.on('unbindall', pushToArrayPlusOne);
  sw.on('unbindall', pushToArrayPlusTwo);
  sw.on('unbindall', pushToArrayPlusThree);
  sw.once('unbindall', pushToArrayPlusFour);

  sw.off('unbindall');

  sw._trigger('unbindall', 0);

  t.deepEqual(array, []);
});

test('Event condition not met', function(t) {
  t.plan(1);

  array = [];

  sw.once('conditionevent', pushToArrayPlusOne, function () {
  	return false;
  });

  sw._trigger('conditionotherevent', 0);
  sw._trigger('conditionevent', 0);

  sw._trigger('conditionevent', 0);

  setTimeout(function () {
  	t.deepEqual(array, [], 'Once event not triggered when condition not met');
  }, 1000);
});

test('Cancel Event Triggering', function(t) {
  t.plan(1);

  array = [];

  sw.on('cancelevent', pushToArrayPlusOne);
  sw.on('cancelevent', pushToArrayPlusTwo);
  sw.once('cancelevent', pushToArrayPlusTwo, function () {
  	return true;
  });
  sw.on('cancelevent', cancelTrigger);
  sw.on('cancelevent', pushToArrayPlusThree);
  sw.once('cancelevent', pushToArrayPlusFour, function () {
  	return true;
  });

  sw._trigger('cancelevent', 0);

  t.deepEqual(array, [1, 2, 2], 'Cancel event stops the rest of the events from triggering');
});

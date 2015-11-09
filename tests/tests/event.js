(function() {

'use strict';

/// Dependencies
var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();


console.log('API: Tests the events triggering');
console.log('===============================================================================================');


test('_trigger(): Test triggering with the correct parameters', function(t) {
  t.plan(4);

  sw.on('trigger1', function (t1) {
    t.deepEqual([t1], [2], 'Triggers with one parameter');
  });

  sw.on('trigger2', function (t1, t2) {
    t.deepEqual([t1, t2], [false, 1], 'Triggers with two parameters');
  });

  sw.on('trigger3', function (t1, t2, t3, t4, t5) {
    t.deepEqual([t1, t2, t3, t4, t5], ['tryout', true, 10, 8.5, [9, 9]], 'Triggers with five parameters');
  });

  sw.on('trigger4', function (t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15) {
    t.deepEqual([t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15],
      [true, 'ererer', 10.322, { a: 'key', b: 22 }, ['2323', 2323, false, 10], 1, 2, 3,
        'a', true, 3278, 'rere', [23, 23], [false, false], true],
      'Triggers with fifteen parameters');
  });

  sw._trigger('trigger1', 2);
  sw._trigger('trigger2', false, 1);
  sw._trigger('trigger3', 'tryout', true, 10, 8.5, [9, 9]);
  sw._trigger('trigger4', true, 'ererer', 10.322, { a: 'key', b: 22 }, ['2323', 2323, false, 10], 1, 2, 3,
    'a', true, 3278, 'rere', [23, 23], [false, false], true);

  sw.off('trigger1');
  sw.off('trigger2');
  sw.off('trigger3');
  sw.off('trigger4');
  t.end();
});

test('on(): Events are triggering in order', function(t) {
  t.plan(2);

  var array = [];

  sw.on('somenewevent', function (t1) {
    array.push(t1);
  });
  sw.on('somenewevent', function (t1) {
    array.push(t1 + 1);
  });
  sw.on('somenewevent', function (t1) {
    array.push(t1 + 2);
  });
  sw.on('somenewevent', function (t1) {
    array.push(t1 + 3);
  });

  sw._trigger('somenewevent', 1);

  t.deepEqual(array, [1, 2, 3, 4], 'Events are triggered in order');

  sw.once('somenewevent', function (t1) {
    array.push(t1 + 4);
  });

  array = [];

  sw._trigger('somenewevent', 2);

  t.deepEqual(array, [2, 3, 4, 5, 6], 'Events are re-triggered in order');

  sw.off('somenewevent');
  t.end();
});

test('once(): Test if event is triggered once only', function(t) {
  t.plan(4);

  var array = [];

  sw.on('someevent', function (t1) {
    array.push(t1 + 1);
  });
  sw.once('someevent', function (t1) {
    array.push(t1 + 2);
  });

  sw._trigger('someotherevent', 1);
  sw._trigger('someevent', 2);

  t.deepEqual(array, [3, 4], 'Correct event is triggered');

  sw._trigger('someevent', 0);

  t.deepEqual(array, [3, 4, 1], 'Once event is unsubscribed');

  sw.once('conditionevent', function (t1) {
    array.push(t1 + 1);
  }, function () {
    return false;
  });

  array = [];

  sw._trigger('conditionevent', 0);

  t.deepEqual(array, [], 'Once event not triggered when condition not met');

  sw.once('conditionevent', function (t1) {
    array.push(t1 + 2);
  });

  sw.once('conditionevent', function (t1) {
    array.push(t1 + 3);
  });

  sw._trigger('conditionevent', 1);

  t.deepEqual(array, [3, 4], 'Once event triggered when condition not provided');

  sw.off('conditionevent');
  sw.off('someevent');
  sw.off('someotherevent');
  t.end();
});

test('off(): Event Unbinding', function(t) {
  t.plan(4);

  var array = [];
  var array1 = [];
  var array2 = [];
  var array3 = [];
  var turn_off = function (t1) {
    array.push(t1 + 1);
  };

  // normal event unsubscription
  sw.on('unbindevent', turn_off);
  sw.on('unbindevent', function (t1) {
    array.push(t1 + 2);
  });
  sw.on('unbindevent', function (t1) {
    array.push(t1 + 3);
  });
  sw.off('unbindevent', turn_off);

  sw.on('unbindevent', function (t1) {
    array.push(t1 + 5);
  });

  sw._trigger('unbindevent', 1);

  t.deepEqual(array, [3, 4, 6], 'Events unbinded are not triggered');

  sw.on('sameunbindevent', turn_off);
  sw.on('sameunbindevent', turn_off);
  sw.on('sameunbindevent', function (t1) {
    array1.push(t1 + 3);
  });
  sw.off('sameunbindevent', turn_off);

  sw.on('sameunbindevent', function (t1) {
    array1.push(t1 + 5);
  });

  sw._trigger('sameunbindevent', 1);

  t.deepEqual(array1, [4, 6], 'Events unbinded with the same signature are not triggered');

  // once event unsubscription
  sw.on('unbindonceevent', function (t1) {
    array2.push(t1 + 2);
  });
  sw.once('unbindonceevent', turn_off);

  sw.off('unbindonceevent', turn_off);

  sw._trigger('unbindonceevent', 0);

  t.deepEqual(array2, [2], 'Events unbinded once events are not trigged');

  sw.on('unbindallevent', function (t1) {
    array3.push(t1 + 1);
  });
  sw.on('unbindallevent', function (t1) {
    array3.push(t1 + 2);
  });
  sw.on('unbindallevent', function (t1) {
    array3.push(t1 + 3);
  });
  sw.once('unbindallevent', function (t1) {
    array3.push(t1 + 4);
  });

  sw.on('unbindallevent', function (t1) {
    array3.push(t1 + 5);
  });

  sw.off('unbindallevent');

  t.deepEqual(array3, [], 'All events unbinded are not trigged');

  sw.off('unbindonceevent');
  sw.off('unbindevent');
  sw.off('unbindallevent');
  t.end();
});

test('_condition(): Event condition not met', function (t) {
  t.plan(3);

  var array = [];

  sw._condition('_conditionevent1', function (t1) {
    array.push(t1 + 1);
  }, function () {
    return false;
  }, function () {
    return true;
  });

  sw._trigger('_conditionevent1', 1);

  t.deepEqual(array, [2], 'Conditional event subscribes to event when first condition fails');

  sw._trigger('event1', 1);

  t.deepEqual(array, [2], 'Conditional event should unsubscribe to event once ' +
    'second condition passes');

  sw._condition('_conditionevent2', function () {
    array.push(3);
  }, function () {
    return true;
  }, function () {
    return true;
  });

  sw._trigger('_conditionevent2', 1);

  t.deepEqual(array, [2, 3], 'Conditional event should not subscribe to event ' +
    'when first condition passes');

  sw.off('event1');
  sw.off('_conditionevent1');
  sw.off('_conditionevent2');
  t.end();
});

test('_wait(): Wait Interval Event Test', function (t) {
  t.plan(5);

  var fakeData1 = 1;
  var fakeData2 = 1;
  var array = [];

  var condi = false;
  var check_length = 0;
  var checker;

  sw._wait(function () {
    t.pass('Wait interval triggering callback after condition is met');

    if (!checker) {
      array.length = check_length;

      checker = setTimeout(function () {
        t.deepEqual(check_length, array.length, 'Wait interval should clear interval after condition is met');
      }, 1000);
    }
  }, function () {
    array.push(array.length + 1);

    console.info(condi);
    return condi;
  }, 1000);

  setTimeout(function () {
    condi = true;
    t.deepEqual(array, [1, 2, 3], 'Wait interval triggering in correct timing');
  }, 2500);

  sw._wait(function () {
    fakeData1 = 6;
  }, function () {
    return true;
  });

  setTimeout(function () {
    t.deepEqual(fakeData1, 6, 'Wait interval should trigger at default timing');
  }, 50);

  sw._wait(function () {
    fakeData2 = 5;
  }, function () {
    return fakeData2 === 1;
  }, 100);

  setTimeout(function () {
    t.deepEqual(fakeData2, 5, 'Wait interval should not setInterval when condition is met');
  }, 100);
});

})();
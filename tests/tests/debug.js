(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var test    = require('tape');
var sw      = new Skylink();


console.log('API: Tests the debug mode stack logs');
console.log('===============================================================================================');


test('setDebugMode(): Testing to check if logs are saved in setDebugMode options', function(t) {
  t.plan(3);

  sw.setDebugMode(true);

  sw.init(apikey);

  if (window.SkylinkLogs.getLogs().length > 0) {
    t.pass('SkylinkLogs is not empty when setDebugMode === true');
  } else {
    t.fail('SkylinkLogs is empty when setDebugMode === true');
  }

  window.SkylinkLogs.clearAllLogs();

  sw.setDebugMode(false);

  sw.init(apikey);

  if (window.SkylinkLogs.getLogs().length === 0) {
    t.pass('SkylinkLogs is empty when setDebugMode === false')
  } else {
    t.fail('SkylinkLogs is not empty when setDebugMode === true');
  }

  window.SkylinkLogs.clearAllLogs();

  sw.setDebugMode();

  sw.init(apikey);

  if (window.SkylinkLogs.getLogs().length > 0) {
    t.pass('SkylinkLogs is not empty when setDebugMode === empty (default: true)');
  } else {
    t.fail('SkylinkLogs is empty when setDebugMode === empty (default: true)');
  }

});

test('SkylinkLogs: Testing if SkylinkLogs stores based on setLogLevel correctly', function(t) {
  t.plan(4);

  sw.setDebugMode(true);

  sw.init(apikey);

  sw.joinRoom();

  if (window.SkylinkLogs.getLogs().length > 0) {
    t.pass('SkylinkLogs is not empty');
  } else {
    t.fail('SkylinkLogs is empty');
  }

  var logs = window.SkylinkLogs.getLogs(sw.LOG_LEVEL.LOG);

  var logCount = 0;

  for (var i = 0; i < logs.length; i++) {
    if (logs[i][1] === 'log') {
      logCount += 1;
    }
  }

  if (logs.length === logCount) {
    t.pass('SkylinkLogs logs returns the level correctly');
  } else {
    t.fail('SkylinkLogs logs returns the number incorrectly');
  }

  // reason because in real-time, it would probably be still logging.
  var preLength = window.SkylinkLogs.getLogs().length;

  window.SkylinkLogs.clearAllLogs();

  var cuLength = window.SkylinkLogs.getLogs().length;

  if (preLength > cuLength) {
    t.pass('Previous SkylinkLogs is cleared when clearAllLogs() is called')
  } else {
    t.fail('Previous SkylinkLogs is not cleared when clearAllLogs() is called');
  }

  if (typeof window.SkylinkLogs.printAllLogs === 'function') {
    t.pass('SkylinkLogs.printAllLogs is a function');
  } else {
    t.fail('SkylinkLogs.printAllLogs is not a function');
  }

});

})();
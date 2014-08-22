window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skyway  = require('./../source/skyway.js');

var sw = new skyway.Skyway();

var server = 'http://sgbeta.signaling.temasys.com.sg:8018/';
var apikey = 'ac5acbc3-48d9-40c3-9470-9dc1308bc22a';
var room  = 'test';

sw.on('readyStateChange', function (state) {
  if (state === sw.READY_STATE_CHANGE.COMPLETED) {
    sw.joinRoom();
  }
});

sw.init({
  roomServer: server,
  apiKey: apikey,
  defaultRoom: room
});
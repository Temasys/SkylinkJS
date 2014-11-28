(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

sw.setLogLevel(4);

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

sw.init(apikey);

test('Test sendBlobData callback', function(t){
  t.plan(1);
  var array=[];
  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);
  var file_callback = function(error, success){
    if (error){
      array.push(-1);
    }
    else{
      array.push(1);
    }
  }

  sw.joinRoom('defaultroom',{userData: 'self'});

  sw.on('peerJoined', function (peerId, peerInfo, isSelf) {
    sw._condition('dataChannelState', function () {
      sw.sendBlobData(data, {
        name: 'Test1',
        size: data.size
      },file_callback);
    }, function (state) {
      return (state === sw.DATA_CHANNEL_STATE.OPEN && !isSelf);
    }, function (state) {
      return (state === sw.DATA_CHANNEL_STATE.OPEN && !isSelf);
    });
  });

  setTimeout(function () {
    t.deepEqual(array, [1], 'sendBlobData callback called ?');
    sw.leaveRoom();
    t.end();
  }, 20000);
});

test('Test joinRoom callback', function(t){
  t.plan(1);
  var array = [];
  var join_callback = function(error, success){
    if (error){
      array.push('error');
    }
    else{
      array.push('success');
    }
  }

  sw.joinRoom(join_callback);

  setTimeout(function(){
    sw.leaveRoom();
  },3000);

  sw.joinRoom('room1',join_callback);

  setTimeout(function () {
    t.deepEqual(array, ['success','success'], 'Success callback called');
    t.end();
  }, 3000);
});

test('Test leaveRoom as callback inside joinRoom', function(t){
  t.plan(1);
  var array = [];
  var leave_callback = function(error, success){
    if (error){
      array.push('leave_error');
      console.log(JSON.stringify(error));
    }
    else{
      array.push('leave_success');
    }
  }

  var join_callback = function(error, success){
    if (error){
      array.push('join_error');
    }
    else{
      array.push('join_success');
      sw.leaveRoom(leave_callback);
    }
  }

  sw.joinRoom(join_callback);

  setTimeout(function () {
    t.deepEqual(array, ['join_success','leave_success'], 'Success callback called');
    t.end();
  }, 2000);
});

})();

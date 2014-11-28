(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

sw.init(apikey);

sw.joinRoom();

sw.setUserData('user1');

test('Test sendBlobData callback', function(t){
  t.plan(1);
  var array=[];
  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);
  var file_callback = function(error, success){
    if (error){
      array.push[-1];
    }
    else{
      array.push[1];
    }
  }

  sw.sendBlobData(data,{
    name: 'Test1',
    size: data.size
  },file_callback);

  setTimeout(function () {
    t.deepEqual(array, [1], 'Success callback called');
    t.end();
  }, 8000);

});

})();

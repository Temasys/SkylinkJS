(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

sw.setLogLevel(4);

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('API: Tests the sendBlobData() transfers and dataTransferState events');
console.log('===============================================================================================');

test('Testing receiving file', function (t) {
  t.plan(2);

  var array = [];

  var data = new Blob(['<a id="a"><b id="b">PEER2</b></a>']);

  sw.on('dataChannelState', function (state) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN) {
      sw.sendP2PMessage('RECEIVE-BLOB');
      console.log('Sending "RECEIVE-BLOB"');
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    array.push(state);

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
      sw.respondBlobRequest(peerId, true);
      console.log('Received blob upload request');
    }
    if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
      console.log('Received blob download completed');
      // check if matches
      t.deepEqual(transferInfo.data, data, 'Received data is the same as sent data');
    }
  });

  setTimeout(function () {
    t.deepEqual(array, [
      sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
      sw.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
      //sw.DATA_TRANSFER_STATE.DOWNLOADING, // not huge file
      sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED
    ], 'Received data states are triggered in order');
    t.end();
  }, 8000);
});

test('Testing sending file', function (t) {
  t.plan(2);

  var array = [];

  var received = false;

  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    array.push(state);
  });

  sw.on('incomingMessage', function (message) {
    if (message.content === 'SEND-BLOB-SUCCESS') {
      received = true;
      console.log('Received "SEND-BLOB-SUCCESS"');
    }
    if (message.content === 'SEND-BLOB-FAILURE') {
      console.log('Received "SEND-BLOB-FAILURE"');
    }
  });

  sw.sendBlobData(data, {
    name: 'Test2',
    size: data.size
  });

  console.log('Sending "Test2" blob');

  setTimeout(function () {
    t.deepEqual(array, [
      sw.DATA_TRANSFER_STATE.UPLOAD_STARTED,
      sw.DATA_TRANSFER_STATE.UPLOADING,
      sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED
    ], 'Sent data states are triggered in order');

    if (received) {
      t.pass('Peer received blob sent');
    } else {
      t.fail('Peer failed receiving blob sent');
    }
    t.end();
  }, 8000);
});

sw.init(apikey);

sw.joinRoom();

})();

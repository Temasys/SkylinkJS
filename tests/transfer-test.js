(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('API: Tests the sendBlobData() transfers and dataTransferState events');
console.log('===============================================================================================');


test('Testing receiving file', function (t) {
  t.plan(3);

  var payload_array = [];
  var state_array = [];

  var expected_payload_array = [];

  var data = new Blob(['<a id="a"><b id="b">PEER2</b></a>']);

  sw.on('dataChannelState', function (state) {
    if (state === sw.DATA_CHANNEL_STATE.OPEN) {
      sw.sendP2PMessage('RECEIVE-BLOB');
      console.log('Sending "RECEIVE-BLOB"');
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    var exPercentage = 0;
    var exDataBlobInstance = false;

    state_array.push(state);

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
      sw.respondBlobRequest(peerId, true);
      console.log('Received blob upload request');
    }
    if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
      console.log('Received blob download completed');
      // check if matches
      t.deepEqual(transferInfo.data, data, 'Received data is the same as sent data');

      exDataBlobInstance = true;
      exPercentage = 100;
    }
    payload_array.push([
      typeof transferInfo.name,
      typeof transferInfo.size,
      typeof transferInfo.percentage,
      transferInfo.percentage,
      typeof transferInfo.timeout,
      typeof transferInfo.senderPeerId,
      transferInfo.senderPeerId === peerId,
      typeof transferInfo.data,
      transferInfo.data instanceof Blob
    ]);
    expected_payload_array.push([
      'string',
      'number',
      'number',
      exPercentage,
      'number',
      'string',
      true,
      'object',
      exDataBlobInstance
    ]);
  });

  setTimeout(function () {
    // states comparison
    t.deepEqual(state_array, [
      sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
      sw.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
      //sw.DATA_TRANSFER_STATE.DOWNLOADING, // not huge file
      sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED
    ], 'Received data states are triggered in order');
    // payload comparison
    t.deepEqual(payload_array, expected_payload_array,
      'Received data states payloads are given in order');
    t.end();
  }, 8000);
});

test('Testing sending file', function (t) {
  t.plan(3);

  var payload_array = [];
  var state_array = [];
  var expected_payload_array = [];

  var received = false;

  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    var exPercentage = 0;
    var exDataBlobInstance = false;

    state_array.push(state);

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_STARTED) {
      exDataBlobInstance = true;
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOADING) {
      exPercentage = transferInfo.percentage > 0 ? transferInfo.percentage : 0;
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
      exPercentage = 100;

      console.log(JSON.stringify(sw._uploadDataSessions[peerId]), JSON.stringify(transferInfo));
    }

    payload_array.push([
      typeof transferInfo.name,
      typeof transferInfo.size,
      typeof transferInfo.percentage,
      transferInfo.percentage,
      typeof transferInfo.timeout,
      typeof transferInfo.senderPeerId,
      transferInfo.senderPeerId === sw._user.sid,
      typeof transferInfo.data,
      transferInfo.data instanceof Blob
    ]);
    expected_payload_array.push([
      'string',
      'number',
      'number',
      exPercentage,
      'number',
      'string',
      true,
      'object',
      exDataBlobInstance
    ]);
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

  sw.sendBlobData(data);

  console.log('Sending "Test2" blob');

  setTimeout(function () {
    // states comparison
    t.deepEqual(state_array, [
      sw.DATA_TRANSFER_STATE.UPLOAD_STARTED,
      sw.DATA_TRANSFER_STATE.UPLOADING,
      sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED
    ], 'Received data states are triggered in order');
    // payload comparison
    t.deepEqual(payload_array, expected_payload_array,
      'Received data states payloads are given in order');

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

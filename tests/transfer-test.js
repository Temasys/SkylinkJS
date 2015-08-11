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
  t.plan(5);

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

  var expectedIncomingDataPayload = {};
  var receivedIncomingDataPayload = {};
  var expectedIncomingDataRequestPayload = {};
  var receivedIncomingDataRequestPayload = {};

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    var exPercentage = 0;
    var exDataBlobInstance = false;

    state_array.push(state);

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
      sw.respondBlobRequest(peerId, true);
      console.log('Received blob upload request');

      expectedIncomingDataRequestPayload = {
        transferId: transferId,
        peerId: peerId,
        transferInfo: {
          name: transferInfo.name,
          size: transferInfo.size,
          percentage: transferInfo.percentage,
          senderPeerId: transferInfo.senderPeerId,
          timeout: transferInfo.timeout
        },
        isSelf: false
      };
    }
    if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
      console.log('Received blob download completed');
      // check if matches
      t.deepEqual(transferInfo.data, data, 'Received data is the same as sent data');

      exDataBlobInstance = true;
      exPercentage = 100;

      expectedIncomingDataPayload = {
        transferId: transferId,
        peerId: peerId,
        data: transferInfo.data,
        transferInfo: {
          name: transferInfo.name,
          size: transferInfo.size,
          percentage: transferInfo.percentage,
          senderPeerId: transferInfo.senderPeerId,
          timeout: transferInfo.timeout
        },
        isSelf: false
      };
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

  sw.once('incomingData', function (blobData, transferId, peerId, transferInfo, isSelf) {
    receivedIncomingDataPayload = {
      transferId: transferId,
      peerId: peerId,
      data: blobData,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  sw.once('incomingDataRequest', function (transferId, peerId, transferInfo, isSelf) {
    receivedIncomingDataRequestPayload = {
      transferId: transferId,
      peerId: peerId,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
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

    t.deepEqual(receivedIncomingDataPayload, expectedIncomingDataPayload,
      'Triggers incomingData with correct payload');

    t.deepEqual(receivedIncomingDataRequestPayload, expectedIncomingDataRequestPayload,
      'Triggers incomingDataRequest with correct payload');

    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];

    t.end();

  }, 8000);
});

test('Testing sending file', function (t) {
  t.plan(5);

  var payload_array = [];
  var state_array = [];
  var expected_payload_array = [];

  var received = false;
  var expectedIncomingDataPayload = {};
  var expectedIncomingDataPayloadData = null;
  var receivedIncomingDataPayload = {};
  var expectedIncomingDataRequestPayload = {};
  var receivedIncomingDataRequestPayload = {};

  var data = new Blob(['<a id="a"><b id="b">PEER1</b></a>']);

  var expectedTransferId = null;
  var expectedPeerId = null;

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
    var exPercentage = 0;
    var exDataBlobInstance = false;

    state_array.push(state);

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_STARTED) {
      exDataBlobInstance = true;
      expectedIncomingDataPayloadData = transferInfo.data;

      expectedIncomingDataRequestPayload = {
        transferId: transferId,
        peerId: peerId,
        transferInfo: {
          name: transferInfo.name,
          size: transferInfo.size,
          percentage: transferInfo.percentage,
          senderPeerId: transferInfo.senderPeerId,
          timeout: transferInfo.timeout
        },
        isSelf: true
      };
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOADING) {
      exPercentage = transferInfo.percentage > 0 ? transferInfo.percentage : 0;
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
      exPercentage = 100;

      expectedIncomingDataPayload = {
        transferId: transferId,
        peerId: peerId,
        data: expectedIncomingDataPayloadData,
        transferInfo: {
          name: transferInfo.name,
          size: transferInfo.size,
          percentage: transferInfo.percentage,
          senderPeerId: transferInfo.senderPeerId,
          timeout: transferInfo.timeout
        },
        isSelf: true
      };
    }

    expectedTransferId = transferId;
    expectedPeerId = peerId;

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

  sw.once('incomingData', function (blobData, transferId, peerId, transferInfo, isSelf) {
    receivedIncomingDataPayload = {
      transferId: transferId,
      peerId: peerId,
      data: blobData,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  sw.once('incomingDataRequest', function (transferId, peerId, transferInfo, isSelf) {
    receivedIncomingDataRequestPayload = {
      transferId: transferId,
      peerId: peerId,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
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

    t.deepEqual(receivedIncomingDataPayload, expectedIncomingDataPayload,
      'Triggers incomingData with correct payload');

    t.deepEqual(receivedIncomingDataRequestPayload, expectedIncomingDataRequestPayload,
      'Triggers incomingDataRequest with correct payload');

    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];

    t.end();
  }, 8000);
<<<<<<< HEAD
});

test('Testing deprecated methods', function (t) {
  t.plan(6);

  t.deepEqual(typeof sw.respondBlobRequest, 'function', 'respondBlobRequest() is still a function');
  t.deepEqual(typeof sw.acceptDataTransfer, 'function', 'acceptDataTransfer() is a function');
  t.deepEqual(sw.acceptDataTransfer, sw.respondBlobRequest, 'Both respondBlobRequest() and ' +
    'acceptDataTransfer() is the same function');

  t.deepEqual(typeof sw.cancelBlobTransfer, 'function', 'cancelBlobTransfer() is still a function');
  t.deepEqual(typeof sw.cancelDataTransfer, 'function', 'cancelDataTransfer() is a function');
  t.deepEqual(sw.cancelDataTransfer, sw.cancelBlobTransfer, 'Both cancelBlobTransfer() and ' +
    'cancelDataTransfer() is the same function');

  t.end();
=======
>>>>>>> b2770cc... ESS-311 #comment Fix for firefox transfers.
});

sw.init(apikey);

sw.joinRoom();

})();

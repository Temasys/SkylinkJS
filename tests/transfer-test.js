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

  // expected peer ID to test with
  var expectedPeerId;

  // dataTransferState payload / state tests
  var transferPayloadArray = {};
  var hasFailedTransferPayload = false;

  var expectedTransferPayloadArray = {};

  // dataChannelState payload tests
  var channelPayloadArray = [];
  var expectedChannelPayloadArray = [];
  var hasFailedChannelPayload = false;

  // incomingData payload tests
  var inDataPayload = {};
  var expectedInDataPayload = {};

  // incomingDataRequest payload tests
  var inDataRequestPayload = {};
  var expectedInDataRequestPayload = {};

  // the data expected to receive
  var expectedData = (function () {
    var arrayBlob = [];
    for (var i = 0; i < 1000000; i++) {
      arrayBlob[i] = '<a id="a"><b id="b">PEER2[' + i + ']</b></a>';
    }
    return new Blob(arrayBlob);
  })();

  sw.on('dataChannelState', function (state, peerId, error, channelName, channelType) {
    var failFn = function (message) {
      if (!hasFailedChannelPayload) {
        t.fail(message + '\n' +
          JSON.stringify({
            state: state,
            peerId: peerId,
            error: error,
            channelName: channelName,
            channelType: channelType
        }));
        hasFailedChannelPayload = true;
      }
    };

    if (typeof channelName !== 'string') {
      failFn('dataChannelState has triggered a payload with invalid channelName');

    } else if (sw.DATA_CHANNEL_TYPE.MESSAGING !== channelType &&
      sw.DATA_CHANNEL_TYPE.DATA !== channelType) {
      failFn('dataChannelState has triggered an invalid payload of channelType');

    } else {
      // check if open
      if (state === sw.DATA_CHANNEL_STATE.OPEN) {
        // update the payload channels
        channelPayloadArray.push([peerId, channelType]);

        // if type is "main" or messaging channel, start tests
        if (channelType === sw.DATA_CHANNEL_TYPE.MESSAGING) {
          sw.sendP2PMessage('RECEIVE-BLOB');
          console.log('Sending "RECEIVE-BLOB"');
        }
      }
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, isSelf) {
    var failFn = function (message) {
      if (!hasFailedTransferPayload) {
        t.fail(message + '\n' +
          JSON.stringify({
            state: state,
            transferId: transferId,
            peerId: peerId,
            transferInfo: transferInfo
        }));
        hasFailedTransferPayload = true;
      }
    };

    expectedPeerId = peerId;

    if (typeof transferInfo !== 'object') {
      failFn('dataTransferState has triggered a payload with invalid transferInfo');

    } else {
      // test the typeof transferInfo data
      if (typeof transferInfo.name !== 'string') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.name');

      } else if (typeof transferInfo.size !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.size');

      } else if (typeof transferInfo.percentage !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.percentage');

      } else if (typeof transferInfo.senderPeerId !== 'string') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.senderPeerId');

      } else if (transferInfo.senderPeerId !== expectedPeerId) {
        failFn('dataTransferState has triggered a payload with wrong transferInfo.senderPeerId\n' +
          '[Expected :' + expectedPeerId + ' | Received: ' + transferInfo.senderPeerId + ']');

      } else if (typeof transferInfo.timeout !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.timeout');

      } else if (typeof transferInfo.data !== 'object') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.data');

      } else {
        transferPayloadArray[state] = {
          isDataBlob: transferInfo.data instanceof Blob,
          isDataNull: transferInfo.data === null,
          peerId: peerId,
          isPercentageZero: transferInfo.percentage === 0,
          isPercentageFull: transferInfo.percentage === 100,
          senderPeerId: transferInfo.senderPeerId
        };

        if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
          console.log('Received blob upload request');
          sw.respondBlobRequest(peerId, transferId, true);

          // set expected incomingDataRequest payload
          expectedInDataRequestPayload = {
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
          t.deepEqual(transferInfo.data, expectedData, 'Received data is the same as sent data');

          // set expected incomingData payload
          expectedInDataPayload = {
            transferId: transferId,
            peerId: peerId,
            data: expectedData,
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
      }
    }
  });

  sw.once('incomingData', function (blobData, transferId, peerId, transferInfo, isSelf) {
    inDataPayload = {
      transferId: transferId,
      peerId: peerId,
      data: blobData,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  sw.once('incomingDataRequest', function (transferId, peerId, transferInfo, isSelf) {
    inDataRequestPayload = {
      transferId: transferId,
      peerId: peerId,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  setTimeout(function () {
    // dataChannelState checking
    expectedChannelPayloadArray = [
      [expectedPeerId, sw.DATA_CHANNEL_TYPE.MESSAGING],
      [expectedPeerId, sw.DATA_CHANNEL_TYPE.DATA]
    ];

    if (!hasFailedChannelPayload) {
      t.deepEqual(channelPayloadArray, expectedChannelPayloadArray,
        'Triggers dataChannelState with correct payload and states');
    }

    // dataTransferState checking
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST] = {
      isDataBlob: false,
      isDataNull: true,
      peerId: expectedPeerId,
      isPercentageZero: true,
      isPercentageFull: false,
      senderPeerId: expectedPeerId
    };
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.DOWNLOAD_STARTED] = {
      isDataBlob: false,
      isDataNull: true,
      peerId: expectedPeerId,
      isPercentageZero: true,
      isPercentageFull: false,
      senderPeerId: expectedPeerId
    };
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.DOWNLOADING] = {
      isDataBlob: false,
      isDataNull: true,
      peerId: expectedPeerId,
      isPercentageZero: false,
      isPercentageFull: false,
      senderPeerId: expectedPeerId
    };
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED] = {
      isDataBlob: true,
      isDataNull: false,
      peerId: expectedPeerId,
      isPercentageZero: false,
      isPercentageFull: true,
      senderPeerId: expectedPeerId
    };

    if (!hasFailedTransferPayload) {
      t.deepEqual(transferPayloadArray, expectedTransferPayloadArray,
        'Triggers dataTransferState with correct payload and states');
    }

    // incomingData checking
    t.deepEqual(inDataPayload, expectedInDataPayload,
      'Triggers incomingData with correct payload');

    // incomingDataRequest checking
    t.deepEqual(inDataRequestPayload, expectedInDataRequestPayload,
      'Triggers incomingDataRequest with correct payload');

    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];

    t.end();

  }, 12000);
});


test('Testing sending file', function (t) {
  t.plan(6);

  // expected peer ID to test with
  var expectedPeerId;

  // dataTransferState payload / state tests
  var transferPayloadArray = {};
  var hasFailedTransferPayload = false;

  var expectedTransferPayloadArray = {};

  // dataChannelState payload tests
  var channelPayloadArray = [];
  var expectedChannelPayloadArray = [];
  var hasFailedChannelPayload = false;

  // incomingData payload tests
  var inDataPayload = {};
  var expectedInDataPayload = {};

  // incomingDataRequest payload tests
  var inDataRequestPayload = {};
  var expectedInDataRequestPayload = {};

  // the data expected to receive
  var expectedData = (function () {
    var arrayBlob = [];
    for (var i = 0; i < 1000000; i++) {
      arrayBlob[i] = '<a id="a"><b id="b">PEER1[' + i + ']</b></a>';
    }
    return new Blob(arrayBlob);
  })();

  sw.on('incomingMessage', function (message) {
    if (message.content === 'SEND-BLOB-SUCCESS') {
      t.pass('Peer received blob sent');
      console.log('Received "SEND-BLOB-SUCCESS"');
    }
    if (message.content === 'SEND-BLOB-FAILURE') {
      t.fail('Peer failed receiving blob sent');
      console.log('Received "SEND-BLOB-FAILURE"');
    }
  });

  sw.on('dataChannelState', function (state, peerId, error, channelName, channelType) {
    var failFn = function (message) {
      if (!hasFailedChannelPayload) {
        t.fail(message + '\n' +
          JSON.stringify({
            state: state,
            peerId: peerId,
            error: error,
            channelName: channelName,
            channelType: channelType
        }));
        hasFailedChannelPayload = true;
      }
    };

    if (typeof channelName !== 'string') {
      failFn('dataChannelState has triggered a payload with invalid channelName');

    } else if (sw.DATA_CHANNEL_TYPE.MESSAGING !== channelType &&
      sw.DATA_CHANNEL_TYPE.DATA !== channelType) {
      failFn('dataChannelState has triggered an invalid payload of channelType');

    } else {
      // check if open
      if (state === sw.DATA_CHANNEL_STATE.OPEN) {
        // update the payload channels
        channelPayloadArray.push([peerId, channelType]);

        // if type is "main" or messaging channel, start tests
        if (channelType === sw.DATA_CHANNEL_TYPE.MESSAGING) {
          sw.sendP2PMessage('RECEIVE-BLOB');
          console.log('Sending "RECEIVE-BLOB"');
        }
      }
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, isSelf) {
    var failFn = function (message) {
      if (!hasFailedTransferPayload) {
        t.fail(message + '\n' +
          JSON.stringify({
            state: state,
            transferId: transferId,
            peerId: peerId,
            transferInfo: transferInfo
        }));
        hasFailedTransferPayload = true;
      }
    };

    expectedPeerId = peerId;

    if (typeof transferInfo !== 'object') {
      failFn('dataTransferState has triggered a payload with invalid transferInfo');

    } else {
      // test the typeof transferInfo data
      if (typeof transferInfo.name !== 'string') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.name');

      } else if (typeof transferInfo.size !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.size');

      } else if (typeof transferInfo.percentage !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.percentage');

      } else if (typeof transferInfo.senderPeerId !== 'string') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.senderPeerId');

      } else if (transferInfo.senderPeerId !== sw._user.sid) {
        failFn('dataTransferState has triggered a payload with wrong transferInfo.senderPeerId\n' +
          '[Expected :' + sw._user.sid + ' | Received: ' + transferInfo.senderPeerId + ']');

      } else if (typeof transferInfo.timeout !== 'number') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.timeout');

      } else if (typeof transferInfo.data !== 'object') {
        failFn('dataTransferState has triggered a payload with invalid transferInfo.data');

      } else {
        transferPayloadArray[state] = {
          isDataBlob: transferInfo.data instanceof Blob,
          isDataNull: transferInfo.data === null,
          peerId: peerId,
          isPercentageZero: transferInfo.percentage === 0,
          isPercentageFull: transferInfo.percentage === 100,
          senderPeerId: transferInfo.senderPeerId
        };

        if (state === sw.DATA_TRANSFER_STATE.UPLOAD_STARTED) {
          console.log('Starting blob upload');

          // check if matches
          t.deepEqual(transferInfo.data, expectedData, 'Received data is the same as sent data');

          // set expected incomingDataRequest payload
          expectedInDataRequestPayload = {
            transferId: transferId,
            peerId: expectedPeerId,
            transferInfo: {
              name: transferInfo.name,
              size: transferInfo.size,
              percentage: transferInfo.percentage,
              senderPeerId: sw._user.sid,
              timeout: transferInfo.timeout
            },
            isSelf: true
          };
        }

        if (state === sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
          console.log('Sending blob upload completed');

          // set expected incomingData payload
          expectedInDataPayload = {
            transferId: transferId,
            peerId: expectedPeerId,
            data: expectedData,
            transferInfo: {
              name: transferInfo.name,
              size: transferInfo.size,
              percentage: transferInfo.percentage,
              senderPeerId: sw._user.sid,
              timeout: transferInfo.timeout
            },
            isSelf: true
          };
        }
      }
    }
  });

  sw.once('incomingData', function (blobData, transferId, peerId, transferInfo, isSelf) {
    inDataPayload = {
      transferId: transferId,
      peerId: peerId,
      data: blobData,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  sw.once('incomingDataRequest', function (transferId, peerId, transferInfo, isSelf) {
    inDataRequestPayload = {
      transferId: transferId,
      peerId: peerId,
      transferInfo: transferInfo,
      isSelf: isSelf
    };
  });

  sw.sendBlobData(expectedData);

  console.log('Sending "Test2" blob');

  setTimeout(function () {
    // dataChannelState checking
    expectedChannelPayloadArray = [
      [expectedPeerId, sw.DATA_CHANNEL_TYPE.DATA]
    ];

    if (!hasFailedChannelPayload) {
      t.deepEqual(channelPayloadArray, expectedChannelPayloadArray,
        'Triggers dataChannelState with correct payload and states');
    }

    // dataTransferState checking
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.UPLOAD_STARTED] = {
      isDataBlob: true,
      isDataNull: false,
      peerId: expectedPeerId,
      isPercentageZero: true,
      isPercentageFull: false,
      senderPeerId: sw._user.sid
    };
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.UPLOADING] = {
      isDataBlob: false,
      isDataNull: true,
      peerId: expectedPeerId,
      isPercentageZero: false,
      isPercentageFull: false,
      senderPeerId: sw._user.sid
    };
    expectedTransferPayloadArray[sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED] = {
      isDataBlob: false,
      isDataNull: true,
      peerId: expectedPeerId,
      isPercentageZero: false,
      isPercentageFull: true,
      senderPeerId: sw._user.sid
    };

    if (!hasFailedTransferPayload) {
      t.deepEqual(transferPayloadArray, expectedTransferPayloadArray,
        'Triggers dataTransferState with correct payload and states');
    }

    // incomingData checking
    t.deepEqual(inDataPayload, expectedInDataPayload,
      'Triggers incomingData with correct payload');

    // incomingDataRequest checking
    t.deepEqual(inDataRequestPayload, expectedInDataRequestPayload,
      'Triggers incomingDataRequest with correct payload');

    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];

    t.end();

  }, 12000);
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
});

sw.init(apikey, function (error, success) {
  if (success) {
    sw.joinRoom();
  }
});

})();

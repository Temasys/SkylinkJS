(function() {

'use strict';

// Dependencies
var test = require('tape');
window.io = require('socket.io-client');
window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');
window.sw = new skylink.Skylink();

// Testing attributes
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

console.log('API: Tests the sendBlobData() transfers and dataTransferState, dataChannelState, ' +
  'incomingData and incomingDataRequest events');
console.log('===============================================================================================');


// the data expected to receive
var populateExpectedData = function (codeName) {
  var arrayBlob = [];
  for (var i = 0; i < 300000; i++) {
    arrayBlob[i] = '<a id="a"><b id="b">' + codeName + '[[' + i + ']]</b></a>';
  }
  return new Blob(arrayBlob);
};


test('Testing receiving file', function (t) {
  t.plan(6);

  // expected peer ID to test with
  var expectedPeerId;

  // dataTransferState payload / state tests
  var transferPayloadArray = {};
  var hasFailedTransferPayload = false;
  var hasClosedTransferChannel = false;

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
  var expectedData = populateExpectedData('PEER2', 100000);

  sw.on('dataChannelState', function (state, peerId, error, channelName, channelType) {
    console.info('dataChannelState', state, peerId, error,
      channelName, channelType, sw._dataChannels[peerId][channelName]);
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

      if (state === sw.DATA_CHANNEL_STATE.CLOSED && channelType === sw.DATA_CHANNEL_TYPE.DATA) {
        hasClosedTransferChannel = true;
      }
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
    //console.error('dataTransferState', state, transferId, peerId, transferInfo, error);
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

    t.deepEqual(hasClosedTransferChannel, true,
      'Closes the transfer channel after download is completed');

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

  }, 10000);
});


test('Testing sending file', function (t) {
  t.plan(7);

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
  var hasClosedTransferChannel = false;

  // incomingData payload tests
  var inDataPayload = {};
  var expectedInDataPayload = {};

  // incomingDataRequest payload tests
  var inDataRequestPayload = {};
  var expectedInDataRequestPayload = {};

  // the data expected to receive
  var expectedData = populateExpectedData('PEER1', 100000);

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
    //console.info('dataChannelState', state, peerId, error, channelName, channelType);
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
      }

      if (state === sw.DATA_CHANNEL_STATE.CLOSED && channelType === sw.DATA_CHANNEL_TYPE.DATA) {
        hasClosedTransferChannel = true;
      }
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
    //console.error('dataTransferState', state, transferId, peerId, transferInfo, error);
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

          sw.sendP2PMessage({
            code: 'EXPECT-BLOB',
            transferId: transferId,
            expectSize: transferInfo.data.size
          });

          console.log('Sending "EXPECT-BLOB"', transferInfo.data, transferInfo.data.size);

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

    t.deepEqual(hasClosedTransferChannel, true,
      'Closes the transfer channel after upload is completed');

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

    sw._EVENTS.incomingMessage = [];
    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];

    t.end();

  }, 10000);
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


test('Testing simultaneous transfers', function (t) {
  t.plan(7);

  // expected peer ID interacting with
  var expectedPeerId;

  // dataChannelState payload / states
  var channelPayloadArray = [];

  // dataTransferState payload / states
  var hasCalledUploadRequest = false;

  // incomingData payload / states
  var inDataPayloadArray = [];
  var expectedInDataPayloadArray = [];
  var inDataBlobPayloadArray = [];
  var expectedInDataBlobPayloadArray = [];
  var expectedTransferSizes = {};

  // incomingDataRequest payload / states
  var inDataRequestPayloadArray = [];
  var expectedInDataRequestPayloadArray = [];

  var expectedData1 = populateExpectedData('MT1', 50000);
  var expectedData2 = populateExpectedData('MT2', 150000);
  var expectedData3 = populateExpectedData('MT3', 20000);

  sw.on('dataChannelState', function (state, peerId, error, channelName, channelType) {
    //console.info('dataChannelState', state, peerId, error, channelName, channelType);
    expectedPeerId = peerId;

    if (state === sw.DATA_CHANNEL_STATE.OPEN || state === sw.DATA_CHANNEL_STATE.CLOSED) {
      channelPayloadArray.push([state, peerId, channelName, channelType]);
    }
  });

  sw.on('incomingMessage', function (message) {
    if (message.content === 'SEND-BLOB-SUCCESS') {
      t.pass('Peer received blob sent "expectedData3"');
      console.log('Received "SEND-BLOB-SUCCESS"');
    }
    if (message.content === 'SEND-BLOB-FAILURE') {
      t.fail('Peer failed receiving blob sent "expectedData3"');
      console.log('Received "SEND-BLOB-FAILURE"');
    }
    if (message.content.code === 'EXPECT-BLOB') {
      expectedTransferSizes[message.content.transferId] = message.content.expectSize;
    }
  });

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
    //console.error('dataTransferState', state, transferId, peerId, transferInfo);
    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
      expectedInDataRequestPayloadArray.push([transferId, peerId, {
        name: transferInfo.name,
        size: transferInfo.size,
        percentage: transferInfo.percentage,
        senderPeerId: transferInfo.senderPeerId,
        timeout: transferInfo.timeout
      }, false]);
      sw.respondBlobRequest(peerId, transferId, true);
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_STARTED) {
      expectedInDataBlobPayloadArray.push([state, transferId, peerId, transferInfo.data]);

      sw.sendP2PMessage({
        code: 'EXPECT-BLOB',
        transferId: transferId,
        expectSize: transferInfo.data.size
      });

      expectedInDataRequestPayloadArray.push([transferId, peerId, {
        name: transferInfo.name,
        size: transferInfo.size,
        percentage: transferInfo.percentage,
        senderPeerId: transferInfo.senderPeerId,
        timeout: transferInfo.timeout
      }, true]);

      console.log('Sending "EXPECT-BLOB"', transferInfo.data, transferInfo.data.size);
    }

    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
      expectedInDataPayloadArray.push([transferId, peerId, {
        name: transferInfo.name,
        size: transferInfo.size,
        percentage: transferInfo.percentage,
        senderPeerId: transferInfo.senderPeerId,
        timeout: transferInfo.timeout
      }, true]);
    }

    if (state === sw.DATA_TRANSFER_STATE.DOWNLOADING) {
      if (!hasCalledUploadRequest) {
        hasCalledUploadRequest = true;
        sw.sendBlobData(expectedData3);
      }
    }

    if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
      expectedInDataBlobPayloadArray.push([state, transferId, peerId, transferInfo.data]);
      expectedInDataPayloadArray.push([transferId, peerId, {
        name: transferInfo.name,
        size: transferInfo.size,
        percentage: transferInfo.percentage,
        senderPeerId: transferInfo.senderPeerId,
        timeout: transferInfo.timeout
      }, false]);
    }
  });

  sw.on('incomingData', function (blobData, transferId, peerId, transferInfo, isSelf) {
    inDataPayloadArray.push([transferId, peerId, transferInfo, isSelf]);

    var expectedState = isSelf ? sw.DATA_TRANSFER_STATE.UPLOAD_STARTED :
      sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED;
    inDataBlobPayloadArray.push([expectedState, transferId, peerId, blobData]);

    if (!isSelf) {
      var actualTransferId = transferId.split(sw._TRANSFER_DELIMITER)[0];
      actualTransferId = actualTransferId.split(sw._user.sid + '-')[1];

      if (expectedTransferSizes[actualTransferId] === blobData.size) {
        t.pass('Received transfer "' + actualTransferId + '" blob data correctly');
      } else {
        t.fail('Received transfer "' + actualTransferId + '" blob data is not same as expected blob data');
      }
    }
  });

  sw.on('incomingDataRequest', function (transferId, peerId, transferInfo, isSelf) {
    inDataRequestPayloadArray.push([transferId, peerId, transferInfo, isSelf]);
  });

  sw.sendP2PMessage('RECEIVE-MT');

  setTimeout(function () {
    var expectedChannels = [];
    var channels = [];

    // channelPayloadArray - [ state, peerId, channelName, channelType ]
    // inDataPayloadArray - [ transferId, peerId, transferInfo, isSelf ]
    // - inDataBlobPayloadArray - [ expectedState, transferId, peerId, blobData ]
    // inDataRequestPayloadArray - [ transferId, peerId, transferInfo, isSelf ]

    for (var i = 0; i < inDataPayloadArray.length; i++) {
      var payload = inDataPayloadArray[i];
      var transferId = payload[0];
      var peerId = payload[1];

      expectedChannels[i] = {
        channelName: null,
        peerId: peerId,
        opened: true,
        closed: true
      };

      var actualTransferId = transferId;

      if (transferId.indexOf(sw._TRANSFER_DELIMITER) > -1) {
        actualTransferId = transferId.split(sw._TRANSFER_DELIMITER)[0];
        actualTransferId = actualTransferId.split(sw._user.sid + '-')[1];
      }

      for (var j = 0; j < channelPayloadArray.length; j++) {
        var chPayload = channelPayloadArray[j];
        var chState = chPayload[0];
        var chPeerId = chPayload[1];
        var channelName = chPayload[2];

        if (channelName.indexOf(actualTransferId) > -1) {
          expectedChannels[i].channelName = channelName;

          if (!channels[i]) {
            channels[i] = {
              channelName: channelName,
              peerId: chPeerId,
              opened: chState === sw.DATA_CHANNEL_STATE.OPEN,
              closed: false
            };
          } else {
            channels[i].closed = chState === sw.DATA_CHANNEL_STATE.CLOSED;
          }
        }
      }
    }

    t.deepEqual(channels, expectedChannels, 'Datachannels are opened accordingly');
    t.deepEqual(inDataPayloadArray, expectedInDataPayloadArray,
      'Incoming data payload is fired accordingly');
    t.deepEqual(inDataRequestPayloadArray, expectedInDataRequestPayloadArray,
      'Incoming data request payload is fired accordingly');
    t.deepEqual(inDataBlobPayloadArray, expectedInDataBlobPayloadArray,
      'Incoming data (blob) payload is received correctly');

    sw._EVENTS.incomingMessage = [];
    sw._EVENTS.dataTransferState = [];
    sw._EVENTS.dataChannelState = [];
    sw._EVENTS.incomingData = [];
    sw._EVENTS.incomingDataRequest = [];

    t.end();
  }, 45000);
});

test('Testing cancel transfer', function (t) {
  t.plan(2);

  var hasCancelled = false;
  var hasCancelledPeer = false;

  sw.on('incomingMessage', function (message, peerId) {
    if (message.content === 'CANCEL-BLOB') {
      hasCancelledPeer = true;
    }
  })

  sw.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
    if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
      sw.respondBlobRequest(peerId, transferId, true);
    }
    if (state === sw.DATA_TRANSFER_STATE.CANCEL) {
      hasCancelled = true;
    }

    if (state === sw.DATA_TRANSFER_STATE.DOWNLOADING) {
      sw.cancelDataTransfer(peerId, transferId);
    }
  });

  sw.sendP2PMessage('RECEIVE-BLOB');

  setTimeout(function () {
    sw._EVENTS.incomingMessage = [];
    sw._EVENTS.dataTransferState = [];
    t.deepEqual(hasCancelledPeer, true, 'Has triggered cancel state in peer\'s end');
    t.deepEqual(hasCancelled, true, 'Has triggered cancel state when transfer is cancelled');
    t.end();
  }, 10000);
});

sw.init(apikey, function (error, success) {
  if (success) {
    sw.joinRoom();
  }
});

})();

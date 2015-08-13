(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';


// the data expected to receive
var populateExpectedData = function (codeName, iterations) {
  var arrayBlob = [];
  for (var i = 0; i < iterations; i++) {
    arrayBlob[i] = '<a id="a"><b id="b">' + codeName + '[' + i + ']</b></a>';
  }
  return new Blob(arrayBlob);
};

var send = populateExpectedData('PEER2', 100000);
var receive = populateExpectedData('PEER1', 100000);
var expectedData1 = populateExpectedData('MT1', 550000);
var expectedData2 = populateExpectedData('MT2', 500000);
var expectedData3 = populateExpectedData('MT3', 150000);

// expected multi-transfers end
window.expectedTransfersSizes = {};

console.log('BOT Transfer intiailized');


sw.on('incomingMessage', function (message, peerId) {
	if (message.content === 'RECEIVE-BLOB') {

    console.log('Received "' + message.content + '" from "' + peerId + '"');

    sw._condition('dataChannelState', function () {
      sw.sendBlobData(send);
      console.log('Sending "send" blob to "' + peerId + '"');
    }, function () {
      return sw._dataChannels[peerId].main.readyState === sw.DATA_CHANNEL_STATE.OPEN;
    }, function (state, peerId, error, channelName, channelType) {
      return state === sw.DATA_CHANNEL_STATE.OPEN &&
        channelType === sw.DATA_CHANNEL_TYPE.MESSAGING;
    });
	}

  if (message.content === 'RECEIVE-MT') {
    console.log('Received "' + message.content + '" from "' + peerId + '"');

    console.log('Sending "expectedData1" blob to "' + peerId + '"');
    console.log('Sending "expectedData2" blob to "' + peerId + '"');

    sw.sendBlobData(expectedData1);
    sw.sendBlobData(expectedData2);
  }

  if (message.content.code === 'EXPECT-BLOB') {
    console.log('Received "' + message.content.code + '" from "' + peerId + '" \n' +
      'Expected size: ' + message.content.expectSize);

    expectedTransfersSizes[peerId] = expectedTransfersSizes[peerId] || {};
    expectedTransfersSizes[peerId][message.content.transferId] = message.content.expectSize;
  }
});

sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
  if (state === sw.DATA_TRANSFER_STATE.UPLOAD_STARTED) {
    sw.sendP2PMessage({
      code: 'EXPECT-BLOB',
      transferId: transferId,
      expectSize: transferInfo.data.size
    });

    console.log('Sending "EXPECT-BLOB" to "' + peerId + '"', transferInfo.data, transferInfo.data.size);
  }
  if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
    console.log('Received blob upload request "' + transferId + '" from "' + peerId + '"');
    sw.respondBlobRequest(peerId, transferId, true);
  }
  if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
    console.log('Received blob download completed for "' + transferId + '" to "' + peerId + '"');

    expectedTransfersSizes[peerId] = expectedTransfersSizes[peerId] || {};
    var actualTransferId = transferId.split(sw._TRANSFER_DELIMITER)[0];
    actualTransferId = actualTransferId.split(sw._user.sid + '-')[1];

    console.log('"' + actualTransferId + '" - Checking sizes: ' + transferInfo.data.size + ' / ' +
      expectedTransfersSizes[peerId][actualTransferId]);
    // check if matches
    if (transferInfo.data.size === expectedTransfersSizes[peerId][actualTransferId]) {
    	sw.sendP2PMessage('SEND-BLOB-SUCCESS');
      console.log('Sending "SEND-BLOB-SUCCESS" for "' + transferId + '" to "' + peerId + '"');
    } else {
    	sw.sendP2PMessage('SEND-BLOB-FAILURE');
      console.log('Sending "SEND-BLOB-FAILURE" for "' + transferId + '" to "' + peerId + '"');
    }
  }
});

sw.init(apikey);

sw.joinRoom();

})();
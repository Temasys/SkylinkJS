(function() {

'use strict';

var test = require('tape');

window.io = require('socket.io-client');

window.AdapterJS = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

// the data expected to send
var send = (function () {
  var arrayBlob = [];

  for (var i = 0; i < 1000000; i++) {
    arrayBlob[i] = '<a id="a"><b id="b">PEER2[' + i + ']</b></a>';
  }

  return new Blob(arrayBlob);

})();

var receive = (function () {
  var arrayBlob = [];

  for (var i = 0; i < 1000000; i++) {
    arrayBlob[i] = '<a id="a"><b id="b">PEER1[' + i + ']</b></a>';
  }

  return new Blob(arrayBlob);

})();

console.log('BOT Transfer intiailized');


sw.on('incomingMessage', function (message, peerId) {
	if (message.content === 'RECEIVE-BLOB') {

    console.log('Received "' + message.content + '"');

    sw._condition('dataChannelState', function () {
      sw.sendBlobData(send);
      console.log('Sending "Test1" blob');
    }, function () {
      return sw._dataChannels[peerId].main.readyState === sw.DATA_CHANNEL_STATE.OPEN;
    }, function (state, peerId, error, channelName, channelType) {
      return state === sw.DATA_CHANNEL_STATE.OPEN &&
        channelType === sw.DATA_CHANNEL_TYPE.MESSAGING;
    });
	}
});

sw.on('dataTransferState', function (state, transferId, peerId, transferInfo) {
  if (state === sw.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
    console.log('Received blob upload request');
    sw.respondBlobRequest(peerId, transferId, true);
  }
  if (state === sw.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED) {
    console.log('Received blob download completed');
    // check if matches
    if (transferInfo.data.size === receive.size) {
    	sw.sendP2PMessage('SEND-BLOB-SUCCESS');
      console.log('Sending "SEND-BLOB-SUCCESS"');
    } else {
    	sw.sendP2PMessage('SEND-BLOB-FAILURE');
      console.log('Sending "SEND-BLOB-FAILURE"');
    }
  }
});

sw.init(apikey);

sw.joinRoom();

})();
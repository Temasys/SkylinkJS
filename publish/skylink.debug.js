/*! skylinkjs - v0.5.9 - Wed May 06 2015 14:38:15 GMT+0800 (SGT) */

(function() {

'use strict';

/**
 * Please refer to the {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 * method for a guide to initializing Skylink.<br>
 * Please Note:
 * - You must subscribe Skylink events before calling
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * - You will need an API key to use Skylink, if you do not have one you can
 *   [register for a developer account](http://
 *   developer.temasys.com.sg) in the Skylink Developer Console.
 * @class Skylink
 * @constructor
 * @example
 *   // Getting started on how to use Skylink
 *   var SkylinkDemo = new Skylink();
 *   SkylinkDemo.init('apiKey', function () {
 *     SkylinkDemo.joinRoom('my_room', {
 *       userData: 'My Username',
 *       audio: true,
 *       video: true
 *     });
 *   });
 *
 *   SkylinkDemo.on('incomingStream', function (peerId, stream, peerInfo, isSelf) {
 *     if (isSelf) {
 *       attachMediaStream(document.getElementById('selfVideo'), stream);
 *     } else {
 *       var peerVideo = document.createElement('video');
 *       peerVideo.id = peerId;
 *       peerVideo.autoplay = 'autoplay';
 *       document.getElementById('peersVideo').appendChild(peerVideo);
 *       attachMediaStream(peerVideo, stream);
 *     }
 *   });
 *
 *   SkylinkDemo.on('peerLeft', function (peerId, peerInfo, isSelf) {
 *     if (isSelf) {
 *       document.getElementById('selfVideo').src = '';
 *     } else {
 *       var peerVideo = document.getElementById(peerId);
 *       document.getElementById('peersVideo').removeChild(peerVideo);
 *     }
 *   });
 * @for Skylink
 * @since 0.5.0
 */
function Skylink() {
  if (!(this instanceof Skylink)) {
    return new Skylink();
  }

  /**
   * Version of Skylink
   * @attribute VERSION
   * @type String
   * @readOnly
   * @for Skylink
   * @since 0.1.0
   */
  this.VERSION = '0.5.9';

  /**
   * Helper function to generate unique IDs for your application.
   * @method generateUUID
   * @return {String} The unique Id.
   * @for Skylink
   * @since 0.5.9
   */
  this.generateUUID  = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0; d = Math.floor(d/16); return (c=='x' ? r : (r&0x7|0x8)).toString(16); }
    );
    return uuid;
  };
}
this.Skylink = Skylink;

Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error'
};

/**
 * The flag that indicates if DataChannel should be enabled.
 * @attribute _enableDataChannel
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component DataChannel
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Stores the DataChannel received or created with peers.
 * @attribute _dataChannels
 * @param {Object} <peerId> The DataChannel associated with peer.
 * @type JSON
 * @private
 * @required
 * @component DataChannel
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = {};

/**
 * Creates and binds events to a SCTP DataChannel.
 * @method _createDataChannel
 * @param {String} peerId The peerId to tie the DataChannel to.
 * @param {Object} [dataChannel] The datachannel object received.
 * @trigger dataChannelState
 * @return {Object} New DataChannel with events.
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, dc) {
  var self = this;
  var channelName = (dc) ? dc.label : peerId;
  var pc = self._peerConnections[peerId];

  if (window.webrtcDetectedDCSupport !== 'SCTP' &&
    window.webrtcDetectedDCSupport !== 'plugin') {
    log.warn([peerId, 'RTCDataChannel', channelName, 'SCTP not supported']);
    return;
  }

  var dcHasOpened = function () {
    log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'open');
    log.log([peerId, 'RTCDataChannel', channelName, 'Binary type support ->'], dc.binaryType);
    self._dataChannels[peerId] = dc;
    self._trigger('dataChannelState', dc.readyState, peerId);
  };

  if (!dc) {
    try {
      dc = pc.createDataChannel(channelName);

      self._trigger('dataChannelState', dc.readyState, peerId);

      self._checkDataChannelReadyState(dc, dcHasOpened, self.DATA_CHANNEL_STATE.OPEN);

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName,
        'Exception occurred in datachannel:'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
      return;
    }
  } else {
    if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
      dcHasOpened();
    } else {
      dc.onopen = dcHasOpened;
    }
  }

  dc.onerror = function(error) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], error);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
  };

  dc.onclose = function() {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'closed');

    dc.hasFiredClosed = true;

    // give it some time to set the variable before actually closing and checking.
    setTimeout(function () {
      // if closes because of firefox, reopen it again
      // if it is closed because of a restart, ignore
      if (pc ? !pc.dataChannelClosed : false) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Re-opening closed datachannel in ' +
          'on-going connection']);

        self._dataChannels[peerId] = self._createDataChannel(peerId);

      } else {
        self._closeDataChannel(peerId);
        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
      }
    }, 100);
  };

  dc.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName);
  };
  return dc;
};

/**
 * Checks and triggers provided callback when the current DataChannel readyState
 * is the same as the readyState provided.
 * @method _checkDataChannelReadyState
 * @param {Object} dataChannel The DataChannel readyState to check on.
 * @param {Function} callback The callback to be fired when DataChannel readyState
 *   matches the readyState provided.
 * @param {String} readyState The DataChannel readystate to match. [Rel: DATA_CHANNEL_STATE]
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._checkDataChannelReadyState = function(dc, callback, state) {
  var self = this;
  if (!self._enableDataChannel) {
    log.debug('Datachannel not enabled. Returning callback');
    callback();
    return;
  }

  // fix for safari showing datachannel as function
  if (typeof dc !== 'object' && (window.webrtcDetectedBrowser === 'safari' ?
    typeof dc !== 'object' && typeof dc !== 'function' : true)) {
    log.error('Datachannel not provided');
    return;
  }
  if (typeof callback !== 'function'){
    log.error('Callback not provided');
    return;
  }
  if (!state){
    log.error('State undefined');
    return;
  }
  self._wait(function () {
    log.log([null, 'RTCDataChannel', dc.label, 'Firing callback. ' +
      'Datachannel state has met provided state ->'], state);
    callback();
  }, function () {
    return dc.readyState === state;
  });
};

/**
 * Sends a Message via the peer's DataChannel based on the peerId provided.
 * @method _sendDataChannelMessage
 * @param {String} peerId The peerId associated with the DataChannel to send from.
 * @param {JSON} data The Message data to send.
 * @trigger dataChannelState
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendDataChannelMessage = function(peerId, data) {
  var dc = this._dataChannels[peerId];
  if (!dc) {
    log.error([peerId, 'RTCDataChannel', null, 'Datachannel connection ' +
      'to peer does not exist']);
    return;
  } else {
    if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
      var dataString = (typeof data === 'object') ? JSON.stringify(data) : data;
      log.debug([peerId, 'RTCDataChannel', dc.label, 'Sending to peer ->'],
        (data.type || 'DATA'));
      dc.send(dataString);
    } else {
      log.error([peerId, 'RTCDataChannel', dc.label, 'Datachannel is not opened'],
        'State: ' + dc.readyState);
      this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR,
        peerId, 'Datachannel is not ready.\nState is: ' + dc.readyState);
    }
  }
};

/**
 * Closes the peer's DataChannel based on the peerId provided.
 * @method _closeDataChannel
 * @param {String} peerId The peerId associated with the DataChannel to be closed.
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId) {
  var self = this;
  var dc = self._dataChannels[peerId];
  if (dc) {
    if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      dc.close();
    } else {
      if (!dc.hasFiredClosed && window.webrtcDetectedBrowser === 'firefox') {
        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
      }
    }
    delete self._dataChannels[peerId];

    log.log([peerId, 'RTCDataChannel', dc.label, 'Sucessfully removed datachannel']);
  }
};
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * The size of a chunk that DataTransfer should chunk a Blob into specifically for Firefox
 * based browsers.
 * - Tested: Sends <code>49152</code> kb | Receives <code>16384</code> kb.
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Integer
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 16384;

/**
 * The list of DataTransfer native data types that would be transfered with.
 * - Not Implemented: <code>ARRAY_BUFFER</code>, <code>BLOB</code>.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING BinaryString data type.
 * @param {String} ARRAY_BUFFER ArrayBuffer data type.
 * @param {String} BLOB Blob data type.
 * @readOnly
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Converts a Base64 encoded string to a Blob.
 * - Not Implemented: Handling of URLEncoded DataURIs.
 * @author devnull69@stackoverflow.com #6850276
 * @method _base64ToBlob
 * @param {String} dataURL Blob base64 dataurl.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Chunks a Blob into Blob chunks based on a fixed size.
 * @method _chunkBlobData
 * @param {Blob} blob The Blob data to chunk.
 * @param {Integer} blobByteSize The original Blob data size.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, blobByteSize) {
  var chunksArray = [],
    startCount = 0,
    endCount = 0;
  if (blobByteSize > this._CHUNK_FILE_SIZE) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + this._CHUNK_FILE_SIZE;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += this._CHUNK_FILE_SIZE;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};
Skylink.prototype._DC_PROTOCOL_TYPE = {
  WRQ: 'WRQ',
  ACK: 'ACK',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  MESSAGE: 'MESSAGE'
};

/**
 * The list of DataTransfer streamming types to indicate an upload stream
 * or download stream.
 * @attribute DATA_TRANSFER_TYPE
 * @type JSON
 * @param {String} UPLOAD An upload stream.
 * @param {String} DOWNLOAD A download stream.
 * @readOnly
 * @component DataTransfer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * The list of DataTransfer states that would be triggered.
 * @attribute DATA_TRANSFER_STATE
 * @type JSON
 * @param {String} UPLOAD_REQUEST A DataTransfer request to start a transfer is received.
 * @param {String} UPLOAD_STARTED The request has been accepted and upload is starting.
 * @param {String} DOWNLOAD_STARTED The request has been accepted and download is starting.
 * @param {String} UPLOADING An ongoing upload DataTransfer is occuring.
 * @param {String} DOWNLOADING An ongoing download DataTransfer is occuring.
 * @param {String} UPLOAD_COMPLETED The upload is completed.
 * @param {String} DOWNLOAD_COMPLETED The download is completed.
 * @param {String} REJECTED A DataTransfer request is rejected by a peer.
 * @param {String} ERROR DataTransfer has waiting longer than timeout is specified.
 *   DataTransfer is aborted.
 * @readOnly
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.DATA_TRANSFER_STATE = {
  UPLOAD_REQUEST: 'request',
  UPLOAD_STARTED: 'uploadStarted',
  DOWNLOAD_STARTED: 'downloadStarted',
  REJECTED: 'rejected',
  CANCEL: 'cancel',
  ERROR: 'error',
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  UPLOAD_COMPLETED: 'uploadCompleted',
  DOWNLOAD_COMPLETED: 'downloadCompleted'
};

/**
 * Stores the list of DataTransfer uploading chunks.
 * @attribute _uploadDataTransfers
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataTransfers = {};

/**
 * Stores the list of DataTransfer uploading sessions.
 * @attribute _uploadDataSessions
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataSessions = {};

/**
 * Stores the list of DataTransfer downloading chunks.
 * @attribute _downloadDataTransfers
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataTransfers = {};

/**
 * Stores the list of DataTransfer downloading sessions.
 * @attribute _downloadDataSessions
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataSessions = {};

/**
 * Stores all the <code>setTimeout</code> objects for each
 * request received.
 * @attribute _dataTransfersTimeout
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._dataTransfersTimeout = {};

/**
 * Sets a waiting timeout for the request received from the peer. Once
 * timeout has expired, an error would be thrown.
 * @method _setDataChannelTimeout
 * @param {String} peerId The responding peerId of the peer to await for
 *   response during the DataTransfer.
 * @param {Integer} timeout The timeout to set in seconds.
 * @param {Boolean} [isSender=false] The flag to indicate if the response
 *    received is from the sender or the receiver.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._setDataChannelTimeout = function(peerId, timeout, isSender) {
  var self = this;
  if (!self._dataTransfersTimeout[peerId]) {
    self._dataTransfersTimeout[peerId] = [];
  }
  var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
    self.DATA_TRANSFER_TYPE.DOWNLOAD;
  self._dataTransfersTimeout[peerId][type] = setTimeout(function() {
    var name;
    if (self._dataTransfersTimeout[peerId][type]) {
      if (isSender) {
        name = self._uploadDataSessions[peerId].name;
        delete self._uploadDataTransfers[peerId];
        delete self._uploadDataSessions[peerId];
      } else {
        name = self._downloadDataSessions[peerId].name;
        delete self._downloadDataTransfers[peerId];
        delete self._downloadDataSessions[peerId];
      }
      self._sendDataChannelMessage(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        sender: self._user.sid,
        name: name,
        content: 'Connection Timeout. Longer than ' + timeout +
          ' seconds. Connection is abolished.',
        isUploadError: isSender
      });
      // TODO: Find a way to add channel name so it's more specific
      log.error([peerId, 'RTCDataChannel', null, 'Failed transfering data:'],
        'Transfer ' + ((isSender) ? 'for': 'from') + ' ' + peerId +
        ' failed. Connection timeout');
      self._clearDataChannelTimeout(peerId, isSender);
    }
  }, 1000 * timeout);
};

/**
 * Clears the timeout set for the DataTransfer.
 * @method _clearDataChannelTimeout
 * @param {String} peerId The responding peerId of the peer to await for
 *    response during the DataTransfer.
 * @param {Boolean} [isSender=false] The flag to indicate if the response
 *    received is from the sender or the receiver.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._clearDataChannelTimeout = function(peerId, isSender) {
  if (this._dataTransfersTimeout[peerId]) {
    var type = (isSender) ? this.DATA_TRANSFER_TYPE.UPLOAD :
      this.DATA_TRANSFER_TYPE.DOWNLOAD;
    clearTimeout(this._dataTransfersTimeout[peerId][type]);
    delete this._dataTransfersTimeout[peerId][type];
  }
};

/**
 * Initiates a DataTransfer with the peer.
 * @method _sendBlobDataToPeer
 * @param {Blob} data The Blob data to send.
 * @param {JSON} dataInfo The Blob data information.
 * @param {String} dataInfo.transferId The transferId of the DataTransfer.
 * @param {String} dataInfo.name The Blob data name.
 * @param {Integer} [dataInfo.timeout=60] The timeout set to await for response from peer.
 * @param {Integer} dataInfo.size The Blob data size.
 * @param {Boolean} data.target The real peerId to send data to, in the case where MCU is enabled.
 * @param {String} [targetPeerId] The peerId of the peer to start the DataTransfer.
 *    To start the DataTransfer to all peers, set as <code>false</code>.
 * @param {Boolean} isPrivate The flag to indicate if the DataTransfer is broadcasted to other
 *    peers or sent to the peer privately.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId, isPrivate) {
  //If there is MCU then directs all messages to MCU
  var useChannel = (this._hasMCU) ? 'MCU' : targetPeerId;
  var ongoingTransfer = null;
  var binarySize = parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
  var chunkSize = parseInt((this._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);

  if (window.webrtcDetectedBrowser === 'firefox' &&
    window.webrtcDetectedVersion < 30) {
    chunkSize = this._MOZ_CHUNK_FILE_SIZE;
  }
  log.log([targetPeerId, null, null, 'Chunk size of data:'], chunkSize);

  if (this._uploadDataSessions[targetPeerId]) {
    ongoingTransfer = this.DATA_TRANSFER_TYPE.UPLOAD;
  } else if (this._downloadDataSessions[targetPeerId]) {
    ongoingTransfer = this.DATA_TRANSFER_TYPE.DOWNLOAD;
  }

  if (ongoingTransfer) {
    log.error([targetPeerId, null, null, 'User have ongoing ' + ongoingTransfer + ' ' +
      'transfer session with peer. Unable to send data'], dataInfo);
    // data transfer state
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      dataInfo.transferId, targetPeerId, {
      name: dataInfo.name,
      message: dataInfo.content,
      transferType: ongoingTransfer
    },{
      message: 'Another transfer is ongoing. Unable to send data.',
      transferType: ongoingTransfer
    });
    return;
  }

  this._uploadDataTransfers[targetPeerId] = this._chunkBlobData(data, dataInfo.size);
  this._uploadDataSessions[targetPeerId] = {
    name: dataInfo.name,
    size: binarySize,
    transferId: dataInfo.transferId,
    timeout: dataInfo.timeout
  };
  this._sendDataChannelMessage(useChannel, {
    type: this._DC_PROTOCOL_TYPE.WRQ,
    sender: this._user.sid,
    agent: window.webrtcDetectedBrowser,
    name: dataInfo.name,
    size: binarySize,
    chunkSize: chunkSize,
    timeout: dataInfo.timeout,
    target: targetPeerId,
    isPrivate: !!isPrivate
  });
  this._setDataChannelTimeout(targetPeerId, dataInfo.timeout, true);
};

/**
 * Handles the DataTransfer protocol stage and invokes the related handler function.
 * @method _dataChannelProtocolHandler
 * @param {String|Object} data The DataTransfer data received from the DataChannel.
 * @param {String} senderPeerId The peerId of the sender.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._dataChannelProtocolHandler = function(dataString, peerId, channelName) {
  // PROTOCOL ESTABLISHMENT
  if (typeof dataString === 'string') {
    var data = {};
    try {
      data = JSON.parse(dataString);
    } catch (error) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Received from peer ->'], 'DATA');
      this._DATAProtocolHandler(peerId, dataString,
        this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, channelName);
      return;
    }
    log.debug([peerId, 'RTCDataChannel', channelName, 'Received from peer ->'], data.type);
    switch (data.type) {
    case this._DC_PROTOCOL_TYPE.WRQ:
      this._WRQProtocolHandler(peerId, data, channelName);
      break;
    case this._DC_PROTOCOL_TYPE.ACK:
      this._ACKProtocolHandler(peerId, data, channelName);
      break;
    case this._DC_PROTOCOL_TYPE.ERROR:
      this._ERRORProtocolHandler(peerId, data, channelName);
      break;
    case this._DC_PROTOCOL_TYPE.CANCEL:
      this._CANCELProtocolHandler(peerId, data, channelName);
      break;
    case this._DC_PROTOCOL_TYPE.MESSAGE: // Not considered a protocol actually?
      this._MESSAGEProtocolHandler(peerId, data, channelName);
      break;
    default:
      log.error([peerId, 'RTCDataChannel', channelName, 'Unsupported message ->'], data.type);
    }
  }
};

/**
 * Handles the WRQ request.
 * @method _WRQProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The WRQ data object.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.WRQ.data]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelName) {
  var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
  log.log([peerId, 'RTCDataChannel', [channelName, 'WRQ'],
    'Received file request from peer:'], data);
  var name = data.name;
  var binarySize = data.size;
  var expectedSize = data.chunkSize;
  var timeout = data.timeout;
  this._downloadDataSessions[peerId] = {
    transferId: transferId,
    name: name,
    size: binarySize,
    ackN: 0,
    receivedSize: 0,
    chunkSize: expectedSize,
    timeout: timeout
  };
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
    transferId, peerId, {
    name: name,
    size: binarySize,
    senderPeerId: peerId
  });
};

/**
 * Handles the ACK request.
 * @method _ACKProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ACK data object.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.ACK.data]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelName) {
  var self = this;
  var ackN = data.ackN;
  peerId = (peerId === 'MCU') ? data.sender : peerId;

  var chunksLength = self._uploadDataTransfers[peerId].length;
  var uploadedDetails = self._uploadDataSessions[peerId];
  var transferId = uploadedDetails.transferId;
  var timeout = uploadedDetails.timeout;

  self._clearDataChannelTimeout(peerId, true);
  log.log([peerId, 'RTCDataChannel', [channelName, 'ACK'], 'ACK stage ->'],
    ackN + ' / ' + chunksLength);

  if (ackN > -1) {
    // Still uploading
    if (ackN < chunksLength) {
      var fileReader = new FileReader();
      fileReader.onload = function() {
        // Load Blob as dataurl base64 string
        var base64BinaryString = fileReader.result.split(',')[1];
        self._sendDataChannelMessage(peerId, base64BinaryString);
        self._setDataChannelTimeout(peerId, timeout, true);
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING,
          transferId, peerId, {
          percentage: (((ackN + 1) / chunksLength) * 100).toFixed()
        });
      };
      fileReader.readAsDataURL(self._uploadDataTransfers[peerId][ackN]);
    } else if (ackN === chunksLength) {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, {
        name: uploadedDetails.name
      });
      delete self._uploadDataTransfers[peerId];
      delete self._uploadDataSessions[peerId];
    }
  } else {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED,
      transferId, peerId, {
        name: self._uploadDataSessions[peerId].name,
        size: self._uploadDataSessions[peerId].size
      });
    delete self._uploadDataTransfers[peerId];
    delete self._uploadDataSessions[peerId];
  }
};

/**
 * Handles the MESSAGE request.
 * @method _MESSAGEProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ACK data object.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.MESSAGE.data]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger incomingMessage
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelName) {
  var targetMid = data.sender;
  log.log([channelName, 'RTCDataChannel', [targetMid, 'MESSAGE'],
    'Received P2P message from peer:'], data);
  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: targetMid
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Handles the ERROR request.
 * @method _ERRORProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ERROR data object.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.ERROR.data]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelName) {
  var isUploader = data.isUploadError;
  var transferId = (isUploader) ? this._uploadDataSessions[peerId].transferId :
    this._downloadDataSessions[peerId].transferId;
  log.error([peerId, 'RTCDataChannel', [channelName, 'ERROR'],
    'Received an error from peer:'], data);
  this._clearDataChannelTimeout(peerId, isUploader);
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
    transferId, peerId, {}, {
    name: data.name,
    message: data.content,
    transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
      this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });
};

/**
 * Handles the CANCEL request.
 * @method _CANCELProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The CANCEL data object.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.CANCEL.data]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelName) {
  var isUpload = !!this._uploadDataSessions[peerId];
  var isDownload = !!this._downloadDataSessions[peerId];

  var transferId = (isUpload) ? this._uploadDataSessions[peerId].transferId :
    this._downloadDataSessions[peerId].transferId;

  log.log([peerId, 'RTCDataChannel', [channelName, 'CANCEL'],
    'Received file transfer cancel request:'], data);

  this._clearDataChannelTimeout(peerId, isUploader);

  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
    transferId, peerId, {}, {
    name: data.name,
    content: data.content,
    senderPeerId: data.sender,
    transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
      this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });

  try {
    if (isUpload) {
      delete this._uploadDataSessions[peerId];
      delete this._uploadDataTransfers[peerId];
    } else {
      delete this._downloadDataSessions[peerId];
      delete this._downloadDataTransfers[peerId];
    }
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL, transferId, peerId, {
      name: data.name,
      content: data.content,
      senderPeerId: data.sender,
      transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });
  } catch (error) {
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR, {}, {
      message: 'Failed cancelling data request from peer',
      transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });
  }
};

/**
 * Handles the DATA request.
 * @method _DATAProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {ArrayBuffer|Blob|String} dataString The data received.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.DATA.data]
 * @param {String} dataType The data type received from datachannel.
 *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, dataString, dataType, channelName) {
  var chunk, error = '';
  var transferStatus = this._downloadDataSessions[peerId];
  log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
    'Received data chunk from peer. Data type:'], dataType);

  var transferId = transferStatus.transferId;

  this._clearDataChannelTimeout(peerId, false);

  if (dataType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    chunk = this._base64ToBlob(dataString);
  } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    chunk = new Blob(dataString);
  } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
    chunk = dataString;
  } else {
    error = 'Unhandled data exception: ' + dataType;
    log.error([peerId, 'RTCDataChannel', [channelName, 'DATA'],
      'Failed downloading data packets:'], error);
    this._trigger('dataTransferState',
      this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, {}, {
      message: error,
      transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });
    return;
  }
  var receivedSize = (chunk.size * (4 / 3));
  log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
    'Received data chunk size:'], receivedSize);
  log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
    'Expected data chunk size:'], transferStatus.chunkSize);

  if (transferStatus.chunkSize >= receivedSize) {
    this._downloadDataTransfers[peerId].push(chunk);
    transferStatus.ackN += 1;
    transferStatus.receivedSize += receivedSize;
    var totalReceivedSize = transferStatus.receivedSize;
    var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: transferStatus.ackN
    });
    if (transferStatus.chunkSize === receivedSize) {
      log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
        'Transfer in progress']);
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOADING,
        transferId, peerId, {
        percentage: percentage
      });
      this._setDataChannelTimeout(peerId, transferStatus.timeout, false);
      this._downloadDataTransfers[peerId].info = transferStatus;
    } else {
      log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
        'Download complete']);
      var blob = new Blob(this._downloadDataTransfers[peerId]);
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
        transferId, peerId, {
        data: blob
      });
      delete this._downloadDataTransfers[peerId];
      delete this._downloadDataSessions[peerId];
    }
  } else {
    error = 'Packet not match - [Received]' + receivedSize +
      ' / [Expected]' + transferStatus.chunkSize;
    this._trigger('dataTransferState',
      this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, {}, {
      message: error,
      transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });
    log.error([peerId, 'RTCDataChannel', [channelName, 'DATA'],
      'Failed downloading data packets:'], error);
  }
};

/**
 * Starts a DataTransfer request to the peers based on the peerIds provided.
 * Peers have the option to accept or reject the receiving data.
 * DataTransfers are encrypted.
 * @method sendBlobData
 * @param {Object} data The Blob data to be sent over.
 * @param {JSON} dataInfo Information required about the data transferred
 * @param {String} dataInfo.name The request name (name of the file for example).
 * @param {Integer} [dataInfo.timeout=60] The time (in seconds) before the transfer
 * request is cancelled if not answered.
 * @param {Integer} dataInfo.size The Blob data size (in bytes).
 * @param {String} [targetPeerId] The peerId of the peer targeted to receive data.
 *   To send to all peers, leave this option blank.
 * @param {Function} [callback] The callback fired after data was uploaded.
 * @param {Object} [callback.error] The error received in the callback.
 * @param {Object} [callback.success] The result received in the callback.
 * @example
 *
 *   // Example 1: Send file to all peers connected
 *   SkylinkDemo.sendBlobData(file, 67);
 *
 *   // Example 2: Send file to individual peer
 *   SkylinkDemo.sendBlobData(blob, 87, targetPeerId);
 *
 *   // Example 3: Send file with callback
 *   SkylinkDemo.sendBlobData(data,{
 *      name: data.name,
 *      size: data.size
 *    },function(error, success){
 *     if (error){
 *       console.log('Error happened. Can not send file'));
 *     }
 *     else{
 *       console.log('Successfully uploaded file');
 *     }
 *   });
 *
 * @trigger dataTransferState
 * @since 0.5.5
 * @component DataTransfer
 * @for Skylink
 */
Skylink.prototype.sendBlobData = function(data, dataInfo, targetPeerId, callback) {
  var self = this;
  var error = '';
  //Shift parameters
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;
    targetPeerId = undefined;
  }

  // check if datachannel is enabled first or not
  if (!self._enableDataChannel) {
    error = 'Unable to send any blob data. Datachannel is disabled';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],error);
      callback(error,null);
    }
    return;
  }

  //Both data and dataInfo are required as objects
  if (arguments.length < 2 || typeof data !== 'object' || typeof dataInfo !== 'object'){
    error = 'Either data or dataInfo was not supplied.';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback with ' +
        'error -> '],error);
      callback(error,null);
    }
    return;
  }

  //Name and size and required properties of dataInfo
  if (!dataInfo.hasOwnProperty('name') || !dataInfo.hasOwnProperty('size')){
    error = 'Either name or size is missing in dataInfo';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],error);
      callback(error,null);
    }
    return;
  }

  var noOfPeersSent = 0;
  dataInfo.timeout = dataInfo.timeout || 60;
  dataInfo.transferId = self._user.sid + self.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');

  //Send file to specific peer only
  if (targetPeerId) {
    if (self._dataChannels.hasOwnProperty(targetPeerId)) {
      log.log([targetPeerId, null, null, 'Sending blob data ->'], dataInfo);

      self._sendBlobDataToPeer(data, dataInfo, targetPeerId, true);
      noOfPeersSent = 1;
    } else {
      log.error([targetPeerId, null, null, 'Datachannel does not exist']);
    }
  }
  //No peer specified --> send to all peers
    else {
    targetPeerId = self._user.sid;
    for (var peerId in self._dataChannels) {
      if (self._dataChannels.hasOwnProperty(peerId)) {
        // Binary String filesize [Formula n = 4/3]
        self._sendBlobDataToPeer(data, dataInfo, peerId);
        noOfPeersSent++;
      } else {
        log.error([peerId, null, null, 'Datachannel does not exist']);
      }
    }
  }
  if (noOfPeersSent > 0) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED,
      dataInfo.transferId, targetPeerId, {
      transferId: dataInfo.transferId,
      senderPeerId: self._user.sid,
      name: dataInfo.name,
      size: dataInfo.size,
      timeout: dataInfo.timeout || 60,
      data: data
    });
  } else {
    error = 'No available datachannels to send data.';
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
      dataInfo.transferId, targetPeerId, {}, {
      message: error,
      transferType: self.DATA_TRANSFER_TYPE.UPLOAD
    });
    log.error('Failed sending data: ', error);
    self._uploadDataTransfers = [];
    self._uploadDataSessions = [];
  }

  if (typeof callback === 'function'){
    self.once('dataTransferState',function(state, transferId, peerId, transferInfo, error){
      log.log([null, 'RTCDataChannel', null, 'Firing callback. ' +
      'Data transfer state has met provided state ->'], state);
      callback(null,{
        state: state,
        transferId: transferId,
        peerId: peerId,
        transferInfo: transferInfo
      });
    },function(state, transferId){
      return state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED &&
        transferId === dataInfo.transferId;
    },false);

    self.once('dataTransferState',function(state, transferId, peerId, transferInfo, error){
      log.log([null, 'RTCDataChannel', null, 'Firing callback. ' +
      'Data transfer state has met provided state ->'], state);
      callback({
        state: state,
        error: error
      },null);
    },function(state, transferId){
      return (state === self.DATA_TRANSFER_STATE.REJECTED ||
        state === self.DATA_TRANSFER_STATE.CANCEL ||
        state === self.DATA_TRANSFER_STATE.ERROR);
    },false);

    self.once('dataChannelState', function(state, peerId, error){
      log.log([null, 'RTCDataChannel', null, 'Firing callback. ' +
      'Data channel state has met provided state ->'], state);
      callback({
        state: state,
        peerId: peerId,
        error: error
      },null);
    },function(state, peerId, error){
      return state === self.DATA_CHANNEL_STATE.ERROR &&
        (targetPeerId ? (peerId === targetPeerId) : true);
    },false);
  }
};

/**
 * Responds to a DataTransfer request initiated by a peer.
 * @method respondBlobRequest
 * @param {String} [peerId] The peerId of the peer to respond the request to.
 * @param {Boolean} [accept=false] The flag to accept or reject the request.
 * @trigger dataTransferState
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.respondBlobRequest = function (peerId, accept) {
  if (accept) {
    log.info([peerId, null, null, 'User accepted peer\'s request']);
    this._downloadDataTransfers[peerId] = [];
    var data = this._downloadDataSessions[peerId];
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: 0,
      agent: window.webrtcDetectedBrowser
    });
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
      data.transferId, peerId, {
      name: data.name,
      size: data.size,
      senderPeerId: peerId
    });
  } else {
    log.info([peerId, null, null, 'User rejected peer\'s request']);
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: -1
    });
    delete this._downloadDataSessions[peerId];
  }
};

/**
 * Cancels or terminates an ongoing DataTransfer request.
 * @method cancelBlobTransfer
 * @param {String} [peerId] The peerId of the peer associated with the DataTransfer to cancel.
 * @param {String} [transferType] The transfer type of the request. Is it an ongoing uploading
 *    stream to reject or an downloading stream.
 *    If not transfer type is provided, it cancels all DataTransfer associated with the peer.
 *    [Rel: Skylink.DATA_TRANSFER_TYPE]
 * @trigger dataTransferState.
 * @since 0.5.7
 * @component DataTransfer
 * @for Skylink
 */
Skylink.prototype.cancelBlobTransfer = function (peerId, transferType) {
  var data;

  // cancel upload
  if (transferType === this.DATA_TRANSFER_TYPE.UPLOAD && !transferType) {
    data = this._uploadDataSessions[peerId];

    if (data) {
      delete this._uploadDataSessions[peerId];
      delete this._uploadDataTransfers[peerId];

      // send message
      this._sendDataChannelMessage(peerId, {
        type: this._DC_PROTOCOL_TYPE.CANCEL,
        sender: this._user.sid,
        name: data.name,
        content: 'Peer cancelled upload transfer'
      });
    } else {
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
        dataInfo.transferId, targetPeerId, {}, {
        name: dataInfo.name,
        message: 'Unable to cancel upload transfer. There is ' +
          'not ongoing upload sessions with the peer',
        transferType: this.DATA_TRANSFER_TYPE.UPLOAD
      });

      if (!!transferType) {
        return;
      }
    }
  }
  if (transferType === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
    data = this._downloadDataSessions[peerId];

    if (data) {
      delete this._downloadDataSessions[peerId];
      delete this._downloadDataTransfers[peerId];

      // send message
      this._sendDataChannelMessage(peerId, {
        type: this._DC_PROTOCOL_TYPE.CANCEL,
        sender: this._user.sid,
        name: data.name,
        content: 'Peer cancelled download transfer'
      });
    } else {
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
        dataInfo.transferId, targetPeerId, {}, {
        name: dataInfo.name,
        message: 'Unable to cancel download transfer. There is ' +
          'not ongoing download sessions with the peer',
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
      });
    }
  }
};

/**
 * Send a Message object via the DataChannel established with peers.
 * - Maximum size: <code>16Kb</code>
 * @method sendP2PMessage
 * @param {String|JSON} message The Message object to send.
 * @param {String} [targetPeerId] The peerId of the targeted peer to
 *   send the Message object only. To send to all peers, leave this
 *   option blank.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendP2PMessage('Hi there! This is from a DataChannel!');
 *
 *   // Example 2: Send to specific peer
 *   SkylinkDemo.sendP2PMessage('Hi there peer! This is from a DataChannel!', targetPeerId);
 * @trigger incomingMessage
 * @since 0.5.5
 * @component DataTransfer
 * @for Skylink
 */
Skylink.prototype.sendP2PMessage = function(message, targetPeerId) {
  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    log.warn('Unable to send any P2P message. Datachannel is disabled');
    return;
  }
  //targetPeerId is defined -> private message
  if (targetPeerId) {
    //If there is MCU then directs all messages to MCU
    var useChannel = (this._hasMCU) ? 'MCU' : targetPeerId;

    //send private P2P message       
    log.log([targetPeerId, null, useChannel, 'Sending private P2P message to peer']);
    this._sendDataChannelMessage(useChannel, {
      type: this._DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate: true,
      sender: this._user.sid,
      target: targetPeerId,
      data: message
    });
  }
  //targetPeerId is null or undefined -> public message
  else {
    //If has MCU, only need to send once to MCU then it will forward to all peers
    if (this._hasMCU) {
      log.log(['MCU', null, null, 'Relaying P2P message to peers']);
      this._sendDataChannelMessage('MCU', {
        type: this._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: false,
        sender: this._user.sid,
        data: message
      });
    //If no MCU -> need to send to every peers
    } else {
      // send to all datachannels
      for (var peerId in this._dataChannels){
        if (this._dataChannels.hasOwnProperty(peerId)) {
          log.log([peerId, null, null, 'Sending P2P message to peer']);

          this._sendDataChannelMessage(peerId, {
            type: this._DC_PROTOCOL_TYPE.MESSAGE,
            isPrivate: false,
            sender: this._user.sid,
            data: message
          });
        }
      }
    }
  }
  this._trigger('incomingMessage', {
    content: message,
    isPrivate: !!targetPeerId,
    targetPeerId: targetPeerId,
    isDataChannel: true,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};

Skylink.prototype._peerCandidatesQueue = {};

/**
 * Stores the list of ICE Candidates to disable ICE trickle
 * to ensure stability of ICE connection.
 * @attribute _peerIceTrickleDisabled
 * @type JSON
 * @private
 * @required
 * @since 0.5.8
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._peerIceTrickleDisabled = {};

/**
 * The list of ICE candidate generation states that would be triggered.
 * @attribute CANDIDATE_GENERATION_STATE
 * @type JSON
 * @param {String} NEW The object was just created, and no networking
 *   has occurred yet.
 * @param {String} GATHERING The ICE engine is in the process of gathering
 *   candidates for connection.
 * @param {String} COMPLETED The ICE engine has completed gathering. Events
 *   such as adding a new interface or a new TURN server will cause the
 *   state to go back to gathering.
 * @readOnly
 * @since 0.4.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * An ICE candidate has just been generated (ICE gathering) and will be sent to the peer.
 * Part of connection establishment.
 * @method _onIceCandidate
 * @param {String} targetMid The peerId of the target peer.
 * @param {Event} event This is provided directly by the peerconnection API.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onIceCandidate = function(targetMid, event) {
  if (event.candidate) {
    if (this._enableIceTrickle && !this._peerIceTrickleDisabled[targetMid]) {
      var messageCan = event.candidate.candidate.split(' ');
      var candidateType = messageCan[7];
      log.debug([targetMid, 'RTCIceCandidate', null, 'Created and sending ' +
        candidateType + ' candidate:'], event);

      this._sendChannelMessage({
        type: this._SIG_MESSAGE_TYPE.CANDIDATE,
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        mid: this._user.sid,
        target: targetMid,
        rid: this._room.id
      });
    }
  } else {
    log.debug([targetMid, 'RTCIceCandidate', null, 'End of gathering']);
    this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.COMPLETED,
      targetMid);
    // Disable Ice trickle option
    if (!this._enableIceTrickle || this._peerIceTrickleDisabled[targetMid]) {
      var sessionDescription = this._peerConnections[targetMid].localDescription;
      this._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: this._user.sid,
        agent: window.webrtcDetectedBrowser,
        target: targetMid,
        rid: this._room.id
      });
    }
  }
};

/**
 * Stores an ICE Candidate received before handshaking
 * @method _addIceCandidateToQueue
 * @param {String} targetMid The peerId of the target peer.
 * @param {Object} candidate The ICE Candidate object.
 * @private
 * @since 0.5.2
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, candidate) {
  log.debug([targetMid, null, null, 'Queued candidate to add after ' +
    'setRemoteDescription'], candidate);
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push(candidate);
};

/**
 * Handles the event when adding ICE Candidate passes.
 * @method _onAddIceCandidateSuccess
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateSuccess = function () {
  log.debug([null, 'RTCICECandidate', null,
    'Successfully added ICE candidate']);
};

/**
 * Handles the event when adding ICE Candidate fails.
 * @method _onAddIceCandidateFailure
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateFailure = function (error) {
  log.error([null, 'RTCICECandidate',
    null, 'Error'], error);
};

/**
 * Adds all stored ICE Candidates received before handshaking.
 * @method _addIceCandidateFromQueue
 * @param {String} targetMid The peerId of the target peer.
 * @private
 * @since 0.5.2
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  if(this._peerCandidatesQueue[targetMid].length > 0) {
    for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
      var candidate = this._peerCandidatesQueue[targetMid][i];
      log.debug([targetMid, null, null, 'Added queued candidate'], candidate);
      this._peerConnections[targetMid].addIceCandidate(candidate,
        this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
    }
    delete this._peerCandidatesQueue[targetMid];
  } else {
    log.log([targetMid, null, null, 'No queued candidates to add']);
  }
};
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};

/**
 * The list of TURN server transports.
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP Use only TCP transport option.
 * @param {String} UDP Use only UDP transport option.
 * @param {String} ANY Use both TCP and UDP transport option.
 * @param {String} NONE Set no transport option in TURN servers
 * @readOnly
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none'
};

/**
 * The flag that indicates if ICE trickle is enabled.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.3.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * The flag that indicates if STUN server is to be used.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component ICE
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * The flag that indicates if TURN server is to be used.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component ICE
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * The flag that indicates if SSL is used in STUN server connection.
 * @attribute _STUNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @development true
 * @unsupported true
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
//Skylink.prototype._STUNSSL = false;

/**
 * The flag that indicates if SSL is used in TURN server connection.
 * @attribute _TURNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @development true
 * @unsupported true
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
//Skylink.prototype._TURNSSL = false;

/**
 * The option of transport protocol for TURN servers.
 * @attribute _TURNTransport
 * @type String
 * @default Skylink.TURN_TRANSPORT.ANY
 * @private
 * @required
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Stores the list of ICE connection failures.
 * @attribute _ICEConnectionFailures
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._ICEConnectionFailures = {};

/**
 * Sets the STUN server specifically for Firefox ICE Connection.
 * @method _setFirefoxIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._setFirefoxIceServers = function(config) {
  if (window.webrtcDetectedType === 'moz') {
    log.log('Updating firefox Ice server configuration', config);
    // NOTE ALEX: shoul dbe given by the server
    var newIceServers = [{
      'url': 'stun:stun.services.mozilla.com'
    }];
    for (var i = 0; i < config.iceServers.length; i++) {
      var iceServer = config.iceServers[i];
      var iceServerType = iceServer.url.split(':')[0];
      if (iceServerType === 'stun') {
        if (iceServer.url.indexOf('google')) {
          continue;
        }
        iceServer.url = [iceServer.url];
        newIceServers.push(iceServer);
      } else {
        var newIceServer = {};
        newIceServer.credential = iceServer.credential;
        newIceServer.url = iceServer.url.split(':')[0];
        newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
        newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
        newIceServers.push(newIceServer);
      }
    }
    config.iceServers = newIceServers;
    log.debug('Updated firefox Ice server configuration: ', config);
  }
  return config;
};

/**
 * Sets the STUN server specially for Firefox for ICE Connection.
 * @method _setIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._setIceServers = function(config) {
  // firstly, set the STUN server specially for firefox
  config = this._setFirefoxIceServers(config);

  var newConfig = {
    iceServers: []
  };

  for (var i = 0; i < config.iceServers.length; i++) {
    var iceServer = config.iceServers[i];
    var iceServerParts = iceServer.url.split(':');
    // check for stun servers
    if (iceServerParts[0] === 'stun' || iceServerParts[0] === 'stuns') {
      if (!this._enableSTUN) {
        log.log('Removing STUN Server support');
        continue;
      } else {
        // STUNS is unsupported
        iceServerParts[0] = (this._STUNSSL) ? 'stuns' : 'stun';
      }
      iceServer.url = iceServerParts.join(':');
    }
    // check for turn servers
    if (iceServerParts[0] === 'turn' || iceServerParts[0] === 'turns') {
      if (!this._enableTURN) {
        log.log('Removing TURN Server support');
        continue;
      } else {
        iceServerParts[0] = (this._TURNSSL) ? 'turns' : 'turn';
        iceServer.url = iceServerParts.join(':');
        // check if requires SSL
        log.log('Transport option:', this._TURNTransport);
        if (this._TURNTransport !== this.TURN_TRANSPORT.ANY) {
          // this has a transport attached to it
          if (iceServer.url.indexOf('?transport=') > -1) {
            // remove transport because user does not want it
            if (this._TURNTransport === this.TURN_TRANSPORT.NONE) {
              log.log('Removing transport option');
              iceServer.url = iceServer.url.split('?')[0];
            } else {
              // UDP or TCP
              log.log('Setting transport option');
              var urlProtocolParts = iceServer.url.split('=')[1];
              urlProtocolParts = this._TURNTransport;
              iceServer.url = urlProtocolParts.join('=');
            }
          } else {
            if (this._TURNTransport !== this.TURN_TRANSPORT.NONE) {
              log.log('Setting transport option');
              // no transport here. manually add
              iceServer.url += '?transport=' + this._TURNTransport;
            }
          }
        }
      }
    }
    newConfig.iceServers.push(iceServer);
  }
  log.log('Output iceServers configuration:', newConfig.iceServers);
  return newConfig;
};
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};

/**
 * Timestamp of the moment when last restart happened.
 * @attribute _lastRestart
 * @type Object
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._lastRestart = null;

/**
 * Internal array of Peer connections.
 * @attribute _peerConnections
 * @type Object
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = [];

/**
 * Initiates a Peer connection with either a response to an answer or starts
 * a connection with an offer.
 * @method _addPeer
 * @param {String} targetMid PeerId of the peer we should connect to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @param {Integer} peerBrowser.os The peer operating system.
 * @param {Boolean} [toOffer=false] Whether we should start the O/A or wait.
 * @param {Boolean} [restartConn=false] Whether connection is restarted.
 * @param {Boolean} [receiveOnly=false] Should they only receive?
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });
  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
  }
  self._peerConnections[targetMid].receiveOnly = !!receiveOnly;
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
  // I'm the callee I need to make an offer
  if (toOffer) {
    if (self._enableDataChannel) {
      self._dataChannels[targetMid] = self._createDataChannel(targetMid);
    }
    self._doOffer(targetMid, peerBrowser);
  }

  // do a peer connection health check
  this._startPeerConnectionHealthCheck(targetMid, toOffer);
};

/**
 * Restarts a Peer connection.
 * @method _restartPeerConnection
 * @param {String} peerId PeerId of the peer to restart connection with.
 * @param {Boolean} isSelfInitiatedRestart Indicates whether the restarting action
 *   was caused by self.
 * @param {Boolean} isConnectionRestart The flag that indicates whether the restarting action
 *   is caused by connectivity issues.
 * @param {Function} [callback] The callback once restart peer connection is completed.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.8
 */
/* jshint ignore:start */
Skylink.prototype._restartPeerConnection = function (peerId, isSelfInitiatedRestart, isConnectionRestart, callback) {
/* jshint ignore:end */
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  log.log([peerId, null, null, 'Restarting a peer connection']);

  // get the value of receiveOnly
  var receiveOnly = self._peerConnections[peerId] ?
    !!self._peerConnections[peerId].receiveOnly : false;

  // close the peer connection and remove the reference
  var iceConnectionStateClosed = false;
  var peerConnectionStateClosed = false;
  var dataChannelStateClosed = !self._enableDataChannel;

  self._peerConnections[peerId].dataChannelClosed = true;

  self.once('iceConnectionState', function () {
    iceConnectionStateClosed = true;
  }, function (state, currentPeerId) {
    return state === self.ICE_CONNECTION_STATE.CLOSED && peerId === currentPeerId;
  });

  self.once('peerConnectionState', function () {
    peerConnectionStateClosed = true;
  }, function (state, currentPeerId) {
    return state === self.PEER_CONNECTION_STATE.CLOSED && peerId === currentPeerId;
  });

  delete self._peerConnectionHealth[peerId];

  self._stopPeerConnectionHealthCheck(peerId);

  if (self._peerConnections[peerId].signalingState !== 'closed') {
    self._peerConnections[peerId].close();
  }

  if (self._peerConnections[peerId].hasStream) {
    self._trigger('streamEnded', peerId, self.getPeerInfo(peerId), false);
  }

  self._wait(function () {

    log.log([peerId, null, null, 'Ice and peer connections closed']);

    delete self._peerConnections[peerId];

    log.log([peerId, null, null, 'Re-creating peer connection']);

    self._peerConnections[peerId] = self._createPeerConnection(peerId);

    // Set one second tiemout before sending the offer or the message gets received
    setTimeout(function () {
      self._peerConnections[peerId].receiveOnly = receiveOnly;

      if (!receiveOnly) {
        self._addLocalMediaStreams(peerId);
      }

      if (isSelfInitiatedRestart){
        log.log([peerId, null, null, 'Sending restart message to signaling server']);

        var lastRestart = Date.now() || function() { return +new Date(); };

        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.RESTART,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          os: window.navigator.platform,
          userInfo: self.getPeerInfo(),
          target: peerId,
          isConnectionRestart: !!isConnectionRestart,
          lastRestart: lastRestart
        });
      }

      self._trigger('peerRestart', peerId, self._peerInformations[peerId] || {}, true);

      if (typeof callback === 'function'){
        log.log('Firing callback');
        callback();
      }
    }, 1000);
  }, function () {
    return iceConnectionStateClosed && peerConnectionStateClosed;
  });
/* jshint ignore:start */
};
/* jshint ignore:end */

/**
 * Removes and closes a Peer connection.
 * @method _removePeer
 * @param {String} peerId PeerId of the peer to close connection.
 * @trigger peerLeft
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, this._peerInformations[peerId], false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
  }
  // stop any existing peer health timer
  this._stopPeerConnectionHealthCheck(peerId);

  // new flag to check if datachannels are all closed
  this._peerConnections[peerId].dataChannelClosed = true;

  // check if health timer exists
  if (typeof this._peerConnections[peerId] !== 'undefined') {
    if (this._peerConnections[peerId].signalingState !== 'closed') {
      this._peerConnections[peerId].close();
    }

    if (this._peerConnections[peerId].hasStream) {
      this._trigger('streamEnded', peerId, this.getPeerInfo(peerId), false);
    }

    delete this._peerConnections[peerId];
  }

  // check the handshake priorities and remove them accordingly
  if (typeof this._peerHSPriorities[peerId] !== 'undefined') {
    delete this._peerHSPriorities[peerId];
  }
  if (typeof this._peerInformations[peerId] !== 'undefined') {
    delete this._peerInformations[peerId];
  }
  if (typeof this._peerConnectionHealth[peerId] !== 'undefined') {
    delete this._peerConnectionHealth[peerId];
  }
  // close datachannel connection
  if (this._enableDataChannel) {
    this._closeDataChannel(peerId);
  }

  log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Creates a Peer connection to communicate with the peer whose ID is 'targetMid'.
 * All the peerconnection callbacks are set up here. This is a quite central piece.
 * @method _createPeerConnection
 * @param {String} targetMid
 * @return {Object} The created peer connection object.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid) {
  var pc, self = this;
  try {
    pc = new window.RTCPeerConnection(
      self._room.connection.peerConfig,
      self._room.connection.peerConstraints);
    log.info([targetMid, null, null, 'Created peer connection']);
    log.debug([targetMid, null, null, 'Peer connection config:'],
      self._room.connection.peerConfig);
    log.debug([targetMid, null, null, 'Peer connection constraints:'],
      self._room.connection.peerConstraints);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel) {
      self._dataChannels[targetMid] = self._createDataChannel(targetMid, dc);
    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel']);
    }
  };
  pc.onaddstream = function(event) {
    self._onRemoteStreamAdded(targetMid, event);
    pc.hasStream = true;
  };
  pc.onicecandidate = function(event) {
    log.debug([targetMid, 'RTCIceCandidate', null, 'Ice candidate generated ->'],
      event.candidate);
    self._onIceCandidate(targetMid, event);
  };
  pc.oniceconnectionstatechange = function(evt) {
    checkIceConnectionState(targetMid, pc.iceConnectionState,
      function(iceConnectionState) {
      log.debug([targetMid, 'RTCIceConnectionState', null,
        'Ice connection state changed ->'], iceConnectionState);
      self._trigger('iceConnectionState', iceConnectionState, targetMid);

      // clear all peer connection health check
      // peer connection is stable. now if there is a waiting check on it
      if (iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED &&
        pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
        log.debug([targetMid, 'PeerConnectionHealth', null,
          'Peer connection with user is stable']);
        self._peerConnectionHealth[targetMid] = true;
        self._stopPeerConnectionHealthCheck(targetMid);
      }

      if (typeof self._ICEConnectionFailures[targetMid] === 'undefined') {
        self._ICEConnectionFailures[targetMid] = 0;
      }

      if (self._ICEConnectionFailures[targetMid] > 2) {
        self._peerIceTrickleDisabled[targetMid] = true;
      }

      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        self._ICEConnectionFailures[targetMid] += 1;

        if (self._enableIceTrickle && !self._peerIceTrickleDisabled[targetMid]) {
          self._trigger('iceConnectionState',
            self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
        }
        // refresh when failed
        self._restartPeerConnection(targetMid, true, true);
      }

      /**** SJS-53: Revert of commit ******
      // resend if failed
      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        log.debug([targetMid, 'RTCIceConnectionState', null,
          'Ice connection state failed. Re-negotiating connection']);
        self._removePeer(targetMid);
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.WELCOME,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          userInfo: self.getPeerInfo(),
          target: targetMid,
          restartNego: true,
          hsPriority: -1
        });
      } *****/
    });
  };
  // pc.onremovestream = function () {
  //   self._onRemoteStreamRemoved(targetMid);
  // };
  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null,
      'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);

    // clear all peer connection health check
    // peer connection is stable. now if there is a waiting check on it
    if ((pc.iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED ||
      pc.iceConnectionState === self.ICE_CONNECTION_STATE.CONNECTED) &&
      pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
      log.debug([targetMid, 'PeerConnectionHealth', null,
        'Peer connection with user is stable']);
      self._peerConnectionHealth[targetMid] = true;
      self._stopPeerConnectionHealthCheck(targetMid);
    }
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null,
      'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };
  return pc;
};

/**
 * Refreshes a Peer connection with a connected peer.
 * If there are more than 1 refresh during 5 seconds
 *   or refresh is less than 3 seconds since the last refresh
 *   initiated by the other peer, it will be aborted.
 * @method refreshConnection
 * @param {String} [peerId] The peerId of the peer to refresh the connection.
 * @example
 *   SkylinkDemo.on('iceConnectionState', function (state, peerId)) {
 *     if (iceConnectionState === SkylinkDemo.ICE_CONNECTION_STATE.FAILED) {
 *       // Do a refresh
 *       SkylinkDemo.refreshConnection(peerId);
 *     }
 *   });
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(peerId) {
  var self = this;

  if (self._hasMCU) {
    log.warn([peerId, 'PeerConnection', null, 'Restart functionality for peer\'s connection ' +
      'for MCU is not yet supported']);
    return;
  }

  var refreshSinglePeer = function(peer){
    var fn = function () {
      if (!self._peerConnections[peer]) {
        log.error([peer, null, null, 'There is currently no existing peer connection made ' +
          'with the peer. Unable to restart connection']);
        return;
      }

      var now = Date.now() || function() { return +new Date(); };

      if (now - self.lastRestart < 3000) {
        log.error([peer, null, null, 'Last restart was so tight. Aborting.']);
        return;
      }
      // do a hard reset on variable object
      self._restartPeerConnection(peer, true);
    };
    fn();
  };

  var toRefresh = function(){
    if (typeof peerId !== 'string') {
      for (var key in self._peerConnections) {
        if (self._peerConnections.hasOwnProperty(key)) {
          refreshSinglePeer(key);
        }
      }
    } else {
      refreshSinglePeer(peerId);
    }
  };

  self._throttle(toRefresh,5000)();

};

Skylink.prototype._peerInformations = [];

/**
 * Stores the User information, credential and the local stream(s).
 * @attribute _user
 * @type JSON
 * @param {String} uid The user's session id.
 * @param {String} sid The user's secret id. This is the id used as the peerId.
 * @param {String} timestamp The user's timestamp.
 * @param {String} token The user's access token.
 * @required
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._user = null;

/**
 * User's custom data set.
 * @attribute _userData
 * @type JSON|String
 * @required
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._userData = '';

/**
 * Update/Set the User custom data. This Data can be a simple string or a JSON data.
 * It is let to user choice to decide how this information must be handled.
 * The Skylink demos provided use this parameter as a string for displaying user name.
 * - Please note that the custom data would be totally overwritten.
 * - If you want to modify only some data, please call
 *   {{#crossLink "Skylink/getUserData:method"}}getUserData(){{/crossLink}}
 *   and then modify the information you want individually.
 * - {{#crossLink "Skylink/peerUpdated:event"}}peerUpdated{{/crossLink}}
 *   event fires only if <b>setUserData()</b> is called after
 *   joining a room.
 * @method setUserData
 * @param {JSON|String} userData User custom data.
 * @example
 *   // Example 1: Intial way of setting data before user joins the room
 *   SkylinkDemo.setUserData({
 *     displayName: 'Bobby Rays',
 *     fbUserId: '1234'
 *   });
 *
 *  // Example 2: Way of setting data after user joins the room
 *   var userData = SkylinkDemo.getUserData();
 *   userData.displayName = 'New Name';
 *   userData.fbUserId = '1234';
 *   SkylinkDemo.setUserData(userData);
 * @trigger peerUpdated
 * @component User
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  // NOTE ALEX: be smarter and copy fields and only if different
  self._parseUserData(userData);

  if (self._inRoom) {
    log.log('Updated userData -> ', userData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: self._userData
    });
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  } else {
    log.warn('User is not in the room. Broadcast of updated information will be dropped');
  }
};

/**
 * Gets the User custom data.
 * See {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @method getUserData
 * @return {JSON|String} User custom data.
 * @example
 *   // Example 1: To get other peer's userData
 *   var peerData = SkylinkDemo.getUserData(peerId);
 *
 *   // Example 2: To get own userData
 *   var userData = SkylinkDemo.getUserData();
 * @component User
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.getUserData = function(peerId) {
  if (peerId && peerId !== this._user.sid) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo.userData;
    }

    return null;
  }
  return this._userData;
};

/**
 * Gets the Peer information (media settings,media status and personnal data set by the peer).
 * @method _parseUserData
 * @param {JSON} [userData] User custom data.
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._parseUserData = function(userData) {
  log.debug('Parsing user data:', userData);

  this._userData = userData || '';
};

/**
 * Gets the Peer information.
 * - If there is no information related to the peer, <code>null</code> would be returned.
 * @method getPeerInfo
 * @param {String} [peerId] The peerId of the peer retrieve we want to retrieve the information.
 *    Leave this blank to return the User information.
 * @return {JSON} Peer information. Please reference
 *   {{#crossLink "Skylink/peerJoined:event"}}peerJoined{{/crossLink}}
 *   <code>peerInfo</code> parameter.
 * @example
 *   // Example 1: To get other peer's information
 *   var peerInfo = SkylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: To get own information
 *   var userInfo = SkylinkDemo.getPeerInfo();
 * @component Peer
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  if (peerId && peerId !== this._user.sid) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo;
    }

    return null;
  } else {
    // user info
    // prevent undefined error
    this._user = this._user || {};
    this._userData = this._userData || '';

    this._mediaStreamsStatus = this._mediaStreamsStatus || {};
    this._streamSettings = this._streamSettings || {};

    return {
      userData: this._userData,
      settings: this._streamSettings,
      mediaStatus: this._mediaStreamsStatus,
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion
      }
    };
  }
};

Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * Stores the list of <code>setTimeout</code> awaiting for successful connection.
 * @attribute _peerConnectionHealthTimers
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = {};

/**
 * Stores the list of stable Peer connection.
 * @attribute _peerConnectionHealth
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = {};

/**
 * Stores the list of handshaking weights received that would be compared against
 * to indicate if User should send an "offer" or Peer should.
 * @attribute _peerHSPriorities
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerHSPriorities = {};

/**
 * Creates an offer to Peer to initate Peer connection.
 * @method _doOffer
 * @param {String} targetMid PeerId of the peer to send offer to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @param {Integer} peerBrowser.os The peer browser operating system.
 * @private
 * @for Skylink
 * @component Peer
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);
  log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);
  // NOTE ALEX: handle the pc = 0 case, just to be sure
  var inputConstraints = self._room.connection.offerConstraints;
  var sc = self._room.connection.sdpConstraints;
  for (var name in sc.mandatory) {
    if (sc.mandatory.hasOwnProperty(name)) {
      inputConstraints.mandatory[name] = sc.mandatory[name];
    }
  }
  inputConstraints.optional.concat(sc.optional);
  checkMediaDataChannelSettings(peerBrowser.agent, peerBrowser.version,
    function(beOfferer, unifiedOfferConstraints) {
    // attempt to force make firefox not to offer datachannel.
    // we will not be using datachannel in MCU
    if (window.webrtcDetectedType === 'moz' && peerBrowser.agent === 'MCU') {
      unifiedOfferConstraints.mandatory = unifiedOfferConstraints.mandatory || {};
      unifiedOfferConstraints.mandatory.MozDontOfferDataChannel = true;
      beOfferer = true;
    }

    // for windows firefox to mac chrome interopability
    if (window.webrtcDetectedBrowser === 'firefox' &&
      window.navigator.platform.indexOf('Win') === 0 &&
      peerBrowser.agent !== 'firefox' &&
      peerBrowser.os.indexOf('Mac') === 0) {
      beOfferer = false;
    }

    if (beOfferer) {
      if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion >= 32) {
        unifiedOfferConstraints = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };
      }

      log.debug([targetMid, null, null, 'Creating offer with config:'], unifiedOfferConstraints);

      pc.createOffer(function(offer) {
        log.debug([targetMid, null, null, 'Created offer'], offer);
        self._setLocalAndSendMessage(targetMid, offer);
      }, function(error) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR,
          targetMid, error);
        log.error([targetMid, null, null, 'Failed creating an offer:'], error);
      }, unifiedOfferConstraints);
    } else {
      log.debug([targetMid, null, null, 'User\'s browser is not eligible to create ' +
        'the offer to the other peer. Requesting other peer to create the offer instead'
        ], peerBrowser);
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.WELCOME,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self.getPeerInfo(),
        target: targetMid,
        weight: -1
      });
    }
  }, inputConstraints);
};

/**
 * Creates an answer to Peer as a response to Peer's offer.
 * @method _doAnswer
 * @param {String} targetMid PeerId of the peer to send answer to.
 * @private
 * @for Skylink
 * @component Peer
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];
  if (pc) {
    pc.createAnswer(function(answer) {
      log.debug([targetMid, null, null, 'Created answer'], answer);
      self._setLocalAndSendMessage(targetMid, answer);
    }, function(error) {
      log.error([targetMid, null, null, 'Failed creating an answer:'], error);
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    }, self._room.connection.sdpConstraints);
  } else {
    /* Houston ..*/
    log.error([targetMid, null, null, 'Requested to create an answer but user ' +
      'does not have any existing connection to peer']);
    return;
  }
};

/**
 * Starts a Peer connection health check.
 * The health timers waits for connection, and within 1m if there is not connection,
 * it attempts a reconnection.
 * @method _startPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to set a connection timeout if connection failed.
 * @param {Boolean} toOffer The flag to check if peer is offerer. If the peer is offerer,
 *   the restart check should be increased.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId, toOffer) {
  var self = this;

  if (self._hasMCU) {
    log.warn([peerId, 'PeerConnectionHealth', null, 'Check for peer\'s connection health ' +
      'for MCU is not yet supported']);
    return;
  }

  var timer = (self._enableIceTrickle && !self._peerIceTrickleDisabled[peerId]) ?
    (toOffer ? 12500 : 10000) : 50000;
  //timer = (self._hasMCU) ? 85000 : timer;

  log.log([peerId, 'PeerConnectionHealth', null,
    'Initializing check for peer\'s connection health']);

  if (self._peerConnectionHealthTimers[peerId]) {
    // might be a re-handshake again
    self._stopPeerConnectionHealthCheck(peerId);
  }

  self._peerConnectionHealthTimers[peerId] = setTimeout(function () {
    // re-handshaking should start here.
    if (!self._peerConnectionHealth[peerId]) {
      log.warn([peerId, 'PeerConnectionHealth', null, 'Peer\'s health timer ' +
      'has expired'], 10000);

      // clear the loop first
      self._stopPeerConnectionHealthCheck(peerId);

      log.debug([peerId, 'PeerConnectionHealth', null,
        'Ice connection state time out. Re-negotiating connection']);

      // do a complete clean
      self._restartPeerConnection(peerId, true, true);
    }
  }, timer);
};

/**
 * Stops a Peer connection health check.
 * @method _stopPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to clear the checking.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._stopPeerConnectionHealthCheck = function (peerId) {
  var self = this;

  if (self._peerConnectionHealthTimers[peerId]) {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Stopping peer connection health timer check']);

    clearTimeout(self._peerConnectionHealthTimers[peerId]);
    delete self._peerConnectionHealthTimers[peerId];

  } else {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Peer connection health does not have a timer check']);
  }
};

/**
 * Sets a generated session description and sends to Peer.
 * @method _setLocalAndSendMessage
 * @param {String} targetMid PeerId of the peer to send offer/answer to.
 * @param {JSON} sessionDescription This should be provided by the peerconnection API.
 *   User might 'tamper' with it, but then , the setLocal may fail.
 * @trigger handshakeProgress
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && pc.setAnswer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local answer'], sessionDescription);
    return;
  }
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && pc.setOffer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local offer'], sessionDescription);
    return;
  }

  // NOTE ALEX: handle the pc = 0 case, just to be sure
  var sdpLines = sessionDescription.sdp.split('\r\n');

  // remove h264 invalid pref
  sdpLines = self._removeSDPFirefoxH264Pref(sdpLines);
  // Check if stereo was enabled
  if (self._streamSettings.hasOwnProperty('audio')) {
    if (self._streamSettings.audio.stereo) {
      self._addSDPStereo(sdpLines);
    }
  }

  log.info([targetMid, null, null, 'Requested stereo:'], (self._streamSettings.audio ?
    (self._streamSettings.audio.stereo ? self._streamSettings.audio.stereo : false) :
    false));

  // set sdp bitrate
  if (self._streamSettings.hasOwnProperty('bandwidth')) {
    var peerSettings = (self._peerInformations[targetMid] || {}).settings || {};

    sdpLines = self._setSDPBitrate(sdpLines, peerSettings);
  }

  // set sdp resolution
  /*if (self._streamSettings.hasOwnProperty('video')) {
    sdpLines = self._setSDPVideoResolution(sdpLines, self._streamSettings.video);
  }*/

  self._streamSettings.bandwidth = self._streamSettings.bandwidth || {};

  self._streamSettings.video = self._streamSettings.video || false;

  log.info([targetMid, null, null, 'Custom bandwidth settings:'], {
    audio: (self._streamSettings.bandwidth.audio || 'Not set') + ' kB/s',
    video: (self._streamSettings.bandwidth.video || 'Not set') + ' kB/s',
    data: (self._streamSettings.bandwidth.data || 'Not set') + ' kB/s'
  });

  if (self._streamSettings.video.hasOwnProperty('frameRate') &&
    self._streamSettings.video.hasOwnProperty('resolution')){
    log.info([targetMid, null, null, 'Custom resolution settings:'], {
      frameRate: (self._streamSettings.video.frameRate || 'Not set') + ' fps',
      width: (self._streamSettings.video.resolution.width || 'Not set') + ' px',
      height: (self._streamSettings.video.resolution.height || 'Not set') + ' px'
    });
  }

  // set video codec
  sdpLines = self._setSDPVideoCodec(sdpLines);

  // set audio codec
  sdpLines = self._setSDPAudioCodec(sdpLines);

  sessionDescription.sdp = sdpLines.join('\r\n');

  // NOTE ALEX: opus should not be used for mobile
  // Set Opus as the preferred codec in SDP if Opus is present.
  //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  // limit bandwidth
  //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);
  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Updated session description:'], sessionDescription);

  pc.setLocalDescription(sessionDescription, function() {
    log.debug([targetMid, sessionDescription.type, 'Local description set']);
    self._trigger('handshakeProgress', sessionDescription.type, targetMid);
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }
    if (self._enableIceTrickle && !self._peerIceTrickleDisabled[targetMid]) {
      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: self._user.sid,
        target: targetMid,
        rid: self._room.id
      });
    } else {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Waiting for Ice gathering to complete to prevent Ice trickle']);
    }
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Failed setting local description: '], error);
  });
};
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * The list of signaling actions to be taken upon received.
 * @attribute SYSTEM_ACTION_REASON
 * @type JSON
 * @param {String} FAST_MESSAGE User is not alowed to
 *   send too quick messages as it is used to prevent jam.
 * @param {String} ROOM_LOCKED Room is locked and User is rejected from joining the Room.
 * @param {String} ROOM_FULL The target Peers in a persistent room is full.
 * @param {String} DUPLICATED_LOGIN The User is re-attempting to connect again with
 *   an userId that has been used.
 * @param {String} SERVER_ERROR Server has an error.
 * @param {String} VERIFICATION Verification is incomplete for roomId provided.
 * @param {String} EXPIRED Persistent meeting. Room has
 *   expired and user is unable to join the room.
 * @param {String} ROOM_CLOSED The persistent room is closed as it has been expired.
 * @param {String} ROOM_CLOSING The persistent room is closing.
 * @param {String} OVER_SEAT_LIMIT The seat limit has been reached.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  FAST_MESSAGE: 'fastmsg',
  ROOM_LOCKED: 'locked',
  ROOM_FULL: 'roomfull',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  SERVER_ERROR: 'serverError',
  VERIFICATION: 'verification',
  EXPIRED: 'expired',
  ROOM_CLOSED: 'roomclose',
  ROOM_CLOSING: 'toclose',
  OVER_SEAT_LIMIT: 'seatquota'
};

/**
 * The room that the user is currently connected to.
 * @attribute _selectedRoom
 * @type String
 * @default Skylink._defaultRoom
 * @private
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * The flag that indicates whether room is currently locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * Connects the User to a Room.
 * @method joinRoom
 * @param {String} [room=init.options.defaultRoom] Room name to join.
 *   If Room name is not provided, User would join the default room.
 * @param {JSON} [options] Media Constraints
 * @param {JSON|String} [options.userData] User custom data. See
 * {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @param {Boolean|JSON} [options.audio=false] Enable audio stream.
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] Enable video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate]
 *   The video stream frameRate.
 * @param {Boolean} [options.video.mute=false] If audio stream should be muted.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio=50] Audio stream bandwidth in kbps.
 * @param {Integer} [options.bandwidth.video=256] Video stream bandwidth in kbps.
 * @param {Integer} [options.bandwidth.data=1638400] Data stream bandwidth in kbps.
 * @param {Boolean} [options.manualGetUserMedia] Get the user media manually.
 * @param {Function} [callback] The callback fired after peer leaves the room.
 *   Default signature: function(error object, success object)
 * @example
 *   // To just join the default room without any video or audio
 *   // Note that calling joinRoom without any parameters
 *   // still sends any available existing MediaStreams allowed.
 *   // See Examples 2, 3, 4 and 5 etc to prevent video or audio stream
 *   SkylinkDemo.joinRoom();
 *
 *   // To just join the default room with bandwidth settings
 *   SkylinkDemo.joinRoom({
 *     'bandwidth': {
 *       'data': 14440
 *     }
 *   });
 *
 *   // Example 1: To call getUserMedia and joinRoom seperately
 *   SkylinkDemo.getUserMedia();
 *   SkylinkDemo.on('mediaAccessSuccess', function (stream)) {
 *     attachMediaStream($('.localVideo')[0], stream);
 *     SkylinkDemo.joinRoom();
 *   });
 *
 *   // Example 2: Join a room without any video or audio
 *   SkylinkDemo.joinRoom('room');
 *
 *   // Example 3: Join a room with audio only
 *   SkylinkDemo.joinRoom('room', {
 *     'audio' : true,
 *     'video' : false
 *   });
 *
 *   // Example 4: Join a room with prefixed video width and height settings
 *   SkylinkDemo.joinRoom('room', {
 *     'audio' : true,
 *     'video' : {
 *       'resolution' : {
 *         'width' : 640,
 *         'height' : 320
 *       }
 *     }
 *   });
 *
 *   // Example 5: Join a room with userData and settings with audio, video
 *   // and bandwidth
 *   SkylinkDemo.joinRoom({
 *     'userData': {
 *       'item1': 'My custom data',
 *       'item2': 'Put whatever, string or JSON or array'
 *     },
 *     'audio' : {
 *        'stereo' : true
 *      },
 *     'video' : {
 *        'res' : SkylinkDemo.VIDEO_RESOLUTION.VGA,
 *        'frameRate' : 50
 *     },
 *     'bandwidth' : {
 *        'audio' : 48,
 *        'video' : 256,
 *        'data' : 14480
 *      }
 *   });
 *
 *   //Example 6: joinRoom with callback
 *   SkylinkDemo.joinRoom(function(error, success){
 *     if (error){
 *       console.log('Error happened. Can not join room'));
 *     }
 *     else{
 *       console.log('Successfully joined room');
 *     }
 *   });
 * @trigger peerJoined, mediaAccessRequired
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, mediaOptions, callback) {
  var self = this;

  if (typeof room === 'string'){
    //joinRoom(room, callback)
    if (typeof mediaOptions === 'function'){
      callback = mediaOptions;
      mediaOptions = undefined;
    }
  }
  else if (typeof room === 'object'){
    //joinRoom(mediaOptions, callback);
    if (typeof mediaOptions === 'function'){
      callback = mediaOptions;
      mediaOptions = room;
      room = undefined;
    }
    //joinRoom(mediaOptions);
    else{
      mediaOptions = room;
    }
  }
  else if (typeof room === 'function'){
    //joinRoom(callback);
    callback = room;
    room = undefined;
    mediaOptions = undefined;
  }
  //if none of the above is true --> joinRoom()

  if (self._channelOpen) {
    self.leaveRoom(function(){
      log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'], mediaOptions);
      if (typeof room === 'string' ? room !== self._selectedRoom : false) {
        self._initSelectedRoom(room, function () {
          self._waitForOpenChannel(mediaOptions);
        });
      } else {
        self._waitForOpenChannel(mediaOptions);
      }
    });

    if (typeof callback === 'function'){
      self.once('peerJoined',function(peerId, peerInfo, isSelf){
        log.log([null, 'Socket', self._selectedRoom, 'Peer joined. Firing callback. ' +
        'PeerId ->'], peerId);
        callback(null,{
          room: self._selectedRoom,
          peerId: peerId,
          peerInfo: peerInfo
        });
      },function(peerId, peerInfo, isSelf){
        return isSelf;
      }, false);
    }

    return;
  }
  log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
    mediaOptions);

  if (typeof room === 'string' ? room !== self._selectedRoom : false) {

    self._initSelectedRoom(room, function () {
      self._waitForOpenChannel(mediaOptions);
    });
  } else {
    self._waitForOpenChannel(mediaOptions);
  }

  if (typeof callback === 'function'){
    self.once('peerJoined',function(peerId, peerInfo, isSelf){
      log.log([null, 'Socket', self._selectedRoom, 'Peer joined. Firing callback. ' +
      'PeerId ->'], peerId);
      callback(null,{
        room: self._selectedRoom,
        peerId: peerId,
        peerInfo: peerInfo
      });
    },function(peerId, peerInfo, isSelf){
      return isSelf;
    }, false);
  }
};
/**
 * Waits for room to ready, before starting the Room connection.
 * @method _waitForOpenChannel
 * @private
 * @param {JSON} [options] Media Constraints.
 * @param {JSON|String} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio stream.
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
 *   The video stream maximum frameRate.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio] Audio stream bandwidth in kbps.
 *   Recommended: 50 kbps.
 * @param {Integer} [options.bandwidth.video] Video stream bandwidth in kbps.
 *   Recommended: 256 kbps.
 * @param {Integer} [options.bandwidth.data] Data stream bandwidth in kbps.
 *   Recommended: 1638400 kbps.
 * @trigger peerJoined, incomingStream, mediaAccessRequired
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function () {
    self._condition('channelOpen', function () {
      mediaOptions = mediaOptions || {};

      // parse user data settings
      self._parseUserData(mediaOptions.userData || self._userData);
      self._parseBandwidthSettings(mediaOptions.bandwidth);

      // wait for local mediastream
      self._waitForLocalMediaStream(function() {
        // once mediastream is loaded, send channel message
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
          uid: self._user.uid,
          cid: self._key,
          rid: self._room.id,
          userCred: self._user.token,
          timeStamp: self._user.timeStamp,
          apiOwner: self._apiKeyOwner,
          roomCred: self._room.token,
          start: self._room.startDateTime,
          len: self._room.duration
        });
      }, mediaOptions);
    }, function () {
      // open channel first if it's not opened
      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function (state) {
      return true;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });

};

/**
 * Disconnects a User from the room.
 * @method leaveRoom
 * @param {Function} [callback] The callback fired after peer leaves the room.
 *   Default signature: function(error object, success object)
 * @example
 *   //Example 1: Just leaveRoom
 *   SkylinkDemo.leaveRoom();
 *
 *   //Example 2: leaveRoom with callback
 *   SkylinkDemo.leaveRoom(function(error, success){
 *     if (error){
 *       console.log('Error happened'));
 *     }
 *     else{
 *       console.log('Successfully left room');
 *     }
 *   });
 * @trigger peerLeft, channelClose, streamEnded
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(callback) {
  var self = this;
  if (!self._inRoom) {
    var error = 'Unable to leave room as user is not in any room';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. '+
        'Firing callback with error -> '],error);
      callback(error,null);
    }
    return;
  }
  for (var pc_index in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(pc_index)) {
      self._removePeer(pc_index);
    }
  }
  self._inRoom = false;
  self._closeChannel();
  self.stopStream();

  self._wait(function(){
    if (typeof callback === 'function'){
      callback(null, {
        peerId: self._user.sid,
        previousRoom: self._selectedRoom,
        inRoom: self._inRoom
      });
    }
    log.log([null, 'Socket', self._selectedRoom, 'User left the room. Callback fired.']);
    self._trigger('peerLeft', self._user.sid, self.getPeerInfo(), true);

  }, function(){
    return (Object.keys(self._peerConnections).length === 0 &&
      self._channelOpen === false &&
      self._readyState === self.READY_STATE_CHANGE.COMPLETED);
  }, false);
};

/**
 * Locks the room to prevent other Peers from joining the room.
 * @method lockRoom
 * @example
 *   SkylinkDemo.lockRoom();
 * @trigger lockRoom
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.lockRoom = function() {
  log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
  this._trigger('roomLock', true, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * Unlocks the room to allow other Peers to join the room.
 * @method unlockRoom
 * @example
 *   SkylinkDemo.unlockRoom();
 * @trigger lockRoom
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.unlockRoom = function() {
  log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._trigger('roomLock', false, this._user.sid,
    this.getPeerInfo(), true);
};
Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};

/**
 * The list of ready state change errors.
 * - These are the error states from the error object error code.
 * - <b>ROOM_LOCKED</b> is deprecated in 0.5.2. Please use
 *   {{#crossLink "Skylink/:attr"}}leaveRoom(){{/crossLink}}
 * - The states that would occur are:
 * @attribute READY_STATE_CHANGE_ERROR
 * @type JSON
 * @param {Integer} API_INVALID  Api Key provided does not exist.
 * @param {Integer} API_DOMAIN_NOT_MATCH Api Key used in domain does
 *   not match.
 * @param {Integer} API_CORS_DOMAIN_NOT_MATCH Api Key used in CORS
 *   domain does not match.
 * @param {Integer} API_CREDENTIALS_INVALID Api Key credentials does
 *   not exist.
 * @param {Integer} API_CREDENTIALS_NOT_MATCH Api Key credentials does not
 *   match what is expected.
 * @param {Integer} API_INVALID_PARENT_KEY Api Key does not have a parent
 *   key nor is a root key.
 * @param {Integer} API_NOT_ENOUGH_CREDIT Api Key does not have enough
 *   credits to use.
 * @param {Integer} API_NOT_ENOUGH_PREPAID_CREDIT Api Key does not have
 *   enough prepaid credits to use.
 * @param {Integer} API_FAILED_FINDING_PREPAID_CREDIT Api Key preapid
 *   payments does not exist.
 * @param {Integer} API_NO_MEETING_RECORD_FOUND Api Key does not have a
 *   meeting record at this timing. This occurs when Api Key is a
 *   static one.
 * @param {Integer} ROOM_LOCKED Room is locked.
 * @param {Integer} NO_SOCKET_IO No socket.io dependency is loaded to use.
 * @param {Integer} NO_XMLHTTPREQUEST_SUPPORT Browser does not support
 *   XMLHttpRequest to use.
 * @param {Integer} NO_WEBRTC_SUPPORT Browser does not have WebRTC support.
 * @param {Integer} NO_PATH No path is loaded yet.
 * @param {Integer} INVALID_XMLHTTPREQUEST_STATUS Invalid XMLHttpRequest
 *   when retrieving information.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.READY_STATE_CHANGE_ERROR = {
  API_INVALID: 4001,
  API_DOMAIN_NOT_MATCH: 4002,
  API_CORS_DOMAIN_NOT_MATCH: 4003,
  API_CREDENTIALS_INVALID: 4004,
  API_CREDENTIALS_NOT_MATCH: 4005,
  API_INVALID_PARENT_KEY: 4006,
  API_NOT_ENOUGH_CREDIT: 4007,
  API_NOT_ENOUGH_PREPAID_CREDIT: 4008,
  API_FAILED_FINDING_PREPAID_CREDIT: 4009,
  API_NO_MEETING_RECORD_FOUND: 4010,
  ROOM_LOCKED: 5001,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  INVALID_XMLHTTPREQUEST_STATUS: 5,
  SCRIPT_ERROR: 6
};

/**
 * The list of available regional servers.
 * - This is for developers to set the nearest region server
 *   for Skylink to connect to for faster connectivity.
 * - The available regional servers are:
 * @attribute REGIONAL_SERVER
 * @type JSON
 * @param {String} APAC1 Asia pacific server 1.
 * @param {String} US1 server 1.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: 'sg',
  US1: 'us2'
};

/**
 * Force an SSL connection to signalling and API server.
 * @attribute _forceSSL
 * @type Boolean
 * @default false
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._forceSSL = false;

/**
 * The path that user is currently connect to.
 * - NOTE ALEX: check if last char is '/'
 * @attribute _path
 * @type String
 * @default Skylink._serverPath
 * @final
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * The regional server that Skylink connects to.
 * @attribute _serverRegion
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._serverRegion = null;

/**
 * The server that user connects to to make
 * api calls to.
 * - The reason why users can input this value is to give
 *   users the chance to connect to any of our beta servers
 *   if available instead of the stable version.
 * @attribute _roomServer
 * @type String
 * @default '//api.temasys.com.sg'
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * The API Key ID.
 * @attribute _apiKey
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._apiKey = null;

/**
 * The default room that the user connects to if no room is provided in
 * {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 * @attribute _defaultRoom
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._defaultRoom = null;

/**
 * The static room's meeting starting date and time.
 * - The value is in ISO formatted string.
 * @attribute _roomStart
 * @type String
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * The static room's meeting duration in hours.
 * @attribute _roomDuration
 * @type Integer
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomDuration = null;

/**
 * The credentials required to set the start date and time
 * and the duration.
 * @attribute _roomCredentials
 * @type String
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomCredentials = null;

/**
 * The current Skylink ready state change.
 * [Rel: Skylink.READY_STATE_CHANGE]
 * @attribute _readyState
 * @type Integer
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * The received server key.
 * @attribute _key
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * The owner's username of the apiKey.
 * @attribute _apiKeyOwner
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._apiKeyOwner = null;

/**
 * The room connection information.
 * @attribute _room
 * @type JSON
 * @param {String} id The roomId of the room user is connected to.
 * @param {String} token The token of the room user is connected to.
 * @param {String} startDateTime The startDateTime in ISO string format of the room.
 * @param {String} duration The duration of the room.
 * @param {JSON} connection Connection constraints and configuration.
 * @param {JSON} connection.peerConstraints The peerconnection constraints.
 * @param {JSON} connection.peerConfig The peerconnection configuration.
 * @param {JSON} connection.offerConstraints The offer constraints.
 * @param {JSON} connection.sdpConstraints The sdp constraints.
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Gets information from api server.
 * @method _requestServerInfo
 * @param {String} method The http method.
 * @param {String} url The url to do a rest call.
 * @param {Function} callback The callback fired after Skylink
 *   receives a response from the api server.
 * @param {JSON} params HTTP Params
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = typeof window.XDomainRequest === 'function' ||
    typeof window.XDomainRequest === 'object';

  self._socketUseXDR = useXDomainRequest;
  var xhr;

  // set force SSL option
  url = (self._forceSSL) ? 'https:' + url : url;

  if (useXDomainRequest) {
    log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest. ' +
      'XMLHttpRequest is now XDomainRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new XDomainRequest();
    xhr.setContentType = function (contentType) {
      xhr.contentType = contentType;
    };
  } else {
    log.debug([null, 'XMLHttpRequest', method, 'Using XMLHttpRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new window.XMLHttpRequest();
    xhr.setContentType = function (contentType) {
      xhr.setRequestHeader('Content-type', contentType);
    };
  }

  xhr.onload = function () {
    var response = xhr.responseText || xhr.response;
    var status = xhr.status || 200;
    log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(response || '{}'));
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function () {
    log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
  };

  xhr.onprogress = function () {
    log.debug([null, 'XMLHttpRequest', method,
      'Retrieving information and config from webserver. Url:'], url);
    log.debug([null, 'XMLHttpRequest', method, 'Provided parameters:'], params);
  };

  xhr.open(method, url, true);
  if (params) {
    xhr.setContentType('application/json;charset=UTF-8');
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};

/**
 * Parse the information received from the api server.
 * @method _parseInfo
 * @param {JSON} info The parsed information from the server.
 * @trigger readyStateChange
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._parseInfo = function(info) {
  log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    });
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._apiKeyOwner = info.apiOwner;

  this._signalingServer = info.ipSigserver;

  this._user = {
    uid: info.username,
    token: info.userCred,
    timeStamp: info.timeStamp,
    streams: [],
    info: {}
  };
  this._room = {
    id: info.room_key,
    token: info.roomCred,
    startDateTime: info.start,
    duration: info.len,
    connection: {
      peerConstraints: JSON.parse(info.pc_constraints),
      peerConfig: null,
      offerConstraints: JSON.parse(info.offer_constraints),
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },
      mediaConstraints: JSON.parse(info.media_constraints)
    }
  };
  this._parseDefaultMediaStreamSettings(this._room.connection.mediaConstraints);

  // set the socket ports
  this._socketPorts = {
    'http:': info.httpPortList,
    'https:': info.httpsPortList
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = 2;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED);
  log.info('Parsed parameters from webserver. ' +
    'Ready for web-realtime communication');

};

/**
 * Start the loading of information from the api server.
 * @method _loadInfo
 * @trigger readyStateChange
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._loadInfo = function() {
  var self = this;
  if (!window.io) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    });
    return;
  }
  if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    });
    return;
  }
  if (!window.RTCPeerConnection) {
    log.error('WebRTC not supported. Please upgrade your browser');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'WebRTC not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
    });
    return;
  }
  if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    });
    return;
  }
  self._readyState = 1;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);
  self._requestServerInfo('GET', self._path, function(status, response) {
    if (status !== 200) {
      // 403 - Room is locked
      // 401 - API Not authorized
      // 402 - run out of credits
      var errorMessage = 'XMLHttpRequest status not OK\nStatus was: ' + status;
      self._readyState = 0;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: status,
        content: (response) ? (response.info || errorMessage) : errorMessage,
        errorCode: response.error ||
          self.READY_STATE_CHANGE_ERROR.INVALID_XMLHTTPREQUEST_STATUS
      });
      return;
    }
    self._parseInfo(response);
  });
};

/**
 * Initialize Skylink to retrieve new connection information based on options.
 * @method _initSelectedRoom
 * @param {String} [room=Skylink._defaultRoom] The room to connect to.
 * @param {Function} callback The callback fired once Skylink is re-initialized.
 * @trigger readyStateChange
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._initSelectedRoom = function(room, callback) {
  var self = this;
  if (typeof room === 'function' || typeof room === 'undefined') {
    log.error('Invalid room provided. Room:', room);
    return;
  }
  var defaultRoom = self._defaultRoom;
  var initOptions = {
    roomServer: self._roomServer,
    defaultRoom: room || defaultRoom,
    apiKey: self._apiKey,
    region: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle
  };
  if (self._roomCredentials) {
    initOptions.credentials = {
      credentials: self._roomCredentials,
      duration: self._roomDuration,
      startDateTime: self._roomStart
    };
  }
  self.init(initOptions);
  self._defaultRoom = defaultRoom;

  // wait for ready state to be completed
  self._condition('readyStateChange', function () {
    callback();
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Initialize Skylink to retrieve connection information.
 * This is the first method to invoke before using any of Skylink functionalities.
 * - Credentials parsing is not usabel.
 * @method init
 * @param {String|JSON} options Connection options or API Key ID
 * @param {String} options.apiKey API Key ID to identify with the Temasys
 *   backend server
 * @param {String} [options.defaultRoom] The default room to connect
 *   to if there is no room provided in
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 * @param {String} [options.roomServer] Path to the Temasys
 *   backend server. If there's no room provided, default room would be used.
 * @param {String} [options.region] The regional server that user
 *   chooses to use. [Rel: Skylink.REGIONAL_SERVER]
 * @param {Boolean} [options.enableIceTrickle=true] The option to enable
 *   ICE trickle or not.
 * @param {Boolean} [options.enableDataChannel=true] The option to enable
 *   enableDataChannel or not.
 * @param {Boolean} [options.enableTURNServer=true] To enable TURN servers in ice connection.
 *   Please do so at your own risk as it might disrupt the connection.
 * @param {Boolean} [options.enableSTUNServer=true] To enable STUN servers in ice connection.
 *   Please do so at your own risk as it might disrupt the connection.
 * @param {Boolean} [options.TURNServerTransport=Skylink.TURN_TRANSPORT.ANY] Transport
 *  to set the transport packet type. [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] Credentials options for
 *   setting a static meeting.
 * @param {String} options.credentials.startDateTime The start timing of the
 *   meeting in Date ISO String
 * @param {Integer} options.credentials.duration The duration of the meeting in hours.<br>
 *   E.g. <code>0.5</code> for half an hour, <code>1.4</code> for 1 hour and 24 minutes
 * @param {String} options.credentials.credentials The credentials required
 *   to set the timing and duration of a meeting.
 * @param {Boolean} [options.audioFallback=false] To allow the option to fallback to
 *   audio if failed retrieving video stream.
 * @param {Boolean} [options.forceSSL=false] To force SSL connections to the API server
 *   and signaling server.
 * @param {String} [options.audioCodec=Skylink.AUDIO_CODEC.OPUS] The preferred audio codec to use.
 *   It is only used when available.
 * @param {String} [options.audioCodec=Skylink.VIDEO_CODEC.OPUS] The preferred video codec to use.
 *   It is only used when available.
 * @param {Integer} [options.socketTimeout=20000] To set the timeout for socket to fail
 *   and attempt a reconnection. The mininum value is 5000.
 * @param {Function} [callback] The callback fired after the room was initialized.
 *   Default signature: function(error object, success object)
 * @example
 *   // Note: Default room is apiKey when no room
 *   // Example 1: To initalize without setting any default room.
 *   SkylinkDemo.init('apiKey');
 *
 *   // Example 2: To initialize with apikey, roomServer and defaultRoom
 *   SkylinkDemo.init({
 *     'apiKey' : 'apiKey',
 *     'roomServer' : 'http://xxxx.com',
 *     'defaultRoom' : 'mainHangout'
 *   });
 *
 *   // Example 3: To initialize with credentials to set startDateTime and
 *   // duration of the room
 *   var hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
 *     (new Date()).toISOString(), token);
 *   var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *   SkylinkDemo.init({
 *     'apiKey' : 'apiKey',
 *     'roomServer' : 'http://xxxx.com',
 *     'defaultRoom' : 'mainHangout'
 *     'credentials' : {
 *        'startDateTime' : (new Date()).toISOString(),
 *        'duration' : 500,
 *        'credentials' : credentials
 *     }
 *   });
 *
 *   // Example 4: To initialize with callback
 *   SkylinkDemo.init('apiKey',function(error,success){
 *     if (error){
 *       console.log('Init failed: '+JSON.stringify(error));
 *     }
 *     else{
 *       console.log('Init succeed: '+JSON.stringify(success));
 *     }
 *   });
 *
 * @trigger readyStateChange
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.init = function(options, callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = undefined;
  }

  if (!options) {
    var error = 'No API key provided';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }
  var apiKey, room, defaultRoom, region;
  var startDateTime, duration, credentials;
  var roomServer = self._roomServer;
  // NOTE: Should we get all the default values from the variables
  // rather than setting it?
  var enableIceTrickle = true;
  var enableDataChannel = true;
  var enableSTUNServer = true;
  var enableTURNServer = true;
  var TURNTransport = self.TURN_TRANSPORT.ANY;
  var audioFallback = false;
  var forceSSL = false;
  var socketTimeout = 0;
  var audioCodec = self.AUDIO_CODEC.OPUS;
  var videoCodec = self.VIDEO_CODEC.VP8;

  log.log('Provided init options:', options);

  if (typeof options === 'string') {
    // set all the default api key, default room and room
    apiKey = options;
    defaultRoom = apiKey;
    room = apiKey;
  } else {
    // set the api key
    apiKey = options.apiKey;
    // set the room server
    roomServer = options.roomServer || roomServer;
    // check room server if it ends with /. Remove the extra /
    roomServer = (roomServer.lastIndexOf('/') ===
      (roomServer.length - 1)) ? roomServer.substring(0,
      roomServer.length - 1) : roomServer;
    // set the region
    region = options.region || region;
    // set the default room
    defaultRoom = options.defaultRoom || apiKey;
    // set the selected room
    room = defaultRoom;
    // set ice trickle option
    enableIceTrickle = (typeof options.enableIceTrickle === 'boolean') ?
      options.enableIceTrickle : enableIceTrickle;
    // set data channel option
    enableDataChannel = (typeof options.enableDataChannel === 'boolean') ?
      options.enableDataChannel : enableDataChannel;
    // set stun server option
    enableSTUNServer = (typeof options.enableSTUNServer === 'boolean') ?
      options.enableSTUNServer : enableSTUNServer;
    // set turn server option
    enableTURNServer = (typeof options.enableTURNServer === 'boolean') ?
      options.enableTURNServer : enableTURNServer;
    // set the force ssl always option
    forceSSL = (typeof options.forceSSL === 'boolean') ?
      options.forceSSL : forceSSL;
    // set the socket timeout option
    socketTimeout = (typeof options.socketTimeout === 'number') ?
      options.socketTimeout : socketTimeout;
    // set the socket timeout option to be above 5000
    socketTimeout = (socketTimeout < 5000) ? 5000 : socketTimeout;
    // set the preferred audio codec
    audioCodec = typeof options.audioCodec === 'string' ?
      options.audioCodec : audioCodec;
    // set the preferred video codec
    videoCodec = typeof options.videoCodec === 'string' ?
      options.videoCodec : videoCodec;

    // set turn transport option
    if (typeof options.TURNServerTransport === 'string') {
      // loop out for every transport option
      for (var type in self.TURN_TRANSPORT) {
        if (self.TURN_TRANSPORT.hasOwnProperty(type)) {
          // do a check if the transport option is valid
          if (self.TURN_TRANSPORT[type] === options.TURNServerTransport) {
            TURNTransport = options.TURNServerTransport;
            break;
          }
        }
      }
    }
    // set audio fallback option
    audioFallback = options.audioFallback || audioFallback;
    // Custom default meeting timing and duration
    // Fallback to default if no duration or startDateTime provided
    if (options.credentials) {
      // set start data time
      startDateTime = options.credentials.startDateTime ||
        (new Date()).toISOString();
      // set the duration
      duration = options.credentials.duration || 200;
      // set the credentials
      credentials = options.credentials.credentials;
    }
  }
  // api key path options
  self._apiKey = apiKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
  self._serverRegion = region;
  self._path = roomServer + '/api/' + apiKey + '/' + room;
  // set credentials if there is
  if (credentials) {
    self._roomStart = startDateTime;
    self._roomDuration = duration;
    self._roomCredentials = credentials;
    self._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }

  self._path += ((credentials) ? '&' : '?') + 'rand=' + (new Date()).toISOString();

  // check if there is a other query parameters or not
  if (region) {
    self._path += '&rg=' + region;
  }
  // skylink functionality options
  self._enableIceTrickle = enableIceTrickle;
  self._enableDataChannel = enableDataChannel;
  self._enableSTUN = enableSTUNServer;
  self._enableTURN = enableTURNServer;
  self._TURNTransport = TURNTransport;
  self._audioFallback = audioFallback;
  self._forceSSL = forceSSL;
  self._socketTimeout = socketTimeout;
  self._selectedAudioCodec = audioCodec;
  self._selectedVideoCodec = videoCodec;

  log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    apiKey: self._apiKey,
    roomServer: self._roomServer,
    defaultRoom: self._defaultRoom,
    selectedRoom: self._selectedRoom,
    serverRegion: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT);
  self._loadInfo();

  if (typeof callback === 'function'){
    //Success callback fired if readyStateChange is completed
    self.once('readyStateChange',function(readyState, error){
        log.log([null, 'Socket', null, 'Firing callback. ' +
        'Ready state change has met provided state ->'], readyState);
        callback(null,{
          serverUrl: self._path,
          readyState: self._readyState,
          apiKey: self._apiKey,
          roomServer: self._roomServer,
          defaultRoom: self._defaultRoom,
          selectedRoom: self._selectedRoom,
          serverRegion: self._serverRegion,
          enableDataChannel: self._enableDataChannel,
          enableIceTrickle: self._enableIceTrickle,
          enableTURNServer: self._enableTURN,
          enableSTUNServer: self._enableSTUN,
          TURNTransport: self._TURNTransport,
          audioFallback: self._audioFallback,
          forceSSL: self._forceSSL,
          socketTimeout: self._socketTimeout,
          audioCodec: self._selectedAudioCodec,
          videoCodec: self._selectedVideoCodec
        });
      },
      function(state){
        return state === self.READY_STATE_CHANGE.COMPLETED;
      },
      false
    );

    //Error callback fired if readyStateChange is error
    self.once('readyStateChange',function(readyState, error){
        log.log([null, 'Socket', null, 'Firing callback. ' +
        'Ready state change has met provided state ->'], readyState);
        callback(error,null);
      },
      function(state){
        return state === self.READY_STATE_CHANGE.ERROR;
      },
      false
    );
  }
};






Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
};

/**
 * The log key
 * @attribute _LOG_KEY
 * @type String
 * @scoped true
 * @readOnly
 * @private
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';


/**
 * The list of level levels based on index.
 * @attribute _LOG_LEVELS
 * @type Array
 * @required
 * @scoped true
 * @private
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default Skylink.LOG_LEVEL.ERROR
 * @required
 * @scoped true
 * @private
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 0;

/**
 * The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * The current state if debugging mode should store
 * the logs in SkylinkLogs.
 * @attribute _enableDebugStack
 * @type Boolean
 * @default false
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugStack = false;

/**
 * The current state if debugging mode should
 * print the trace in every log information.
 * @attribute _enableDebugTrace
 * @type Boolean
 * @default false
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugTrace = false;

/**
 * An internal array of logs.
 * @attribute _storedLogs
 * @type Array
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _storedLogs = [];

/**
 * Gets the list of logs
 * @method _getStoredLogsFn
 * @param {Integer} [logLevel] The log level that get() should return.
 *  If not provided, it get() will return all logs from all levels.
 *  [Rel: Skylink.LOG_LEVEL]
 * @return {Array} The array of logs
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _getStoredLogsFn = function (logLevel) {
  if (typeof logLevel === 'undefined') {
    return _storedLogs;
  }
  var returnLogs = [];
  for (var i = 0; i < _storedLogs.length; i++) {
    if (_storedLogs[i][1] === _LOG_LEVELS[logLevel]) {
      returnLogs.push(_storedLogs[i]);
    }
  }
  return returnLogs;
};

/**
 * Gets the list of logs
 * @method _clearAllStoredLogsFn
 * @param {Integer} [logLevel] The log level that get() should return.
 *  If not provided, it get() will return all logs from all levels.
 *  [Rel: Skylink.LOG_LEVEL]
 * @return {Array} The array of logs
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _clearAllStoredLogsFn = function () {
  _storedLogs = [];
};

/**
 * Print out all the store logs in console.
 * @method _printAllStoredLogsFn
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _printAllStoredLogsFn = function () {
  for (var i = 0; i < _storedLogs.length; i++) {
    var timestamp = _storedLogs[i][0];
    var log = (console[_storedLogs[i][1]] !== 'undefined') ?
      _storedLogs[i][1] : 'log';
    var message = _storedLogs[i][2];
    var debugObject = _storedLogs[i][3];

    if (typeof debugObject !== 'undefined') {
      console[log](message, debugObject, timestamp);
    } else {
      console[log](message, timestamp);
    }
  }
};

/**
 * Handles the list of Skylink logs.
 * @attribute SkylinkLogs
 * @type JSON
 * @required
 * @global true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
window.SkylinkLogs = {
  /**
   * Gets the list of logs
   * @property SkylinkLogs.getLogs
   * @param {Integer} [logLevel] The log level that getLogs() should return.
   *  If not provided, it getLogs() will return all logs from all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of logs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: _getStoredLogsFn,

  /**
   * Clear all the stored logs.
   * @property SkylinkLogs.clearAllLogs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: _clearAllStoredLogsFn,

  /**
   * Print out all the store logs in console.
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @required
   * @global true
   * @component Log
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Logs all the console information.
 * @method _logFn
 * @param {String} logLevel The log level.
 * @param {Array|String} message The console message.
 * @param {String} message.0 The targetPeerId the message is targeted to.
 * @param {String} message.1 The interface the message is targeted to.
 * @param {String|Array} message.2 The events the message is targeted to.
 * @param {String} message.3: The log message.
 * @param {Object|String} [debugObject] The console parameter string or object.
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
var _logFn = function(logLevel, message, debugObject) {
  var outputLog = _LOG_KEY;

  if (typeof message === 'object') {
    outputLog += (message[0]) ? ' [' + message[0] + '] -' : ' -';
    outputLog += (message[1]) ? ' <<' + message[1] + '>>' : '';
    if (message[2]) {
      outputLog += ' ';
      if (typeof message[2] === 'object') {
        for (var i = 0; i < message[2].length; i++) {
          outputLog += '(' + message[2][i] + ')';
        }
      } else {
        outputLog += '(' + message[2] + ')';
      }
    }
    outputLog += ' ' + message[3];
  } else {
    outputLog += ' - ' + message;
  }

  if (_enableDebugMode && _enableDebugStack) {
    // store the logs
    var logItem = [(new Date()), _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    _storedLogs.push(logItem);
  }

  if (_logLevel >= logLevel) {
    // Fallback to log if failure
    logLevel = (typeof console[_LOG_LEVELS[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode && _enableDebugTrace) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
      }
    }
  }
};

/**
 * Logs all the console information.
 * @attribute log
 * @type JSON
 * @param {Function} debug For debug mode.
 * @param {Function} log For log mode.
 * @param {Function} info For info mode.
 * @param {Function} warn For warn mode.
 * @param {Function} serror For error mode.
 * @private
 * @required
 * @scoped true
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  /**
   * Outputs a debug log in the console.
   * @property log.debug
   * @type Function
   * @param {Array|String} message or the message
   * @param {String} message.0 The targetPeerId the log is targetted to
   * @param {String} message.1 he interface the log is targetted to
   * @param {String|Array} message.2 The related names, keys or events to the log
   * @param {String} message.3 The log message.
   * @param {String|Object} [object] The log object.
   * @example
   *   // Logging for message
   *   log.debug('This is my message', object);
   * @private
   * @required
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  debug: function (message, object) {
    _logFn(4, message, object);
  },

  /**
   * Outputs a normal log in the console.
   * @property log.log
   * @type Function
   * @param {Array|String} message or the message
   * @param {String} message.0 The targetPeerId the log is targetted to
   * @param {String} message.1 he interface the log is targetted to
   * @param {String|Array} message.2 The related names, keys or events to the log
   * @param {String} message.3 The log message.
   * @param {String|Object} [object] The log object.
   * @example
   *   // Logging for message
   *   log.log('This is my message', object);
   * @private
   * @required
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  log: function (message, object) {
    _logFn(3, message, object);
  },

  /**
   * Outputs an info log in the console.
   * @property log.info
   * @type Function
   * @param {Array|String} message or the message
   * @param {String} message.0 The targetPeerId the log is targetted to
   * @param {String} message.1 he interface the log is targetted to
   * @param {String|Array} message.2 The related names, keys or events to the log
   * @param {String} message.3 The log message.
   * @param {String|Object} [object] The log object.
   * @example
   *   // Logging for message
   *   log.debug('This is my message', object);
   * @private
   * @required
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  info: function (message, object) {
    _logFn(2, message, object);
  },

  /**
   * Outputs a warning log in the console.
   * @property log.warn
   * @type Function
   * @param {Array|String} message or the message
   * @param {String} message.0 The targetPeerId the log is targetted to
   * @param {String} message.1 he interface the log is targetted to
   * @param {String|Array} message.2 The related names, keys or events to the log
   * @param {String} message.3 The log message.
   * @param {String|Object} [object] The log object.
   * @example
   *   // Logging for message
   *   log.debug('Here\'s a warning. Please do xxxxx to resolve this issue', object);
   * @private
   * @required
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  warn: function (message, object) {
    _logFn(1, message, object);
  },

  /**
   * Outputs an error log in the console.
   * @property log.error
   * @type Function
   * @param {Array|String} message or the message
   * @param {String} message.0 The targetPeerId the log is targetted to
   * @param {String} message.1 he interface the log is targetted to
   * @param {String|Array} message.2 The related names, keys or events to the log
   * @param {String} message.3 The log message.
   * @param {String|Object} [object] The log object.
   *   // Logging for external information
   *   log.error('There has been an error', object);
   * @private
   * @required
   * @scoped true
   * @component Log
   * @for Skylink
   * @since 0.5.4
   */
  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Sets the debugging log level. A log level displays logs of his level and higher:
 * ERROR > WARN > INFO > LOG > DEBUG.
 * - The default log level is Skylink.LOG_LEVEL.WARN
 * @method setLogLevel
 * @param {Integer} [logLevel] The log level.[Rel: Skylink.Data.LOG_LEVEL]
 * @example
 *   //Display logs level: Error, warn, info, log and debug.
 *   SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
 * @component Log
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setLogLevel = function(logLevel) {
  if(logLevel === undefined) {
    logLevel = Skylink.LOG_LEVEL.WARN;
  }
  for (var level in this.LOG_LEVEL) {
    if (this.LOG_LEVEL[level] === logLevel) {
      _logLevel = logLevel;
      log.log([null, 'Log', level, 'Log level exists. Level is set']);
      return;
    }
  }
  log.error([null, 'Log', level, 'Log level does not exist. Level is not set']);
};

/**
 * Sets Skylink in debugging mode to display log stack trace.
 * - By default, debugging mode is turned off.
 * @method setDebugMode
 * @param {Boolean|JSON} [options=false] Is debugging mode enabled.
 * @param {Boolean} [options.trace=false] If console output should trace.
 * @param {Boolean} [options.storeLogs=false] If SkylinkLogs should store
 *   the output logs.
 * @example
 *   // Example 1: just to enable
 *   SkylinkDemo.setDebugMode(true);
 *   // or
 *   SkylinkDemo.setDebugMode();
 *
 *   // Example 2: just to disable
 *   SkylinkDemo.setDebugMode(false);
 * @component Log
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  if (typeof isDebugMode === 'object') {
    if (Object.keys(isDebugMode).length > 0) {
      _enableDebugTrace = !!isDebugMode.trace;
      _enableDebugStack = !!isDebugMode.storeLogs;
    } else {
      _enableDebugMode = false;
      _enableDebugTrace = false;
      _enableDebugStack = false;
    }
  }
  if (isDebugMode === false) {
    _enableDebugMode = false;
    _enableDebugTrace = false;
    _enableDebugStack = false;

    return;
  }
  _enableDebugMode = true;
  _enableDebugTrace = true;
  _enableDebugStack = true;
};
Skylink.prototype._EVENTS = {
  /**
   * Event fired when the socket connection to the signaling
   * server is open.
   * @event channelOpen
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event fired when the socket connection to the signaling
   * server has closed.
   * @event channelClose
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * Event fired when the socket connection received a message
   * from the signaling server.
   * @event channelMessage
   * @param {JSON} message
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * Event fired when the socket connection has occurred an error.
   * @event channelError
   * @param {Object|String} error Error message or object thrown.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event fired when the socket re-tries to connection with fallback ports.
   * @event channelRetry
   * @param {String} fallbackType The type of fallback [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Integer} currentAttempt The current attempt of the fallback re-try attempt.
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event fired when the socket connection failed connecting.
   * - The difference between this and <b>channelError</b> is that
   *   channelError triggers during the connection. This throws
   *   when connection failed to be established.
   * @event socketError
   * @param {String} errorCode The error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Integer|String|Object} error The reconnection attempt or error object.
   * @param {String} fallbackType The type of fallback [Rel: Skylink.SOCKET_FALLBACK]
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event fired whether the room is ready for use.
   * @event readyStateChange
   * @param {String} readyState [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} error Error object thrown.
   * @param {Integer} error.status Http status when retrieving information.
   *   May be empty for other errors.
   * @param {String} error.content Error message.
   * @param {Integer} error.errorCode Error code.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @component Events
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event fired when a peer's handshake progress has changed.
   * @event handshakeProgress
   * @param {String} step The handshake progress step.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId PeerId of the peer's handshake progress.
   * @param {Object|String} error Error message or object thrown.
   * @component Events
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * Event fired when an ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The ice candidate generation state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId PeerId of the peer that had an ice candidate
   *    generation state change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * Event fired when a peer Connection state has changed.
   * @event peerConnectionState
   * @param {String} state The peer connection state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId PeerId of the peer that had a peer connection state
   *    change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * Event fired when an ICE connection state has changed.
   * @iceConnectionState
   * @param {String} state The ice connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId PeerId of the peer that had an ice connection state change.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event fired when webcam or microphone media access fails.
   * @event mediaAccessError
   * @param {Object|String} error Error object thrown.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event fired when webcam or microphone media acces passes.
   * @event mediaAccessSuccess
   * @param {Object} stream MediaStream object.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event fired when it's required to have audio or video access.
   * @event mediaAccessRequired
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event fired when media access to MediaStream has stopped.
   * @event mediaAccessStopped
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event fired when a peer joins the room.
   * @event peerJoined
   * @param {String} peerId PeerId of the peer that joined the room.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event fired when a peer's connection is restarted.
   * @event peerRestart
   * @param {String} peerId PeerId of the peer that is being restarted.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
   *   settings.
   * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
   *   settings.
   * @param {JSON} peerInfo.settings.video.resolution
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} peerInfo.settings.video.resolution.width
   *   Peer's video stream resolution width.
   * @param {Integer} peerInfo.settings.video.resolution.height
   *   Peer's video stream resolution height.
   * @param {Integer} peerInfo.settings.video.frameRate
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
   *   stream is muted.
   * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelfInitiateRestart Is it us who initiated the restart.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event fired when a peer information is updated.
   * @event peerUpdated
   * @param {String} peerId PeerId of the peer that had information updaed.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event fired when a peer leaves the room
   * @event peerLeft
   * @param {String} peerId PeerId of the peer that left.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event fired when a remote stream has become available.
   * - This occurs after the user joins the room.
   * - This is changed from <b>addPeerStream</b> event.
   * - Note that <b>addPeerStream</b> is removed from the specs.
   * - There has been a documentation error whereby the stream it is
   *   supposed to be (stream, peerId, isSelf), but instead is received
   *   as (peerId, stream, isSelf) in 0.5.0.
   * @event incomingStream
   * @param {String} peerId PeerId of the peer that is sending the stream.
   * @param {Object} stream MediaStream object.
   * @param {Boolean} isSelf Is the peer self.
   * @param {JSON} peerInfo Peer's information.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event fired when a message being broadcasted is received.
   * - This is changed from <b>chatMessageReceived</b>,
   *   <b>privateMessage</b> and <b>publicMessage</b> event.
   * - Note that <b>chatMessageReceived</b>, <b>privateMessage</b>
   *   and <b>publicMessage</b> is removed from the specs.
   * @event incomingMessage
   * @param {JSON} message Message object that is received.
   * @param {JSON|String} message.content Data that is broadcasted.
   * @param {String} message.senderPeerId PeerId of the sender peer.
   * @param {String} message.targetPeerId PeerId that is specifically
   *   targeted to receive the message.
   * @param {Boolean} message.isPrivate Is data received a private message.
   * @param {Boolean} message.isDataChannel Is data received from a
   *   data channel.
   * @param {String} peerId PeerId of the sender peer.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event fired when connected to a room and the lock status has changed.
   * @event roomLock
   * @param {Boolean} isLocked Is the room locked.
   * @param {String} peerId PeerId of the peer that is locking/unlocking
   *   the room.
   * @param {JSON} peerInfo Peer's information.
   * @param {JSON} peerInfo.settings Peer's stream settings.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] Peer's audio stream
   *   settings.
   * @param {Boolean} [peerInfo.settings.audio.stereo=false] If peer has stereo
   *   enabled or not.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] Peer's video stream
   *   settings.
   * @param {JSON} [peerInfo.settings.video.resolution]
   *   Peer's video stream resolution [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Integer} [peerInfo.settings.video.resolution.width]
   *   Peer's video stream resolution width.
   * @param {Integer} [peerInfo.settings.video.resolution.height]
   *   Peer's video stream resolution height.
   * @param {Integer} [peerInfo.settings.video.frameRate]
   *   Peer's video stream resolution minimum frame rate.
   * @param {JSON} peerInfo.mediaStatus Peer stream status.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] If peer's audio
   *   stream is muted.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] If peer's video
   *   stream is muted.
   * @param {JSON|String} peerInfo.userData Peer's custom user data.
   * @param {JSON} peerInfo.agent Peer's browser agent.
   * @param {String} peerInfo.agent.name Peer's browser agent name.
   * @param {Integer} peerInfo.agent.version Peer's browser agent version.
   * @param {Boolean} isSelf Is the peer self.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event fired when a peer's datachannel state has changed.
   * @event dataChannelState
   * @param {String} state The datachannel state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId PeerId of peer that has a datachannel
   *   state change.
   * @param {String} [error] Error message in case there is failure
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event fired when a data transfer state has changed.
   * - Note that <u>transferInfo.data</u> sends the blob data, and
   *   no longer a blob url.
   * @event dataTransferState
   * @param {String} state The data transfer state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId TransferId of the data.
   * @param {String} peerId PeerId of the peer that has a data
   *   transfer state change.
   * @param {JSON} transferInfo Data transfer information.
   * @param {JSON} transferInfo.percentage The percetange of data being
   *   uploaded / downloaded.
   * @param {JSON} transferInfo.senderPeerId PeerId of the sender.
   * @param {JSON} transferInfo.data The blob data. See the
   *   [createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
   *   method on how you can convert the blob to a download link.
   * @param {JSON} transferInfo.name Data name.
   * @param {JSON} transferInfo.size Data size.
   * @param {JSON} error The error object.
   * @param {String} error.message Error message thrown.
   * @param {String} error.transferType Is error from uploading or downloading.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event fired when the signaling server warns the user.
   * @event systemAction
   * @param {String} action The action that is required for
   *   the user to follow. [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The reason for the action.
   * @param {String} reason The reason why the action is given.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @component Events
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: []
};

/**
 * Events with callbacks that would be fired only once once condition is met.
 * @attribute _onceEvents
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onceEvents = {};

/**
 * The timestamp for throttle function to use.
 * @attribute _timestamp
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._timestamp = {
  now: Date.now() || function() { return +new Date(); }
};

/**
 * Trigger all the callbacks associated with an event.
 * - Note that extra arguments can be passed to the callback which
 *   extra argument can be expected by callback is documented by each event.
 * @method _trigger
 * @param {String} eventName The Skylink event.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._trigger = function(eventName) {
  //convert the arguments into an array
  var args = Array.prototype.slice.call(arguments);
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName] || null;
  args.shift(); //Omit the first argument since it's the event name
  if (arr) {
    // for events subscribed forever
    for (var i = 0; i < arr.length; i++) {
      try {
        log.log([null, 'Event', eventName, 'Event is fired']);
        if(arr[i].apply(this, args) === false) {
          break;
        }
      } catch(error) {
        log.error([null, 'Event', eventName, 'Exception occurred in event:'], error);
        throw error;
      }
    }
  }
  if (once){
    // for events subscribed on once
    for (var j = 0; j < once.length; j++) {
      if (once[j][1].apply(this, args) === true) {
        log.log([null, 'Event', eventName, 'Condition is met. Firing event']);
        if(once[j][0].apply(this, args) === false) {
          break;
        }
        if (!once[j][2]) {
          log.log([null, 'Event', eventName, 'Removing event after firing once']);
          once.splice(j, 1);
          //After removing current element, the next element should be element of the same index
          j--;
        }
      } else {
        log.log([null, 'Event', eventName, 'Condition is still not met. ' +
          'Holding event from being fired']);
      }
    }
  }

  log.log([null, 'Event', eventName, 'Event is triggered']);
};

/**
 * To register a callback function to an event.
 * @method on
 * @param {String} eventName The Skylink event. See the event list to see what you can register.
 * @param {Function} callback The callback fired after the event is triggered.
 * @example
 *   SkylinkDemo.on('peerJoined', function (peerId, peerInfo) {
 *      alert(peerId + ' has joined the room');
 *   });
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.on = function(eventName, callback) {
  if ('function' === typeof callback) {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    this._EVENTS[eventName].push(callback);
    log.log([null, 'Event', eventName, 'Event is subscribed']);
  } else {
    log.error([null, 'Event', eventName, 'Provided parameter is not a function']);
  }
};

/**
 * To register a callback function to an event that is fired once a condition is met.
 * @method once
 * @param {String} eventName The Skylink event. See the event list to see what you can register.
 * @param {Function} callback The callback fired after the event is triggered.
 * @param {Function} [condition]
 *   The provided condition that would trigger this event.
 *   If not provided, it will return true when the event is triggered.
 *   Return a true to fire the callback.
 * @param {Boolean} [fireAlways=false] The function does not get removed onced triggered,
 *   but triggers everytime the event is called.
 * @example
 *   SkylinkDemo.once('peerConnectionState', function (state, peerId) {
 *     alert('Peer has left');
 *   }, function (state, peerId) {
 *     return state === SkylinkDemo.PEER_CONNECTION_STATE.CLOSED;
 *   });
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.once = function(eventName, callback, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  condition = (typeof condition !== 'function') ? function () {
    return true;
  } : condition;

  if (typeof callback === 'function') {

    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    // prevent undefined error
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback is not a function']);
  }
};

/**
 * To unregister a callback function from an event.
 * @method off
 * @param {String} eventName The Skylink event. See the event list to see what you can unregister.
 * @param {Function} callback The callback fired after the event is triggered.
 *   Not providing any callback turns all callbacks tied to that event off.
 * @example
 *   SkylinkDemo.off('peerJoined', callback);
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.off = function(eventName, callback) {
  if (callback === undefined) {
    this._EVENTS[eventName] = [];
    this._onceEvents[eventName] = [];
    log.log([null, 'Event', eventName, 'All events are unsubscribed']);
    return;
  }
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName];

  // unsubscribe events that is triggered always
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === callback) {
      log.log([null, 'Event', eventName, 'Event is unsubscribed']);
      arr.splice(i, 1);
      break;
    }
  }
  // unsubscribe events fired only once
  if(once !== undefined) {
    for (var j = 0; j < once.length; j++) {
      if (once[j][0] === callback) {
        log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
        once.splice(j, 1);
        break;
      }
    }
  }
};

/**
 * Does a check condition first to check if event is required to be subscribed.
 * If check condition fails, it subscribes an event with
 *  {{#crossLink "Skylink/once:method"}}once(){{/crossLink}} method to wait for
 * the condition to pass to fire the callback.
 * @method _condition
 * @param {String} eventName The Skylink event.
 * @param {Function} callback The callback fired after the condition is met.
 * @param {Function} checkFirst The condition to check that if pass, it would fire the callback,
 *   or it will just subscribe to an event and fire when condition is met.
 * @param {Function} [condition]
 *   The provided condition that would trigger this event.
 *   If not provided, it will return true when the event is triggered.
 *   Return a true to fire the callback.
 * @param {Boolean} [fireAlways=false] The function does not get removed onced triggered,
 *   but triggers everytime the event is called.
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._condition = function(eventName, callback, checkFirst, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  if (typeof callback === 'function' && typeof checkFirst === 'function') {
    if (checkFirst()) {
      log.log([null, 'Event', eventName, 'First condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', eventName, 'First condition is not met. Subscribing to event']);
    this.once(eventName, callback, condition, fireAlways);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback or checkFirst is not a function']);
  }
};

/**
 * Sets an interval check. If condition is met, fires callback.
 * @method _wait
 * @param {Function} callback The callback fired after the condition is met.
 * @param {Function} condition The provided condition that would trigger this the callback.
 * @param {Integer} [intervalTime=50] The interval loop timeout.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._wait = function(callback, condition, intervalTime, fireAlways) {
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  if (typeof callback === 'function' && typeof condition === 'function') {
    if (condition()) {
      log.log([null, 'Event', null, 'Condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', null, 'Condition is not met. Doing a check.']);

    intervalTime = (typeof intervalTime === 'number') ? intervalTime : 50;

    var doWait = setInterval(function () {
      if (condition()) {
        log.log([null, 'Event', null, 'Condition is met after waiting. Firing callback']);
        if (!fireAlways){
          clearInterval(doWait);
        }
        callback();
      }
    }, intervalTime);
  } else {
    if (typeof callback !== 'function'){
      log.error([null, 'Event', null, 'Provided callback is not a function']);
    }
    if (typeof condition !== 'function'){
      log.error([null, 'Event', null, 'Provided condition is not a function']);
    }
  }
};

/**
 * Returns a wrapper of the original function, which only fires once during
 *  a specified amount of time.
 * @method _throttle
 * @param {Function} func The function that should be throttled.
 * @param {Integer} wait The amount of time that function need to throttled (in ms)
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._throttle = function(func, wait){
  var self = this;
  return function () {
      if (!self._timestamp.func){
        //First time run, need to force timestamp to skip condition
        self._timestamp.func = self._timestamp.now - wait;
      }
      var now = Date.now();
      if (now - self._timestamp.func < wait) {
          return;
      }
      func.apply(self, arguments);
      self._timestamp.func = now;
  };
};
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};

/**
 * The queue of messages to be sent to signaling server.
 * @attribute _socketMessageQueue
 * @type Array
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageQueue = [];

/**
 * The timeout used to send socket message queue.
 * @attribute _socketMessageTimeout
 * @type Function
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageTimeout = null;


/**
 * The list of ports that SkylinkJS would use to attempt to connect to the signaling server with.
 * @attribute _socketPorts
 * @type JSON
 * @param {Array} http:// The list of HTTP ports.
 * @param {Array} https:// The list of HTTPs ports.
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketPorts = {
  'http:': [80, 3000],
  'https:': [443, 3443]
};

/**
 * The list of channel connection fallback states.
 * - The fallback states that would occur are:
 * @attribute SOCKET_FALLBACK
 * @type JSON
 * @param {String} NON_FALLBACK Non-fallback state,
 * @param {String} FALLBACK_PORT Fallback to non-ssl port for channel re-try.
 * @param {String} FALLBACK_PORT_SSL Fallback to ssl port for channel re-try.
 * @param {String} LONG_POLLING Fallback to non-ssl long-polling.
 * @param {String} LONG_POLLING_SSL Fallback to ssl port for long-polling.
 * @readOnly
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * The current socket opened state.
 * @attribute _channelOpen
 * @type Boolean
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * The signaling server to connect to.
 * @attribute _signalingServer
 * @type String
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._signalingServer = null;

/**
 * The signaling server protocol to use.
 * <ul>
 * <li><code>https:</code>
 * <ul><li>Default port is <code>443</code>.</li>
 *     <li>Fallback port is <code>3443</code>.</li>
 * </ul></li>
 * <li><code>http:</code>
 * <ul><li>Default port is <code>80</code>.</li>
 *     <li>Fallback port is <code>3000</code>.</li>
 * </ul></li>
 * </ul>
 * @attribute _signalingServerProtocol
 * @type String
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerProtocol = window.location.protocol;

/**
 * The signaling server port to connect to.
 * @attribute _signalingServerPort
 * @type Integer
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerPort = null;

/**
 * The actual socket object that handles the connection.
 * @attribute _socket
 * @type Object
 * @required
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._socket = null;

/**
 * The socket connection timeout
 * <ul>
 * <li><code>0</code> Uses the default timeout from socket.io
 *     <code>20000</code>ms.</li>
 * <li><code>>0</code> Uses the user set timeout</li>
 * </ul>
 * @attribute _socketTimeout
 * @type Integer
 * @default 0
 * @required
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketTimeout = 0;

/**
 * The socket connection to use XDomainRequest.
 * @attribute _socketUseXDR
 * @type Boolean
 * @default false
 * @required
 * @component Socket
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketUseXDR = false;

/**
 * Sends a message to the signaling server.
 * - Not to be confused with method
 *   {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}
 *   that broadcasts messages. This is for sending socket messages.
 * @method _sendChannelMessage
 * @param {JSON} message
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen) {
    return;
  }

  var messageString = JSON.stringify(message);

  var sendLater = function(){
    if (self._socketMessageQueue.length > 0){

      if (self._socketMessageQueue.length<throughput){

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,self._socketMessageQueue.length),
            mid: self._user.sid,
            rid: self._room.id
          });

        self._socket.send({
          type: self._SIG_MESSAGE_TYPE.GROUP,
          lists: self._socketMessageQueue.splice(0,self._socketMessageQueue.length),
          mid: self._user.sid,
          rid: self._room.id
        });

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;

      }
      else{

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,throughput),
            mid: self._user.sid,
            rid: self._room.id
          });

        self._socket.send({
          type: self._SIG_MESSAGE_TYPE.GROUP,
          lists: self._socketMessageQueue.splice(0,throughput),
          mid: self._user.sid,
          rid: self._room.id
        });

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;
        self._socketMessageTimeout = setTimeout(sendLater,interval);

      }
      self._timestamp.now = Date.now() || function() { return +new Date(); };
    }
  };

  //Delay when messages are sent too rapidly
  if ((Date.now() || function() { return +new Date(); }) - self._timestamp.now < interval &&
    (message.type === self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE ||
    message.type === self._SIG_MESSAGE_TYPE.UPDATE_USER ||
    message.type === self._SIG_MESSAGE_TYPE.RESTART)) {

      log.warn([(message.target ? message.target : 'server'), null, null,
      'Messages fired too rapidly. Delaying.'], {
        interval: 1000,
        throughput: 16,
        message: message
      });

      self._socketMessageQueue.push(messageString);

      if (!self._socketMessageTimeout){
        self._socketMessageTimeout = setTimeout(sendLater,
          interval - ((Date.now() || function() { return +new Date(); })-self._timestamp.now));
      }
      return;
  }

  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message);

  //Normal case when messages are sent not so rapidly
  self._socket.send(messageString);
  self._timestamp.now = Date.now() || function() { return +new Date(); };

};

/**
 * Create the socket object to refresh connection.
 * @method _createSocket
 * @param {String} type The type of socket.io connection to use.
 * <ul>
 * <li><code>"WebSocket"</code>: Uses the WebSocket connection</li>
 * <li><code>"Polling"</code>: Uses the long-polling connection</li>
 * </ul>
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type) {
  var self = this;

  var options = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false
  };

  var ports = self._socketPorts[self._signalingServerProtocol];

  var connectionType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    connectionType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if ( ports.indexOf(self._signalingServerPort) === ports.length - 1 ) {

    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      console.log(type, self._signalingServerPort);

      type = 'Polling';
      self._signalingServerPort = ports[0];

    } else if (type === 'Polling') {
      options.reconnection = true;
      options.reconnectionAttempts = 4;
      options.reconectionDelayMax = 1000;
    }

  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  var url = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  if (type === 'WebSocket') {
    options.transports = ['websocket'];
  } else if (type === 'Polling') {
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._socket.removeAllListeners('connect_error');
    self._socket.removeAllListeners('reconnect_attempt');
    self._socket.removeAllListeners('reconnect_error');
    self._socket.removeAllListeners('reconnect_failed');
    self._socket.removeAllListeners('connect');
    self._socket.removeAllListeners('reconnect');
    self._socket.removeAllListeners('error');
    self._socket.removeAllListeners('disconnect');
    self._socket.removeAllListeners('message');
    self._socket.disconnect();
    self._socket = null;
  }

  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', {
    url: url,
    useXDR: self._socketUseXDR,
    options: options
  });

  self._socket = io.connect(url, options);

  if (connectionType === null) {
    connectionType = self._signalingServerProtocol === 'http://' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING :
        self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL :
        self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);
  }

  self._socket.on('connect_error', function (error) {
    self._channelOpen = false;

    self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED,
      error, connectionType);

    self._trigger('channelRetry', connectionType, 1);

    if (options.reconnection === false) {
      self._createSocket(type);
    }
  });

  self._socket.on('reconnect_attempt', function (attempt) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
      attempt, connectionType);

    self._trigger('channelRetry', connectionType, attempt);
  });

  self._socket.on('reconnect_error', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED,
      error, connectionType);
  });

  self._socket.on('reconnect_failed', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED,
      error, connectionType);
  });

  self._socket.on('connect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('reconnect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });

  self._socket.on('disconnect', function() {
    self._channelOpen = false;
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);
  });

  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
};

/**
 * Initiate a socket signaling connection.
 * @method _openChannel
 * @trigger channelMessage, channelOpen, channelError, channelClose
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as there is already an ongoing channel connection']);
    return;
  }

  if (self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready']);
    return;
  }

  // set if forceSSL
  if (self._forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  // Begin with a websocket connection
  self._createSocket('WebSocket');
};

/**
 * Closes the socket signaling connection.
 * @method _closeChannel
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  if (this._socket) {
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
    this._socket.disconnect();
    this._socket = null;
  }
  this._channelOpen = false;
  this._trigger('channelClose');
};
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  RESTART: 'restart',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
  MUTE_VIDEO: 'muteVideoEvent',
  MUTE_AUDIO: 'muteAudioEvent',
  PUBLIC_MESSAGE: 'public',
  PRIVATE_MESSAGE: 'private',
  STREAM: 'stream',
  GROUP: 'group'
};

/**
 * The flag that indicates if MCU is enabled.
 * @attribute _hasMCU
 * @type Boolean
 * @development true
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;


/**
 * Handles every incoming signaling message received.
 * @method _processSigMessage
 * @param {String} messageString The message object stringified received.
 * @private
 * @component Message
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(JSON.parse(message.lists[i]));
    }
  } else {
    this._processSingleMessage(message);
  }
};

/**
 * Handles the single signaling message received.
 * @method _processingSingleMessage
 * @param {JSON} message The message object received.
 * @private
 * @component Message
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Received from peer ->'], message.type);
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, null, null, 'Ignoring message ->'], message.type);
    return;
  }
  switch (message.type) {
  //--- BASIC API Messages ----
  case this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE:
    this._publicMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE:
    this._privateMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.IN_ROOM:
    this._inRoomHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ENTER:
    this._enterHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.WELCOME:
    this._welcomeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RESTART:
    this._restartHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.OFFER:
    this._offerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER:
    this._answerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.CANDIDATE:
    this._candidateHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.BYE:
    this._byeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.REDIRECT:
    this._redirectHandler(message);
    break;
    //--- ADVANCED API Messages ----
  case this._SIG_MESSAGE_TYPE.UPDATE_USER:
    this._updateUserEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_VIDEO:
    this._muteVideoEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_AUDIO:
    this._muteAudioEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.STREAM:
    this._streamEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Handles the REDIRECT Message event.
 * @method _redirectHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.REDIRECT.message]
 * @trigger systemAction
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });

  if (message.action === this.SYSTEM_ACTION.REJECT) {
  	for (var key in this._peerConnections) {
  		if (this._peerConnections.hasOwnProperty(key)) {
  			this._removePeer(key);
  		}
  	}
  }
  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Handles the UPDATE_USER Message event.
 * @method _updateUserEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.UPDATE_USER.message]
 * @trigger peerUpdated
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._updateUserEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer updated userData:'], message.userData);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid,
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the ROOM_LOCK Message event.
 * @method _roomLockEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ROOM_LOCK.message]
 * @trigger roomLock
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid,
    this._peerInformations[targetMid], false);
};

/**
 * Handles the MUTE_AUDIO Message event.
 * @method _muteAudioEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_AUDIO.message]
 * @trigger peerUpdated
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteAudioEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s audio muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('peerUpdated', targetMid,
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the MUTE_VIDEO Message event.
 * @method _muteVideoEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_VIDEO.message]
 * @trigger peerUpdated
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteVideoEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s video muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('peerUpdated', targetMid,
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the STREAM Message event.
 * @method _streamEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.STREAM.message]
 * @trigger peerUpdated
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid]) {

  	if (message.status === 'ended') {
  		this._trigger('streamEnded', targetMid, this.getPeerInfo(targetMid), false);
  		this._peerConnections[targetMid].hasStream = false;
  	}

  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the BYTE Message event.
 * @method _byeHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.BYE.message]
 * @trigger peerLeft
 * @private
 * @component Message
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer has left the room']);
  this._removePeer(targetMid);
};

/**
 * Handles the PRIVATE_MESSAGE Message event.
 * @method _privateMessageHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE.message]
 * @trigger privateMessage
 * @private
 * @component Message
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received private message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: true,
    targetPeerId: message.target, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Handles the PUBLIC_MESSAGE Message event.
 * @method _publicMessageHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE.message]
 * @trigger publicMessage
 * @private
 * @component Message
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received public message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: false,
    targetPeerId: null, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Handles the IN_ROOM Message event.
 * @method _inRoomHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.IN_ROOM.message]
 * @trigger peerJoined
 * @private
 * @component Message
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._inRoomHandler = function(message) {
  var self = this;
  log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo()
  });
};

/**
 * Handles the ENTER Message event.
 * @method _enterHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ENTER.message]
 * @trigger handshakeProgress, peerJoined
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Incoming peer have initiated ' +
    'handshake. Peer\'s information:'], message.userInfo);
  // need to check entered user is new or not.
  // peerInformations because it takes a sequence before creating the
  // peerconnection object. peerInformations are stored at the start of the
  // handshake, so user knows if there is a peer already.
  if (self._peerInformations[targetMid]) {
    // NOTE ALEX: and if we already have a connection when the peer enter,
    // what should we do? what are the possible use case?
    log.log([targetMid, null, message.type, 'Ignoring message as peer is already added']);
    return;
  }
  // add peer
  self._addPeer(targetMid, {
    agent: message.agent,
    version: message.version,
    os: message.os
  }, false, false, message.receiveOnly);
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };
  if (targetMid !== 'MCU') {
    self._trigger('peerJoined', targetMid, message.userInfo, false);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

    // disable mcu for incoming peer sent by MCU
    if (message.agent === 'MCU') {
    	this._enableDataChannel = false;

    	/*if (window.webrtcDetectedBrowser === 'firefox') {
    		this._enableIceTrickle = false;
    	}*/
    }
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
    this._hasMCU = true;
    this._enableDataChannel = false;
  }

  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo(),
    target: targetMid,
    weight: weight
  });
};

/**
 * Handles the RESTART Message event.
 * @method _restartHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.RESTART.message]
 * @trigger handshakeProgress, peerRestart
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (self._hasMCU) {
    log.warn([peerId, 'PeerConnection', null, 'Restart functionality for peer\'s connection ' +
      'for MCU is not yet supported']);
    return;
  }

  self.lastRestart = message.lastRestart;

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  // re-add information
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };

  // mcu has joined
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has restarted its connection']);
    self._hasMCU = true;
  }

  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

  message.agent = (!message.agent) ? 'chrome' : message.agent;
  self._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : self._enableIceTrickle;
  self._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : self._enableDataChannel;

  var peerConnectionStateStable = false;

  self._restartPeerConnection(targetMid, false, false, function () {
  	self._addPeer(targetMid, {
	    agent: message.agent,
	    version: message.version,
	    os: message.os
	  }, true, true, message.receiveOnly);

    self._trigger('peerRestart', targetMid, self._peerInformations[targetMid] || {}, false);

	// do a peer connection health check
  	self._startPeerConnectionHealthCheck(targetMid);
  });
};

/**
 * Handles the WELCOME Message event.
 * @method _welcomeHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.WELCOME.message]
 * @trigger handshakeProgress, peerJoined
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;

  log.log([targetMid, null, message.type, 'Received peer\'s response ' +
    'to handshake initiation. Peer\'s information:'], message.userInfo);

  if (this._peerConnections[targetMid]) {
    if (!this._peerConnections[targetMid].setOffer || message.weight < 0) {
      if (message.weight < 0) {
        log.log([targetMid, null, message.type, 'Peer\'s weight is lower ' +
          'than 0. Proceeding with offer'], message.weight);
        restartConn = true;

        // -2: hard restart of connection
        if (message.weight === -2) {
          this._restartHandler(message);
          return;
        }

      } else if (this._peerHSPriorities[targetMid] > message.weight) {
        log.log([targetMid, null, message.type, 'Peer\'s generated weight ' +
          'is lesser than user\'s. Ignoring message'
          ], this._peerHSPriorities[targetMid] + ' > ' + message.weight);
        return;

      } else {
        log.log([targetMid, null, message.type, 'Peer\'s generated weight ' +
          'is higher than user\'s. Proceeding with offer'
          ], this._peerHSPriorities[targetMid] + ' < ' + message.weight);
        restartConn = true;
      }
    } else {
      log.warn([targetMid, null, message.type,
        'Ignoring message as peer is already added']);
      return;
    }
  }
  message.agent = (!message.agent) ? 'chrome' : message.agent;
  this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : this._enableIceTrickle;
  this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : this._enableDataChannel;

  // mcu has joined
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has ' +
      ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
    this._hasMCU = true;
    // disable mcu for incoming MCU peer
    this._enableDataChannel = false;
  }
  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
    // disable mcu for incoming peer sent by MCU
    if (message.agent === 'MCU') {
    	this._enableDataChannel = false;
    }
    // user is not mcu
    if (targetMid !== 'MCU') {
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }
  }

  this._addPeer(targetMid, {
    agent: message.agent,
		version: message.version,
		os: message.os
  }, true, restartConn, message.receiveOnly);
};

/**
 * Handles the OFFER Message event.
 * @method _offerHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.OFFER.messa]
 * @trigger handshakeProgress
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._offerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  if (pc.localDescription ? !!pc.localDescription.sdp : false) {
  	log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
  		pc.localDescription);
    return;
  }

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], message.sdp);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
  var offer = new window.RTCSessionDescription(message);
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  pc.setRemoteDescription(new window.RTCSessionDescription(offer), function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};

/**
 * Handles the CANDIDATE Message event.
 * @method _candidateHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.CANDIDATE.message]
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._candidateHandler = function(message) {
  var targetMid = message.mid;
  var pc = this._peerConnections[targetMid];
  log.log([targetMid, null, message.type, 'Received candidate from peer. Candidate config:'], {
    sdp: message.sdp,
    target: message.target,
    candidate: message.candidate,
    label: message.label
  });
  // create ice candidate object
  var messageCan = message.candidate.split(' ');
  var canType = messageCan[7];
  log.log([targetMid, null, message.type, 'Candidate type:'], canType);
  // if (canType !== 'relay' && canType !== 'srflx') {
  // trace('Skipping non relay and non srflx candidates.');
  var index = message.label;
  var candidate = new window.RTCIceCandidate({
    sdpMLineIndex: index,
    candidate: message.candidate,
    //id: message.id,
    sdpMid: message.id
    //label: index
  });
  if (pc) {
  	if (pc.signalingState === this.PEER_CONNECTION_STATE.CLOSED) {
  		log.warn([targetMid, null, message.type, 'Peer connection state ' +
  			'is closed. Not adding candidate']);
	    return;
  	}
    /*if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
      log.debug([targetMid, null, null,
        'Received but not adding Candidate as we are already connected to this peer']);
      return;
    }*/
    // set queue before ice candidate cannot be added before setRemoteDescription.
    // this will cause a black screen of media stream
    if ((pc.setOffer === 'local' && pc.setAnswer === 'remote') ||
      (pc.setAnswer === 'local' && pc.setOffer === 'remote')) {
      pc.addIceCandidate(candidate, this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      log.debug([targetMid, 'RTCIceCandidate', message.type,
        'Added candidate'], candidate);
    } else {
      this._addIceCandidateToQueue(targetMid, candidate);
    }
  } else {
    // Added ice candidate to queue because it may be received before sending the offer
    log.debug([targetMid, 'RTCIceCandidate', message.type,
      'Not adding candidate as peer connection not present']);
    // NOTE ALEX: if the offer was slow, this can happen
    // we might keep a buffer of candidates to replay after receiving an offer.
    this._addIceCandidateToQueue(targetMid, candidate);
  }
};

/**
 * Handles the ANSWER Message event.
 * @method _answerHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ANSWER.message]
 * @trigger handshakeProgress
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], message.sdp);

  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
  var answer = new window.RTCSessionDescription(message);

  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
  	log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
  		pc.remoteDescription);
    return;
  }

  // if firefox and peer is mcu, replace the sdp to suit mcu needs
  if (window.webrtcDetectedType === 'moz' && targetMid === 'MCU') {
    message.sdp = message.sdp.replace(/ generation 0/g, '');
    message.sdp = message.sdp.replace(/ udp /g, ' UDP ');
  }
  pc.setRemoteDescription(new window.RTCSessionDescription(answer), function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    self._addIceCandidateFromQueue(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};

/**
 * Sends Message object to either a targeted Peer or Broadcasts to all Peers connected in the Room.
 * - Message is sent using the socket connection to the signaling server and relayed to
 *   the recipient(s). For direct messaging to a recipient refer to
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.
 * @method sendMessage
 * @param {String|JSON} message The message data to send.
 * @param {String} [targetPeerId] PeerId of the peer to send a private
 *   message data to. If not specified then send to all peers.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendMessage('Hi there!');
 *
 *   // Example 2: Send to a targeted peer
 *   SkylinkDemo.sendMessage('Hi there peer!', targetPeerId);
 * @trigger incomingMessage
 * @component Message
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var params = {
    cid: this._key,
    data: message,
    mid: this._user.sid,
    rid: this._room.id,
    type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
  };
  if (targetPeerId) {
    params.target = targetPeerId;
    params.type = this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE;
  }
  log.log([targetPeerId, null, null,
    'Sending message to peer' + ((targetPeerId) ? 's' : '')]);
  this._sendChannelMessage(params);
  this._trigger('incomingMessage', {
    content: message,
    isPrivate: (targetPeerId) ? true: false,
    targetPeerId: targetPeerId || null,
    isDataChannel: false,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};
Skylink.prototype.VIDEO_CODEC = {
  VP8: 'VP8',
  H264: 'H264'
};

/**
 * The list of available Video Codecs.
 * - Note that setting this video codec does not mean that it will be
 *   the primary codec used for the call as it may vary based on the offerer's
 *   codec set.
 * - The available video codecs are:
 * @attribute AUDIO_CODEC
 * @param {String} OPUS Use the OPUS video codec.
 *   This is the common and mandantory video codec used. This codec supports stereo.
 * @param {String} ISAC Use the ISAC video codec.
 *   This only works if the browser supports ISAC. This codec is mono based.
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.AUDIO_CODEC = {
  ISAC: 'ISAC',
  OPUS: 'opus'
};

/**
 * Stores the preferred audio codec.
 * @attribute _selectedAudioCodec
 * @type String
 * @default Skylink.AUDIO_CODEC.OPUS
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._selectedAudioCodec = 'opus';

/**
 * Stores the preferred video codec.
 * @attribute _selectedVideoCodec
 * @type String
 * @default Skylink.VIDEO_CODEC.VP8
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._selectedVideoCodec = 'VP8';


/**
 * The list of recommended video resolutions.
 * - Note that the higher the resolution, the connectivity speed might
 *   be affected.
 * - The available video resolutions type are:
 * @param {JSON} QQVGA QQVGA resolution.
 * @param {Integer} QQVGA.width 160
 * @param {Integer} QQVGA.height 120
 * @param {String} QQVGA.aspectRatio 4:3
 * @param {JSON} HQVGA HQVGA resolution.
 * @param {Integer} HQVGA.width 240
 * @param {Integer} HQVGA.height 160
 * @param {String} HQVGA.aspectRatio 3:2
 * @param {JSON} QVGA QVGA resolution.
 * @param {Integer} QVGA.width 320
 * @param {Integer} QVGA.height 180
 * @param {String} QVGA.aspectRatio 4:3
 * @param {JSON} WQVGA WQVGA resolution.
 * @param {Integer} WQVGA.width 384
 * @param {Integer} WQVGA.height 240
 * @param {String} WQVGA.aspectRatio 16:10
 * @param {JSON} HVGA HVGA resolution.
 * @param {Integer} HVGA.width 480
 * @param {Integer} HVGA.height 320
 * @param {String} HVGA.aspectRatio 3:2
 * @param {JSON} VGA VGA resolution.
 * @param {Integer} VGA.width 640
 * @param {Integer} VGA.height 360
 * @param {String} VGA.aspectRatio 4:3
 * @param {JSON} WVGA WVGA resolution.
 * @param {Integer} WVGA.width 768
 * @param {Integer} WVGA.height 480
 * @param {String} WVGA.aspectRatio 16:10
 * @param {JSON} FWVGA FWVGA resolution.
 * @param {Integer} FWVGA.width 854
 * @param {Integer} FWVGA.height 480
 * @param {String} FWVGA.aspectRatio 16:9
 * @param {JSON} SVGA SVGA resolution.
 * @param {Integer} SVGA.width 800
 * @param {Integer} SVGA.height 600
 * @param {String} SVGA.aspectRatio 4:3
 * @param {JSON} DVGA DVGA resolution.
 * @param {Integer} DVGA.width 960
 * @param {Integer} DVGA.height 640
 * @param {String} DVGA.aspectRatio 3:2
 * @param {JSON} WSVGA WSVGA resolution.
 * @param {Integer} WSVGA.width 1024
 * @param {Integer} WSVGA.height 576
 * @param {String} WSVGA.aspectRatio 16:9
 * @param {JSON} HD HD resolution.
 * @param {Integer} HD.width 1280
 * @param {Integer} HD.height 720
 * @param {String} HD.aspectRatio 16:9
 * @param {JSON} HDPLUS HDPLUS resolution.
 * @param {Integer} HDPLUS.width 1600
 * @param {Integer} HDPLUS.height 900
 * @param {String} HDPLUS.aspectRatio 16:9
 * @param {JSON} FHD FHD resolution.
 * @param {Integer} FHD.width 1920
 * @param {Integer} FHD.height 1080
 * @param {String} FHD.aspectRatio 16:9
 * @param {JSON} QHD QHD resolution.
 * @param {Integer} QHD.width 2560
 * @param {Integer} QHD.height 1440
 * @param {String} QHD.aspectRatio 16:9
 * @param {JSON} WQXGAPLUS WQXGAPLUS resolution.
 * @param {Integer} WQXGAPLUS.width 3200
 * @param {Integer} WQXGAPLUS.height 1800
 * @param {String} WQXGAPLUS.aspectRatio 16:9
 * @param {JSON} UHD UHD resolution.
 * @param {Integer} UHD.width 3840
 * @param {Integer} UHD.height 2160
 * @param {String} UHD.aspectRatio 16:9
 * @param {JSON} UHDPLUS UHDPLUS resolution.
 * @param {Integer} UHDPLUS.width 5120
 * @param {Integer} UHDPLUS.height 2880
 * @param {String} UHDPLUS.aspectRatio 16:9
 * @param {JSON} FUHD FUHD resolution.
 * @param {Integer} FUHD.width 7680
 * @param {Integer} FUHD.height 4320
 * @param {String} FUHD.aspectRatio 16:9
 * @param {JSON} QUHD  resolution.
 * @param {Integer} QUHD.width 15360
 * @param {Integer} QUHD.height 8640
 * @param {String} QUHD.aspectRatio 16:9
 * @attribute VIDEO_RESOLUTION
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120, aspectRatio: '4:3' },
  HQVGA: { width: 240, height: 160, aspectRatio: '3:2' },
  QVGA: { width: 320, height: 180, aspectRatio: '4:3' },
  WQVGA: { width: 384, height: 240, aspectRatio: '16:10' },
  HVGA: { width: 480, height: 320, aspectRatio: '3:2' },
  VGA: { width: 640, height: 360, aspectRatio: '4:3' },
  WVGA: { width: 768, height: 480, aspectRatio: '16:10' },
  FWVGA: { width: 854, height: 480, aspectRatio: '16:9' },
  SVGA: { width: 800, height: 600, aspectRatio: '4:3' },
  DVGA: { width: 960, height: 640, aspectRatio: '3:2' },
  WSVGA: { width: 1024, height: 576, aspectRatio: '16:9' },
  HD: { width: 1280, height: 720, aspectRatio: '16:9' },
  HDPLUS: { width: 1600, height: 900, aspectRatio: '16:9' },
  FHD: { width: 1920, height: 1080, aspectRatio: '16:9' },
  QHD: { width: 2560, height: 1440, aspectRatio: '16:9' },
  WQXGAPLUS: { width: 3200, height: 1800, aspectRatio: '16:9' },
  UHD: { width: 3840, height: 2160, aspectRatio: '16:9' },
  UHDPLUS: { width: 5120, height: 2880, aspectRatio: '16:9' },
  FUHD: { width: 7680, height: 4320, aspectRatio: '16:9' },
  QUHD: { width: 15360, height: 8640, aspectRatio: '16:9' }
};

/**
 * The list of local media streams.
 * @attribute _mediaStreams
 * @type Array
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStreams = [];

/**
 * The user stream settings.
 * @attribute _defaultStreamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio] If user enables audio, this is the default setting.
 * @param {Boolean} [audio.stereo] Enabled stereo or not
 * @param {Boolean|JSON} [video] If user enables video, this is the default setting.
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [video.resolution.width] Video width
 * @param {Integer} [video.resolution.height] Video height
 * @param {Integer} [video.frameRate] Maximum frameRate of Video
 * @param {String} bandwidth Bandwidth settings.
 * @param {String} bandwidth.audio Audio default Bandwidth
 * @param {String} bandwidth.video Video default Bandwidth
 * @param {String} bandwidth.data Data default Bandwidth.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype._defaultStreamSettings = {
  audio: {
    stereo: false
  },
  video: {
    resolution: {
      width: 640,
      height: 480
    },
    frameRate: 50
  },
  bandwidth: {
    audio: 50,
    video: 256,
    data: 1638400
  }
};

/**
 * The user stream settings.
 * @attribute _streamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio
 * @param {Boolean} [audio.stereo] Enabled stereo or not
 * @param {Boolean|JSON} [video=false] This call requires video
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [video.resolution.width] Video width
 * @param {Integer} [video.resolution.height] Video height
 * @param {Integer} [video.frameRate] Maximum frameRate of Video
 * @param {String} [bandwidth] Bandwidth settings
 * @param {String} [bandwidth.audio] Audio Bandwidth
 * @param {String} [bandwidth.video] Video Bandwidth
 * @param {String} [bandwidth.data] Data Bandwidth.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._streamSettings = {};

/**
 * The getUserMedia settings parsed from
 * {{#crossLink "Skylink/_streamSettings:attr"}}_streamSettings{{/crossLink}}.
 * @attribute _getUserMediaSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio.
 * @param {Boolean|JSON} [video=false] This call requires video.
 * @param {Integer} [video.mandatory.maxHeight] Video maximum width.
 * @param {Integer} [video.mandatory.maxWidth] Video maximum height.
 * @param {Integer} [video.mandatory.maxFrameRate] Maximum frameRate of Video.
 * @param {Array} [video.optional] The getUserMedia options.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._getUserMediaSettings = {};

/**
 * The user MediaStream(s) status.
 * @attribute _mediaStreamsStatus
 * @type JSON
 * @param {Boolean} [audioMuted=true] Is user's audio muted.
 * @param {Boolean} [videoMuted=true] Is user's vide muted.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStreamsStatus = {};

/**
 * Fallback to audio call if audio and video is required.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @required
 * @component Stream
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Access to user's MediaStream is successful.
 * @method _onUserMediaSuccess
 * @param {MediaStream} stream MediaStream object.
 * @trigger mediaAccessSuccess
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);
  self._trigger('mediaAccessSuccess', stream);

  var streamEnded = function () {
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.STREAM,
      mid: self._user.sid,
      rid: self._room.id,
      status: 'ended'
    });
    self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true);
  };
  stream.onended = streamEnded;

  // Workaround for local stream.onended because firefox has not yet implemented it
  if (window.webrtcDetectedBrowser === 'firefox') {
    stream.onended = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }

      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.onended);
        // trigger that it has ended
        streamEnded();

      } else {
        stream.recordedTime = stream.currentTime;
      }

    }, 1000);
  }

  // check if readyStateChange is done
  self._condition('readyStateChange', function () {
    self._mediaStreams[stream.id] = stream;

    self._muteLocalMediaStreams();

    // check if users is in the room already
    self._condition('peerJoined', function () {
      self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo());
    }, function () {
      return self._inRoom;
    }, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Access to user's MediaStream failed.
 * @method _onUserMediaError
 * @param {Object} error Error object that was thrown.
 * @trigger mediaAccessError
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error) {
  var self = this;
  log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
  if (self._audioFallback && self._streamSettings.video) {
    // redefined the settings for video as false
    self._streamSettings.video = false;

    log.debug([null, 'MediaStream', null, 'Falling back to audio stream call']);
    window.getUserMedia({
      audio: true
    }, function(stream) {
      self._onUserMediaSuccess(stream);
    }, function(error) {
      log.error([null, 'MediaStream', null,
        'Failed retrieving audio in audio fallback:'], error);
      self._trigger('mediaAccessError', error);
    });
    this.getUserMedia({ audio: true });
  } else {
    log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
   self._trigger('mediaAccessError', error);
  }
};

/**
 * The remote peer advertised streams, that we are forwarding to the app. This is part
 * of the peerConnection's addRemoteDescription() API's callback.
 * @method _onRemoteStreamAdded
 * @param {String} targetMid PeerId of the peer that has remote stream to send.
 * @param {Event}  event This is provided directly by the peerconnection API.
 * @trigger incomingStream
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, event) {
  var self = this;

  if(targetMid !== 'MCU') {
    if (!self._peerInformations[targetMid]) {
      log.error([targetMid, 'MediaStream', event.stream.id,
          'Received remote stream when peer is not connected. ' +
          'Ignoring stream ->'], event.stream);
      return;
    }

    console.log(self._peerInformations[targetMid].settings);
    if (!self._peerInformations[targetMid].settings.audio &&
      !self._peerInformations[targetMid].settings.video) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Receive remote stream but ignoring stream as it is empty ->'
        ], event.stream);
      return;
    }
    log.log([targetMid, 'MediaStream', event.stream.id,
      'Received remote stream ->'], event.stream);
    self._trigger('incomingStream', targetMid, event.stream,
      false, self._peerInformations[targetMid]);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires audio
 * @param {Boolean} [options.stereo] Enabled stereo or not.
 * @return {JSON} The parsed audio options.
 * - settings: User set audio options
 * - userMedia: getUserMedia options
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseAudioStreamSettings = function (audioOptions) {
  audioOptions = (typeof audioOptions === 'object') ?
    audioOptions : !!audioOptions;

  // Cleaning of unwanted keys
  if (audioOptions !== false) {
    audioOptions = (typeof audioOptions === 'boolean') ? {} : audioOptions;
    var tempAudioOptions = {};
    tempAudioOptions.stereo = !!audioOptions.stereo;
    audioOptions = tempAudioOptions;
  }

  var userMedia = (typeof audioOptions === 'object') ?
    true : audioOptions;

  return {
    settings: audioOptions,
    userMedia: userMedia
  };
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires video
 * @param {JSON} [options.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.resolution.width] Video width
 * @param {Integer} [options.resolution.height] Video height
 * @param {Integer} [options.frameRate] Maximum frameRate of Video
 * @return {JSON} The parsed video options.
 * - settings: User set video options
 * - userMedia: getUserMedia options
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._parseVideoStreamSettings = function (videoOptions) {
  videoOptions = (typeof videoOptions === 'object') ?
    videoOptions : !!videoOptions;

  var userMedia = false;

  // Cleaning of unwanted keys
  if (videoOptions !== false) {
    videoOptions = (typeof videoOptions === 'boolean') ?
      { resolution: {} } : videoOptions;
    var tempVideoOptions = {};
    // set the resolution parsing
    videoOptions.resolution = videoOptions.resolution || {};
    tempVideoOptions.resolution = tempVideoOptions.resolution || {};
    // set resolution
    tempVideoOptions.resolution.width = videoOptions.resolution.width ||
      this._defaultStreamSettings.video.resolution.width;
    tempVideoOptions.resolution.height = videoOptions.resolution.height ||
      this._defaultStreamSettings.video.resolution.height;
    // set the framerate
    tempVideoOptions.frameRate = videoOptions.frameRate ||
      this._defaultStreamSettings.video.frameRate;
    videoOptions = tempVideoOptions;

    userMedia = {
      mandatory: {
        //minWidth: videoOptions.resolution.width,
        //minHeight: videoOptions.resolution.height,
        maxWidth: videoOptions.resolution.width,
        maxHeight: videoOptions.resolution.height,
        //minFrameRate: videoOptions.frameRate,
        maxFrameRate: videoOptions.frameRate
      },
      optional: []
    };

    //Remove maxFrameRate for AdapterJS to work with Safari
    if (window.webrtcDetectedType === 'plugin') {
      delete userMedia.mandatory.maxFrameRate;
    }
  }

  return {
    settings: videoOptions,
    userMedia: userMedia
  };
};

/**
 * Parse and set bandwidth settings.
 * @method _parseBandwidthSettings
 * @param {String} [options] Bandwidth settings
 * @param {String} [options.audio=50] Audio Bandwidth
 * @param {String} [options.video=256] Video Bandwidth
 * @param {String} [options.data=1638400] Data Bandwidth
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseBandwidthSettings = function (bwOptions) {
  bwOptions = (typeof bwOptions === 'object') ?
    bwOptions : {};

  // set audio bandwidth
  bwOptions.audio = (typeof bwOptions.audio === 'number') ?
    bwOptions.audio : 50;
  // set video bandwidth
  bwOptions.video = (typeof bwOptions.video === 'number') ?
    bwOptions.video : 256;
  // set data bandwidth
  bwOptions.data = (typeof bwOptions.data === 'number') ?
    bwOptions.data : 1638400;

  // set the settings
  this._streamSettings.bandwidth = bwOptions;
};

/**
 * Parse stream settings
 * @method _parseMutedSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @return {JSON} The parsed muted options.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMutedSettings = function (options) {
  // the stream options
  options = (typeof options === 'object') ?
    options : { audio: false, video: false };

  var updateAudioMuted = (typeof options.audio === 'object') ?
    !!options.audio.mute : !options.audio;
  var updateVideoMuted = (typeof options.video === 'object') ?
    !!options.video.mute : !options.video;

  return {
    audioMuted: updateAudioMuted,
    videoMuted: updateVideoMuted
  };
};

/**
 * Parse stream default settings
 * @method _parseDefaultMediaStreamSettings
 * @param {JSON} options Media default Constraints.
 * @param {Boolean|JSON} [options.maxWidth=640] Video default width.
 * @param {Boolean} [options.maxHeight=480] Video default height.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype._parseDefaultMediaStreamSettings = function(options) {
  var hasMediaChanged = false;

  // prevent undefined error
  options = options || {};

  log.debug('Parsing stream settings. Default stream options:', options);

  options.maxWidth = (typeof options.maxWidth === 'number') ? options.maxWidth :
    640;
  options.maxHeight = (typeof options.maxHeight === 'number') ? options.maxHeight :
    480;

  // parse video resolution. that's for now
  this._defaultStreamSettings.video.resolution.width = options.maxWidth;
  this._defaultStreamSettings.video.resolution.height = options.maxHeight;

  log.debug('Parsed default media stream settings', this._defaultStreamSettings);
};

/**
 * Parse stream settings
 * @method _parseMediaStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._parseMediaStreamSettings = function(options) {
  var hasMediaChanged = false;

  options = options || {};

  log.debug('Parsing stream settings. Stream options:', options);

  // Set audio settings
  var audioSettings = this._parseAudioStreamSettings(options.audio);
  // check for change
  this._streamSettings.audio = audioSettings.settings;
  this._getUserMediaSettings.audio = audioSettings.userMedia;

  // Set video settings
  var videoSettings = this._parseVideoStreamSettings(options.video);
  // check for change
  this._streamSettings.video = videoSettings.settings;
  this._getUserMediaSettings.video = videoSettings.userMedia;

  // Set user media status options
  var mutedSettings = this._parseMutedSettings(options);

  this._mediaStreamsStatus = mutedSettings;

  log.debug('Parsed user media stream settings', this._streamSettings);

  log.debug('User media status:', this._mediaStreamsStatus);
};

/**
 * Sends our Local MediaStreams to other Peers.
 * By default, it sends all it's other stream
 * @method _addLocalMediaStreams
 * @param {String} peerId The peerId of the peer to send local stream to.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);
    if (Object.keys(this._mediaStreams).length > 0) {
      for (var stream in this._mediaStreams) {
        if (this._mediaStreams.hasOwnProperty(stream)) {
          var pc = this._peerConnections[peerId];

          if (pc) {
            if (pc.signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
              pc.addStream(this._mediaStreams[stream]);
            } else {
              log.warn([peerId, 'MediaStream', stream,
                'Not adding stream as signalingState is closed']);
            }
            log.debug([peerId, 'MediaStream', stream, 'Sending stream']);
          } else {
            log.warn([peerId, 'MediaStream', stream,
              'Not adding stream as peerconnection object does not exists']);
          }
        }
      }
    } else {
      log.warn([peerId, null, null, 'No media to send. Will be only receiving']);
    }
  } catch (error) {
    // Fix errors thrown like NS_ERROR_UNEXPECTED
    log.error([peerId, null, null, 'Failed adding local stream'], error);
  }
};

/**
 * Stops all MediaStreams(s) playback and streaming.
 * @method stopStream
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function () {
  for (var streamId in this._mediaStreams) {
    if (this._mediaStreams.hasOwnProperty(streamId)) {
      this._mediaStreams[streamId].stop();
    }
  }

  if (Object.keys(this._mediaStreams).length > 0) {
    this._trigger('mediaAccessStopped');
  }
  this._mediaStreams = [];
};

/**
 * Handles the muting of audio and video streams.
 * @method _muteLocalMediaStreams
 * @return options If MediaStream(s) has specified tracks.
 * @return options.hasAudioTracks If MediaStream(s) has audio tracks.
 * @return options.hasVideoTracks If MediaStream(s) has video tracks.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._muteLocalMediaStreams = function () {
  var hasAudioTracks = false;
  var hasVideoTracks = false;

  // Loop and enable tracks accordingly
  for (var streamId in this._mediaStreams) {
    if (this._mediaStreams.hasOwnProperty(streamId)) {
      var audioTracks = this._mediaStreams[streamId].getAudioTracks();
      var videoTracks = this._mediaStreams[streamId].getVideoTracks();

      hasAudioTracks = audioTracks.length > 0 || hasAudioTracks;
      hasVideoTracks = videoTracks.length > 0 || hasVideoTracks;

      // loop audio tracks
      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].enabled = this._mediaStreamsStatus.audioMuted !== true;
      }
      // loop video tracks
      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].enabled = this._mediaStreamsStatus.videoMuted !== true;
      }
    }
  }

  // update accordingly if failed
  if (!hasAudioTracks) {
    //this._mediaStreamsStatus.audioMuted = true;
    this._streamSettings.audio = false;
  }
  if (!hasVideoTracks) {
    //this._mediaStreamsStatus.videoMuted = true;
    this._streamSettings.video = false;
  }

  log.log('Update to isAudioMuted status ->', this._mediaStreamsStatus.audioMuted);
  log.log('Update to isVideoMuted status ->', this._mediaStreamsStatus.videoMuted);

  return {
    hasAudioTracks: hasAudioTracks,
    hasVideoTracks: hasVideoTracks
  };
};

/**
 * Waits for MediaStream.
 * - Once the stream is loaded, callback is called
 * - If there's not a need for stream, callback is called
 * @method _waitForLocalMediaStream
 * @param {Function} callback Callback after requested constraints are loaded.
 * @param {JSON} [options] Media Constraints.
 * @param {JSON} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Maximum frameRate of Video
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @trigger mediaAccessRequired
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._waitForLocalMediaStream = function(callback, options) {
  var self = this;
  options = options || {};

  // get the stream
  if (options.manualGetUserMedia === true) {
    self._trigger('mediaAccessRequired');
  }
  // If options video or audio false, do the opposite to throw a true.
  var requireAudio = !!options.audio;
  var requireVideo = !!options.video;

  log.log('Requested audio:', requireAudio);
  log.log('Requested video:', requireVideo);

  // check if it requires audio or video
  if (!requireAudio && !requireVideo && !options.manualGetUserMedia) {
    // set to default
    if (options.audio === false && options.video === false) {
      self._parseMediaStreamSettings(options);
    }

    callback();
    return;
  }

  // get the user media
  if (!options.manualGetUserMedia && (options.audio || options.video)) {
    self.getUserMedia({
      audio: options.audio,
      video: options.video
    });
  }

  // clear previous mediastreams
  self.stopStream();

  var current50Block = 0;
  var mediaAccessRequiredFailure = false;

  // wait for available audio or video stream
  self._wait(function () {
    if (mediaAccessRequiredFailure === true) {
      self._onUserMediaError('Waiting for stream timeout');

    } else {
      callback();
    }

  }, function () {
    var hasAudio = !requireAudio;
    var hasVideo = !requireVideo;

    // for now we require one MediaStream with both audio and video
    // due to firefox non-supported audio or video
    for (var streamId in self._mediaStreams) {
      if (self._mediaStreams.hasOwnProperty(streamId)) {
        var stream = self._mediaStreams[streamId];

        if (stream && options.manualGetUserMedia) {
          return true;
        }

        // do the check
        if (requireAudio) {
          hasAudio = stream.getAudioTracks().length > 0;
        }
        if (requireVideo) {
          hasVideo =  stream.getVideoTracks().length > 0;
        }
        if (hasAudio && hasVideo) {
          return true;
        }
      }
    }

    if (options.manualGetUserMedia === true) {
      current50Block += 1;
      if (current50Block === 600) {
        mediaAccessRequiredFailure = true;
        return true;
      }
    }
  }, 50);
};

/**
 * Gets the default video source and microphone source.
 * - This is an implemented function for Skylink.
 * - Constraints are not the same as the [MediaStreamConstraints](http://dev.w3.
 *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
 *   -mediastreamconstraints-members) specified in the w3c specs.
 * - Calling <b>getUserMedia</b> while having streams being sent to another peer may
 *   actually cause problems, because currently <b>getUserMedia</b> refreshes all streams.
 * @method getUserMedia
 * @param {JSON} [options]  MediaStream constraints.
 * @param {JSON|Boolean} [options.audio=true] Option to allow audio stream.
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate]
 *   The video stream maximum frameRate.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {Function} [callback] The callback fired after media was successfully accessed.
 *   Default signature: function(error object, success object)
 * @example
 *   // Default is to get both audio and video
 *   // Example 1: Get both audio and video by default.
 *   SkylinkDemo.getUserMedia();
 *
 *   // Example 2: Get the audio stream only
 *   SkylinkDemo.getUserMedia({
 *     'video' : false,
 *     'audio' : true
 *   });
 *
 *   // Example 3: Set the stream settings for the audio and video
 *   SkylinkDemo.getUserMedia({
 *     'video' : {
 *        'resolution': SkylinkDemo.VIDEO_RESOLUTION.HD,
 *        'frameRate': 50
 *      },
 *     'audio' : {
 *       'stereo': true
 *     }
 *   });
 *
 *   // Example 4: Get user media with callback
 *   SkylinkDemo.getUserMedia({
 *     'video' : false,
 *     'audio' : true
 *   },function(error,success){
 *      if (error){
 *        console.log(error);
 *      }
 *      else{
 *        console.log(success);
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError, streamEnded
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  if (!options){
    options = {
      audio: true,
      video: true
    };
  }
  else if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };
  }

  // parse stream settings
  self._parseMediaStreamSettings(options);

  // if audio and video is false, do not call getUserMedia
  if (!(options.audio === false && options.video === false)) {
    // clear previous mediastreams
    self.stopStream();
    try {
      window.getUserMedia(self._getUserMediaSettings, function (stream) {
        self._onUserMediaSuccess(stream);
        if (typeof callback === 'function'){
          callback(null,stream);
        }
      }, function (error) {
        self._onUserMediaError(error);
        if (typeof callback === 'function'){
          callback(error,null);
        }
      });
    } catch (error) {
      self._onUserMediaError(error);
      if (typeof callback === 'function'){
        callback(error,null);
      }
    }
  } else {
    log.warn([null, 'MediaStream', null, 'Not retrieving stream']);
  }
};

/**
 * Resends a Local MediaStreams. This overrides all previous MediaStreams sent.
 * Provided MediaStream would be automatically detected as unmuted by default.
 * @method sendStream
 * @param {Object|JSON} stream The stream object or options.
 * @param {Boolean} [stream.audio=false] If send a new stream with audio.
 * @param {Boolean} [stream.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [stream.audio.mute=false] If send a new stream with audio muted.
 * @param {JSON|Boolean} [stream.video=false] Option to allow video stream.
 * @param {JSON} [stream.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [stream.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [stream.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [stream.video.frameRate]
 *   The video stream maximum frameRate.
 * @param {Boolean} [stream.video.mute=false] If send a new stream with video muted.
 * @param {Function} [callback] The callback fired after stream was sent.
 *   Default signature: function(error object, success object)
 * @example
 *   // Example 1: Send a stream object instead
 *   SkylinkDemo.on('mediaAccessSuccess', function (stream) {
 *     SkylinkDemo.sendStream(stream);
 *   });
 *
 *   // Example 2: Send stream with getUserMedia automatically called for you
 *   SkylinkDemo.sendStream({
 *     audio: true,
 *     video: false
 *   });
 *
 *   // Example 3: Send stream with getUserMedia automatically called for you
 *   // and audio is muted
 *   SkylinkDemo.sendStream({
 *     audio: { mute: true },
 *     video: false
 *   });
 *
 *   // Example 4: Send stream with callback
 *   SkylinkDemo.sendStream({
 *    audio: true,
 *    video: true
 *   },function(error,success){
 *    if (error){
 *      console.log('Error occurred. Stream was not sent: '+error)
 *    }
 *    else{
 *      console.log('Stream successfully sent: '+success);
 *    }
 *   });
 *
 * @trigger peerRestart, incomingStream
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(stream, callback) {
  var self = this;
  var restartCount = 0;
  var peerCount = Object.keys(self._peerConnections).length;

  if (typeof stream !== 'object') {
    var error = 'Provided stream settings is not an object';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }

  // Stream object
  // getAudioTracks or getVideoTracks first because adapterjs
  // has not implemeneted MediaStream as an interface
  // interopability with firefox and chrome
  //MediaStream = MediaStream || webkitMediaStream;
  // NOTE: eventually we should do instanceof
  if (typeof stream.getAudioTracks === 'function' ||
    typeof stream.getVideoTracks === 'function') {
    // stop playback
    self.stopStream();
    // send the stream
    if (!self._mediaStreams[stream.id]) {
      self._onUserMediaSuccess(stream);
    }

    self._mediaStreamsStatus.audioMuted = false;
    self._mediaStreamsStatus.videoMuted = false;

    self._streamSettings.audio = stream.getAudioTracks().length > 0;
    self._streamSettings.video = stream.getVideoTracks().length > 0;

    if (typeof callback === 'function'){
      self.once('peerRestart',function(peerId, peerInfo, isSelfInitiatedRestart){
        log.log([null, 'MediaStream', stream.id,
          'Stream was sent. Firing callback'], stream);
        callback(null,stream);
        restartCount = 0; //reset counter
      },function(peerId, peerInfo, isSelfInitiatedRestart){
        if (isSelfInitiatedRestart){
          restartCount++;
          if (restartCount === peerCount){
            return true;
          }
        }
        return false;
      },false);
    }

    for (var peer in self._peerConnections) {
      if (self._peerConnections.hasOwnProperty(peer)) {
        self._restartPeerConnection(peer, true);
      }
    }

    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

  // Options object
  } else {

    if (typeof callback === 'function'){
        self.once('peerRestart',function(peerId, peerInfo, isSelfInitiatedRestart){
          log.log([null, 'MediaStream', stream.id,
            'Stream was sent. Firing callback'], stream);
          callback(null,stream);
          restartCount = 0; //reset counter
        },function(peerId, peerInfo, isSelfInitiatedRestart){
          if (isSelfInitiatedRestart){
            restartCount++;
            if (restartCount === peerCount){
              return true;
            }
          }
          return false;
        },false);
      }

    // get the mediastream and then wait for it to be retrieved before sending
    self._waitForLocalMediaStream(function () {
      // mute unwanted streams
      for (var peer in self._peerConnections) {
        if (self._peerConnections.hasOwnProperty(peer)) {
          self._restartPeerConnection(peer, true);
        }
      }

      self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
    }, stream);
  }
};

/**
 * Mutes a Local MediaStreams.
 * @method muteStream
 * @param {Object|JSON} options The muted options.
 * @param {Boolean} [options.audioMuted=true] If send a new stream with audio muted.
 * @param {Boolean} [options.videoMuted=true] If send a new stream with video muted.
 * @param {Boolean} [options.getEmptyStream=false] If audio or video muted is set and there is
 *   no audio or video stream, it will get the stream before muting it.
 * @example
 *   SkylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 * @trigger peerRestart, peerUpdated, incomingStream
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  if (Object.keys(self._mediaStreams).length === 0) {
    log.warn('No streams are available to mute / unmute!');
    return;
  }

  // set the muted status
  if (typeof options.audioMuted === 'boolean') {
    self._mediaStreamsStatus.audioMuted = !!options.audioMuted;
  }
  if (typeof options.videoMuted === 'boolean') {
    self._mediaStreamsStatus.videoMuted = !!options.videoMuted;
  }

  var hasTracksOption = self._muteLocalMediaStreams();
  var refetchAudio = false;
  var refetchVideo = false;

  // update to mute status of audio tracks
  if (!hasTracksOption.hasAudioTracks) {
    // do a refetch
    refetchAudio = options.audioMuted === false && options.getEmptyStream === true;
  }

  // update to mute status of video tracks
  if (!hasTracksOption.hasVideoTracks) {
    // do a refetch
    refetchVideo = options.videoMuted === false && options.getEmptyStream === true;
  }

  // do a refetch
  if (refetchAudio || refetchVideo) {
    // set the settings
    self._parseMediaStreamSettings({
      audio: options.audioMuted === false || self._streamSettings.audio,
      video: options.videoMuted === false || self._streamSettings.video
    });

    self.getUserMedia(self._streamSettings);

    self.once('mediaAccessSuccess', function (stream) {
      // mute unwanted streams
      for (var peer in self._peerConnections) {
        if (self._peerConnections.hasOwnProperty(peer)) {
          self._restartPeerConnection(peer, true);
        }
      }
      self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
    });
    // get the mediastream and then wait for it to be retrieved before sending
    /*self._waitForLocalMediaStream(function () {

    }, stream);*/

  } else {
    // update to mute status of video tracks
    if (hasTracksOption.hasVideoTracks) {
      // send message
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._mediaStreamsStatus.videoMuted
      });
    }
    // update to mute status of audio tracks
    if (hasTracksOption.hasAudioTracks) {
      // send message
      // set timeout to do a wait interval of 1s
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._mediaStreamsStatus.audioMuted
        });
      }, 1050);
    }
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  }
};

/**
 * Enable microphone.
 * - Try to start the audio source.
 * - If no audio source was initialy set, this function has no effect.
 * - If you want to activate your audio but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the audio parameter to true.
 * @method enableAudio
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @example
 *   SkylinkDemo.enableAudio();
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false,
    getEmptyStream: true
  });
};

/**
 * Disable microphone.
 * - Try to disable the microphone.
 * - If no microphone was initially set, this function has no effect.
 * @method disableAudio
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true,
    getEmptyStream: true
  });
};

/**
 * Enable webcam video.
 * - Try to start the video source.
 * - If no video source was initialy set, this function has no effect.
 * - If you want to activate your video but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the video parameter to true.
 * @method enableVideo
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false,
    getEmptyStream: true
  });
};

/**
 * Disable video source.
 * - Try to disable the video source.
 * - If no video source was initially set, this function has no effect.
 * @method disableVideo
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true,
    getEmptyStream: true
  });
};
Skylink.prototype._addSDPStereo = function(sdpLines) {
  var opusRtmpLineIndex = 0;
  var opusLineFound = false;
  var opusPayload = 0;
  var fmtpLineFound = false;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      var parts = line.split(' ');

      if (parts[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = parts[0].split(':')[1];
        opusRtmpLineIndex = i;
        break;
      }
    }
  }

  // if found
  if (opusLineFound) {
    log.debug([null, 'SDP', null, 'OPUS line is found. Enabling stereo']);

    // loop for fmtp payload
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('a=fmtp:' + opusPayload) === 0) {
        fmtpLineFound = true;
        sdpLines[j] += '; stereo=1';
        break;
      }
    }

    // if line doesn't exists for an instance firefox
    if (!fmtpLineFound) {
      sdpLines.splice(opusRtmpLineIndex, 0, 'a=fmtp:' + opusPayload + ' stereo=1');
    }
  }

  return sdpLines;
};


/**
 * Sets the video resolution by modifying the SDP.
 * - This is broken.
 * @method _setSDPVideoResolution
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Resolution settings
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPVideoResolution = function(sdpLines){
  var video = this._streamSettings.video;
  var frameRate = video.frameRate || 50;
  var resolution = {
    width: 320,
    height: 50
  }; //video.resolution || {};

  var videoLineFound = false;
  var videoLineIndex = 0;
  var fmtpPayloads = [];

  var i, j, k;
  var line;

  var sdpLineData = 'max-fr=' + frameRate +
    '; max-recv-width=320' + //(resolution.width ? resolution.width : 640) +
    '; max-recv-height=160'; //+ (resolution.height ? resolution.height : 480);

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=video') === 0 || line.indexOf('m=video') === 0) {
      videoLineFound = true;
      videoLineIndex = i;
      fmtpPayloads = line.split(' ');
      fmtpPayloads.splice(0, 3);
      break;
    }
  }

  if (videoLineFound) {
    // loop for every video codec
    // ignore if not vp8 or h264
    for (j = 0; j < fmtpPayloads.length; j += 1) {
      var payload = fmtpPayloads[j];
      var rtpmapLineIndex = 0;
      var fmtpLineIndex = 0;
      var fmtpLineFound = false;
      var ignore = false;

      for (k = 0; k < sdpLines.length; k += 1) {
       line = sdpLines[k];

        if (line.indexOf('a=rtpmap:' + payload) === 0) {
          // for non h264 or vp8 codec, ignore. these are experimental codecs
          // that may not exists afterwards
          if (!(line.indexOf('VP8') > 0 || line.indexOf('H264') > 0)) {
            ignore = true;
            break;
          }
          rtpmapLineIndex = k;
        }

        if (line.indexOf('a=fmtp:' + payload) === 0) {
          fmtpLineFound = true;
          fmtpLineIndex = k;
        }
      }

      if (ignore) {
        continue;
      }

      if (fmtpLineFound) {
        sdpLines[fmtpLineIndex] += ';' + sdpLineData;

      } else {
        sdpLines.splice(rtpmapLineIndex + 1, 0, 'a=fmtp:' + payload + ' ' + sdpLineData);
      }
    }

    log.debug([null, 'SDP', null, 'Setting video resolution (broken)']);
  }
  return sdpLines;
};

/**
 * Set the audio, video and data streamming bandwidth by modifying the SDP.
 * It sets the bandwidth when the connection is good. In low bandwidth environment,
 * the bandwidth is managed by the browser.
 * @method _setSDPBitrate
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(sdpLines, settings) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;
  var hasAudio = !!(settings || {}).audio;
  var hasVideo = !!(settings || {}).video;

  var i, j, k;

  var audioIndex = 0;
  var videoIndex = 0;
  var dataIndex = 0;

  var audioLineFound = false;
  var videoLineFound = false;
  var dataLineFound = false;

  for (i = 0; i < sdpLines.length; i += 1) {
    // set the audio bandwidth
    if (sdpLines[i].indexOf('a=audio') === 0 || sdpLines[i].indexOf('m=audio') === 0) {

      sdpLines.splice(i + 1, 0, 'b=AS:' + bandwidth.audio);

      log.debug([null, 'SDP', null, 'Setting audio bitrate (' +
        bandwidth.audio + ')'], i);
      break;
    }
  }

  for (j = 0; j < sdpLines.length; j += 1) {
    // set the video bandwidth
    if (sdpLines[j].indexOf('a=video') === 0 || sdpLines[j].indexOf('m=video') === 0) {
      sdpLines.splice(j + 1, 0, 'b=AS:' + bandwidth.video);

      log.debug([null, 'SDP', null, 'Setting video bitrate (' +
        bandwidth.video + ')'], j);
      break;
    }
  }

  for (k = 0; k < sdpLines.length; k += 1) {
    // set the data bandwidth
    if (sdpLines[k].indexOf('a=application') === 0 || sdpLines[k].indexOf('m=application') === 0) {
      sdpLines.splice(k + 1, 0, 'b=AS:' + bandwidth.data);

      log.debug([null, 'SDP', null, 'Setting data bitrate (' +
        bandwidth.data + ')'], k);
      break;
    }
  }
  return sdpLines;
};

/**
 * Sets the audio codec for the connection,
 * @method _setSDPVideoCodec
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPVideoCodec = function(sdpLines) {
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedVideoCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
        break;
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=video') === 0 || line.indexOf('a=video') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Sets the audio codec for the connection,
 * @method _setSDPAudioCodec
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPAudioCodec = function(sdpLines) {
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedAudioCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=audio') === 0 || line.indexOf('a=audio') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Removes Firefox 32 H262 preference in the SDP to prevent breaking connection in
 * unsupported browsers.
 * @method _removeSDPFirefoxH264Pref
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    log.debug([null, 'SDP', null, 'Firefox H264 invalid pref found:'], invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};
window.Skyway = window.Skylink = Skylink;
}).call(this);

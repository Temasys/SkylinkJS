/*! skylinkjs - v0.5.4 - 2014-11-12 */

(function() {
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
 *   SkylinkDemo.init('apiKey');
 *
 *   SkylinkDemo.joinRoom('my_room', {
 *     userData: 'My Username',
 *     audio: true,
 *     video: true
 *   });
 *
 *   SkylinkDemo.on('incomingStream', function (peerId, stream, isSelf) {
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
  this.VERSION = '0.5.4';
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
 * The current state if datachannel is enabled.
 * @attribute _enableDataChannel
 * @type Boolean
 * @default true
 * @private
 * @required
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Internal array of datachannels.
 * @attribute _dataChannels
 * @type Object
 * @private
 * @required
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = [];

/**
 * Create a DataChannel. Only SCTPDataChannel support
 * @method _createDataChannel
 * @param {String} peerId PeerId of the peer which the datachannel is connected to
 * @param {Object} [dc] The datachannel object received.
 * @trigger dataChannelState
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._createDataChannel = function(peerId, dc) {
  var self = this;
  var channelName = (dc) ? dc.label : peerId;
  var pc = self._peerConnections[peerId];
  var dcOpened = function () {
    log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'open');
    log.log([peerId, 'RTCDataChannel', channelName, 'Binary type support ->'], dc.binaryType);
    self._dataChannels[peerId] = dc;
    self._trigger('dataChannelState', dc.readyState, peerId);
  };
  if (window.webrtcDetectedDCSupport !== 'SCTP' &&
    window.webrtcDetectedDCSupport !== 'plugin') {
    log.warn([peerId, 'RTCDataChannel', channelName, 'SCTP not supported']);
    return;
  }
  if (!dc) {
    dc = pc.createDataChannel(channelName);
    self._trigger('dataChannelState', dc.readyState, peerId);
    var checkDcOpened = setInterval(function () {
      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        clearInterval(checkDcOpened);
        dcOpened();
      }
    }, 50);
  }
  if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    dcOpened();
  } else {
    dc.onopen = dcOpened;
  }
  dc.onerror = function(error) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], error);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
  };
  dc.onclose = function() {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'closed');
    self._closeDataChannel(peerId);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);

    // if closes because of firefox, reopen it again
    if (self._peerConnections[peerId]) {
      self._createDataChannel(peerId);
    }
  };
  dc.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName);
  };
};

/**
 * Sends data to the datachannel.
 * @method _sendDataChannelMessage
 * @param {String} peerId PeerId of the peer's datachannel to send data.
 * @param {JSON} data The data to send.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendDataChannelMessage = function(peerId, data) {
  var dc = this._dataChannels[peerId];
  if (!dc) {
    log.error([peerId, 'RTCDataChannel', dc.label, 'Datachannel connection ' +
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
 * Closes the datachannel.
 * @method _closeDataChannel
 * @param {String} peerId PeerId of the peer's datachannel to close.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId) {
  var dc = this._dataChannels[peerId];
  if (dc) {
    if (dc.readyState !== this.DATA_CHANNEL_STATE.CLOSED) {
      dc.close();
    }
    delete this._dataChannels[peerId];
    log.log([peerId, 'RTCDataChannel', dc.label, 'Sucessfully removed datachannel']);
  }
};
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * The fixed for each data chunk for firefox implementation.
 * - Firefox the sender chunks 49152 but receives as 16384.
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Integer
 * @private
 * @final
 * @required
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 16384;

/**
 * The list of data transfer data types.
 * - <b><i>TODO</i></b>: ArrayBuffer and Blob data transfer in
 *   datachannel.
 * - The available data transfer data types are:
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING BinaryString data type.
 * @param {String} ARRAY_BUFFER Still-implementing. ArrayBuffer data type.
 * @param {String} BLOB Still-implementing. Blob data type.
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Converts base64 string to raw binary data.
 * - Doesn't handle URLEncoded DataURIs
 * - See StackOverflow answer #6850276 for code that does this
 * This is to convert the base64 binary string to a blob
 * @author Code from devnull69 @ stackoverflow.com
 * @method _base64ToBlob
 * @param {String} dataURL Blob base64 dataurl.
 * @private
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
 * Chunks blob data into chunks.
 * @method _chunkBlobData
 * @param {Blob} blob The blob data to chunk.
 * @param {Integer} blobByteSize The blob data size.
 * @private
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
 * The list of datachannel transfer types.
 * - This is used to identify if the stream is an upload stream or
 *   a download stream.
 * - The available types are:
 * @attribute DATA_TRANSFER_TYPE
 * @type JSON
 * @param {String} UPLOAD The datachannel transfer is an upload stream.
 * @param {String} DOWNLOAD The datachannel transfer is a download stream.
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};
/**
 * The list of datachannel transfer state.
 * - These are the states to inform the state of the data transfer.
 * - The list of states would occur are:
 * @attribute DATA_TRANSFER_STATE
 * @type JSON
 * @param {String} UPLOAD_REQUEST Peer has a data transfer request.
 * @param {String} UPLOAD_STARTED Data transfer of upload has just started.
 * @param {String} DOWNLOAD_STARTED Data transfer of download has
 *   just started.
 * @param {String} UPLOADING Data upload transfer is occurring.
 * @param {String} DOWNLOADING Data download transfer is occurring.
 * @param {String} UPLOAD_COMPLETED Data upload transfer has been completed.
 * @param {String} DOWNLOAD_COMPLETED Data download transfer has been
 *   completed.
 * @param {String} REJECTED Peer rejected user's data transfer request.
 * @param {String} ERROR Data transfer had an error occurred
 *   when uploading or downloading file.
 * @readOnly
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
 * Internal array of data upload transfers.
 * @attribute _uploadDataTransfers
 * @type Array
 * @private
 * @required
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataTransfers = [];

/**
 * Internal array of data upload sessions.
 * @attribute _uploadDataSessions
 * @type Array
 * @private
 * @required
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataSessions = [];

/**
 * Internal array of data download transfers.
 * @attribute _downloadDataTransfers
 * @type Array
 * @private
 * @required
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataTransfers = [];

/**
 * Internal array of data download sessions.
 * @attribute _downloadDataSessions
 * @type Array
 * @private
 * @required
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataSessions = [];

/**
 * Internal array of data transfers timeout.
 * @attribute _dataTransfersTimeout
 * @type Array
 * @private
 * @required
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._dataTransfersTimeout = [];

/**
 * Sets the datachannel timeout.
 * - If timeout is met, it will send the 'ERROR' message
 * @method _setDataChannelTimeout
 * @param {String} peerId PeerId of the datachannel to set timeout.
 * @param {Integer} timeout The timeout to set in seconds.
 * @param {Boolean} [isSender=false] Is peer the sender or the receiver?
 * @private
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
 * Clears the datachannel timeout.
 * @method _clearDataChannelTimeout
 * @param {String} peerId PeerId of the datachannel to clear timeout.
 * @param {Boolean} [isSender=false] Is peer the sender or the receiver.
 * @private
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
 * Sends blob data to individual peer.
 * - This sends the {{#crossLink "Skylink/WRQ:event"}}WRQ{{/crossLink}}
 *   and to initiate the TFTP protocol.
 * @method _sendBlobDataToPeer
 * @param {Blob} data The blob data to be sent over.
 * @param {JSON} dataInfo The data information.
 * @param {String} dataInfo.transferId transferId of the data.
 * @param {String} dataInfo.name Data name.
 * @param {Integer} [dataInfo.timeout=60] Data timeout to wait for packets.
 * @param {Integer} dataInfo.size Data size
 * @param {String} [targetPeerId] PeerId targeted to receive data.
 *   Leave blank to send to all peers.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId) {
  var binarySize = parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
  var chunkSize = parseInt((this._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);
  if (window.webrtcDetectedBrowser === 'firefox' &&
    window.webrtcDetectedVersion < 30) {
    chunkSize = this._MOZ_CHUNK_FILE_SIZE;
  }
  log.log([targetPeerId, null, null, 'Chunk size of data:'], chunkSize);
  this._uploadDataTransfers[targetPeerId] = this._chunkBlobData(data, dataInfo.size);
  this._uploadDataSessions[targetPeerId] = {
    name: dataInfo.name,
    size: binarySize,
    transferId: dataInfo.transferId,
    timeout: dataInfo.timeout
  };
  this._sendDataChannelMessage(targetPeerId, {
    type: this._DC_PROTOCOL_TYPE.WRQ,
    sender: this._user.sid,
    agent: window.webrtcDetectedBrowser,
    name: dataInfo.name,
    size: binarySize,
    chunkSize: chunkSize,
    timeout: dataInfo.timeout
  });
  this._setDataChannelTimeout(targetPeerId, dataInfo.timeout, true);
};

/**
 * Handles all datachannel protocol events.
 * @method _dataChannelProtocolHandler
 * @param {String|Object} data The data received from datachannel.
 * @param {String} peerId The peerId of the peer that sent the data.
 * @param {String} channelName The datachannel name.
 * @private
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
 * The user receives a blob request.
 * From here, it's up to the user to accept or reject it
 * @method _WRQProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the request.
 * @param {JSON} data The data object received from datachannel.
 * @param {String} data.agent The peer's browser agent.
 * @param {Integer} data.version The peer's browser version.
 * @param {String} data.name The data name.
 * @param {Integer} data.size The data size.
 * @param {Integer} data.chunkSize The data chunk size expected to receive.
 * @param {Integer} data.timeout The timeout to wait for packet response.
 * @param {Boolean} data.isPrivate Is the data sent private.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type The type of datachannel message.
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
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
 * The user receives an acknowledge of the blob request.
 * @method _ACKProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the acknowledgement.
 * @param {JSON} data The data object received from datachannel.
 * @param {String} data.ackN The acknowledge request number.
 * - 0: Request accepted. First packet sent.
 * - 0 and above: Transfer is going on.
 * - -1: Request rejected.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type The type of datachannel message.
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelName) {
  var self = this;
  var ackN = data.ackN;
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
      transferId, peerId);
    delete self._uploadDataTransfers[peerId];
    delete self._uploadDataSessions[peerId];
  }
};

/**
 * The user receives a datachannel broadcast message.
 * @method _MESSAGEProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending a broadcast message.
 * @param {JSON} data The data object received from datachannel.
 * @param {String} data.target The target peerId to receive the data.
 * @param {String|JSON} data.data The data to be received.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type The type of datachannel message.
 * @param {String} channelName The datachannel name.
 * @trigger incomingMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelName) {
  var targetMid = data.sender;
  log.log([peerId, 'RTCDataChannel', [channelName, 'MESSAGE'],
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
 * The user receives a timeout error.
 * @method _ERRORProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the error.
 * @param {Array} data The data object received from datachannel.
 * @param {String} data.name The data name.
 * @param {String} data.content The error message.
 * @param {Boolean} [data.isUploadError=false] Is the error occurring at upload state.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type The type of datachannel message.
 * @param {String} channelName The datachannel name.
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
    transferId, peerId, null, {
    name: data.name,
    message: data.content,
    transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
      this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });
};

/**
 * The user receives a timeout error.
 * @method _CANCELProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the error.
 * @param {Array} data The data object received from datachannel.
 * @param {String} data.name The data name.
 * @param {String} data.content The error message.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type The type of datachannel message.
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelName) {
  var isUploader = data.isUploadError;
  var transferId = (isUploader) ? this._uploadDataSessions[peerId].transferId :
    this._downloadDataSessions[peerId].transferId;
  log.log([peerId, 'RTCDataChannel', [channelName, 'CANCEL'],
    'Received file transfer cancel request:'], data);
  this._clearDataChannelTimeout(peerId, isUploader);
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
    transferId, peerId, null, {
    name: data.name,
    content: data.content,
    senderPeerId: data.sender,
    transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
      this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });
};

/**
 * This is when the data is sent from the sender to the receiving user.
 * @method _DATAProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the data.
 * @param {ArrayBuffer|Blob|String} dataString The data received.
 * @param {String} dataType The data type received from datachannel.
 *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, dataString, dataType, channelName) {
  var chunk, error = '';
  var transferStatus = this._downloadDataSessions[peerId];
  var transferId = transferStatus.transferId;
  log.log([peerId, 'RTCDataChannel', [channelName, 'DATA'],
    'Received data chunk from peer. Data type:'], dataType);

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
      this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, null, {
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
      this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, null, {
      message: error,
      transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });
    log.error([peerId, 'RTCDataChannel', [channelName, 'DATA'],
      'Failed downloading data packets:'], error);
  }
};

/**
 * Start a data transfer with peer(s).
 * - Note that peers have the option to download or reject receiving the blob data.
 * - This method is ideal for sending files.
 * - To send a private file to a peer, input the peerId after the
 *   data information.
 * @method sendBlobData
 * @param {Object} data The data to be sent over. Data has to be a blob.
 * @param {JSON} dataInfo The data information.
 * @param {String} dataInfo.name Data name.
 * @param {Integer} [dataInfo.timeout=60] The timeout to wait for packets.
 * @param {Integer} dataInfo.size The data size
 * @param {String} [targetPeerId] PeerId targeted to receive data.
 *   Leave blank to send to all peers.
 * @example
 *   // Send file to all peers connected
 *   SkylinkDemo.sendBlobData(file, 67);
 *
 *   // Send file to individual peer
 *   SkylinkDemo.sendBlobData(blob, 87, targetPeerId);
 * @trigger dataTransferState
 * @since 0.5.2
 * @for Skylink
 */
Skylink.prototype.sendBlobData = function(data, dataInfo, targetPeerId) {
  if (!data && !dataInfo) {
    return false;
  }
  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    log.warn('Unable to send any blob data. Datachannel is disabled');
    return;
  }
  var noOfPeersSent = 0;
  dataInfo.timeout = dataInfo.timeout || 60;
  dataInfo.transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');

  if (targetPeerId) {
    if (this._dataChannels.hasOwnProperty(targetPeerId)) {
      log.log([targetPeerId, null, null, 'Sending blob data ->'], dataInfo);
      this._sendBlobDataToPeer(data, dataInfo, targetPeerId);
      noOfPeersSent = 1;
    } else {
      log.error([targetPeerId, null, null, 'Datachannel does not exist']);
    }
  } else {
    targetpeerId = this._user.sid;
    for (var peerId in this._dataChannels) {
      if (this._dataChannels.hasOwnProperty(peerId)) {
        // Binary String filesize [Formula n = 4/3]
        this._sendBlobDataToPeer(data, dataInfo, peerId);
        noOfPeersSent++;
      } else {
        log.error([peerId, null, null, 'Datachannel does not exist']);
      }
    }
  }
  if (noOfPeersSent > 0) {
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_STARTED,
      dataInfo.transferId, targetPeerId, {
      transferId: dataInfo.transferId,
      senderPeerId: this._user.sid,
      name: dataInfo.name,
      size: dataInfo.size,
      timeout: dataInfo.timeout || 60,
      data: data
    });
  } else {
    var error = 'No available datachannels to send data.';
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      dataInfo.transferId, targetPeerId, null, {
      message: error,
      transferType: this.DATA_TRANSFER_TYPE.UPLOAD
    });
    log.error('Failed sending data: ', error);
    this._uploadDataTransfers = [];
    this._uploadDataSessions = [];
  }
};

/**
 * User's response to accept or reject data transfer request.
 * @method respondBlobRequest
 * @param {String} peerId PeerId of the peer that is expected to receive
 *   the request response.
 * @param {Boolean} [accept=false] The response of the user to accept the data
 *   transfer or not.
 * @trigger dataTransferState
 * @since 0.5.0
 * @for Skylink
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
 * Reject file transfer for cancel.
 * @method cancelBlobTransfer
 * @param {String} peerId PeerId of the peer that is expected to receive
 *   the request response.
 * @param {String} transferType Transfer type [Rel: DATA_TRANSFER_TYPE]
 * @trigger dataTransferState
 * @since 0.5.0
 * @for Skylink
 */
Skylink.prototype.cancelBlobTransfer = function (peerId, transferType) {
  if (accept) {
    this._downloadDataTransfers[peerId] = [];
    var data = this._downloadDataSessions[peerId];
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: 0,
      agent: window.webrtcDetectedBrowser
    });
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
      data.transferId, peerId, {
      name: data.name,
      size: data.size,
      senderPeerId: peerId
    });
  } else {
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: -1
    });
    delete this._downloadDataSessions[peerId];
  }
};

/**
 * Broadcasts to all P2P datachannel messages and sends to a
 * peer only when targetPeerId is provided.
 * - This is ideal for sending strings or json objects lesser than 16KB
 *   [as noted in here](http://www.webrtc.org/chrome).
 * - For huge data, please check out function
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}}.
 * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
 *   in JSON, so refrain from using map arrays.
 * @method sendP2PMessage
 * @param {String|JSON} message The message data to send.
 * @param {String} [targetPeerId] Provide if you want to send to
 *   only one peer
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendP2PMessage('Hi there! This is from a DataChannel!');
 *
 *   // Example 2: Send to specific peer
 *   SkylinkDemo.sendP2PMessage('Hi there peer! This is from a DataChannel!', targetPeerId);
 * @trigger incomingMessage
 * @since 0.5.2
 * @for Skylink
 */
Skylink.prototype.sendP2PMessage = function(message, targetPeerId) {
  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    log.warn('Unable to send any P2P message. Datachannel is disabled');
    return;
  }
  // Handle typeof object sent over
  for (var peerId in this._dataChannels) {
    if (this._dataChannels.hasOwnProperty(peerId)) {
      if ((targetPeerId && targetPeerId === peerId) || !targetPeerId) {
        log.log([peerId, null, null, 'Sending P2P message to peer']);
        this._sendDataChannelMessage(peerId, {
          type: this._DC_PROTOCOL_TYPE.MESSAGE,
          isPrivate: !!targetPeerId,
          sender: this._user.sid,
          target: targetPeerId,
          data: message
        });
      }
    }
  }
  this._trigger('incomingMessage', {
    content: message,
    isPrivate: (targetPeerId) ? true : false,
    targetPeerId: targetPeerId || null, // is not null if there's user
    isDataChannel: true,
    senderPeerId: this._user.sid
  }, this._user.sid, this._user.info, true);
};
Skylink.prototype._peerCandidatesQueue = [];

/**
 * The list of ICE candidate generation states.
 * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
 *   webrtc/editor/webrtc.html#rtcicegatheringstate-enum).
 * - This is RTCIceGatheringState of the peer.
 * - The states that would occur are:
 * @attribute CANDIDATE_GENERATION_STATE
 * @type JSON
 * @param {String} NEW The object was just created, and no networking
 *   has occurred yet.
 * @param {String} GATHERING The ICE engine is in the process of gathering
 *   candidates for this RTCPeerConnection.
 * @param {String} COMPLETED The ICE engine has completed gathering. Events
 *   such as adding a new interface or a new TURN server will cause the
 *   state to go back to gathering.
 * @readOnly
 * @since 0.4.1
 * @for Skylink
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * A candidate has just been generated (ICE gathering) and will be sent to the peer.
 * Part of connection establishment.
 * @method _onIceCandidate
 * @param {String} targetMid The peerId of the target peer.
 * @param {Event} event This is provided directly by the peerconnection API.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @for Skylink
 */
Skylink.prototype._onIceCandidate = function(targetMid, event) {
  if (event.candidate) {
    if (this._enableIceTrickle) {
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
    if (!this._enableIceTrickle) {
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
 * Adds ice candidate to queue.
 * @method _addIceCandidateToQueue
 * @param {String} targetMid The peerId of the target peer.
 * @param {Object} candidate The ice candidate object.
 * @private
 * @since 0.5.2
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
 * Adds all ice candidate from the queue.
 * @method _addIceCandidateFromQueue
 * @param {String} targetMid The peerId of the target peer.
 * @private
 * @since 0.5.2
 * @for Skylink
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  if(this._peerCandidatesQueue[targetMid].length > 0) {
    for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
      var candidate = this._peerCandidatesQueue[targetMid][i];
      log.debug([targetMid, null, null, 'Added queued candidate'], candidate);
      this._peerConnections[targetMid].addIceCandidate(candidate);
    }
    delete this._peerCandidatesQueue[targetMid];
  } else {
    log.log([targetMid, null, null, 'No queued candiate to add']);
  }
};
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  DISCONNECTED: 'disconnected'
};

/**
 * The list of available TURN server protocols
 * - The available protocols are:
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP Use only TCP transport option.
 * @param {String} UDP Use only UDP transport option.
 * @param {String} ANY Use both TCP and UDP transport option.
 * @param {String} NONE Set no transport option in TURN servers
 * @readOnly
 * @since 0.5.4
 * @for Skylink
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none'
};

/**
 * The current state if ICE trickle is enabled.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.3.0
 * @for Skylink
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * The current state if STUN servers are enabled.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * The current state if TURN servers are enabled.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * [DEVELOPMENT] SSL option for STUN servers.
 * - Still unsupported.
 * - This feature is still under development.
 * @attribute _STUNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @since 0.5.4
 * @for Skylink
 */
//Skylink.prototype._STUNSSL = false;

/**
 * [DEVELOPMENT] SSL option for TURN servers.
 * - Might be unsupported.
 * - This feature is still under development.
 * @attribute _TURNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @since 0.5.4
 * @for Skylink
 */
//Skylink.prototype._TURNSSL = false;

/**
 * The transport protocol for TURN servers.
 * @attribute _TURNTransport
 * @type String
 * @default Skylink.TURN_TRANSPORT.ANY
 * @private
 * @required
 * @since 0.5.4
 * @for Skylink
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Sets the STUN server specially for Firefox for ICE Connection.
 * @method _setFirefoxIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.1.0
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
 * @for Skylink
 */
Skylink.prototype._setIceServers = function(config) {
  // firstly, set the STUN server specially for firefox
  config = this._setFirefoxIceServers(config);
  for (var i = 0; i < config.iceServers.length; i++) {
    var iceServer = config.iceServers[i];
    var iceServerParts = iceServer.url.split(':');
    // check for stun servers
    if (iceServerParts[0] === 'stun' || iceServerParts[0] === 'stuns') {
      if (!this._enableSTUN) {
        log.log('Removing STUN Server support');
        config.iceServers.splice(i, 1);
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
        config.iceServers.splice(i, 1);
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
    config.iceServers[i] = iceServer;
    log.log('Output ' + iceServerParts[0] + ' configuration:', config.iceServers[i]);
  }
  log.log('Output iceServers configuration:', config.iceServers);
  return config;
};
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  HAVE_LOCAL_PRANSWER: 'have-local-pranswer',
  HAVE_REMOTE_PRANSWER: 'have-remote-pranswer',
  CLOSED: 'closed'
};

/**
 * Internal array of peer connections.
 * @attribute _peerConnections
 * @type Object
 * @required
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = [];

/**
 * We have a peer, this creates a peerconnection object to handle the call.
 * if we are the initiator, we then starts the O/A handshake.
 * @method _addPeer
 * @param {String} targetMid PeerId of the peer we should connect to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @param {Boolean} [toOffer=false] Whether we should start the O/A or wait.
 * @param {Boolean} [restartConn=false] Whether connection is restarted.
 * @param {Boolean} [receiveOnly=false] Should they only receive?
 * @private
 * @for Skylink
 * @since 0.5.0
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
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
  // I'm the callee I need to make an offer
  if (toOffer) {
    if (self._enableDataChannel) {
      self._createDataChannel(targetMid);
    }
    self._doOffer(targetMid, peerBrowser);
  }
};

/**
 * Actually clean the peerconnection and trigger an event.
 * Can be called by _byHandler and leaveRoom.
 * @method _removePeer
 * @param {String} peerId PeerId of the peer that has left.
 * @trigger peerLeft
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removePeer = function(peerId) {
  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, this._peerInformations[peerId], false);
  } else {
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
  }
  if (this._peerConnections[peerId]) {
    this._peerConnections[peerId].close();
    delete this._peerConnections[peerId];
  }
  if (this._peerHSPriorities[peerId]) {
    delete this._peerHSPriorities[peerId];
  }
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  log.log([peerId, 'Successfully removed peer']);
};

/**
 * Creates a peerconnection to communicate with the peer whose ID is 'targetMid'.
 * All the peerconnection callbacks are set up here. This is a quite central piece.
 * @method _createPeerConnection
 * @param {String} targetMid
 * @return {Object} The created peer connection object.
 * @private
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
  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel) {
      self._createDataChannel(targetMid, dc);
    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel']);
    }
  };
  pc.onaddstream = function(event) {
    self._onRemoteStreamAdded(targetMid, event);
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
          userInfo: self._user.info,
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
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null,
      'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };
  return pc;
};
Skylink.prototype._peerInformations = [];

/**
 * User information, credential and the local stream(s).
 * @attribute _user
 * @type JSON
 * @param {String} uid The user's session id.
 * @param {String} sid The user's secret id. This is the id used as the peerId.
 * @param {String} timestamp The user's timestamp.
 * @param {String} token The user's access token.
 * @param {Array} streams The array of user's MediaStream(s).
 * @param {JSON} info The user's peer information object.
 * @param {JSON} info.settings User stream settings.
 * @param {Boolean|JSON} [info.settings.audio=false] User audio settings.
 * @param {Boolean} [info.settings.audio.stereo=false] User has enabled stereo or not.
 * @param {Boolean|JSON} [info.settings.video=false] User video settings.
 * @param {Bolean|JSON} [info.settings.video.resolution] User video
 *   resolution set. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [info.settings.video.resolution.width] User video
 *   resolution width.
 * @param {Integer} [info.settings.video.resolution.height] User video
 *   resolution height.
 * @param {Integer} [info.settings.video.frameRate] User video minimum
 *   frame rate.
 * @param {JSON} info.mediaStatus User MediaStream(s) status.
 * @param {Boolean} [info.mediaStatus.audioMuted=true] Is user's audio muted.
 * @param {Boolean} [info.mediaStatus.videoMuted=true] Is user's vide muted.
 * @param {String|JSON} info.userData User's custom data set.
 * @required
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._user = null;

/**
 * Updates the user custom data.
 * - Please note that the custom data would be overrided so please call
 *   {{#crossLink "Skylink/getUserData:method"}}getUserData(){{/crossLink}}
 *   and then modify the information you want individually.
 * - {{#crossLink "Skylink/peerUpdated:event"}}peerUpdated{{/crossLink}}
 *   only fires after <b>setUserData()</b> is fired.
 *   after the user joins the room.
 * @method setUserData
 * @param {JSON|String} userData User custom data.
 * @example
 *   // Example 1: Intial way of setting data before user joins the room
 *   SkylinkDemo.setUserData({
 *     displayName: 'Bobby Rays',
 *     fbUserId: 'blah'
 *   });
 *
 *  // Example 2: Way of setting data after user joins the room
 *   var userData = SkylinkDemo.getUserData();
 *   userData.displayName = 'New Name';
 *   userData.fbUserId = 'another Id';
 *   SkylinkDemo.setUserData(userData);
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  // NOTE ALEX: be smarter and copy fields and only if different
  if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
    self._user.info = self._user.info || {};
    self._user.info.userData = userData ||
      self._user.info.userData || {};

    if (self._inRoom) {
      log.log('Updated userData -> ', userData);
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
        mid: self._user.sid,
        rid: self._room.id,
        userData: self._user.info.userData
      });
      self._trigger('peerUpdated', self._user.sid, self._user.info, true);
    } else {
      log.warn('User is not in the room. Broadcast of updated information will be dropped');
    }
  } else {
    var checkInRoom = setInterval(function () {
      if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
        clearInterval(checkInRoom);
        self.setUserData(userData);
      }
    }, 50);
  }
};

/**
 * Gets the user custom data.
 * @method getUserData
 * @return {JSON|String} User custom data.
 * @example
 *   var userInfo = SkylinkDemo.getUserData();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getUserData = function() {
  return (this._user) ?
    ((this._user.info) ? (this._user.info.userData || '')
    : '') : '';
};

/**
 * Gets the peer information.
 * - If input peerId is user's id or empty, <b>getPeerInfo()</b>
 *   would return user's peer information.
 * @method getPeerInfo
 * @param {String} peerId PeerId of the peer information to retrieve.
 * @return {JSON} Peer information.
 * @example
 *   // Example 1: To get other peer's information
 *   var peerInfo = SkylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: To get own information
 *   var userInfo = SkylinkDemo.getPeerInfo();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  return (peerId && peerId !== this._user.sid) ?
    this._peerInformations[peerId] :
    ((this._user) ? this._user.info : null);
};
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * Internal array of peer handshake messaging priorities.
 * @attribute _peerHSPriorities
 * @type Object
 * @private
 * @required
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerHSPriorities = [];

/**
 * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
 * @method _doOffer
 * @param {String} targetMid PeerId of the peer to send offer to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid];
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
    if (beOfferer) {
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
        userInfo: self._user.info,
        target: targetMid,
        weight: -1
      });
    }
  }, inputConstraints);
};

/**
 * We have succesfully received an offer and set it locally. This function will take care
 * of cerating and sendng the corresponding answer. Handshake step 4.
 * @method _doAnswer
 * @param {String} targetMid PeerId of the peer to send answer to.
 * @private
 * @for Skylink
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
 * This takes an offer or an aswer generated locally and set it in the peerconnection
 * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
 * @method _setLocalAndSendMessage
 * @param {String} targetMid PeerId of the peer to send offer/answer to.
 * @param {JSON} sessionDescription This should be provided by the peerconnection API.
 *   User might 'tamper' with it, but then , the setLocal may fail.
 * @trigger handshakeProgress
 * @private
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
  sdpLines = self._removeFirefoxH264Pref(sdpLines);
  // add stereo option
  if (self._streamSettings.stereo) {
    self._addStereo(sdpLines);
  }
  log.info([targetMid, null, null, 'Requested stereo:'], self._streamSettings.stereo || false);
  // set sdp bitrate
  if (self._streamSettings.bandwidth) {
    sdpLines = self._setSDPBitrate(sdpLines, self._streamSettings.bandwidth);
  }
  self._streamSettings.bandwidth = self._streamSettings.bandwidth || {};
  log.info([targetMid, null, null, 'Custom bandwidth settings:'], {
    audio: (self._streamSettings.bandwidth.audio || 'Not set') + ' kB/s',
    video: (self._streamSettings.bandwidth.video || 'Not set') + ' kB/s',
    data: (self._streamSettings.bandwidth.data || 'Not set') + ' kB/s'
  });
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
    if (self._enableIceTrickle || (!self._enableIceTrickle &&
      sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER)) {
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
 * The list of signaling actions received.
 * - These are usually received from the signaling server to warn the user.
 * - The system action outcomes are:
 * @attribute SYSTEM_ACTION_REASON
 * @type JSON
 * @param {String} FAST_MESSAGE User sends quick messages
 *   less than a second resulting in a warning. Continuous
 *   quick messages results in user being kicked out of the room.
 * @param {String} ROOM_LOCKED Room is locked and user is locked
 *   from joining the room.
 * @param {String} ROOM_FULL Persistent meeting. Room is full.
 * @param {String} DUPLICATED_LOGIN User has same id
 * @param {String} SERVER_ERROR Server has an error
 * @param {String} VERIFICATION Verification for roomID
 * @param {String} EXPIRED Persistent meeting. Room has
 *   expired and user is unable to join the room.
 * @param {String} ROOM_CLOSED Persistent meeting. Room
 *   has expired and is closed, user to leave the room.
 * @param {String} ROOM_CLOSING Persistent meeting.
 *   Room is closing soon.
 * @param {String} OVER_SEAT_LIMIT Seat limit is hit. API Key
 *   do not have sufficient seats to continue.
 * @readOnly
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
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * The current state if room is locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * User to join the room.
 * - You may call {{#crossLink "Skylink/getUserMedia:method"}}
 *   getUserMedia(){{/crossLink}} first if you want to get
 *   MediaStream and joining Room seperately.
 * - If <b>joinRoom()</b> parameters is empty, it simply uses
 *   any previous media or user data settings.
 * - If no room is specified, user would be joining the default room.
 * @method joinRoom
 * @param {String} [room=init.options.defaultRoom] Room to join user in.
 * @param {JSON} [options] Media Constraints.
 * @param {JSON|String} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {Boolean|JSON} [options.video=false] This call requires video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
 *   The video stream mininum frameRate.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio] Audio stream bandwidth in kbps.
 *   Recommended: 50 kbps.
 * @param {Integer} [options.bandwidth.video] Video stream bandwidth in kbps.
 *   Recommended: 256 kbps.
 * @param {Integer} [options.bandwidth.data] Data stream bandwidth in kbps.
 *   Recommended: 1638400 kbps.
 * @example
 *   // To just join the default room without any video or audio
 *   // Note that calling joinRoom without any parameters
 *   // Still sends any available existing MediaStreams allowed.
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
 *   SkwayDemo.joinRoom({
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
 * @trigger peerJoined
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.joinRoom = function(room, mediaOptions) {
  var self = this;
  if ((self._inRoom && typeof room !== 'string') || (typeof room === 'string' &&
    room === this._selectedRoom)) {
    log.error([null, 'Socket',
      ((typeof room === 'string') ? room : self._selectedRoom),
      'Unable to join room as user is currently in the room already']);
    return;
  }
  log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
    mediaOptions || ((typeof room === 'object') ? room : {}));
  var sendJoinRoomMessage = function() {
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
  };
  var doJoinRoom = function() {
    var checkChannelOpen = setInterval(function () {
      if (!self._channelOpen) {
        if (self._readyState === self.READY_STATE_CHANGE.COMPLETED && !self._socket) {
          self._openChannel();
        }
      } else {
        clearInterval(checkChannelOpen);
        self._waitForLocalMediaStream(function() {
          sendJoinRoomMessage();
        }, mediaOptions);
      }
    }, 500);
  };
  if (typeof room === 'string') {
    self._initSelectedRoom(room, doJoinRoom);
  } else {
    mediaOptions = room;
    doJoinRoom();
  }
};

/**
 * User to leave the room.
 * @method leaveRoom
 * @example
 *   SkylinkDemo.leaveRoom();
 * @trigger peerLeft, channelClose
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.leaveRoom = function() {
  if (!this._inRoom) {
    log.warn('Unable to leave room as user is not in any room');
    return;
  }
  for (var pc_index in this._peerConnections) {
    if (this._peerConnections.hasOwnProperty(pc_index)) {
      this._removePeer(pc_index);
    }
  }
  this._inRoom = false;
  this._closeChannel();
  log.log([null, 'Socket', this._selectedRoom, 'User left the room']);
  this._trigger('peerLeft', this._user.sid, this._user.info, true);
};

/**
 * Lock the room to prevent peers from joining the room.
 * @method lockRoom
 * @example
 *   SkylinkDemo.lockRoom();
 * @trigger lockRoom
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
    this._user.info, true);
};

/**
 * Unlock the room to allow peers to join the room.
 * @method unlockRoom
 * @example
 *   SkylinkDemo.unlockRoom();
 * @trigger lockRoom
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
    this._user.info, true);
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
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * The regional server that Skylink connects to.
 * @attribute _serverRegion
 * @type String
 * @private
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
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * The API Key ID.
 * @attribute _apiKey
 * @type String
 * @private
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
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * The static room's meeting duration.
 * @attribute _roomDuration
 * @type Integer
 * @private
 * @optional
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
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * The received server key.
 * @attribute _key
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * The owner's username of the apiKey.
 * @attribute _apiKeyOwner
 * @type String
 * @private
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
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = window.webrtcDetectedBrowser === 'IE' &&
    (window.webrtcDetectedVersion === 9 || window.webrtcDetectedVersion === 8) &&
    typeof window.XDomainRequest === 'function';
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
    xhr.response = xhr.responseText || xhr.response;
    xhr.status = xhr.status || 200;
    log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(xhr.response || '{}'));
    callback(xhr.status, JSON.parse(xhr.response || '{}'));
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
  // use default bandwidth and media resolution provided by server
  this._streamSettings.bandwidth = info.bandwidth;
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
 * Initialize Skylink to retrieve new connection information bbasd on options.
 * @method _initSelectedRoom
 * @param {String} [room=Skylink._defaultRoom] The room to connect to.
 * @param {Function} callback The callback fired once Skylink is re-initialized.
 * @trigger readyStateChange
 * @private
 * @for Skylink
 * @since 0.5.2
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
  var checkReadyState = setInterval(function () {
    if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
      clearInterval(checkReadyState);
      callback();
    }
  }, 100);
};

/**
 * Intiailize Skylink to retrieve connection information.
 * - <b><i>IMPORTANT</i></b>: Please call this method to load all server
 *   information before joining the room or doing anything else.
 * - If you would like to set the start time and duration of the room,
 *   you have to generate the credentials. In example 3, we use the
 *    [CryptoJS](https://code.google.com/p/crypto-js/) library.
 *   - Step 1: Generate the hash. It is created by using the roomname,
 *     duration and the timestamp (in ISO String format).
 *   - Step 2: Generate the Credentials. It is is generated by converting
 *     the hash to a Base64 string and then encoding it to a URI string.
 *   - Step 3: Initialize Skylink
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
 * @param {Boolean} [options.TURNTransport=Skylink.TURN_TRANSPORT.ANY] Transport
 *  to set the transport packet type. [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] Credentials options for
 *   setting a static meeting.
 * @param {String} options.credentials.startDateTime The start timing of the
 *   meeting in Date ISO String
 * @param {Integer} options.credentials.duration The duration of the meeting
 * @param {String} options.credentials.credentials The credentials required
 *   to set the timing and duration of a meeting.
 * @param {Boolean} [options.audioFallback=false] To allow the option to fallback to
 *   audio if failed retrieving video stream.
 * @param {Boolean} [forceSSL=false] To force SSL connections to the API server
 *   and signaling server.
 * @param {Integer} [socketTimeout=1000] To set the timeout for socket to fail
 *   and attempt a reconnection. The mininum value is 500.
 * @param {Integer} [socketReconnectionAttempts=3] To set the reconnection
 *   attempts when failure to connect to signaling server before aborting.
 *   This throws a channelConnectionError.
 *   - 0: Denotes no reconnection
 *   - -1: Denotes a reconnection always. This is not recommended.
 *   - > 0: Denotes the number of attempts of reconnection Skylink should do.
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
 * @trigger readyStateChange
 * @for Skylink
 * @required
 * @for Skylink
 * @since 0.5.3
 */
Skylink.prototype.init = function(options) {
  if (!options) {
    log.error('No API key provided');
    return;
  }
  var apiKey, room, defaultRoom, region;
  var startDateTime, duration, credentials;
  var roomServer = this._roomServer;
  // NOTE: Should we get all the default values from the variables
  // rather than setting it?
  var enableIceTrickle = true;
  var enableDataChannel = true;
  var enableSTUNServer = true;
  var enableTURNServer = true;
  var TURNTransport = this.TURN_TRANSPORT.ANY;
  var audioFallback = false;
  var forceSSL = false;
  var socketTimeout = 1000;
  var socketReconnectionAttempts = 3;

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
    // set the socket timeout option to be above 500
    socketTimeout = (socketTimeout < 500) ? 500 : socketTimeout;
    // set turn server option
    socketReconnectionAttempts = (typeof
      options.socketReconnectionAttempts === 'number') ?
      options.socketReconnectionAttempts : socketReconnectionAttempts;
    // set turn transport option
    if (typeof options.TURNServerTransport === 'string') {
      // loop out for every transport option
      for (var type in this.TURN_TRANSPORT) {
        if (this.TURN_TRANSPORT.hasOwnProperty(type)) {
          // do a check if the transport option is valid
          if (this.TURN_TRANSPORT[type] === options.TURNServerTransport) {
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
  this._apiKey = apiKey;
  this._roomServer = roomServer;
  this._defaultRoom = defaultRoom;
  this._selectedRoom = room;
  this._serverRegion = region;
  this._path = roomServer + '/api/' + apiKey + '/' + room;
  // set credentials if there is
  if (credentials) {
    this._roomStart = startDateTime;
    this._roomDuration = duration;
    this._roomCredentials = credentials;
    this._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }
  // check if there is a other query parameters or not
  if (region) {
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
  }
  // skylink functionality options
  this._enableIceTrickle = enableIceTrickle;
  this._enableDataChannel = enableDataChannel;
  this._enableSTUN = enableSTUNServer;
  this._enableTURN = enableTURNServer;
  this._TURNTransport = TURNTransport;
  this._audioFallback = audioFallback;
  this._forceSSL = forceSSL;
  this._socketTimeout = socketTimeout;
  this._socketReconnectionAttempts = socketReconnectionAttempts;

  log.log('Init configuration:', {
    serverUrl: this._path,
    readyState: this._readyState,
    apiKey: this._apiKey,
    roomServer: this._roomServer,
    defaultRoom: this._defaultRoom,
    selectedRoom: this._selectedRoom,
    serverRegion: this._serverRegion,
    enableDataChannel: this._enableDataChannel,
    enableIceTrickle: this._enableIceTrickle,
    enableTURNServer: this._enableTURN,
    enableSTUNServer: this._enableSTUN,
    TURNTransport: this._TURNTransport,
    audioFallback: this._audioFallback,
    forceSSL: this._forceSSL,
    socketTimeout: this._socketTimeout,
    socketReconnectionAttempts: this._socketReconnectionAttempts
  });
  // trigger the readystate
  this._readyState = 0;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.INIT);
  this._loadInfo();
};
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
};

/**
 * [GLOBAL VARIABLE] The log key
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';

/**
 * [GLOBAL VARIABLE] The log level of Skylink
 * @attribute _logLevel
 * @type String
 * @default Skylink.LOG_LEVEL.WARN - 1
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 4;

/**
 * [GLOBAL VARIABLE] The current state if debugging mode is enabled.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * [GLOBAL VARIABLE] Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
 * @method _log
 * @param {String} logLevel The log level.
 * @param {Array|String} message The console message.
 * @param {String} message.0 The targetPeerId the message is targeted to.
 * @param {String} message.1 The interface the message is targeted to.
 * @param {String|Array} message.2 The events the message is targeted to.
 * @param {String} message.3: The log message.
 * @param {Object|String} [debugObject] The console parameter string or object.
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
var _logFn = function(logLevel, message, debugObject) {
  var levels = ['error', 'warn', 'info', 'log', 'debug'];
  var outputLog = _LOG_KEY;

  if (_logLevel >= logLevel) {
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
    // Fallback to log if failure
    var enableDebugOutputLog = '++ ' + levels[logLevel].toUpperCase() + ' ++  ' + outputLog;

    logLevel = (typeof console[levels[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[logConsole](enableDebugOutputLog, debugObject);
      } else {
        console[logConsole](enableDebugOutputLog);
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[levels[logLevel]](outputLog, debugObject);
      } else {
        console[levels[logLevel]](outputLog);
      }
    }
  }
};

/**
 * [GLOBAL VARIABLE] Logs all the console information.
 * - Note: This is a variable outside of Skylink scope
 * @attribute log
 * @type JSON
 * @param {Function} debug For debug mode.
 * @param {Function} log For log mode.
 * @param {Function} info For info mode.
 * @param {Function} warn For warn mode.
 * @param {Function} serror For error mode.
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a debug log in the console.
 * - Note: This is a variable outside of Skylink scope
 * @method log.debug
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a normal log in the console.
 * - Note: This is a variable outside of Skylink scope
 * @method log.log
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs an info log in the console.
 * - Note: This is a variable outside of Skylink scope
 * @method log.info
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs a warning log in the console.
 * - Note: This is a variable outside of Skylink scope
 * @method log.warn
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
 * @for Skylink
 * @since 0.5.4
 */
/**
 * [GLOBAL VARIABLE] Outputs an error log in the console.
 * - Note: This is a variable outside of Skylink scope
 * @method log.error
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
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  debug: function (message, object) {
    _logFn(4, message, object);
  },
  log: function (message, object) {
    _logFn(3, message, object);
  },
  info: function (message, object) {
    _logFn(2, message, object);
  },
  warn: function (message, object) {
    _logFn(1, message, object);
  },
  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Sets the debugging log level.
 * - The default log level is Skylink.LOG_LEVEL.WARN
 * @method setLogLevel
 * @param {String} logLevel The log level. [Rel: Skylink.LOG_LEVEL]
 * @example
 *   SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.TRACE);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setLogLevel = function(logLevel) {
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
 * Sets Skylink in debugging mode to display stack trace.
 * - By default, debugging mode is turned off.
 * @method setDebugMode
 * @param {Boolean} isDebugMode If debugging mode is turned on or off.
 * @example
 *   SkylinkDemo.setDebugMode(true);
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  _enableDebugMode = isDebugMode;
};
Skylink.prototype._EVENTS = {
  /**
   * Event fired when the socket connection to the signaling
   * server is open.
   * @event channelOpen
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event fired when the socket connection to the signaling
   * server has closed.
   * @event channelClose
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * Event fired when the socket connection received a message
   * from the signaling server.
   * @event channelMessage
   * @param {JSON} message
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * Event fired when the socket connection has occurred an error.
   * @event channelError
   * @param {Object|String} error Error message or object thrown.
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event fired when the socket connection failed connecting.
   * - The difference between this and <b>channelError</b> is that
   *   channelError triggers during the connection. This throws
   *   when connection failed to be established.
   * @event channelConnectionError
   * @param {String} errorCode The error code.
   *   [Rel: Skylink.CHANNEL_CONNECTION_ERROR]
   * @param {Integer} reconnectionAttempt The reconnection attempt
   * @for Skylink
   * @since 0.5.4
   */
  channelConnectionError: [],

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
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event fired when webcam or microphone media access fails.
   * @event mediaAccessError
   * @param {Object|String} error Error object thrown.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event fired when webcam or microphone media acces passes.
   * @event mediaAccessSuccess
   * @param {Object} stream MediaStream object.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

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
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

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
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * [DEVELOPMENT] Event fired when a peer joins the room
   * @event presenceChanged
   * @param {JSON} users The list of users
   * @private
   * @deprecated
   * @for Skylink
   * @since 0.1.0
   */
  presenceChanged: [],

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
   * @for Skylink
   * @since 0.4.0
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
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: []
};

/**
 * Events with callbacks that would be fired only once condition is met.
 * @attribute _onceEvents
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onceEvents = {};

/**
 * Trigger all the callbacks associated with an event.
 * - Note that extra arguments can be passed to the callback which
 *   extra argument can be expected by callback is documented by each event.
 * @method _trigger
 * @param {String} eventName The Skylink event.
 * @for Skylink
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._trigger = function(eventName) {
  var args = Array.prototype.slice.call(arguments);
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName] || [];
  args.shift();
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
      }
    }
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
 * @param {String} eventName The Skylink event.
 * @param {Function} callback The callback fired after the event is triggered.
 * @example
 *   SkylinkDemo.on('peerJoined', function (peerId, peerInfo) {
 *      alert(peerId + ' has joined the room');
 *   });
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
 * @param {String} eventName The Skylink event.
 * @param {Function} callback The callback fired after the event is triggered.
 * @param {Function} condition The provided condition that would trigger this event.
 *   Return a true to fire the event.
 * @param {Boolean} [fireAlways=false] The function does not get removed onced triggered,
 *   but triggers everytime the event is called.
 * @example
 *   SkylinkDemo.once('peerConnectionState', function (state, peerId) {
 *     alert('Peer has left');
 *   }, function (state, peerId) {
 *     return state === SkylinkDemo.PEER_CONNECTION_STATE.CLOSED;
 *   });
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.once = function(eventName, callback, condition, fireAlways) {
  if (typeof callback === 'function' && typeof condition === 'function') {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    // prevent undefined error
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    log.error([null, 'Event', eventName, 'Provided parameters is not a function']);
  }
};

/**
 * To unregister a callback function from an event.
 * @method off
 * @param {String} eventName The Skylink event.
 * @param {Function} callback The callback fired after the event is triggered.
 *   Not providing any callback turns all callbacks tied to that event off.
 * @example
 *   SkylinkDemo.off('peerJoined', callback);
 * @for Skylink
 * @since 0.1.0
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
  for (var j = 0; j < once.length; j++) {
    if (once[j][1] === callback) {
      log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
      once.splice(j, 1);
      break;
    }
  }
};
Skylink.prototype.CHANNEL_CONNECTION_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3
};

/**
 * The current socket opened state.
 * @attribute _channelOpen
 * @type Boolean
 * @private
 * @required
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * The signaling server to connect to.
 * @attribute _signalingServer
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._signalingServer = null;

/**
 * The signaling server protocol to use.
 * @attribute _signalingServerProtocol
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerProtocol = window.location.protocol;

/**
 * The signaling server port to connect to.
 * @attribute _signalingServerPort
 * @type Integer
 * @default https: = 443, http = 80
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerPort =
  (window.location.protocol === 'https:') ? 443 : 80;

/**
 * The actual socket object that handles the connection.
 * @attribute _socket
 * @type Object
 * @required
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._socket = null;

/**
 * The socket connection timeout
 * @attribute _socketTimeout
 * @type Integer
 * @default 1000
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketTimeout = 1000;

/**
 * The socket connection to use XDomainRequest.
 * @attribute _socketUseXDR
 * @type Boolean
 * @default false
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketUseXDR = false;

/**
 * The current socket connection reconnection attempt.
 * @attribute _socketCurrentReconnectionAttempt
 * @type Integer
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketCurrentReconnectionAttempt = 0;

/**
 * The socket connection reconnection attempts before it aborts.
 * @attribute _socketReconnectionAttempts
 * @type Integer
 * @default 3
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketReconnectionAttempts = 3;

/**
 * Sends a message to the signaling server.
 * - Not to be confused with method
 *   {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}
 *   that broadcasts messages. This is for sending socket messages.
 * @method _sendChannelMessage
 * @param {JSON} message
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._sendChannelMessage = function(message) {
  if (!this._channelOpen) {
    return;
  }
  var messageString = JSON.stringify(message);
  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message.type);
  this._socket.send(messageString);
};

/**
 * Create the socket object to refresh connection.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._createSocket = function () {
  var self = this;
  self._signalingServerProtocol = (self._forceSSL) ?
    'https:' : self._signalingServerProtocol;
  self._signalingServerPort = (self._forceSSL) ?
    ((self._signalingServerPort !== 3443) ? 443 : 3443) :
    self._signalingServerPort;
  var ip_signaling = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  log.log('Opening channel with signaling server url:', {
    url: ip_signaling,
    useXDR: self._socketUseXDR
  });

  self._socket = io.connect(ip_signaling, {
    forceNew: true,
    'sync disconnect on unload' : true,
    timeout: self._socketTimeout,
    reconnection: false,
    transports: ['websocket']
  });
};

/**
 * Initiate a socket signaling connection.
 * @method _openChannel
 * @trigger channelMessage, channelOpen, channelError, channelClose
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen ||
    self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    return;
  }

  self._createSocket();

  self._socket.on('connect', function() {
    self._channelOpen = true;
    self._trigger('channelOpen');
    log.log([null, 'Socket', null, 'Channel opened']);
  });

  // NOTE: should we throw a socket error when its a native WebSocket API error
  // attempt to do a reconnection instead
  self._socket.on('connect_error', function () {
    self._signalingServerPort = (window.location.protocol === 'https' ||
      self._forceSSL) ? 3443 : 3000;
    // close it first
    self._socket.close();

    // check if it's a first time attempt to establish a reconnection
    if (self._socketCurrentReconnectionAttempt === 0) {
      // connection failed
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED);
    }
    // do a check if require reconnection
    if (self._socketReconnectionAttempts === 0) {
      // no reconnection
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.CONNECTION_ABORTED,
        self._socketCurrentReconnectionAttempt);
    } else if (self._socketReconnectionAttempts === -1 ||
      self._socketReconnectionAttempts > self._socketCurrentReconnectionAttempt) {
      // do a connection
      log.log([null, 'Socket', null, 'Attempting to re-establish signaling ' +
        'server connection']);
      setTimeout(function () {
        self._socket = null;
        // increment the count
        self._socketCurrentReconnectionAttempt += 1;
      }, self._socketTimeout);
      // if it's not a first try, trigger it
      if (self._socketCurrentReconnectionAttempt > 0) {
        self._trigger('channelConnectionError',
          self.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED,
          self._socketCurrentReconnectionAttempt);
      }
    } else {
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED,
        self._socketCurrentReconnectionAttempt);
    }
  });
  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });
  self._socket.on('disconnect', function() {
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);
  });
  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
};

/**
 * Closes the socket signaling connection.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  this._socket.disconnect();
  this._socket = null;
  this._channelOpen = false;
};
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
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
  GROUP: 'group'
};

/**
 * Handles everu incoming signaling message received.
 * - If it's a SIG_TYPE.GROUP message, break them down to single messages
 *   and let {{#crossLink "Skylink/_processSingleMessage:method"}}
 *   _processSingleMessage(){{/crossLink}} to handle them.
 * @method _processSigMessage
 * @param {String} messageString The message object stringified received.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(message.lists[i]);
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
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Recevied from peer ->'], message.type);
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
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Signaling server sends a redirect message.
 * - SIG_TYPE: REDIRECT
 * - This occurs when the signaling server is warning us or wanting
 *   to move us out when the peer sends too much messages at the
 *   same tme.
 * @method _redirectHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.info The reason for this action.
 * @param {String} message.action The action to work on.
 *   [Rel: Skylink.SYSTEM_ACTION]
 * @param {String} message.reason The reason of why the action is worked upon.
 *   [Rel: Skylink.SYSTEM_ACTION_REASON]
 * @param {String} message.type The type of message received.
 * @trigger systemAction
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });
  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Signaling server sends a updateUserEvent message.
 * - SIG_TYPE: UPDATE_USER
 * - This occurs when a peer's custom user data is updated.
 * @method _updateUserEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   updated event.
 * @param {JSON|String} message.userData The peer's user data.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
 * @private
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
 * Signaling server sends a roomLockEvent message.
 * - SIG_TYPE: ROOM_LOCK
 * - This occurs when a room lock status has changed.
 * @method _roomLockEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   updated room lock status.
 * @param {String} message.lock If room is locked or not.
 * @param {String} message.type The type of message received.
 * @trigger roomLock
 * @private
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
 * Signaling server sends a muteAudioEvent message.
 * - SIG_TYPE: MUTE_AUDIO
 * - This occurs when a peer's audio stream muted
 *   status has changed.
 * @method _muteAudioEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending
 *   their own updated audio stream status.
 * @param {String} message.muted If audio stream is muted or not.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
 * @private
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
 * Signaling server sends a muteVideoEvent message.
 * - SIG_TYPE: MUTE_VIDEO
 * - This occurs when a peer's video stream muted
 *   status has changed.
 * @method _muteVideoEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending
 *   their own updated video streams status.
 * @param {String} message.muted If video stream is muted or not.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
 * @private
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
 * Signaling server sends a bye message.
 * - SIG_TYPE: BYE
 * - This occurs when a peer left the room.
 * @method _byeHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that has left the room.
 * @param {String} message.type The type of message received.
 * @trigger peerLeft
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer has left the room']);
  this._removePeer(targetMid);
};

/**
 * Signaling server sends a privateMessage message.
 * - SIG_TYPE: PRIVATE_MESSAGE
 * - This occurs when a peer sends private message to user.
 * @method _privateMessageHandler
 * @param {JSON} message The message object received.
 * @param {JSON|String} message.data The data received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.cid CredentialId of the room.
 * @param {String} message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} message.type The type of message received.
 * @trigger privateMessage
 * @private
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
 * Signaling server sends a publicMessage message.
 * - SIG_TYPE: PUBLIC_MESSAGE
 * - This occurs when a peer broadcasts a public message to
 *   all connected peers.
 * @method _publicMessageHandler
 * @param {JSON} message The message object received.
 * @param {JSON|String} message.data The data broadcasted
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.cid CredentialId of the room.
 * @param {String} message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} message.type The type of message received.
 * @trigger publicMessage
 * @private
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
 * Signaling server sends an inRoom message.
 * - SIG_TYPE: IN_ROOM
 * - This occurs the user has joined the room.
 * @method _inRoomHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.sid PeerId of self.
 * @param {String} message.mid PeerId of the peer that is
 *   sending the joinRoom message.
 * @param {JSON} message.pc_config The peerconnection configuration.
 * @param {String} message.type The type of message received.
 * @trigger peerJoined
 * @private
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
  self._trigger('peerJoined', self._user.sid, self._user.info, true);
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
    userInfo: self._user.info
  });
};

/**
 * Signaling server sends a enter message.
 * - SIG_TYPE: ENTER
 * - This occurs when a peer just entered the room.
 * - If we don't have a connection with the peer, send a welcome.
 * @method _enterHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the enter shake.
 * @param {String} message.agent Peer's browser agent.
 * @param {String} message.version Peer's browser version.
 * @param {String} message.userInfo Peer's user information.
 * @param {JSON} message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 * @param {JSON} [message.userInfo.settings.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [message.userInfo.settings.video.resolution.width]
 * @param {Integer} [message.userInfo.settings.video.resolution.height]
 * @param {Integer} [message.userInfo.settings.video.frameRate]
 * @param {JSON} message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true] If peer's audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true] If peer's video stream is muted.
 * @param {String|JSON} message.userInfo.userData Peer custom data.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress, peerJoined
 * @private
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
    version: message.version
  }, false);
  if (targetMid !== 'MCU') {
    self._trigger('peerJoined', targetMid, message.userInfo, false);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    self._peerInformations[targetMid] = message.userInfo || {};
    self._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
  }
  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    userInfo: self._user.info,
    target: targetMid,
    weight: weight
  });
};

/**
 * Signaling server sends a welcome message.
 * - SIG_TYPE: WELCOME
 * - This occurs when we've just received a welcome.
 * - If there is no existing connection with this peer,
 *   create one, then set the remotedescription and answer.
 * @method _welcomeHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the welcome shake.
 * @param {Boolean} [message.receiveOnly=false] Peer to receive only
 * @param {Boolean} [message.enableIceTrickle=false] Option to enable Ice trickle or not
 * @param {Boolean} [message.enableDataChannel=false] Option to enable DataChannel or not
 * @param {String} message.userInfo Peer's user information.
 * @param {JSON} message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 * @param {JSON} [message.userInfo.settings.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [message.userInfo.settings.video.resolution.width]
 * @param {Integer} [message.userInfo.settings.video.resolution.height]
 * @param {Integer} [message.userInfo.settings.video.frameRate]
 * @param {JSON} message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true] If peer's audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true] If peer's video stream is muted.
 * @param {String|JSON} message.userInfo.userData Peer custom data.
 * @param {String} message.agent Browser agent.
 * @param {String} message.version Browser version.
 * @param {String} message.target PeerId of the peer targeted to receieve this message.
 * @param {Integer} message.weight The weight of the message.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress, peerJoined
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;
  log.log([targetMid, null, message.type, 'Received peer\'s response ' +
    'to handshake initiation. Peer\'s information:'], message.userInfo);
  if (this._peerConnections[targetMid]) {
    if (!this._peerConnections[targetMid].setOffer) {
      if (message.weight < 0) {
        log.log([targetMid, null, message.type, 'Peer\'s weight is lower ' +
          'than 0. Proceeding with offer'], message.weight);
        restartConn = true;
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
  if (!this._peerInformations[targetMid]) {
    if (targetMid !== 'MCU') {
      this._peerInformations[targetMid] = message.userInfo;
      this._peerInformations[targetMid].agent = {
        name: message.agent,
        version: message.version
      };
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    } else {
      log.log([targetMid, null, message.type, 'MCU has ' +
        ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
    }
  }
  this._addPeer(targetMid, {
    agent: message.agent,
    version: message.version
  }, true, restartConn, message.receiveOnly);
};

/**
 * Signaling server sends an offer message.
 * - SIG_TYPE: OFFER
 * - This occurs when we've just received an offer.
 * - If there is no existing connection with this peer, create one,
 *   then set the remotedescription and answer.
 * @method _offerHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the offer shake.
 * @param {String} message.sdp Offer sessionDescription
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress
 * @private
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
 * Signaling server sends a candidate message.
 * - SIG_TYPE: CANDIDATE
 * - This occurs when a peer sends an ice candidate.
 * @method _candidateHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   offer shake.
 * @param {String} message.sdp Offer sessionDescription.
 * @param {String} message.target PeerId that is specifically
 *   targeted to receive the message.
 * @param {String} message.id Peer's ICE candidate id.
 * @param {String} message.candidate Peer's ICE candidate object.
 * @param {String} message.label Peer's ICE candidate label.
 * @param {String} message.type The type of message received.
 * @private
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
    candidate: message.candidate
  });
  if (pc) {
    /*if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
      log.debug([targetMid, null, null,
        'Received but not adding Candidate as we are already connected to this peer']);
      return;
    }*/
    // set queue before ice candidate cannot be added before setRemoteDescription.
    // this will cause a black screen of media stream
    if ((pc.setOffer === 'local' && pc.setAnswer === 'remote') ||
      (pc.setAnswer === 'local' && pc.setOffer === 'remote')) {
      pc.addIceCandidate(candidate);
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
 * Signaling server sends an answer message.
 * - SIG_TYPE: ANSWER
 * - This occurs when a peer sends an answer message is received.
 * @method _answerHandler
 * @param {String} message.type Message type
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.sdp Answer sessionDescription
 * @param {String} message.mid PeerId of the peer that is sending the enter shake.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress
 * @private
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
 * Broadcast a message to all peers.
 * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
 *   in JSON, so refrain from using map arrays.
 * @method sendMessage
 * @param {String|JSON} message The message data to send.
 * @param {String} targetPeerId PeerId of the peer to send a private
 *   message data to.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendMessage('Hi there!');
 *
 *   // Example 2: Send to a targeted peer
 *   SkylinkDemo.sendMessage('Hi there peer!', targetPeerId);
 * @trigger incomingMessage
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
  }, this._user.sid, this._user.info, true);
};
Skylink.prototype.VIDEO_RESOLUTION = {
  QVGA: {
    width: 320,
    height: 180
  },
  VGA: {
    width: 640,
    height: 360
  },
  HD: {
    width: 1280,
    height: 720
  },
  FHD: {
    width: 1920,
    height: 1080
  } // Please check support
};

/**
 * The user stream settings.
 * @attribute _streamSettings
 * @type JSON
 * @default {
 *   audio : false,
 *   video : false
 * }
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamSettings = {
  audio: false,
  video: false
};

/**
 * Fallback to audio call if audio and video is required.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @required
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
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);
  self._trigger('mediaAccessSuccess', stream);
  var checkReadyState = setInterval(function () {
    if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
      clearInterval(checkReadyState);
      self._user.streams[stream.id] = stream;
      self._user.streams[stream.id].active = true;
      var checkIfUserInRoom = setInterval(function () {
        if (self._inRoom) {
          clearInterval(checkIfUserInRoom);
          self._trigger('incomingStream', self._user.sid, stream, true);
        }
      }, 500);
    }
  }, 500);
};

/**
 * Access to user's MediaStream failed.
 * @method _onUserMediaError
 * @param {Object} error Error object that was thrown.
 * @trigger mediaAccessFailure
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error) {
  var self = this;
  log.error([null, 'MediaStream', 'Failed retrieving stream:'], error);
  if (self._audioFallback && self._streamSettings.video) {
    // redefined the settings for video as false
    self._streamSettings.video = false;
    // prevent undefined error
    self._user = self._user || {};
    self._user.info = self._user.info || {};
    self._user.info.settings = self._user.info.settings || {};
    self._user.info.settings.video = false;

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
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, event) {
  if(targetMid !== 'MCU') {
    if (!this._peerInformations[targetMid]) {
      log.error([targetMid, 'MediaStream', event.stream.id,
          'Received remote stream when peer is not connected. ' +
          'Ignoring stream ->'], event.stream);
      return;
    }
    if (!this._peerInformations[targetMid].settings.audio &&
      !this._peerInformations[targetMid].settings.video) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Receive remote stream but ignoring stream as it is empty ->'
        ], event.stream);
      return;
    }
    log.log([targetMid, 'MediaStream', event.stream.id,
      'Received remote stream ->'], event.stream);
    this._trigger('incomingStream', targetMid, event.stream, false);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {JSON} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._parseStreamSettings = function(options) {
  options = options || {};
  log.debug('Parsing stream settings. Stream options:', options);
  this._user.info = this._user.info || {};
  this._user.info.settings = this._user.info.settings || {};
  this._user.info.mediaStatus = this._user.info.mediaStatus || {};
  // Set User
  this._user.info.userData = options.userData || this._user.info.userData || '';
  // Set Bandwidth
  this._streamSettings.bandwidth = options.bandwidth ||
    this._streamSettings.bandwidth || {};
  this._user.info.settings.bandwidth = options.bandwidth ||
    this._user.info.settings.bandwidth || {};
  // Set audio settings
  this._user.info.settings.audio = (typeof options.audio === 'boolean' ||
    typeof options.audio === 'object') ? options.audio :
    (this._streamSettings.audio || false);
  this._user.info.mediaStatus.audioMuted = (options.audio) ?
    ((typeof this._user.info.mediaStatus.audioMuted === 'boolean') ?
    this._user.info.mediaStatus.audioMuted : !options.audio) : true;
  // Set video settings
  this._user.info.settings.video = (typeof options.video === 'boolean' ||
    typeof options.video === 'object') ? options.video :
    (this._streamSettings.video || false);
  // Set user media status options
  this._user.info.mediaStatus.videoMuted = (options.video) ?
    ((typeof this._user.info.mediaStatus.videoMuted === 'boolean') ?
    this._user.info.mediaStatus.videoMuted : !options.video) : true;

  if (!options.video && !options.audio) {
    return;
  }
  // If undefined, at least set to boolean
  options.video = options.video || false;
  options.audio = options.audio || false;

  // Set Video
  if (typeof options.video === 'object') {
    if (typeof options.video.resolution === 'object') {
      var width = options.video.resolution.width;
      var height = options.video.resolution.height;
      var frameRate = (typeof options.video.frameRate === 'number') ?
        options.video.frameRate : 50;
      if (!width || !height) {
        options.video = true;
      } else {
        options.video = {
          mandatory: {
            minWidth: width,
            minHeight: height
          },
          optional: [{ minFrameRate: frameRate }]
        };
      }
    }
  }
  // Set Audio
  if (typeof options.audio === 'object') {
    options.stereo = (typeof options.audio.stereo === 'boolean') ?
      options.audio.stereo : false;
    options.audio = true;
  }
  // Set stream settings
  // use default video media size if no width or height provided
  this._streamSettings.video = (typeof options.video === 'boolean' && options.video) ?
    this._room.connection.mediaConstraints : options.video;
  this._streamSettings.audio = options.audio;
  this._streamSettings.stereo = options.stereo;

  log.debug('Parsed user stream settings', this._user.info);
  log.debug('User media status:', {
    audio: options.audioMuted,
    video: options.videoMuted
  });
};

/**
 * Opens or closes existing MediaStreams.
 * @method _setLocalMediaStreams
 * @param {JSON} options
 * @param {JSON} [options.audio=false] Enable audio or not
 * @param {JSON} [options.video=false] Enable video or not
 * @return {Boolean} Whether we should re-fetch mediaStreams or not
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalMediaStreams = function(options) {
  var hasAudioTracks = false, hasVideoTracks = false;
  if (!this._user) {
    log.error('User have no active streams');
    return;
  }
  for (var stream in this._user.streams) {
    if (this._user.streams.hasOwnProperty(stream)) {
      var audios = this._user.streams[stream].getAudioTracks();
      var videos = this._user.streams[stream].getVideoTracks();
      for (var audio in audios) {
        if (audios.hasOwnProperty(audio)) {
          audios[audio].enabled = options.audio;
          hasAudioTracks = true;
        }
      }
      for (var video in videos) {
        if (videos.hasOwnProperty(video)) {
          videos[video].enabled = options.video;
          hasVideoTracks = true;
        }
      }
      if (!options.video && !options.audio) {
        this._user.streams[stream].active = false;
      } else {
        this._user.streams[stream].active = true;
      }
    }
  }
  return ((!hasAudioTracks && options.audio) ||
    (!hasVideoTracks && options.video));
};

/**
 * Sends our Local MediaStreams to other Peers.
 * By default, it sends all it's other stream
 * @method _addLocalMediaStreams
 * @param {String} peerId PeerId of the peer to send local stream to.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  log.log([peerId, null, null, 'Adding local stream']);
  if (Object.keys(this._user.streams).length > 0) {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        if (this._user.streams[stream].active) {
          this._peerConnections[peerId].addStream(this._user.streams[stream]);
          log.debug([peerId, 'MediaStream', stream, 'Sending stream']);
        }
      }
    }
  } else {
    log.warn([peerId, null, null, 'No media to send. Will be only receiving']);
  }
};

/**
 * Handles all audio and video mute events.
 * - If there is no available audio or video stream, it will call
 *   {{#crossLink "Skylink/leaveRoom:method"}}leaveRoom(){{/crossLink}}
 *   and call {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   to join user in the room to send their audio and video stream.
 * @method _handleLocalMediaStreams
 * @param {String} mediaType Media types expected to receive.
 * - audio: Audio type of media to be handled.
 * - video: Video type of media to be handled.
 * @param {Boolean} [enableMedia=false] Enable it or disable it
 * @trigger peerUpdated
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._handleLocalMediaStreams = function(mediaType, enableMedia) {
  if (mediaType !== 'audio' && mediaType !== 'video') {
    return;
  } else if (!this._inRoom) {
    log.error('Failed ' + ((enableMedia) ? 'enabling' : 'disabling') +
      ' ' + mediaType + '. User is not in the room');
    return;
  }
  // Loop and enable tracks accordingly
  var hasTracks = false, isStreamActive = false;
  for (var stream in this._user.streams) {
    if (this._user.streams.hasOwnProperty(stream)) {
      var tracks = (mediaType === 'audio') ?
        this._user.streams[stream].getAudioTracks() :
        this._user.streams[stream].getVideoTracks();
      for (var track in tracks) {
        if (tracks.hasOwnProperty(track)) {
          tracks[track].enabled = enableMedia;
          hasTracks = true;
        }
      }
      isStreamActive = this._user.streams[stream].active;
    }
  }
  log.log('Update to is' + mediaType + 'Muted status ->', enableMedia);
  // Broadcast to other peers
  if (!(hasTracks && isStreamActive) && enableMedia) {
    this.leaveRoom();
    var hasProperty = (this._user) ? ((this._user.info) ? (
      (this._user.info.settings) ? true : false) : false) : false;
    // set timeout? to 500?
    this.joinRoom({
      audio: (mediaType === 'audio') ? true : ((hasProperty) ?
        this._user.info.settings.audio : false),
      video: (mediaType === 'video') ? true : ((hasProperty) ?
        this._user.info.settings.video : false)
    });
    this._user.info.mediaStatus[mediaType + 'Muted'] = !enableMedia;
  } else {
    this._sendChannelMessage({
      type: ((mediaType === 'audio') ? this._SIG_MESSAGE_TYPE.MUTE_AUDIO :
        this._SIG_MESSAGE_TYPE.MUTE_VIDEO),
      mid: this._user.sid,
      rid: this._room.id,
      muted: !enableMedia
    });
    this._user.info.mediaStatus[mediaType + 'Muted'] = !enableMedia;
    this._trigger('peerUpdated', this._user.sid, this._user.info, true);
  }
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
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._waitForLocalMediaStream = function(callback, options) {
  var self = this;
  options = options || {};
  self.getUserMedia(options);

  log.log('Requested audio:', ((typeof options.audio === 'boolean') ? options.audio : false));
  log.log('Requested video:', ((typeof options.video === 'boolean') ? options.video : false));

  // If options video or audio false, do the opposite to throw a true.
  var hasAudio = (options.audio) ? false : true;
  var hasVideo = (options.video) ? false : true;

  if (options.video || options.audio) {
    // lets wait for a minute and then we pull the updates
    var count = 0;
    var checkForStream = setInterval(function() {
      if (count < 5) {
        for (var stream in self._user.streams) {
          if (self._user.streams.hasOwnProperty(stream)) {
            if (options.audio &&
              self._user.streams[stream].getAudioTracks().length > 0) {
              hasAudio = true;
            }
            if (options.video &&
              self._user.streams[stream].getVideoTracks().length > 0) {
              hasVideo = true;
            }
            if (hasAudio && hasVideo) {
              clearInterval(checkForStream);
              callback();
            } else {
              count++;
            }
          }
        }
      } else {
        clearInterval(checkForStream);
        var error = ((!hasAudio && options.audio) ?  'Expected audio but no ' +
          'audio stream received' : '') +  '\n' + ((!hasVideo && options.video) ?
          'Expected video but no video stream received' : '');
        log.error([null, 'Socket', self._selectedRoom, 'Failed joining room:'], error);
        self._trigger('mediaAccessError', error);
      }
    }, 2000);
  } else {
    callback();
  }
};

/**
 * Gets the default webcam and microphone.
 * - Please do not be confused with the [MediaStreamConstraints](http://dev.w3.
 *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
 *   -mediastreamconstraints-members) specified in the original w3c specs.
 * - This is an implemented function for Skylink.
 * @method getUserMedia
 * @param {JSON} [options]  MediaStream constraints.
 * @param {JSON|Boolean} [options.audio=true] Option to allow audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
 *   The video stream mininum frameRate.
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
 * @trigger mediaAccessSuccess, mediaAccessError
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype.getUserMedia = function(options) {
  var self = this;
  var getStream = false;
  options = options || {
    audio: true,
    video: true
  };
  // prevent undefined error
  self._user = self._user || {};
  self._user.info = self._user.info || {};
  self._user.info.settings = self._user.info.settings || {};
  self._user.streams = self._user.streams || [];
  // called during joinRoom
  if (self._user.info.settings) {
    // So it would invoke to getMediaStream defaults
    if (!options.video && !options.audio) {
      log.info('No audio or video stream is requested');
    } else if (self._user.info.settings.audio !== options.audio ||
      self._user.info.settings.video !== options.video) {
      if (Object.keys(self._user.streams).length > 0) {
        // NOTE: User's stream may hang.. so find a better way?
        // NOTE: Also make a use case for multiple streams?
        getStream = self._setLocalMediaStreams(options);
        if (getStream) {
          // NOTE: When multiple streams, streams should not be cleared.
          self._user.streams = [];
        }
      } else {
        getStream = true;
      }
    }
  } else { // called before joinRoom
    getStream = true;
  }
  self._parseStreamSettings(options);
  if (getStream) {
    try {
      window.getUserMedia({
        audio: self._streamSettings.audio,
        video: self._streamSettings.video
      }, function(stream) {
        self._onUserMediaSuccess(stream);
      }, function(error) {
        self._onUserMediaError(error);
      });
    } catch (error) {
      self._onUserMediaError(error);
    }
  } else if (Object.keys(self._user.streams).length > 0) {
    log.log([null, 'MediaStream', null,
      'User has already this mediastream. Reactiving media']);
  } else {
    log.warn([null, 'MediaStream', null,
      'Not retrieving stream']);
  }
};

/**
 * Enable microphone.
 * - If microphone is not enabled from the beginning, user would have to reinitate the
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and ask for microphone again.
 * @method enableAudio
 * @trigger peerUpdated
 * @example
 *   SkylinkDemo.enableAudio();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.enableAudio = function() {
  this._handleLocalMediaStreams('audio', true);
};

/**
 * Disable microphone.
 * - If microphone is not enabled from the beginning, there is no effect.
 * @method disableAudio
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.disableAudio = function() {
  this._handleLocalMediaStreams('audio', false);
};

/**
 * Enable webcam video.
 * - If webcam is not enabled from the beginning, user would have to reinitate the
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and ask for webcam again.
 * @method enableVideo
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.enableVideo = function() {
  this._handleLocalMediaStreams('video', true);
};

/**
 * Disable webcam video.
 * - If webcam is not enabled from the beginning, there is no effect.
 * - Note that in a Chrome-to-chrome session, each party's peer audio
 *   may appear muted in when the audio is muted.
 * - You may follow up the bug on [here](https://github.com/Temasys/SkylinkJS/issues/14).
 * @method disableVideo
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.disableVideo = function() {
  this._handleLocalMediaStreams('video', false);
};
Skylink.prototype._findSDPLine = function(sdpLines, condition, value) {
  for (var index in sdpLines) {
    if (sdpLines.hasOwnProperty(index)) {
      for (var c in condition) {
        if (condition.hasOwnProperty(c)) {
          if (sdpLines[index].indexOf(c) === 0) {
            sdpLines[index] = value;
            return [index, sdpLines[index]];
          }
        }
      }
    }
  }
  return [];
};

/**
 * Adds stereo feature to the SDP.
 * - This requires OPUS to be enabled in the SDP or it will not work.
 * @method _addStereo
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with Stereo feature
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._addStereo = function(sdpLines) {
  var opusLineFound = false,
    opusPayload = 0;
  // Check if opus exists
  var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
  if (rtpmapLine.length) {
    if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
      opusLineFound = true;
      opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
    }
  }
  // Find the A=FMTP line with the same payload
  if (opusLineFound) {
    var fmtpLine = this._findSDPLine(sdpLines, ['a=fmtp:' + opusPayload]);
    if (fmtpLine.length) {
      sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
    }
  }
  return sdpLines;
};

/**
 * Set Audio, Video and Data Bitrate in SDP
 * @method _setSDPBitrate
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Bandwidth settings
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._setSDPBitrate = function(sdpLines) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;
  var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
  var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
  // Find the RTPMAP with Audio Codec
  if (maLineFound && cLineFound) {
    if (bandwidth.audio) {
      var audioLine = this._findSDPLine(sdpLines, ['a=mid:audio', 'm=mid:audio']);
      sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
    }
    if (bandwidth.video) {
      var videoLine = this._findSDPLine(sdpLines, ['a=mid:video', 'm=mid:video']);
      sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
    }
    if (bandwidth.data) {
      var dataLine = this._findSDPLine(sdpLines, ['a=mid:data', 'm=mid:data']);
      sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
    }
  }
  return sdpLines;
};

/**
 * Removes Firefox 32 H264 preference in sdp.
 * - As noted in bugzilla as bug in [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1064247).
 * @method _removeFirefoxH264Pref
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version removing Firefox h264 pref support.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    log.debug('Firefox H264 invalid pref found:', invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};
Skyway = Skylink;
}).call(this);
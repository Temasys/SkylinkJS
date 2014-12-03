/**
 * The list of datachannel protocol types.
 * - These are the list of available datachannel protocol types expected to
 *   be received.
 * - These protocol types are fixed.
 * - <b>DATA</b> stage is thrown when JSON failed parsing string, it will
 *   then be automatically interpreted as base64 binary string.
 * - Right now, the datachannel only supports base64 binary string transfer.
 * - The sub-param <b>data</b> is NOT an actual property of each types.
 * @attribute _DC_PROTOCOL_TYPE
 * @type JSON
 * @param {String} WRQ A data transfer request.
 *   Sent when a user requests to transfer a data.
 *   Received when a peer has requested to transfer a data.
 *   Sent in {{#crossLink "Skylink/_sendBlobDataToPeer:method"}}
 *   _sendBlobDataToPeer(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_WRQProtocolHandler:method"}}
 *   _WRQProtocolHandler(){{/crossLink}}.
 *
 * @param {JSON} WRQ.data The data object.
 * @param {String} WRQ.data.agent The peer's browser agent.
 * @param {Integer} WRQ.data.version The peer's browser version.
 * @param {String} WRQ.data.name The data name.
 * @param {Integer} WRQ.data.size The data size.
 * @param {Integer} WRQ.data.chunkSize The data chunk size expected to receive.
 * @param {Integer} WRQ.data.timeout The timeout to wait for packet response.
 * @param {Boolean} WRQ.data.isPrivate Is the data sent private.
 * @param {String} WRQ.data.sender The sender's peerId.
 * @param {String} WRQ.data.type The type of datachannel protocol.
 *
 * @param {String} ACK Acknowledge to data transfer request and when data
 *   packet is received.
 *   Sent when a user responses to a data transfer request.
 *   Received when a peer has responded to user's data transfer request.
 *   Sent in {{#crossLink "Skylink/_WRQProtocolHandler:method"}}
 *   _WRQProtocolHandler(){{/crossLink}},
 *   {{#crossLink "Skylink/_DATAProtocolHandler:method"}}
 *   _DATAProtocolHandler(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_ACKProtocolHandler:method"}}
 *   _ACKProtocolHandler(){{/crossLink}}.
 *
 * @param {JSON} ACK.data The data object.
 * @param {String} ACK.data.ackN The acknowledge request number.
 * <ul>
 * <li><code>0</code> Request accepted. First packet sent.</li>
 * <li><code>>0</code> Transfer is going on.</li>
 * <li><code>-1</code> Request rejected.</li>
 * </ul>
 * @param {String} ACK.data.sender The sender's peerId.
 * @param {String} ACK.data.type The type of datachannel protocol.
 *
 * @param {String} DATA Data binaryString has been sent or received.
 *   Sent when a user responses to a data transfer acknowledgement.
 *   Received when a peer sends a data packet.
 *   Sent in {{#crossLink "Skylink/_ACKProtocolHandler:method"}}
 *   _ACKProtocolHandler(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_DATAProtocolHandler:method"}}
 *   _DATAProtocolHandler(){{/crossLink}}.
 *
 * @param {String} DATA.data The base64 binary string data.
 *
 * @param {String} CANCEL
 *   Sent to cancel data transfer.
 *   Received when a peer has canceled data transfer.
 *   Sending part is not yet implemented.
 *   Received in {{#crossLink "Skylink/_CANCELProtocolHandler:method"}}
 *   _CANCELProtocolHandler(){{/crossLink}}.
 *
 * @param {Array} CANCEL.data The data object.
 * @param {String} CANCEL.data.name The data name.
 * @param {String} CANCEL.data.content The error message.
 * @param {String} CANCEL.data.sender The sender's peerId.
 * @param {String} CANCEL.data.type The type of datachannel protocol.
 *
 * @param {String} ERROR
 *   Sent when a timeout waiting for peer response has exceeded limit.
 *   Received from peer that timeout has reached its limit.
 *   Data transfer has failed.
 *   Sent in {{#crossLink "Skylink/_setDataChannelTimeout:method"}}
 *   _setDataChannelTimeout(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_ERRORProtocolHandler:method"}}
 *   _ERRORProtocolHandler(){{/crossLink}}.
 *
 * @param {Array} ERROR.data The data object.
 * @param {String} ERROR.data.name The data name.
 * @param {String} ERROR.data.content The error message.
 * @param {Boolean} [ERROR.data.isUploadError=false] Is the error occurring at upload state.
 * @param {String} ERROR.data.sender The sender's peerId.
 * @param {String} ERROR.data.type The type of datachannel protocol.
 *
 * @param {String} MESSAGE
 *   Sent a user sends a P2P message.
 *   Received when a peer sends a P2P message.
 *   Sent in {{#crossLink "Skylink/sendP2PMessage:method"}}
 *   sendP2PMessage(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_MESSAGEProtocolHandler:method"}}
 *   _MESSAGEProtocolHandler(){{/crossLink}}.
 *
 * @param {JSON} MESSAGE.data The data object.
 * @param {String} MESSAGE.data.target The target peerId to receive the data.
 * @param {String|JSON} MESSAGE.data.data The data to be received.
 * @param {String} MESSAGE.data.sender The sender's peerId.
 * @param {String} MESSAGE.data.type The type of datachannel protocol.
 * @final
 * @private
 * @for Skylink
 * @since 0.5.2
 */
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
 * @param {Boolean} data.target Real peerId to send data to, in case MCU is used.
 * @param {Boolean} isPrivate If the file transfer is private
 * @private
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
      dataInfo.transferId, targetPeerId, null, {
      name: dataInfo.name,
      message: dataInfo.content,
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
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.WRQ.data]
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
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.ACK.data]
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
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
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.MESSAGE.data]
 * @param {String} channelName The datachannel name.
 * @trigger incomingMessage
 * @private
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
 * The user receives a timeout error.
 * @method _ERRORProtocolHandler
 * @param {String} peerId PeerId of the peer that is sending the error.
 * @param {Array} data The data object received from datachannel.
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.ERROR.data]
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
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.CANCEL.data]
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
 *   [Rel: Skylink._DC_PROTOCOL_TYPE.DATA.data]
 * @param {String} dataType The data type received from datachannel.
 *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
 * @param {String} channelName The datachannel name.
 * @trigger dataTransferState
 * @private
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
 * Start a public or private data transfer with peer(s).
 * - Note that peers have the option to accept or reject the receiving data.
 * - This method is ideal for sending files.
 * - To send a private file to a peer, input the peer Id after the
 *   data information.
 * - The data transferred is encrypted.
 * @method sendBlobData
 * @param {Object} data The data to be sent over. Data has to be a blob.
 * @param {JSON} dataInfo Information required about the data transferred
 * @param {String} dataInfo.name Data name (name of the file for example).
 * @param {Integer} [dataInfo.timeout=60] The time (in second) before the transfer
 * request is cancelled if not answered.
 * @param {Integer} dataInfo.size The data size (in octet)
 * @param {String} [targetPeerId] PeerId targeted to receive data.
 *   Leave blank to send to all peers.
 * @param {Function} [callback] The callback fired after data was uploaded.
 *   Default signature: function(error object, success object)
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
      dataInfo.transferId, targetPeerId, null, {
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
    },function(state){
      return state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED;
    },true);

    self.once('dataTransferState',function(state, transferId, peerId, transferInfo, error){
      log.log([null, 'RTCDataChannel', null, 'Firing callback. ' +
      'Data transfer state has met provided state ->'], state);
      callback({
        state: state,
        error: error
      },null);
    },function(state){
      return (state === self.DATA_TRANSFER_STATE.REJECTED ||
        state === self.DATA_TRANSFER_STATE.CANCEL ||
        state === self.DATA_TRANSFER_STATE.ERROR);
    },true);
  }
};

/**
 * User's response to accept or reject data transfer request from another user.
 * @method respondBlobRequest
 * @param {String} [peerId] Id of the peer who sent the request.
 * @param {Boolean} [accept=false] Accept answer.
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
 * @param {String} transferType Transfer type [Rel: Skylink.DATA_TRANSFER_TYPE]
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
 * Send a message using the DataChannel provided by Webrtc.
 * - Can choose between broadcasting to the room (public message) and send
 *   to a specific peer (private message)
 * - Content of the message is automatically encrypted during the transfer
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
 * @since 0.5.5
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

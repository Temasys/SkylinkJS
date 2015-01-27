/**
 * The DataTransfer protocol list. The <code>data</code> object is an
 * indicator of the expected parameters to be given and received.
 * @attribute _DC_PROTOCOL_TYPE
 * @type JSON
 * @param {String} WRQ Send to initiate a DataTransfer request.
 *
 * @param {JSON} WRQ.data Expected WRQ data object format.
 * @param {String} WRQ.data.agent The peer's browser agent.
 * @param {Integer} WRQ.data.version The peer's browser version.
 * @param {String} WRQ.data.name The Blob name.
 * @param {Integer} WRQ.data.size The Blob size.
 * @param {Integer} WRQ.data.chunkSize The Blob chunk size expected to receive.
 * @param {Integer} WRQ.data.timeout The timeout to wait for the packet response.
 * @param {Boolean} WRQ.data.isPrivate The flag to indicate if the data is
 *   sent as a private request.
 * @param {String} WRQ.data.sender The sender's peerId.
 * @param {String} WRQ.data.type Protocol step: <code>"WRQ"</code>.
 *
 * @param {String} ACK Send to acknowledge the DataTransfer request.
 *
 * @param {JSON} ACK.data Expected ACK data object format.
 * @param {String} ACK.data.ackN The current index of the Blob chunk array to
 *   receive from.
 * <ul>
 * <li><code>0</code> The request is accepted and sender sends the first packet.</li>
 * <li><code>>0</code> The current packet number from Blob array being sent.</li>
 * <li><code>-1</code> RThe request is rejected and sender cancels the transfer.</li>
 * </ul>
 * @param {String} ACK.data.sender The sender's peerId.
 * @param {String} ACK.data.type Protocol step: <code>"ACK"</code>.
 *
 * @param {String} DATA Send as the raw Blob chunk data based on the <code>ackN</code>
 *   received.
 * - Handle the logic based on parsing the data received as JSON. If it should fail,
 *   the expected data received should be a <code>DATA</code> request.
 *
 * @param {String} CANCEL Send to cancel or terminate a DataTransfer.
 *
 * @param {Object} ACK.data Expected DATA data object. Look at the available types
 *    in [Rel: DATA_TRANSFER_DATA_TYPE]
 *
 * @param {Array} CANCEL.data CANCEL data object format.
 * @param {String} CANCEL.data.name The Blob data name.
 * @param {String} CANCEL.data.content The reason for termination.
 * @param {String} CANCEL.data.sender The sender's peerId.
 * @param {String} CANCEL.data.type Protocol step: <code>"CANCEL"</code>.
 *
 * @param {String} ERROR Sent when a timeout waiting for a DataTransfer response
 *   has reached its limit.
 *
 * @param {Array} ERROR.data Expected ERROR data object format.
 * @param {String} ERROR.data.name The Blob data name.
 * @param {String} ERROR.data.content The error message.
 * @param {Boolean} [ERROR.data.isUploadError=false] The flag to indicate if the
 *   exception is thrown from the sender or receiving peer.
 * @param {String} ERROR.data.sender The sender's peerId.
 * @param {String} ERROR.data.type Protocol step: <code>"ERROR"</code>.
 *
 * @param {String} MESSAGE Sends a Message object.
 *
 * @param {JSON} MESSAGE.data Expected MESSAGE data object format.
 * @param {String} MESSAGE.data.target The peerId of the peer to send the Message to.
 * @param {String|JSON} MESSAGE.data.data The Message object to send.
 * @param {String} MESSAGE.data.sender The sender's peerId.
 * @param {String} MESSAGE.data.type Protocol step: <code>"MESSAGE"</code>.
 * @final
 * @private
 * @for Skylink
 * @component DataTransfer
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
  if(this._hasMCU && targetPeerId != 'MCU')
  {
    //TODO It can be possible that even if we have a MCU in 
    //the room we are directly connected to the peer (hybrid/Threshold MCU)
    if(isPrivate)
      this._sendBlobDataToPeer(data, dataInfo, 'MCU', isPrivate);
    return;
  }
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
      dataInfo.transferId, targetPeerId, {}, {
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
  this._sendDataChannelMessage(targetPeerId, {
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
  //peerId = (peerId === 'MCU') ? data.sender : peerId;

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
	  log.log([peerId, 'RTCDataChannel', [channelName, 'ACK'], 'Upload completed']);
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
        'Transfer in progress ACK n:'],transferStatus.ackN);
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
  else
  {
    targetPeerId = self._user.sid;
    for (var peerId in self._dataChannels)
    {
      if (self._dataChannels.hasOwnProperty(peerId))
      {
        // Binary String filesize [Formula n = 4/3]
        self._sendBlobDataToPeer(data, dataInfo, peerId);
        noOfPeersSent++;
      }
      else
      {
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
    },function(state){
      return state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED;
    },false);

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

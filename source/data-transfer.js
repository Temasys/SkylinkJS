/**
 * Current version of data transfer protocol
 * @attribute DT_PROTOCOL_VERSION
 * @type String
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * The delimiter that splits the channelName and transferId.
 * @attribute _TRANSFER_DELIMITER
 * @type String
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._TRANSFER_DELIMITER = '_skylink__';

/**
 * The DataTransfer protocol list. The <code>data</code> object is an
 * indicator of the expected parameters to be given and received.
 * @attribute _DC_PROTOCOL_TYPE
 * @type JSON
 * @param {String} WRQ Send to initiate a DataTransfer request.
 * @param {String} ACK Send to acknowledge the DataTransfer request.
 * @param {String} DATA Send as the raw Blob chunk data based on the <code>ackN</code>
 *   received.
 * - Handle the logic based on parsing the data received as JSON. If it should fail,
 *   the expected data received should be a <code>DATA</code> request.
 * @param {String} CANCEL Send to cancel or terminate a DataTransfer.
 * @param {String} ERROR Sent when a timeout waiting for a DataTransfer response
 *   has reached its limit.
 * @param {String} MESSAGE Sends a Message object.
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
 * The list of platforms that does not support multi-transfers.
 * @attribute _INTEROP_MULTI_TRANSFERS
 * @type Array
 * @final
 * @private
 * @for Skylink
 * @component DataTransfer
 * @since 0.6.1
 */
Skylink.prototype._INTEROP_MULTI_TRANSFERS = ['MCU', 'Android', 'iOS'];

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
 * @param {Number} timeout The timeout to set in seconds.
 * @param {Boolean} [isSender=false] The flag to indicate if the response
 *    received is from the sender or the receiver.
 * @param {String} channelName The datachannel name.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._setDataChannelTimeout = function(peerId, timeout, isSender, channelName) {
  var self = this;
  if (!self._dataTransfersTimeout[channelName]) {
    self._dataTransfersTimeout[channelName] = null;
  }
  var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
    self.DATA_TRANSFER_TYPE.DOWNLOAD;

  self._dataTransfersTimeout[channelName] = setTimeout(function() {
    var name;
    if (self._dataTransfersTimeout[channelName][type]) {
      if (isSender) {
        name = self._uploadDataSessions[channelName].name;
        delete self._uploadDataTransfers[channelName];
        delete self._uploadDataSessions[channelName];
      } else {
        name = self._downloadDataSessions[channelName].name;
        delete self._downloadDataTransfers[channelName];
        delete self._downloadDataSessions[channelName];
      }

      self._sendDataChannelMessage(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        sender: self._user.sid,
        name: name,
        content: 'Connection Timeout. Longer than ' + timeout +
          ' seconds. Connection is abolished.',
        isUploadError: isSender
      }, channelName);
      // TODO: Find a way to add channel name so it's more specific
      log.error([peerId, 'RTCDataChannel', channelName, 'Failed transfering data:'],
        'Transfer ' + ((isSender) ? 'for': 'from') + ' ' + peerId +
        ' failed. Connection timeout');
      self._clearDataChannelTimeout(peerId, isSender, channelName);
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
 * @param {String} channelName The datachannel name.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._clearDataChannelTimeout = function(peerId, isSender, channelName) {
  if (this._dataTransfersTimeout[channelName]) {
    clearTimeout(this._dataTransfersTimeout[channelName]);
    delete this._dataTransfersTimeout[channelName];
    log.debug([peerId, 'RTCDataChannel', channelName, 'Clear datachannel timeout']);
  } else {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Unable to find timeouts. ' +
      'Not clearing the datachannel timeouts']);
  }
};

/**
 * Initiates a DataTransfer with the peer.
 * @method _sendBlobDataToPeer
 * @param {Blob} data The Blob data to send.
 * @param {JSON} dataInfo The Blob data information.
 * @param {String} dataInfo.transferId The transferId of the DataTransfer.
 * @param {String} dataInfo.name The Blob data name.
 * @param {Number} [dataInfo.timeout=60] The timeout set to await for response from peer.
 * @param {Number} dataInfo.size The Blob data size.
 * @param {Boolean} data.target The real peerId to send data to, in the case where MCU is enabled.
 * @param {String} [targetPeerId] The peerId of the peer to start the DataTransfer.
 *    To start the DataTransfer to all peers, set as <code>null</code>.
 * @param {Boolean} isPrivate The flag to indicate if the DataTransfer is broadcasted to other
 *    peers or sent to the peer privately.
 * @param {String} transferId The transfer ID of the transfer.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId, isPrivate) {
  var self = this;
  //If there is MCU then directs all messages to MCU
  var targetChannel = (self._hasMCU) ? 'MCU' : targetPeerId;
  var binarySize = parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
  var binaryChunkSize = 0;
  var chunkSize = 0;
  var i;
  var hasSend = false;

  var throwTransferErrorFn = function (message) {
    // MCU targetPeerId case - list of peers
    if (Array.isArray(targetPeerId)) {
      for (i = 0; i < targetPeerId.length; i++) {
        var peerId = targetPeerId[i];
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
          dataInfo.transferId, peerId, {
            name: dataInfo.name,
            size: dataInfo.size,
            percentage: 0,
            data: null,
            senderPeerId: self._user.sid,
            timeout: dataInfo.timeout
          },{
            message: message,
            transferType: self.DATA_TRANSFER_TYPE.UPLOAD
        });
      }
    } else {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
        dataInfo.transferId, targetPeerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          percentage: 0,
          data: null,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout
        },{
          message: message,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }
  };

  var startTransferFn = function (targetId, channel) {
    if (!hasSend) {
      hasSend = true;
      // if has MCU and is public, do not send individually
      self._sendDataChannelMessage(targetId, {
        type: self._DC_PROTOCOL_TYPE.WRQ,
        sender: self._user.sid,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        name: dataInfo.name,
        size: binarySize,
        chunkSize: binaryChunkSize,
        timeout: dataInfo.timeout,
        target: targetPeerId,
        isPrivate: !!isPrivate
      }, channel);
      self._setDataChannelTimeout(targetId, dataInfo.timeout, true, channel);
    }
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    // output: 16384
    binaryChunkSize = self._MOZ_CHUNK_FILE_SIZE * (4 / 3);
    chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  } else {
    // output: 65536
    binaryChunkSize = parseInt((self._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);
    chunkSize = self._CHUNK_FILE_SIZE;
  }

  log.log([targetPeerId, 'RTCDataChannel', targetChannel, 'Chunk size of data:'], {
    chunkSize: chunkSize,
    binaryChunkSize: binaryChunkSize,
    transferId: dataInfo.transferId
  });


  var supportMulti = false;
  var peerAgent = (self._peerInformations[targetPeerId] || {}).agent;

  if (!peerAgent && !peerAgent.name) {
    log.error([targetPeerId, 'RTCDataChannel', targetChannel, 'Aborting transfer to peer ' +
      'as peer agent information for peer does not exists'], dataInfo);
    throwTransferErrorFn('Peer agent information for peer does not exists');
    return;
  }

  if (self._INTEROP_MULTI_TRANSFERS.indexOf(peerAgent.name) === -1) {

    targetChannel = targetPeerId + '-' + dataInfo.transferId;
    supportMulti = true;

    if (!(self._dataChannels[targetPeerId] || {}).main) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel,
        'Main datachannel does not exists'], dataInfo);
      throwTransferErrorFn('Main datachannel does not exists');
      return;

    } else if (self._dataChannels[targetPeerId].main.readyState !==
      self.DATA_CHANNEL_STATE.OPEN) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel,
        'Main datachannel is not opened'], {
          transferId: dataInfo.transferId,
          readyState: self._dataChannels[targetPeerId].main.readyState
      });
      throwTransferErrorFn('Main datachannel is not opened');
      return;
    }

    self._dataChannels[targetPeerId][targetChannel] =
      self._createDataChannel(targetPeerId, self.DATA_CHANNEL_TYPE.DATA, null, targetChannel);

  } else {
    var ongoingTransfer = null;

    if (self._uploadDataSessions[targetChannel]) {
      ongoingTransfer = self.DATA_TRANSFER_TYPE.UPLOAD;
    } else if (self._downloadDataSessions[targetChannel]) {
      ongoingTransfer = self.DATA_TRANSFER_TYPE.DOWNLOAD;
    }

    if (ongoingTransfer) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel, 'User have ongoing ' +
        ongoingTransfer + ' transfer session with peer. Unable to send data'], dataInfo);
      throwTransferErrorFn('Another ' + ongoingTransfer +
        ' transfer is ongoing. Unable to send data.');
      return;
    }
  }

  self._uploadDataTransfers[targetChannel] = self._chunkBlobData(data, chunkSize);
  self._uploadDataSessions[targetChannel] = {
    name: dataInfo.name,
    size: binarySize,
    isUpload: true,
    senderPeerId: self._user.sid,
    transferId: dataInfo.transferId,
    percentage: 0,
    timeout: dataInfo.timeout,
    chunkSize: chunkSize
  };

  if (supportMulti) {
    self._condition('dataChannelState', function () {
      startTransferFn(targetPeerId, targetChannel);
    }, function () {
      return self._dataChannels[targetPeerId][targetChannel].readyState ===
        self.DATA_CHANNEL_STATE.OPEN;
    }, function (state) {
      return state === self.DATA_CHANNEL_STATE.OPEN;
    });
  } else {
    startTransferFn(targetChannel, targetChannel);
  }
};

/**
 * Handles the DataTransfer protocol stage and invokes the related handler function.
 * @method _dataChannelProtocolHandler
 * @param {String|Object} data The DataTransfer data received from the DataChannel.
 * @param {String} senderPeerId The peerId of the sender.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @param {String} channelType The DataChannel type.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._dataChannelProtocolHandler = function(dataString, peerId, channelName, channelType) {
  // PROTOCOL ESTABLISHMENT

  if (!(this._peerInformations[peerId] || {}).agent) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Peer informations is missing during protocol ' +
      'handling. Dropping packet'], dataString);
    return;
  }

  /*var useChannel = channelName;
  var peerAgent = this._peerInformations[peerId].agent.name;

  if (channelType === this.DATA_CHANNEL_TYPE.MESSAGING ||
    this._INTEROP_MULTI_TRANSFERS[peerAgent] > -1) {
    useChannel = peerId;
  }*/

  if (typeof dataString === 'string') {
    var data = {};
    try {
      data = JSON.parse(dataString);
    } catch (error) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Received from peer ->'], {
        type: 'DATA',
        data: dataString
      });
      this._DATAProtocolHandler(peerId, dataString,
        this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, channelName);
      return;
    }
    log.debug([peerId, 'RTCDataChannel', channelName, 'Received from peer ->'], {
      type: data.type,
      data: data
    });
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
      log.error([peerId, 'RTCDataChannel', channelName, 'Unsupported message ->'], {
        type: data.type,
        data: data
      });
    }
  }
};

/**
 * Handles the WRQ request.
 * @method _WRQProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The WRQ data object.
 * @param {String} data.agent The peer's browser agent.
 * @param {Number} data.version The peer's browser version.
 * @param {String} data.name The Blob name.
 * @param {Number} data.size The Blob size.
 * @param {Number} data.chunkSize The Blob chunk size expected to receive.
 * @param {Number} data.timeout The timeout to wait for the packet response.
 * @param {Boolean} data.isPrivate The flag to indicate if the data is
 *   sent as a private request.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type Protocol step: <code>"WRQ"</code>.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelName) {
  var transferId = channelName + this._TRANSFER_DELIMITER + (new Date()).getTime();

  log.log([peerId, 'RTCDataChannel', channelName,
    'Received file request from peer:'], data);

  var name = data.name;
  var binarySize = data.size;
  var expectedSize = data.chunkSize;
  var timeout = data.timeout;

  this._downloadDataSessions[channelName] = {
    transferId: transferId,
    name: name,
    isUpload: false,
    senderPeerId: peerId,
    size: binarySize,
    percentage: 0,
    ackN: 0,
    receivedSize: 0,
    chunkSize: expectedSize,
    timeout: timeout
  };
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
    transferId, peerId, {
      name: name,
      size: binarySize,
      percentage: 0,
      data: null,
      senderPeerId: peerId,
      timeout: timeout
  });
  this._trigger('incomingDataRequest', transferId, peerId, {
    name: name,
    size: binarySize,
    percentage: 0,
    senderPeerId: peerId,
    timeout: timeout
  }, false);
};

/**
 * Handles the ACK request.
 * @method _ACKProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ACK data object.
 * @param {String} data.ackN The current index of the Blob chunk array to
 *   receive from.
 * <ul>
 * <li><code>0</code> The request is accepted and sender sends the first packet.</li>
 * <li><code>>0</code> The current packet number from Blob array being sent.</li>
 * <li><code>-1</code> The request is rejected and sender cancels the transfer.</li>
 * </ul>
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type Protocol step: <code>"ACK"</code>.
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

  if (!self._uploadDataTransfers[channelName]) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      'upload data transfers is empty'], data);
    return;
  }
  //peerId = (peerId === 'MCU') ? data.sender : peerId;
  var chunksLength = self._uploadDataTransfers[channelName].length;
  var transferStatus = self._uploadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      'upload data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;
  var timeout = transferStatus.timeout;

  self._clearDataChannelTimeout(peerId, true, channelName);
  log.log([peerId, 'RTCDataChannel', channelName, 'ACK stage (' +
    transferStatus.transferId + ') ->'], ackN + ' / ' + chunksLength);

  if (ackN > -1) {
    // Still uploading
    if (ackN < chunksLength) {
      self._blobToBase64(self._uploadDataTransfers[channelName][ackN], function (base64BinaryString) {
        var percentage = parseFloat((((ackN + 1) / chunksLength) * 100).toFixed(2), 10);

        self._uploadDataSessions[channelName].percentage = percentage;

        self._sendDataChannelMessage(peerId, base64BinaryString, channelName);
        self._setDataChannelTimeout(peerId, timeout, true, channelName);

        // to prevent from firing upload = 100;
        if (percentage !== 100) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING,
            transferId, peerId, {
              name: transferStatus.name,
              size: transferStatus.size,
              percentage: percentage,
              data: null,
              senderPeerId: transferStatus.senderPeerId,
              timeout: transferStatus.timeout
          });
        }
      });
    } else if (ackN === chunksLength) {
	    log.log([peerId, 'RTCDataChannel', channelName, 'Upload completed (' +
        transferStatus.transferId + ')'], transferStatus);

      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: 100,
          data: null,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout
      });

      var blob = new Blob(self._uploadDataTransfers[channelName]);
      self._trigger('incomingData', blob, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: 100,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, true);
      delete self._uploadDataTransfers[channelName];
      delete self._uploadDataSessions[channelName];

      // close datachannel after transfer
      if (self._dataChannels[peerId] && self._dataChannels[peerId][channelName]) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Closing datachannel for upload transfer']);
        self._closeDataChannel(peerId, channelName);
      }
    }
  } else {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Upload rejected (' +
      transferStatus.transferId + ')'], transferStatus);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED,
      transferId, peerId, {
        name: self._uploadDataSessions[channelName].name,
        size: self._uploadDataSessions[channelName].size,
        percentage: 0,
        data: null,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
    });
    delete self._uploadDataTransfers[channelName];
    delete self._uploadDataSessions[channelName];
  }
};

/**
 * Handles the MESSAGE request.
 * @method _MESSAGEProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ACK data object.
 * @param {String} data.target The peerId of the peer to send the Message to.
 * @param {String|JSON} data.data The Message object to send.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type Protocol step: <code>"MESSAGE"</code>.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger incomingMessage
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelName) {
  var targetMid = data.sender;
  log.log([targetMid, 'RTCDataChannel', channelName,
    'Received P2P message from peer:'], data);
  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Handles the ERROR request.
 * @method _ERRORProtocolHandler
 * @param {String} senderPeerId The peerId of the sender.
 * @param {JSON} data The ERROR data object.
 * @param {String} data.name The Blob data name.
 * @param {String} data.content The error message.
 * @param {Boolean} [data.isUploadError=false] The flag to indicate if the
 *   exception is thrown from the sender or receiving peer.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type Protocol step: <code>"ERROR"</code>.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelName) {
  var isUploader = data.isUploadError;
  var transferStatus = (isUploader) ? this._uploadDataSessions[channelName] :
    this._downloadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      (isUploader ? 'upload' : 'download') + ' data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;

  log.error([peerId, 'RTCDataChannel', channelName,
    'Received an error from peer:'], data);
  this._clearDataChannelTimeout(peerId, isUploader, channelName);
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
    transferId, peerId, {
      name: transferStatus.name,
      size: transferStatus.size,
      percentage: transferStatus.percentage,
      data: null,
      senderPeerId: transferStatus.senderPeerId,
      timeout: transferStatus.timeout
    }, {
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
 * @param {String} data.name The Blob data name.
 * @param {String} data.content The reason for termination.
 * @param {String} data.sender The sender's peerId.
 * @param {String} data.type Protocol step: <code>"CANCEL"</code>.
 * @param {String} channelName The DataChannel name related to the DataTransfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelName) {
  var isUpload = !!this._uploadDataSessions[channelName];
  var isDownload = !!this._downloadDataSessions[channelName];
  var transferStatus = (isUpload) ? this._uploadDataSessions[channelName] :
    this._downloadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      (isUploader ? 'upload' : 'download') + ' data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;

  log.log([peerId, 'RTCDataChannel', channelName,
    'Received file transfer cancel request:'], data);

  this._clearDataChannelTimeout(peerId, isUploader, channelName);

  try {
    if (isUpload) {
      delete this._uploadDataSessions[channelName];
      delete this._uploadDataTransfers[channelName];
    } else {
      delete this._downloadDataSessions[channelName];
      delete this._downloadDataTransfers[channelName];
    }

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
      transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        data: null,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, {
        message: data.content,
        transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
          this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });

    log.log([peerId, 'RTCDataChannel', channelName,
      'Emptied file transfer session:'], data);

  } catch (error) {
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        data: null,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, {
        message: 'Failed cancelling data request from peer',
        transferType: ((isUpload) ? this.DATA_TRANSFER_TYPE.UPLOAD :
          this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });

    log.error([peerId, 'RTCDataChannel', channelName,
      'Failed emptying file transfer session:'], {
        data: data,
        error: error
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
  var transferStatus = this._downloadDataSessions[channelName];
  log.log([peerId, 'RTCDataChannel', channelName,
    'Received data chunk from peer ->'], {
      dataType: dataType,
      data: dataString,
      type: 'DATA'
  });

  if (!transferStatus) {
    log.log([peerId, 'RTCDataChannel', channelName,
      'Ignoring data received as download data session is empty'], {
        dataType: dataType,
        data: dataString,
        type: 'DATA'
    });
    return;
  }

  var transferId = transferStatus.transferId;

  this._clearDataChannelTimeout(peerId, false, channelName);

  if (dataType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    chunk = this._base64ToBlob(dataString);
  } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    chunk = new Blob(dataString);
  } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
    chunk = dataString;
  } else {
    error = 'Unhandled data exception: ' + dataType;
    log.error([peerId, 'RTCDataChannel', channelName, 'Failed downloading data packets:'], {
      dataType: dataType,
      data: dataString,
      type: 'DATA',
      error: error
    });
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: transferStatus.percentage,
        data: null,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });
    return;
  }

  var receivedSize = (chunk.size * (4 / 3));
  log.log([peerId, 'RTCDataChannel', channelName,
    'Received and expected data chunk size (' + receivedSize + ' === ' +
      transferStatus.chunkSize + ')'], {
        dataType: dataType,
        data: dataString,
        receivedSize: receivedSize,
        expectedSize: transferStatus.chunkSize,
        type: 'DATA'
  });

  if (transferStatus.chunkSize >= receivedSize) {
    this._downloadDataTransfers[channelName].push(chunk);
    transferStatus.ackN += 1;
    transferStatus.receivedSize += receivedSize;
    var totalReceivedSize = transferStatus.receivedSize;
    var percentage = parseFloat(((totalReceivedSize / transferStatus.size) * 100).toFixed(2), 10);

    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: transferStatus.ackN
    }, channelName);

    // update the percentage
    this._downloadDataSessions[channelName].percentage = percentage;

    if (transferStatus.chunkSize === receivedSize) {
      log.log([peerId, 'RTCDataChannel', channelName,
        'Transfer in progress ACK n (' + transferStatus.ackN + ')'], {
          dataType: dataType,
          data: dataString,
          ackN: transferStatus.ackN,
          type: 'DATA'
      });
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOADING,
        transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: percentage,
          data: null,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout
      });
      this._setDataChannelTimeout(peerId, transferStatus.timeout, false, channelName);
      this._downloadDataTransfers[channelName].info = transferStatus;

    } else {
      log.log([peerId, 'RTCDataChannel', channelName,
        'Download complete'], {
          dataType: dataType,
          data: dataString,
          type: 'DATA',
          transferInfo: transferStatus
      });
      var blob = new Blob(this._downloadDataTransfers[channelName]);
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
        transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: 100,
          data: blob,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout
      });
      delete this._downloadDataTransfers[channelName];
      delete this._downloadDataSessions[channelName];
      this._trigger('incomingData', blob, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: 100,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, false);

      log.log([peerId, 'RTCDataChannel', channelName,
        'Converted to Blob as download'], {
          dataType: dataType,
          data: dataString,
          type: 'DATA',
          transferInfo: transferStatus
      });

      // close datachannel after transfer
      if (this._dataChannels[peerId] && this._dataChannels[peerId][channelName]) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Closing datachannel for download transfer']);
        this._closeDataChannel(peerId, channelName);
      }
    }

  } else {
    error = 'Packet not match - [Received]' + receivedSize +
      ' / [Expected]' + transferStatus.chunkSize;

    this._trigger('dataTransferState',
      this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: transferStatus.percentage,
        data: null,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout
      }, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });

    log.error([peerId, 'RTCDataChannel', channelName,
      'Failed downloading data packets:'], {
        dataType: dataType,
        data: dataString,
        type: 'DATA',
        transferInfo: transferStatus,
        error: error
    });
  }
};

/**
 * Starts a DataTransfer request to the peers based on the peerIds provided.
 * Peers have the option to accept or reject the receiving data.
 * DataTransfers are encrypted.
 * @method sendBlobData
 * @param {Blob} data The Blob data to be sent over.
 * @param {Number} [timeout=60] The time (in seconds) before the transfer
 * request is cancelled if not answered. This is also for the data packet response timeout.
 * @param {String} [targetPeerId] The peerId of the peer targeted to receive data.
 *   To send to all peers, leave this option blank.
 * @param {Function} [callback] The callback fired after data was uploaded.
 * @param {JSON} [callback.error] The error received in the callback.
 * @param {String} callback.
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
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, callback) {
  var self = this;
  var error = '';
  var listOfPeers = Object.keys(self._peerConnections);
  var isPrivate = false;
  var noOfPeersSent = 0;
  var dataInfo = {};
  var transferId = self._user.sid + self.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');

  //Shift parameters
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;

  } else if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  // check if it's blob data
  if (!(typeof data === 'object' && data instanceof Blob)) {
    error = 'Provided data is not a Blob data';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],error);
      callback(error,null);
    }
    return;
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

  //Name and size and required properties of dataInfo
  if (typeof data.size !== 'number'){
    error = 'Blob data size typeof is ' + typeof data.size + ' (expected number)';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],error);
      callback(error,null);
    }
    return;
  }

  // populate data
  dataInfo.name = data.name || transferId;
  dataInfo.size = data.size;
  dataInfo.timeout = typeof timeout === 'number' ? timeout : 60;
  dataInfo.transferId = transferId;


  var i;
  var peerId;

  for (i = 0; i < listOfPeers.length; i++) {
    peerId = listOfPeers[i];

    if (self._dataChannels.hasOwnProperty(peerId)) {
      log.log([peerId, 'RTCDataChannel', null, 'Sending blob data ->'], dataInfo);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          percentage: 0,
          data: data,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout
      });

      self._trigger('incomingDataRequest', transferId, peerId, {
        name: dataInfo.name,
        size: dataInfo.size,
        percentage: 0,
        senderPeerId: self._user.sid,
        timeout: dataInfo.timeout
      }, true);

      if (!self._hasMCU) {
        self._sendBlobDataToPeer(data, dataInfo, peerId, isPrivate, transferId);
      }

      noOfPeersSent++;

    } else {
      log.error([peerId, 'RTCDataChannel', null, 'Datachannel does not exist']);
    }
  }
// if has MCU
  if (self._hasMCU)
  {
    self._sendBlobDataToPeer(data, dataInfo, listOfPeers, isPrivate, transferId);
  }

  if (noOfPeersSent === 0) {
    error = 'No available datachannels to send data.';

    for (i = 0; i < listOfPeers.length; i++) {
      peerId = listOfPeers[i];

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          data: null,
          percentage: 0,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout
        }, {
          message: error,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }

    log.error('Failed sending data: ', error);
    self._uploadDataTransfers = [];
    self._uploadDataSessions = [];
  }

  if (typeof callback === 'function') {
    var listOfPeersTransferState = {};
    var transferSuccess = true;
    var listOfPeersTransferErrors = {};

    var dataChannelStateFn = function(state, transferringPeerId, errorObj){
      // check if error or closed halfway, if so abort
      if (state === self.DATA_CHANNEL_STATE.ERROR &&
        state === self.DATA_CHANNEL_STATE.CLOSED &&
        listOfPeers.indexOf(transferringPeerId) > -1) {
        // if peer has already been inside, ignore
        if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
          listOfPeersTransferState[transferringPeerId] = false;
          listOfPeersTransferErrors[transferringPeerId] = errorObj;

          log.error([transferringPeerId, 'RTCDataChannel', null,
            'Data transfer state has met a failure state for peer (datachannel) ->'], state, errorObj);
        }
      }

      if (Object.keys(listOfPeersTransferState).length === listOfPeers.length) {
        self.off('dataTransferState', dataTransferStateFn);
        self.off('dataChannelState', dataChannelStateFn);

        log.log([null, 'RTCDataChannel', transferId,
          'Transfer states have been gathered completely in dataChannelState'], state);
      }
    };

    var dataTransferStateFn = function(state, stateTransferId, transferringPeerId, transferInfo, errorObj){
      // check if transfer is related to this transfer
      if (stateTransferId === transferId) {
        // check if state upload has completed
        if (state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {

          log.debug([transferringPeerId, 'RTCDataChannel', stateTransferId,
            'Data transfer state has met a success state for peer ->'], state);

          // if peer has already been inside, ignore
          if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
            listOfPeersTransferState[transferringPeerId] = true;
          }
        } else if(state === self.DATA_TRANSFER_STATE.REJECTED ||
          state === self.DATA_TRANSFER_STATE.CANCEL ||
          state === self.DATA_TRANSFER_STATE.ERROR) {

          log.error([transferringPeerId, 'RTCDataChannel', stateTransferId,
            'Data transfer state has met a failure state for peer ->'], state, errorObj);

          // if peer has already been inside, ignore
          if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
            listOfPeersTransferState[transferringPeerId] = false;
            listOfPeersTransferErrors[transferringPeerId] = errorObj;
          }
        }
      }

      if (Object.keys(listOfPeersTransferState).length === listOfPeers.length) {
        self.off('dataTransferState', dataTransferStateFn);
        self.off('dataChannelState', dataChannelStateFn);

        log.log([null, 'RTCDataChannel', stateTransferId,
          'Transfer states have been gathered completely in dataTransferState'], state);
      }
    };

    self.on('dataTransferState', dataTransferStateFn);
    self.on('dataChannelState', dataChannelStateFn);

    for (i = 0; i < listOfPeers.length; i++) {
      var transferPeerId = listOfPeers[i];

      if (!listOfPeersTransferState[transferPeerId]) {
        // if error, make as false and break
        transferSuccess = false;
        break;
      }
    }

    if (transferSuccess) {
      log.log([null, 'RTCDataChannel', transferId, 'Firing success callback for data transfer'], dataInfo);
      // should we even support this? maybe keeping to not break older impl
      if (listOfPeers.length === 1 && isPrivate) {
        callback(null,{
          state: self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED,
          error: listOfPeersTransferErrors[listOfPeers[0]],
          transferId: transferId,
          peerId: listOfPeers[0],
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: transferInfo
        });
      } else {
        callback(null,{
          state: self.DATA_CHANNEL_STATE.UPLOAD_COMPLETED,
          transferId: transferId,
          listOfPeers: listOfPeers,
          transferErrors: listOfPeersTransferErrors,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: transferInfo
        });
      }
    } else {
      log.log([null, 'RTCDataChannel', transferId, 'Firing failure callback for data transfer'], dataInfo);

      // should we even support this? maybe keeping to not break older impl
      if (listOfPeers.length === 1 && isPrivate) {
        callback({
          state: self.DATA_TRANSFER_STATE.ERROR,
          transferId: transferId,
          peerId: listOfPeers[0],
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: transferInfo
        }, null);
      } else {
        callback({
          state: self.DATA_TRANSFER_STATE.ERROR,
          transferId: transferId,
          listOfPeers: listOfPeers,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: transferInfo
        }, null);
      }
    }
  }
};

/**
 * Responds to a DataTransfer request initiated by a peer.
 * @method respondBlobRequest
 * @param {String} [peerId] The peerId of the peer to respond the request to.
 * @param {Boolean} [accept=false] The flag to accept or reject the request.
 * @trigger dataTransferState
 * @component DataTransfer
 * @deprecated Use {{#crossLink "Skylink/acceptDataTransfer:method"}}acceptDataTransfer(){{/crossLink}}
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.respondBlobRequest =
/**
 * Responds to a DataTransfer request initiated by a peer.
 * @method acceptDataTransfer
 * @param {String} peerId The peerId of the peer to respond the request to.
 * @param {String} transferId The transferId of the transfer to respond to
 * @param {Boolean} [accept=false] The flag to accept or reject the request.
 * @trigger dataTransferState
 * @component DataTransfer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.acceptDataTransfer = function (peerId, transferId, accept) {

  if (!transferId) {
    log.error([peerId, 'RTCDataChannel', null, 'Aborting accept data transfer as ' +
      'transfer ID is not provided'], {
        accept: accept,
        transferId: transferId
    });
    return;
  }

  if (transferId.indexOf(this._TRANSFER_DELIMITER) === -1) {
    log.error([peerId, 'RTCDataChannel', null, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided'], {
        accept: accept,
        transferId: transferId
    });
    return;
  }
  var channelName = transferId.split(this._TRANSFER_DELIMITER)[0];

  if (accept) {

    log.info([peerId, 'RTCDataChannel', channelName, 'User accepted peer\'s request'], {
      accept: accept,
      transferId: transferId
    });

    if (!this._peerInformations[peerId] && !this._peerInformations[peerId].agent) {
      log.error([peerId, 'RTCDataChannel', channelName, 'Aborting accept data transfer as ' +
        'Peer informations for peer is missing'], {
          accept: accept,
          transferId: transferId
      });
      return;
    }

    this._downloadDataTransfers[channelName] = [];

    var data = this._downloadDataSessions[channelName];
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: 0,
      agent: window.webrtcDetectedBrowser
    }, channelName);
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
      data.transferId, peerId, {
        name: data.name,
        size: data.size,
        data: null,
        percentage: 0,
        senderPeerId: peerId,
        timeout: data.timeout
    });
  } else {
    log.info([peerId, 'RTCDataChannel', channelName, 'User rejected peer\'s request'], {
      accept: accept,
      transferId: transferId
    });
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: -1
    }, useChannel);
    delete this._downloadDataSessions[channelName];
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
 * @trigger dataTransferState
 * @component DataTransfer
 * @deprecated Use {{#crossLink "Skylink/cancelDataTransfer:method"}}cancelDataTransfer(){{/crossLink}}
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.cancelBlobTransfer =
/**
 * Cancels or terminates an ongoing DataTransfer request.
 * @method cancelDataTransfer
 * @param {String} peerId The peerId of the peer associated with the DataTransfer to cancel.
 * @param {String} transferId The transfer ID to cancel.
 * @trigger dataTransferState
 * @component DataTransfer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.cancelDataTransfer = function (peerId, transferId) {
  var data;

  // targetPeerId + '-' + transferId
  var channelName = peerId + '-' + transferId;

  if (transferId.indexOf(this._TRANSFER_DELIMITER) > 0) {
    channelName = transferId.split(this._TRANSFER_DELIMITER)[0];
  } else {

    var peerAgent = (this._peerInformations[peerId] || {}).agent;

    if (!peerAgent && !peerAgent.name) {
      log.error([peerId, 'RTCDataChannel', null, 'Cancel transfer to peer ' +
        'failed as peer agent information for peer does not exists'], transferId);
      return;
    }

    if (self._INTEROP_MULTI_TRANSFERS.indexOf(peerAgent.name) > -1) {
      channelName = peerId;
    }
  }

  if (this._uploadDataSessions[channelName]) {
    data = this._uploadDataSessions[channelName];

    delete this._uploadDataSessions[peerId];
    delete this._uploadDataTransfers[peerId];

    // send message
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.CANCEL,
      sender: this._user.sid,
      name: data.name,
      content: 'Peer cancelled upload transfer'
    }, channelName);

    log.debug([peerId, 'RTCDataChannel', channelName,
      'Cancelling upload data transfers'], transferId);

  } else if (this._downloadDataSessions[channelName]) {
    data = this._downloadDataSessions[channelName];

    delete this._downloadDataSessions[peerId];
    delete this._downloadDataTransfers[peerId];

    // send message
    this._sendDataChannelMessage(peerId, {
      type: this._DC_PROTOCOL_TYPE.CANCEL,
      sender: this._user.sid,
      name: data.name,
      content: 'Peer cancelled download transfer'
    }, channelName);

    log.debug([peerId, 'RTCDataChannel', channelName,
      'Cancelling download data transfers'], transferId);

  } else {
    log.error([peerId, 'RTCDataChannel', null, 'Cancel transfer to peer ' +
      'failed as transfer session with peer does not exists'], transferId);
    return;
  }

  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.CANCEL,
    data.transferId, peerId, {
      name: data.name,
      size: data.size,
      percentage: data.percentage,
      data: null,
      senderPeerId: data.senderPeerId,
      timeout: data.timeout
  });
};

/**
 * Send a Message object via the DataChannel established with peers.
 * - Maximum size: <code>16Kb</code>
 * @method sendP2PMessage
 * @param {String|JSON} message The Message object to send.
 * @param {String|Array} [targetPeerId] The peerId of the targeted peer to
 *   send the Message object only. To send to all peers, leave this
 *   option blank. Provide an array with the list of target peers to send
 *   to more than one peers privately.
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
  var self = this;

  // check if datachannel is enabled first or not
  if (!self._enableDataChannel) {
    log.warn('Unable to send any P2P message. Datachannel is disabled');
    return;
  }

  var listOfPeers = Object.keys(self._dataChannels);
  var isPrivate = false;
  var i;

  //targetPeerId is defined -> private message
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  // sending public message to MCU to relay. MCU case only
  if (self._hasMCU && !isPrivate) {
    log.log(['MCU', null, null, 'Relaying P2P message to peers']);

    self._sendDataChannelMessage('MCU', {
      type: self._DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate: isPrivate,
      sender: self._user.sid,
      target: 'MCU',
      data: message
    });
  }

  for (i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];
    var useChannel = (self._hasMCU) ? 'MCU' : peerId;

    // Ignore MCU peer
    if (peerId === 'MCU') {
      continue;
    }

    if (isPrivate || !self._hasMCU) {
      if (self._hasMCU) {
        log.log([peerId, null, useChannel, 'Sending private P2P message to peer']);
      } else {
        log.log([peerId, null, useChannel, 'Sending P2P message to peer']);
      }

      self._sendDataChannelMessage(useChannel, {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: peerId,
        data: message
      });
    }

    self._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: peerId,
      isDataChannel: true,
      senderPeerId: self._user.sid
    }, self._user.sid, self.getPeerInfo(), true);
  }
};

/**
 * The current version of DT (Data Transfer) Protocol
 *   that the SDK is using.
 * @attribute DT_PROTOCOL_VERSION
 * @type String
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * The fixed delimiter that is used in Skylink to
 *   concat the DataChannel ID and actual transfer ID together based
 *   on the transfer ID provided in
 *   {{#crossLink "Skylink/dataTransferState:event"}}dataTransferState{{/crossLink}}.
 * @attribute _TRANSFER_DELIMITER
 * @type String
 * @required
 * @final
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._TRANSFER_DELIMITER = '_skylink__';

/**
 * The list of Protocol types that is used for transfers and messaging using
 *   the DataChannel connection.
 * @attribute _DC_PROTOCOL_TYPE
 * @type JSON
 * @param {String} WRQ Protocol to initiate a transfer request on the current
 *   DataChannel connection. Data transfer step 1.
 * @param {String} ACK Protocol to accept or reject the transfer request.
 *   Data transfer step 2.
 * @param {String} DATA Actual binary data or string send based on the
 *   <code>ackN</code> in the <code>ACK</code> packet received.
 *   Data transfer step 3. This may not occur is step 2 is rejected.
 * @param {String} CANCEL Protocol to terminate an ongoing transfer.
 *   This data transfer step can happen after step 2 or 3.
 * @param {String} ERROR Protocol that is sent when a transfer occurs an exception
 *   which using causes it to be terminated.
 *   This data transfer step can happen after step 2 or 3.
 * @param {String} MESSAGE Protocol that is used to send P2P message objects
 *   over the DataChannel connection.
 *   This is not related to any data transfer step, but for messaging purposes.
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
 * The list of platforms that Skylink should fallback to use the
 *   {{#crossLink "Skylink/DATA_CHANNEL_TYPE:attr"}}<code>
 *   DATA_CHANNEL_TYPE.MESSAGING</code>{{/crossLink}}
 *   channel for transfers instead of using multi-transfers
 *   due to the lack of support in the platform implementations.
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
 * The types of data transfers to indicate if the DataChannel is
 *   uploading or downloading the data transfer.
 * @attribute DATA_TRANSFER_TYPE
 * @type JSON
 * @param {String} UPLOAD The DataChannel connection is uploading data packets to
 *   receiving end.
 * @param {String} DOWNLOAD The DataChannel connection is downloading data packets
 *   from sending point.
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
 * The states of a data transfer in a DataChannel connection.
 * @attribute DATA_TRANSFER_STATE
 * @type JSON
 * @param {String} UPLOAD_REQUEST Request to start a data transfer.
 * @param {String} UPLOAD_STARTED Request to start the data transfer has been accepted
 *   and data transfer is starting to upload data packets to receiving end.
 * @param {String} DOWNLOAD_STARTED Request to start the data transfer has been accepted
 *   and data transfer is starting to receive data packets from sending point.
 * @param {String} REJECTED Request to start a data transfer is rejected.
 * @param {String} UPLOADING The data transfer upload is ongoing with receiving end.
 * @param {String} DOWNLOADING The data transfer download is ongoing with sending point.
 * @param {String} UPLOAD_COMPLETED The data transfer uploaded to receiving end has
 *   been completed successfully.
 * @param {String} DOWNLOAD_COMPLETED The data transfer downloaded from sending point
 *   has been completed successfully.
 * @param {String} CANCEL The ongoing data transfer has cancelled from receiving end
 *   or sending point and has been terminated.
 * @param {String} ERROR The ongoing data transfer has occurred an exception and
 *   has been terminated.
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
 * Stores the list of ongoing data transfers data packets (chunks) to be sent to receiving end
 *   in a DataChannel connection based on the associated DataChannel ID.
 * @attribute _uploadDataTransfers
 * @param {Array} (#channelName) The ongoing data transfer packets to be sent to
 *   receiving end associated with the DataChannel connection.
 * @param {Blob|String} (#channelName).(#index) The packet index of chunked Blob data object or
 *   dataURL string (base64 binary string) to be sent to received end.
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataTransfers = {};

/**
 * Stores the list of ongoing data transfer state informations that is sent to receiving end
 *   in a DataChannel connection based on the associated DataChannel ID.
 * @attribute _uploadDataSessions
 * @param {JSON} (#channelName) The ongoing data transfer information that is sent
 *   to receiving end associated with the DataChannel connection.
 * @param {String} (#channelName).name The data transfer name.
 * @param {Number} (#channelName).size The expected data size of the
 *   completed data transfer.
 * @param {Boolean} (#channelName).isUpload The flag that indicates if the
 *   transfer is an upload data transfer.
 *   In this case, the value should be <code>true</code>.
 * @param {String} (#channelName).senderPeerId The PeerConnection uploader ID.
 * @param {String} (#channelName).transferId The data transfer ID.
 * @param {Number} (#channelName).percentage The data transfer percentage.
 * @param {Number} (#channelName).timeout The data transfer timeout.
 * @param {Number} (#channelName).chunkSize The data transfer packet (chunk) size.
 * @param {String} (#channelName).dataType The data transfer packet (chunk) data type.
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataSessions = {};

/**
 * Stores the list of ongoing data transfers data packets (chunks) to be received from
 *   sending point in a DataChannel connection based on the associated DataChannel ID.
 * @attribute _downloadDataTransfers
 * @param {Array} (#channelName) The ongoing data transfer packets received
 *   associated with DataChannel.
 * @param {Blob|String} (#channelName).(#index) The packet index of chunked Blob data object or
 *   dataURL string (base64 binary string) received from sending point.
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataTransfers = {};

/**
 * Stores the list of ongoing data transfer state informations that is received from
 *   the sender point in a DataChannel connection based on the associated DataChannel ID.
 * @attribute _downloadDataSessions
 * @param {JSON} (#channelName) The ongoing data transfer information that is sent
 *   to receiving end associated with the DataChannel connection.
 * @param {String} (#channelName).name The data transfer name.
 * @param {Number} (#channelName).size The expected data size of the
 *   completed data transfer.
 * @param {Boolean} (#channelName).isUpload The flag that indicates if the
 *   transfer is an upload data transfer.
 *   In this case, the value should be <code>false</code>.
 * @param {String} (#channelName).senderPeerId The PeerConnection uploader ID.
 * @param {String} (#channelName).transferId The data transfer ID.
 * @param {Number} (#channelName).percentage The data transfer percentage.
 * @param {Number} (#channelName).timeout The data transfer timeout to wait for response
 *   before throwing a timeout error.
 * @param {Number} (#channelName).chunkSize The data transfer packet (chunk) size.
 * @param {String} (#channelName).dataType The data transfer packet (chunk) data type.
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataSessions = {};

/**
 * Stores the list of ongoing data transfer timeouts using the
 *   <code>setTimeout</code> objects for each DataChannel connection transfer.
 * @attribute _dataTransfersTimeout
 * @param {Object} (#channelName) The timeout for the associated DataChannel
 *   connection.
 * @type JSON
 * @private
 * @required
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._dataTransfersTimeout = {};

/**
 * Sets a waiting timeout for every response sent to DataChannel connection receiving
 *   end. Once the timeout has ended, a timeout error will be thrown and
 *   data transfer will be terminated.
 * @method _setDataChannelTimeout
 * @param {String} peerId The PeerConnection ID associated with the DataChannel connection.
 * @param {Number} timeout The waiting timeout in seconds.
 * @param {Boolean} [isSender=false] The flag thats indicates if the response
 *   is related to a downloading or uploading data transfer.
 * @param {String} channelName The DataChannel connection ID.
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
 * Stops and clears the waitig timeout for the associated DataChannel connection.
 * @method _clearDataChannelTimeout
 * @param {String} peerId The PeerConnection ID associated with the DataChannel connection.
 * @param {Boolean} [isSender=false] The flag thats indicates if the response
 *   is related to a downloading or uploading data transfer.
 * @param {String} channelName The DataChannel connection ID.
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
 * Starts a data transfer with a PeerConnection. If multi-transfer is supported,
 *   Skylink would open a new DataChannel connection with PeerConnection to start
 *   data transfer. If mutli-transfer is not supported in
 *   {{#crossLink "Skylink/_INTEROP_MULTI_TRANSFERS:attr"}}_INTEROP_MULTI_TRANSFERS{{/crossLink}},
 *   the data transfer would start in the {{#crossLink "Skylink/DATA_CHANNEL_TYPE:attr"}}<code>
 *   DATA_CHANNEL_TYPE.MESSAGING</code>{{/crossLink}} channel instead.
 * @method _sendBlobDataToPeer
 * @param {Blob} data The Blob data object to send.
 * @param {JSON} dataInfo The data transfer information.
 * @param {String} dataInfo.transferId The transfer ID of the data transfer.
 * @param {String} dataInfo.name The transfer Blob data object name.
 * @param {Number} [dataInfo.timeout=60] The timeout set to await in seconds
 *   for response from DataChannel connection.
 * @param {Number} dataInfo.size The Blob data binary size expected to be received in the receiving end.
 * @param {String} data.target The targeted PeerConnection ID to relay data to for the case of where
 *   MCU is enabled.
 * @param {String|Array} [targetPeerId=null] The receiving PeerConnection ID. Array is used for
 *   MCU connection where multi-targeted PeerConnections are used. By default, the
 *   value is <code>null</code>, which indicates that the data transfer is requested with all
 *   connected PeerConnections.
 * @param {Boolean} [isPrivate=false] The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {String} transferId The transfer ID of the data transfer.
 * @return {String} The DataChannel connection ID associated with the transfer. If returned
 *   as <code>null</code> or empty, it indicates an error.
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

  if (dataInfo.dataType !== 'blob') {
    // output: 1616
    binaryChunkSize = self._CHUNK_DATAURL_SIZE;
    chunkSize = self._CHUNK_DATAURL_SIZE;
    binarySize = dataInfo.size;
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    // output: 16384
    binaryChunkSize = self._MOZ_CHUNK_FILE_SIZE * (4 / 3);
    chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  } else {
    // output: 65536
    binaryChunkSize = parseInt((self._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);
    chunkSize = self._CHUNK_FILE_SIZE;
  }

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
            dataType: dataInfo.dataType,
            senderPeerId: self._user.sid,
            timeout: dataInfo.timeout,
            isPrivate: !!isPrivate
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
          dataType: dataInfo.dataType,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: !!isPrivate
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
        dataType: dataInfo.dataType,
        chunkSize: binaryChunkSize,
        timeout: dataInfo.timeout,
        target: targetPeerId,
        isPrivate: !!isPrivate
      }, channel);
      self._setDataChannelTimeout(targetId, dataInfo.timeout, true, channel);
    }
  };

  log.log([targetPeerId, 'RTCDataChannel', targetChannel, 'Chunk size of data:'], {
    chunkSize: chunkSize,
    binaryChunkSize: binaryChunkSize,
    transferId: dataInfo.transferId,
    dataType: dataInfo.dataType
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

  if (dataInfo.dataType === 'blob') {
    self._uploadDataTransfers[targetChannel] = self._chunkBlobData(data, chunkSize);
  } else {
    self._uploadDataTransfers[targetChannel] = self._chunkDataURL(data, chunkSize);
  }

  self._uploadDataSessions[targetChannel] = {
    name: dataInfo.name,
    size: binarySize,
    isUpload: true,
    senderPeerId: self._user.sid,
    transferId: dataInfo.transferId,
    percentage: 0,
    timeout: dataInfo.timeout,
    chunkSize: chunkSize,
    dataType: dataInfo.dataType,
    isPrivate: !!isPrivate
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

  return targetChannel;
};

/**
 * Routes the data received to the relevant Protocol handler based on the data received.
 * @method _dataChannelProtocolHandler
 * @param {String|Object} data The data received from the DataChannel connection.
 * @param {String} senderPeerId The DataChannel connection associated with the PeerConnection.
 * @param {String} channelName The DataChannel connection ID.
 * @param {String} channelType The DataChannel connection functionality type.
 *   [Rel: Skylink.DATA_CHANNEL_TYPE]
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
 * Handles the WRQ Protocol request received from the DataChannel connection.
 * @method _WRQProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {JSON} data The data object received from the DataChannel connection.
 *   This should contain the <code>WRQ</code> payload.
 * @param {String} data.agent The sender PeerConnection platform browser or agent name.
 * @param {Number} data.version The sender PeerConnection platform browser or agent version.
 * @param {String} data.name The transfer data object name.
 * @param {Number} data.size The transfer data object expected received size.
 * @param {Number} data.chunkSize The expected data transfer packet (chunk) size.
 * @param {Number} data.timeout The timeout set to await in seconds
 *   for response from DataChannel connection.
 * @param {Boolean} data.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {String} data.sender The sender PeerConnection ID.
 * @param {String} data.type Protocol step <code>"WRQ"</code>.
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
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
    dataType: data.dataType,
    ackN: 0,
    receivedSize: 0,
    chunkSize: expectedSize,
    timeout: timeout,
    isPrivate: data.isPrivate
  };
  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
    transferId, peerId, {
      name: name,
      size: binarySize,
      percentage: 0,
      data: null,
      dataType: data.dataType,
      senderPeerId: peerId,
      timeout: timeout,
      isPrivate: data.isPrivate
  });
  this._trigger('incomingDataRequest', transferId, peerId, {
    name: name,
    size: binarySize,
    percentage: 0,
    dataType: data.dataType,
    senderPeerId: peerId,
    timeout: timeout,
    isPrivate: data.isPrivate
  }, false);
};

/**
 * Handles the ACK Protocol request received from the DataChannel connection.
 * @method _ACKProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {JSON} data The data object received from the DataChannel connection.
 *   This should contain the <code>ACK</code> payload.
 * @param {Number} data.ackN The ACK response of the current data transfer.
 *   If <code>0</code>, it means that the request has been accepted and the sending PeerConnection
 *   has to send the first data transfer packet (chunk). If it's greater than <code>0</code>,
 *   it means that the previous data transfer packet (chunk) has been received and is expecting
 *   for the next data transfer packet. The number always increment based on the number of data
 *   packets the receiving end has received. If it's <code>-1</code>, it means that the data
 *   transfer request has been rejected and the data transfer will be terminated.
 * @param {String} data.sender The sender PeerConnection ID.
 * @param {String} data.type Protocol step <code>"ACK"</code>.
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
 * @trigger dataTransferState
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelName) {
  var self = this;
  var ackN = data.ackN;
  var transferStatus = self._uploadDataSessions[channelName];

  if (!transferStatus) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Ignoring data received as ' +
      'upload data transfers is empty'], {
        status: transferStatus,
        data: data
    });
    return;
  }
  //peerId = (peerId === 'MCU') ? data.sender : peerId;
  var chunksLength = self._uploadDataTransfers[channelName].length;
  var transferId = transferStatus.transferId;
  var timeout = transferStatus.timeout;

  self._clearDataChannelTimeout(peerId, true, channelName);
  log.log([peerId, 'RTCDataChannel', channelName, 'ACK stage (' +
    transferStatus.transferId + ') ->'], ackN + ' / ' + chunksLength);

  if (ackN > -1) {
    // Still uploading
    if (ackN < chunksLength) {
      var sendDataFn = function (base64BinaryString) {
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
              dataType: transferStatus.dataType,
              senderPeerId: transferStatus.senderPeerId,
              timeout: transferStatus.timeout,
              isPrivate: transferStatus.isPrivate
          });
        }
      };

      if (transferStatus.dataType === 'blob') {
        self._blobToBase64(self._uploadDataTransfers[channelName][ackN], sendDataFn);
      } else {
        sendDataFn(self._uploadDataTransfers[channelName][ackN]);
      }
    } else if (ackN === chunksLength) {
	    log.log([peerId, 'RTCDataChannel', channelName, 'Upload completed (' +
        transferStatus.transferId + ')'], transferStatus);

      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: 100,
          data: null,
          dataType: transferStatus.dataType,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout,
          isPrivate: transferStatus.isPrivate
      });

      var blob = null;

      if (transferStatus.dataType === 'blob') {
        blob = new Blob(self._uploadDataTransfers[channelName]);
      } else {
        blob = self._assembleDataURL(self._uploadDataTransfers[channelName]);
      }

      self._trigger('incomingData', blob, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: 100,
        dataType: transferStatus.dataType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
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
        name: transferStatus.name, //self._uploadDataSessions[channelName].name,
        size: transferStatus.size, //self._uploadDataSessions[channelName].size,
        percentage: 0,
        data: null,
        dataType: transferStatus.dataType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
    });
    delete self._uploadDataTransfers[channelName];
    delete self._uploadDataSessions[channelName];

    // close datachannel if rejected
    if (self._dataChannels[peerId] && self._dataChannels[peerId][channelName]) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Closing datachannel for upload transfer']);
      self._closeDataChannel(peerId, channelName);
    }
  }
};

/**
 * Handles the MESSAGE Protocol request received from the DataChannel connection.
 * @method _MESSAGEProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {JSON} data The data object received from the DataChannel connection.
 *   This should contain the <code>MESSAGE</code> payload.
 * @param {String} data.target The targeted PeerConnection ID to receive the message object.
 * @param {String|JSON} data.data The message object.
 * @param {String} data.sender The sender PeerConnection ID.
 * @param {String} data.type Protocol step <code>"MESSAGE"</code>.
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
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
 * Handles the ERROR Protocol request received from the DataChannel connection.
 * @method _ERRORProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {JSON} data The data object received from the DataChannel connection.
 *   This should contain the <code>ERROR</code> payload.
 * @param {String} data.name The transfer data object name.
 * @param {String} data.content The error message.
 * @param {Boolean} [data.isUploadError=false] The flag thats indicates if the response
 *   is related to a downloading or uploading data transfer.
 * @param {String} data.sender The sender PeerConnection ID.
 * @param {String} data.type Protocol step <code>"ERROR"</code>.
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
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
      dataType: transferStatus.dataType,
      senderPeerId: transferStatus.senderPeerId,
      timeout: transferStatus.timeout,
      isPrivate: transferStatus.isPrivate
    }, {
      message: data.content,
      transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD)
  });
};

/**
 * Handles the CANCEL Protocol request received from the DataChannel connection.
 * @method _CANCELProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {JSON} data The data object received from the DataChannel connection.
 *   This should contain the <code>CANCEL</code> payload.
 * @param {String} data.name The transfer data object name.
 * @param {String} data.content The reason for termination as a message.
 * @param {String} data.sender The sender PeerConnection ID.
 * @param {String} data.type Protocol step <code>"CANCEL"</code>.
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
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
      (isUpload ? 'upload' : 'download') + ' data session is empty'], data);
    return;
  }

  var transferId = transferStatus.transferId;

  log.log([peerId, 'RTCDataChannel', channelName,
    'Received file transfer cancel request:'], data);

  this._clearDataChannelTimeout(peerId, isUpload, channelName);

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
        dataType: transferStatus.dataType,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
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
        dataType: transferStatus.dataType,
        percentage: transferStatus.percentage,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
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
 * Handles the DATA Protocol request received from the DataChannel connection.
 * In this handler, it actually handles and manipulates the received data transfer packet.
 * @method _DATAProtocolHandler
 * @param {String} senderPeerId The PeerConnection ID associated with the DataChannel connection.
 * @param {ArrayBuffer|Blob|String} dataString The data transfer packet (chunk) received.
 * @param {String} dataType The data transfer packet (chunk) data type received.
 *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
 * @param {String} channelName The DataChannel connection ID associated with the transfer.
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
  var dataTransferType = transferStatus.dataType;
  var receivedSize = 0;

  this._clearDataChannelTimeout(peerId, false, channelName);

  if (dataType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    if (dataTransferType === 'blob') {
      chunk = this._base64ToBlob(dataString);
      receivedSize = (chunk.size * (4 / 3));
    } else {
      chunk = dataString;
      receivedSize = dataString.length;
    }
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
        dataType: dataTransferType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
      }, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
    });
    return;
  }

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

    if (transferStatus.chunkSize === receivedSize && percentage < 100) {
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
          dataType: dataTransferType,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout,
          isPrivate: transferStatus.isPrivate
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

      var blob = null;

      if (dataTransferType === 'blob') {
        blob = new Blob(this._downloadDataTransfers[channelName]);
      } else {
        blob = this._assembleDataURL(this._downloadDataTransfers[channelName]);
      }
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
        transferId, peerId, {
          name: transferStatus.name,
          size: transferStatus.size,
          percentage: 100,
          data: blob,
          dataType: dataTransferType,
          senderPeerId: transferStatus.senderPeerId,
          timeout: transferStatus.timeout,
          isPrivate: transferStatus.isPrivate
      });

      this._trigger('incomingData', blob, transferId, peerId, {
        name: transferStatus.name,
        size: transferStatus.size,
        percentage: 100,
        dataType: dataTransferType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
      }, false);

      delete this._downloadDataTransfers[channelName];
      delete this._downloadDataSessions[channelName];

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
        dataType: dataTransferType,
        senderPeerId: transferStatus.senderPeerId,
        timeout: transferStatus.timeout,
        isPrivate: transferStatus.isPrivate
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
 * Starts a [Blob](https://developer.mozilla.org/en/docs/Web/API/Blob) data transfer
 *   with PeerConnections using the DataChannel connection.
 * You can transfer files using the <code>input</code> [fileupload object](
 *   http://www.w3schools.com/jsref/dom_obj_fileupload.asp) and accessing the receiving
 *   files using [FileUpload files property](http://www.w3schools.com/jsref/prop_fileupload_files.asp).
 * The [File](https://developer.mozilla.org/en/docs/Web/API/File) object inherits from
 *   the Blob interface which is passable in this method as a Blob object.
 * The receiving PeerConnections have the option to accept or reject the data transfer.
 * @method sendBlobData
 * @param {Blob} data The Blob data object to transfer to PeerConnections.
 * @param {Number} [timeout=60] The waiting timeout in seconds that the DataChannel connection
 *   data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {String|Array} [targetPeerId] The array of targeted PeerConnections to transfer the
 *   data object to. Alternatively, you may provide this parameter as a string to a specific
 *   targeted PeerConnection to transfer the data object.
 * @param {Function} [callback] The callback fired after all the data transfers is completed
 *   successfully or met with an exception. The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {String} [callback.error.state=null] <i>Deprecated</i>. The
 *   <a href="#event_dataTransferState">dataTransferState</a>
 *   when the error has occurred. This only triggers for a single targeted PeerConnection data transfer.
 * @param {Object|String} [callback.error.error=null] <i>Deprecated</i>. The error received when the
 *   data transfer fails. This only triggers for single targeted PeerConnection data transfer.
 * @param {String} callback.error.transferId The transfer ID of the failed data transfer.
 * @param {String} [callback.error.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.error.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.error.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.error.transferErrors The list of errors occurred based on per PeerConnection
 *   basis.
 * @param {Object|String} callback.error.transferErrors.(#peerId) The error that occurred when having
 *   a DataChannel connection data transfer with associated PeerConnection.
 * @param {JSON} callback.error.transferInfo The transfer data object information.
 * @param {String} [callback.error.transferInfo.name=transferId] The transfer data object name.
 *   If there is no name based on the Blob given, the name would be the transfer ID.
 * @param {Number} callback.error.transferInfo.size The transfer data size.
 * @param {String} callback.error.transferInfo.transferId The data transfer ID.
 * @param {String} callback.error.transferInfo.dataType The type of data transfer initiated.
 *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
 * @param {String} callback.error.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.error.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {String} [callback.success.state=null] <i>Deprecated</i>. The
 *   <a href="#event_dataTransferState">dataTransferState</a>
 *   when the data transfer has been completed successfully.
 *   This only triggers for a single targeted PeerConnection data transfer.
 * @param {String} callback.success.transferId The transfer ID of the successful data transfer.
 * @param {String} [callback.success.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.success.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.success.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success.transferInfo The transfer data object information.
 * @param {String} [callback.success.transferInfo.name=transferId] The transfer data object name.
 *   If there is no name based on the Blob given, the name would be the transfer ID.
 * @param {Number} callback.success.transferInfo.size The transfer data size.
 * @param {String} callback.success.transferInfo.transferId The data transfer ID.
 * @param {String} callback.success.transferInfo.dataType The type of data transfer initiated.
 *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
 * @param {String} callback.success.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.success.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @example
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
 *       console.error("Error happened. Could not send file", error);
 *     }
 *     else{
 *       console.info("Successfully uploaded file");
 *     }
 *   });
 *
 * @trigger dataTransferState
 * @since 0.5.5
 * @component DataTransfer
 * @for Skylink
 */
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, callback) {
  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var dataInfo = {};
  var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
  // for error case
  var errorMsg, errorPayload, i, peerId; // for jshint
  var singleError = null;
  var transferErrors = {};
  var stateError = null;
  var singlePeerId = null;

  //Shift parameters
  // timeout
  if (typeof timeout === 'function') {
    callback = timeout;

  } else if (typeof timeout === 'string') {
    listOfPeers = [timeout];
    isPrivate = true;

  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
    isPrivate = true;
  }

  // targetPeerId
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;

  // data, timeout, target [array], callback
  } else if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  // data, timeout, target [string], callback
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  //state: String, Deprecated. But for consistency purposes. Null if not a single peer
  //error: Object, Deprecated. But for consistency purposes. Null if not a single peer
  //transferId: String,
  //peerId: String, Deprecated. But for consistency purposes. Null if not a single peer
  //listOfPeers: Array, NEW!!
  //isPrivate: isPrivate, NEW!!
  //transferErrors: JSON, NEW!! - Array of errors
  //transferInfo: JSON The same payload as dataTransferState transferInfo payload

  // check if it's blob data
  if (!(typeof data === 'object' && data instanceof Blob)) {
    errorMsg = 'Provided data is not a Blob data';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  // populate data
  dataInfo.name = data.name || transferId;
  dataInfo.size = data.size;
  dataInfo.timeout = typeof timeout === 'number' ? timeout : 60;
  dataInfo.transferId = transferId;
  dataInfo.dataType = 'blob';
  dataInfo.isPrivate = isPrivate;

  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    errorMsg = 'Unable to send any blob data. Datachannel is disabled';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '], errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  this._startDataTransfer(data, dataInfo, listOfPeers, callback);
};


/**
 * Starts the actual data transfers with the array of PeerConnections provided
 *   and based on the data transfer type to start the DataChannel connection data transfer.
 * @method _startDataTransfer
 * @param {Blob|String} data The transfer data object.
 * @param {JSON} dataInfo The transfer data object information.
 * @param {String} [dataInfo.name=transferId] The transfer data object name.
 *   If there is no name based on the Blob given, the name would be the transfer ID.
 * @param {Number} dataInfo.size The transfer data size.
 * @param {String} dataInfo.transferId The data transfer ID.
 * @param {String} dataInfo.dataType The type of data transfer initiated.
 *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
 * @param {String} dataInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} dataInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {Array} [listOfPeers] The array of targeted PeerConnections to transfer the
 *   data object to.
 * @param {Function} [callback] The callback fired after all the data transfers is completed
 *   successfully or met with an exception. The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {String} [callback.error.state=null] <i>Deprecated</i>. The
 *   <a href="#event_dataTransferState">dataTransferState</a>
 *   when the error has occurred. This only triggers for a single targeted PeerConnection data transfer.
 * @param {Object|String} [callback.error.error=null] <i>Deprecated</i>. The error received when the
 *   data transfer fails. This only triggers for single targeted PeerConnection data transfer.
 * @param {String} callback.error.transferId The transfer ID of the failed data transfer.
 * @param {String} [callback.error.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.error.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.error.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.error.transferErrors The list of errors occurred based on per PeerConnection
 *   basis.
 * @param {Object|String} callback.error.transferErrors.(#peerId) The error that occurred when having
 *   a DataChannel connection data transfer with associated PeerConnection.
 * @param {JSON} callback.error.transferInfo The transfer data object information.
 * @param {String} [callback.error.transferInfo.name=transferId] The transfer data object name.
 *   If there is no name based on the Blob given, the name would be the transfer ID.
 * @param {Number} callback.error.transferInfo.size The transfer data size.
 * @param {String} callback.error.transferInfo.transferId The data transfer ID.
 * @param {String} callback.error.transferInfo.dataType The type of data transfer initiated.
 *   The received type would be <code>"blob"</code>.
 * @param {String} callback.error.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.error.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {String} [callback.success.state=null] <i>Deprecated</i>. The
 *   <a href="#event_dataTransferState">dataTransferState</a>
 *   when the data transfer has been completed successfully.
 *   This only triggers for a single targeted PeerConnection data transfer.
 * @param {String} callback.success.transferId The transfer ID of the successful data transfer.
 * @param {String} [callback.success.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.success.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.success.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success.transferInfo The transfer data object information.
 * @param {String} [callback.success.transferInfo.name=transferId] The transfer data object name.
 *   If there is no name based on the Blob given, the name would be the transfer ID.
 * @param {Number} callback.success.transferInfo.size The transfer data size.
 * @param {String} callback.success.transferInfo.transferId The data transfer ID.
 * @param {String} callback.success.transferInfo.dataType The type of data transfer initiated.
 *   The received type would be <code>"blob"</code>.
 * @param {String} callback.success.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.success.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @private
 * @component DataTransfer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(data, dataInfo, listOfPeers, callback) {
  var self = this;
  var error = '';
  var noOfPeersSent = 0;
  var transferId = dataInfo.transferId;
  var dataType = dataInfo.dataType;
  var isPrivate = dataInfo.isPrivate;
  var i;
  var peerId;

  // for callback
  var listOfPeersTransferState = {};
  var transferSuccess = true;
  var listOfPeersTransferErrors = {};
  var listOfPeersChannels = {};
  var successfulPeerTransfers = [];

  var triggerCallbackFn = function () {
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
          peerId: listOfPeers[0],
          listOfPeers: listOfPeers,
          transferId: transferId,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo
        });
      } else {
        callback(null,{
          state: null,
          peerId: null,
          transferId: transferId,
          listOfPeers: listOfPeers,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo
        });
      }
    } else {
      log.log([null, 'RTCDataChannel', transferId, 'Firing failure callback for data transfer'], dataInfo);

      // should we even support this? maybe keeping to not break older impl
      if (listOfPeers.length === 1 && isPrivate) {
        callback({
          state: self.DATA_TRANSFER_STATE.ERROR,
          error: listOfPeersTransferErrors[listOfPeers[0]],
          peerId: listOfPeers[0],
          transferId: transferId,
          transferErrors: listOfPeersTransferErrors,
          transferInfo: dataInfo,
          isPrivate: isPrivate, // added new flag to indicate privacy
          listOfPeers: listOfPeers
        }, null);
      } else {
        callback({
          state: null,
          peerId: null,
          error: null,
          transferId: transferId,
          listOfPeers: listOfPeers,
          isPrivate: isPrivate, // added new flag to indicate privacy
          transferInfo: dataInfo,
          transferErrors: listOfPeersTransferErrors
        }, null);
      }
    }
  };

  for (i = 0; i < listOfPeers.length; i++) {
    peerId = listOfPeers[i];

    if (self._dataChannels[peerId] && self._dataChannels[peerId].main) {
      log.log([peerId, 'RTCDataChannel', null, 'Sending blob data ->'], dataInfo);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          percentage: 0,
          data: data,
          dataType: dataType,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: dataInfo.isPrivate
      });

      self._trigger('incomingDataRequest', transferId, peerId, {
        name: dataInfo.name,
        size: dataInfo.size,
        percentage: 0,
        dataType: dataType,
        senderPeerId: self._user.sid,
        timeout: dataInfo.timeout,
        isPrivate: dataInfo.isPrivate
      }, true);

      if (!self._hasMCU) {
        listOfPeersChannels[peerId] =
          self._sendBlobDataToPeer(data, dataInfo, peerId, isPrivate, transferId);
      } else {
        listOfPeersChannels[peerId] = self._dataChannels[peerId].main.label;
      }

      noOfPeersSent++;

    } else {
      error = 'Datachannel does not exist. Unable to start data transfer with peer';
      log.error([peerId, 'RTCDataChannel', null, error]);
      listOfPeersTransferErrors[peerId] = error;
    }
  }

  // if has MCU
  if (self._hasMCU) {
    self._sendBlobDataToPeer(data, dataInfo, listOfPeers, isPrivate, transferId);
  }

  if (noOfPeersSent === 0) {
    error = 'Failed sending data as there is no available datachannels to send data';

    for (i = 0; i < listOfPeers.length; i++) {
      peerId = listOfPeers[i];

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
        transferId, peerId, {
          name: dataInfo.name,
          size: dataInfo.size,
          data: null,
          dataType: dataType,
          percentage: 0,
          senderPeerId: self._user.sid,
          timeout: dataInfo.timeout,
          isPrivate: dataInfo.isPrivate
        }, {
          message: error,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });

      listOfPeersTransferErrors[peerId] = error;
    }

    log.error([null, 'RTCDataChannel', null, error]);
    self._uploadDataTransfers = [];
    self._uploadDataSessions = [];

    transferSuccess = false;

    if (typeof callback === 'function') {
      triggerCallbackFn();
    }
    return;
  }

  if (typeof callback === 'function') {
    var dataChannelStateFn = function(state, transferringPeerId, errorObj, channelName, channelType){
      // check if error or closed halfway, if so abort
      if (state === self.DATA_CHANNEL_STATE.ERROR &&
        state === self.DATA_CHANNEL_STATE.CLOSED &&
        listOfPeersChannels[peerId] === channelName) {
        // if peer has already been inside, ignore
        if (successfulPeerTransfers.indexOf(transferringPeerId) === -1) {
          listOfPeersTransferState[transferringPeerId] = false;
          listOfPeersTransferErrors[transferringPeerId] = errorObj;

          log.error([transferringPeerId, 'RTCDataChannel', null,
            'Data channel state has met a failure state for peer (datachannel) ->'], {
              state: state,
              error: errorObj
          });
        }
      }

      if (Object.keys(listOfPeersTransferState).length === listOfPeers.length) {
        self.off('dataTransferState', dataTransferStateFn);
        self.off('dataChannelState', dataChannelStateFn);

        log.log([null, 'RTCDataChannel', transferId,
          'Transfer states have been gathered completely in dataChannelState'], state);

        triggerCallbackFn();
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

          if (state === self.DATA_TRANSFER_STATE.REJECTED) {
            errorObj = new Error('Peer has rejected data transfer request');
          }

          log.error([transferringPeerId, 'RTCDataChannel', stateTransferId,
            'Data transfer state has met a failure state for peer ->'], {
              state: state,
              error: errorObj
          });

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

        triggerCallbackFn();
      }
    };
    self.on('dataTransferState', dataTransferStateFn);
    self.on('dataChannelState', dataChannelStateFn);
  }
};


/**
 * Responds to a data transfer request by rejecting or accepting
 *   the data transfer request initiated by a PeerConnection.
 * @method respondBlobRequest
 * @param {String} peerId The sender PeerConnection ID.
 * @param {String} transferId The data transfer ID of the data transfer request
 *   to accept or reject.
 * @param {Boolean} [accept=false] The flag that indicates <code>true</code> as a response
 *   to accept the data transfer and <code>false</code> as a response to reject the
 *   data transfer request.
 * @trigger dataTransferState
 * @component DataTransfer
 * @deprecated Use <a href="#method_acceptDataTransfer">acceptDataTransfer()</a>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.respondBlobRequest =
/**
 * Responds to a data transfer request by rejecting or accepting
 *   the data transfer request initiated by a PeerConnection.
 * @method acceptDataTransfer
 * @param {String} peerId The sender PeerConnection ID.
 * @param {String} transferId The data transfer ID of the data transfer request
 *   to accept or reject.
 * @param {Boolean} [accept=false] The flag that indicates <code>true</code> as a response
 *   to accept the data transfer and <code>false</code> as a response to reject the
 *   data transfer request.
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
        dataType: data.dataType,
        percentage: 0,
        senderPeerId: peerId,
        timeout: data.timeout,
        isPrivate: data.isPrivate
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
    }, channelName);
    delete this._downloadDataSessions[channelName];
  }
};

/**
 * Terminates an ongoing DataChannel connection data transfer.
 * @method cancelBlobTransfer
 * @param {String} peerId The PeerConnection ID associated with the data transfer.
 * @param {String} transferId The data transfer ID of the data transfer request
 *   to terminate the request.
 * @trigger dataTransferState
 * @component DataTransfer
 * @deprecated Use <a href="#method_cancelDataTransfer">cancelDataTransfer()</a>
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.cancelBlobTransfer =
/**
 * Terminates an ongoing DataChannel connection data transfer.
 * @method cancelDataTransfer
 * @param {String} peerId The PeerConnection ID associated with the data transfer.
 * @param {String} transferId The data transfer ID of the data transfer request
 *   to terminate the request.
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

    delete this._uploadDataSessions[channelName];
    delete this._uploadDataTransfers[channelName];

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

    delete this._downloadDataSessions[channelName];
    delete this._downloadDataTransfers[channelName];

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
      dataType: data.dataType,
      senderPeerId: data.senderPeerId,
      timeout: data.timeout,
      isPrivate: data.isPrivate
  });
};

/**
 * Send a message object or string using the DataChannel connection
 *   associated with the list of targeted PeerConnections.
 * The maximum size for the message object would be<code>16Kb</code>.<br>
 * To send a string length longer than <code>16kb</code>, please considered
 *   to use {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}
 *   to send longer strings (for that instance base64 binary strings are long).
 * To send message objects with platform signaling socket connection, see
 *   {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}.
 * @method sendP2PMessage
 * @param {String|JSON} message The message object.
 * @param {String|Array} [targetPeerId] The array of targeted PeerConnections to
 *   transfer the message object to. Alternatively, you may provide this parameter
 *   as a string to a specific targeted PeerConnection to transfer the message object.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendP2PMessage("Hi there! This is from a DataChannel connection!"");
 *
 *   // Example 2: Send to specific peer
 *   SkylinkDemo.sendP2PMessage("Hi there peer! This is from a DataChannel connection!", targetPeerId);
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

  for (var i = 0; i < listOfPeers.length; i++) {
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
  }

  self._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId || null,
    isDataChannel: true,
    senderPeerId: self._user.sid
  }, self._user.sid, self.getPeerInfo(), true);
};

/**
 * Starts a [dataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   /readAsDataURL) data transfer with PeerConnections using the DataChannel connection.
 * The receiving PeerConnections have the option to accept or reject the data transfer.
 * @method sendURLData
 * @param {String} data The dataURL (base64 binary string) string to transfer to PeerConnections.
 * @param {Number} [timeout=60] The waiting timeout in seconds that the DataChannel connection
 *   data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {String|Array} [targetPeerId] The array of targeted PeerConnections to transfer the
 *   data object to. Alternatively, you may provide this parameter as a string to a specific
 *   targeted PeerConnection to transfer the data object.
 * @param {Function} [callback] The callback fired after all the data transfers is completed
 *   successfully or met with an exception. The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {String} [callback.error.state=null] <i>Deprecated</i>. The
 *   <a href="#event_dataTransferState">dataTransferState</a>
 *   when the error has occurred. This only triggers for a single targeted PeerConnection data transfer.
 * @param {Object|String} [callback.error.error=null] <i>Deprecated</i>. The error received when the
 *   data transfer fails. This only triggers for single targeted PeerConnection data transfer.
 * @param {String} callback.error.transferId The transfer ID of the failed data transfer.
 * @param {String} [callback.error.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.error.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.error.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.error.transferErrors The list of errors occurred based on per PeerConnection
 *   basis.
 * @param {Object|String} callback.error.transferErrors.(#peerId) The error that occurred when having
 *   a DataChannel connection data transfer with associated PeerConnection.
 * @param {JSON} callback.error.transferInfo The transfer data object information.
 * @param {String} [callback.error.transferInfo.name=transferId] The data transfer ID.
 * @param {Number} callback.error.transferInfo.size The transfer data size.
 * @param {String} callback.error.transferInfo.transferId The data transfer ID.
 * @param {String} callback.error.transferInfo.dataType The type of data transfer initiated.
 *   The received type would be <code>"dataURL"</code>.
 * @param {String} callback.error.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.error.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {String} [callback.success.state=null] <i>Deprecated</i>. The
 *   <a href="#method_dataTransferState">dataTransferState</a>
 *   when the data transfer has been completed successfully.
 *   This only triggers for a single targeted PeerConnection data transfer.
 * @param {String} callback.success.transferId The transfer ID of the successful data transfer.
 * @param {String} [callback.success.peerId=null] The single targeted PeerConnection ID for the data transfer.
 *   This only triggers for single targeted PeerConnection data transfer.
 * @param {Array} callback.success.listOfPeers The list of PeerConnection that the data transfer has been
 *   initiated with.
 * @param {Boolean} callback.success.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @param {JSON} callback.success.transferInfo The transfer data object information.
 * @param {String} [callback.success.transferInfo.name=transferId] The data transfer ID.
 * @param {Number} callback.success.transferInfo.size The transfer data size.
 * @param {String} callback.success.transferInfo.transferId The data transfer ID.
 * @param {String} callback.success.transferInfo.dataType The type of data transfer initiated.
 *   The received type would be <code>"dataURL"</code>.
 * @param {String} callback.success.transferInfo.timeout The waiting timeout in seconds that the DataChannel
 *   connection data transfer should wait before throwing an exception and terminating the data transfer.
 * @param {Boolean} callback.success.transferInfo.isPrivate The flag to indicate if the data transfer is a private
 *   transfer to the PeerConnection directly and not broadcasted to all PeerConnections.
 * @example
 *
 *   // Example 1: Send dataURL to all peers connected
 *   SkylinkDemo.sendURLData(dataURL, 67);
 *
 *   // Example 2: Send dataURL to individual peer
 *   SkylinkDemo.sendURLData(dataURL, 87, targetPeerId);
 *
 *   // Example 3: Send dataURL with callback
 *   SkylinkDemo.sendURLData(dataURL, 87, function(error, success){
 *     if (error){
 *       console.error("Error happened. Could not send dataURL", error);
 *     }
 *     else{
 *       console.info("Successfully sent dataURL");
 *     }
 *   });
 *
 * @trigger dataTransferState
 * @since 0.6.1
 * @component DataTransfer
 * @for Skylink
 */
Skylink.prototype.sendURLData = function(data, timeout, targetPeerId, callback) {
  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var dataInfo = {};
  var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
    (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
  // for error case
  var errorMsg, errorPayload, i, peerId; // for jshint
  var singleError = null;
  var transferErrors = {};
  var stateError = null;
  var singlePeerId = null;

  //Shift parameters
  // timeout
  if (typeof timeout === 'function') {
    callback = timeout;

  } else if (typeof timeout === 'string') {
    listOfPeers = [timeout];
    isPrivate = true;

  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
    isPrivate = true;
  }

  // targetPeerId
  if (typeof targetPeerId === 'function'){
    callback = targetPeerId;

  // data, timeout, target [array], callback
  } else if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  // data, timeout, target [string], callback
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  //state: String, Deprecated. But for consistency purposes. Null if not a single peer
  //error: Object, Deprecated. But for consistency purposes. Null if not a single peer
  //transferId: String,
  //peerId: String, Deprecated. But for consistency purposes. Null if not a single peer
  //listOfPeers: Array, NEW!!
  //isPrivate: isPrivate, NEW!!
  //transferErrors: JSON, NEW!! - Array of errors
  //transferInfo: JSON The same payload as dataTransferState transferInfo payload

  // check if it's blob data
  if (typeof data !== 'string') {
    errorMsg = 'Provided data is not a dataURL';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '],errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  // populate data
  dataInfo.name = data.name || transferId;
  dataInfo.size = data.size || data.length;
  dataInfo.timeout = typeof timeout === 'number' ? timeout : 60;
  dataInfo.transferId = transferId;
  dataInfo.dataType = 'dataURL';
  dataInfo.isPrivate = isPrivate;

  // check if datachannel is enabled first or not
  if (!this._enableDataChannel) {
    errorMsg = 'Unable to send any dataURL. Datachannel is disabled';

    if (listOfPeers.length === 0) {
      transferErrors.self = errorMsg;

    } else {
      for (i = 0; i < listOfPeers.length; i++) {
        peerId = listOfPeers[i];
        transferErrors[peerId] = errorMsg;
      }

      // Deprecated but for consistency purposes. Null if not a single peer.
      if (listOfPeers.length === 1 && isPrivate) {
        stateError = self.DATA_TRANSFER_STATE.ERROR;
        singleError = errorMsg;
        singlePeerId = listOfPeers[0];
      }
    }

    errorPayload = {
      state: stateError,
      error: singleError,
      transferId: transferId,
      peerId: singlePeerId,
      listOfPeers: listOfPeers,
      transferErrors: transferErrors,
      transferInfo: dataInfo,
      isPrivate: isPrivate
    };

    log.error(errorMsg, errorPayload);

    if (typeof callback === 'function'){
      log.log([null, 'RTCDataChannel', null, 'Error occurred. Firing callback ' +
        'with error -> '], errorPayload);
      callback(errorPayload, null);
    }
    return;
  }

  this._startDataTransfer(data, dataInfo, listOfPeers, callback);
};

/**
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>0.1.0</code>
 * </blockquote>
 * The value of the current version of the data transfer protocol.
 * @attribute DT_PROTOCOL_VERSION
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * The list of data transfers directions.
 * @attribute DATA_TRANSFER_TYPE
 * @param {String} UPLOAD <small>Value <code>"upload"</code></small>
 *   The value of the data transfer direction when User is uploading data to Peer.
 * @param {String} DOWNLOAD <small>Value <code>"download"</code></small>
 *   The value of the data transfer direction when User is downloading data from Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * The list of data transfers session types.
 * @attribute DATA_TRANSFER_SESSION_TYPE
 * @param {String} BLOB     <small>Value <code>"blob"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfer.
 * @param {String} DATA_URL <small>Value <code>"dataURL"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendBlobData"><code>method_sendBlobData()</code> method</a> data transfer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_SESSION_TYPE = {
  BLOB: 'blob',
  DATA_URL: 'dataURL'
};

/**
 * The list of data transfer states.
 * @attribute DATA_TRANSFER_STATE
 * @param {String} UPLOAD_REQUEST     <small>Value <code>"request"</code></small>
 *   The value of the state when receiving an upload data transfer request from Peer to User.
 *   <small>At this stage, the upload data transfer request from Peer may be accepted or rejected with the
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a>.</small>
 * @param {String} UPLOAD_STARTED     <small>Value <code>"uploadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start uploading data to Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} DOWNLOAD_STARTED   <small>Value <code>"downloadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start downloading data from Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} REJECTED           <small>Value <code>"rejected"</code></small>
 *   The value of the state when upload data transfer request to Peer has been rejected and terminated.
 * @param {String} UPLOADING          <small>Value <code>"uploading"</code></small>
 *   The value of the state when data transfer is uploading data to Peer.
 * @param {String} DOWNLOADING        <small>Value <code>"downloading"</code></small>
 *   The value of the state when data transfer is downloading data from Peer.
 * @param {String} UPLOAD_COMPLETED   <small>Value <code>"uploadCompleted"</code></small>
 *   The value of the state when data transfer has uploaded successfully to Peer.
 * @param {String} DOWNLOAD_COMPLETED <small>Value <code>"downloadCompleted"</code></small>
 *   The value of the state when data transfer has downloaded successfully from Peer.
 * @param {String} CANCEL             <small>Value <code>"cancel"</code></small>
 *   The value of the state when data transfer has been terminated from / to Peer.
 * @param {String} ERROR              <small>Value <code>"error"</code></small>
 *   The value of the state when data transfer has errors and has been terminated from / to Peer.
 * @type JSON
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
 * Stores the fixed delimiter that concats the Datachannel label and actual transfer ID.
 * @attribute _TRANSFER_DELIMITER
 * @type String
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._TRANSFER_DELIMITER = '_skylink__';

/**
 * Stores the list of data transfer protocols.
 * @attribute _DC_PROTOCOL_TYPE
 * @param {String} WRQ The protocol to initiate data transfer.
 * @param {String} ACK The protocol to request for data transfer chunk.
 *   Give <code>-1</code> to reject the request at the beginning and <code>0</code> to accept
 *   the data transfer request.
 * @param {String} CANCEL The protocol to terminate data transfer.
 * @param {String} ERROR The protocol when data transfer has errors and has to be terminated.
 * @param {String} MESSAGE The protocol that is used to send P2P messages.
 * @type JSON
 * @readOnly
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
 * Stores the list of types of SDKs that do not support simultaneous data transfers.
 * @attribute _INTEROP_MULTI_TRANSFERS
 * @type Array
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._INTEROP_MULTI_TRANSFERS = ['Android', 'iOS'];

/**
 * Stores the list of uploading data transfers chunks to Peers.
 * @attribute _uploadDataTransfers
 * @param {Array} <#transferId> The uploading data transfer chunks.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataTransfers = {};

/**
 * Stores the list of uploading data transfer sessions to Peers.
 * @attribute _uploadDataSessions
 * @param {JSON} <#transferId> The uploading data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._uploadDataSessions = {};

/**
 * Stores the list of downloading data transfers chunks to Peers.
 * @attribute _downloadDataTransfers
 * @param {Array} <#transferId> The downloading data transfer chunks.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataTransfers = {};

/**
 * Stores the list of downloading data transfer sessions to Peers.
 * @attribute _downloadDataSessions
 * @param {JSON} <#transferId> The downloading data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._downloadDataSessions = {};

/**
 * Stores the list of data transfers from / to Peers.
 * @attribute _dataTransfers
 * @param {JSON} #transferId The data transfer session.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._dataTransfers = {};

/**
 * Stores the list of data transfer "wait-for-response" timeouts.
 * @attribute _dataTransfersTimeout
 * @param {Object} <#transferId> The data transfer session "wait-for-response" timeout.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype._dataTransfersTimeout = {};

/**
 * <blockquote class="info">
 *   Note that Android and iOS SDKs do not support simultaneous data transfers.
 * </blockquote>
 * Function that starts an uploading data transfer from User to Peers.
 * @method sendBlobData
 * @param {Blob} data The Blob object.
 * @param {Number} [timeout=60] The timeout to wait for response from Peer.
 * @param {String|Array} [targetPeerId] The target Peer ID to start data transfer with.
 * - When provided as an Array, it will start uploading data transfers with all connections
 *   with all the Peer IDs provided.
 * - When not provided, it will start uploading data transfers with all the currently connected Peers in the Room.
 * @param {Boolean} [sendChunksAsBinary=false] The flag if data transfer binary data chunks should not be
 *   encoded as Base64 string during data transfers.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggering <code>state</code> parameter payload
 *   as <code>UPLOAD_COMPLETED</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {String} callback.error.transferId The data transfer ID.
 *   <small>Defined as <code>null</code> when <code>sendBlobData()</code> fails to start data transfer.</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.transferId The data transfer ID.
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if should open a new Datachannel <ol>
 *   <li>If Peer connection has closed: <small>This can be checked with <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggering parameter payload <code>state</code> as <code>CLOSED</code>
 *   for Peer.</small> <ol><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer supports simultaneous data transfer, open new Datachannel: <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>CONNECTING</code> and <code>channelType</code> as <code>DATA</code>.</li>
 *   <li>If Datachannel has opened successfully: <ol>
 *   <li> <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>OPEN</code> and <code>channelType</code> as <code>DATA</code>.</li></ol></li></ol></li>
 *   <li>Else: <ol><li>If Peer connection Datachannel has not been opened <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Starts the data transfer to Peer <ol>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_REQUEST</code>.</li>
 *   <li><a href="#event_incomingDataRequest"><code>incomingDataRequest</code> event</a> triggers.</li>
 *   <li>Peer invokes <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a>. <ol>
 *   <li>If parameter <code>accept</code> value is <code>true</code>: <ol>
 *   <li>User starts upload data transfer to Peer <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_STARTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_STARTED</code>.</li></ol></li>
 *   <li>If Peer / User invokes <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>CANCEL</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If data transfer has errors: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Datachannel has closed abruptly during data transfer:
 *   <small>This can be checked with <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> and <code>channelType</code>
 *   as <code>DATA</code> for Peer that supports simultaneous data transfer or <code>MESSAGING</code>
 *   for Peer that do not support it.</small> <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If data transfer is still progressing: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOADING</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOADING</code>.</li></ol></li>
 *   <li>If data transfer has completed <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_COMPLETED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_COMPLETED</code>.</li>
 *   <li><a href="#event_incomingData"><code>incomingData</code> event</a> triggers.</li></ol></li></ol></li>
 *   <li>If parameter <code>accept</code> value is <code>false</code>: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>REJECTED</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="uploadFile(this.Files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="uploadFileGroup(this.Files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="uploadFileAll(this.Files[0])" data=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    // Example 1: Upload data to a Peer
 *    function uploadFile (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("File has been transferred to '" + peerId + "' successfully");
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerId, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerId, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerIds, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerIds, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, cb);
 *      }
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, sendChunksAsBinary, callback) {
  var self = this;
  var listOfPeers = Object.key(self._peerConnections);
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: self._CHUNK_FILE_SIZE,
    chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
    dataType: self.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // sendBlobData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (timeout && typeof timeout === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendBlobData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (targetPeerId && typeof targetPeerId === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // sendBlobData(.., .., .., sendChunksAsBinary)
  if (sendChunksAsBinary && typeof sendChunksAsBinary === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof sendChunksAsBinary === 'function') {
    callback = sendChunksAsBinary;
  }

  if (window.webrtcDetectedBrowser === 'firefox' &&
    transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  }

  // Start checking if data transfer can start
  if (!(data && typeof data === 'object' && data instanceof Blob)) {
    emitErrorBeforeDataTransferFn('Provided data is not a Blob data');
    return;
  }

  transferInfo.name = data.name || null;

  if (data.size < 1) {
    emitErrorBeforeDataTransferFn('Provided data is not a valid Blob data.');
    return;
  }

  transferInfo.size = data.size;

  if (!self._user) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. User is not in Room.');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. There are no Peers to start data transfer with');
    return;
  }

  if (!self._enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. Datachannel is disabled');
    return;
  }

  self._startDataTransfer(data, transferInfo, listOfPeers, callback);
};

/**
 * Function that accepts or rejects an upload data transfer request from Peer to User.
 * @method acceptDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @param {Boolean} [accept=false] The flag if User accepts the upload data transfer request from Peer.
 * @example
 *   // Example 1: Accept Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, true);
 *      }
 *   });
 *
 *   // Example 2: Reject Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, false);
 *      }
 *   });
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>acceptDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.respondBlobRequest =
Skylink.prototype.acceptDataTransfer = function (peerId, transferId, accept) {
  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!this._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!this._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  var channelProp = 'main';

  if (this._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  if (accept) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: 0
    }, channelProp);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      this._getTransferInfo(transferId, true));

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: -1
    }, channelProp);

    //this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.REJECTED, transferId, peerId,
    //  this._getTransferInfo(transferId, true));
  }
};

/**
 * Function that terminates a currently uploading / downloading data transfer from / to Peer.
 * @method cancelDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @example
 *   // Example 1: Cancel Peer data transfer
 *   var transferSessions = {};
 *
 *   skylinkDemo.on("dataTransferState", function (state, transferId, peerId) {
 *     if ([skylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
 *       skylinkDemo.DATA_TRANSFER_STATE.UPLOAD_STARTED].indexOf(state) > -1) {
 *       if (!Array.isArray(transferSessions[transferId])) {
 *         transferSessions[transferId] = [];
 *       }
 *       transferSessions[transferId].push(peerId);
 *     } else {
 *       transferSessions[transferId].splice(transferSessions[transferId].indexOf(peerId), 1);
 *     }
 *   });
 *
 *   function cancelTransfer (peerId, transferId) {
 *     skylinkDemo.cancelDataTransfer(peerId, transferId);
 *   }
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>cancelDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.cancelBlobTransfer =
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
    this._sendMessageToDataChannel(peerId, {
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
    this._sendMessageToDataChannel(peerId, {
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
 * Function that sends a message to Peers via the Datachannel connection.
 * <small>Consider using <a href="#method_sendURLData"><code>sendURLData()</code> method</a> if you are
 * sending large strings to Peers.</small>
 * @method sendP2PMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @trigger <ol class="desc-seq">
 *  <li>Sends P2P message to all targeted Peers. <ol>
 *  <li>If Peer connection Datachannel has not been opened: <small>This can be checked with
 *  <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *  triggering parameter payload <code>state</code> as <code>OPEN</code> and
 *  <code>channelType</code> as <code>MESSAGING</code> for Peer.</small> <ol>
 *  <li><b>ABORT</b> step and return error.</li></ol></li>
 *  <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers
 *  parameter payload <code>message.isDataChannel</code> value as <code>true</code> and
 *  <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        skylinkDemo.sendP2PMessage("Hi all!");
 *      }
 *   });
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty[peerId] = false;
 *     }
 *   });
 *
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        peersInExclusiveParty[peerId] = true;
 *      }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     var readyToSend = [];
 *     for (var p in peersInExclusiveParty) {
 *       if (peersInExclusiveParty.hasOwnProperty(p)) {
 *         readyToSend.push(p);
 *       }
 *     }
 *     skylinkDemo.sendP2PMessage(message, readyToSend);
 *   }
 * @for Skylink
 * @since 0.5.5
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
  if (self._hasMCU) {
    if (isPrivate) {
      log.log(['MCU', null, null, 'Relaying private P2P message to peers'], listOfPeers);
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: listOfPeers,
        data: message
      });
    } else {
      log.log(['MCU', null, null, 'Relaying P2P message to peers']);

      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: self._user.sid,
        target: 'MCU',
        data: message
      });
    }
  } else {
    for (var i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];
      var useChannel = (self._hasMCU) ? 'MCU' : peerId;

      // Ignore MCU peer
      if (peerId === 'MCU') {
        continue;
      }

      log.log([peerId, null, useChannel, 'Sending P2P message to peer']);

      self._sendMessageToDataChannel(useChannel, {
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
 * <blockquote class="info">
 *   Currently, the Android and iOS SDKs do not support this type of data transfer session.
 * </blockquote>
 * Function that starts an uploading string data transfer from User to Peers.
 * @method sendURLData
 * @param {String} data The data string to transfer to Peer.
 * @param {Number} [timeout=60] The timeout to wait for response from Peer.
 * @param {String|Array} [targetPeerId] The target Peer ID to start data transfer with.
 * - When provided as an Array, it will start uploading data transfers with all connections
 *   with all the Peer IDs provided.
 * - When not provided, it will start uploading data transfers with all the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggering <code>state</code> parameter payload
 *   as <code>UPLOAD_COMPLETED</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {String} callback.error.transferId The data transfer ID.
 *   <small>Defined as <code>null</code> when <code>sendURLData()</code> fails to start data transfer.</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.transferId The data transfer ID.
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a>.</small>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="showImage(this.Files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="showImageGroup(this.Files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="showImageAll(this.Files[0])" data=""&gt;
 *  &lt;image id="target-1" src=""&gt;
 *  &lt;image id="target-2" src=""&gt;
 *  &lt;image id="target-3" src=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    function retrieveImageDataURL(file, cb) {
 *      var fr = new FileReader();
 *      fr.onload = function () {
 *        cb(fr.result);
 *      };
 *      fr.readAsDataURL(files[0]);
 *    }
 *
 *    // Example 1: Send image data URL to a Peer
 *    function showImage (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("Image has been transferred to '" + peerId + "' successfully");
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerId, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerId, cb);
 *        }
 *        document.getElementById("target-1").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function showImageGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerIds, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerIds, cb);
 *        }
 *        document.getElementById("target-2").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, cb);
 *        }
 *        document.getElementById("target-3").src = str;
 *      });
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.sendURLData = function(data, timeout, targetPeerId, callback) {
    var self = this;
  var listOfPeers = Object.key(self._peerConnections);
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: self._CHUNK_FILE_SIZE,
    chunkType: self.DATA_TRANSFER_DATA_TYPE.STRING,
    dataType: self.DATA_TRANSFER_SESSION_TYPE.DATA_URL,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // sendURLData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendURLData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // Start checking if data transfer can start
  if (!(data && typeof data === 'string')) {
    emitErrorBeforeDataTransferFn('Provided data is not a dataURL');
    return;
  }

  if (!self._user) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. User is not in Room.');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. There are no Peers to start data transfer with');
    return;
  }

  if (!self._enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. Datachannel is disabled');
    return;
  }

  self._startDataTransfer(data, transferInfo, listOfPeers, callback);
};

/**
 * Function that sets the data transfer "wait-for-response" timeout.
 * When there is not response after timeout, the data transfer will be terminated.
 * @method _setDataChannelTimeout
 * @private
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

      self._sendMessageToDataChannel(peerId, {
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
 * Function that stops and clears the data transfer "wait-for-response" timeout.
 * @method _clearDataChannelTimeout
 * @private
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
 * Function that starts a data transfer to Peer.
 * This will open a new data type of Datachannel connection with Peer if
 *   simultaneous data transfers is supported by Peer.
 * @method _sendBlobDataToPeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId) {
  var self = this;
  //If there is MCU then directs all messages to MCU
  var targetChannel = targetPeerId;//(self._hasMCU) ? 'MCU' : targetPeerId;
  var targetPeerList = [];

  var binarySize = 4 * Math.ceil(dataInfo.size / 3); //parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
  var binaryChunkSize = 0;
  var chunkSize = 0;
  var i;
  var hasSend = false;

  // move list of peers to targetPeerList
  if (self._hasMCU) {
    if (Array.isArray(targetPeerList)) {
      targetPeerList = targetPeerId;
    } else {
      targetPeerList = [targetPeerId];
    }
    targetPeerId = 'MCU';
  }

  if (dataInfo.dataType !== 'blob') {
    // output: 1616
    binaryChunkSize = self._CHUNK_DATAURL_SIZE;
    chunkSize = self._CHUNK_DATAURL_SIZE;
    binarySize = dataInfo.size;
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    // output: 16384
    binaryChunkSize = self._MOZ_CHUNK_FILE_SIZE; //self._MOZ_CHUNK_FILE_SIZE * (4 / 3);
    chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  } else {
    // output: 65536
    binaryChunkSize = self._CHUNK_FILE_SIZE; //parseInt((self._CHUNK_FILE_SIZE * (4 / 3)).toFixed(), 10);
    chunkSize = self._CHUNK_FILE_SIZE;
  }

  var throwTransferErrorFn = function (message) {
    // MCU targetPeerId case - list of peers
    if (self._hasMCU) {
      for (i = 0; i < targetPeerList.length; i++) {
        var peerId = targetPeerList[i];
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR,
          dataInfo.transferId, peerId, {
            name: dataInfo.name,
            size: dataInfo.size,
            percentage: 0,
            data: null,
            dataType: dataInfo.dataType,
            senderPeerId: self._user.sid,
            timeout: dataInfo.timeout,
            isPrivate: dataInfo.isPrivate
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
          isPrivate: dataInfo.isPrivate
        },{
          message: message,
          transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }
  };

  var startTransferFn = function (targetId, channel) {
    if (!hasSend) {
      hasSend = true;
      var payload = {
        type: self._DC_PROTOCOL_TYPE.WRQ,
        sender: self._user.sid,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        name: dataInfo.name,
        size: binarySize,
        dataType: dataInfo.dataType,
        chunkSize: binaryChunkSize,
        timeout: dataInfo.timeout,
        target: self._hasMCU ? targetPeerList : targetPeerId,
        isPrivate: dataInfo.isPrivate
      };

      if (self._hasMCU) {
        // if has MCU and is public, do not send individually
        self._sendMessageToDataChannel('MCU', payload, channel);
        try {
          var mainChannel = self._dataChannels.MCU.main.label;
          self._setDataChannelTimeout('MCU', dataInfo.timeout, true, mainChannel);
        } catch (error) {
          log.error(['MCU', 'RTCDataChannel', 'MCU', 'Failed setting datachannel ' +
            'timeout for MCU'], error);
        }
      } else {
        // if has MCU and is public, do not send individually
        self._sendMessageToDataChannel(targetId, payload, channel);
        self._setDataChannelTimeout(targetId, dataInfo.timeout, true, channel);
      }

    }
  };

  log.log([targetPeerId, 'RTCDataChannel', targetChannel, 'Chunk size of data:'], {
    chunkSize: chunkSize,
    binaryChunkSize: binaryChunkSize,
    transferId: dataInfo.transferId,
    dataType: dataInfo.dataType
  });


  var supportMulti = false;
  var peerAgent = (self._peerInformations[targetPeerId] || {}).agent || {};

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

    } else if (self._dataChannels[targetPeerId].main.channel.readyState !==
      self.DATA_CHANNEL_STATE.OPEN) {
      log.error([targetPeerId, 'RTCDataChannel', targetChannel,
        'Main datachannel is not opened'], {
          transferId: dataInfo.transferId,
          readyState: self._dataChannels[targetPeerId].main.readyState
      });
      throwTransferErrorFn('Main datachannel is not opened');
      return;
    }

    self._createDataChannel(targetPeerId, targetChannel);

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
    isPrivate: dataInfo.isPrivate
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
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @method _processDataChannelData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._processDataChannelData = function(rawData, peerId, channelName, channelType) {
  if (!this._peerConnections[peerId]) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Dropping data received from Peer ' +
      'as connection is not present ->'], rawData);
    return;
  }

  var data = rawData;
  var channelProp = channelType === this.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      data = JSON.parse(rawData);

      log.debug([peerId, 'RTCDataChannel', channelName, 'Received protocol message ->'], data);

      switch (data.type) {
        case this._DC_PROTOCOL_TYPE.WRQ:
          this._WRQProtocolHandler(peerId, data, channelProp);
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
        case this._DC_PROTOCOL_TYPE.MESSAGE:
          this._MESSAGEProtocolHandler(peerId, data, channelName);
          break;
        default:
          log.warn([peerId, 'RTCDataChannel', channelName, 'Discarded unknown protocol message ->'], data);
      }

    } catch (error) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Received binary string chunk']);

      this._DATAProtocolHandler(peerId, data, this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, channelName);
    }

  } else {
    var chunkDataType = rawData instanceof Blob ? this.DATA_TRANSFER_DATA_TYPE.BLOB :
      this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

    if (rawData.constructor && rawData.constructor.name === 'Array') {
      // Need to re-parse on some browsers
      data = new Int8Array(dataString);
    }

    log.debug([peerId, 'RTCDataChannel', channelName, 'Received binary data chunk']);

    this._DATAProtocolHandler(peerId, data, chunkDataType, channelName);
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, returnDataProp, peerId) {
  if (this._dataTransfers[transferId]) {
    var transferInfo = clone(this._dataTransfers[transferId].session);

    if (this._dataTransfers[transferId].session.direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].data.receivedSize >= this._dataTransfers[transferId].session.size) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].data.receivedSize /
          this._dataTransfers[transferId].session.size) * 100).toFixed(2), 10);
      }

    } else {
      if (this._dataTransfers[transferId].data.peers[peerId] >= this._dataTransfers[transferId].data.chunks.length) {
        transferInfo.percentage = 100;
      }
    }

    if (returnDataProp) {
      if (transferInfo.percentage === 100) {
        transferInfo.data = this._getTransferData(transferId);
      } else {
        transferInfo.data = null;
      }
    }

    return transferInfo;
  }

  return {};
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (this._dataTransfers[transferId]) {
    if (this._dataTransfers[transferId].session.dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
      return new Blob(this._dataTransfers[transferId].data.chunks, {
        type: this._dataTransfers[transferId].session.mimeType || ''
      });
    }
    return this._assembleDataURL(this._dataTransfers[transferId].data.chunks);
  }
  return null;
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var transferId = channelProp === 'main' ? data.transferId || peerId + '_' + (new Date()).getTime() : channelProp;

  this._dataTransfers[transferId] = {
    session: {
      name: data.name || transferId,
      size: data.size || 0,
      timeout: data.timeout || 60,
      isPrivate: !!data.isPrivate,
      senderPeerId: data.sender || peerId,
      dataType: data.dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
      mimeType: data.mimeType || null,
      chunkType: data.chunkType || this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      direction: this.DATA_TRANSFER_TYPE.DOWNLOAD
    },
    data: {
      chunks: [],
      chunkSize: data.chunkSize,
      receivedSize: 0,
      ackN: 0
    },
    responseTimer: null
  };

  this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, peerId,
    this._getTransferInfo(transferId, true), null);
  this._trigger('incomingDataRequest', transferId, peerId,
    this._getTransferInfo(transferId, false), false);
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelName) {
  var self = this;

  
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
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
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
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
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
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
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, data, chunkType, channelProp) {
  // Prevent conversion if no datachannel session
  if (!(this._dataChannels[peerId] && this._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as Datachannel connection session is not present']);
    return;
  }

  // Prevent conversion if no transferId present
  if (channelProp === 'main' && !this._dataChannels[peerId][channelProp].transferId) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as Datachannel data transfer session is at invalid state']);
    return;
  }

  var transferId   = channelProp === 'main' ? this._dataChannels[peerId][channelProp].transferId : channelProp;
  var chunk        = null;
  var chunkSize    = 0;

  // Prevent conversion if no data transfer session
  if (!this._dataTransfers[transferId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Ignoring data transfer chunk received ' +
      'as data transfer session does not exists']);
    return;
  }

  var senderPeerId = this._dataTransfers[transferId].session.senderPeerId;

  // Clear transfer timeout
  this._handleDataTransferTimer(transferId, null, true);

  // Convert the chunk to appropriate data type
  if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk']);

    chunk     = this._base64ToBlob(data);
    chunkSize = 4 * Math.ceil(chunk.size / 3); // Follow DT 0.1.0 protocol

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received ArrayBuffer data chunk']);

    chunk     = new Blob([data]);
    chunkSize = chunk.size; // * (4 / 3);

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received Blob data chunk']);

    chunk     = data;
    chunkSize = chunk.size; // * (4 / 3);

  } else {
    log.error([peerId, 'RTCDataChannel', channelProp, 'Corrupted data transfer chunk received. ' +
      'Aborting data transfer session.']);
    // TODO: trigger
    return;
  }

  // Append to chunk size
  this._dataTransfers[transferId].data.chunks[ this._dataTransfers[transferId].data.ackN ] = chunk;
  this._dataTransfers[transferId].data.receivedSize += chunkSize;

  // Completed data transfer
  if (this._dataTransfers[transferId].data.receivedSize >= this._dataTransfers[transferId].session.size) {
    log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed']);

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: this._dataTransfers[transferId].data.ackN + 1
    }, channelProp);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      this._getTransferInfo(transferId, true));
    this._trigger('incomingData', this._getTransferData(), transferId, senderPeerId, this._getTransferInfo(transferId));

    delete this._dataTransfers[transferId];
    return;

  } else {
    this._dataTransfers[transferId].data.ackN += 1;

    this._sendMessageToDataChannel(peerId, {
      type: this._DC_PROTOCOL_TYPE.ACK,
      sender: this._user.sid,
      ackN: this._dataTransfers[transferId].data.ackN
    }, channelProp);

    this._handleDataTransferTimer(transferId);

    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
      this._getTransferInfo(transferId, true));
  }
};

/**
 * Function that starts / stop data transfer timeout.
 * @method _handleDataTransferTimer
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleDataTransferTimer = function (transferId, peerId, clear) {
  var self = this;

  if (!self._dataTransfers[transferId]) {
    return;
  }

  if (clear) {
    if (peerId) {
      if (self._dataTransfers[transferId].peersResponseTimer[peerId]) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timeout']);
        clearTimeout(self._dataTransfers[transferId].peersResponseTimer[peerId]);
        self._dataTransfers[transferId].peersResponseTimer[peerId] = null;
      }

    } else if (self._dataTransfers[transferId].responseTimer) {
      log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timeout']);
      clearTimeout(self._dataTransfers[transferId].responseTimer);
      self._dataTransfers[transferId].responseTimer = null;
    }
  } else {
    var timeoutInMs = self._dataTransfers[transferId].session.timeout * 1000;
    var timeoutFn   = function () {
      log.error([peerId, 'RTCDataChannel', transferId, 'Data transfer timer has expired. ' +
        'Response timeout error. Aborting data transfer session.']);

      // TODO: Trigger it has ended
    };

    if (peerId) {
      self._dataTransfers[transferId].peersResponseTimer[peerId] = setTimeout(timeoutFn, timeoutInMs);
    } else {
      self._dataTransfers[transferId].responseTimer = setTimeout(timeoutFn, timeoutInMs);
    }
  }
};

/**
 * Function that start the data transfer for MCU use-case.
 * @method _startDataTransferForMCU
 * @private
 * @for Skylink
 */
Skylink.prototype._startDataTransferForMCU = function (transferId, listOfPeers) {
  var self = this;

  var completePeerFn = function (peerId, channelName, error) {
    if (error) {
      log.error([peerId, 'RTCDataChannel', transferId, 'Received error ->'], error);

      if (channelName && self._dataTransfers[transferId] &&
        self._dataTransfers[transferId].targets[transferId].indexOf(peerId) > -1) {
        self._dataTransfers[transferId].targets[transferId].splice(
          self._dataTransfers[transferId].targets[transferId].indexOf(peerId));
      }

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
        this._getTransferInfo(transferId, null, true, true), {
        message: new Error(error),
        transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }
  };

  self._dataTransfers[transferId].targets = {};
  self._dataTransfers[transferId].targets.main = [];
  self._dataTransfers[transferId].targets[transferId] = [];

  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!self._peerConnections[peerId]) {
      completePeerFn(peerId, null,
        'Unable to start data transfer as Peer connection does not exists.');
      continue;
    }

    if (!self._peerInformations[peerId]) {
      completePeerFn(peerId, null,
        'Unable to start data transfer as Peer session does not exists.');
      continue;
    }

    if (!(self._dataChannels.MCU && self._dataChannels.MCU.main)) {
      completePeerFn(peerId, null,
        'Unable to start data transfer as MCU Datachannel connection does not exists.');
      continue;
    }

    if (self._dataChannels.MCU.main.channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
      completePeerFn(peerId, null,
        'Unable to start data transfer as MCU Datachannel connection is not opened.');
      continue;
    }

    if (self._INTEROP_MULTI_TRANSFERS.indexOf(peerId) > -1) {
      if (self._dataChannels.MCU.main.transferId) {
        completePeerFn(peerId, null,
          'Unable to start data transfer as MCU Datachannel has a data transfer in-progress.');
        continue;
      }
      self._dataTransfers[transferId].targets.main.push(peerId);
    } else {
      self._dataTransfers[transferId].targets[transferId].push(peerId);
    }
  }

  if (self._dataTransfers[transferId].targets.main.length > 0) {
    var dataChannelStateMainCbFn = function (state, evtPeerId, error) {
      if (!self._dataTransfers[transferId]) {
        return;
      }

      for (var i = 0; i < self._dataTransfers[transferId].targets.main.length; i++) {
        completePeerFn(self._dataTransfers[transferId].targets.main[i], 'main',
          'Failed data transfer as Datachannel connection has closed abruptly');
      }
    };

    self.once('dataChannelState', dataChannelStateMainCbFn, function (state, peerId, error, channelName, channelType) {
      return peerId === 'MCU' && channelType === self.DATA_CHANNEL_TYPE.MESSAGING &&
        [self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED,
        self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
    });

    self._sendMessageToDataChannel('MCU', {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: self._dataTransfers[transferId].name,
      size: self._dataTransfers[transferId].size,
      originalSize: self._dataTransfers[transferId].originalSize,
      dataType: self._dataTransfers[transferId].dataType,
      mimeType: self._dataTransfers[transferId].mimeType,
      chunkType: self._dataTransfers[transferId].chunkType,
      chunkSize: self._dataTransfers[transferId].chunkSize,
      timeout: self._dataTransfers[transferId].timeout,
      isPrivate: self._dataTransfers[transferId].isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: self._dataTransfers[transferId].targets.main
    }, 'main');
  }

  if (nonInteropPeers.length > 0) {
    var dataChannelStateTransferCbFn = function (state, evtPeerId, error) {
      if (!self._dataTransfers[transferId]) {
        self.off('dataChannelState', dataChannelStateTransferCbFn);
        return;
      }

      if (state === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendMessageToDataChannel('MCU', {
          type: self._DC_PROTOCOL_TYPE.WRQ,
          transferId: transferId,
          name: self._dataTransfers[transferId].name,
          size: self._dataTransfers[transferId].size,
          originalSize: self._dataTransfers[transferId].originalSize,
          dataType: self._dataTransfers[transferId].dataType,
          mimeType: self._dataTransfers[transferId].mimeType,
          chunkType: self._dataTransfers[transferId].chunkType,
          chunkSize: self._dataTransfers[transferId].chunkSize,
          timeout: self._dataTransfers[transferId].timeout,
          isPrivate: self._dataTransfers[transferId].isPrivate,
          sender: self._user.sid,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          target: self._dataTransfers[transferId].targets[transferId]
        }, 'main');
        return;
      }

      for (var i = 0; i < self._dataTransfers[transferId].targets.main.length; i++) {
        completePeerFn(self._dataTransfers[transferId].targets.main[i], 'main',
          error ? error.message || error.toString() :
          'Failed data transfer as Datachannel connection has closed abruptly');
      }

      self.off('dataChannelState', dataChannelStateTransferCbFn);
    };

    self.once('dataChannelState', dataChannelStateTransferCbFn, function (state, peerId, error, channelName, channelType) {
      return peerId === 'MCU' && channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA &&
        [self.DATA_CHANNEL_STATE.OPEN, self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED,
        self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
    }, true);
  }
};

/**
 * Function that start the data transfer with the list of targeted Peer IDs provided.
 * At this stage, it will open a new Datachannel connection if simultaneous data transfers is
 * supported by Peer, or it will using the messaging type Datachannel connection.
 * Note that 1 data transfer can occur at a time in 1 Datachannel connection.
 * @method _startDataTransfer
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(data, transferInfo, listOfPeers, callback) {
  var self = this;
  var transferId = self._user.sid + '_' + (new Date()).getTime();
  var transferErrors = {};
  var transferCompleted = [];

  // Polyfill data name to prevent empty fields in WRQ
  // TODO: What happens if transfer requires extension?
  if (!transferInfo.name) {
    transferInfo.name = transferId;
  }

  self._dataTransfers[transferId] = clone(transferInfo);
  self._dataTransfers[transferId].originalSize = transferInfo.size;

  if (transferInfo.dataType === self.DATA_TRANSFER_SESSION_TYPE.BLOB) {
    self._dataTransfers[transferId].chunks = self._chunkBlobData(data, transferInfo.chunkSize);

    // Update chunk size
    if (transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      self._dataTransfers[transferId].size = 4 * Math.ceil(transferInfo.size / 3);
      self._dataTransfers[transferId].chunkSize = 4 * Math.ceil(transferInfo.chunkSize / 3);
    }
  } else {
    self._dataTransfers[transferId].chunks = self._chunkDataURL(data, transferInfo.chunkSize);
  }

  var dataTransferStateCbFn = function (state, evtTransferId, peerId, evtTransferInfo, error) {
    if (transferId === evtTransferId && listOfPeers.indexOf(peerId) > -1 &&
      [self.DATA_TRANSFER_STATE.ERROR, self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED,
      self.DATA_TRANSFER_STATE.CANCEL].indexOf(state) > -1) {

      if (transferCompleted.indexOf(peerId) > -1) {
        return;
      }

      log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer request completed. State ->'], state);

      transferCompleted.push(peerId);

      if (error) {
        transferErrors[peerId] = new Error(error);
      }

      if (listOfPeers.length === transferCompleted.length) {
        log.log([null, 'RTCDataChannel', transferId, 'Data transfer requests has been completed']);

        self.off('dataTransferState', dataTransferStateCbFn);

        if (typeof callback === 'function') {
          if (Object.keys(transferErrors).length > 0) {
            callback({
              transferId: transferId,
              transferInfo: self._getTransferInfo(transferId, null, true, true),
              transferErrors: transferErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback({
              transferId: transferId,
              transferInfo: self._getTransferInfo(transferId, null, true, true),
              listOfPeers: listOfPeers
            }, null);
          }
        }
      }
    }
  };

  self.on('dataTransferState', dataTransferStateCbFn);

  if (self._hasMCU) {
    self._startDataTransferForMCU(transferId, listOfPeers);
  } else {
    self._startDataTransferForP2P(transferId, listOfPeers);
  }
};

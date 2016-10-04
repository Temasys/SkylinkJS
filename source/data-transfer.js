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
 * @param {String} USER_REJECTED      <small>Value <code>"userRejected"</code></small>
 *   The value of the state when User rejected and terminated upload data transfer request from Peer.
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
  DOWNLOAD_COMPLETED: 'downloadCompleted',
  USER_REJECTED: 'userRejected'
};

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
  var listOfPeers = Object.keys(self._peerConnections);
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

  if (self._hasMCU && transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    log.warn('Binary data chunks transfer is not yet supported with MCU environment. ' +
      'Fallbacking to binary string data chunks transfer.');
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;
    transferInfo.chunkSize = self._CHUNK_FILE_SIZE;
  }

  // Use BLOB for Firefox
  if (transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER &&
    window.webrtcDetectedBrowser === 'firefox') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.BLOB;
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

  var chunks = self._chunkBlobData(data, transferInfo.chunkSize);

  transferInfo.originalSize = transferInfo.size;

  if (transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = 4 * Math.ceil(transferInfo.size / 3);
    transferInfo.chunkSize = 4 * Math.ceil(transferInfo.chunkSize / 3);
  }

  self._startDataTransfer(chunks, transferInfo, listOfPeers, callback);
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
  var listOfPeers = Object.keys(self._peerConnections);
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

  transferInfo.size = data.length || data.size;

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

  var chunks = self._chunkDataURL(data, transferInfo.chunkSize);

  transferInfo.originalSize = transferInfo.size;

  self._startDataTransfer(chunks, transferInfo, listOfPeers, callback);
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
  var self = this;

  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!self._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  var channelProp = 'main';

  if (self._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  if (accept) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    var dataChannelStateCbFn = function (state, evtPeerId, error) {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        return;
      }

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
        self._getTransferInfo(transferId, peerId, true, false, false), {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error('Data transfer terminated as Peer Datachannel connection closed abruptly.')
        });
    };

    self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        return true;
      }

      if (evtPeerId === peerId) {
        if (channelProp === 'main' ? channelType === self.DATA_CHANNEL_STATE.MESSAGING : channelName === transferId) {
          return [self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED,
            self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
        }
      }
    });

    self.once('dataTransferState', function () {
      self.off('dataChannelState', dataChannelStateCbFn);
    }, function (state, evtTransferId, evtPeerId) {
      return [self.DATA_TRANSFER_STATE.ERROR, self.DATA_TRANSFER_STATE.CANCEL,
        self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED].indexOf(state) > -1 &&
        evtTransferId === transferId && evtPeerId === peerId;
    });

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: 0
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: -1
    }, channelProp);

    self._dataChannels[peerId][transferId].transferId = null;

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_REJECTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
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
  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!this._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!this._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  var channelProp = 'main';

  if (this._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  log.debug([peerId, 'RTCDataChannel', transferId, 'Canceling data transfer ...']);

  this._sendMessageToDataChannel(peerId, {
    type: this._DC_PROTOCOL_TYPE.CANCEL,
    sender: this._user.sid,
    content: 'Peer cancelled download transfer',
    ackN: 0
  }, channelProp);

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
  }, {
    transferType: this._dataTransfers[transferId].direction,
    message: 'User cancelled download transfer'
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
 * Function that starts the data transfer to Peers.
 * @method _startDataTransfer
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(chunks, transferInfo, listOfPeers, callback) {
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
  self._dataTransfers[transferId].peers = {};
  self._dataTransfers[transferId].peers.main = {};
  self._dataTransfers[transferId].peers[transferId] = {};
  self._dataTransfers[transferId].sessions = {};
  self._dataTransfers[transferId].chunks = chunks;

  var completeFn = function (peerId, error) {
    if (transferCompleted.indexOf(peerId) > -1) {
      return;
    }

    log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer result. Is errors present? ->'], error);

    transferCompleted.push(peerId);

    if (error) {
      transferErrors[peerId] = new Error(error);
    }

    if (listOfPeers.length === transferCompleted.length) {
      log.log([null, 'RTCDataChannel', transferId, 'Data transfer request completed']);

      if (typeof callback === 'function') {
        if (Object.keys(transferErrors).length > 0) {
          callback({
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            transferErrors: transferErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            listOfPeers: listOfPeers
          });
        }
      }
    }
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    var MCUInteropStatus = self._startDataTransferToPeer(transferId, listOfPeers[i], completeFn, null);

    if (typeof MCUInteropStatus === 'boolean') {
      if (MCUInteropStatus === true) {
        self._dataTransfers[transferId].peers.main[listOfPeers[i]] = false;
      } else {
        self._dataTransfers[transferId].peers[transferId][listOfPeers[i]] = false;
      }
    }
  }

  if (self._hasMCU) {
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, 'main',
        Object.keys(self._dataTransfers[transferId].peers.main));
    }

    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, transferId,
        Object.keys(self._dataTransfers[transferId].peers[transferId]));
    }
  }
};

/**
 * Function that starts or listens the data transfer status to Peer.
 * This reacts differently during MCU environment.
 * @method _startDataTransferToPeer
 * @return {Boolean} Returns a Boolean during MCU environment which indicates if Peer requires interop.
 * @private
 * @since 0.6.16
 */
Skylink.prototype._startDataTransferToPeer = function (transferId, peerId, callback, channelProp, targetPeers) {
  var self = this;

  var returnErrorBeforeTransferFn = function (error) {
    var peers = targetPeers || [peerId];
    var updatedError = peerId === 'MCU' ? error.replace(/Peer/g, 'MCU Peer') : error;

    for (var i = 0; i < peers.length; i++) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peers[i],
        self._getTransferInfo(transferId, peerId, true, true, false), {
        message: new Error(updatedError),
        transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    }
  };

  var peerConnectionStateCbFn = null;
  var dataChannelStateCbFn = null;

  // Listen to data transfer state
  if (peerId !== 'MCU') {
    self.once('dataTransferState', function (state, evtTransferId, evtPeerId, transferInfo, error) {
      self.off('peerConnectionState', peerConnectionStateCbFn);
      self.off('dataChannelState', dataChannelStateCbFn);

      self._dataTransfers[transferId].peers[channelProp][peerId] = true;

      if (state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
        callback(peerId, null);
      } else if (state === self.DATA_TRANSFER_STATE.REJECTED) {
        callback(peerId, 'Data transfer request has been rejected by Peer');
      } else {
        callback(peerId, error.message.message || error.message.toString());
      }
    }, function (state, evtTransferId, evtPeerId) {
      return [self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, self.DATA_TRANSFER_STATE.ERROR,
        self.DATA_TRANSFER_STATE.CANCEL, self.DATA_TRANSFER_STATE.REJECTED].indexOf(state) > -1 &&
        transferId === evtTransferId && peerId === evtPeerId;
    });
  }

  // When Peer connection does not exists
  if (!self._peerConnections[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer session does not exists
  if (!self._peerInformations[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection does not exists.');
    return;
  }

  if (self._dataChannels[peerId].main.channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection is not opened.');
    return;
  }

  var agentName = (self._peerInformations[peerId].agent || {}).name || '';
  var requireInterop = self._INTEROP_MULTI_TRANSFERS.indexOf(agentName) > -1;

  if (requireInterop && self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer do not support DATA_URL type of data transfers');
    return;
  }

  if (peerId !== 'MCU' && self._hasMCU) {
    channelProp = requireInterop ? 'main' : transferId;

    peerConnectionStateCbFn = function () {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer connection is not stable.');
    };

    self.once('peerConnectionState', peerConnectionStateCbFn, function (state, evtPeerId) {
      return state !== self.PEER_CONNECTION_STATE.STABLE && evtPeerId === peerId;
    });
    return requireInterop;
  }

  if (requireInterop || channelProp === 'main') {
    // When MCU Datachannel connection has a transfer in-progress
    if (self._dataChannels[peerId].main.transferId) {
      returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel has a data transfer in-progress.');
      return;
    }
  }

  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0
  };

  dataChannelStateCbFn = function (state, evtPeerId, error) {
    if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      return;
    }

    if (error) {
      returnErrorBeforeTransferFn(error.message || error.toString());
    } else {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer Datachannel connection closed abruptly.');
    }
  };

  var sendWRQFn = function () {
    self._sendMessageToDataChannel(peerId, {
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
      target: targetPeers ? targetPeers : peerId
    }, channelProp);
  };

  self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
    if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      return true;
    }

    if (evtPeerId === peerId) {
      if (state === self.DATA_CHANNEL_STATE.OPEN && channelName === transferId &&
        channelType === self.DATA_CHANNEL_TYPE.DATA) {
        sendWRQFn();
        return false;
      }
      return [self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSING,
        self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1;
    }
  });

  if (!(requireInterop || channelProp === 'main')) {
    channelProp = transferId;

    self._createDataChannel(peerId, transferId);

  } else {
    sendWRQFn();
  }
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

      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received protocol message ->'], data);

      switch (data.type) {
        case this._DC_PROTOCOL_TYPE.WRQ:
          this._WRQProtocolHandler(peerId, data, channelProp);
          break;
        case this._DC_PROTOCOL_TYPE.ACK:
          this._ACKProtocolHandler(peerId, data, channelProp);
          break;
        case this._DC_PROTOCOL_TYPE.ERROR:
          this._ERRORProtocolHandler(peerId, data, channelProp);
          break;
        case this._DC_PROTOCOL_TYPE.CANCEL:
          this._CANCELProtocolHandler(peerId, data, channelProp);
          break;
        case this._DC_PROTOCOL_TYPE.MESSAGE:
          this._MESSAGEProtocolHandler(peerId, data, channelProp);
          break;
        default:
          log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded unknown protocol message ->'], data);
      }

    } catch (error) {
      if (rawData.indexOf('{') > -1 && rawData.indexOf('}') > 0) {
        log.error([peerId, 'RTCDataChannel', channelProp, 'Received error ->'], error);
        throw error;
      }
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received data chunk']);

      this._DATAProtocolHandler(peerId, data, this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, channelProp);
    }

  } else {
    var chunkDataType = rawData instanceof Blob ? this.DATA_TRANSFER_DATA_TYPE.BLOB :
      this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

    if (rawData.constructor && rawData.constructor.name === 'Array') {
      // Need to re-parse on some browsers
      data = new Int8Array(rawData);
    }

    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary data chunk']);

    this._DATAProtocolHandler(peerId, data, chunkDataType, channelProp);
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, peerId, returnDataProp, hidePercentage, returnDataAtStart) {
  if (!this._dataTransfers[transferId]) {
    return {};
  }

  var transferInfo = {
    name: this._dataTransfers[transferId].name,
    size: this._dataTransfers[transferId].size,
    dataType: this._dataTransfers[transferId].dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: this._dataTransfers[transferId].mimeType || null,
    chunkSize: this._dataTransfers[transferId].chunkSize,
    chunkType: this._dataTransfers[transferId].chunkType,
    timeout: this._dataTransfers[transferId].timeout,
    isPrivate: this._dataTransfers[transferId].isPrivate,
    direction: this._dataTransfers[transferId].direction
  };

  if (this._dataTransfers[transferId].originalSize) {
    transferInfo.size = this._dataTransfers[transferId].originalSize;
  } else if (this._dataTransfers[transferId].chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = Math.ceil(transferInfo.size * 3 / 4);
  }

  if (!hidePercentage) {
    transferInfo.percentage = 0;

    if (!this._dataTransfers[transferId].sessions[peerId]) {
      if (returnDataProp) {
        transferInfo.data = null;
      }
      return transferInfo;
    }

    if (this._dataTransfers[transferId].direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].sessions[peerId].receivedSize >= this._dataTransfers[transferId].sessions[peerId].size) {
        transferInfo.percentage = 100;
      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].receivedSize /
          this._dataTransfers[transferId].size) * 100).toFixed(2), 10);
      }
    } else {
      if (this._dataTransfers[transferId].sessions[peerId].ackN >= (this._dataTransfers[transferId].chunks.length - 1)) {
        transferInfo.percentage = 100;
      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].ackN /
          (this._dataTransfers[transferId].chunks.length - 1)) * 100).toFixed(2), 10);
      }
    }

    if (returnDataProp) {
      if (typeof returnDataAtStart !== 'number') {
        if (transferInfo.percentage === 100) {
          transferInfo.data = this._getTransferData(transferId);
        } else {
          transferInfo.data = null;
        }
      } else {
        transferInfo.percentage = returnDataAtStart;

        if (returnDataAtStart === 0) {
          transferInfo.data = this._getTransferData(transferId);
        }
      }
    }
  }

  return transferInfo;
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (!this._dataTransfers[transferId]) {
    return null;
  }

  if (this._dataTransfers[transferId].dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
    var mimeType = {
      name: this._dataTransfers[transferId].name
    };

    if (this._dataTransfers[transferId].mimeType) {
      mimeType.type = this._dataTransfers[transferId].mimeType;
    }

    return new Blob(this._dataTransfers[transferId].chunks, mimeType);
  }

  return this._dataTransfers[transferId].chunks.join('');
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp === 'main' ? data.transferId || peerId + '_' + (new Date()).getTime() : channelProp;
  var senderPeerId = data.sender || peerId;

  self._dataTransfers[transferId] = {
    name: data.name || transferId,
    size: data.size || 0,
    chunkSize: data.chunkSize,
    originalSize: data.originalSize || 0,
    timeout: data.timeout || 60,
    isPrivate: !!data.isPrivate,
    senderPeerId: data.sender || peerId,
    dataType: data.dataType || self.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: data.mimeType || null,
    chunkType: data.chunkType || self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
    direction: self.DATA_TRANSFER_TYPE.DOWNLOAD,
    chunks: [],
    sessions: {}
  };

  self._dataChannels[peerId][channelProp].transferId = transferId;
  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0,
    receivedSize: 0
  };

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
  self._trigger('incomingDataRequest', transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, false, false, false), false);
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (!self._dataChannels[peerId][channelProp]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping ACK protocol message as Datachannel connection ' +
      'does not exists ->'], data);
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataTransfers[peerId].main.transferId;
  }

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping ACK protocol message as data transfer session for ' +
      'Peer does not exists ->'], data);
    return;
  }

  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ACK event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          !self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  if (data.ackN > -1) {
    if (data.ackN === 0) {
      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 0), null);
      });
    } else if (data.ackN === self._dataTransfers[transferId].chunks.length) {
      delete self._dataTransfers[transferId].sessions[peerId];

      if (self._dataChannels[peerId][channelProp]) {
        self._dataChannels[peerId][channelProp].transferId = null;

        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }
      }
      return;
    }

    var uploadFn = function (chunk) {
      self._sendMessageToDataChannel(peerId, chunk, channelProp, true);

      if (data.ackN === (self._dataTransfers[transferId].chunks.length - 1)) {
        emitEventFn(function (evtPeerId) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, true, false, 100), null);
          self._trigger('incomingData', self._getTransferData(transferId), transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, false, false, false), true);
        });
      } else {
        emitEventFn(function (evtPeerId) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING, transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, true, false, false), null);
        });
      }
    };

    self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

    if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      self._blobToBase64(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      self._blobToArrayBuffer(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else {
      uploadFn(self._dataTransfers[transferId].chunks[data.ackN]);
    }
  } else {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as Peer has rejected data transfer request'),
      transferType: self.DATA_TRANSFER_TYPE.UPLOAD
    });
  }
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelProp) {
  var senderPeerId = data.sender || peerId;

  log.log([senderPeerId, 'RTCDataChannel', channelProp, 'Received P2P message from peer:'], data);
  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: senderPeerId
  }, senderPeerId, this.getPeerInfo(senderPeerId), false);
};

/**
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (!self._dataChannels[peerId][channelProp]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping ERROR protocol message as Datachannel connection ' +
      'does not exists ->'], data);
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataTransfers[peerId].main.transferId;
  }

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping ERROR protocol message as data transfer session for ' +
      'Peer does not exists ->'], data);
    return;
  }

  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ERROR event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          !self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received an error from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerID, true, false, false), {
      message: new Error(data.content),
      transferType: self._dataTransfers[transferId].direction
    });
  });

  delete self._dataTransfers[transferId].sessions[peerId];
};

/**
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;

  if (!self._dataChannels[peerId][channelProp]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping CANCEL protocol message as Datachannel connection ' +
      'does not exists ->'], data);
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataTransfers[peerId].main.transferId;
  }

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping CANCEL protocol message as data transfer session for ' +
      'Peer does not exists ->'], data);
    return;
  }

  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of CANCEL event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          !self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(peerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received data transfer termination from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error(data.content || 'Peer has terminated data transfer.'),
      transferType: self._dataTransfers[transferId].direction
    });
  });

  delete self._dataTransfers[transferId].sessions[peerId];
};

/**
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, data, chunkType, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = peerId;

  if (!self._dataChannels[peerId][channelProp]) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping data chunk as Datachannel connection ' +
      'does not exists ->'], chunkType);
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk as data transfer session for ' +
      'Peer does not exists ->'], chunkType);
    return;
  }

  if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk as it has already been added ->'], chunkType);
    return;
  }

  if (self._dataTransfers[transferId].senderPeerId) {
    senderPeerId = self._dataTransfers[transferId].senderPeerId;
  }

  var chunk = null;
  var chunkSize = 0;

  if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    if (self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL) {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received string data chunk']);
      chunk = data;
      chunkSize = data.length;
      chunkType = self.DATA_TRANSFER_DATA_TYPE.STRING;

    } else {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk']);
      chunk = self._base64ToBlob(data);
      chunkSize = data.length;
    }

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received ArrayBuffer data chunk']);
    chunk = new Blob([data]);
    chunkSize = chunk.size;

  } else if (chunkType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Received Blob data chunk']);
    chunk = data;
    chunkSize = chunk.size;

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk as it is an unknown chunk type ->'], chunkType);
    return;
  }

  self._dataTransfers[transferId].chunkType = chunkType;
  self._dataTransfers[transferId].sessions[peerId].receivedSize += chunkSize;
  self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN] = chunk;

  if (self._dataTransfers[transferId].sessions[peerId].receivedSize >= self._dataTransfers[transferId].size) {
    log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed']);

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: self._dataTransfers[transferId].sessions[peerId].ackN + 1
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
    self._trigger('incomingData', self._getTransferData(transferId), transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), null);

    delete self._dataTransfers[transferId];

    if (self._dataChannels[peerId][channelProp]) {
      self._dataChannels[peerId][channelProp].transferId = null;

      if (channelProp !== 'main') {
        self._closeDataChannel(peerId, channelProp);
      }
    }
    return;
  }

  self._dataTransfers[transferId].sessions[peerId].ackN += 1;

  self._sendMessageToDataChannel(peerId, {
    type: self._DC_PROTOCOL_TYPE.ACK,
    sender: self._user.sid,
    ackN: self._dataTransfers[transferId].sessions[peerId].ackN
  }, channelProp);

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
};

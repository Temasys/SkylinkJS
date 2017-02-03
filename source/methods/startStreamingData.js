/**
 * <blockquote class="info">
 *   To start streaming data, see the <a href="#method_streamData"><code>streamData()</code>
 *   method</a>. To stop data streaming session, see the <a href="#method_stopStreamingData"><code>stopStreamingData()</code> method</a>
 * </blockquote>
 * Function that starts a data chunks streaming session from User to Peers.
 * @method startStreamingData
 * @param {Boolean} [isStringStream=false] The flag if data streaming session sending data chunks
 *   should be expected as string data chunks sent.
 *   <small>By default, data chunks are expected to be sent in Blob or ArrayBuffer, and ArrayBuffer
 *   data chunks will be converted to Blob.</small>
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will start streaming session to only Peers which IDs are in the list.
 * - When not provided, it will start the streaming session to all connected Peers with Datachannel connection in the Room.
 * @trigger <ol class="desc-seq">
 * @trigger <ol class="desc-seq">
 *   <li>Checks if User is in Room. <ol>
 *   <li>If User is not in Room: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if there is any available Datachannel connections. <ol>
 *   <li>If User is not in Room: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection or session does not exists: <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>method</a> and connected: <ol>
 *   <li>If MCU Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code>, <code>peerId</code> value as <code>"MCU"</code>
 *   and <code>channelType</code> as <code>MESSAGING</code> for MCU Peer.</small>
 *   <ol><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START_ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if should open a new data Datachannel.<ol>
 *   <li>If Peer supports simultaneous data streaming, open new data Datachannel: <small>If MCU is connected,
 *   this opens a new data Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data streaming session instead of opening new data Datachannel
 *   with all Peers targeted for the data streaming session.</small> <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>CONNECTING</code> and <code>channelType</code> as <code>DATA</code>.
 *   <small>Note that there is no timeout to wait for parameter payload <code>state</code> to be
 *   <code>OPEN</code>.</small></li>
 *   <li>If Datachannel has been created and opened successfully: <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>OPEN</code> and <code>channelType</code> as <code>DATA</code>.</li></ol></li>
 *   <li>Else: <ol><li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>CREATE_ERROR</code> and <code>channelType</code> as
 *   <code>DATA</code>.</li><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></ol></li><li>Else: <small>If MCU is connected,
 *   this uses the messaging Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data streaming session instead of using the messaging Datachannels
 *   with all Peers targeted for the data streaming session.</small> <ol><li>If messaging Datachannel connection has a
 *   data streaming in-progress: <ol><li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li><li>If there is any conflicting <a href="#method_streamData"><code>streamData()</code>
 *   method</a> data streaming session: <small>If <code>isStringStream</code> is provided as <code>true</code> and
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> or <a href="#method_sendURLData">
 *   <code>sendURLData()</code> method</a> has an existing binary string transfer, it cannot start string data
 *   streaming session. Else if <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>
 *   has an existing binary data transfer, it cannot start binary data streaming session.</small><ol>
 *   <li><a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START_ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></li></ol></ol></li></ol></li>
 *   <li>Starts the data streaming session with Peer. <ol>
 *   <li><a href="#event_incomingDataStreamStarted"><code>incomingDataStreamStarted</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENDING_STARTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVING_STARTED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Start streaming to all Peers
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        skylinkDemo.startStreamingData(false);
 *      }
 *   });
 *
 *   // Example 2: Start streaming to specific Peers
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
 *     skylinkDemo.startStreamingData(message, readyToSend);
 *   }
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.startStreamingData = function(isStringStream, targetPeerId) {
  var self = this;
  var listOfPeers = Object.keys(self._dataChannels);
  var isPrivate = false;
  var sessionChunkType = 'binary';

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (Array.isArray(isStringStream)) {
    listOfPeers = isStringStream;
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'string') {
    listOfPeers = [isStringStream];
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'boolean') {
    sessionChunkType = 'string';
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  // Remove MCU from list
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  var emitErrorBeforeStreamingFn = function (error) {
    self._log.error(error);

    if (listOfPeers.length > 0) {
      for (var i = 0; i < listOfPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
          listOfPeers[i], sessionInfo, new Error(error));
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
        null, sessionInfo, new Error(error));
    }
  };

  if (!this._inRoom || !(this._user && this._user.sid)) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User is not in Room.');
  }

  if (!this._enableDataChannel) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User does not have Datachannel enabled.');
  }

  if (listOfPeers.length === 0) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as there are no Peers to start session with.');
  }

  var transferId = 'stream_' + (self._user && self._user.sid ? self._user.sid : '-') + '_' + (new Date()).getTime();
  var peersInterop = [];
  var peersNonInterop = [];
  var sessions = {};
  var listenToPeerFn = function (peerId, channelProp) {
    var hasStarted = false;
    sessions[peerId] = channelProp;

    self.once('dataStreamState', function () {}, function (state, evtTransferId, evtPeerId, evtSessionInfo) {
      if (!(evtTransferId === transferId && evtPeerId === peerId)) {
        return;
      }

      var dataChunk = evtSessionInfo.chunk;
      var updatedSessionInfo = UtilsFactory.clone(evtSessionInfo);
      delete updatedSessionInfo.chunk;

      if (state === self.DATA_STREAM_STATE.SENDING_STARTED) {
        hasStarted = true;
        return;
      }

      if (hasStarted && [self.DATA_STREAM_STATE.ERROR, self.DATA_STREAM_STATE.SENDING_STOPPED].indexOf(state) > -1) {
        if (channelProp === transferId) {
          self._closeDataChannel(peerId, transferId);
        }

        if (self._dataStreams[transferId] && self._dataStreams[transferId].sessions[peerId]) {
          delete self._dataStreams[transferId].sessions[peerId];

          if (Object.keys(self._dataStreams[transferId].sessions).length === 0) {
            delete self._dataStreams[transferId];
          }
        }
        return true;
      }
    });
  };

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];
    var error = null;
    var dtProtocolVersion = ((self._peerInformations[peerId] || {}).agent || {}).DTProtocolVersion || '';
    var channelProp = self._isLowerThanVersion(dtProtocolVersion, '0.1.2') ? 'main' : transferId;

    if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
      error = 'Datachannel connection does not exists';
    } else if (self._hasMCU && !(self._dataChannels.MCU && self._dataChannels.MCU.main)) {
      error = 'MCU Datachannel connection does not exists';
    } else if (self._isLowerThanVersion(dtProtocolVersion, '0.1.3')) {
      error = 'Peer DTProtocolVersion does not support data streaming. (received: "' + dtProtocolVersion + '", expected: "0.1.3")';
    } else {
      if (channelProp === 'main') {
        var dataTransferId = self._hasMCU ? self._dataChannels.MCU.main.transferId : self._dataChannels[peerId].main.transferId;

        if (self._dataChannels[peerId].main.streamId) {
          error = 'Peer Datachannel currently has an active data transfer session.';
        } else if (self._hasMCU && self._dataChannels.MCU.main.streamId) {
          error = 'MCU Peer Datachannel currently has an active data transfer session.';
        } else if (self._dataTransfers[dataTransferId] && self._dataTransfers[dataTransferId].sessionChunkType === sessionChunkType) {
          error = (self._hasMCU ? 'MCU ' : '') + 'Peer Datachannel currently has an active ' + sessionChunkType + ' data transfer.';
        } else {
          peersInterop.push(peerId);
        }
      } else {
        peersNonInterop.push(peerId);
      }
    }

    if (error) {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, new Error(error));
      listOfPeers.splice(i, 1);
      i--;
    } else {
      listenToPeerFn(peerId, channelProp);
    }
  }

  if (listOfPeers.length === 0) {
    self._log.warn('There are no Peers to start data session with.');
    return;
  }

  self._dataStreams[transferId] = {
    sessions: sessions,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    sessionChunkType: sessionChunkType,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null,
    isUpload: true
  };

  var startDataSessionFn = function (peerId, channelProp, targetPeers) {
    self.once('dataChannelState', function () {}, function (state, evtPeerId, channelName, channelType, error) {
      if (!self._dataStreams[transferId]) {
        return true;
      }

      if (!(evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_TYPE.MESSAGING :
        channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA))) {
        return;
      }

      if ([self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1) {
        var updatedError = new Error(error && error.message ? error.message :
          'Failed data transfer as datachannel state is "' + state + '".');

        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, targetPeers[mp], sessionInfo, updatedError);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo, updatedError);
        }
        return true;
      }
    });

    if (!(self._dataChannels[peerId][channelProp] &&
      self._dataChannels[peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN)) {
      var notOpenError = new Error('Failed starting data streaming session as channel is not opened.');
      if (peerId === 'MCU') {
        for (i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[i], sessionInfo, notOpenError);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, notOpenError);
      }
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStart',
      mimeType: null,
      chunkType: sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: peerId === 'MCU' ? targetPeers : peerId
    }, channelProp);
    self._dataChannels[peerId][channelProp].streamId = transferId;

    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (peerId === 'MCU') {
      for (var tp = 0; tp < targetPeers.length; tp++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, targetPeers[tp], sessionInfo, null);
        self._trigger('incomingDataStreamStarted', transferId, targetPeers[tp], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStarted', transferId, peerId, updatedSessionInfo, true);
    }
  };

  var waitForChannelOpenFn = function (peerId, targetPeers) {
    self.once('dataChannelState', function (state, evtPeerId, error) {
      if (state === self.DATA_CHANNEL_STATE.CREATE_ERROR) {
        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[mp], sessionInfo, error);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, error);
        }
        return;
      }
      startDataSessionFn(peerId, transferId, targetPeers);
    }, function (state, evtPeerId, error, channelName, channelType) {
      if (evtPeerId === peerId && channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA) {
        return [self.DATA_CHANNEL_STATE.CREATE_ERROR, self.DATA_CHANNEL_STATE.OPEN].indexOf(state) > -1;
      }
    });
    self._createDataChannel(peerId, transferId);
  };

  if (peersNonInterop.length > 0) {
    if (self._hasMCU) {
      waitForChannelOpenFn('MCU', peersNonInterop);
    } else {
      for (var pni = 0; pni < peersNonInterop.length; pni++) {
        waitForChannelOpenFn(peersNonInterop[pni], null);
      }
    }
  }

  if (peersInterop.length > 0) {
    if (self._hasMCU) {
      startDataSessionFn('MCU', 'main', peersInterop);
    } else {
      for (var pi = 0; pi < peersInterop.length; pi++) {
        startDataSessionFn(peersInterop[pi], 'main', null);
      }
    }
  }
};
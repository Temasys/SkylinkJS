/**
 * <blockquote class="info">
 *   To start data streaming session, see the <a href="#method_startStreamingData"><code>startStreamingData()</code>
 *   method</a> To start streaming data, see the <a href="#method_streamData"><code>streamData()</code>
 *   method</a>.
 * </blockquote>
 * Function that stops a data chunks streaming session from User to Peers.
 * @method stopStreamingData
 * @param {String} streamId The data streaming session ID.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection (or MCU Peer connection if enabled)
 *   data streaming Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Stops the data streaming session to Peer. <ol>
 *   <li><a href="#event_incomingDataStreamStopped"><code>incomingDataStreamStopped</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENDING_STOPPED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVING_STOPPED</code>.</li></ol></li></ol>
 * @example
 *   skylinkDemo.stopStreamData(streamId);
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.stopStreamingData = function(transferId) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    self._log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    self._log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    self._log.error('Failed stopping data streaming session as it does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    self._log.error('Failed stopping data streaming session as it is not sending.');
    return;
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStop',
      mimeType: null,
      chunkType: self._dataStreams[transferId].sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: self._dataStreams[transferId].isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (targetPeers) {
      for (var i = 0; i < targetPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, targetPeers[i], sessionInfo, null);
        self._trigger('incomingDataStreamStopped', transferId, targetPeers[i], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStopped', transferId, peerId, updatedSessionInfo, true);
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        self._log.error([peerId, 'RTCDataChannel', transferId, 'Failed stopping data streaming session as channel is closed.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Failed stopping data streaming session as Datachannel connection is not open or is active.'));
        return;
      }

      if (self._hasMCU) {
        if (self._dataStreams[transferId].sessions[peerId] === 'main') {
          peersInterop.push(peerId);
        } else {
          peersNonInterop.push(peerId);
        }
      } else {
        sendDataFn(peerId, channelProp);
      }
    }
  }

  if (self._hasMCU) {
    if (peersInterop.length > 0) {
      sendDataFn(peerId, 'main', peersInterop);
    }
    if (peersNonInterop.length > 0) {
      sendDataFn(peerId, transferId, peersNonInterop);
    }
  }
};
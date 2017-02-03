/**
 * <blockquote class="info">
 *   To start data streaming session, see the <a href="#method_startStreamingData"><code>startStreamingData()</code>
 *   method</a>. To stop data streaming session, see the <a href="#method_stopStreamingData"><code>stopStreamingData()</code> method</a>
 * </blockquote>
 * Function that sends a data chunk from User to Peers for an existing active data streaming session.
 * @method streamData
 * @param {String} streamId The data streaming session ID.
 * @param {Blob|ArrayBuffer} chunk The data chunk.
 *   <small>By default when it is not string data streaming, data chunks when is are expected to be
 *   sent in Blob or ArrayBuffer, and ArrayBuffer data chunks will be converted to Blob.</small>
 *   <small>For binary data chunks, the limit is <code>65456</code>.</small>
 *   <small>For string data chunks, the limit is <code>1212</code>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection (or MCU Peer connection if enabled)
 *   data streaming Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataStreamState">
 *   <code>dataStreamState</code> event</a> triggers parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Starts sending the data chunk to Peer. <ol>
 *   <li><a href="#event_incomingDataStream"><code>incomingDataStream</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>SENT</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RECEIVED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Start streaming
 *   var currentStreamId = null
 *   if (file.size > chunkLimit) {
 *     while ((file.size - 1) > endCount) {
 *       endCount = startCount + chunkLimit;
 *       chunks.push(file.slice(startCount, endCount));
 *       startCount += chunkLimit;
 *     }
 *     if ((file.size - (startCount + 1)) > 0) {
 *       chunks.push(file.slice(startCount, file.size - 1));
 *     }
 *   } else {
 *     chunks.push(file);
 *   }
 *   var processNextFn = function () {
 *     if (chunks.length > 0) {
 *       skylinkDemo.once("incomingDataStream", function () {
 *         setTimeout(processNextFn, 1);
 *       }, function (data, evtStreamId, evtPeerId, streamInfo, isSelf) {
 *         return isSelf && evtStreamId === currentStreamId;
 *       });
 *       var chunk = chunks[0];
 *       chunks.splice(0, 1);
 *       skylinkDemo.streamData(currentStreamId, chunk);
 *     } else {
 *       skylinkDemo.stopStreamingData(currentStreamId);
 *     }
 *   };
 *   skylinkDemo.once("incomingDataStreamStarted", processNextFn, function (streamId, peerId, streamInfo, isSelf) {
 *     currentStreamId = streamId;
 *     return isSelf;
 *   });
 *   skylinkDemo.once("incomingDataStreamStopped", function () {
 *     // Render file
 *   }, function (streamId, peerId, streamInfo, isSelf) {
 *     return currentStreamId === streamId && isSelf;
 *   });
 *   skylinkDemo.startStreamingData(false);
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype.streamData = function(transferId, dataChunk) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    self._log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(dataChunk && typeof dataChunk === 'object' && (dataChunk instanceof Blob || dataChunk instanceof ArrayBuffer))) {
    self._log.error('Failed streaming data chunk as it is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    self._log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    self._log.error('Failed streaming data chunk as session does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    self._log.error('Failed streaming data chunk as session is not sending.');
    return;
  }

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? typeof dataChunk !== 'string' :
    typeof dataChunk !== 'object') {
    self._log.error('Failed streaming data chunk as data chunk does not match expected data type.');
    return;
  }

  var updatedDataChunk = dataChunk instanceof ArrayBuffer ? new Blob(dataChunk) : dataChunk;

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? updatedDataChunk.length > self._CHUNK_DATAURL_SIZE :
    updatedDataChunk.length > self._BINARY_FILE_SIZE) {
    self._log.error('Failed streaming data chunk as data chunk exceeds maximum chunk limit.');
    return;
  }

  var sessionInfo = {
    chunk: updatedDataChunk,
    chunkSize: updatedDataChunk.size || updatedDataChunk.length || updatedDataChunk.byteLength,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (dataChunk instanceof Blob) {
      self._blobToArrayBuffer(dataChunk, function (buffer) {
        self._sendMessageToDataChannel(peerId, buffer, channelProp, true);
        if (targetPeers) {
          for (var i = 0; i < targetPeers.length; i++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, targetPeers[i], sessionInfo, null);
            self._trigger('incomingDataStream', dataChunk, transferId, targetPeers[i], updatedSessionInfo, true);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, peerId, sessionInfo, null);
          self._trigger('incomingDataStream', dataChunk, transferId, peerId, updatedSessionInfo, true);
        }
      });
    } else {
      self._sendMessageToDataChannel(peerId, dataChunk, channelProp, true);
      if (targetPeers) {
        for (var i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, targetPeers[i], sessionInfo, null);
          self._trigger('incomingDataStream', updatedDataChunk, transferId, targetPeers[i], updatedSessionInfo, true);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, peerId, sessionInfo, null);
        self._trigger('incomingDataStream', updatedDataChunk, transferId, peerId, updatedSessionInfo, true);
      }
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        self._log.error([peerId, 'RTCDataChannel', transferId, 'Failed streaming data as it has not started or is ready.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Streaming as it has not started or Datachannel connection is not open.'));
        return;
      }

      if (self._hasMCU) {
        if (channelProp === 'main') {
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
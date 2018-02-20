/**
 * Function that starts a Datachannel connection with Peer.
 * @method _createDataChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, dataChannel, bufferThreshold, createAsMessagingChannel) {
  var self = this;
  var channelName = (self._user && self._user.sid ? self._user.sid : '-') + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;
  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  if (!self._user) {
    log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }


  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;

  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName, {
        reliable: true,
        ordered: true
      });

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelProp, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName,
        channelType, null, self._getDataChannelBuffer(dataChannel));
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
    self._dataChannels[peerId] = {};
    log.debug([peerId, 'RTCDataChannel', channelProp, 'initializing main DataChannel']);
  } else if (self._dataChannels[peerId].main && self._dataChannels[peerId].main.channel.label === channelName) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    log.error([peerId, 'RTCDataChannel', channelProp, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  // State where we can start calling .send() to queue more buffered data to be sent
  // RTCDataChannel has an internal mechanism to queue data to be sent over
  // This event might not be even triggered at all
  dataChannel.onbufferedamountlow = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel buffering data transfer low']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  dataChannel.onmessage = function(event) {
    self._processDataChannelData(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has opened']);

    dataChannel.bufferedAmountLowThreshold = bufferThreshold || 0;

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 1); // 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));

    dataChannel.onopen = onOpenHandlerFn;
  }

  var onCloseHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName,
      channelType, null, self._getDataChannelBuffer(dataChannel));

    if (self._peerConnections[peerId] && self._peerConnections[peerId].remoteDescription &&
      self._peerConnections[peerId].remoteDescription.sdp && (self._peerConnections[peerId].remoteDescription.sdp.indexOf(
      'm=application') === -1 || self._peerConnections[peerId].remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      return;
    }

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
          self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          log.debug([peerId, 'RTCDataChannel', channelProp, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, bufferThreshold, true);
        }
      }, 100);
    }
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    var hasTriggeredClose = false;
    var timeBlockAfterClosing = 0;

    dataChannel.onclose = function () {
      if (!hasTriggeredClose) {
        hasTriggeredClose = true;
        onCloseHandlerFn();
      }
    };

    var onFFClosed = setInterval(function () {
      if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSED ||
        hasTriggeredClose || timeBlockAfterClosing === 5) {
        clearInterval(onFFClosed);

        if (!hasTriggeredClose) {
          hasTriggeredClose = true;
          onCloseHandlerFn();
        }
      // After 5 seconds from CLOSING state and Firefox is not rendering to close, we have to assume to close it.
      // It is dead! This fixes the case where if it's Firefox who closes the Datachannel, the connection will
      // still assume as CLOSING..
      } else if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSING) {
        timeBlockAfterClosing++;
      }
    }, 1000);

  } else {
    dataChannel.onclose = onCloseHandlerFn;
  }

  if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
    self._dataChannels[peerId].main = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      streamId: null,
      channel: dataChannel
    };
  } else {
    self._dataChannels[peerId][channelName] = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      streamId: null,
      channel: dataChannel
    };
  }
};

/**
 * Function that refreshes the main messaging Datachannel.
 * @method refreshDatachannel
 * @param {String} [peerId] The target Peer ID to retrieve connection stats from.
 * @example
 *   // Example 1: Retrieve offerer and refresh datachannel:
 *   skylink.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *   if (channelType === skylink.DATA_CHANNEL_TYPE.MESSAGING &&
 *    state === skylink.DATA_CHANNEL_STATE.CLOSED) {
 *    var userWeight = skylink.getPeerInfo().config.priorityWeight;
 *    var peerWeight = skylink.getPeerInfo(peerId).config.priorityWeight;
 *    // Determine who is offerer because as per SM protocol, higher weight is offerer
 *    if (userWeight > peerWeight) {
 *      skylink.refreshDatachannel(peerId);
 *    }
 *  }
 *  });
 * @for Skylink
 * @since 0.6.30
 */

Skylink.prototype.refreshDatachannel = function (peerId) {

  var self = this;
  if(self._dataChannels[peerId] && self._dataChannels[peerId]["main"] && self._dataChannels[peerId].main.channel) {
    var channelName = self._dataChannels[peerId].main.channelName;
    var channelType = self._dataChannels[peerId].main.channelType;
    var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
    var bufferThreshold= self._dataChannels[peerId].main.channel.bufferedAmountLowThreshold || 0;

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
            self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          log.debug([peerId, 'RTCDataChannel', channelProp, 'Closed existing Datachannel connection']);
          self._closeDataChannel(peerId, channelProp);
          log.debug([peerId, 'RTCDataChannel', channelProp, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, bufferThreshold, true);
        }
      }, 100);
    }
  }
  else {
    log.debug([peerId, 'RTCDataChannel', 'Not a valid Datachannel connection']);
  }
};

/**
 * Function that returns the Datachannel buffer threshold and amount.
 * @method _getDataChannelBuffer
 * @return {JSON} The buffered amount information.
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getDataChannelBuffer = function (peerId, channelProp) {
  if (typeof peerId === 'object') {
    return {
      bufferedAmountLow: typeof peerId.bufferedAmountLow === 'number' ?
        peerId.bufferedAmountLow : parseInt(peerId.bufferedAmountLow, 10) || 0,
      bufferedAmountLowThreshold: typeof peerId.bufferedAmountLowThreshold === 'number' ?
        peerId.bufferedAmountLowThreshold : parseInt(peerId.bufferedAmountLowThreshold, 10) || 0
    };
  } else if (!(this._dataChannels[peerId] && this._dataChannels[peerId][channelProp] &&
    this._dataChannels[peerId][channelProp].channel)) {
    return {
      bufferedAmountLow: 0,
      bufferedAmountLowThreshold: 0
    };
  }

  var channel = this._dataChannels[peerId][channelProp].channel;

  return {
    bufferedAmountLow: typeof channel.bufferedAmountLow === 'number' ?
      channel.bufferedAmountLow : parseInt(channel.bufferedAmountLow, 10) || 0,
    bufferedAmountLowThreshold: typeof channel.bufferedAmountLowThreshold === 'number' ?
      channel.bufferedAmountLowThreshold : parseInt(channel.bufferedAmountLowThreshold, 10) || 0
  };
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp, doNotConvert) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping invalid data ->'], data);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  var channelName = self._dataChannels[peerId][channelProp].channelName;
  var channelType = self._dataChannels[peerId][channelProp].channelType;
  var readyState  = self._dataChannels[peerId][channelProp].channel.readyState;
  var messageType = typeof data === 'object' && data.type === self._DC_PROTOCOL_TYPE.MESSAGE ?
    self.DATA_CHANNEL_MESSAGE_ERROR.MESSAGE : self.DATA_CHANNEL_MESSAGE_ERROR.TRANSFER;

  if (readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    var notOpenError = 'Failed sending message as Datachannel connection state is not opened. Current ' +
      'readyState is "' + readyState + '"';

    log.error([peerId, 'RTCDataChannel', channelProp, notOpenError + ' ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId, new Error(notOpenError),
      channelName, channelType, messageType, self._getDataChannelBuffer(peerId, channelProp));

    throw new Error(notOpenError);
  }

  try {
    if (!doNotConvert && typeof data === 'object') {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending "' + data.type + '" protocol message ->'], data);

      self._dataChannels[peerId][channelProp].channel.send(JSON.stringify(data));

    } else {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending data with size ->'],
        data.size || data.length || data.byteLength);

      self._dataChannels[peerId][channelProp].channel.send(data);
    }
  } catch (error) {
    log.error([peerId, 'RTCDataChannel', channelProp, 'Failed sending ' + (!doNotConvert && typeof data === 'object' ?
      '"' + data.type + '" protocol message' : 'data') + ' ->'], error);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      error, channelName, channelType, messageType, self._getDataChannelBuffer(peerId, channelProp));

    throw error;
  }
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelProp) {
  var self = this;

  if (!self._dataChannels[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  var closeFn = function (rChannelProp) {
    var channelName = self._dataChannels[peerId][rChannelProp].channelName;
    var channelType = self._dataChannels[peerId][rChannelProp].channelType;

    if (self._dataChannels[peerId][rChannelProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Closing Datachannel']);

      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSING, peerId, null, channelName, channelType,
        null, self._getDataChannelBuffer(peerId, rChannelProp));

      self._dataChannels[peerId][rChannelProp].channel.close();

      delete self._dataChannels[peerId][rChannelProp];
    }
  };

  if (!channelProp || channelProp === 'main') {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels[peerId].hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp]) {
          closeFn(channelNameProp);
        }
      }
    }
  } else {
    if (!self._dataChannels[peerId][channelProp]) {
      log.warn([peerId, 'RTCDataChannel', channelProp, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    closeFn(channelProp);
  }
};
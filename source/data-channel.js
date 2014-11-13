/**
 * The list of datachannel states.
 * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
 *   webrtc/editor/webrtc.html#idl-def-RTCDataChannelState).
 * - This is the RTCDataChannelState of the peer.
 * - <u>ERROR</u> is an additional implemented state by Skylink
 *   for further error tracking.
 * - The states that would occur are:
 * @attribute DATA_CHANNEL_STATE
 * @type JSON
 * @param {String} CONNECTING The user agent is attempting to establish
 *   the underlying data transport. This is the initial state of a
 *   RTCDataChannel object created with createDataChannel().
 * @param {String} OPEN The underlying data transport is established
 *   and communication is possible. This is the initial state of a
 *   RTCDataChannel object dispatched as a part of a RTCDataChannelEvent.
 * @param {String} CLOSING The procedure to close down the underlying
 *   data transport has started.
 * @param {String} CLOSED The underlying data transport has been closed
 *   or could not be established.
 * @param {String} ERROR Datachannel has occurred an error.
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error'
};

/**
 * The current state if datachannel is enabled.
 * @attribute _enableDataChannel
 * @type Boolean
 * @default true
 * @private
 * @required
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Internal array of datachannels.
 * @attribute _dataChannels
 * @type Object
 * @private
 * @required
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = [];

/**
 * Create a DataChannel. Only SCTPDataChannel support
 * @method _createDataChannel
 * @param {String} peerId PeerId of the peer which the datachannel is connected to
 * @param {Object} [dc] The datachannel object received.
 * @trigger dataChannelState
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._createDataChannel = function(peerId, dc) {
  var self = this;
  var channelName = (dc) ? dc.label : peerId;
  var pc = self._peerConnections[peerId];
  var dcOpened = function () {
    log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'open');
    log.log([peerId, 'RTCDataChannel', channelName, 'Binary type support ->'], dc.binaryType);
    self._dataChannels[peerId] = dc;
    self._trigger('dataChannelState', dc.readyState, peerId);
  };
  if (window.webrtcDetectedDCSupport !== 'SCTP' &&
    window.webrtcDetectedDCSupport !== 'plugin') {
    log.warn([peerId, 'RTCDataChannel', channelName, 'SCTP not supported']);
    return;
  }
  if (!dc) {
    dc = pc.createDataChannel(channelName);
    self._trigger('dataChannelState', dc.readyState, peerId);
    var checkDcOpened = setInterval(function () {
      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        clearInterval(checkDcOpened);
        dcOpened();
      }
    }, 50);
  }
  if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    dcOpened();
  } else {
    dc.onopen = dcOpened;
  }
  dc.onerror = function(error) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], error);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
  };
  dc.onclose = function() {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'closed');
    self._closeDataChannel(peerId);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);

    // if closes because of firefox, reopen it again
    // if it is closed because of a restart, ignore
    if (self._peerConnections[peerId] && self._peerConnectionHealth[peerId]) {
      self._createDataChannel(peerId);
    }
  };
  dc.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName);
  };
};

/**
 * Triggers when datachannel ready state matches the one provided
 * @method _createDataChannel
 * @param {String} peerId PeerId of the peer which the datachannel is connected to
 * @param {Function} callback The callback once state has reached.
 * @param {String} state The datachannel readystate.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._checkDataChannelReadyState = function(peerId, callback, state) {
  var self = this;

  if (typeof callback !== 'function' || !state) {
    log.error([peerId, null, null, 'Callback provided is not a ' +
      'function or state is undefined']);
  }

  var checkStateInterval = setInterval(function () {
    if (state === self.DATA_CHANNEL_STATE.CLOSED) {
      if (!self._dataChannels[peerId]) {
        log.log([peerId, 'RTCDataChannel', null,
          'Datachannel has been removed and may be closed']);
        clearInterval(checkStateInterval);
        callback();
      }
    } else {
      if (!self._dataChannels[peerId]) {
        log.error([peerId, null, null, 'Datachannel does not exists']);
        clearInterval(checkStateInterval);
        return;
      }
      if (self._dataChannels[peerId].readyState === state) {
        log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], state);
        clearInterval(checkStateInterval);
        callback();
      }
    }
  }, 10);
};

/**
 * Sends data to the datachannel.
 * @method _sendDataChannelMessage
 * @param {String} peerId PeerId of the peer's datachannel to send data.
 * @param {JSON} data The data to send.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendDataChannelMessage = function(peerId, data) {
  var dc = this._dataChannels[peerId];
  if (!dc) {
    log.error([peerId, 'RTCDataChannel', dc.label, 'Datachannel connection ' +
      'to peer does not exist']);
    return;
  } else {
    if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
      var dataString = (typeof data === 'object') ? JSON.stringify(data) : data;
      log.debug([peerId, 'RTCDataChannel', dc.label, 'Sending to peer ->'],
        (data.type || 'DATA'));
      dc.send(dataString);
    } else {
      log.error([peerId, 'RTCDataChannel', dc.label, 'Datachannel is not opened'],
        'State: ' + dc.readyState);
      this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR,
        peerId, 'Datachannel is not ready.\nState is: ' + dc.readyState);
    }
  }
};

/**
 * Closes the datachannel.
 * @method _closeDataChannel
 * @param {String} peerId PeerId of the peer's datachannel to close.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId) {
  var dc = this._dataChannels[peerId];
  if (dc) {
    if (dc.readyState !== this.DATA_CHANNEL_STATE.CLOSED) {
      dc.close();
    }
    delete this._dataChannels[peerId];
    log.log([peerId, 'RTCDataChannel', dc.label, 'Sucessfully removed datachannel']);
  }
};
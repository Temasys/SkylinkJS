/**
 * The list of DataChannel states that would be trigged.
 * @attribute DATA_CHANNEL_STATE
 * @type JSON
 * @param {String} CONNECTING The DataChannel is attempting to establish a connection.
 * @param {String} OPEN The DataChannel connection is established.
 * @param {String} CLOSING The DataChannel is closing the connection.
 * @param {String} CLOSED The DataChannel connection is closed.
 * @param {String} ERROR The DataChannel is thrown with an exception during connection.
 * @readOnly
 * @component DataChannel
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
 * The flag that indicates if DataChannel should be enabled.
 * @attribute _enableDataChannel
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component DataChannel
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Stores the DataChannel received or created with peers.
 * @attribute _dataChannels
 * @param {Object} <peerId> The DataChannel associated with peer.
 * @type JSON
 * @private
 * @required
 * @component DataChannel
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = {};

/**
 * Creates and binds events to a SCTP DataChannel.
 * @method _createDataChannel
 * @param {String} peerId The peerId to tie the DataChannel to.
 * @param {Object} [dataChannel] The datachannel object received.
 * @trigger dataChannelState
 * @return {Object} New DataChannel with events.
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, dc) {
  var self = this;
  var channelName = (dc) ? dc.label : peerId;
  var pc = self._peerConnections[peerId];

  if (window.webrtcDetectedDCSupport !== 'SCTP' &&
    window.webrtcDetectedDCSupport !== 'plugin') {
    log.warn([peerId, 'RTCDataChannel', channelName, 'SCTP not supported']);
    return;
  }

  var dcHasOpened = function () {
    log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'open');
    log.log([peerId, 'RTCDataChannel', channelName, 'Binary type support ->'], dc.binaryType);
    self._trigger('dataChannelState', dc.readyState, peerId);
  };

  if (!dc) {
    try {
      dc = pc.createDataChannel(channelName);

      self._trigger('dataChannelState', dc.readyState, peerId);

      self._checkDataChannelReadyState(dc, dcHasOpened, self.DATA_CHANNEL_STATE.OPEN);

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName,
        'Exception occurred in datachannel:'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
      return;
    }
  } else {
    if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
      dcHasOpened();
    } else {
      dc.onopen = dcHasOpened;
    }
  }

  dc.onerror = function(error) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], error);
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
  };

  dc.onclose = function() {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], 'closed');

    dc.hasFiredClosed = true;

    // give it some time to set the variable before actually closing and checking.
    setTimeout(function () {
      // redefine pc
      pc = self._peerConnections[peerId];
      // if closes because of firefox, reopen it again
      // if it is closed because of a restart, ignore
      if (!!pc ? !pc.dataChannelClosed : false) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Re-opening closed datachannel in ' +
          'on-going connection']);

        self._dataChannels[peerId] = self._createDataChannel(peerId);

      } else {
        self._closeDataChannel(peerId);
        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
      }
    }, 100);
  };

  dc.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName);
  };

  return dc;
};

/**
 * Checks and triggers provided callback when the current DataChannel readyState
 * is the same as the readyState provided.
 * @method _checkDataChannelReadyState
 * @param {Object} dataChannel The DataChannel readyState to check on.
 * @param {Function} callback The callback to be fired when DataChannel readyState
 *   matches the readyState provided.
 * @param {String} readyState The DataChannel readystate to match. [Rel: DATA_CHANNEL_STATE]
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._checkDataChannelReadyState = function(dc, callback, state) {
  var self = this;
  if (!self._enableDataChannel) {
    log.debug('Datachannel not enabled. Returning callback');
    callback();
    return;
  }

  // fix for safari showing datachannel as function
  if (typeof dc !== 'object' && (window.webrtcDetectedBrowser === 'safari' ?
    typeof dc !== 'object' && typeof dc !== 'function' : true)) {
    log.error('Datachannel not provided');
    return;
  }
  if (typeof callback !== 'function'){
    log.error('Callback not provided');
    return;
  }
  if (!state){
    log.error('State undefined');
    return;
  }
  self._wait(function () {
    log.log([null, 'RTCDataChannel', dc.label, 'Firing callback. ' +
      'Datachannel state has met provided state ->'], state);
    callback();
  }, function () {
    return dc.readyState === state;
  });
};

/**
 * Sends a Message via the peer's DataChannel based on the peerId provided.
 * @method _sendDataChannelMessage
 * @param {String} peerId The peerId associated with the DataChannel to send from.
 * @param {JSON} data The Message data to send.
 * @trigger dataChannelState
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendDataChannelMessage = function(peerId, data) {
  var dc = this._dataChannels[peerId];

  if (!dc) {
    log.error([peerId, 'RTCDataChannel', null, 'Datachannel connection ' +
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
 * Closes the peer's DataChannel based on the peerId provided.
 * @method _closeDataChannel
 * @param {String} peerId The peerId associated with the DataChannel to be closed.
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId) {
  var self = this;
  var dc = self._dataChannels[peerId];
  if (dc) {
    if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      dc.close();
    } else {
      if (!dc.hasFiredClosed && window.webrtcDetectedBrowser === 'firefox') {
        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
      }
    }
    delete self._dataChannels[peerId];

    log.log([peerId, 'RTCDataChannel', dc.label, 'Sucessfully removed datachannel']);
  }
};
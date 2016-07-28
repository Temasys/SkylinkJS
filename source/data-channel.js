/**
 * Contains the list of Datachannel connection states.
 * @attribute DATA_CHANNEL_STATE
 * @param {String} CONNECTING <small>Value <code>"connecting"</code></small>
 *   The state when Datachannel is attempting to establish a connection.
 * @param {String} OPEN <small>Value <code>"open"</code></small>
 *   The state when Datachannel has established a connection.
 * @param {String} CLOSING <small>Value <code>"closing"</code></small>
 *   The state when Datachannel connection is closing.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when Datachannel connection has closed.
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when Datachannel connection has errors.
 * @type JSON
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
 * Contains the list of Datachannel types.
 * @attribute DATA_CHANNEL_TYPE
 * @param {String} MESSAGING <small>Value <code>"messaging"</code></small>
 *   The Datachannel type that is used for messaging in
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 *   This Datachannel type exists only once and may be used for data transfers (1 simultaneously) when
 *   Peer does not support multiple simultaneous data transfers.
 *   The connection will only close when the Peer connection is closed.
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   The Datachannel type that is used only for a data transfer.
 *   This Datachannel type may exists multiple times depending on the number of data transfers that
 *   is currently going on. The connection will close after the data transfer has been completed or terminated.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
};

/**
 * Stores the flag if Peers should have any Datachannel connections.
 * @attribute _enableDataChannel
 * @default true
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Stores the list of Peer Datachannel connections.
 * @attribute _dataChannels
 * @param {JSON} (#peerId) The list of Datachannels associated with Peer ID.
 * @param {RTCDataChannel} (#peerId).<#channelLabel> The Datachannel connection.
 *   The property name <code>"main"</code> is reserved for messaging Datachannel type.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = {};

/**
 * Function that starts a Datachannel connection with Peer.
 * @method _createDataChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, channelType, dc, customChannelName) {
  var self = this;

  if (typeof dc === 'string') {
    customChannelName = dc;
    dc = null;
  }

  if (!customChannelName) {
    log.error([peerId, 'RTCDataChannel', null, 'Aborting of creating Datachannel as no ' +
      'channel name is provided for channel. Aborting of creating Datachannel'], {
        channelType: channelType
      });
    return;
  }

  var channelName = (dc) ? dc.label : customChannelName;
  var pc = self._peerConnections[peerId];

  var SctpSupported =
    !(window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion < 30 ||
      window.webrtcDetectedBrowser === 'opera'  && window.webrtcDetectedVersion < 20 );

  if (!SctpSupported) {
    log.warn([peerId, 'RTCDataChannel', channelName, 'SCTP not supported'], {
      channelType: channelType
    });
    return;
  }

  var dcHasOpened = function () {
    log.log([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], {
      readyState: 'open',
      channelType: channelType
    });

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN,
      peerId, null, channelName, channelType);
  };

  if (!dc) {
    try {
      dc = pc.createDataChannel(channelName);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        // the datachannel was not defined in array before it was triggered
        // set a timeout to allow the dc objec to be returned before triggering "open"
        setTimeout(dcHasOpened, 500);
      } else {
        self._trigger('dataChannelState', dc.readyState, peerId, null,
          channelName, channelType);

        self._wait(function () {
          log.log([peerId, 'RTCDataChannel', dc.label, 'Firing callback. ' +
            'Datachannel state has opened ->'], dc.readyState);
          dcHasOpened();
        }, function () {
          return dc.readyState === self.DATA_CHANNEL_STATE.OPEN;
        });
      }

      log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel RTC object is created'], {
        readyState: dc.readyState,
        channelType: channelType
      });

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], {
        channelType: channelType,
        error: error
      });
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error,
        channelName, channelType);
      return;
    }
  } else {
    if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
      // the datachannel was not defined in array before it was triggered
      // set a timeout to allow the dc objec to be returned before triggering "open"
      setTimeout(dcHasOpened, 500);
    } else {
      dc.onopen = dcHasOpened;
    }
  }

  log.log([peerId, 'RTCDataChannel', channelName, 'Binary type support ->'], {
    binaryType: dc.binaryType,
    readyState: dc.readyState,
    channelType: channelType
  });

  dc.dcType = channelType;

  dc.onerror = function(error) {
    log.error([peerId, 'RTCDataChannel', channelName, 'Exception occurred in datachannel:'], {
      channelType: channelType,
      readyState: dc.readyState,
      error: error
    });
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error,
       channelName, channelType);
  };

  dc.onclose = function() {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel state ->'], {
      readyState: 'closed',
      channelType: channelType
    });

    dc.hasFiredClosed = true;

    // give it some time to set the variable before actually closing and checking.
    setTimeout(function () {
      // redefine pc
      pc = self._peerConnections[peerId];
      // if closes because of firefox, reopen it again
      // if it is closed because of a restart, ignore

      var checkIfChannelClosedDuringConn = !!pc ? !pc.dataChannelClosed : false;

      if (checkIfChannelClosedDuringConn && dc.dcType === self.DATA_CHANNEL_TYPE.MESSAGING) {
        log.debug([peerId, 'RTCDataChannel', channelName, 'Re-opening closed datachannel in ' +
          'on-going connection'], {
            channelType: channelType,
            readyState: dc.readyState,
            isClosedDuringConnection: checkIfChannelClosedDuringConn
        });

        self._dataChannels[peerId].main =
          self._createDataChannel(peerId, self.DATA_CHANNEL_TYPE.MESSAGING, null, peerId);

        log.debug([peerId, 'RTCDataChannel', channelName, 'Re-opened closed datachannel'], {
          channelType: channelType,
          readyState: dc.readyState,
          isClosedDuringConnection: checkIfChannelClosedDuringConn
        });

      } else {
        self._closeDataChannel(peerId, channelName);
        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null,
          channelName, channelType);

        log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has closed'], {
          channelType: channelType,
          readyState: dc.readyState,
          isClosedDuringConnection: checkIfChannelClosedDuringConn
        });
      }
    }, 100);
  };

  dc.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName, channelType);
  };

  return dc;
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendDataChannelMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendDataChannelMessage = function(peerId, data, channelKey) {
  var self = this;

  var channelName;

  if (!channelKey || channelKey === peerId) {
    channelKey = 'main';
  }

  var dcList = self._dataChannels[peerId] || {};
  var dc = dcList[channelKey];

  if (!dc) {
    log.error([peerId, 'RTCDataChannel', channelKey + '|' + channelName,
      'Datachannel connection to peer does not exist'], {
        enabledState: self._enableDataChannel,
        dcList: dcList,
        dc: dc,
        type: (data.type || 'DATA'),
        data: data,
        channelKey: channelKey
    });
    return;
  } else {
    channelName = dc.label;

    log.debug([peerId, 'RTCDataChannel', channelKey + '|' + channelName,
      'Sending data using this channel key'], data);

    if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
      var dataString = (typeof data === 'object') ? JSON.stringify(data) : data;
      log.debug([peerId, 'RTCDataChannel', channelKey + '|' + dc.label,
        'Sending to peer ->'], {
          readyState: dc.readyState,
          type: (data.type || 'DATA'),
          data: data
      });
      dc.send(dataString);
    } else {
      log.error([peerId, 'RTCDataChannel', channelKey + '|' + dc.label,
        'Datachannel is not opened'], {
          readyState: dc.readyState,
          type: (data.type || 'DATA'),
          data: data
      });
      this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR,
        peerId, 'Datachannel is not ready.\nState is: ' + dc.readyState);
    }
  }
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelName) {
  var self = this;
  var dcList = self._dataChannels[peerId] || {};
  var dcKeysList = Object.keys(dcList);


  if (channelName) {
    dcKeysList = [channelName];
  }

  for (var i = 0; i < dcKeysList.length; i++) {
    var channelKey = dcKeysList[i];
    var dc = dcList[channelKey];

    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        log.log([peerId, 'RTCDataChannel', channelKey + '|' + dc.label,
          'Closing datachannel']);
        dc.close();
      } else {
        if (!dc.hasFiredClosed && window.webrtcDetectedBrowser === 'firefox') {
          log.log([peerId, 'RTCDataChannel', channelKey + '|' + dc.label,
            'Closed Firefox datachannel']);
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId,
            null, channelName, channelKey === 'main' ? self.DATA_CHANNEL_TYPE.MESSAGING :
            self.DATA_CHANNEL_TYPE.DATA);
        }
      }
      delete self._dataChannels[peerId][channelKey];

      log.log([peerId, 'RTCDataChannel', channelKey + '|' + dc.label,
        'Sucessfully removed datachannel']);
    } else {
      log.log([peerId, 'RTCDataChannel', channelKey + '|' + channelName,
        'Unable to close Datachannel as it does not exists'], {
          dc: dc,
          dcList: dcList
      });
    }
  }
};
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
 * The types of DataChannel available
 * @attribute DATA_CHANNEL_TYPE
 * @type JSON
 * @param {String} MESSAGING For messaging only. The main DataChannel that cannot be
 *   closed or removed unless peer connection has stopped.
 * @param {String} DATA For transfers only. This would be closed and removed once the
 *   transfer is completed.
 * @readOnly
 * @component DataChannel
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
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
 * @param {String} channelType The DataChannel type.
 *    [Rel: Skylink.DATA_CHANNEL_TYPE]
 * @param {Object} [dataChannel] The datachannel object received.
 * @param {String} customChannelName The custom DataChannel label name.
 * @trigger dataChannelState
 * @return {Object} New DataChannel with events.
 * @private
 * @component DataChannel
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

  if (window.webrtcDetectedDCSupport !== 'SCTP' &&
    window.webrtcDetectedDCSupport !== 'plugin') {
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
 * Sends a Message via the peer's DataChannel based on the peerId provided.
 * @method _sendDataChannelMessage
 * @param {String} peerId The peerId associated with the DataChannel to send from.
 * @param {JSON} data The Message data to send.
 * @param {String} [channelKey=main] The datachannel to send messages to. If
 *   channelKey is not provided, use the main channel.
 * @trigger dataChannelState
 * @private
 * @component DataChannel
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
 * Closes the peer's DataChannel based on the peerId provided.
 * @method _closeDataChannel
 * @param {String} peerId The peerId associated with the DataChannel to be closed.
 * @param {String} [channelName] The datachannel to close. If channelName is not
 *    provided, all datachannels linked to the peer will be closed.
 * @private
 * @component DataChannel
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
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
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
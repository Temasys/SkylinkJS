/**
 * These are the list of DataChannel connection states that Skylink would trigger.
 * - Some of the state references the [w3c WebRTC Specification Draft](http://w3c.github.io/webrtc-pc/#idl-def-RTCDataChannelState),
 *   except the <code>ERROR</code> state, which is an addition provided state by Skylink
 *   to inform exception during the DataChannel connection with Peers.
 * @attribute DATA_CHANNEL_STATE
 * @type JSON
 * @param {String} CONNECTING <small>Value <code>"connecting"</code></small>
 *   The state when DataChannel is attempting to establish a connection.<br>
 *   This is the initial state when a DataChannel connection is created.
 * @param {String} OPEN <small>Value <code>"open"</code></small>
 *   The state when DataChannel connection is established.<br>
 *   This happens usually after <code>CONNECTING</code> state, or not when DataChannel connection
 *   is from initializing Peer (the one who begins the DataChannel connection).
 * @param {String} CLOSING <small>Value <code>"closing"</code></small>
 *   The state when DataChannel connection is closing.<br>
 *   This happens when DataChannel connection is closing and happens after <code>OPEN</code>.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when DataChannel connection is closed.<br>
 *   This happens when DataChannel connection has closed and happens after <code>CLOSING</code>
 *   (or sometimes <code>OPEN</code> depending on the browser implementation).
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when DataChannel connection have met with an exception.<br>
 *   This may happen during any state not after <code>CLOSED</code>.
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
 * These are the types of DataChannel connection that Skylink provides.
 * - Different channels serves different functionalities.
 * @attribute DATA_CHANNEL_TYPE
 * @type JSON
 * @param {String} MESSAGING <small><b>MAIN connection</b> | Value <code>"messaging"</code></small>
 *   This DataChannel connection is used for P2P messaging only, as used in
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.<br>
 * Unless if self connects with Peers connecting from the mobile SDK platform applications,
 *   this connection would be used for data transfers as used in
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}} and
 *   and {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}, which allows
 *   only one outgoing and incoming data transfer one at a time (no multi-transfer support).<br>
 *   This connection will always be kept alive until the Peer connection has ended.
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   This DataChannel connection is used for a data transfer, as used in
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}}
 *   and {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}.<br>
 * If self connects with Peers with DataChannel connections of this type,
 *   it indicates that multi-transfer is supported.<br>
 *   This connection will be closed once the data transfer has completed or terminated.
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
 * The flag that indicates if Peers connection should have any
 *   DataChannel connections.
 * @attribute _enableDataChannel
 * @type Boolean
 * @default true
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableDataChannel = true;

/**
 * Stores the list of DataChannel connections.
 * @attribute _dataChannels
 * @param {Array} (#peerId) The Peer ID associated with the list of
 *   DataChannel connections.
 * @param {Object} (#peerId).main The DataChannel connection object
 *   that is used for messaging only associated with the Peer connection.
 *   This is the sole channel for sending P2P messages in
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.
 *   This connection will always be kept alive until the Peer connection has
 *   ended. The <code>channelName</code> for this reserved key is <code>"main"</code>.
 * @param {Object} (#peerId).(#channelName) The DataChannel connection
 *   object that is used temporarily for a data transfer associated with the
 *   Peer connection. This is using caused by methods
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}}
 *   and {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}.
 *   This connection will be closed once the transfer has completed or terminated.
 *   The <code>channelName</code> is usually the data transfer ID.
 * @type JSON
 * @private
 * @component DataChannel
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._dataChannels = {};

/**
 * Starts a DataChannel connection with a Peer connection. If the
 *   DataChannel is provided in the parameter, it simply appends
 *   event handlers to check the current state of the DataChannel.
 * @method _createDataChannel
 * @param {String} peerId The Peer ID to start the
 *   DataChannel with or associate the provided DataChannel object
 *   connection with.
 * @param {String} channelType The DataChannel functionality type.
 *   [Rel: Skylink.DATA_CHANNEL_TYPE]
 * @param {Object} [dataChannel] The RTCDataChannel object received
 *   in the Peer connection <code>.ondatachannel</code> event.
 * @param {String} customChannelName The custom RTCDataChannel label
 *   name to identify the different opened channels.
 * @trigger dataChannelState
 * @return {Object} The DataChannel connection object associated with
 *   the provided Peer ID.
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
 * Sends data over the DataChannel connection associated
 *    with the Peer connection.
 * The current supported data type is <code>string</code>. <code>Blob</code>,
 *   <code>ArrayBuffer</code> types support is not yet currently handled or
 *   implemented.
 * @method _sendDataChannelMessage
 * @param {String} peerId The Peer ID to send the data to the
 *   associated DataChannel connection.
 * @param {JSON|String} data The data to send over. <code>string</code> is only
 *   used to send binary data string over. <code>JSON</code> is primarily used
 *   for the {{#crossLink "Skylink/DT_PROTOCOL_VERSION:attribute"}}DT Protocol{{/crossLink}}
 *   that Skylink follows for P2P messaging and transfers.
 * @param {String} [channelName="main"] The DataChannel channelName of the connection
 *   to send the data over to. The datachannel to send messages to. By default,
 *   if the DataChannel <code>channelName</code> is not provided,
 *   the DataChannel connection associated with the channelName <code>"main"</code> would be used.
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
 * Stops DataChannel connections associated with a Peer connection
 *   and remove any object references to the DataChannel connection(s).
 * @method _closeDataChannel
 * @param {String} peerId The Peer ID associated with the DataChannel
 *   connection(s) to close.
 * @param {String} [channelName] The targeted DataChannel <code>channelName</code>
 *   to close the connection with. If <code>channelName</code> is not provided,
 *   all associated DataChannel connections with the Peer connection would be closed.
 * @trigger dataChannelState
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
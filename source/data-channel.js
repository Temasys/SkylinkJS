/**
 * The list of Datachannel connection states.
 * @attribute DATA_CHANNEL_STATE
 * @param {String} CONNECTING          <small>Value <code>"connecting"</code></small>
 *   The value of the state when Datachannel is attempting to establish a connection.
 * @param {String} OPEN                <small>Value <code>"open"</code></small>
 *   The value of the state when Datachannel has established a connection.
 * @param {String} CLOSING             <small>Value <code>"closing"</code></small>
 *   The value of the state when Datachannel connection is closing.
 * @param {String} CLOSED              <small>Value <code>"closed"</code></small>
 *   The value of the state when Datachannel connection has closed.
 * @param {String} ERROR               <small>Value <code>"error"</code></small>
 *   The value of the state when Datachannel connection has errors.
 * @param {String} CREATE_ERROR        <small>Value <code>"createError"</code></small>
 *   The value of the state when Datachannel has failed to establish a connection.
 * @param {String} BUFFERED_AMOUNT_LOW <small>Value <code>"bufferedAmountLow"</code></small>
 *   The value of the state when Datachannel when the amount of data buffered to be sent
 *   falls below the Datachannel threshold.
 *   <small>This state should occur only during after <a href="#method_sendBlobData">
 *   <code>sendBlobData()</code> method</a> or <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {String} SEND_MESSAGE_ERROR  <small>Value <code>"sendMessageError"</code></small>
 *   The value of the state when Datachannel when data transfer packets or P2P message fails to send
 *   because Datachannel state is not at <code>OPEN</code>.
 *   <small>This state should occur only during after <a href="#method_sendBlobData">
 *   <code>sendBlobData()</code> method</a> or <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
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
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError'
};

/**
 * The list of Datachannel types.
 * @attribute DATA_CHANNEL_TYPE
 * @param {String} MESSAGING <small>Value <code>"messaging"</code></small>
 *   The value of the Datachannel type that is used only for messaging in
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 *   <small>However for Peers that do not support simultaneous data transfers, this Datachannel
 *   type will be used to do data transfers (1 at a time).</small>
 *   <small>Each Peer connections will only have one of this Datachannel type and the
 *   connection will only close when the Peer connection is closed (happens when <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggers parameter payload <code>state</code> as
 *   <code>CLOSED</code> for Peer).</small>
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   The value of the Datachannel type that is used only for a data transfer in
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 *   <small>The connection will close after the data transfer has been completed or terminated (happens when
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>DOWNLOAD_COMPLETED</code>, <code>UPLOAD_COMPLETED</code>,
 *   <code>REJECTED</code>, <code>CANCEL</code> or <code>ERROR</code> for Peer).</small>
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
 * @param {JSON} #peerId The list of Datachannels associated with Peer ID.
 * @param {RTCDataChannel} #peerId.#channelLabel The Datachannel connection.
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
Skylink.prototype._createDataChannel = function(peerId, dataChannel, createAsMessagingChannel) {
  var self = this;

  if (!self._user) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }

  var channelName = self._user.sid + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;

  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;
  
  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName);

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName, channelType);
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    log.debug([peerId, 'RTCDataChannel', channelName, 'initializing main DataChannel']);

    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;

    self._dataChannels[peerId] = {};
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    log.error([peerId, 'RTCDataChannel', channelName, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName, channelType);
  };

  dataChannel.onbufferedamountlow = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel buffering data transfer low']);

    // TODO: Should we add an event here
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName, channelType);
  };

  dataChannel.onclose = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName, channelType);

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
          log.debug([peerId, 'RTCDataChannel', channelName, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, true);
        }
      }, 100);
    }
  };

  dataChannel.onmessage = function(event) {
    self._dataChannelProtocolHandler(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has opened']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName, channelType);
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName, channelType);

    dataChannel.onopen = onOpenHandlerFn;
  }

  if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
    self._dataChannels[peerId].main = dataChannel;
  } else {
    self._dataChannels[peerId][channelName] = dataChannel;
  }
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  if (typeof data === 'undefined') {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Dropping empty message']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  if (self._dataChannels[peerId][channelProp].readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    log.error([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping of sending message as Datachannel connection is not opened ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      new Error('Datachannel is not ready.\nState is: ' + self._dataChannels[peerId][channelProp].readyState));
    return;
  }

  log.debug([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Sending message ->'], data);

  self._dataChannels[peerId][channelProp].send(typeof data === 'object' ? JSON.stringify(data) : data);
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

  if (!self._dataChannels[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelName || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  if (!channelName) {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels.hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp] &&
          self._dataChannels[peerId][channelNameProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
          log.debug([peerId, 'RTCDataChannel', channelNameProp, 'Closing Datachannel']);
          self._dataChannels[peerId][channelNameProp].close();
        }
        delete self._dataChannels[peerId][channelNameProp];
      }
    }
  } else {
    if (!self._dataChannels[peerId][channelName]) {
      log.warn([peerId, 'RTCDataChannel', channelName, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    log.debug([peerId, 'RTCDataChannel', channelName, 'Closing Datachannel']);

    self._dataChannels[peerId][channelName].close();

    delete self._dataChannels[peerId][channelName];

    // TODO: Handle when Datachannel did not fire close naturally
  }
};
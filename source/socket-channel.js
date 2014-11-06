/**
 * The list of channel connection error.
 * - The errors that would occur are:
 * @attribute CHANNEL_CONNECTION_ERROR
 * @type JSON
 * @param {Integer} CONNECTION_FAILED The connection failed. Up to user's
 *   defined reconnection attempts to decide on a reconnection.
 * @param {String} RECONNECTION_FAILED The reconnection failed. Up to user's
 *   defined reconnection attempts to decide on another reconnection.
 * @param {String} CONNECTION_ABORTED No reconnection specified.
 *   Connection is aborted.
 * @param {String} RECONNECTION_ABORTED All reconnection attempts have failed.
 *   Reconnection is aborted.
 * @readOnly
 * @since 0.5.4
 */
Skylink.prototype.CHANNEL_CONNECTION_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3
};

/**
 * The current socket opened state.
 * @attribute _channelOpen
 * @type Boolean
 * @private
 * @required
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * The signaling server to connect to.
 * @attribute _signalingServer
 * @type String
 * @private
 * @since 0.5.2
 */
Skylink.prototype._signalingServer = null;

/**
 * The signaling server protocol to use.
 * @attribute _signalingServerProtocol
 * @type String
 * @private
 * @since 0.5.4
 */
Skylink.prototype._signalingServerProtocol = window.location.protocol;

/**
 * The signaling server port to connect to.
 * @attribute _signalingServerPort
 * @type Integer
 * @private
 * @since 0.5.2
 */
Skylink.prototype._signalingServerPort =
  (window.location.protocol === 'https:') ? 443 : 80;

/**
 * The actual socket object that handles the connection.
 * @attribute _socket
 * @type Object
 * @required
 * @private
 * @since 0.1.0
 */
Skylink.prototype._socket = null;

/**
 * The socket connection timeout
 * @attribute _socketTimeout
 * @type Integer
 * @default 1000
 * @required
 * @private
 * @since 0.5.4
 */
Skylink.prototype._socketTimeout = 1000;

/**
 * The socket connection to use XDomainRequest.
 * @attribute _socketUseXDR
 * @type Boolean
 * @default false
 * @required
 * @private
 * @since 0.5.4
 */
Skylink.prototype._socketUseXDR = false;

/**
 * The current socket connection reconnection attempt.
 * @attribute _socketCurrentReconnectionAttempt
 * @type Integer
 * @required
 * @private
 * @since 0.5.4
 */
Skylink.prototype._socketCurrentReconnectionAttempt = 0;

/**
 * The socket connection reconnection attempts before it aborts.
 * @attribute _socketReconnectionAttempts
 * @type Integer
 * @default 3
 * @required
 * @private
 * @since 0.5.4
 */
Skylink.prototype._socketReconnectionAttempts = 3;

/**
 * Sends a message to the signaling server.
 * - Not to be confused with method
 *   {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}
 *   that broadcasts messages. This is for sending socket messages.
 * @method _sendChannelMessage
 * @param {JSON} message
 * @private
 * @since 0.1.0
 */
Skylink.prototype._sendChannelMessage = function(message) {
  if (!this._channelOpen) {
    return;
  }
  var messageString = JSON.stringify(message);
  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message.type);
  this._socket.send(messageString);
};

/**
 * Create the socket object to refresh connection.
 * @method _createSocket
 * @private
 * @since 0.5.4
 */
Skylink.prototype._createSocket = function () {
  var self = this;
  self._signalingServerProtocol = (self._forceSSL) ?
    'https:' : self._signalingServerProtocol;
  self._signalingServerPort = (self._forceSSL) ?
    ((self._signalingServerPort !== 3443) ? 443 : 3443) :
    self._signalingServerPort;
  var ip_signaling = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  log.log('Opening channel with signaling server url:', {
    url: ip_signaling,
    useXDR: self._socketUseXDR
  });

  self._socket = io.connect(ip_signaling, {
    forceNew: true,
    'sync disconnect on unload' : true,
    timeout: self._socketTimeout,
    reconnection: false,
    transports: ['websocket']
  });
};

/**
 * Initiate a socket signaling connection.
 * @method _openChannel
 * @trigger channelMessage, channelOpen, channelError, channelClose
 * @private
 * @since 0.1.0
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen ||
    self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    return;
  }

  self._createSocket();

  self._socket.on('connect', function() {
    self._channelOpen = true;
    self._trigger('channelOpen');
    log.log([null, 'Socket', null, 'Channel opened']);
  });

  // NOTE: should we throw a socket error when its a native WebSocket API error
  // attempt to do a reconnection instead
  self._socket.on('connect_error', function () {
    self._signalingServerPort = (window.location.protocol === 'https' ||
      self._forceSSL) ? 3443 : 3000;
    // close it first
    self._socket.close();

    // check if it's a first time attempt to establish a reconnection
    if (self._socketCurrentReconnectionAttempt === 0) {
      // connection failed
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED);
    }
    // do a check if require reconnection
    if (self._socketReconnectionAttempts === 0) {
      // no reconnection
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.CONNECTION_ABORTED,
        self._socketCurrentReconnectionAttempt);
    } else if (self._socketReconnectionAttempts === -1 ||
      self._socketReconnectionAttempts > self._socketCurrentReconnectionAttempt) {
      // do a connection
      log.log([null, 'Socket', null, 'Attempting to re-establish signaling ' +
        'server connection']);
      setTimeout(function () {
        self._socket = null;
        // increment the count
        self._socketCurrentReconnectionAttempt += 1;
      }, self._socketTimeout);
      // if it's not a first try, trigger it
      if (self._socketCurrentReconnectionAttempt > 0) {
        self._trigger('channelConnectionError',
          self.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED,
          self._socketCurrentReconnectionAttempt);
      }
    } else {
      self._trigger('channelConnectionError',
        self.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED,
        self._socketCurrentReconnectionAttempt);
    }
  });
  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });
  self._socket.on('disconnect', function() {
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);
  });
  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
};

/**
 * Closes the socket signaling connection.
 * @method _closeChannel
 * @private
 * @since 0.1.0
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  this._socket.disconnect();
  this._socket = null;
  this._channelOpen = false;
};
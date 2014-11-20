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
 * @for Skylink
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
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * The signaling server to connect to.
 * @attribute _signalingServer
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._signalingServer = null;

/**
 * The signaling server protocol to use.
 * @attribute _signalingServerProtocol
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerProtocol = window.location.protocol;

/**
 * The signaling server port to connect to.
 * @attribute _signalingServerPort
 * @type Integer
 * @default https: = 443, http = 80
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._signalingServerPort =
  (window.location.protocol === 'https:') ? 443 : 80;

/**
 * The actual socket object that handles the connection.
 * @attribute _socket
 * @type Object
 * @required
 * @private
 * @for Skylink
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
 * @for Skylink
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
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketUseXDR = false;

/**
 * The current socket connection reconnection attempt.
 * @attribute _socketCurrentReconnectionAttempt
 * @type Integer
 * @required
 * @private
 * @for Skylink
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
 * @for Skylink
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
 * @for Skylink
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
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._createSocket = function () {
  var self = this;
  // set the protocol
  self._signalingServerProtocol = (self._forceSSL) ?
    'https:' : self._signalingServerProtocol;
  // set the port
  self._signalingServerPort = (self._forceSSL) ?
    ((self._signalingServerPort !== 3443) ? 443 : 3443) :
    self._signalingServerPort;
  // create the sig url
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
    //reconnection: false,
    transports: ['websocket']
  });
};

/**
 * Checks the reconnection attempt and reconnect if limit is not reached.
 * @method _checkReconnectionAttempt
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._checkReconnectionAttempt = function () {
  this._signalingServerPort = (window.location.protocol === 'https' ||
    this._forceSSL) ? 3443 : 3000;

  var errorCode;
  var reopenChannel = false;

  // check if it's defined first. if so, close it first
  if (this._socket) {
    this._socket.close();
  }
  // check if it's a first time attempt to establish a reconnection
  if (this._socketCurrentReconnectionAttempt === 0) {
    // connection failed
    errorCode = this.CHANNEL_CONNECTION_ERROR.CONNECTION_FAILED;
    // should always trigger a connection failed
    this._trigger('channelConnectionError', errorCode,
      this._socketCurrentReconnectionAttempt);
  }
  // do a check if require reconnection
  if (this._socketReconnectionAttempts === 0) {
    // no reconnection
    errorCode = this.CHANNEL_CONNECTION_ERROR.CONNECTION_ABORTED;

  } else if (this._socketReconnectionAttempts === -1 ||
    this._socketReconnectionAttempts >= this._socketCurrentReconnectionAttempt) {
    // do a connection
    log.log([null, 'Socket', null, 'Attempting to re-establish signaling ' +
      'server connection']);

    // if it's not a first try, trigger it
    if (this._socketCurrentReconnectionAttempt > 0) {
      errorCode = this.CHANNEL_CONNECTION_ERROR.RECONNECTION_FAILED;
    }
    // re-open the channel
    reopenChannel = true;
  } else {
    errorCode = this.CHANNEL_CONNECTION_ERROR.RECONNECTION_ABORTED;
  }
  this._trigger('channelConnectionError', errorCode,
    this._socketCurrentReconnectionAttempt);

  if (reopenChannel) {
    // increment the count
    this._socketCurrentReconnectionAttempt += 1;
    // re-open the channel
    this._openChannel();
  }
};

/**
 * Initiate a socket signaling connection.
 * @method _openChannel
 * @trigger channelMessage, channelOpen, channelError, channelClose
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen ||
    self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready or there is already an ongoing channel connection']);
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
    self._channelOpen = false;
    self._checkReconnectionAttempt();
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
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  this._socket.disconnect();
  this._socket = null;
  this._channelOpen = false;
  this._socketCurrentReconnectionAttempt = 0;
};
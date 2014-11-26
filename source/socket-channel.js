/**
 * The list of channel connection error.
 * - The errors that would occur are:
 * @attribute SOCKET_ERROR
 * @type JSON
 * @param {Integer} CONNECTION_FAILED The connection failed. Up to user's
 *   defined reconnection attempts to decide on a reconnection.
 * @param {String} RECONNECTION_FAILED The reconnection failed. Up to user's
 *   defined reconnection attempts to decide on another reconnection.
 * @param {String} CONNECTION_ABORTED No reconnection specified.
 *   Connection is aborted.
 * @param {String} RECONNECTION_ABORTED All reconnection attempts have failed.
 *   Reconnection is aborted.
 * @param {String} RECONNECTION_ATTEMPT A reconnection attempt has been fired.
 * @readOnly
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
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
 * <ul>
 * <li><code>https:</code>
 * <ul><li>Default port is <code>443</code>.</li>
 *     <li>Fallback port is <code>3443</code>.</li>
 * </ul></li>
 * <li><code>http:</code>
 * <ul><li>Default port is <code>80</code>.</li>
 *     <li>Fallback port is <code>3000</code>.</li>
 * </ul></li>
 * </ul>
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
 * <ul>
 * <li><code>0</code> Uses the default timeout from socket.io
 *     <code>20000</code>ms.</li>
 * <li><code>>0</code> Uses the user set timeout</li>
 * </ul>
 * @attribute _socketTimeout
 * @type Integer
 * @default 0
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._socketTimeout = 0;

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
 * Sends a message to the signaling server.
 * - Not to be confused with method
 *   {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}
 *   that broadcasts messages. This is for sending socket messages.
 * @method _sendChannelMessage
 * @param {JSON} message
 * @param {Function} [callback] The callback fired after message was sent to signaling server.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._sendChannelMessage = function(message, callback) {
  if (!this._channelOpen) {
    return;
  }
  var messageString = JSON.stringify(message);
  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message.type);
  this._socket.send(messageString);
  if (typeof callback === 'function'){
    callback();
  }
};

/**
 * Create the socket object to refresh connection.
 * @method _createSocket
 * @param {JSON} options The socket connection options.
 * @param {Boolean} [isReconnection=false] If the socket connection is a reconnection.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createSocket = function (options, isReconnection) {
  var self = this;

  // create the sig url
  var ip_signaling = self._signalingServerProtocol + '//' + self._signalingServer +
    ':' + self._signalingServerPort;

  if (self._socketTimeout !== 0) {
    options.timeout = self._socketTimeout;
  }

  log.log('Opening channel with signaling server url:', {
    url: ip_signaling,
    useXDR: self._socketUseXDR
  }, options);

  self._socket = io.connect(ip_signaling, options);

  // first-time reconnection
  if (isReconnection) {
    self._socket.on('reconnect_attempt', function (attempt) {
      self._channelOpen = false;
      self._socketCurrentReconnectionAttempt = attempt;
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT, attempt);
    });

    self._socket.on('reconnect_error', function (error) {
      self._channelOpen = false;
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, error);
    });

    self._socket.on('reconnect_failed', function (error) {
      self._channelOpen = false;
      self._socketReconnectionAborted = true;
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, error);
    });

  } else {
    self._socket.on('connect_error', function (error) {
      self._channelOpen = false;
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, error);

      // set to fallback port
      self._signalingServerPort = (self._signalingServerProtocol === 'https:') ?
        3443 : 3000;
      // set the socket.io to reconnect
      options.reconnection = true;
      // set the socket timeout
      if (self._socketTimeout !== 0) {
        options.reconnectionDelay = self._socketTimeout;
      }
      if (self._socket) {
        self._socket.disconnect();
        self._socket = null;
      }
      self._createSocket(options, true);
    });
  }

  self._socket.on('connect', function() {
    self._channelOpen = true;
    self._trigger('channelOpen');
    log.log([null, 'Socket', null, 'Channel opened']);
  });

  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });

  self._socket.on('disconnect', function() {
    self._channelOpen = false;
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);
  });

  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
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

  // set if forceSSL
  if (self._forceSSL) {
    self._signalingServerProtocol = 'https:';
    self._signalingServerPort = 443;
  } else {
    self._signalingServerProtocol = window.location.protocol;
    self._signalingServerPort = (window.location.protocol === 'https:') ? 443 : 80;
  }

  self._createSocket({
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false,
    transports: ['websocket']
  }, false);
};

/**
 * Closes the socket signaling connection.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  if (this._socket) {
    this._socket.disconnect();
    this._socket = null;
  }
  this._channelOpen = false;
  this._socketCurrentReconnectionAttempt = 0;
  this._socketReconnectionAborted = false;
};
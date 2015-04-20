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
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};

/**
 * The queue of messages to be sent to signaling server.
 * @attribute _socketMessageQueue
 * @type Array
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageQueue = [];

/**
 * The timeout used to send socket message queue.
 * @attribute _socketMessageTimeout
 * @type Function
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._socketMessageTimeout = null;

/**
 * The list of channel connection fallback states.
 * - The fallback states that would occur are:
 * @attribute SOCKET_FALLBACK
 * @type JSON
 * @param {String} NON_FALLBACK Non-fallback state,
 * @param {String} FALLBACK_PORT Fallback to non-ssl port for channel re-try.
 * @param {String} FALLBACK_PORT_SSL Fallback to ssl port for channel re-try.
 * @param {String} LONG_POLLING Fallback to non-ssl long-polling.
 * @param {String} LONG_POLLING_SSL Fallback to ssl port for long-polling.
 * @readOnly
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * The current socket opened state.
 * @attribute _channelOpen
 * @type Boolean
 * @private
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._channelOpen = false;

/**
 * The signaling server to connect to.
 * @attribute _signalingServer
 * @type String
 * @private
 * @component Socket
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
 * @component Socket
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
 * @component Socket
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
 * @component Socket
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
 * @component Socket
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
 * @component Socket
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
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen) {
    return;
  }

  var messageString = JSON.stringify(message);

  var sendLater = function(){
    if (self._socketMessageQueue.length > 0){

      if (self._socketMessageQueue.length<throughput){

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,self._socketMessageQueue.length),
            mid: self._user.sid,
            rid: self._room.id
          });

        self._socket.send({
          type: self._SIG_MESSAGE_TYPE.GROUP,
          lists: self._socketMessageQueue.splice(0,self._socketMessageQueue.length),
          mid: self._user.sid,
          rid: self._room.id
        });

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;

      }
      else{

        log.debug([(message.target ? message.target : 'server'), null, null,
          'Sending delayed message' + ((!message.target) ? 's' : '') + ' ->'], {
            type: self._SIG_MESSAGE_TYPE.GROUP,
            lists: self._socketMessageQueue.slice(0,throughput),
            mid: self._user.sid,
            rid: self._room.id
          });

        self._socket.send({
          type: self._SIG_MESSAGE_TYPE.GROUP,
          lists: self._socketMessageQueue.splice(0,throughput),
          mid: self._user.sid,
          rid: self._room.id
        });

        clearTimeout(self._socketMessageTimeout);
        self._socketMessageTimeout = null;
        self._socketMessageTimeout = setTimeout(sendLater,interval);

      }
      self._timestamp.now = Date.now() || function() { return +new Date(); };
    }
  };

  //Delay when messages are sent too rapidly
  if ((Date.now() || function() { return +new Date(); }) - self._timestamp.now < interval &&
    (message.type === self._SIG_MESSAGE_TYPE.STREAM ||
    message.type === self._SIG_MESSAGE_TYPE.UPDATE_USER ||
    message.type === self._SIG_MESSAGE_TYPE.ROOM_LOCK ||
    message.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO || 
    message.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO || 
    message.type === self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE)) {

      log.warn([(message.target ? message.target : 'server'), null, null,
      'Messages fired too rapidly. Delaying.'], {
        interval: 1000,
        throughput: 16,
        message: message
      });

      self._socketMessageQueue.push(messageString);

      if (!self._socketMessageTimeout){
        self._socketMessageTimeout = setTimeout(sendLater,
          interval - ((Date.now() || function() { return +new Date(); })-self._timestamp.now));
      }
      return;
  }

  log.debug([(message.target ? message.target : 'server'), null, null,
    'Sending to peer' + ((!message.target) ? 's' : '') + ' ->'], message);

  //Normal case when messages are sent not so rapidly
  self._socket.send(messageString);
  self._timestamp.now = Date.now() || function() { return +new Date(); };

};

/**
 * Create the socket object to refresh connection.
 * @method _createSocket
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._createSocket = function (url, options) {
  var self = this;

  options = options || {};

  if (self._socket) {
    self._socket.removeAllListeners('connect_error');
    self._socket.removeAllListeners('reconnect_attempt');
    self._socket.removeAllListeners('reconnect_error');
    self._socket.removeAllListeners('reconnect_failed');
    self._socket.removeAllListeners('connect');
    self._socket.removeAllListeners('reconnect');
    self._socket.removeAllListeners('error');
    self._socket.removeAllListeners('disconnect');
    self._socket.removeAllListeners('message');
    self._socket.disconnect();
    self._socket = null;
  }
  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', {
    url: url,
    useXDR: self._socketUseXDR,
    socketOptions: options.socketOptions
  });

  self._socket = io.connect(url, options.socketOptions);

  if (typeof options.connectErrorFn === 'function') {
    self._socket.on('connect_error', options.connectErrorFn);
  }

  if (typeof options.reconnectAttemptFn === 'function') {
    self._socket.on('reconnect_attempt', options.reconnectAttemptFn);
  }

  if (typeof options.reconnectErrorFn === 'function') {
    self._socket.on('reconnect_error', options.reconnectErrorFn);
  }

  if (typeof options.reconnectFailedFn === 'function') {
    self._socket.on('reconnect_failed', options.reconnectFailedFn);
  }

  var connectFn = function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  };

  self._socket.on('connect', connectFn);

  self._socket.on('reconnect', connectFn);

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
 * Create the default socket object connection.
 * @method _createDefaultSocket
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._createDefaultSocket = function () {
  var self = this;

  // create the sig url
  var ip_signaling = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  var socketOptions = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false,
    transports: ['websocket']
  };

  if (self._socketTimeout !== 0) {
    socketOptions.timeout = self._socketTimeout;
  }

  var connectErrorFn = function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED,
      error, self.SOCKET_FALLBACK.NON_FALLBACK);

    self._createFallbackSocket();
  };

  self._createSocket(ip_signaling, {
    socketOptions: socketOptions,
    connectErrorFn: connectErrorFn
  });
};

/**
 * Create the fallback socket object reconnection.
 * @method _createFallbackSocket
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._createFallbackSocket = function () {
  var self = this;

  var fallback = (self._signalingServerProtocol ===
    'https:') ? self.SOCKET_FALLBACK.FALLBACK_SSL_PORT :
    self.SOCKET_FALLBACK.FALLBACK_PORT;

  self._signalingServerPort = (self._signalingServerProtocol ===
    'https:') ? 3443 : 3000;

  // create the sig url
  var ip_signaling = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  var socketOptions = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false,
    transports: ['websocket']
  };

  if (self._socketTimeout !== 0) {
    socketOptions.timeout = self._socketTimeout;
  }

  var connectErrorFn = function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED,
      error, fallback);

    self._createLongpollingSocket();
  };

  self._createSocket(ip_signaling, {
    socketOptions: socketOptions,
    connectErrorFn: connectErrorFn
  });

  self._trigger('channelRetry', fallback, 0);
  self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
    1, fallback);
};

/**
 * Create the long-polling fallback socket object reconnection.
 * @method _createLongpollingSocket
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._createLongpollingSocket = function () {
  var self = this;

  var fallback = (self._signalingServerProtocol ===
    'https:') ? self.SOCKET_FALLBACK.LONG_POLLING_SSL :
    self.SOCKET_FALLBACK.LONG_POLLING;

  self._signalingServerPort = (self._signalingServerProtocol ===
    'https:') ? 443 : 80;

  // create the sig url
  var ip_signaling = self._signalingServerProtocol + '//' +
    self._signalingServer + ':' + self._signalingServerPort;

  var socketOptions = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: true,
    transports: ['xhr-polling', 'jsonp-polling', 'polling']
  };

  if (self._socketTimeout !== 0) {
    //socketOptions.reconnectionDelay = self._socketTimeout;
    socketOptions.timeout = self._socketTimeout;
  }

  var reconnectAttemptFn = function (attempt) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
      attempt, fallback);
    self._trigger('channelRetry', fallback, attempt);
  };

  var reconnectErrorFn = function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED,
      error, fallback);
  };

  var reconnectFailedFn = function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED,
      error, fallback);
  };

  self._createSocket(ip_signaling, {
    socketOptions: socketOptions,
    reconnectAttemptFn: reconnectAttemptFn,
    reconnectErrorFn: reconnectErrorFn,
    reconnectFailedFn: reconnectFailedFn
  });

  self._trigger('channelRetry', fallback, 0);
  self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
    1, fallback);
};

/**
 * Initiate a socket signaling connection.
 * @method _openChannel
 * @trigger channelMessage, channelOpen, channelError, channelClose
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as there is already an ongoing channel connection']);
    return;
  }

  if (self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready']);
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

  self._createDefaultSocket();
};

/**
 * Closes the socket signaling connection.
 * @method _closeChannel
 * @private
 * @component Socket
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  if (this._socket) {
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
    this._socket.disconnect();
    this._socket = null;
  }
  this._channelOpen = false;
  this._trigger('channelClose');
};
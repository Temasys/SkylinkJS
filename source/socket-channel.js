/**
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection failure states.
 * @attribute SOCKET_ERROR
 * @param {Number} CONNECTION_FAILED    <small>Value <code>0</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish with
 *   the Signaling server at the first attempt.
 * @param {Number} RECONNECTION_FAILED  <small>Value <code>-1</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish
 *   the Signaling server after the first attempt.
 * @param {Number} CONNECTION_ABORTED   <small>Value <code>-2</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of the first attempt in <code>CONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ABORTED <small>Value <code>-3</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of several attempts in <code>RECONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ATTEMPT <small>Value <code>-4</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection is attempting
 *   to reconnect with a new port or transport after the failure of attempts in
 *   <code>CONNECTION_FAILED</code> or <code>RECONNECTED_FAILED</code>.
 * @type JSON
 * @readOnly
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
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection reconnection states.
 * @attribute SOCKET_FALLBACK
 * @param {String} NON_FALLBACK      <small>Value <code>"nonfallback"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is at its initial state
 *   without transitioning to any new socket port or transports yet.
 * @param {String} FALLBACK_PORT     <small>Value <code>"fallbackPortNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} FALLBACK_PORT_SSL <small>Value <code>"fallbackPortSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING      <small>Value <code>"fallbackLongPollingNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using Polling transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING_SSL  <small>Value <code>"fallbackLongPollingSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using Polling transports to attempt to establish connection with Signaling server.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  FALLBACK_PORT_SSL: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * Function that starts the interval for sending buffered socket messages to the signaling server.
 * @method _startChannelMessageBufferInterval
 * @private
 * @for Skylink
 * @since 0.6.26
 */
Skylink.prototype._startChannelMessageBufferInterval = function () {
  var self = this;
  var checkFn = function () {
    // Clear outdated broadcasted messages.
    for (var i = 0; i < self._socketMessageQueue.broadcast.length; i++) {
      var message = self._socketMessageQueue.broadcast[i];

      if ([
        self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
        self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        self._SIG_MESSAGE_TYPE.UPDATE_USER].indexOf(message.type) === -1) {
        continue; 
      }

      if (!(typeof self._peerMessagesStamps.self[message.type] === 'number' &&
        self._peerMessagesStamps.self[message.type] < message.stamp)) {
        self._socketMessageQueue.splice(i, 1)[0][1](null);
        i--;
      }
    }

    // Clear buffer if it is no longer active state.
    if (!(self._user && self._user.sid) || !self._channelOpen || !self._socket) {
      var invalidStateError = 'Socket connection is not opened or is at incorrect step';

      self._socketMessageQueue.broadcast.concat(self._socketMessageQueue.target).forEach(function (item) {
        log.warn([item[0].target || 'Server', 'Socket', item[0].type, 'Dropping queued message as session has ended ->'], item[0]);
        item[1](new Error(invalidStateError));
      });

      self._socketMessageQueue.broadcast = [];
      self._socketMessageQueue.target = [];
      return true;
    }
  };

  if (self._socketMessageTimeout) {
    clearTimeout(self._socketMessageTimeout);
  }

  if (checkFn()) {
    return;
  }

  self._socketMessageTimeout = setTimeout(function () {
    var now = Date.now();

    if (checkFn()) {
      return;
    }

    if (self._socketMessageQueue.target.length > 0) {
      if ((now - self._socketMessageTimestamp) > 100) {
        var item = self._socketMessageQueue.target.splice(0, 0);
        self._sendChannelMessageToSig(item[0], item[1]);
      }
      return;
    }

    if (self._socketMessageQueue.broadcast.length === 0) {
      return;
    }

    if ((now - self._socketMessageTimestamp) > 1000) {
      var list = self._socketMessageQueue.broadcast.splice(0, 16);
      var messages = [];
      var callbacks = [];

      list.forEach(function (item) {
        messages.push(JSON.stringify(item[0]));
        callbacks.push(item[1]);
      });

      self._sendChannelMessageToSig({
        type: self._SIG_MESSAGE_TYPE.GROUP,
        lists: messages,
        mid: self._user.sid,
        rid: self._room.id
      }, function (error) {
        callbacks.forEach(function (callback) {
          callback(error);
        });
      });
    }

  }, self._socketMessageQueue.target.length > 0 ? 100 : 1000);
};

/**
 * Function that sends the socket message to the signaling server.
 * @method _sendChannelMessageToSig
 * @private
 * @for Skylink
 * @since 0.6.26
 */
Skylink.prototype._sendChannelMessageToSig = function (message, callback) {
  var self = this;
  var now = Date.now();

  self._startChannelMessageBufferInterval();

  if (!self._channelOpen || !self._socket || !self._user) {
    var notOpenError = 'Socket connection is not opened or is at incorrect step';
    log.warn([message.target || 'Server', 'Socket', message.type, 'Dropping message as ' + notOpenError + ' ->'], message);
    return callback(new Error(notOpenError));
  }

  try {
    log.debug([message.target || 'Server', 'Socket', message.type, 'Sending message ->'], message);

    self._socketMessageTimestamp = now + (self._socketLatency.latency > 50 ? self._socketLatency.latency : 150);
    self._socket.send(JSON.stringify(message));

    if ([
      self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
      self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
      self._SIG_MESSAGE_TYPE.UPDATE_USER

    ].indexOf(message.type) > -1) {
      self._peerMessagesStamps.self = self._peerMessagesStamps.self || {};      
      self._peerMessagesStamps.self[message.type] = message.stamp;

    } else if (message.userInfo) {
      self._peerMessagesStamps.self = self._peerMessagesStamps.self || {};      
      self._peerMessagesStamps.self[self._SIG_MESSAGE_TYPE.MUTE_AUDIO] = now;
      self._peerMessagesStamps.self[self._SIG_MESSAGE_TYPE.MUTE_VIDEO] = now;
      self._peerMessagesStamps.self[self._SIG_MESSAGE_TYPE.UPDATE_USER] = now;
    }

    callback(null);

  } catch (error) {
    log.error([message.target || 'Server', 'Socket', message.type, 'Failed sending message ->'], {
      message: message,
      error: error
    });
    callback(error);
  }
};

/**
 * Function that sends or buffers a socket message.
 * @method _sendChannelMessage
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message, callback) {
  var self = this;
  var now = Date.now();

  callback = callback || function () {};

  if ([
    self._SIG_MESSAGE_TYPE.JOIN_ROOM,
    self._SIG_MESSAGE_TYPE.ENTER,
    self._SIG_MESSAGE_TYPE.WELCOME,
    self._SIG_MESSAGE_TYPE.RESTART,
    self._SIG_MESSAGE_TYPE.OFFER,
    self._SIG_MESSAGE_TYPE.ANSWER,
    self._SIG_MESSAGE_TYPE.CANDIDATE,
    self._SIG_MESSAGE_TYPE.END_OF_CANDIDATES,
    self._SIG_MESSAGE_TYPE.GET_PEERS,
    self._SIG_MESSAGE_TYPE.INTRODUCE,
    self._SIG_MESSAGE_TYPE.START_RECORDING,
    self._SIG_MESSAGE_TYPE.STOP_RECORDING

  ].indexOf(message.type) > -1) {
    return self._sendChannelMessageToSig(message, callback);
  }

  // Send for "100ms"
  if (message.type === self._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE && (now - self._socketMessageTimestamp) > 100) {
    return self._sendChannelMessageToSig(message, callback);
  }

  // Send for "800ms"
  if ([
    self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
    self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
    self._SIG_MESSAGE_TYPE.UPDATE_USER,
    self._SIG_MESSAGE_TYPE.STREAM,
    self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE,
    self._SIG_MESSAGE_TYPE.ROOM_LOCK

  ].indexOf(message.type) > -1 && (now - self._socketMessageTimestamp) > 1000) {
    return self._sendChannelMessageToSig(message, callback);
  }

  // Queue "private" message
  if (message.type === self._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE) {
    self._socketMessageQueue.target.push([message, callback]);

  } else if ([
    self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
    self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
    self._SIG_MESSAGE_TYPE.UPDATE_USER,
    self._SIG_MESSAGE_TYPE.STREAM,
    self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE

  ].indexOf(message.type) > -1) {
    self._socketMessageQueue.broadcast.push([message, callback]);

  } else if (message.type === self._SIG_MESSAGE_TYPE.ROOM_LOCK) {
    return callback(new Error('Dropping from sending Room lock signal to prevent messaging overflow.'));

  } else {
    return callback(new Error('Dropping unknown message type "' + message.type + '".'));
  }

  self._startChannelMessageBufferInterval();
};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (joinRoomTimestamp) {
  var self = this;

  self._closeChannel();

  var ports = self._socketPorts[self._signalingServerProtocol];
  var transports = self._socketTransports;
  var fallbackType = self._socketSessionFallbackType;
  var isFinalAttempt = false;
  var current = {
    serverUrl: self._socketSession.serverUrl,
    transportType: self._signalingServerTransport || null,
    attempts:  self._socketSession.attempts,
    finalAttempts: self._socketSession.finalAttempts,
    socketOptions: self._socketSession.socketOptions
  };

  if (!self._socketSessionFallbackType) {
    self._socketSessionFallbackType = fallbackType = self.SOCKET_FALLBACK.NON_FALLBACK;
  } else {
    self._socketSessionFallbackType = fallbackType = current.transportType === 'websocket' ?
      (self._signalingServerProtocol === 'https:' ? self.SOCKET_FALLBACK.FALLBACK_PORT_SSL : self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (self._signalingServerProtocol === 'https:' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL : self.SOCKET_FALLBACK.LONG_POLLING);
  }

  if (self._socketServer && typeof self._socketServer === 'string') {
    isFinalAttempt = true;
    self._socketSession.serverUrl = current.serverUrl = self._socketServer;
    self._socketSession.socketOptions = current.socketOptions = {
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 1000,
      randomizationFactor: 0.5,
      timeout: self._socketTimeout,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: true
    };

    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('channelRetry', fallbackType, current.attempts, current);
    }

  } else {
    if (ports.indexOf(self._signalingServerPort) === (ports.length - 1)) {
      if (transports.indexOf(self._signalingServerTransport) === (transports.length - 1)) {
        self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
          'there no more available ports, transports and final attempts left.'), fallbackType, current);
        return;
      }

      if (current.transportType === 'websocket') {
        self._socketSessionFallbackType = fallbackType = self._signalingServerProtocol === 'https:' ?
          self.SOCKET_FALLBACK.LONG_POLLING_SSL : self.SOCKET_FALLBACK.LONG_POLLING;
      }

      self._signalingServerTransport = current.transportType = transports[ transports.indexOf(self._signalingServerTransport) + 1 ];
    }

    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
    self._socketSession.attempts = current.attempts = 0;
    self._socketSession.finalAttempts = current.finalAttempts = 0;
    self._socketSession.serverUrl = current.serverUrl = self._signalingServerProtocol + '//' + self._signalingServer + ':' + self._signalingServerPort + '?rand=' + Date.now();

    isFinalAttempt = ports[ ports.indexOf(self._signalingServerPort) + 1 ] === (ports.length - 1) &&
      transports[ transports.indexOf(self._signalingServerTransport) + 1 ] === (transports.length - 1);

    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('channelRetry', fallbackType, current.attempts, current);
    }

    self._socketSession.socketOptions = current.socketOptions = {
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: self._signalingServerTransport === 'websocket' ? 2 : (isFinalAttempt ? 8 : 4),
      reconnectionDelay: 1000,
      reconnectionDelayMax: self._signalingServerTransport === 'websocket' ? 4000 : 1000,
      randomizationFactor: 0.5,
      timeout: self._socketTimeout,
      transports: [self._signalingServerTransport],
      autoConnect: true,
      forceNew: true
    };
  }

  var socket = null;

  log.log('Opening channel with signaling server url ->', current);

  try {
    socket = io.connect(current.serverUrl, current.socketOptions);

  } catch (error) {
    log.error('Failed creating socket connection object ->', error);

    if (isFinalAttempt) {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Connection aborted as ' +
        'there no more available ports, transports and final attempts left.'), fallbackType, current);
      return;
    }

    self._trigger('socketError', self.SOCKET_ERROR[fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK ?
      'CONNECTION_FAILED' : 'RECONNECTION_FAILED'], error, fallbackType, current);
    self._createSocket(joinRoomTimestamp);
    return;
  }

  var onOpenCbFn = function () {
    if (!self._channelOpen) {
      log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', current);
    }
  };

  socket.on('connect', onOpenCbFn);
  socket.on('reconnect', onOpenCbFn);

  socket.on('disconnect', function () {
    if (self._channelOpen) {
      self._channelOpen = false;
      self._trigger('channelClose', current);
      log.log([null, 'Socket', null, 'Channel closed']);

      if (self._inRoom && self._user && self._user.sid) {
        self.leaveRoom(false);
        self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
      }
    }
  });

  socket.on('error', function(error) {
    if (error ? error.message.indexOf('xhr poll error') > -1 : false) {
      log.error([null, 'Socket', null, 'XHR poll connection unstable. Disconnecting.. ->'], error);
      self._closeChannel();
      return;
    }
    log.error([null, 'Socket', null, 'Exception occurred ->'], error);
    self._trigger('channelError', error, current);
  });

  socket.on('reconnect_failed', function () {
    self._trigger('socketError', self.SOCKET_ERROR[fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK ?
      'CONNECTION_FAILED' : 'RECONNECTION_FAILED'], new Error('Failed connection with transport "' +
      current.transportType + '" and port ' + self._signalingServerPort + '.'), fallbackType, current);

    if (isFinalAttempt) {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
        'there no more available ports, transports and final attempts left.'), fallbackType, current);
      return;
    }

    self._createSocket(joinRoomTimestamp);
  });

  socket.on('connect_error', function () {
    if (current.attempts > 0) {
      return;
    }
  });
  socket.on('reconnect_error', function (error) {});

  socket.on('reconnect_attempt', function () {
    if (current.attempts === 4 && isFinalAttempt) {
      self._socketSession.finalAttempts = current.finalAttempts = current.finalAttempts++;
    } else {
      self._socketSession.attempts = current.attempts = current.attempts + 1;
    }

    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT, null, fallbackType, current);
    self._trigger('channelRetry', fallbackType, current.attempts, current);
  });

  socket.on('ping', function () {
    self._socketLatency.pingTimestamp = Date.now();
  });

  socket.on('pong', function (latency) {
    self._socketLatency.pongTimestamp = Date.now();
    self._socketLatency.latency = latency || 0;
    self._trigger('socketLatency', self._socketLatency.pingTimestamp, self._socketLatency.pongTimestamp, latency);
  });

  socket.on('message', function(messageStr) {
    var message = JSON.parse(messageStr);

    log.log([message.mid || 'Server', 'Socket', message.type, 'Received message ->'], message);

    if (message.type === self._SIG_MESSAGE_TYPE.GROUP) {
      (Array.isArray(message.lists) ? message.lists : []).forEach(function (messageItem) {
        log.log([messageItem.mid || 'Server', 'Socket', messageItem.type, 'Received grouped message item ->'], messageItem);
        self._trigger('channelMessage', messageItem, current);
        self._processSigMessage(messageItem);
      });
      return;
    }

    self._trigger('channelMessage', message, current);
    self._processSigMessage(message);
  });

  self._joinRoomManager.socketsFn.push(function (currentJoinRoomTimestamp) {
    if (currentJoinRoomTimestamp !== joinRoomTimestamp) {
      socket.disconnect();
    }
  });

  self._socket = socket;
};

/**
 * Function that starts the socket connection to the Signaling.
 * This starts creating the socket connection and called at first not when requiring to fallback.
 * @method _openChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function(joinRoomTimestamp) {
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
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  self._signalingServer = 'signaling-1.temasys.io';
  self._socketSession.finalAttempts = 0;
  self._socketSession.attempts = 0;
  self._signalingServerPort = null;
  self._socketSessionFallbackType = null;
  self._signalingServerTransport = !window.WebSocket ? 'polling' : 'websocket';

  if (self._socketServer && typeof self._socketServer === 'object') {
    self._signalingServer = self._socketServer.url;
    self._signalingServerProtocol = self._socketServer.protocol ? self._socketServer.protocol : self._signalingServerProtocol;

    if (Array.isArray(self._socketServer.ports) && self._socketServer.ports.length > 0) {
      self._socketPorts = {
        'http:': self._socketServer.ports,
        'https:': self._socketServer.ports
      };
    }
  }

  // Begin with a websocket connection
  self._createSocket(joinRoomTimestamp);
};

/**
 * Function that stops the socket connection to the Signaling.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (this._socket) {
    this._socket.removeAllListeners();
  }

  if (this._socketMessageTimeout) {
    clearTimeout(this._socketMessageTimeout);
  }

  this._socketMessageTimestamp = 0;
  this._socketMessageQueue.broadcast = [];
  this._socketMessageQueue.target = [];

  if (this._channelOpen) {
    if (this._socket) {
      this._socket.disconnect();
    }

    log.log([null, 'Socket', null, 'Channel closed']);

    this._channelOpen = false;
    this._trigger('channelClose', clone(this._socketSession));

    if (this._inRoom && this._user && this._user.sid) {
      this.leaveRoom(false);
      this._trigger('sessionDisconnect', this._user.sid, this.getPeerInfo());
    }
  }

  this._socket = null;
};
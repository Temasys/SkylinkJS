/**
 * Function that starts sending the buffered messages to the signaling server.
 * @method _sendChannelMessageQueue
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._sendChannelMessageQueue = function() {
  var self = this;
  var userId = self._user && self._user.sid;
  var lastSentDiff = Date.now() - (self._timestamp.socketMessage || 0);
  var timeout = 0;
  // The interval for broadcasted messages is 1000 per interval.
  var broadcastInterval = 1000;
  // The interval for targeted messages is 100 per interval.
  var targetInterval = 100;
  // Set a minimum latency of 150 for safer purposes.
  var latency = self._socketLatency > 150 ? self._socketLatency : 150;

  // Remove any existing timeout intervals to replace with a new one later.
  if (self._socketMessageInterval) {
    clearTimeout(self._socketMessageInterval);
  }

  // Reset the status timestamps to 0.
  if (!self._peerMessagesStamps.self) {
    self._peerMessagesStamps.self = {};
    self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.UPDATE_USER ] = 0;
    self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.MUTE_AUDIO ] = 0;
    self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.MUTE_VIDEO ] = 0;
  }

  // Function that sends the message to the signaling server.
  var sendToServer = function (message, callback) {
    // Ensure that socket connection is open and available before sending any messages.
    if (!(self._channelOpen && self._socket)) {
      log.warn([message.target || 'Server', 'Socket', message.type,
        'Dropping of message as Socket connection is not opened or is at incorrect step ->'], message);
      callback(new Error('Message failed to be sent as socket is not opened'));
      return;
    }

    self._socket.send(JSON.stringify(message));
    self._timestamp.socketMessage = Date.now();
    self._sendChannelMessageQueue();
    callback(null);

    // If user tampers with the SDK and sends self a "bye" message.
    if (message.type === self._SIG_MESSAGE_TYPE.BYE && message.mid === userId) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', userId, self.getPeerInfo());
    }
  };

  // FORMAT for each message item: [message, callback].
  // Send messages in the priority queue first.
  if (self._socketMessageQueue.priority.length) {
    self._socketMessageInterval = setTimeout(function () {
      var currentTime = Date.now();
      var queueItem = self._socketMessageQueue.priority.splice(0, 1)[0];
      var message = queueItem[0];
      var callback = queueItem[1];

      // Drop roomLockEvent if it is sent too quickly before the required interval timeout and feedback to user.
      if (message.type === self._SIG_MESSAGE_TYPE.ROOM_LOCK &&
        (currentTime - (self._timestamp.socketMessage || 0)) < (latency + broadcastInterval)) {
        log.warn(['Server', 'Socket', message.type, 'Dropping room lock event message ->'], message);
        self._sendChannelMessageQueue();
        callback(new Error('Failed sending room lock event as it is sent too quickly'));
        return;
      }

      // Update the status timestamps as the up-to-date info (with "userInfo") are sent in these messages.
      if ([
        self._SIG_MESSAGE_TYPE.ENTER,
        self._SIG_MESSAGE_TYPE.WELCOME,
        self._SIG_MESSAGE_TYPE.RESTART,
        self._SIG_MESSAGE_TYPE.OFFER,
        self._SIG_MESSAGE_TYPE.ANSWER
      ].indexOf(message.type) > -1) {
        self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.UPDATE_USER ] = currentTime;
        self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.MUTE_AUDIO ] = currentTime;
        self._peerMessagesStamps.self[ self._SIG_MESSAGE_TYPE.MUTE_VIDEO ] = currentTime;
        self._socketMessageQueue.status = {};
      }

      sendToServer(message, callback);
    }, timeout);

  // Send the targeted messages second if it is the first item in the normal queue.
  // Make sure there are no status messages in the current queue first since status should be sent first.
  } else if (self._socketMessageQueue.normal.length && self._socketMessageQueue.normal[0][0].target &&
    !Object.keys(self._socketMessageQueue.status).length) {
    timeout = latency + targetInterval;
    // Make the timeout interval 0 if it has already passed the time.
    timeout = lastSentDiff > timeout ? 0 : timeout;

    self._socketMessageInterval = setTimeout(function () {
      var queueItem = self._socketMessageQueue.normal.splice(0, 1)[0];
      var message = queueItem[0];
      var callback = queueItem[1];

      sendToServer(message, callback);
    }, timeout);

  // Send then the first 16 other broadcasted messages in the normal queue.
  } else if (self._socketMessageQueue.normal.length || Object.keys(self._socketMessageQueue.status).length) {
    timeout = latency + broadcastInterval;
    // Make the timeout interval 0 if it has already passed the time.
    timeout = lastSentDiff > timeout ? 0 : timeout;

    self._socketMessageInterval = setTimeout(function () {
      var messages = [];
      var callbacks = [];

      // Append the status messages to the batch first.
      Object.keys(self._socketMessageQueue.status).forEach(function (messageType) {
        var statusItem = self._socketMessageQueue.status[messageType];
        var message = statusItem[0];
        var callback = statusItem[1];

        // Append only if the status is not outdated.
        if (self._peerMessagesStamps.self[messageType] >= message.stamp) {
          return;
        }

        self._peerMessagesStamps.self[messageType] = message.stamp;
        messages.push(JSON.stringify(message));
        callbacks.push(callback)
      });

      // Reset the statuses messages buffer.
      self._socketMessageQueue.status = {};

      for (var i = 0; i < self._socketMessageQueue.normal.length; i++) {
        var queueItem = self._socketMessageQueue.normal[i];
        var message = queueItem[0];
        var callback = queueItem[1];

        // Ignore the targeted messages since they cannot be grouped since "group" is a broadcasted message.
        if (message.target) {
          continue;
        }

        // The limit for the list is 16 messages in a grouped message.
        if (messages.length === 16) {
          break;
        }

        messages.push(JSON.stringify(message));
        callbacks.push(callback);
        self._socketMessageQueue.normal.splice(i, 1);
        i--;
      }

      sendToServer({
        type: self._SIG_MESSAGE_TYPE.GROUP,
        lists: messages,
        mid: userId,
        rid: self._room && self._room.id

      }, function (error) {
        callbacks.forEach(function (callback) {
          callback(error);
        });
      });
    }, timeout);
  }
};

/**
 * Function that queues the SM protocol messages to a buffer.
 * @method _sendChannelMessage
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message, callback) {
  var self = this;
  callback = callback || function () {};

  // Ensure that socket connection is open and available before sending any messages.
  if (!(self._channelOpen && self._socket)) {
    log.warn([message.target || 'Server', 'Socket', message.type,
      'Dropping of message as Socket connection is not opened or is at incorrect step ->'], message);
    callback(new Error('Message failed to be sent as socket is not opened'));
    return;
  }

  // Start buffering statuses messages that would be dropped from the signaling server when sent too quickly.
  if ([
    self._SIG_MESSAGE_TYPE.UPDATE_USER,
    self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
    self._SIG_MESSAGE_TYPE.MUTE_VIDEO].indexOf(message.type) > -1) {
    // Set these statuses type of messages with the stamps if they are not set - which they should have been.
    message.stamp = Date.now();
    // We are ignoring previous callbacks for status types of messages because it just needs the latest status.
    self._socketMessageQueue.status[message.type] = [message, callback];

  // Start buffering messages that would be dropped from the signaling server when sent too quickly.
  } else if (self._GROUP_MESSAGE_LIST.indexOf(message.type) > -1 || message.type === self._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE) {
    self._socketMessageQueue.normal.push([message, callback]);

  // Start buffering priority lane messages.
  } else {
    self._socketMessageQueue.priority.push([message, callback]);
  }

  self._sendChannelMessageQueue();
};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type, joinRoomTimestamp) {
  var self = this;
  var options = {
    forceNew: true,
    reconnection: true,
    timeout: self._initOptions.socketTimeout,
    reconnectionAttempts: 2,
    reconnectionDelayMax: 5000,
    reconnectionDelay: 1000,
    transports: ['websocket']
  };
  var ports = self._initOptions.socketServer && typeof self._initOptions.socketServer === 'object' && Array.isArray(self._initOptions.socketServer.ports) &&
    self._initOptions.socketServer.ports.length > 0 ? self._initOptions.socketServer.ports : self._socketPorts[self._signalingServerProtocol];
  var fallbackType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    fallbackType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if (ports.indexOf(self._signalingServerPort) === ports.length - 1 || typeof self._initOptions.socketServer === 'string') {
    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      type = 'Polling';
      self._signalingServerPort = ports[0];
    } else {
      self._socketSession.finalAttempts++;
    }
  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  if (type === 'Polling') {
    options.reconnectionDelayMax = 1000;
    options.reconnectionAttempts = 4;
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  var url = self._signalingServerProtocol + '//' + self._signalingServer + ':' + self._signalingServerPort + '?rand=' + Date.now();
  var retries = 0;

  if (self._initOptions.socketServer) {
    // Provided as string, make it as just the fixed server
    url = typeof self._initOptions.socketServer === 'string' ? self._initOptions.socketServer :
      (self._initOptions.socketServer.protocol ? self._initOptions.socketServer.protocol : self._signalingServerProtocol) + '//' +
      self._initOptions.socketServer.url + ':' + self._signalingServerPort;
  }

  self._socketSession.transportType = type;
  self._socketSession.socketOptions = options;
  self._socketSession.socketServer = url;

  if (fallbackType === null) {
    fallbackType = self._signalingServerProtocol === 'http:' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING : self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL : self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);

    self._socketSession.attempts++;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT, null, fallbackType, clone(self._socketSession));
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, clone(self._socketSession));
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._closeChannel();
  }

  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', clone(self._socketSession));

  var socket = null;

  try {
    socket = io.connect(url, options);
  } catch (error){
    log.error('Failed creating socket connection object ->', error);
    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, error, fallbackType, clone(self._socketSession));
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, error, fallbackType, clone(self._socketSession));
    }
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
      'there no more available ports, transports and final attempts left.'), fallbackType, clone(self._socketSession));
    return;
  }

  socket.on('reconnect_attempt', function (attempt) {
    retries++;
    self._socketSession.attempts++;
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, clone(self._socketSession));
  });

  socket.on('reconnect_failed', function () {
    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, new Error('Failed connection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, clone(self._socketSession));
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, new Error('Failed reconnection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, clone(self._socketSession));
    }

    if (self._socketSession.finalAttempts < 2) {
      self._createSocket(type, joinRoomTimestamp);
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
        'there no more available ports, transports and final attempts left.'), fallbackType, clone(self._socketSession));
    }
  });

  socket.on('connect', function () {
    if (!self._channelOpen) {
      log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', clone(self._socketSession));
    }
  });

  socket.on('reconnect', function () {
    if (!self._channelOpen) {
      log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', clone(self._socketSession));
    }
  });

  socket.on('error', function(error) {
    if (error ? error.message.indexOf('xhr poll error') > -1 : false) {
      log.error([null, 'Socket', null, 'XHR poll connection unstable. Disconnecting.. ->'], error);
      self._closeChannel();
      return;
    }
    log.error([null, 'Socket', null, 'Exception occurred ->'], error);
    self._trigger('channelError', error, clone(self._socketSession));
  });

  socket.on('disconnect', function() {
    if (self._channelOpen) {
      self._channelOpen = false;
      self._trigger('channelClose', clone(self._socketSession));
      log.log([null, 'Socket', null, 'Channel closed']);

      if (self._inRoom && self._user && self._user.sid) {
        self.leaveRoom(false);
        self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
      }
    }
  });

  socket.on('pong', function (latency) {
    self._socketLatency = latency || 0;
  });

  socket.on('message', function(messageStr) {
    var message = JSON.parse(messageStr);

    log.log([null, 'Socket', null, 'Received message ->'], message);

    if (message.type === self._SIG_MESSAGE_TYPE.GROUP) {
      log.debug('Bundle of ' + message.lists.length + ' messages');
      for (var i = 0; i < message.lists.length; i++) {
        var indiMessage = JSON.parse(message.lists[i]);
        self._processSigMessage(indiMessage);
        self._trigger('channelMessage', indiMessage, clone(self._socketSession));
      }
    } else {
      self._processSigMessage(message);
      self._trigger('channelMessage', message, clone(self._socketSession));
    }
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
  if (self._initOptions.forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  var socketType = 'WebSocket';

  // For IE < 9 that doesn't support WebSocket
  if (!window.WebSocket) {
    socketType = 'Polling';
  }

  self._socketSession.finalAttempts = 0;
  self._socketSession.attempts = 0;
  self._signalingServerPort = null;

  // Begin with a websocket connection
  self._createSocket(socketType, joinRoomTimestamp);
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
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
  }

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
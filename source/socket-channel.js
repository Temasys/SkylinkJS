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
 * The signaling server port to connect to.
 * @attribute _signalingServerPort
 * @type String
 * @private
 * @since 0.5.2
 */
Skylink.prototype._signalingServerPort = null;

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
  this._log(this.LOG_LEVEL.DEBUG, {
    target: (message.target ? message.target : 'server'),
    log: 'Sending to peer' + ((!message.target) ? 's' : '') + ' -> '
  }, message.type);
  this._socket.send(messageString);
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
  self._signalingServerPort = (window.location.protocol === 'https:' ? '443' : '80');
  var ip_signaling = window.location.protocol + '//' + self._signalingServer +
    ':' + self._signalingServerPort;

  self._log(self.LOG_LEVEL.TRACE, 'Opening channel with signaling server url: ', ip_signaling);

  self._socket = io.connect(ip_signaling, {
    forceNew: true,
    transports: ['websocket']
  });
  self._socket.on('connect', function() {
    self._channelOpen = true;
    self._trigger('channelOpen');
    self._log(self.LOG_LEVEL.TRACE, {
      interface: 'Socket',
      log: 'Channel opened'
    });
  });
  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    self._log(self.LOG_LEVEL.ERROR, {
      interface: 'Socket',
      log: 'Exception occurred: '
    }, error);
  });
  self._socket.on('disconnect', function() {
    self._trigger('channelClose');
    self._log(self.LOG_LEVEL.TRACE, {
      interface: 'Socket',
      log: 'Channel closed'
    });
  });
  self._socket.on('message', function(message) {
    self._log(self.LOG_LEVEL.TRACE, {
      interface: 'Socket',
      log: 'Received message'
    });
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
/**
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>0.1.1</code>
 * </blockquote>
 * The value of the current version of the Signaling socket message protocol.
 * @attribute SM_PROTOCOL_VERSION
 * @type String
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.1';

/**
 * Stores the list of socket messaging protocol types.
 * See confluence docs for the list based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  RESTART: 'restart',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
  MUTE_VIDEO: 'muteVideoEvent',
  MUTE_AUDIO: 'muteAudioEvent',
  PUBLIC_MESSAGE: 'public',
  PRIVATE_MESSAGE: 'private',
  STREAM: 'stream',
  GROUP: 'group',
  GET_PEERS: 'getPeers',
  PEER_LIST: 'peerList',
  INTRODUCE: 'introduce',
  INTRODUCE_ERROR: 'introduceError',
  APPROACH: 'approach'
};

/**
 * Stores the flag if MCU environment is enabled.
 * @attribute _hasMCU
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @attribute _groupMessageList
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._groupMessageList = [
  Skylink.prototype._SIG_MESSAGE_TYPE.STREAM,
  Skylink.prototype._SIG_MESSAGE_TYPE.UPDATE_USER,
  Skylink.prototype._SIG_MESSAGE_TYPE.ROOM_LOCK,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_AUDIO,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_VIDEO,
  Skylink.prototype._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
];

/**
 * Stores the flag that indicates if MCU is available in the Room.
 * If App Key enables MCU but this is false, this means likely there are problems connecting to the MCU server.
 * @attribute _hasMCU
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;


/**
 * Stores the flag that indicates if User should only receive Stream from Peer connections but
 *   do not send User's Stream to Peer connections.
 * @attribute _receiveOnly
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._receiveOnly = false;

/**
 * Function that sends a message to Peers via the Signaling socket connection.
 * @method sendMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.sendMessage("Hi all!");
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty.push(peerId);
 *     }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     skylinkDemo.sendMessage(message, peersInExclusiveParty);
 *   }
 * @trigger <ol class="desc-seq">
 *   <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers parameter payload
 *   <code>message.isDataChannel</code> value as <code>false</code>.</li></ol>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var params = {
    cid: this._key,
    data: message,
    mid: this._user.sid,
    rid: this._room.id,
    type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
  };

  var listOfPeers = Object.keys(this._peerConnections);
  var isPrivate = false;
  var i;

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!isPrivate) {
    log.log([null, 'Socket', null, 'Broadcasting message to peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  }

  for (i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    // Ignore MCU peer
    if (peerId === 'MCU') {
      continue;
    }

    if (isPrivate) {
      log.log([peerId, 'Socket', null, 'Sending message to peer']);

      this._sendChannelMessage({
        cid: this._key,
        data: message,
        mid: this._user.sid,
        rid: this._room.id,
        target: peerId,
        type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE
      });
    }
  }

  this._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId,
    isDataChannel: false,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};

/**
 * Function that process and parses the socket message string received from the Signaling.
 * @method _processSigMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(JSON.parse(message.lists[i]));
    }
  } else {
    this._processSingleMessage(message);
  }
};

/**
 * Function that handles and processes the socket message received.
 * @method _processingSingleMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Received from peer ->'], message.type);
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, null, null, 'Ignoring message ->'], message.type);
    return;
  }
  switch (message.type) {
  //--- BASIC API Messages ----
  case this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE:
    this._publicMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE:
    this._privateMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.IN_ROOM:
    this._inRoomHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ENTER:
    this._enterHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.WELCOME:
    this._welcomeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RESTART:
    this._restartHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.OFFER:
    this._offerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER:
    this._answerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.CANDIDATE:
    this._candidateHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.BYE:
    this._byeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.REDIRECT:
    this._redirectHandler(message);
    break;
    //--- ADVANCED API Messages ----
  case this._SIG_MESSAGE_TYPE.UPDATE_USER:
    this._updateUserEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_VIDEO:
    this._muteVideoEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_AUDIO:
    this._muteAudioEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.STREAM:
    this._streamEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PEER_LIST:
    this._peerListEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.INTRODUCE_ERROR:
    this._introduceErrorEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.APPROACH:
    this._approachEventHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Function that handles the "peerList" socket message received.
 * See confluence docs for the "peerList" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _peerListEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerListEventHandler = function(message){
  var self = this;
  self._peerList = message.result;
  log.log(['Server', null, message.type, 'Received list of peers'], self._peerList);
  self._trigger('getPeersStateChange',self.GET_PEERS_STATE.RECEIVED, self._user.sid, self._peerList);
};

/**
 * Function that handles the "introduceError" socket message received.
 * See confluence docs for the "introduceError" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _introduceErrorEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._introduceErrorEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Introduce failed. Reason: '+message.reason]);
  self._trigger('introduceStateChange',self.INTRODUCE_STATE.ERROR, self._user.sid,
    message.sendingPeerId, message.receivingPeerId, message.reason);
};

/**
 * Function that handles the "approach" socket message received.
 * See confluence docs for the "approach" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _approachEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._approachEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Approaching peer'], message.target);
  // self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  // self._inRoom = true;
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo(),
    receiveOnly: self._receiveOnly,
    sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
    target: message.target,
    weight: self._peerPriorityWeight
  });
};

/**
 * Function that handles the "redirect" socket message received.
 * See confluence docs for the "redirect" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _redirectHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });

  if (message.action === this.SYSTEM_ACTION.REJECT) {
  	for (var key in this._peerConnections) {
  		if (this._peerConnections.hasOwnProperty(key)) {
  			this._removePeer(key);
  		}
  	}
  }

  // Handle the differences provided in Signaling server
  if (message.reason === 'toClose') {
    message.reason = 'toclose';
  }

  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Function that handles the "updateUserEvent" socket message received.
 * See confluence docs for the "updateUserEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _updateUserEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._updateUserEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer updated userData:'], message.userData);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid,
      this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "roomLockEvent" socket message received.
 * See confluence docs for the "roomLockEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _roomLockEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid,
    this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "muteAudioEvent" socket message received.
 * See confluence docs for the "muteAudioEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteAudioEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteAudioEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s audio muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('peerUpdated', targetMid,
      this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "muteVideoEvent" socket message received.
 * See confluence docs for the "muteVideoEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteVideoEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteVideoEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s video muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('peerUpdated', targetMid,
      this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "stream" socket message received.
 * See confluence docs for the "stream" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _streamEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid]) {

  	if (message.status === 'ended') {
  		this._trigger('streamEnded', targetMid, this.getPeerInfo(targetMid),
        false, message.sessionType === 'screensharing');

      if (this._peerConnections[targetMid]) {
        this._peerConnections[targetMid].hasStream = false;
        if (message.sessionType === 'screensharing') {
          this._peerConnections[targetMid].hasScreen = false;
        }
      } else {
        log.log([targetMid, null, message.type, 'Peer connection not found']);
      }
  	}

  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "bye" socket message received.
 * See confluence docs for the "bye" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _byeHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  var selfId = (this._user || {}).sid;

  if (selfId !== targetMid){
    log.log([targetMid, null, message.type, 'Peer has left the room']);
    this._removePeer(targetMid);
  } else {
    log.log([targetMid, null, message.type, 'Self has left the room']);
  }
};

/**
 * Function that handles the "private" socket message received.
 * See confluence docs for the "private" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _privateMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received private message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: true,
    targetPeerId: message.target, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "public" socket message received.
 * See confluence docs for the "public" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _publicMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received public message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: false,
    targetPeerId: null, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "inRoom" socket message received.
 * See confluence docs for the "inRoom" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _inRoomHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._inRoomHandler = function(message) {
  var self = this;
  log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = (new Date()).getTime();

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  if (typeof message.tieBreaker === 'number') {
    self._peerPriorityWeight = message.tieBreaker;
  }

  // Make Firefox the answerer always when connecting with other browsers
  if (window.webrtcDetectedBrowser === 'firefox') {
    log.warn('Decreasing weight for Firefox browser connection');

    self._peerPriorityWeight -= 100000000000;
  }

  if (self._mediaScreen && self._mediaScreen !== null) {
    self._trigger('incomingStream', self._user.sid, self._mediaScreen, true, self.getPeerInfo());
  } else if (self._mediaStream && self._mediaStream !== null) {
    self._trigger('incomingStream', self._user.sid, self._mediaStream, true, self.getPeerInfo());
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo(),
    receiveOnly: self._receiveOnly,
    sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
    weight: self._peerPriorityWeight
  });
};

/**
 * Function that handles the "enter" socket message received.
 * See confluence docs for the "enter" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _enterHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;

  log.log([targetMid, null, message.type, 'Received Peer\'s presence ->'], message.userInfo);

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;
    self._addPeer(targetMid, {
      agent: message.agent,
      version: message.version,
      os: message.os
    }, false, false, message.receiveOnly, message.sessionType === 'screensharing');

    self._peerInformations[targetMid] = message.userInfo || {};
    self._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version,
      os: message.os || ''
    };

    if (targetMid !== 'MCU') {
      self._trigger('peerJoined', targetMid, message.userInfo, false);

    } else {
      log.info([targetMid, 'RTCPeerConnection', 'MCU', 'MCU feature has been enabled'], message);
      log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
      this._hasMCU = true;
      this._trigger('serverPeerJoined', targetMid, this.SERVER_PEER_TYPE.MCU);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    receiveOnly: self._peerConnections[targetMid] ?
    	!!self._peerConnections[targetMid].receiveOnly : false,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo(),
    target: targetMid,
    weight: self._peerPriorityWeight,
    sessionType: !!self._mediaScreen ? 'screensharing' : 'stream'
  });

  if (isNewPeer) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }
};

/**
 * Function that handles the "restart" socket message received.
 * See confluence docs for the "restart" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _restartHandler
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'session. Ignoring restart process.']);
    return;
  }

  // NOTE: for now we ignore, but we should take-note to implement in the near future
  if (self._hasMCU) {
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false);
    return;
  }

  self.lastRestart = message.lastRestart || Date.now() || function() { return +new Date(); };

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  // mcu has re-joined
  // NOTE: logic trip since _hasMCU flags are ignored, this could result in failure perhaps?
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has restarted its connection']);
    self._hasMCU = true;
  }

  // Uncomment because we do not need this
  //self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

  message.agent = (!message.agent) ? 'chrome' : message.agent;
  /*self._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : self._enableIceTrickle;
  self._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : self._enableDataChannel;*/

  // re-add information
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version,
    os: message.os || ''
  };

  var agent = (self.getPeerInfo(targetMid) || {}).agent || {};

  // This variable is not used
  //var peerConnectionStateStable = false;

  log.info([targetMid, 'RTCPeerConnection', null, 'Received restart request from peer'], message);
  // we are no longer adding any peer
  /*self._addPeer(targetMid, {
    agent: message.agent,
    version: message.version,
    os: message.os
  }, true, true, message.receiveOnly, message.sessionType === 'screensharing');*/

  // Make peer with highest weight do the offer
  if (self._peerPriorityWeight > message.weight) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Restarting negotiation'], agent);
    self._doOffer(targetMid, {
      agent: agent.name,
      version: agent.version,
      os: agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation'], agent);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      userInfo: self.getPeerInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      receiveOnly: self._peerConnections[targetMid] && self._peerConnections[targetMid].receiveOnly,
      sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
      // SkylinkJS parameters (copy the parameters from received message parameters)
      isConnectionRestart: !!message.isConnectionRestart,
      lastRestart: message.lastRestart,
      explicit: !!message.explicit
    });
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false);

  // following the previous logic to do checker always
  self._startPeerConnectionHealthCheck(targetMid, false);
};

/**
 * Function that handles the "welcome" socket message received.
 * See confluence docs for the "welcome" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _welcomeHandler
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;
  var beOfferer = this._peerPriorityWeight > message.weight;
  var isNewPeer = false;

  log.log([targetMid, null, message.type, 'Received Peer\'s presence ->'], message.userInfo);

  // We shouldn't assume as chrome
  message.agent = (!message.agent) ? 'unknown' : message.agent;

  var agent = {
    agent: message.agent,
    version: message.version,
    os: message.os
  };

  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version,
      os: message.os || ''
    };
    // disable mcu for incoming peer sent by MCU
    /*if (message.agent === 'MCU') {
      this._enableDataChannel = false;

    }*/
    // user is not mcu
    if (targetMid !== 'MCU') {
      this._trigger('peerJoined', targetMid, message.userInfo, false);

    } else {
      log.info([targetMid, 'RTCPeerConnection', 'MCU', 'MCU feature is currently enabled'], message);
      log.log([targetMid, null, message.type, 'MCU has ' +
        ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
      this._hasMCU = true;
      this._trigger('serverPeerJoined', targetMid, this.SERVER_PEER_TYPE.MCU);
      log.log([targetMid, null, message.type, 'Always setting as offerer because peer is MCU']);
      beOfferer = true;
    }

    if (!this._peerConnections[targetMid]) {
      this._addPeer(targetMid, agent, false, restartConn, message.receiveOnly, message.sessionType === 'screensharing');
    }

    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }

  if (this._hasMCU) {
    log.log([targetMid, null, message.type, 'Always setting as offerer because MCU is present']);
    beOfferer = true;
  }

  /*this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : this._enableIceTrickle;
  this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : this._enableDataChannel;*/

  log.debug([targetMid, 'RTCPeerConnection', null, 'Peer should start connection ->'], beOfferer);

  if (beOfferer) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation'], agent);
    this._doOffer(targetMid, agent);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Peer has to start the connection. Resending message'], beOfferer);

    this._sendChannelMessage({
      type: this._SIG_MESSAGE_TYPE.WELCOME,
      mid: this._user.sid,
      rid: this._room.id,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      userInfo: this.getPeerInfo(),
      target: targetMid,
      weight: this._peerPriorityWeight,
      sessionType: !!this._mediaScreen ? 'screensharing' : 'stream'
    });
  }
};

/**
 * Function that handles the "offer" socket message received.
 * See confluence docs for the "offer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _offerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._offerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  /*if (pc.localDescription ? !!pc.localDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.localDescription);
    return;
  }*/

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], message.sdp);
  var offer = new window.RTCSessionDescription({
    type: message.type,
    sdp: message.sdp
  });
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  // Configure it to force TURN connections by removing non-"relay" candidates
  if (self._forceTURN && !self._enableIceTrickle) {
    if (!self._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Removing non-"relay" candidates from offer ' +
        ' as TURN connections is forced']);

      offer.sdp = offer.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

    } else {
      log.warn([targetMid, 'RTCICECandidate', null, 'Not removing non-"relay"' +
        '" candidates although TURN connections is forced as MCU is present']);
    }
  }

  // This is always the initial state. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"stable" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.resend
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of setting local offer as there is another ' +
      'sessionDescription being processed ->'], offer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(offer, function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};


/**
 * Function that handles the "candidate" socket message received.
 * See confluence docs for the "candidate" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _candidateHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._candidateHandler = function(message) {
  var targetMid = message.mid;
  var pc = this._peerConnections[targetMid];
  log.log([targetMid, null, message.type, 'Received candidate from peer. Candidate config:'], {
    sdp: message.sdp,
    target: message.target,
    candidate: message.candidate,
    label: message.label
  });
  // create ice candidate object
  var messageCan = message.candidate.split(' ');
  var canType = messageCan[7];
  log.log([targetMid, null, message.type, 'Candidate type:'], canType);
  // if (canType !== 'relay' && canType !== 'srflx') {
  // trace('Skipping non relay and non srflx candidates.');
  var index = message.label;
  var candidate = new window.RTCIceCandidate({
    sdpMLineIndex: index,
    candidate: message.candidate,
    //id: message.id,
    sdpMid: message.id
    //label: index
  });

  if (this._forceTURN && canType !== 'relay') {
    if (!this._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring adding of "' + canType +
        '" candidate as TURN connections is forced'], candidate);
      return;
    }

    log.warn([targetMid, 'RTCICECandidate', null, 'Not ignoring adding of "' + canType +
      '" candidate although TURN connections is forced as MCU is present'], candidate);
  }

  if (pc) {
  	if (pc.signalingState === this.PEER_CONNECTION_STATE.CLOSED) {
  		log.warn([targetMid, null, message.type, 'Peer connection state ' +
  			'is closed. Not adding candidate'], candidate);
	    return;
  	}
    /*if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
      log.debug([targetMid, null, null,
        'Received but not adding Candidate as we are already connected to this peer']);
      return;
    }*/
    // set queue before ice candidate cannot be added before setRemoteDescription.
    // this will cause a black screen of media stream
    if ((pc.setOffer === 'local' && pc.setAnswer === 'remote') ||
      (pc.setAnswer === 'local' && pc.setOffer === 'remote')) {
      pc.addIceCandidate(candidate, this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      log.debug([targetMid, 'RTCIceCandidate', message.type,
        'Added candidate'], candidate);
    } else {
      this._addIceCandidateToQueue(targetMid, candidate);
    }
  } else {
    // Added ice candidate to queue because it may be received before sending the offer
    log.debug([targetMid, 'RTCIceCandidate', message.type,
      'Not adding candidate as peer connection not present'], candidate);
    // NOTE ALEX: if the offer was slow, this can happen
    // we might keep a buffer of candidates to replay after receiving an offer.
    this._addIceCandidateToQueue(targetMid, candidate);
  }

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[canType].push({
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate
  });
};

/**
 * Function that handles the "answer" socket message received.
 * See confluence docs for the "answer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _answerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], message.sdp);

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for answer']);
    return;
  }

  var answer = new window.RTCSessionDescription({
    type: message.type,
    sdp: message.sdp
  });

  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  /*if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.remoteDescription);
    return;
  }

  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    log.error([targetMid, null, message.type, 'Unable to set peer connection ' +
      'at signalingState "stable". Ignoring remote answer'], pc.signalingState);
    return;
  }*/

  // if firefox and peer is mcu, replace the sdp to suit mcu needs
  if (window.webrtcDetectedType === 'moz' && targetMid === 'MCU') {
    answer.sdp = answer.sdp.replace(/ generation 0/g, '');
    answer.sdp = answer.sdp.replace(/ udp /g, ' UDP ');
  }

  // Configure it to force TURN connections by removing non-"relay" candidates
  if (self._forceTURN && !self._enableIceTrickle) {
    if (!self._hasMCU) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Removing non-"relay" candidates from answer ' +
        ' as TURN connections is forced']);

      answer.sdp = answer.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

    } else {
      log.warn([targetMid, 'RTCICECandidate', null, 'Not removing non-"relay"' +
        '" candidates although TURN connections is forced as MCU is present']);
    }
  }

  // This should be the state after offer is received. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"have-local-offer" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.restart
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of setting local answer as there is another ' +
      'sessionDescription being processed ->'], answer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(answer, function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState
    });
  });
};

/**
 * Current version of signaling message protocol
 * @attribute SM_PROTOCOL_VERSION
 * @type String
 * @required
 * @component Socket
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.1';

/**
 * The Message protocol list. The <code>message</code> object is an
 * indicator of the expected parameters to be given and received.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @param {String} JOIN_ROOM Send to initiate the connection to the Room.
 * @param {String} ENTER Broadcasts to any Peers connected to the room to
 *    intiate a Peer connection.
 * @param {String} WELCOME Send as a response to Peer's enter received. User starts creating
 *    offer to the Peer.
 * @param {String} OFFER Send when <code>createOffer</code> is completed and generated.
 * @param {String} ANSWER Send as a response to Peer's offer Message after <code>createAnswer</code>
 *   is called.
 * @param {String} CANDIDATE Send when an ICE Candidate is generated.
 * @param {String} BYE Received as a response from server that a Peer has left the Room.
 * @param {String} REDIRECT Received as a warning from server when User is rejected or
 *   is jamming the server.
 * @param {String} UPDATE_USER Broadcast when a User's information is updated to reflect the
 *   the changes on Peer's end.
 * @param {String} ROOM_LOCK Broadcast to change the Room lock status.
 * @param {String} MUTE_VIDEO Broadcast when User's video stream is muted or unmuted.
 * @param {String} MUTE_AUDIO Broadcast when User's audio stream is muted or unmuted.
 * @param {String} PUBLIC_MESSAGE Broadcasts a Message object to all Peers in the Room.
 * @param {String} PRIVATE_MESSAGE Sends a Message object to a Peer in the Room.
 * @param {String} RESTART Sends when a Peer connection is restarted.
 * @param {String} STREAM Broadcast when a Stream has ended. This is temporal.
 * @param {String} GROUP Messages are bundled together when messages are sent too fast to
 *   prevent server redirects over sending less than 1 second interval.
 * @readOnly
 * @private
 * @component Message
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
  GROUP: 'group'
};


/**
 * List of signaling message types that can be queued before sending to server.
 * @attribute _groupMessageList
 * @type Array
 * @private
 * @required
 * @component Message
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
 * The flag that indicates if MCU is enabled.
 * @attribute _hasMCU
 * @type Boolean
 * @development true
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;


/**
 * Indicates whether the other peers should only receive stream
 * 	from the current peer and not sending out any stream.
 *	Suitable for use cases such as streaming lecture/concert.
 * @attribute _receiveOnly
 * @type Boolean
 * @private
 * @required
 * @component Message
 * @for Skylink
 * @since 0.5.10
 */
 Skylink.prototype._receiveOnly = false;


/**
 * Handles every incoming signaling message received.
 * @method _processSigMessage
 * @param {String} messageString The message object stringified received.
 * @private
 * @component Message
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
 * Handles the single signaling message received.
 * @method _processingSingleMessage
 * @param {JSON} message The message object received.
 * @private
 * @component Message
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
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Handles the REDIRECT Message event.
 * @method _redirectHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.info The server's message.
 * @param {String} message.action The action that User has to take on.
 *   [Rel: Skylink.SYSTEM_ACTION]
 * @param {String} message.reason The reason of why the action is worked upon.
 *   [Rel: Skylink.SYSTEM_ACTION_REASON]
 * @param {String} message.type Protocol step: <code>"redirect"</code>.
 * @trigger systemAction
 * @private
 * @component Message
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
  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Handles the UPDATE_USER Message event.
 * @method _updateUserEventHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId.
 * @param {JSON|String} message.userData The updated User data.
 * @param {String} message.type Protocol step: <code>"updateUserEvent"</code>.
 * @trigger peerUpdated
 * @private
 * @component Message
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
 * Handles the ROOM_LOCK Message event.
 * @method _roomLockEventHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.lock The flag to indicate if the Room is locked or not
 * @param {String} message.type Protocol step: <code>"roomLockEvent"</code>.
 * @trigger roomLock
 * @private
 * @component Message
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
 * Handles the MUTE_AUDIO Message event.
 * @method _muteAudioEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_AUDIO.message]
 * @trigger peerUpdated
 * @private
 * @component Message
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
 * Handles the MUTE_VIDEO Message event.
 * @method _muteVideoEventHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.muted The flag to indicate if the User's video
 *    stream is muted or not.
 * @param {String} message.type Protocol step: <code>"muteVideoEvent"</code>.
 * @trigger peerUpdated
 * @private
 * @component Message
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
 * Handles the STREAM Message event.
 * @method _streamEventHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The peerId of the sender.
 * @param {String} message.status The MediaStream status.
 * <ul>
 * <li><code>ended</code>: MediaStream has ended</li>
 * </ul>
 * @param {String} message.type Protocol step: <code>"stream"</code>.
 * @trigger peerUpdated
 * @private
 * @component Message
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid]) {

  	if (message.status === 'ended') {
  		this._trigger('streamEnded', targetMid, this.getPeerInfo(targetMid), false);
  		this._peerConnections[targetMid].hasStream = false;
  	}

  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the BYTE Message event.
 * @method _byeHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The peerId of the Peer that has left the Room.
 * @param {String} message.type Protocol step: <code>"bye"</code>.
 * @trigger peerLeft
 * @private
 * @component Message
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer has left the room']);
  this._removePeer(targetMid);
};

/**
 * Handles the PRIVATE_MESSAGE Message event.
 * @method _privateMessageHandler
 * @param {JSON} message The Message object received.
 * @param {JSON|String} message.data The Message object.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.cid The credentialId of the connected Room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.target The peerId of the targeted Peer.
 * @param {String} message.type Protocol step: <code>"private"</code>.
 * @trigger privateMessage
 * @private
 * @component Message
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
 * Handles the PUBLIC_MESSAGE Message event.
 * @method _publicMessageHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.muted The flag to indicate if the User's audio
 *    stream is muted or not.
 * @param {String} message.type Protocol step: <code>"muteAudioEvent"</code>.
 * @trigger publicMessage
 * @private
 * @component Message
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
 * Handles the IN_ROOM Message event.
 * @method _inRoomHandler
 * @param {JSON} message The Message object received.
 * @param {JSON} message Expected IN_ROOM data object format.
 * @param {String} message.rid The roomId of the connected room.
 * @param {String} message.sid The User's userId.
 * @param {JSON} message.pc_config The Peer connection iceServers configuration.
 * @param {String} message.type Protocol step: <code>"inRoom"</code>.
 * @trigger peerJoined
 * @private
 * @component Message
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

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
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
    sessionType: !!self._mediaScreen ? 'screensharing' : 'stream'
  });
};

/**
 * Handles the ENTER Message event.
 * @method _enterHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId / userId.
 * @param {Boolean} [message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {String} message.agent The Peer's browser agent.
 * @param {String} message.version The Peer's browser version.
 * @param {String} message.userInfo The Peer's information.
 * @param {JSON} message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Number} [message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Number} [message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Number} [message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} message.userInfo.userData
 *   The custom User data.
 * @param {String} message.type Protocol step: <code>"enter"</code>.
 * @trigger handshakeProgress, peerJoined
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Incoming peer have initiated ' +
    'handshake. Peer\'s information:'], message.userInfo);
  // need to check entered user is new or not.
  // peerInformations because it takes a sequence before creating the
  // peerconnection object. peerInformations are stored at the start of the
  // handshake, so user knows if there is a peer already.
  if (self._peerInformations[targetMid]) {
    // NOTE ALEX: and if we already have a connection when the peer enter,
    // what should we do? what are the possible use case?
    log.log([targetMid, null, message.type, 'Ignoring message as peer is already added']);
    return;
  }
  // add peer
  self._addPeer(targetMid, {
    agent: message.agent,
    version: message.version,
    os: message.os
  }, false, false, message.receiveOnly, message.sessionType === 'screensharing');
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };
  if (targetMid !== 'MCU') {
    self._trigger('peerJoined', targetMid, message.userInfo, false);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

    // disable mcu for incoming peer sent by MCU
    //if (message.agent === 'MCU') {
    	// this._enableDataChannel = false;

    	/*if (window.webrtcDetectedBrowser === 'firefox') {
    		this._enableIceTrickle = false;
    	}*/
    //}
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
    this._hasMCU = true;
    // this._enableDataChannel = false;
  }

  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
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
    weight: weight,
    sessionType: !!self._mediaScreen ? 'screensharing' : 'stream'
  });
};

/**
 * Handles the RESTART Message event.
 * @method _restartHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId / userId.
 * @param {Boolean} [message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {Boolean} [message.enableIceTrickle=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {Boolean} [message.enableDataChannel=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {String} message.agent The Peer's browser agent.
 * @param {String} message.version The Peer's browser version.
 * @param {String} message.userInfo The Peer's information.
 * @param {JSON} message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Number} [message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Number} [message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Number} [message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} message.userInfo.userData
 *   The custom User data.
 * @param {String} message.target The peerId of the peer to respond the enter message to.
 * @param {String} message.type Protocol step: <code>"restart"</code>.
 * @trigger handshakeProgress, peerRestart
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (self._hasMCU) {
    self._restartMCUConnection();
    return;
  }

  self.lastRestart = message.lastRestart || Date.now() || function() { return +new Date(); };

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  //Only consider peer's restart weight if self also sent a restart which cause a potential conflict
  //Otherwise go ahead with peer's restart
  if (self._peerRestartPriorities.hasOwnProperty(targetMid)){
    //Peer's restart message was older --> ignore
    if (self._peerRestartPriorities[targetMid] > message.weight){
      log.log([targetMid, null, message.type, 'Peer\'s generated restart weight ' +
          'is lesser than user\'s. Ignoring message'
          ], this._peerRestartPriorities[targetMid] + ' > ' + message.weight);
      return;
    }
  }

  // re-add information
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };

  // mcu has joined
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has restarted its connection']);
    self._hasMCU = true;
  }

  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);

  message.agent = (!message.agent) ? 'chrome' : message.agent;
  self._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : self._enableIceTrickle;
  self._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : self._enableDataChannel;

  var peerConnectionStateStable = false;

  self._restartPeerConnection(targetMid, false, false, function () {
    log.info('Received message', message);
  	self._addPeer(targetMid, {
	    agent: message.agent,
	    version: message.version,
	    os: message.os || window.navigator.platform
	  }, true, true, message.receiveOnly, message.sessionType === 'screensharing');

    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false);

	// do a peer connection health check
  	self._startPeerConnectionHealthCheck(targetMid);
  }, message.explicit);
};

/**
 * Handles the WELCOME Message event.
 * @method _welcomeHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected Room.
 * @param {String} message.mid The sender's peerId / userId.
 * @param {Boolean} [message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {Boolean} [message.enableIceTrickle=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {Boolean} [message.enableDataChannel=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {String} message.agent The Peer's browser agent.
 * @param {String} message.version The Peer's browser version.
 * @param {String} message.userInfo The Peer's information.
 * @param {JSON} message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Number} [message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Number} [message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Number} [message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} message.userInfo.userData
 *   The custom User data.
 * @param {String} message.target The peerId of the peer to respond the enter message to.
 * @param {Number} message.weight The priority weight of the message. This is required
 *   when two Peers receives each other's welcome message, hence disrupting the handshaking to
 *   be incorrect. With a generated weight usually done by invoking <code>Date.UTC()</code>, this
 *   would check against the received weight and generated weight for the Peer to prioritize who
 *   should create or receive the offer.
 * <ul>
 * <li><code>>=0</code> An ongoing weight priority check is going on.Weight priority message.</li>
 * <li><code>-1</code> Enforce create offer to happen without any priority weight check.</li>
 * <li><code>-2</code> Enforce create offer and re-creating of Peer connection to happen without
 *    any priority weight check.</li>
 * </ul>
 * @param {String} message.type Protocol step: <code>"welcome"</code>.
 * @trigger handshakeProgress, peerJoined
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;

  log.log([targetMid, null, message.type, 'Received peer\'s response ' +
    'to handshake initiation. Peer\'s information:'], message.userInfo);

  if (this._peerConnections[targetMid]) {
    if (!this._peerConnections[targetMid].setOffer || message.weight < 0) {
      if (message.weight < 0) {
        log.log([targetMid, null, message.type, 'Peer\'s weight is lower ' +
          'than 0. Proceeding with offer'], message.weight);
        restartConn = true;

        // -2: hard restart of connection
        if (message.weight === -2) {
          this._restartHandler(message);
          return;
        }

      } else if (this._peerHSPriorities[targetMid] > message.weight) {
        log.log([targetMid, null, message.type, 'Peer\'s generated weight ' +
          'is lesser than user\'s. Ignoring message'
          ], this._peerHSPriorities[targetMid] + ' > ' + message.weight);
        return;

      } else {
        log.log([targetMid, null, message.type, 'Peer\'s generated weight ' +
          'is higher than user\'s. Proceeding with offer'
          ], this._peerHSPriorities[targetMid] + ' < ' + message.weight);
        restartConn = true;
      }
    } else {
      log.warn([targetMid, null, message.type,
        'Ignoring message as peer is already added']);
      return;
    }
  }
  message.agent = (!message.agent) ? 'chrome' : message.agent;
  this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : this._enableIceTrickle;
  this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : this._enableDataChannel;

  // mcu has joined
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has ' +
      ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
    this._hasMCU = true;
    // disable mcu for incoming MCU peer
    // this._enableDataChannel = false;
  }
  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
    // disable mcu for incoming peer sent by MCU
    /*if (message.agent === 'MCU') {
    	this._enableDataChannel = false;

    }*/
    // user is not mcu
    if (targetMid !== 'MCU') {
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }
  }

  this._addPeer(targetMid, {
    agent: message.agent,
		version: message.version,
		os: message.os
  }, true, restartConn, message.receiveOnly, message.sessionType === 'screensharing');
};

/**
 * Handles the OFFER Message event.
 * @method _offerHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.sdp The generated offer session description.
 * @param {String} message.type Protocol step: <code>"offer"</code>.
 * @trigger handshakeProgress
 * @private
 * @component Message
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

  if (pc.localDescription ? !!pc.localDescription.sdp : false) {
  	log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
  		pc.localDescription);
    return;
  }

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], message.sdp);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
  var offer = new window.RTCSessionDescription(message);
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  pc.setRemoteDescription(new window.RTCSessionDescription(offer), function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};

/**
 * Handles the CANDIDATE Message event.
 * @method _candidateHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected room.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.sdp The ICE Candidate's session description.
 * @param {String} message.target The peerId of the targeted Peer.
 * @param {String} message.id The ICE Candidate's id.
 * @param {String} message.candidate The ICE Candidate's candidate object.
 * @param {String} message.label The ICE Candidate's label.
 * @param {String} message.type Protocol step: <code>"candidate"</code>.
 * @private
 * @component Message
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
  if (pc) {
  	if (pc.signalingState === this.PEER_CONNECTION_STATE.CLOSED) {
  		log.warn([targetMid, null, message.type, 'Peer connection state ' +
  			'is closed. Not adding candidate']);
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
      'Not adding candidate as peer connection not present']);
    // NOTE ALEX: if the offer was slow, this can happen
    // we might keep a buffer of candidates to replay after receiving an offer.
    this._addIceCandidateToQueue(targetMid, candidate);
  }
};

/**
 * Handles the ANSWER Message event.
 * @method _answerHandler
 * @param {JSON} message The Message object received.
 * @param {String} message.rid The roomId of the connected room.
 * @param {String} message.sdp The generated answer session description.
 * @param {String} message.mid The sender's peerId.
 * @param {String} message.type Protocol step: <code>"answer"</code>.
 * @trigger handshakeProgress
 * @private
 * @component Message
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], message.sdp);

  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
  var answer = new window.RTCSessionDescription(message);

  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
  	log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
  		pc.remoteDescription);
    return;
  }

  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    log.error([targetMid, null, message.type, 'Unable to set peer connection ' +
      'at signalingState "stable". Ignoring remote answer'], pc.signalingState);
    return;
  }

  // if firefox and peer is mcu, replace the sdp to suit mcu needs
  if (window.webrtcDetectedType === 'moz' && targetMid === 'MCU') {
    message.sdp = message.sdp.replace(/ generation 0/g, '');
    message.sdp = message.sdp.replace(/ udp /g, ' UDP ');
  }
  pc.setRemoteDescription(new window.RTCSessionDescription(answer), function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    self._addIceCandidateFromQueue(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};

/**
 * Sends Message object to either a targeted Peer or Broadcasts to all Peers connected in the Room.
 * - Message is sent using the socket connection to the signaling server and relayed to
 *   the recipient(s). For direct messaging to a recipient refer to
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.
 * @method sendMessage
 * @param {String|JSON} message The message data to send.
 * @param {String} [targetPeerId] PeerId of the peer to send a private
 *   message data to. If not specified then send to all peers.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendMessage('Hi there!');
 *
 *   // Example 2: Send to a targeted peer
 *   SkylinkDemo.sendMessage('Hi there peer!', targetPeerId);
 * @trigger incomingMessage
 * @component Message
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

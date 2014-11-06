/**
 * The list of signaling message types.
 * - These are the list of available signaling message types expected to
 *   be received.
 * - These message types are fixed.
 * - The available message types are:
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @param {String} JOIN_ROOM
 * - Send: User request to join the room.
 * @param {String} IN_ROOM
 * - Received: Response from server that user has joined the room.
 * @param {String} ENTER
 * - Send: Broadcast message to inform other connected peers in the room
 *   that the user is the new peer joining the room.
 * - Received: A peer has just joined the room.
 *   To send a welcome message.
 * @param {String} WELCOME
 * - Send: Respond to user to request peer to create the offer.
 * - Received: Response from peer that peer acknowledges the user has
 *   joined the room. To send and create an offer message.
 * @param {String} OFFER
 * - Send: Respond to peer's request to create an offer.
 * - Received: Response from peer's offer message. User to create and
 *   send an answer message.
 * @param {String} ANSWER
 * - Send: Response to peer's offer message.
 * - Received: Response from peer's answer message.
 *   Connection is established.
 * @param {String} CANDIDATE
 * - Send: User to send the ICE candidate after onicecandidate is called.
 * - Received: User to add peer's ice candidate in addIceCandidate.
 * @param {String} BYE
 * - Received: Peer has left the room.
 * @param {String} REDIRECT
 * - Received: Server warning to user.
 * @param {String} ERROR
 * - Received: Deprecated. Server error occurred.
 * @param {String} UPDATE_USER
 * - Send: User's custom data is updated and to inform other peers
 *   of updated custom data.
 * - Received: Peer's user custom data has changed.
 * @param {String} ROOM_LOCK
 * - Send: Room lock action has changed and to inform other peers
 *   of updated room lock status.
 * - Received: Room lock status has changed.
 * @param {String} MUTE_VIDEO
 * - Send: User has muted video and to inform other peers
 *   of updated muted video stream status.
 * - Received: Peer muted video status has changed.
 * @param {String} MUTE_AUDIO
 * - Send: User has muted audio and to inform other peers
 *   of updated muted audio stream status.
 * - Received: Peer muted audio status has changed.
 * @param {String} PUBLIC_MESSAGE
 * - Send: User sends a broadcast message to all peers.
 * - Received: User receives a peer's broadcast message.
 * @param {String} PRIVATE_MESSAGE
 * - Send: User sends a private message to a peer.
 * - Received: User receives a private message from a peer.
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
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
  GROUP: 'group'
};

/**
 * Handles everu incoming signaling message received.
 * - If it's a SIG_TYPE.GROUP message, break them down to single messages
 *   and let {{#crossLink "Skylink/_processSingleMessage:method"}}
 *   _processSingleMessage(){{/crossLink}} to handle them.
 * @method _processSigMessage
 * @param {String} messageString The message object stringified received.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(message.lists[i]);
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
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Recevied from peer ->'], message.type);
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
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Signaling server sends a redirect message.
 * - SIG_TYPE: REDIRECT
 * - This occurs when the signaling server is warning us or wanting
 *   to move us out when the peer sends too much messages at the
 *   same tme.
 * @method _redirectHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.info The reason for this action.
 * @param {String} message.action The action to work on.
 *   [Rel: Skylink.SYSTEM_ACTION]
 * @param {String} message.reason The reason of why the action is worked upon.
 *   [Rel: Skylink.SYSTEM_ACTION_REASON]
 * @param {String} message.type The type of message received.
 * @trigger systemAction
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
  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Signaling server sends a updateUserEvent message.
 * - SIG_TYPE: UPDATE_USER
 * - This occurs when a peer's custom user data is updated.
 * @method _updateUserEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   updated event.
 * @param {JSON|String} message.userData The peer's user data.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Signaling server sends a roomLockEvent message.
 * - SIG_TYPE: ROOM_LOCK
 * - This occurs when a room lock status has changed.
 * @method _roomLockEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   updated room lock status.
 * @param {String} message.lock If room is locked or not.
 * @param {String} message.type The type of message received.
 * @trigger roomLock
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid,
    this._peerInformations[targetMid], false);
};

/**
 * Signaling server sends a muteAudioEvent message.
 * - SIG_TYPE: MUTE_AUDIO
 * - This occurs when a peer's audio stream muted
 *   status has changed.
 * @method _muteAudioEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending
 *   their own updated audio stream status.
 * @param {String} message.muted If audio stream is muted or not.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Signaling server sends a muteVideoEvent message.
 * - SIG_TYPE: MUTE_VIDEO
 * - This occurs when a peer's video stream muted
 *   status has changed.
 * @method _muteVideoEventHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending
 *   their own updated video streams status.
 * @param {String} message.muted If video stream is muted or not.
 * @param {String} message.type The type of message received.
 * @trigger peerUpdated
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Signaling server sends a bye message.
 * - SIG_TYPE: BYE
 * - This occurs when a peer left the room.
 * @method _byeHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that has left the room.
 * @param {String} message.type The type of message received.
 * @trigger peerLeft
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer has left the room']);
  this._removePeer(targetMid);
};

/**
 * Signaling server sends a privateMessage message.
 * - SIG_TYPE: PRIVATE_MESSAGE
 * - This occurs when a peer sends private message to user.
 * @method _privateMessageHandler
 * @param {JSON} message The message object received.
 * @param {JSON|String} message.data The data received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.cid CredentialId of the room.
 * @param {String} message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} message.type The type of message received.
 * @trigger privateMessage
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
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Signaling server sends a publicMessage message.
 * - SIG_TYPE: PUBLIC_MESSAGE
 * - This occurs when a peer broadcasts a public message to
 *   all connected peers.
 * @method _publicMessageHandler
 * @param {JSON} message The message object received.
 * @param {JSON|String} message.data The data broadcasted
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.cid CredentialId of the room.
 * @param {String} message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} message.type The type of message received.
 * @trigger publicMessage
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
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Signaling server sends an inRoom message.
 * - SIG_TYPE: IN_ROOM
 * - This occurs the user has joined the room.
 * @method _inRoomHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.sid PeerId of self.
 * @param {String} message.mid PeerId of the peer that is
 *   sending the joinRoom message.
 * @param {JSON} message.pc_config The peerconnection configuration.
 * @param {String} message.type The type of message received.
 * @trigger peerJoined
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
  self._trigger('peerJoined', self._user.sid, self._user.info, true);
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
    userInfo: self._user.info
  });
};

/**
 * Signaling server sends a enter message.
 * - SIG_TYPE: ENTER
 * - This occurs when a peer just entered the room.
 * - If we don't have a connection with the peer, send a welcome.
 * @method _enterHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the enter shake.
 * @param {String} message.agent Peer's browser agent.
 * @param {String} message.version Peer's browser version.
 * @param {String} message.userInfo Peer's user information.
 * @param {JSON} message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 * @param {JSON} [message.userInfo.settings.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [message.userInfo.settings.video.resolution.width]
 * @param {Integer} [message.userInfo.settings.video.resolution.height]
 * @param {Integer} [message.userInfo.settings.video.frameRate]
 * @param {JSON} message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true] If peer's audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true] If peer's video stream is muted.
 * @param {String|JSON} message.userInfo.userData Peer custom data.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress, peerJoined
 * @private
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
    version: message.version
  }, false);
  if (targetMid !== 'MCU') {
    self._trigger('peerJoined', targetMid, message.userInfo, false);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    self._peerInformations[targetMid] = message.userInfo || {};
    self._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
  }
  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    userInfo: self._user.info,
    target: targetMid,
    weight: weight
  });
};

/**
 * Signaling server sends a welcome message.
 * - SIG_TYPE: WELCOME
 * - This occurs when we've just received a welcome.
 * - If there is no existing connection with this peer,
 *   create one, then set the remotedescription and answer.
 * @method _welcomeHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the welcome shake.
 * @param {Boolean} [message.receiveOnly=false] Peer to receive only
 * @param {Boolean} [message.enableIceTrickle=false] Option to enable Ice trickle or not
 * @param {Boolean} [message.enableDataChannel=false] Option to enable DataChannel or not
 * @param {String} message.userInfo Peer's user information.
 * @param {JSON} message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [message.userInfo.settings.audio=false]
 * @param {Boolean} [message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [message.userInfo.settings.video=false]
 * @param {JSON} [message.userInfo.settings.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [message.userInfo.settings.video.resolution.width]
 * @param {Integer} [message.userInfo.settings.video.resolution.height]
 * @param {Integer} [message.userInfo.settings.video.frameRate]
 * @param {JSON} message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [message.userInfo.mediaStatus.audioMuted=true] If peer's audio stream is muted.
 * @param {Boolean} [message.userInfo.mediaStatus.videoMuted=true] If peer's video stream is muted.
 * @param {String|JSON} message.userInfo.userData Peer custom data.
 * @param {String} message.agent Browser agent.
 * @param {String} message.version Browser version.
 * @param {String} message.target PeerId of the peer targeted to receieve this message.
 * @param {Integer} message.weight The weight of the message.
 * - >= 0: Weight priority message.
 * - -1: Restart handshake but not refreshing peer connection object.
 * - -2: Restart handshake and refresh peer connection object.
 *       This invokes a peerRestart event.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress, peerJoined
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var targetMid = message.mid;
  var restartConn = false;

  log.log([targetMid, null, message.type, 'Received peer\'s response ' +
    'to handshake initiation. Peer\'s information:'], message.userInfo);

  if (this._peerConnections[targetMid]) {
    if (!this._peerConnections[targetMid].setOffer) {
      if (message.weight < 0) {
        log.log([targetMid, null, message.type, 'Peer\'s weight is lower ' +
          'than 0. Proceeding with offer'], message.weight);
        restartConn = true;

        // -2: hard restart of connection
        if (message.weight === -2) {
          this._restartPeerConnection(targetMid);
          this._trigger('peerRestart', peerId, this._peerInformations[peerId] || {}, false);
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
  if (!this._peerInformations[targetMid]) {
    if (targetMid !== 'MCU') {
      this._peerInformations[targetMid] = message.userInfo;
      this._peerInformations[targetMid].agent = {
        name: message.agent,
        version: message.version
      };
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    } else {
      log.log([targetMid, null, message.type, 'MCU has ' +
        ((message.weight > -1) ? 'joined and ' : '') + ' responded']);
    }
  }
  // do a peer connection health check
  this._peerConnectionTimestamps[targetMid] = new Date();
  this._startPeerConnectionHealthCheck();

  this._addPeer(targetMid, {
    agent: message.agent,
    version: message.version
  }, true, restartConn, message.receiveOnly);
};

/**
 * Signaling server sends an offer message.
 * - SIG_TYPE: OFFER
 * - This occurs when we've just received an offer.
 * - If there is no existing connection with this peer, create one,
 *   then set the remotedescription and answer.
 * @method _offerHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the offer shake.
 * @param {String} message.sdp Offer sessionDescription
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress
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
 * Signaling server sends a candidate message.
 * - SIG_TYPE: CANDIDATE
 * - This occurs when a peer sends an ice candidate.
 * @method _candidateHandler
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.mid PeerId of the peer that is sending the
 *   offer shake.
 * @param {String} message.sdp Offer sessionDescription.
 * @param {String} message.target PeerId that is specifically
 *   targeted to receive the message.
 * @param {String} message.id Peer's ICE candidate id.
 * @param {String} message.candidate Peer's ICE candidate object.
 * @param {String} message.label Peer's ICE candidate label.
 * @param {String} message.type The type of message received.
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
    candidate: message.candidate
  });
  if (pc) {
    /*if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
      log.debug([targetMid, null, null,
        'Received but not adding Candidate as we are already connected to this peer']);
      return;
    }*/
    // set queue before ice candidate cannot be added before setRemoteDescription.
    // this will cause a black screen of media stream
    if ((pc.setOffer === 'local' && pc.setAnswer === 'remote') ||
      (pc.setAnswer === 'local' && pc.setOffer === 'remote')) {
      pc.addIceCandidate(candidate);
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
 * Signaling server sends an answer message.
 * - SIG_TYPE: ANSWER
 * - This occurs when a peer sends an answer message is received.
 * @method _answerHandler
 * @param {String} message.type Message type
 * @param {JSON} message The message object received.
 * @param {String} message.rid RoomId of the connected room.
 * @param {String} message.sdp Answer sessionDescription
 * @param {String} message.mid PeerId of the peer that is sending the enter shake.
 * @param {String} message.type The type of message received.
 * @trigger handshakeProgress
 * @private
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
 * Broadcast a message to all peers.
 * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
 *   in JSON, so refrain from using map arrays.
 * @method sendMessage
 * @param {String|JSON} message The message data to send.
 * @param {String} targetPeerId PeerId of the peer to send a private
 *   message data to.
 * @example
 *   // Example 1: Send to all peers
 *   SkylinkDemo.sendMessage('Hi there!');
 *
 *   // Example 2: Send to a targeted peer
 *   SkylinkDemo.sendMessage('Hi there peer!', targetPeerId);
 * @trigger incomingMessage
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
  if (targetPeerId) {
    params.target = targetPeerId;
    params.type = this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE;
  }
  log.log([targetPeerId, null, null,
    'Sending message to peer' + ((targetPeerId) ? 's' : '')]);
  this._sendChannelMessage(params);
  this._trigger('incomingMessage', {
    content: message,
    isPrivate: (targetPeerId) ? true: false,
    targetPeerId: targetPeerId || null,
    isDataChannel: false,
    senderPeerId: this._user.sid
  }, this._user.sid, this._user.info, true);
};
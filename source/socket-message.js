/**
 * The list of signaling message types.
 * - These are the list of available signaling message types expected to
 *   be sent and received.
 * - These message types are fixed.
 * - The sub-param <b>message</b> is NOT an actual property of each types.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @param {String} JOIN_ROOM User request to join the room.
 *   Sent in {{#crossLink "Skylink/_waitForOpenChannel:method"}}
 *   _waitForOpenChannel(){{/crossLink}}.
 *
 * @param {JSON} JOIN_ROOM.message The message object.
 * @param {String} JOIN_ROOM.message.rid Received rid from API web-server.
 * @param {String} JOIN_ROOM.message.uid Received uid from API web-server.
 * @param {String} JOIN_ROOM.message.cid Received cid from API web-server.
 * @param {String} JOIN_ROOM.message.userCred Received userCred from API web-server.
 * @param {String} JOIN_ROOM.message.timeStamp Received timeStamp from API web-server.
 * @param {String} JOIN_ROOM.message.apiOwner Received apiOwner from API web-server.
 * @param {String} JOIN_ROOM.message.roomCred Received roomCred from API web-server.
 * @param {String} JOIN_ROOM.message.start Received start from API web-server.
 * @param {String} JOIN_ROOM.message.len Received duration from API web-server.
 * @param {String} JOIN_ROOM.message.type The type of message.
 *
 * @param {String} IN_ROOM Response from server that user has joined the room.
 *   Received in {{#crossLink "Skylink/_inRoomHandler:method"}}
 *   _inRoomHandler(){{/crossLink}}.
 *
 * @param {JSON} IN_ROOM.message The message object.
 * @param {String} IN_ROOM.message.rid RoomId of the connected room.
 * @param {String} IN_ROOM.message.sid PeerId of self.
 * @param {String} IN_ROOM.message.mid PeerId of the peer that is
 *   sending the joinRoom message.
 * @param {JSON} IN_ROOM.message.pc_config The peerconnection configuration.
 * @param {String} IN_ROOM.message.type The type of message.
 *
 * @param {String} ENTER Step 1 of the handshake.
 *   Sent as a broadcast message to inform other connected peers in the room
 *   that the user is the new peer joining the room.
 *   Received when a peer has just joined the room.
 *   Sent in {{#crossLink "Skylink/_inRoomHandler:method"}}
 *   _inRoomHandler(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_enterHandler:method"}}
 *   _enterHandler(){{/crossLink}}.
 *
 * @param {JSON} ENTER.message The message object.
 * @param {String} ENTER.message.rid RoomId of the connected room.
 * @param {String} ENTER.message.mid PeerId of the peer that is sending the enter shake.
 * @param {Boolean} [ENTER.message.receiveOnly=false] Peer to receive only.
 * @param {String} ENTER.message.agent Peer's browser agent.
 * @param {String} ENTER.message.version Peer's browser version.
 * @param {String} ENTER.message.userInfo Peer's user information.
 * @param {JSON} ENTER.message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [ENTER.message.userInfo.settings.audio=false]
 * @param {Boolean} [ENTER.message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [ENTER.message.userInfo.settings.video=false]
 * @param {JSON} [ENTER.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [ENTER.message.userInfo.settings.video.resolution.width]
 * @param {Integer} [ENTER.message.userInfo.settings.video.resolution.height]
 * @param {Integer} [ENTER.message.userInfo.settings.video.frameRate]
 * @param {JSON} ENTER.message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [ENTER.message.userInfo.mediaStatus.audioMuted=true]
 *   If peer's audio stream is muted.
 * @param {Boolean} [ENTER.message.userInfo.mediaStatus.videoMuted=true]
 *   If peer's video stream is muted.
 * @param {String|JSON} ENTER.message.userInfo.userData Peer custom data.
 * @param {String} ENTER.message.type The type of message.
 *
 * @param {String} WELCOME Reponse to start createOffer().
 *   Sent as a respond to user to request peer to create the offer.
 *   Received as a response from peer that peer acknowledges the user has
 *   joined the room and create the offer.
 *   Sent in {{#crossLink "Skylink/_enterHandler:method"}}
 *   _enterHandler(){{/crossLink}},
 *   {{#crossLink "Skylink/_doOffer:method"}}_doOffer(){{/crossLink}},
 *   {{#crossLink "Skylink/_restartPeerConnection:method"}}
 *    _restartPeerConnection{{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_welcomeHandler:method"}}
 *   _welcomeHandler(){{/crossLink}}.
 *
 * @param {JSON} WELCOME.message The message object.
 * @param {String} WELCOME.message.rid RoomId of the connected room.
 * @param {String} WELCOME.message.mid PeerId of the peer that is sending the welcome shake.
 * @param {Boolean} [WELCOME.message.receiveOnly=false] Peer to receive only
 * @param {Boolean} [WELCOME.message.enableIceTrickle=false] Option to enable Ice trickle or not
 * @param {Boolean} [WELCOME.message.enableDataChannel=false] Option to enable DataChannel or not
 * @param {String} WELCOME.message.userInfo Peer's user information.
 * @param {JSON} WELCOME.message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [WELCOME.message.userInfo.settings.audio=false]
 * @param {Boolean} [WELCOME.message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [WELCOME.message.userInfo.settings.video=false]
 * @param {JSON} [WELCOME.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [WELCOME.message.userInfo.settings.video.resolution.width]
 * @param {Integer} [WELCOME.message.userInfo.settings.video.resolution.height]
 * @param {Integer} [WELCOME.message.userInfo.settings.video.frameRate]
 * @param {JSON} WELCOME.message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [WELCOME.message.userInfo.mediaStatus.audioMuted=true]
 *   If peer's audio stream is muted.
 * @param {Boolean} [WELCOME.message.userInfo.mediaStatus.videoMuted=true]
 *   If peer's video stream is muted.
 * @param {String|JSON} WELCOME.message.userInfo.userData Peer custom data.
 * @param {String} WELCOME.message.agent Browser agent.
 * @param {String} WELCOME.message.version Browser version.
 * @param {String} WELCOME.message.target PeerId of the peer targeted to receieve this message.
 * @param {Integer} WELCOME.message.weight The weight of the message.
 * <ul>
 * <li><code>>=0</code> Weight priority message.</li>
 * <li><code>-1</code> Restart handshake but not refreshing peer connection object.</li>
 * <li><code>-2</code> Restart handshake and refresh peer connection object.
 *   This invokes a peerRestart event.</li>
 * </ul>
 * @param {String} WELCOME.message.type The type of message.
 *
 * @param {String} OFFER An offer has been created.
 *   Sent as a response to peer's request to create an offer.
 *   Received as a response from peer's offer message.
 *   Sent in {{#crossLink "Skylink/_setLocalAndSendMessage:method"}}
 *   _setLocalAndSendMessage(){{/crossLink}},
 *   {{#crossLink "Skylink/_onIceCandidate:method"}}
 *   _onIceCandidate(){{/crossLink}}
 *   Received in {{#crossLink "Skylink/_offerHandler:method"}}
 *   _offerHandler(){{/crossLink}}.
 *
 * @param {JSON} OFFER.message The message object.
 * @param {String} OFFER.message.rid RoomId of the connected room.
 * @param {String} OFFER.message.mid PeerId of the peer that is sending the offer shake.
 * @param {String} OFFER.message.sdp Offer sessionDescription
 * @param {String} OFFER.message.type The type of message.
 *
 * @param {String} ANSWER An answer has been created as an response to the offer.
 *   Sent as a response to peer's offer message.
 *   Received as a response from peer's answer message. This is when connection is established.
 *   Sent in {{#crossLink "Skylink/_setLocalAndSendMessage:method"}}
 *   _setLocalAndSendMessage(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_answerHandler:method"}}
 *   _answerHandler(){{/crossLink}}.
 *
 * @param {JSON} ANSWER.message The message object.
 * @param {String} ANSWER.message.rid RoomId of the connected room.
 * @param {String} ANSWER.message.sdp Answer sessionDescription
 * @param {String} ANSWER.message.mid PeerId of the peer that is sending the enter shake.
 * @param {String} ANSWER.message.type The type of message.
 *
 * @param {String} CANDIDATE A peer's ICE candidate is created and received.
 *   Sent when onicecandidate is called.
 *   Received when peer sends an ice candidate.
 *   Sent in {{#crossLink "Skylink/_onIceCandidate:method"}}
 *   _onIceCandidate(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_candidateHandler:method"}}
 *   _candidateHandler(){{/crossLink}}.
 *
 * @param {JSON} CANDIDATE.message The message object.
 * @param {String} CANDIDATE.message.rid RoomId of the connected room.
 * @param {String} CANDIDATE.message.mid PeerId of the peer that is sending the
 *   offer shake.
 * @param {String} CANDIDATE.message.sdp Offer sessionDescription.
 * @param {String} CANDIDATE.message.target PeerId that is specifically
 *   targeted to receive the message.
 * @param {String} CANDIDATE.message.id Peer's ICE candidate id.
 * @param {String} CANDIDATE.message.candidate Peer's ICE candidate object.
 * @param {String} CANDIDATE.message.label Peer's ICE candidate label.
 * @param {String} CANDIDATE.message.type The type of message.
 *
 * @param {String} BYE A peer has left the room.
 *   Received when a peer has left the room.
 *   Received in {{#crossLink "Skylink/_byeHandler:method"}}
 *   _byeHandler(){{/crossLink}}.
 *
 * @param {JSON} BYE.message The message object.
 * @param {String} BYE.message.rid RoomId of the connected room.
 * @param {String} BYE.message.mid PeerId of the peer that has left the room.
 * @param {String} BYE.message.type The type of message received.
 *
 * @param {String} REDIRECT Server redirecting user or warning user.
 *   Received as a server warning or redirect to user.
 *   Received in {{#crossLink "Skylink/_redirectHandler:method"}}
 *   _redirectHandler(){{/crossLink}}.
 *
 * @param {JSON} REDIRECT.message The message object.
 * @param {String} REDIRECT.message.rid RoomId of the connected room.
 * @param {String} REDIRECT.message.info The reason for this action.
 * @param {String} REDIRECT.message.action The action to work on.
 *   [Rel: Skylink.SYSTEM_ACTION]
 * @param {String} REDIRECT.message.reason The reason of why the action is worked upon.
 *   [Rel: Skylink.SYSTEM_ACTION_REASON]
 * @param {String} REDIRECT.message.type The type of message.
 *
 * @param {String} UPDATE_USER A peer's userData is updated.
 *   Sent when the user's userData is updated.
 *   Received when peer's userData is updated.
 *   Sent in {{#crossLink "Skylink/setUserData:method"}}
 *   setUserData(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_updateUserEventHandler:method"}}
 *   _updateUserEventHandler(){{/crossLink}}.
 *
 * @param {JSON} UPDATE_USER.message The message object.
 * @param {String} UPDATE_USER.message.rid RoomId of the connected room.
 * @param {String} UPDATE_USER.message.mid PeerId of the peer that is sending the
 *   updated event.
 * @param {JSON|String} UPDATE_USER.message.userData The peer's user data.
 * @param {String} UPDATE_USER.message.type The type of message.
 *
 * @param {String} ROOM_LOCK The room lock status has changed.
 *   Sent when the room lock status has been updated by user.
 *   Received when room lock status has changed by user.
 *   Sent in {{#crossLink "Skylink/lockRoom:method"}}
 *   lockRoom(){{/crossLink}},
 *   {{#crossLink "Skylink/unlockRoom:method"}}
 *   unlockRoom(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_roomLockEventHandler:method"}}
 *   _roomLockEventHandler(){{/crossLink}}.
 *
 * @param {JSON} ROOM_LOCK.message The message object.
 * @param {String} ROOM_LOCK.message.rid RoomId of the connected room.
 * @param {String} ROOM_LOCK.message.mid PeerId of the peer that is sending the
 *   updated room lock status.
 * @param {String} ROOM_LOCK.message.lock If room is locked or not.
 * @param {String} ROOM_LOCK.message.type The type of message.
 *
 * @param {String} MUTE_VIDEO A user's audio mute status has changed.
 *   Sent when user has muted video status changed.
 *   Received when a peer's muted video status has changed.
 *   Sent in {{#crossLink "Skylink/_handleLocalMediaStreams:method"}}
 *   _handleLocalMediaStreams(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_muteVideoEventHandler:method"}}
 *   _muteVideoEventHandler(){{/crossLink}}.
 *
 * @param {JSON} MUTE_VIDEO.message The message object.
 * @param {String} MUTE_VIDEO.message.rid RoomId of the connected room.
 * @param {String} MUTE_VIDEO.message.mid PeerId of the peer that is sending
 *   their own updated video streams status.
 * @param {String} MUTE_VIDEO.message.muted If video stream is muted or not.
 * @param {String} MUTE_VIDEO.message.type The type of message.
 *
 * @param {String} MUTE_AUDIO A user's video mute status has changed.
 *   Sent when user has muted audio status changed.
 *   Received when a peer's muted audio status has changed.
 *   Sent in {{#crossLink "Skylink/_handleLocalMediaStreams:method"}}
 *   _handleLocalMediaStreams(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_muteAudioEventHandler:method"}}
 *   _muteAudioEventHandler(){{/crossLink}}.
 *
 * @param {JSON} MUTE_AUDIO.message The message object.
 * @param {String} MUTE_AUDIO.message.rid RoomId of the connected room.
 * @param {String} MUTE_AUDIO.message.mid PeerId of the peer that is sending
 *   their own updated audio stream status.
 * @param {String} MUTE_AUDIO.message.muted If audio stream is muted or not.
 * @param {String} MUTE_AUDIO.message.type The type of message.
 *
 * @param {String} PUBLIC_MESSAGE
 *   Sent when a user broadcasts message to all peers.
 *   Received when user receives a peer's broadcast message.
 *   Sent in {{#crossLink "Skylink/sendMessage:method"}}
 *   sendMessage(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_publicMessageHandler:method"}}
 *   _publicMessageHandler(){{/crossLink}}.
 *
 * @param {JSON} PUBLIC_MESSAGE.message The message object.
 * @param {JSON|String} PUBLIC_MESSAGE.message.data The data broadcasted
 * @param {String} PUBLIC_MESSAGE.message.rid RoomId of the connected room.
 * @param {String} PUBLIC_MESSAGE.message.cid CredentialId of the room.
 * @param {String} PUBLIC_MESSAGE.message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} PUBLIC_MESSAGE.message.type The type of message.
 *
 * @param {String} PRIVATE_MESSAGE
 *   Sent when a user sends a private message to a peers.
 *   Received when user receives a peer's private message targeted to user.
 *   Sent in {{#crossLink "Skylink/sendMessage:method"}}
 *   sendMessage(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_privateMessageHandler:method"}}
 *   _privateMessageHandler(){{/crossLink}}.
 *
 * @param {JSON} PRIVATE_MESSAGE.message The message object.
 * @param {JSON|String} PRIVATE_MESSAGE.message.data The data received.
 * @param {String} PRIVATE_MESSAGE.message.rid RoomId of the connected room.
 * @param {String} PRIVATE_MESSAGE.message.cid CredentialId of the room.
 * @param {String} PRIVATE_MESSAGE.message.mid PeerId of the peer that is sending a private
 *   broadcast message.
 * @param {String} PRIVATE_MESSAGE.message.type The type of message.
 *
 * @param {String} RESTART
 *   Sent when a user requires to restart a peer connection.
 *   Received when user receives a peer connection is restarted.
 *   Sent in {{#crossLink "Skylink/_restartPeerConnection:method"}}
 *   _restartPeerConnection(){{/crossLink}}.
 *   Received in {{#crossLink "Skylink/_restartHandler:method"}}.
 *
 * @param {String} RESTART.message.rid RoomId of the connected room.
 * @param {String} RESTART.message.mid PeerId of the peer that is sending the welcome shake.
 * @param {Boolean} [RESTART.message.receiveOnly=false] Peer to receive only
 * @param {Boolean} [RESTART.message.enableIceTrickle=false] Option to enable Ice trickle or not
 * @param {Boolean} [RESTART.message.enableDataChannel=false] Option to enable DataChannel or not
 * @param {String} RESTART.message.userInfo Peer's user information.
 * @param {JSON} RESTART.message.userInfo.settings Peer's stream settings
 * @param {Boolean|JSON} [RESTART.message.userInfo.settings.audio=false]
 * @param {Boolean} [RESTART.message.userInfo.settings.audio.stereo=false]
 * @param {Boolean|JSON} [RESTART.message.userInfo.settings.video=false]
 * @param {JSON} [RESTART.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [RESTART.message.userInfo.settings.video.resolution.width]
 * @param {Integer} [RESTART.message.userInfo.settings.video.resolution.height]
 * @param {Integer} [RESTART.message.userInfo.settings.video.frameRate]
 * @param {JSON} RESTART.message.userInfo.mediaStatus Peer stream status.
 * @param {Boolean} [RESTART.message.userInfo.mediaStatus.audioMuted=true]
 *   If peer's audio stream is muted.
 * @param {Boolean} [RESTART.message.userInfo.mediaStatus.videoMuted=true]
 *   If peer's video stream is muted.
 * @param {String|JSON} RESTART.message.userInfo.userData Peer custom data.
 * @param {String} RESTART.message.agent Browser agent.
 * @param {String} RESTART.message.version Browser version.
 * @param {String} RESTART.message.target PeerId of the peer targeted to receieve this message.
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
  GROUP: 'group'
};

/**
 * Checking if MCU exists in the room
 * @attribute _hasMCU
 * @type Boolean
 * @development true
 * @private
 * @since 0.5.4
 */
Skylink.prototype._hasMCU = false;


/**
 * Handles every incoming signaling message received.
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
 * - This occurs when the signaling server is warning us or wanting
 *   to move us out when the peer sends too much messages at the
 *   same tme.
 * @method _redirectHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.REDIRECT.message]
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
 * - This occurs when a peer's custom user data is updated.
 * @method _updateUserEventHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.UPDATE_USER.message]
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
 * - This occurs when a room lock status has changed.
 * @method _roomLockEventHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ROOM_LOCK.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_AUDIO.message]
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
 * - This occurs when a peer's video stream muted
 *   status has changed.
 * @method _muteVideoEventHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_VIDEO.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.BYE.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.IN_ROOM.message]
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
    userInfo: self.getPeerInfo()
  });
};

/**
 * Signaling server sends a enter message.
 * - SIG_TYPE: ENTER
 * - This occurs when a peer just entered the room.
 * - If we don't have a connection with the peer, send a welcome.
 * @method _enterHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ENTER.message]
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
  }, false, false, message.receiveOnly);
  self._peerInformations[targetMid] = message.userInfo || {};
  self._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };
  if (targetMid !== 'MCU') {
    self._trigger('peerJoined', targetMid, message.userInfo, false);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
    this._hasMCU = true;
  }
  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    userInfo: self.getPeerInfo(),
    target: targetMid,
    weight: weight
  });
};

/**
 * Signaling server sends a restart message.
 * - SIG_TYPE: RESTART
 * - This occurs when the other peer initiates the restart process
 *   by sending a restart message to signaling server.
 * @method _restartHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.RESTART.message]
 * @trigger handshakeProgress, peerRestart
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var targetMid = message.mid;

  // re-add information
  this._peerInformations[targetMid] = message.userInfo || {};
  this._peerInformations[targetMid].agent = {
    name: message.agent,
    version: message.version
  };
  this._restartPeerConnection(targetMid, false);

  message.agent = (!message.agent) ? 'chrome' : message.agent;
  this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
    message.enableIceTrickle : this._enableIceTrickle;
  this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
    message.enableDataChannel : this._enableDataChannel;

  // mcu has joined
  if (targetMid === 'MCU') {
    log.log([targetMid, null, message.type, 'MCU has restarted its connection']);
    this._hasMCU = true;
  }

  this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);

  // do a peer connection health check
  this._startPeerConnectionHealthCheck(targetMid);

  this._addPeer(targetMid, {
    agent: message.agent,
    version: message.version
  }, true, true, message.receiveOnly);
};

/**
 * Signaling server sends a welcome message.
 * - SIG_TYPE: WELCOME
 * - This occurs when we've just received a welcome.
 * - If there is no existing connection with this peer,
 *   create one, then set the remotedescription and answer.
 * @method _welcomeHandler
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.WELCOME.message]
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
  }
  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
    // user is not mcu
    if (targetMid !== 'MCU') {
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }
  }

  // do a peer connection health check
  this._startPeerConnectionHealthCheck(targetMid);

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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.OFFER.messa]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.CANDIDATE.message]
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
 * @param {JSON} message The message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ANSWER.message]
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
 * Send a message to one or all peer(s) in room.
 * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
 *   in JSON, so refrain from using map arrays.
 * - Message is sent using websockets, we don't ensure protection of your message content
 * with this method. Prefer using
 * {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.
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
  }, this._user.sid, this.getPeerInfo(), true);
};
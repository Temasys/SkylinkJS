/**
 * The Message protocol list. The <code>message</code> object is an
 * indicator of the expected parameters to be given and received.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @param {String} JOIN_ROOM Send to initiate the connection to the Room.
 *
 * @param {JSON} JOIN_ROOM.message Expected JOIN_ROOM data object format.
 * @param {String} JOIN_ROOM.message.rid Received rid from API web-server.
 * @param {String} JOIN_ROOM.message.uid Received uid from API web-server.
 * @param {String} JOIN_ROOM.message.cid Received cid from API web-server.
 * @param {String} JOIN_ROOM.message.userCred Received userCred from API web-server.
 * @param {String} JOIN_ROOM.message.timeStamp Received timeStamp from API web-server.
 * @param {String} JOIN_ROOM.message.apiOwner Received apiOwner from API web-server.
 * @param {String} JOIN_ROOM.message.roomCred Received roomCred from API web-server.
 * @param {String} JOIN_ROOM.message.start Received start from API web-server.
 * @param {String} JOIN_ROOM.message.len Received duration from API web-server.
 * @param {String} JOIN_ROOM.message.type Protocol step: <code>"joinRoom"</code>.
 *
 * @param {String} IN_ROOM Received as a response from server that User has joined
 *    the Room.
 * @param {JSON} IN_ROOM.message Expected IN_ROOM data object format.
 * @param {String} IN_ROOM.message.rid The roomId of the connected room.
 * @param {String} IN_ROOM.message.sid The User's userId.
 * @param {JSON} IN_ROOM.message.pc_config The Peer connection iceServers configuration.
 * @param {String} IN_ROOM.message.type Protocol step: <code>"inRoom"</code>.
 *
 * @param {String} ENTER Broadcasts to any Peers connected to the room to
 *    intiate a Peer connection.
 *
 * @param {JSON} ENTER.message Expected ENTER data object format.
 * @param {String} ENTER.message.rid The roomId of the connected Room.
 * @param {String} ENTER.message.mid The sender's peerId / userId.
 * @param {Boolean} [ENTER.message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {String} ENTER.message.agent The Peer's browser agent.
 * @param {String} ENTER.message.version The Peer's browser version.
 * @param {String} ENTER.message.userInfo The Peer's information.
 * @param {JSON} ENTER.message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [ENTER.message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [ENTER.message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [ENTER.message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [ENTER.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Integer} [ENTER.message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [ENTER.message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [ENTER.message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} ENTER.message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [ENTER.message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [ENTER.message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} ENTER.message.userInfo.userData
 *   The custom User data.
 * @param {String} ENTER.message.type Protocol step: <code>"enter"</code>.
 *
 * @param {String} WELCOME Send as a response to Peer's enter received. User starts creating
 *    offer to the Peer.
 *
 * @param {JSON} WELCOME.message Expected WELCOME data object format.
 * @param {String} WELCOME.message.rid The roomId of the connected Room.
 * @param {String} WELCOME.message.mid The sender's peerId / userId.
 * @param {Boolean} [WELCOME.message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {Boolean} [WELCOME.message.enableIceTrickle=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {Boolean} [WELCOME.message.enableDataChannel=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {String} WELCOME.message.agent The Peer's browser agent.
 * @param {String} WELCOME.message.version The Peer's browser version.
 * @param {String} WELCOME.message.userInfo The Peer's information.
 * @param {JSON} WELCOME.message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [WELCOME.message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [WELCOME.message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [WELCOME.message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [WELCOME.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Integer} [WELCOME.message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [WELCOME.message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [WELCOME.message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} WELCOME.message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [WELCOME.message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [WELCOME.message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} WELCOME.message.userInfo.userData
 *   The custom User data.
 * @param {String} WELCOME.message.target The peerId of the peer to respond the enter message to.
 * @param {Integer} WELCOME.message.weight The priority weight of the message. This is required
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
 * @param {String} WELCOME.message.type Protocol step: <code>"welcome"</code>.
 *
 * @param {String} OFFER Send when <code>createOffer</code> is completed and generated.
 *
 * @param {JSON} OFFER.message Expected OFFER data object format.
 * @param {String} OFFER.message.rid The roomId of the connected room.
 * @param {String} OFFER.message.mid The sender's peerId.
 * @param {String} OFFER.message.sdp The generated offer session description.
 * @param {String} OFFER.message.type Protocol step: <code>"offer"</code>.
 *
 * @param {String} ANSWER Send as a response to Peer's offer Message after <code>createAnswer</code>
 *   is called.
 *
 * @param {JSON} ANSWER.message Expected ANSWER data object format.
 * @param {String} ANSWER.message.rid The roomId of the connected room.
 * @param {String} ANSWER.message.sdp The generated answer session description.
 * @param {String} ANSWER.message.mid The sender's peerId.
 * @param {String} ANSWER.message.type Protocol step: <code>"answer"</code>.
 *
 * @param {String} CANDIDATE Send when an ICE Candidate is generated.
 *
 * @param {JSON} CANDIDATE.message Expected CANDIDATE data object format.
 * @param {String} CANDIDATE.message.rid The roomId of the connected room.
 * @param {String} CANDIDATE.message.mid The sender's peerId.
 * @param {String} CANDIDATE.message.sdp The ICE Candidate's session description.
 * @param {String} CANDIDATE.message.target The peerId of the targeted Peer.
 * @param {String} CANDIDATE.message.id The ICE Candidate's id.
 * @param {String} CANDIDATE.message.candidate The ICE Candidate's candidate object.
 * @param {String} CANDIDATE.message.label The ICE Candidate's label.
 * @param {String} CANDIDATE.message.type Protocol step: <code>"candidate"</code>.
 *
 * @param {String} BYE Received as a response from server that a Peer has left the Room.
 *
 * @param {JSON} BYE.message Expected BYTE data object format.
 * @param {String} BYE.message.rid The roomId of the connected Room.
 * @param {String} BYE.message.mid The peerId of the Peer that has left the Room.
 * @param {String} BYE.message.type Protocol step: <code>"bye"</code>.
 *
 * @param {String} REDIRECT Received as a warning from server when User is rejected or
 *   is jamming the server.
 *
 * @param {JSON} REDIRECT.message Expected REDIRECT data object format.
 * @param {String} REDIRECT.message.rid The roomId of the connected Room.
 * @param {String} REDIRECT.message.info The server's message.
 * @param {String} REDIRECT.message.action The action that User has to take on.
 *   [Rel: Skylink.SYSTEM_ACTION]
 * @param {String} REDIRECT.message.reason The reason of why the action is worked upon.
 *   [Rel: Skylink.SYSTEM_ACTION_REASON]
 * @param {String} REDIRECT.message.type Protocol step: <code>"redirect"</code>.
 *
 * @param {String} UPDATE_USER Broadcast when a User's information is updated to reflect the
 *   the changes on Peer's end.
 *
 * @param {JSON} UPDATE_USER.message Expected UPDATE_USER data object format.
 * @param {String} UPDATE_USER.message.rid The roomId of the connected Room.
 * @param {String} UPDATE_USER.message.mid The sender's peerId.
 * @param {JSON|String} UPDATE_USER.message.userData The updated User data.
 * @param {String} UPDATE_USER.message.type Protocol step: <code>"updateUserEvent"</code>.
 *
 * @param {String} ROOM_LOCK Broadcast to change the Room lock status.
 *
 * @param {JSON} ROOM_LOCK.message Expected ROOM_LOCK data object format.
 * @param {String} ROOM_LOCK.message.rid The roomId of the connected Room.
 * @param {String} ROOM_LOCK.message.mid The sender's peerId.
 * @param {String} ROOM_LOCK.message.lock The flag to indicate if the Room is locked or not
 * @param {String} ROOM_LOCK.message.type Protocol step: <code>"roomLockEvent"</code>.
 *
 * @param {String} MUTE_VIDEO Broadcast when User's video stream is muted or unmuted.
 *
 * @param {JSON} MUTE_VIDEO.message Expected MUTE_VIDEO data object format.
 * @param {String} MUTE_VIDEO.message.rid The roomId of the connected Room.
 * @param {String} MUTE_VIDEO.message.mid The sender's peerId.
 * @param {String} MUTE_VIDEO.message.muted The flag to indicate if the User's video
 *    stream is muted or not.
 * @param {String} MUTE_VIDEO.message.type Protocol step: <code>"muteVideoEvent"</code>.
 *
 * @param {String} MUTE_AUDIO Broadcast when User's audio stream is muted or unmuted.
 *
 * @param {JSON} MUTE_AUDIO.message Expected MUTE_AUDIO data object format.
 * @param {String} MUTE_AUDIO.message.rid The roomId of the connected Room.
 * @param {String} MUTE_AUDIO.message.mid The sender's peerId.
 * @param {String} MUTE_AUDIO.message.muted The flag to indicate if the User's audio
 *    stream is muted or not.
 * @param {String} MUTE_AUDIO.message.type Protocol step: <code>"muteAudioEvent"</code>.
 *
 * @param {String} PUBLIC_MESSAGE Broadcasts a Message object to all Peers in the Room.
 *
 * @param {JSON} PUBLIC_MESSAGE.message Expected PUBLIC_MESSAGE data object format.
 * @param {JSON|String} PUBLIC_MESSAGE.message.data The Message object.
 * @param {String} PUBLIC_MESSAGE.message.rid The roomId of the connected Room.
 * @param {String} PUBLIC_MESSAGE.message.cid The credentialId of the connected Room.
 * @param {String} PUBLIC_MESSAGE.message.mid The sender's peerId.
 * @param {String} PUBLIC_MESSAGE.message.type Protocol step: <code>"public"</code>.
 *
 * @param {String} PRIVATE_MESSAGE Sends a Message object to a Peer in the Room.
 *
 * @param {JSON} PRIVATE_MESSAGE.message The message object.
 * @param {JSON|String} PRIVATE_MESSAGE.message.data The Message object.
 * @param {String} PRIVATE_MESSAGE.message.rid The roomId of the connected Room.
 * @param {String} PRIVATE_MESSAGE.message.cid The credentialId of the connected Room.
 * @param {String} PRIVATE_MESSAGE.message.mid The sender's peerId.
 * @param {String} PRIVATE_MESSAGE.message.target The peerId of the targeted Peer.
 * @param {String} PRIVATE_MESSAGE.message.type Protocol step: <code>"private"</code>.
 *
 * @param {String} RESTART Sends when a Peer connection is restarted.
 *
 * @param {JSON} RESTART.message Expected RESTART data object format.
 * @param {String} RESTART.message.rid The roomId of the connected Room.
 * @param {String} RESTART.message.mid The sender's peerId / userId.
 * @param {Boolean} [RESTART.message.receiveOnly=false] The flag to prevent Peers from sending
 *   any Stream to the User but receive User's stream only.
 * @param {Boolean} [RESTART.message.enableIceTrickle=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {Boolean} [RESTART.message.enableDataChannel=false]
 *   The flag to forcefully enable or disable ICE Trickle for the Peer connection.
 * @param {String} RESTART.message.agent The Peer's browser agent.
 * @param {String} RESTART.message.version The Peer's browser version.
 * @param {String} RESTART.message.userInfo The Peer's information.
 * @param {JSON} RESTART.message.userInfo.settings The stream settings
 * @param {Boolean|JSON} [RESTART.message.userInfo.settings.audio=false]
 *   The flag to indicate if audio is enabled in the connection or not.
 * @param {Boolean} [RESTART.message.userInfo.settings.audio.stereo=false]
 *   The flag to indiciate if stereo should be enabled in OPUS connection.
 * @param {Boolean|JSON} [RESTART.message.userInfo.settings.video=false]
 *   The flag to indicate if video is enabled in the connection or not.
 * @param {JSON} [RESTART.message.userInfo.settings.video.resolution]
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 *   The video stream resolution.
 * @param {Integer} [RESTART.message.userInfo.settings.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [RESTART.message.userInfo.settings.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [RESTART.message.userInfo.settings.video.frameRate]
 *   The video stream maximum frame rate.
 * @param {JSON} RESTART.message.userInfo.mediaStatus The Peer's Stream status.
 *   This is used to indicate if connected video or audio stream is muted.
 * @param {Boolean} [RESTART.message.userInfo.mediaStatus.audioMuted=true]
 *   The flag to indicate that the Peer's audio stream is muted or disabled.
 * @param {Boolean} [RESTART.message.userInfo.mediaStatus.videoMuted=true]
 *   The flag to indicate that the Peer's video stream is muted or disabled.
 * @param {String|JSON} RESTART.message.userInfo.userData
 *   The custom User data.
 * @param {String} RESTART.message.target The peerId of the peer to respond the enter message to.
 * @param {String} RESTART.message.type Protocol step: <code>"restart"</code>.
 *
 * @param {String} STREAM Broadcast when a Stream has ended. This is temporal.
 *
 * @param {JSON} STREAM.message Expected STREAM data object format.
 * @param {String} STREAM.message.rid The roomId of the connected Room.
 * @param {String} STREAM.message.mid The peerId of the sender.
 * @param {String} STREAM.message.status The MediaStream status.
 * <ul>
 * <li><code>ended</code>: MediaStream has ended</li>
 * </ul>
 * @param {String} STREAM.message.type Protocol step: <code>"stream"</code>.
 *
 * @param {String} GROUP Messages are bundled together when messages are sent too fast to
 *   prevent server redirects over sending less than 1 second interval.
 *
 * @param {JSON} GROUP.message Expected GROUP data object format.
 * @param {Array} GROUP.message.list The list of bundled messages.
 * @param {Array} GROUP.message.list.<message> The Message object.
 * @param {String} GROUP.message.type Protocol step: <code>"group"</code>.
 *
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.REDIRECT.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.UPDATE_USER.message]
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the ROOM_LOCK Message event.
 * @method _roomLockEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ROOM_LOCK.message]
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
    this._peerInformations[targetMid], false);
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the MUTE_VIDEO Message event.
 * @method _muteVideoEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.MUTE_VIDEO.message]
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
      this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Handles the STREAM Message event.
 * @method _streamEventHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.STREAM.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.BYE.message]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE.message]
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
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Handles the PUBLIC_MESSAGE Message event.
 * @method _publicMessageHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE.message]
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
  }, targetMid, this._peerInformations[targetMid], false);
};

/**
 * Handles the IN_ROOM Message event.
 * @method _inRoomHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.IN_ROOM.message]
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
    userInfo: self.getPeerInfo()
  });
};

/**
 * Handles the ENTER Message event.
 * @method _enterHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ENTER.message]
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

    // disable mcu for incoming peer sent by MCU
    if (message.agent === 'MCU') {
    	this._enableDataChannel = false;

    	/*if (window.webrtcDetectedBrowser === 'firefox') {
    		this._enableIceTrickle = false;
    	}*/
    }
  } else {
    log.log([targetMid, null, message.type, 'MCU has joined'], message.userInfo);
    this._hasMCU = true;
    this._enableDataChannel = false;
  }

  var weight = (new Date()).valueOf();
  self._peerHSPriorities[targetMid] = weight;
  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform,
    userInfo: self.getPeerInfo(),
    target: targetMid,
    weight: weight
  });
};

/**
 * Handles the RESTART Message event.
 * @method _restartHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.RESTART.message]
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
    log.warn([peerId, 'PeerConnection', null, 'Restart functionality for peer\'s connection ' +
      'for MCU is not yet supported']);
    return;
  }

  self.lastRestart = message.lastRestart;

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
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
  	self._addPeer(targetMid, {
	    agent: message.agent,
	    version: message.version,
	    os: message.os
	  }, true, true, message.receiveOnly);

    self._trigger('peerRestart', targetMid, self._peerInformations[targetMid] || {}, false);

	// do a peer connection health check
  	self._startPeerConnectionHealthCheck(targetMid);
  });
};

/**
 * Handles the WELCOME Message event.
 * @method _welcomeHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.WELCOME.message]
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
    this._enableDataChannel = false;
  }
  if (!this._peerInformations[targetMid]) {
    this._peerInformations[targetMid] = message.userInfo || {};
    this._peerInformations[targetMid].agent = {
      name: message.agent,
      version: message.version
    };
    // disable mcu for incoming peer sent by MCU
    if (message.agent === 'MCU') {
    	this._enableDataChannel = false;
    }
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
  }, true, restartConn, message.receiveOnly);
};

/**
 * Handles the OFFER Message event.
 * @method _offerHandler
 * @param {JSON} message The Message object received.
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.OFFER.messa]
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.CANDIDATE.message]
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
    sdpMid: message.id,
    //label: index
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
 *   [Rel: Skylink._SIG_MESSAGE_TYPE.ANSWER.message]
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
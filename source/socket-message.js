/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
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
 *   <li>Sends socket connection message to all targeted Peers via Signaling server. <ol>
 *   <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers parameter payload
 *   <code>message.isDataChannel</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._peerInformations);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._socket || !this._user) {
    log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._hasMCU && !this._peerInformations[peerId]) {
      log.error([peerId, 'Socket', null, 'Dropping of sending message to Peer as ' +
        'Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (isPrivate) {
      log.debug([peerId, 'Socket', null, 'Sending private message to Peer']);

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

  if (listOfPeers.length === 0) {
    log.warn('Currently there are no Peers to send message to (unless the message is queued and ' +
      'there are Peer connected by then).');
  }

  if (!isPrivate) {
    log.debug([null, 'Socket', null, 'Broadcasting message to Peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  } else {
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: targetPeerId || null,
      listOfPeers: listOfPeers,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, this.getPeerInfo(), true);
  }
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Starts a recording session.
 * @method startRecording
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>START</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>startRecording()</code> error when starting a new recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggered <code>recordingId</code> parameter payload.</small>
 * @example
 *   // Example 1: Start recording session
 *   skylinkDemo.startRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has started. ID ->", success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is an existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to start recording session. <ol>
 *   <li>If recording session has been started successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START</code>.</li></ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.startRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start recording as MCU is not connected';
    log.error(noMCUError);
    self._handleRecordingStats('error-no-mcu-start', null, null, noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (self._currentRecordingId) {
    var hasRecordingSessionError = 'Unable to start recording as there is an existing recording in-progress';
    log.error(hasRecordingSessionError);
    // TO CHECK: We added new state type "error-start-when-active".
    self._handleRecordingStats('error-start-when-active', self._currentRecordingId, null, hasRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(hasRecordingSessionError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('recordingState', function (state, recordingId) {
      callback(null, recordingId);
    }, function (state) {
      return state === self.RECORDING_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._handleRecordingStats('request-start');

  log.debug(['MCU', 'Recording', null, 'Starting recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Stops a recording session.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>STOP</code>
 *   or as <code>LINK</code> when the value of <code>callbackSuccessWhenLink</code> is <code>true</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>stopRecording()</code> error when stopping current recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 * - When <code>callbackSuccessWhenLink</code> value is <code>false</code>, it is defined as string as
 *   the recording session ID.
 * - when <code>callbackSuccessWhenLink</code> value is <code>true</code>, it is defined as an object as
 *   the recording session information.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {JSON} callback.success.recordingId The recording session ID.
 * @param {JSON} callback.success.link The recording session mixin videos link in
 *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 * @param {Boolean} [callbackSuccessWhenLink=false] The flag if <code>callback</code> function provided
 *   should result in success only when <a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggering <code>state</code> parameter payload as <code>LINK</code>.
 * @method stopRecording
 * @example
 *   // Example 1: Stop recording session
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has stopped. ID ->", success);
 *   });
 *
 *   // Example 2: Stop recording session with mixin videos link
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has compiled with links ->", success.link);
 *   }, true);
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is no existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If existing recording session recording time has not elapsed more than 4 seconds:
 *   <small>4 seconds is mandatory for recording session to ensure better recording
 *   experience and stability.</small> <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to stop recording session: <ol>
 *   <li>If recording session has been stopped successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START</code>.
 *   <li>MCU starts mixin recorded session videos: <ol>
 *   <li>If recording session has been mixin successfully with links: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LINK</code>.<li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.<li><b>ABORT</b> and return error.</ol></li>
 *   </ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.stopRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop recording as MCU is not connected';
    log.error(noMCUError);
    self._handleRecordingStats('error-no-mcu-stop', null, null, noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (!self._currentRecordingId) {
    var noRecordingSessionError = 'Unable to stop recording as there is no recording in-progress';
    log.error(noRecordingSessionError);
    // TO CHECK: We added new state type "error-stop-when-inactive".
    self._handleRecordingStats('error-stop-when-inactive', null, null, noRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(noRecordingSessionError), null);
    }
    return;
  }

  if (self._recordingStartInterval) {
    var recordingSecsRequiredError = 'Unable to stop recording as 4 seconds has not been recorded yet';
    log.error(recordingSecsRequiredError);
    self._handleRecordingStats('error-min-stop', self._currentRecordingId, null, recordingSecsRequiredError);
    if (typeof callback === 'function') {
      callback(new Error(recordingSecsRequiredError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    var expectedRecordingId = self._currentRecordingId;

    self.once('recordingState', function (state, recordingId, link, error) {
      callback(null, recordingId);

    }, function (state, recordingId) {
      if (expectedRecordingId === recordingId) {
        return state === self.RECORDING_STATE.STOP;
      }
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._handleRecordingStats('request-stop', self._currentRecordingId);

  log.debug(['MCU', 'Recording', null, 'Stopping recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Gets the list of current recording sessions since User has connected to the Room.
 * @method getRecordings
 * @return {JSON} The list of recording sessions.<ul>
 *   <li><code>#recordingId</code><var><b>{</b>JSON<b>}</b></var><p>The recording session.</p><ul>
 *   <li><code>active</code><var><b>{</b>Boolean<b>}</b></var><p>The flag that indicates if the recording session is currently active.</p></li>
 *   <li><code>state</code><var><b>{</b>Number<b>}</b></var><p>The current recording state. [Rel: Skylink.RECORDING_STATE]</p></li>
 *   <li><code>startedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session started DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the start event is received.</small></p></li>
 *   <li><code>endedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session ended DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the stop event is received.</small>
 *   <small>Defined only after <code>state</code> has triggered <code>STOP</code>.</small></p></li>
 *   <li><code>mixingDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session mixing completed DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the mixing completed event is received.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>links</code><var><b>{</b>JSON<b>}</b></var><p>The recording session links.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>error</code><var><b>{</b>Error<b>}</b></var><p>The recording session error.
 *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small></p></li></ul></li></ul>
 * @example
 *   // Example 1: Get recording sessions
 *   skylinkDemo.getRecordings();
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getRecordings = function () {
  return clone(this._recordings);
};

/**
 * Function that handles and processes the socket message received.
 * @method _processSigMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(message, session) {
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, 'Socket', message.type, 'Received from peer ->'], clone(message));
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, 'Socket', message.type, 'Ignoring message ->'], clone(message));
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
  case this._SIG_MESSAGE_TYPE.RECORDING:
    this._recordingEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RTMP:
    this._rtmpEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.END_OF_CANDIDATES:
    this._endOfCandidatesHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER_ACK:
    this._answerAckHandler(message);
    break;
  default:
    log.error([message.mid, 'Socket', message.type, 'Unsupported message ->'], clone(message));
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
 * Function that handles the "endOfCandidates" socket message received.
 * See confluence docs for the "endOfCandidates" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _endOfCandidatesHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._endOfCandidatesHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    return;
  }

  self._peerEndOfCandidatesCounter[targetMid].expectedLen = message.noOfExpectedCandidates || 0;
  self._handleIceGatheringStats('complete', targetMid, true);
  self._signalingEndOfCandidates(targetMid);
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
  self._handleSessionStats(message);
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
  self._handleSessionStats(message);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    target: message.target,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._initOptions.enableIceTrickle,
    enableDataChannel: self._initOptions.enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  if (self._hasMCU) {
    enterMsg.target = 'MCU';
  }

  self._sendChannelMessage(enterMsg);
  self._handleSessionStats(enterMsg);
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

  this._handleSessionStats(message);

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
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].userData) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].userData = message.stamp;
    }
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
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
  this._trigger('roomLock', message.lock, targetMid, this.getPeerInfo(targetMid), false);
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
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].audioMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].audioMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
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
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].videoMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].videoMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
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

  if (this._peerInformations[targetMid] && message.streamId) {
    this._streamsSession[targetMid] = this._streamsSession[targetMid] || {};
    if (message.status === 'ended') {
      if (message.settings && typeof message.settings === 'object' &&
        typeof this._streamsSession[targetMid][message.streamId] === 'undefined') {
        this._streamsSession[targetMid][message.streamId] = {
          audio: message.settings.audio,
          video: message.settings.video
        };
      }

      this._handleEndedStreams(targetMid, message.streamId);
  	}
  } else {
    // Probably left the room already
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
 * Handles the RECORDING Protocol message event received from the platform signaling.
 * @method _recordingEventHandler
 * @param {JSON} message The message object received from platform signaling.
 *    This should contain the <code>RECORDING</code> payload.
 * @param {String} message.url The recording URL if mixing has completed.
 * @param {String} message.action The recording action received.
 * @param {String} message.error The recording error exception received.
 * @private
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._recordingEventHandler = function (message) {
  var self = this;

  log.debug(['MCU', 'Recording', null, 'Received recording message ->'], message);

  if (message.action === 'on') {
    self._handleRecordingStats('start', message.recordingId);

    if (!self._recordings[message.recordingId]) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Started recording']);

      self._currentRecordingId = message.recordingId;
      self._recordings[message.recordingId] = {
        active: true,
        state: self.RECORDING_STATE.START,
        startedDateTime: (new Date()).toISOString(),
        endedDateTime: null,
        mixingDateTime: null,
        links: null,
        error: null
      };
      self._recordingStartInterval = setTimeout(function () {
        log.log(['MCU', 'Recording', message.recordingId, '4 seconds has been recorded. Recording can be stopped now']);
        self._recordingStartInterval = null;
      }, 4000);
      self._trigger('recordingState', self.RECORDING_STATE.START, message.recordingId, null, null);
    }

  } else if (message.action === 'off') {
    self._handleRecordingStats('stop', message.recordingId);

    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received request of "off" but the session is empty']);
      return;
    }

    self._currentRecordingId = null;

    if (self._recordingStartInterval) {
      clearTimeout(self._recordingStartInterval);
      log.warn(['MCU', 'Recording', message.recordingId, 'Recording stopped abruptly before 4 seconds']);
      self._recordingStartInterval = null;
    }

    log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording']);

    self._recordings[message.recordingId].active = false;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.STOP;
    self._recordings[message.recordingId].endedDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, null);

  } else {
    var recordingError = new Error(message.error || 'Unknown error');

    self._handleRecordingStats('error', message.recordingId, null, recordingError.message);

    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received error but the session is empty ->'], recordingError);
      return;
    }

    log.error(['MCU', 'Recording', message.recordingId, 'Recording failure ->'], recordingError);

    self._recordings[message.recordingId].state = self.RECORDING_STATE.ERROR;
    self._recordings[message.recordingId].error = recordingError;

    if (self._recordings[message.recordingId].active) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording abruptly']);
      self._recordings[message.recordingId].active = false;
      //self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, recordingError);
    }

    self._trigger('recordingState', self.RECORDING_STATE.ERROR, message.recordingId, null, recordingError);
  }
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
  self._room.connection.peerConfig = self._setIceServers((message.pc_config || {}).iceServers || []);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = message.tieBreaker + (self._initOptions.priorityWeightScheme === self.PRIORITY_WEIGHT_SCHEME.AUTO ?
    0 : (self._initOptions.priorityWeightScheme === self.PRIORITY_WEIGHT_SCHEME.ENFORCE_OFFERER ? 2e+15 : -(2e+15)));

  self._handleSessionStats(message);
  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var streamId = null;

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    streamId = self._streams.screenshare.stream.id || self._streams.screenshare.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.screenshare.stream, true, self.getPeerInfo(), true, streamId);
  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    streamId = self._streams.userMedia.stream.id || self._streams.userMedia.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo(), false, streamId);
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: AdapterJS.webrtcDetectedBrowser,
    version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._initOptions.enableIceTrickle,
    enableDataChannel: self._initOptions.enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  if (self._hasMCU) {
    enterMsg.target = 'MCU';
  }

  self._sendChannelMessage(enterMsg);
  self._handleSessionStats(enterMsg);
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
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "enter" received ->'], message);
  self._handleNegotiationStats('enter', targetMid, message, true);

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "enter" for parentId or publishOnly case ->'], message);
    return;
  }

  var processPeerFn = function (cert) {
    if ((!self._peerInformations[targetMid] && !self._hasMCU) || (self._hasMCU && !self._peerInformations['MCU'])) {
      isNewPeer = true;

      self._peerInformations[targetMid] = userInfo;

      var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
        !!userInfo.settings.video.screenshare;

      self._addPeer(targetMid, cert || null, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, message.receiveOnly, hasScreenshare);

      if (targetMid === 'MCU') {
        log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

        self._hasMCU = true;
        self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
        self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

      } else {
        self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
      }

      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    }

    if (self._hasMCU && targetMid !== self._user.sid) {
      self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
    }

    self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };

    if (self._hasMCU !== true) {
      var welcomeMsg = {
        type: self._SIG_MESSAGE_TYPE.WELCOME,
        mid: self._user.sid,
        rid: self._room.id,
        enableIceTrickle: self._initOptions.enableIceTrickle,
        enableDataChannel: self._initOptions.enableDataChannel,
        enableIceRestart: self._enableIceRestart,
        agent: AdapterJS.webrtcDetectedBrowser,
        version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
        receiveOnly: self.getPeerInfo().config.receiveOnly,
        os: window.navigator.platform,
        userInfo: self._getUserInfo(targetMid),
        target: targetMid,
        weight: self._peerPriorityWeight,
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: self.SM_PROTOCOL_VERSION,
        DTProtocolVersion: self.DT_PROTOCOL_VERSION
      };

      if (self._publishOnly) {
        welcomeMsg.publishOnly = {
          type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
        };
      }

      if (self._parentId) {
        welcomeMsg.parentId = self._parentId;
      }

      self._sendChannelMessage(welcomeMsg);
      self._handleNegotiationStats('welcome', targetMid, welcomeMsg, false);
    }

    if (isNewPeer) {
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }
  };

  if (self._peerConnectionConfig.certificate !== self.PEER_CERTIFICATE.AUTO &&
    typeof RTCPeerConnection.generateCertificate === 'function') {
    var certOptions = {};
    if (self._peerConnectionConfig.certificate === self.PEER_CERTIFICATE.ECDSA) {
      certOptions = {
        name: 'ECDSA',
        namedCurve: 'P-256'
      };
    } else {
      certOptions = {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      };
    }
    RTCPeerConnection.generateCertificate(certOptions).then(function (cert) {
      processPeerFn(cert);
    }, function () {
      processPeerFn();
    });
  } else {
    processPeerFn();
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
  var trackCount = message.trackCount;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  if (trackCount) {
    self._currentRequestedTracks = trackCount;
  }

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "restart" received ->'], message);
  self._handleNegotiationStats('restart', targetMid, message, true);

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, 'RTCPeerConnection', null, 'Peer does not have an existing session. Ignoring restart process.']);
    return;
  }

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "restart" for parentId or publishOnly case ->'], message);
    return;
  }

  if (self._hasMCU && !self._initOptions.mcuUseRenegoRestart) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Dropping restart request as MCU does not support re-negotiation. ' +
      'Restart workaround is to re-join Room for Peer.']);
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, false);
    return;
  }

  self._peerInformations[targetMid] = userInfo;
  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid].len = 0;

  // Make peer with highest weight do the offer
  if (self._peerPriorityWeight > message.weight) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Re-negotiating new offer/answer.']);

    if (self._peerMessagesStamps[targetMid].hasRestart) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "restart" received.']);
      return;
    }

    self._peerMessagesStamps[targetMid].hasRestart = true;
    self._doOffer(targetMid, message.doIceRestart === true, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation.']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(targetMid),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: message.doIceRestart === true,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      isRestartResend: true,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION,
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._sendChannelMessage(restartMsg);
    self._handleNegotiationStats('restart', targetMid, restartMsg, false);
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, message.doIceRestart === true);
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
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var trackCount = message.trackCount;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  if (trackCount) {
    self._currentRequestedTracks = trackCount;
  }

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "welcome" received ->'], message);
  self._handleNegotiationStats('welcome', targetMid, message, true);

  // Ignore if: User is publishOnly and MCU is enabled
  //          : User is parent and parentId is defined and matches
  //          : User is child and parent matches
  // Don't if : Is MCU
  if (targetMid !== 'MCU' && ((self._parentId && self._parentId === targetMid) ||
    (self._hasMCU && self._publishOnly) || (message.parentId && self._user && self._user.sid &&
    message.parentId === self._user.sid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "welcome" for parentId or publishOnly case ->'], message);
    return;
  }

  var processPeerFn = function (cert) {
    if ((!self._peerInformations[targetMid] && !self._hasMCU) || (self._hasMCU && !self._peerInformations['MCU'])) {
      isNewPeer = true;

      self._peerInformations[targetMid] = userInfo;

      var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
        !!userInfo.settings.video.screenshare;

      self._addPeer(targetMid, cert || null, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, message.receiveOnly, hasScreenshare);

      if (targetMid === 'MCU') {
        log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);
        self._hasMCU = true;
        self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

      } else {
        self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
      }

      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    }

    if (self._hasMCU && Array.isArray(message.peersInRoom) && message.peersInRoom.length) {
      var userId = self._user.sid;
      for (var peersInRoomIndex = 0; peersInRoomIndex < message.peersInRoom.length; peersInRoomIndex++) {
        var _PEER_ID = message.peersInRoom[peersInRoomIndex].mid;
        if (_PEER_ID !== userId) {
          self._trigger('peerJoined', _PEER_ID, self.getPeerInfo(_PEER_ID), false);
        }
      }
    }

    self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0,
      hasWelcome: false
    };

    if (self._hasMCU || self._peerPriorityWeight > message.weight) {
      if (self._peerMessagesStamps[targetMid].hasWelcome) {
        log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "welcome" received.']);
        return;
      }

      log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation']);

      self._peerMessagesStamps[targetMid].hasWelcome = true;
      self._doOffer(targetMid, false, {
        agent: userInfo.agent.name,
        version: userInfo.agent.version,
        os: userInfo.agent.os
      }, true);

    } else {
      log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start negotiation.']);

      var welcomeMsg = {
        type: self._SIG_MESSAGE_TYPE.WELCOME,
        mid: self._user.sid,
        rid: self._room.id,
        enableIceTrickle: self._initOptions.enableIceTrickle,
        enableDataChannel: self._initOptions.enableDataChannel,
        enableIceRestart: self._enableIceRestart,
        receiveOnly: self.getPeerInfo().config.receiveOnly,
        agent: AdapterJS.webrtcDetectedBrowser,
        version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
        os: window.navigator.platform,
        userInfo: self._getUserInfo(targetMid),
        target: targetMid,
        weight: self._peerPriorityWeight,
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: self.SM_PROTOCOL_VERSION,
        DTProtocolVersion: self.DT_PROTOCOL_VERSION
      };

      if (self._publishOnly) {
        welcomeMsg.publishOnly = {
          type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
        };
      }

      if (self._parentId) {
        welcomeMsg.parentId = self._parentId;
      }

      self._sendChannelMessage(welcomeMsg);
      self._handleNegotiationStats('welcome', targetMid, welcomeMsg, false);
    }
  };

  if (self._peerConnectionConfig.certificate !== self.PEER_CERTIFICATE.AUTO &&
    typeof RTCPeerConnection.generateCertificate === 'function') {
    var certOptions = {};
    if (self._peerConnectionConfig.certificate === self.PEER_CERTIFICATE.ECDSA) {
      certOptions = {
        name: 'ECDSA',
        namedCurve: 'P-256'
      };
    } else {
      certOptions = {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      };
    }
    RTCPeerConnection.generateCertificate(certOptions).then(function (cert) {
      processPeerFn(cert);
    }, function () {
      processPeerFn();
    });
  } else {
    processPeerFn();
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

  log.log([targetMid, null, message.type, 'Received offer from peer. Session description:'], clone(message));

  var offer = {
    type: 'offer',
    sdp: self._hasMCU ? message.sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : message.sdp
  };

  if (targetMid === 'MCU') {
    self._transceiverIdPeerIdMap = message.transceiverIdPeerIdMap || {};
  }

  self._handleNegotiationStats('offer', targetMid, offer, true);

  if (!pc) {
    if(!self._hasMCU) {
      log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    }
    if (targetMid !== 'MCU' && self._hasMCU && self._peerConnections['MCU']) {
      log.warn([targetMid, null, message.type, 'Peer connection object with MCU ' +
      'already exists. Dropping the offer.']);
    }
    self._handleNegotiationStats('dropped_offer', targetMid, offer, true, 'Peer connection does not exists');
    return;
  }

  /*if (pc.localDescription ? !!pc.localDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.localDescription);
    return;
  }*/

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Session description object created'], offer);

  // offer.sdp = self._removeSDPFilteredCandidates(targetMid, offer);
  // offer.sdp = self._setSDPCodec(targetMid, offer);
  // offer.sdp = self._setSDPBitrate(targetMid, offer);
  // offer.sdp = self._setSDPCodecParams(targetMid, offer);
  // offer.sdp = self._removeSDPCodecs(targetMid, offer);
  // offer.sdp = self._removeSDPREMBPackets(targetMid, offer);
  // offer.sdp = self._handleSDPConnectionSettings(targetMid, offer, 'remote');
  // offer.sdp = self._removeSDPUnknownAptRtx(targetMid, offer);

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote offer ->'], offer.sdp);

  // This is always the initial state. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"stable" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.resend
      });
    self._handleNegotiationStats('dropped_offer', targetMid, offer, true, 'Peer connection state is "' + pc.signalingState + '"');
    return;
  }

  if (self._bufferedLocalOffer[targetMid] && self._peerPriorityWeight > message.weight) {
    log.warn([targetMid, null, message.type, 'Dropping the received offer with self.weight greater than incoming offer weight'], {
      selfWeight: self._peerPriorityWeight,
      messageWeight: message.weight
    });
    self._handleNegotiationStats('dropped_offer', targetMid, offer, true, 'self weight is greater than incoming offer weight.');
    return;
  }

  self._bufferedLocalOffer[targetMid] = null;

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of setting local offer as there is another ' +
      'sessionDescription being processed ->'], offer);
    self._handleNegotiationStats('dropped_offer', targetMid, offer, true, 'Peer connection is currently processing an existing sdp');
    return;
  }

  pc.processingRemoteSDP = true;
  pc.processingLocalSDP = false;

  if (message.userInfo) {
    self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
  }

  // self._parseSDPMediaStreamIDs(targetMid, offer);

  var onSuccessCbFn = function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;

    self._handleNegotiationStats('set_offer', targetMid, offer, true);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  };

  var onErrorCbFn = function(error) {
    pc.processingRemoteSDP = false;

    self._handleNegotiationStats('error_set_offer', targetMid, offer, true, error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState,
      offer: offer
    });
  };

  if (self.getPeerInfo(targetMid).agent.name === 'edge' && offer.sdp[offer.sdp.length - 1] !== '\n' && offer.sdp[offer.sdp.length - 2] !== '\r') {
    offer.sdp = offer.sdp + '\r\n';
  }

  pc.setRemoteDescription(new RTCSessionDescription(offer), onSuccessCbFn, onErrorCbFn);
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

  if (!message.candidate && !message.id) {
    log.warn([targetMid, 'RTCIceCandidate', null, 'Received invalid ICE candidate message ->'], message);
    return;
  }

  var canId = 'can-' + (new Date()).getTime();
  var candidateType = message.candidate.split(' ')[7] || '';
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate,
    sdpMid: message.id
  });

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Received ICE candidate ->'], candidate);

  this._handleIceCandidateStats('received', targetMid, canId, candidate);
  this._peerEndOfCandidatesCounter[targetMid] = this._peerEndOfCandidatesCounter[targetMid] || {};
  this._peerEndOfCandidatesCounter[targetMid].len = this._peerEndOfCandidatesCounter[targetMid].len || 0;
  this._peerEndOfCandidatesCounter[targetMid].hasSet = false;
  this._peerEndOfCandidatesCounter[targetMid].len++;

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.RECEIVED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  if (!(this._peerConnections[targetMid] &&
    this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    this._handleIceCandidateStats('process_failed', targetMid, canId, candidate, 'Peer connection does not exist');
    this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    this._signalingEndOfCandidates(targetMid);
    return;
  }

  if (this._initOptions.filterCandidatesType[candidateType]) {
    if (!(this._hasMCU && this._initOptions.forceTURN)) {
      log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping received ICE candidate as ' +
        'it matches ICE candidate filtering flag ->'], candidate);
      this._handleIceCandidateStats('dropped', targetMid, canId, candidate);
      this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
        targetMid, canId, candidateType, {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      }, new Error('Dropping of processing ICE candidate as it matches ICE candidate filtering flag.'));
      this._signalingEndOfCandidates(targetMid);
      return;
    }

    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Not dropping received ICE candidate as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured ->'], candidate);
  }

  // if (this._peerConnections[targetMid].remoteDescription && this._peerConnections[targetMid].remoteDescription.sdp &&
  //   this._peerConnections[targetMid].localDescription && this._peerConnections[targetMid].localDescription.sdp) {

  var pc = this._peerConnections[targetMid];
  if (pc.signalingState === this.PEER_CONNECTION_STATE.STABLE && pc.processingLocalSDP === false && pc.processingRemoteSDP === false) {
    this._addIceCandidate(targetMid, canId, candidate);
  } else {
    this._addIceCandidateToQueue(targetMid, canId, candidate);
  }

  this._signalingEndOfCandidates(targetMid);

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[candidateType].push({
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate
  });
};

/**
 * Function that handles the "answerAck" socket message received.
 * See confluence docs for the "answerAck" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _answerAckHandler
 * @private
 * @for Skylink
 * @since 1.0.0
 */
Skylink.prototype._answerAckHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  self.renegotiateIfNeeded(targetMid).then(function(shouldRenegotiate) {
    if (shouldRenegotiate) {
     self.refreshConnection(targetMid);
    }
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
  var pc = self._peerConnections[targetMid];

  if (targetMid === 'MCU') {
    self._transceiverIdPeerIdMap = message.transceiverIdPeerIdMap || {};
  }

  log.log([targetMid, null, message.type, 'Received answer from peer. Session description:'], clone(message));

  var answer = {
    type: 'answer',
    sdp: self._hasMCU ? message.sdp.replace(/\r\n/g, '\n').split('\n').join('\r\n') : message.sdp
  };

  self._handleNegotiationStats('answer', targetMid, answer, true);

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object not found. Unable to setRemoteDescription for answer']);
    self._handleNegotiationStats('dropped_answer', targetMid, answer, true, 'Peer connection does not exist');
    return;
  }

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Session description object created'], answer);

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

  answer.sdp = self._removeSDPFilteredCandidates(targetMid, answer);
  answer.sdp = self._setSDPCodec(targetMid, answer);
  answer.sdp = self._setSDPBitrate(targetMid, answer);
  answer.sdp = self._setSDPCodecParams(targetMid, answer);
  answer.sdp = self._removeSDPCodecs(targetMid, answer);
  answer.sdp = self._removeSDPREMBPackets(targetMid, answer);
  answer.sdp = self._handleSDPConnectionSettings(targetMid, answer, 'remote');
  answer.sdp = self._removeSDPUnknownAptRtx(targetMid, answer);
  answer.sdp = self._setSCTPport(targetMid, answer);

  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    self._setOriginalDTLSRole(answer, true);
  }

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote answer ->'], answer.sdp);

  /*
    Removeing this below if condition in favor of this ticket: https://jira.temasys.com.sg/browse/ESS-1632
  */
  // This should be the state after offer is received. or even after negotiation is successful
  // if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
  //   log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
  //     '"have-local-offer" state for re-negotiation. Dropping message.'], {
  //       signalingState: pc.signalingState,
  //       isRestart: !!message.restart
  //     });
  //   self._handleNegotiationStats('dropped_answer', targetMid, answer, true, 'Peer connection state is "' + pc.signalingState + '"');
  //   return;
  // }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of setting local answer as there is another ' +
      'sessionDescription being processed ->'], answer);
    self._handleNegotiationStats('dropped_answer', targetMid, answer, true, 'Peer connection is currently processing an existing sdp');
    return;
  }

  pc.processingRemoteSDP = true;
  pc.processingLocalSDP = true;

  if (message.userInfo) {
    self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
  }

  self._parseSDPMediaStreamIDs(targetMid, answer);


  var onSuccessCbFn = function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;

    // FIX for Chrome 75
    if (AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion === 75 && pc.getSenders()[0].transport) {
        var statsInterval = null;
        pc.getSenders()[0].transport.onstatechange = function(evt) {
            var iceConnectionState = evt.target.state;

            if (iceConnectionState === 'connecting') {
                iceConnectionState = self.ICE_CONNECTION_STATE.CHECKING;
            }

            log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

            self._handleIceConnectionStats(pc.iceConnectionState, targetMid);
            self._trigger('iceConnectionState', iceConnectionState, targetMid);

            if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._initOptions.enableIceTrickle) {
                self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
            }

            if (self._peerConnStatus[targetMid]) {
                self._peerConnStatus[targetMid].connected = [self.ICE_CONNECTION_STATE.COMPLETED,
                    self.ICE_CONNECTION_STATE.CONNECTED].indexOf(iceConnectionState) > -1;
            }

            if (!statsInterval && [self.ICE_CONNECTION_STATE.CONNECTED, self.ICE_CONNECTION_STATE.COMPLETED].indexOf(iceConnectionState) > -1) {
                statsInterval = true;

                // Do an initial getConnectionStatus() to backfill the first retrieval in order to do (currentTotalStats - lastTotalStats).
                self.getConnectionStatus(targetMid, function () {
                    statsInterval = setInterval(function () {
                        if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
                            clearInterval(statsInterval);
                            return;
                        }
                        self._handleBandwidthStats(targetMid);
                    }, 20000);
                });
            }

            if (!self._hasMCU && [self.ICE_CONNECTION_STATE.CONNECTED, self.ICE_CONNECTION_STATE.COMPLETED].indexOf(
                iceConnectionState) > -1 && !!self._bandwidthAdjuster && !bandwidth && AdapterJS.webrtcDetectedBrowser !== 'edge' &&
                (((self._peerInformations[targetMid] || {}).agent || {}).name || 'edge') !== 'edge') {
                var currentBlock = 0;
                var formatTotalFn = function (arr) {
                    var total = 0;
                    for (var i = 0; i < arr.length; i++) {
                        total += arr[i];
                    }
                    return total / arr.length;
                };
                bandwidth = {
                    audio: { send: [], recv: [] },
                    video: { send: [], recv: [] }
                };
                var pullInterval = setInterval(function () {
                    if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
                        self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster || !self._peerBandwidth[targetMid]) {
                        clearInterval(pullInterval);
                        return;
                    }
                    self._retrieveStats(targetMid, function (err, stats) {
                        if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
                            self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster) {
                            clearInterval(pullInterval);
                            return;
                        }
                        if (err) {
                            bandwidth.audio.send.push(0);
                            bandwidth.audio.recv.push(0);
                            bandwidth.video.send.push(0);
                            bandwidth.video.recv.push(0);
                        } else {
                            bandwidth.audio.send.push(stats.audio.sending.bytes * 8);
                            bandwidth.audio.recv.push(stats.audio.receiving.bytes * 8);
                            bandwidth.video.send.push(stats.video.sending.bytes * 8);
                            bandwidth.video.recv.push(stats.video.receiving.bytes * 8);
                        }
                        currentBlock++;
                        if (currentBlock === self._bandwidthAdjuster.interval) {
                            currentBlock = 0;
                            var totalAudioBw = formatTotalFn(bandwidth.audio.send);
                            var totalVideoBw = formatTotalFn(bandwidth.video.send);
                            if (!self._bandwidthAdjuster.useUploadBwOnly) {
                                totalAudioBw += formatTotalFn(bandwidth.audio.recv);
                                totalVideoBw += formatTotalFn(bandwidth.video.recv);
                                totalAudioBw = totalAudioBw / 2;
                                totalVideoBw = totalVideoBw / 2;
                            }
                            totalAudioBw = parseInt((totalAudioBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
                            totalVideoBw = parseInt((totalVideoBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
                            bandwidth = {
                                audio: { send: [], recv: [] },
                                video: { send: [], recv: [] }
                            };
                            self.refreshConnection(targetMid, {
                                bandwidth: { audio: totalAudioBw, video: totalVideoBw }
                            });
                        }
                    }, true, true);
                }, 1000);
            }
        };
    }

    self._acknowledgeAnswer(targetMid, true, null);
    self._handleNegotiationStats('set_answer', targetMid, answer, true);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

    if (self._peerMessagesStamps[targetMid]) {
      self._peerMessagesStamps[targetMid].hasRestart = false;
    }

    if (self._dataChannels[targetMid] && (pc.remoteDescription.sdp.indexOf('m=application') === -1 ||
      pc.remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Closing all datachannels as they were rejected.']);
      self._closeDataChannel(targetMid);
    }
  };

  var onErrorCbFn = function(error) {
    self._acknowledgeAnswer(targetMid, false, error);
    self._handleNegotiationStats('error_set_answer', targetMid, answer, true, error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState,
      answer: answer
    });
  };

  var onLocalOfferSetSuccess = function() {
    pc.processingLocalSDP = false;
    self._bufferedLocalOffer[targetMid] = null;
    pc.setRemoteDescription(new RTCSessionDescription(answer), onSuccessCbFn, onErrorCbFn);
  };

  var onLocalOfferSetError = function (sdpError) {
    log.error([targetMid, 'RTCSessionDescription', 'offer', 'Local description failed setting ->'], sdpError);

    pc.processingLocalSDP = false;
    pc.processingRemoteSDP = false;

    self._handleNegotiationStats('error_set_offer', targetMid, self._bufferedLocalOffer[targetMid], false, sdpError);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, sdpError);
  };

  if (self._bufferedLocalOffer[targetMid]) {
    pc.setLocalDescription(new RTCSessionDescription(self._bufferedLocalOffer[targetMid]), onLocalOfferSetSuccess, onLocalOfferSetError);
  } else {
    log.error([targetMid, 'RTCPeerConnection', null, 'FATAL: No buffered local offer found. Unable to setLocalDescription.']);
  }

};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Starts a RTMP session.
 * @method startRTMPSession
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_RTMPState">
 *   <code>rtmpState</code> event</a> triggering <code>state</code> parameter payload as <code>START</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>startRTMPSession()</code> error when starting a new rtmp session.</small>
 * @param {String|JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#event_RTMPState">
 *   <code>RTMPState</code> event</a> triggered <code>RTMPId</code> parameter payload.</small>
 * @example
 *   // Example 1: Start RTMP session
 *   skylinkDemo.startRTMPSession(function (error, success) {
 *     if (error) return;
 *     console.info("RTMP session has started. ID ->", success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to start RTMP session. <ol>
 *   <li>If RTMP session has been started successfully: <ol>
 *   <li><a href="#event_RTMPState"><code>RTMPState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START</code>.</li></ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.36
 */
Skylink.prototype.startRTMPSession = function (streamId, endpoint, callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start RTMP session as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }
  if (!streamId) {
    var nostreamIdError = 'Unable to start RTMP Session stream id is missing';
    log.error(nostreamIdError);
    if (typeof callback === 'function') {
      callback(new Error(nostreamIdError), null);
    }
    return;
  }
  if (!endpoint) {
    var noEndpointError = 'Unable to start RTMP Session as Endpoint is missing';
    log.error(noEndpointError);
    if (typeof callback === 'function') {
      callback(new Error(noEndpointError), null);
    }
    return;
  }
  var rtmpId = self.generateUUID();

  if (typeof callback === 'function') {
    self.once('RTMPState', function (state, RTMPId) {
      callback(RTMPId);
    }, function (state) {
      return state === self.RTMP_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RTMP,
    rid: self._room.id,
    target: 'MCU',
    mid: self._user.sid,
    streamId: streamId,
    endpoint: endpoint,
    rtmpId: rtmpId
  });

  log.debug(['MCU', 'RTMP', null, 'Starting RTMP Session']);
};



/**
 * <blockquote class="info">
 *   Note that this feature requires MCU to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Stops a RTMP session.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_RTMPState">
 *   <code>RTMPState</code> event</a> triggering <code>state</code> parameter payload as <code>STOP</code>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>stopRTMPSession()</code> error when stopping current RTMP session.</small>
 * @param {String|JSON} callback.success The success result in request.
 * @method stopRTMPSession
 * @example
 *   // Example 1: Stop RTMP session
 *   skylinkDemo.stopRTMPSession(function (error, success) {
 *     if (error) return;
 *     console.info("RTMP session has stopped. ID ->", success);
 *   });
 * @beta
 * @for Skylink
 * @since 0.6.36
 */
Skylink.prototype.stopRTMPSession = function (rtmpId, callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop RTMP as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('RTMPState', function (state, rtmpId) {
      callback(rtmpId);
    }, function (state) {
      return state === self.RTMP_STATE.STOP;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RTMP,
    rid: self._room.id,
    rtmpId: rtmpId,
    mid: self._user.sid,
    target: 'MCU'
  });

  log.debug(['MCU', 'RTMP', null, 'Stopping RTMP Session']);
};

/**
 * Handles the RTMP Protocol message event received from the platform signaling.
 * @method _rtmpEventHandler
 * @param {JSON} message The message object received from platform signaling.
 *    This should contain the <code>RTMP</code> payload.
 * @param {String} message.action The RTMP action received.
 * @param {String} message.error The RTMP error exception received.
 * @private
 * @beta
 * @for Skylink
 * @since 0.6.36
 */
Skylink.prototype._rtmpEventHandler = function (message) {
  var self = this;

  log.debug(['MCU', 'RTMP', null, 'Received RTMP Session message ->'], message);

  if (message.action === 'startSuccess') {
    if (!self._rtmpSessions[message.rtmpId]) {
      log.debug(['MCU', 'RTMP', message.rtmpId, 'Started RTMP Session']);

      self._rtmpSessions[message.rtmpId] = {
        active: true,
        state: self.RTMP_STATE.START,
        startedDateTime: (new Date()).toISOString(),
        endedDateTime: null,
        peerId: message.peerId,
        streamId: message.streamId
      };
      self._trigger('RTMPState', self.RTMP_STATE.START, message.rtmpId, null, null);
    }

  } else if (message.action === 'stopSuccess') {

    if (!self._rtmpSessions[message.rtmpId]) {
      log.error(['MCU', 'RTMP', message.rtmpId, 'Received request of "off" but the session is empty']);
      return;
    }

    log.debug(['MCU', 'RTMP', message.rtmpId, 'Stopped RTMP Session']);

    self._rtmpSessions[message.rtmpId].active = false;
    self._rtmpSessions[message.rtmpId].state = self.RTMP_STATE.STOP;
    self._rtmpSessions[message.rtmpId].endedDateTime = (new Date()).toISOString();
    self._trigger('RTMPState', self.RTMP_STATE.STOP, message.rtmpId, null, null);

  }  else {
    var rtmpError = new Error(message.error || 'Unknown error');

    if (!self._rtmpSessions[message.rtmpId]) {
      log.error(['MCU', 'RTMP', message.rtmpId, 'Received error but the session is empty ->'], rtmpError);
      return;
    }

    log.error(['MCU', 'RTMP', message.rtmpId, 'RTMP session failure ->'], rtmpError);

    self._rtmpSessions[message.rtmpId].state = self.RTMP_STATE.ERROR;
    self._rtmpSessions[message.rtmpId].error = rtmpError;

    if (self._rtmpSessions[message.rtmpId].active) {
      log.debug(['MCU', 'RTMP', message.rtmpId, 'Stopped RTMP session abruptly']);
      self._rtmpSessions[message.rtmpId].active = false;
    }

    self._trigger('RTMPState', self.RTMP_STATE.ERROR, message.rtmpId, null, rtmpError);
  }
};

/**
 * Function that compares the SM / DT protocol versions to see if it in the version.
 * @method _isLowerThanVersion
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._isLowerThanVersion = function (agentVer, requiredVer) {
  var partsA = (agentVer || '').split('.');
  var partsB = (requiredVer || '').split('.');

  for (var i = 0; i < partsB.length; i++) {
    if ((partsA[i] || '0') < (partsB[i] || '0')) {
      return true;
    }
  }

  return false;
};

/**
 * Function that sends a SIG_MESSAGE_TYPE.ANSWER_ACK message to MCU to denote that SDP negotiation has completed (either with success or error)
 * @method _acknowledgeAnswer
 * @private
 * @for Skylink
 * @since 1.0.0
 */
Skylink.prototype._acknowledgeAnswer = function (targetMid, isSuccess, error) {
  var self = this;
    var statsStateKey = isSuccess ? 'set_answer_ack' : 'error_set_answer_ack';
    var answerAckMessage = {
      rid: self._room.id,
      mid: self._user.sid,
      target: targetMid,
      success: isSuccess,
      type: self._SIG_MESSAGE_TYPE.ANSWER_ACK,
    };
  self._sendChannelMessage(answerAckMessage);
  log.debug([targetMid, 'Remote Description', null, 'Answer acknowledgement message sent to' + targetMid + ' via SIG. Message body -->'], answerAckMessage);
  self._handleNegotiationStats(statsStateKey, targetMid, answerAckMessage, true, error);

  return false;
};


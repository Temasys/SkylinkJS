/**
 * The list of Peer connection states.
 * @attribute HANDSHAKE_PROGRESS
 * @param {String} ENTER   <small>Value <code>"enter"</code></small>
 *   The value of the connection state when Peer has just entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered.</small>
 * @param {String} WELCOME <small>Value <code>"welcome"</code></small>
 *   The value of the connection state when Peer is aware that User has entered the Room.
 *   <small>At this stage, <a href="#event_peerJoined"><code>peerJoined</code> event</a>
 *   is triggered and Peer connection may commence.</small>
 * @param {String} OFFER   <small>Value <code>"offer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"offer"</code>
 *   session description to start streaming connection.
 * @param {String} ANSWER  <small>Value <code>"answer"</code></small>
 *   The value of the connection state when Peer connection has set the local / remote <code>"answer"</code>
 *   session description to establish streaming connection.
 * @param {String} ERROR   <small>Value <code>"error"</code></small>
 *   The value of the connection state when Peer connection has failed to establish streaming connection.
 *   <small>This happens when there are errors that occurs in creating local <code>"offer"</code> /
 *   <code>"answer"</code>, or when setting remote / local <code>"offer"</code> / <code>"answer"</code>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * Function that creates the Peer connection offer session description.
 * @method _doOffer
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, iceRestart, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer', 'Dropping of creating of offer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of creating of offer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;
  }

  var doIceRestart = !!((self._peerInformations[targetMid] || {}).config || {}).enableIceRestart &&
    iceRestart && self._enableIceRestart;
  var offerToReceiveAudio = !(!self._sdpSettings.connection.audio && targetMid !== 'MCU');
  var offerToReceiveVideo = !(!self._sdpSettings.connection.video && targetMid !== 'MCU') && self._getSDPEdgeVideoSupports(targetMid);

  var offerConstraints = {
    offerToReceiveAudio: offerToReceiveAudio,
    offerToReceiveVideo: offerToReceiveVideo,
    iceRestart: doIceRestart,
    voiceActivityDetection: self._voiceActivityDetection
  };

  // Prevent undefined OS errors
  peerBrowser.os = peerBrowser.os || '';

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._enableDataChannel && self._peerInformations[targetMid] &&
    self._peerInformations[targetMid].config.enableDataChannel/* &&
    !(!self._sdpSettings.connection.data && targetMid !== 'MCU')*/) {
    // Edge doesn't support datachannels yet
    if (!(self._dataChannels[targetMid] && self._dataChannels[targetMid].main)) {
      self._createDataChannel(targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.endOfCandidates = false;

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].sdpConstraints = offerConstraints;
  }

  var successCbFn = function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);

    self._setLocalAndSendMessage(targetMid, offer);
  };

  var errorCbFn = function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    log.error([targetMid, null, null, 'Failed creating an offer:'], error);
  };

  // Not using promises as primary even as preferred because of users using older AdapterJS to prevent breaks
  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    pc.createOffer(offerConstraints).then(successCbFn).catch(errorCbFn);
  
  } else {
    pc.createOffer(successCbFn, errorCbFn, AdapterJS.webrtcDetectedType === 'plugin' ? {
      mandatory: {
        OfferToReceiveAudio: offerConstraints.offerToReceiveAudio,
        OfferToReceiveVideo: offerConstraints.offerToReceiveVideo,
        iceRestart: offerConstraints.iceRestart,
        voiceActivityDetection: offerConstraints.voiceActivityDetection
      }
    } : offerConstraints);
  }
};

/**
 * Function that creates the Peer connection answer session description.
 * This comes after receiving and setting the offer session description.
 * @method _doAnswer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer', 'Dropping of creating of answer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of creating of answer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
    return;
  }

  // Add stream only at offer/answer end
  if ((!self._hasMCU || targetMid === 'MCU') && window.webrtcDetectedBrowser !== 'edge') {
    self._addLocalMediaStreams(targetMid);
  }

  var offerToReceiveAudio = !(!self._sdpSettings.connection.audio && targetMid !== 'MCU');
  var offerToReceiveVideo = !(!self._sdpSettings.connection.video && targetMid !== 'MCU') && self._getSDPEdgeVideoSupports(targetMid);
  var answerConstraints = window.webrtcDetectedBrowser === 'edge' ? {
    offerToReceiveVideo: offerToReceiveVideo,
    offerToReceiveAudio: offerToReceiveAudio,
    voiceActivityDetection: self._voiceActivityDetection
  } : undefined;

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].sdpConstraints = answerConstraints;
  }

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  var successCbFn = function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  };

  var errorCbFn = function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    pc.createAnswer(answerConstraints).then(successCbFn).catch(errorCbFn); 

  } else {
    pc.createAnswer(successCbFn, errorCbFn, answerConstraints);
  }
};

/**
 * Function that sets the local session description and sends to Peer.
 * If trickle ICE is disabled, the local session description will be sent after
 *   ICE gathering has been completed.
 * @method _setLocalAndSendMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, _sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!_sessionDescription && !!_sessionDescription.sdp)) {
    log.warn([targetMid, 'RTCSessionDescription', null, 'Local session description is undefined ->'], _sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type,
      'Local session description will not be set as connection does not exists ->'], _sessionDescription);
    return;

  } else if (_sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], _sessionDescription);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (_sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], _sessionDescription);
    return;

  // Added checks if there is a current local sessionDescription being processing before processing this one
  } else if (pc.processingLocalSDP) {
    log.warn([targetMid, 'RTCSessionDescription', _sessionDescription.type,
      'Local session description will not be set as another is being processed ->'], _sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  // Sets and expected receiving codecs etc.
  var sessionDescription = {
    type: _sessionDescription.type,
    sdp: _sessionDescription.sdp
  };

  sessionDescription.sdp = self._removeSDPFirefoxH264Pref(targetMid, sessionDescription);
  sessionDescription.sdp = self._setSDPCodecParams(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPUnknownAptRtx(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPCodecs(targetMid, sessionDescription);
  sessionDescription.sdp = self._handleSDPConnectionSettings(targetMid, sessionDescription, 'local');
  sessionDescription.sdp = self._removeSDPREMBPackets(targetMid, sessionDescription);

  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Local session description updated ->'], sessionDescription.sdp);

  var successCbFn = function() {
    log.debug([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description has been set ->'], sessionDescription);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);

    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._enableIceTrickle && !pc.gathered) {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Local session description sending is halted to complete ICE gathering.']);
      return;
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: self._renderSDPOutput(targetMid, sessionDescription),
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id,
      userInfo: self._getUserInfo(targetMid)
    });
  };

  var errorCbFn = function(error) {
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local description failed setting ->'], error);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    pc.setLocalDescription(new RTCSessionDescription(sessionDescription)).then(successCbFn).catch(errorCbFn);
  }

  pc.setLocalDescription(new RTCSessionDescription(sessionDescription), successCbFn, errorCbFn);
};

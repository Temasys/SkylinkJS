/**
 * Function that creates the Peer connection offer session description.
 * @method _doOffer
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, iceRestart) {
  var self = this;
  var pc = self._peerConnections[targetMid];

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

  var offerConstraints = {
    offerToReceiveAudio: !(!self._sdpSettings.connection.audio && targetMid !== 'MCU') && self._getSDPCommonSupports(targetMid).video,
    offerToReceiveVideo: !(!self._sdpSettings.connection.video && targetMid !== 'MCU') && self._getSDPCommonSupports(targetMid).audio,
    iceRestart: !!((self._peerInformations[targetMid] || {}).config || {}).enableIceRestart &&
      iceRestart && self._enableIceRestart,
    voiceActivityDetection: self._voiceActivityDetection
  };

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._initOptions.enableDataChannel && self._peerInformations[targetMid] &&
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

  var onSuccessCbFn = function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);
    self._handleStatsNegotiation('create-offer', targetMid, offer);
    self._setLocalAndSendMessage(targetMid, offer);
  };

  var onErrorCbFn = function(error) {
    log.error([targetMid, null, null, 'Failed creating an offer:'], error);
    self._handleStatsNegotiation('error-create-offer', targetMid, null, error && error.message);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  pc.createOffer(onSuccessCbFn, onErrorCbFn, AdapterJS.webrtcDetectedType === 'plugin' ? {
    mandatory: {
      OfferToReceiveAudio: offerConstraints.offerToReceiveAudio,
      OfferToReceiveVideo: offerConstraints.offerToReceiveVideo,
      iceRestart: offerConstraints.iceRestart,
      voiceActivityDetection: offerConstraints.voiceActivityDetection
    }
  } : offerConstraints);
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

  var answerConstraints = AdapterJS.webrtcDetectedBrowser === 'edge' ? {
    offerToReceiveVideo: !(!self._sdpSettings.connection.audio && targetMid !== 'MCU') &&
      self._getSDPCommonSupports(targetMid, pc.remoteDescription).video,
    offerToReceiveAudio: !(!self._sdpSettings.connection.video && targetMid !== 'MCU') &&
      self._getSDPCommonSupports(targetMid, pc.remoteDescription).audio,
    voiceActivityDetection: self._voiceActivityDetection
  } : undefined;

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].sdpConstraints = answerConstraints;
  }

  var onSuccessCbFn = function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._handleStatsNegotiation('create-answer', targetMid, answer);
    self._setLocalAndSendMessage(targetMid, answer);
  };

  var onErrorCbFn = function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._handleStatsNegotiation('error-create-answer', targetMid, null, error && error.message);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(onSuccessCbFn, onErrorCbFn, answerConstraints);
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

  if (self._peerConnectionConfig.disableBundle) {
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=group:BUNDLE.*\r\n/gi, '');
  }

  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Local session description updated ->'], sessionDescription.sdp);

  var onSuccessCbFn = function() {
    log.debug([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description has been set ->'], sessionDescription);

    pc.processingLocalSDP = false;

    self._handleStatsNegotiation('local-' + sessionDescription.type, targetMid, sessionDescription);
    self._trigger('handshakeProgress', sessionDescription.type, targetMid);

    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._initOptions.enableIceTrickle && !pc.gathered) {
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

  var onErrorCbFn = function(error) {
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local description failed setting ->'], error);

    pc.processingLocalSDP = false;

    self._handleStatsNegotiation('error-local-' + sessionDescription.type, targetMid, sessionDescription, error && error.message);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  };

  pc.setLocalDescription(new RTCSessionDescription(sessionDescription), onSuccessCbFn, onErrorCbFn);
};

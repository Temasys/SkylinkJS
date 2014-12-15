/**
 * The list of handshake progress steps.
 * - This are the list of steps for the Skylink peer connection.
 * - The steps that would occur are:
 * @type JSON
 * @attribute HANDSHAKE_PROGRESS
 * @param {String} ENTER Step 1. Received "enter" from peer.
 * @param {String} WELCOME Step 2. Received "welcome" from peer.
 * @param {String} OFFER Step 3. Received "offer" from peer.
 * @param {String} ANSWER Step 4. Received "answer" from peer.
 * @param {String} ERROR Error state.
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
 * Internal array of peer connection timeouts.
 * - The default 1 minute for health timeout.
 * @attribute _peerConnectionHealthTimers
 * @type Object
 * @private
 * @required
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = [];

/**
 * Internal array of peer connection that is stable.
 * @attribute _peerConnectionHealth
 * @type Object
 * @private
 * @required
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = [];

/**
 * Internal array of peer handshake messaging priorities.
 * @attribute _peerHSPriorities
 * @type Object
 * @private
 * @required
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerHSPriorities = [];

/**
 * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer).
 * @method _doOffer
 * @param {String} targetMid PeerId of the peer to send offer to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);
  log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);
  // NOTE ALEX: handle the pc = 0 case, just to be sure
  var inputConstraints = self._room.connection.offerConstraints;
  var sc = self._room.connection.sdpConstraints;
  for (var name in sc.mandatory) {
    if (sc.mandatory.hasOwnProperty(name)) {
      inputConstraints.mandatory[name] = sc.mandatory[name];
    }
  }
  inputConstraints.optional.concat(sc.optional);
  checkMediaDataChannelSettings(peerBrowser.agent, peerBrowser.version,
    function(beOfferer, unifiedOfferConstraints) {
    // attempt to force make firefox not to offer datachannel.
    // we will not be using datachannel in MCU
    if (window.webrtcDetectedType === 'moz' && peerBrowser.agent === 'MCU') {
      unifiedOfferConstraints.mandatory = unifiedOfferConstraints.mandatory || {};
      unifiedOfferConstraints.mandatory.MozDontOfferDataChannel = true;
      beOfferer = true;
    }
    if (beOfferer) {
      log.debug([targetMid, null, null, 'Creating offer with config:'], unifiedOfferConstraints);
      pc.createOffer(function(offer) {
        log.debug([targetMid, null, null, 'Created offer'], offer);
        self._setLocalAndSendMessage(targetMid, offer);
      }, function(error) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR,
          targetMid, error);
        log.error([targetMid, null, null, 'Failed creating an offer:'], error);
      }, unifiedOfferConstraints);
    } else {
      log.debug([targetMid, null, null, 'User\'s browser is not eligible to create ' +
        'the offer to the other peer. Requesting other peer to create the offer instead'
        ], peerBrowser);
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.WELCOME,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        userInfo: self.getPeerInfo(),
        target: targetMid,
        weight: -1
      });
    }
  }, inputConstraints);
};

/**
 * We have succesfully received an offer and set it locally. This function will take care
 * of cerating and sendng the corresponding answer. Handshake step 4.
 * @method _doAnswer
 * @param {String} targetMid PeerId of the peer to send answer to.
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];
  if (pc) {
    pc.createAnswer(function(answer) {
      log.debug([targetMid, null, null, 'Created answer'], answer);
      self._setLocalAndSendMessage(targetMid, answer);
    }, function(error) {
      log.error([targetMid, null, null, 'Failed creating an answer:'], error);
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    }, self._room.connection.sdpConstraints);
  } else {
    /* Houston ..*/
    log.error([targetMid, null, null, 'Requested to create an answer but user ' +
      'does not have any existing connection to peer']);
    return;
  }
};

/**
 * Starts a peer connection health check.
 * The health timers waits for connection, and within 1m if there is not connection,
 * it attempts a reconnection.
 * @method _startPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to set a connection timeout if connection failed.
 * @private
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId) {
  var self = this;

  log.log([peerId, 'PeerConnectionHealth', null,
    'Initializing check for peer\'s connection health']);

  if (self._peerConnectionHealthTimers[peerId]) {
    // might be a re-handshake again
    self._stopPeerConnectionHealthCheck(peerId);
  }

  self._peerConnectionHealthTimers[peerId] = setTimeout(function () {
    // re-handshaking should start here.
    if (!self._peerConnectionHealth[peerId]) {
      log.warn([peerId, 'PeerConnectionHealth', null, 'Peer\'s health timer ' +
      'has expired'], 10000);

      // clear the loop first
      self._stopPeerConnectionHealthCheck(peerId);

      log.debug([peerId, 'PeerConnectionHealth', null,
        'Ice connection state time out. Re-negotiating connection']);

      // do a complete clean
      self._restartPeerConnection(peerId, true);
    }
  }, 10000);
};

/**
 * Stops a peer connection health check.
 * @method _stopPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to clear the checking.
 * @private
 * @since 0.5.5
 */
Skylink.prototype._stopPeerConnectionHealthCheck = function (peerId) {
  var self = this;

  if (self._peerConnectionHealthTimers[peerId]) {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Stopping peer connection health timer check']);

    clearTimeout(self._peerConnectionHealthTimers[peerId]);
    delete self._peerConnectionHealthTimers[peerId];

  } else {
    log.debug([peerId, 'PeerConnectionHealth', null,
      'Peer connection health does not have a timer check']);
  }
};

/**
 * This takes an offer or an aswer generated locally and set it in the peerconnection
 * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer).
 * @method _setLocalAndSendMessage
 * @param {String} targetMid PeerId of the peer to send offer/answer to.
 * @param {JSON} sessionDescription This should be provided by the peerconnection API.
 *   User might 'tamper' with it, but then , the setLocal may fail.
 * @trigger handshakeProgress
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && pc.setAnswer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local answer'], sessionDescription);
    return;
  }
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && pc.setOffer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local offer'], sessionDescription);
    return;
  }
  // NOTE ALEX: handle the pc = 0 case, just to be sure
  var sdpLines = sessionDescription.sdp.split('\r\n');
  // remove h264 invalid pref
  sdpLines = self._removeSDPFirefoxH264Pref(sdpLines);
  // Check if stereo was enabled
  if (self._streamSettings.hasOwnProperty('audio')) {
    if (self._streamSettings.audio.stereo) {
      self._addSDPStereo(sdpLines);
    }
  }
  log.info([targetMid, null, null, 'Requested stereo:'], (self._streamSettings.audio ?
    (self._streamSettings.audio.stereo ? self._streamSettings.audio.stereo : false) :
    false));
  // set sdp bitrate
  if (self._streamSettings.hasOwnProperty('bandwidth')) {
    sdpLines = self._setSDPBitrate(sdpLines, self._streamSettings.bandwidth);
  }
  // set sdp resolution
  if (self._streamSettings.hasOwnProperty('video')) {
    sdpLines = self._setSDPVideoResolution(sdpLines, self._streamSettings.video);
  }
  self._streamSettings.bandwidth = self._streamSettings.bandwidth || {};
  self._streamSettings.video = self._streamSettings.video || {};
  log.info([targetMid, null, null, 'Custom bandwidth settings:'], {
    audio: (self._streamSettings.bandwidth.audio || 'Not set') + ' kB/s',
    video: (self._streamSettings.bandwidth.video || 'Not set') + ' kB/s',
    data: (self._streamSettings.bandwidth.data || 'Not set') + ' kB/s'
  });
  if (self._streamSettings.video.hasOwnProperty('frameRate') &&
    self._streamSettings.video.hasOwnProperty('resolution')){
    log.info([targetMid, null, null, 'Custom resolution settings:'], {
      frameRate: (self._streamSettings.video.frameRate || 'Not set') + ' fps',
      width: (self._streamSettings.video.resolution.width || 'Not set') + ' px',
      height: (self._streamSettings.video.resolution.height || 'Not set') + ' px'
    });
  }
  sessionDescription.sdp = sdpLines.join('\r\n');
  // NOTE ALEX: opus should not be used for mobile
  // Set Opus as the preferred codec in SDP if Opus is present.
  //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  // limit bandwidth
  //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);
  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Updated session description:'], sessionDescription);
  pc.setLocalDescription(sessionDescription, function() {
    log.debug([targetMid, sessionDescription.type, 'Local description set']);
    self._trigger('handshakeProgress', sessionDescription.type, targetMid);
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }
    if (self._enableIceTrickle || (!self._enableIceTrickle &&
      sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER)) {
      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: self._user.sid,
        target: targetMid,
        rid: self._room.id
      });
    } else {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Waiting for Ice gathering to complete to prevent Ice trickle']);
    }
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Failed setting local description: '], error);
  });
};
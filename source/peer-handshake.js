/**
 * The list of handshake progress steps that would be triggered.
 * @type JSON
 * @attribute HANDSHAKE_PROGRESS
 * @param {String} ENTER Step 1. Received "enter" from peer.
 * @param {String} WELCOME Step 2. Received "welcome" from peer.
 * @param {String} OFFER Step 3. Received "offer" from peer.
 * @param {String} ANSWER Step 4. Received "answer" from peer.
 * @param {String} ERROR Error state.
 * @readOnly
 * @component Peer
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
 * Stores the list of <code>setTimeout</code> awaiting for successful connection.
 * @attribute _peerConnectionHealthTimers
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = {};

/**
 * Stores the list of stable Peer connection.
 * @attribute _peerConnectionHealth
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = {};

/**
 * Stores the list of handshaking weights received that would be compared against
 * to indicate if User should send an "offer" or Peer should.
 * @attribute _peerHSPriorities
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerHSPriorities = {};

/**
 * Creates an offer to Peer to initate Peer connection.
 * @method _doOffer
 * @param {String} targetMid PeerId of the peer to send offer to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Number} peerBrowser.version The peer browser version.
 * @param {Number} peerBrowser.os The peer browser operating system.
 * @private
 * @for Skylink
 * @component Peer
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

    // for windows firefox to mac chrome interopability
    if (window.webrtcDetectedBrowser === 'firefox' &&
      window.navigator.platform.indexOf('Win') === 0 &&
      peerBrowser.agent !== 'firefox' &&
      peerBrowser.os.indexOf('Mac') === 0) {
      beOfferer = false;
    }

    if (beOfferer) {
      if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion >= 32) {
        unifiedOfferConstraints = {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };

        /*if (window.webrtcDetectedVersion > 37) {
          unifiedOfferConstraints = {};
        }*/
      }

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
        os: window.navigator.platform,
        userInfo: self.getPeerInfo(),
        target: targetMid,
        weight: -1,
        sessionType: !!self._mediaScreen ? 'screensharing' : 'stream'
      });
    }
  }, inputConstraints);
};

/**
 * Creates an answer to Peer as a response to Peer's offer.
 * @method _doAnswer
 * @param {String} targetMid PeerId of the peer to send answer to.
 * @private
 * @for Skylink
 * @component Peer
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
    });//, self._room.connection.sdpConstraints);
  } else {
    /* Houston ..*/
    log.error([targetMid, null, null, 'Requested to create an answer but user ' +
      'does not have any existing connection to peer']);
    return;
  }
};

/**
 * Starts a Peer connection health check.
 * The health timers waits for connection, and within 1m if there is not connection,
 * it attempts a reconnection.
 * @method _startPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to set a connection timeout if connection failed.
 * @param {Boolean} toOffer The flag to check if peer is offerer. If the peer is offerer,
 *   the restart check should be increased.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId, toOffer) {
  var self = this;

  var timer = (self._enableIceTrickle && !self._peerIceTrickleDisabled[peerId]) ?
    (toOffer ? 12500 : 10000) : 50000;
  timer = (self._hasMCU) ? 85000 : timer;

  timer += self._retryCount*10000;

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

      //Maximum increament is 5 minutes
      if (self._retryCount<30){
        //Increase after each consecutive connection failure
        self._retryCount++;
      }

      // do a complete clean
      if (!self._hasMCU)
        self._restartPeerConnection(peerId, true, true);
      else
        self._restartMCU();
    }
  }, timer);
};

/**
 * Stops a Peer connection health check.
 * @method _stopPeerConnectionHealthCheck
 * @param {String} peerId The peerId of the peer to clear the checking.
 * @private
 * @component Peer
 * @for Skylink
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
 * Sets a generated session description and sends to Peer.
 * @method _setLocalAndSendMessage
 * @param {String} targetMid PeerId of the peer to send offer/answer to.
 * @param {JSON} sessionDescription This should be provided by the peerconnection API.
 *   User might 'tamper' with it, but then , the setLocal may fail.
 * @trigger handshakeProgress
 * @private
 * @component Peer
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
    var peerSettings = (self._peerInformations[targetMid] || {}).settings || {};

    sdpLines = self._setSDPBitrate(sdpLines, peerSettings);
  }

  // set sdp resolution
  /*if (self._streamSettings.hasOwnProperty('video')) {
    sdpLines = self._setSDPVideoResolution(sdpLines, self._streamSettings.video);
  }*/

  self._streamSettings.bandwidth = self._streamSettings.bandwidth || {};

  self._streamSettings.video = self._streamSettings.video || false;

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

  // set video codec
  if (self._selectedVideoCodec !== self.VIDEO_CODEC.AUTO) {
    sdpLines = self._setSDPVideoCodec(sdpLines);
  } else {
    log.log([targetMid, null, null, 'Not setting any video codec']);
  }

  // set audio codec
  if (self._selectedAudioCodec !== self.AUDIO_CODEC.AUTO) {
    sdpLines = self._setSDPAudioCodec(sdpLines);
  } else {
    log.log([targetMid, null, null, 'Not setting any audio codec']);
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
    if (self._enableIceTrickle && !self._peerIceTrickleDisabled[targetMid]) {
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

/**
 * The list of Peer connection states after <a href="#method_joinRoom"><code>joinRoom()</code> method</a>
 * was successful.
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
 * Stores the list of Peer connection health timers.
 * This timers sets a timeout which checks and waits if Peer connection is successfully established,
 *   or else it will attempt to re-negotiate with the Peer connection again.
 * @attribute _peerConnectionHealthTimers
 * @param {Object} <#peerId> The Peer connection health timer.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = {};

/**
 * Stores the list of Peer connection "healthy" flags, which indicates if Peer connection is
 *   successfully established, and when the health timers expires, it will clear the timer
 *   and not attempt to re-negotiate with the Peer connection again.
 * @attribute _peerConnectionHealth
 * @param {Boolean} <#peerId> The flag that indicates if Peer connection has been successfully established.
 * @type JSON
 * @private
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = {};

/**
 * Stores the User connection priority weight.
 * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
 * @attribute _peerPriorityWeight
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerPriorityWeight = 0;

/**
 * Function that creates the Peer connection offer session description.
 * @method _doOffer
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);

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

  var offerConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };

  // NOTE: Removing ICE restart functionality as of now since Firefox does not support it yet
  // Check if ICE connection failed or disconnected, and if so, do an ICE restart
  /*if ([self.ICE_CONNECTION_STATE.DISCONNECTED, self.ICE_CONNECTION_STATE.FAILED].indexOf(pc.iceConnectionState) > -1) {
    offerConstraints.iceRestart = true;
  }*/

  // Prevent undefined OS errors
  peerBrowser.os = peerBrowser.os || '';

  /*
    Ignoring these old codes as Firefox 39 and below is no longer supported
    if (window.webrtcDetectedType === 'moz' && peerBrowser.agent === 'MCU') {
      unifiedOfferConstraints.mandatory = unifiedOfferConstraints.mandatory || {};
      unifiedOfferConstraints.mandatory.MozDontOfferDataChannel = true;
      beOfferer = true;
    }

    if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion >= 32) {
      unifiedOfferConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };
    }
  */

  // Fallback to use mandatory constraints for plugin based browsers
  if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
    offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };
  }

  if (self._enableDataChannel) {
    if (typeof self._dataChannels[targetMid] !== 'object') {
      log.error([targetMid, 'RTCDataChannel', null, 'Create offer error as unable to create datachannel ' +
        'as datachannels array is undefined'], self._dataChannels[targetMid]);
      return;
    }

    // Edge doesn't support datachannels yet
    if (!self._dataChannels[targetMid].main && window.webrtcDetectedBrowser !== 'edge') {
      self._dataChannels[targetMid].main =
        self._createDataChannel(targetMid, self.DATA_CHANNEL_TYPE.MESSAGING, null, targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.createOffer(function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);

    self._setLocalAndSendMessage(targetMid, offer);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    log.error([targetMid, null, null, 'Failed creating an offer:'], error);

  }, offerConstraints);
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

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  }, function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });//, self._room.connection.sdpConstraints);
};

/**
 * Function that starts the Peer connection health timer.
 * To count as a "healthy" successful established Peer connection, the
 *   ICE connection state has to be "connected" or "completed",
 *   messaging Datachannel type state has to be "opened" (if Datachannel is enabled)
 *   and Signaling state has to be "stable".
 * Should consider dropping of counting messaging Datachannel type being opened as
 *   it should not involve the actual Peer connection for media (audio/video) streaming. 
 * @method _startPeerConnectionHealthCheck
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId, toOffer) {
  var self = this;
  var timer = self._enableIceTrickle ? (toOffer ? 12500 : 10000) : 50000;
  timer = (self._hasMCU) ? 105000 : timer;

  // increase timeout for android/ios
  /*var agent = self.getPeerInfo(peerId).agent;
  if (['Android', 'iOS'].indexOf(agent.name) > -1) {
    timer = 105000;
  }*/

  timer += self._retryCount*10000;

  log.log([peerId, 'PeerConnectionHealth', null,
    'Initializing check for peer\'s connection health']);

  if (self._peerConnectionHealthTimers[peerId]) {
    // might be a re-handshake again
    self._stopPeerConnectionHealthCheck(peerId);
  }

  self._peerConnectionHealthTimers[peerId] = setTimeout(function () {
    // re-handshaking should start here.
    var connectionStable = false;
    var pc = self._peerConnections[peerId];

    if (pc) {
      var dc = (self._dataChannels[peerId] || {}).main;

      var dcConnected = pc.hasMainChannel ? dc && dc.readyState === self.DATA_CHANNEL_STATE.OPEN : true;
      var iceConnected = pc.iceConnectionState === self.ICE_CONNECTION_STATE.CONNECTED ||
        pc.iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED;
      var signalingConnected = pc.signalingState === self.PEER_CONNECTION_STATE.STABLE;

      connectionStable = dcConnected && iceConnected && signalingConnected;

      log.debug([peerId, 'PeerConnectionHealth', null, 'Connection status'], {
        dcConnected: dcConnected,
        iceConnected: iceConnected,
        signalingConnected: signalingConnected
      });
    }

    log.debug([peerId, 'PeerConnectionHealth', null, 'Require reconnection?'], connectionStable);

    if (!connectionStable) {
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
      if (!self._hasMCU) {
        self._restartPeerConnection(peerId, true, true, null, false);
      } else {
        self._restartMCUConnection();
      }
    } else {
      self._peerConnectionHealth[peerId] = true;
    }
  }, timer);
};

/**
 * Function that stops the Peer connection health timer.
 * This happens when Peer connection has been successfully established or when
 *   Peer leaves the Room.
 * @method _stopPeerConnectionHealthCheck
 * @private
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
 * Function that sets the local session description and sends to Peer.
 * If trickle ICE is disabled, the local session description will be sent after
 *   ICE gathering has been completed.
 * @method _setLocalAndSendMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  /*if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && pc.setAnswer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local answer'], sessionDescription);
    return;
  }
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && pc.setOffer) {
    log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Ignoring session description. User has already set local offer'], sessionDescription);
    return;
  }*/

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!sessionDescription && !!sessionDescription.sdp)) {
    log.warn([targetMid, 'RTCSessionDescription', null, 'Dropping of setting local unknown sessionDescription ' +
      'as received sessionDescription is empty ->'], sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Dropping of setting local "' +
      sessionDescription.type + '" as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local "offer" as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local "answer" as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
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

  /*log.info([targetMid, null, null, 'Custom bandwidth settings:'], {
    audio: (self._streamSettings.bandwidth.audio || 'Not set') + ' kB/s',
    video: (self._streamSettings.bandwidth.video || 'Not set') + ' kB/s',
    data: (self._streamSettings.bandwidth.data || 'Not set') + ' kB/s'
  });*/

  /*if (self._streamSettings.video.hasOwnProperty('frameRate') &&
    self._streamSettings.video.hasOwnProperty('resolution')){
    log.info([targetMid, null, null, 'Custom resolution settings:'], {
      frameRate: (self._streamSettings.video.frameRate || 'Not set') + ' fps',
      width: (self._streamSettings.video.resolution.width || 'Not set') + ' px',
      height: (self._streamSettings.video.resolution.height || 'Not set') + ' px'
    });
  }*/

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

  // Remove REMB packet for MCU connection consistent video quality
  // NOTE: This is a temporary solution. This is bad to modify from the client since REMB packet
  //   is required to control quality based on network conditions.
  if (self._hasMCU && ['chrome', 'opera', 'safari', 'IE'].indexOf(window.webrtcDetectedBrowser) > -1) {
    log.warn([targetMid, null, null, 'Removing REMB packet for streaming quality in MCU environment']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtcp-fb:100 goog-remb\r\n/g, '');
  }

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
    log.warn([targetMid, null, null, 'Removing apt= and rtx payload lines causing connectivity issues']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\n/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=fmtp:\d+ apt=\d+\r\n/g, '');
  }

  // NOTE ALEX: opus should not be used for mobile
  // Set Opus as the preferred codec in SDP if Opus is present.
  //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  // limit bandwidth
  //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);
  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Updated session description:'], sessionDescription);

  // Added checks if there is a current local sessionDescription being processing before processing this one
  if (pc.processingLocalSDP) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Dropping of setting local ' + sessionDescription.type + ' as there is another ' +
      'sessionDescription being processed ->'], sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  pc.setLocalDescription(sessionDescription, function() {
    log.debug([targetMid, sessionDescription.type, 'Local description set']);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._enableIceTrickle && !pc.gathered) {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Waiting for Ice gathering to complete to prevent Ice trickle']);
      return;
    }

    // make checks for firefox session description
    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && window.webrtcDetectedBrowser === 'firefox') {
      sessionDescription.sdp = self._addSDPSsrcFirefoxAnswer(targetMid, sessionDescription.sdp);
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: sessionDescription.sdp,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id
    });

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingLocalSDP = false;

    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Failed setting local description: '], error);
  });
};

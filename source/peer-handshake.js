/**
 * These are the list of Peer connection handshake states that Skylink would trigger.
 * - Do not be confused with {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}.
 *   This is the Peer recognition connection that is established with the platform signaling protocol, and not
 *   the Peer connection signaling state itself.
 * - In this case, this happens before the {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE
 *   handshaking states. {{/crossLink}} The <code>OFFER</code> and <code>ANSWER</code> relates to the
 *   {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE states{{/crossLink}}.
 * - For example as explanation how these state works below, let's make self as the offerer and
 *   the connecting Peer as the answerer.
 * @attribute HANDSHAKE_PROGRESS
 * @type JSON
 * @param {String} ENTER <small>Value <code>"enter"</code></small>
 *   The state when Peer have received <code>ENTER</code> from self,
 *   and Peer connection with self is initialised with self.<br>
 * This state will occur for both self and Peer as <code>ENTER</code>
 *   message is sent to ping for Peers in the room.<br>
 * At this state, Peer would sent <code>WELCOME</code> to the peer to
 *   start the session description connection handshake.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">1.</td>
 *       <td class="col-md-5">Sends <code>ENTER</code></td><td>Sends <code>ENTER</code></td></tr>
 *     <tr><td class="col-md-1">2.</td>
 *       <td class="col-md-5">-</td><td>Receives self <code>ENTER</code></td></tr>
 *     <tr><td class="col-md-1">3.</td>
 *       <td class="col-md-5">-</td><td>Sends self <code>WELCOME</code></td></tr>
 *   </tbody>
 * </table>
 * @param {String} WELCOME <small>Value <code>"welcome"</code></small>
 *   The state when self have received <code>WELCOME</code> from Peer,
 *   and Peer connection is initialised with Peer.<br>
 * At this state, self would start the session description connection handshake and
 *   send the local <code>OFFER</code> session description to Peer.
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">4.</td>
 *       <td class="col-md-5">Receives <code>WELCOME</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">5.</td>
 *       <td class="col-md-5">Generates <code>OFFER</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">6.</td>
 *       <td class="col-md-5">Sets local <code>OFFER</code><sup>REF</sup></td><td>-</td></tr>
 *     <tr><td class="col-md-1">7.</td>
 *       <td class="col-md-5">Sends <code>OFFER</code></td><td>-</td></tr>
 *   </tbody>
 * </table>
 * <sup>REF</sup>: The will cause {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}
 *   state go to <code>HAVE_LOCAL_OFFER</code>.
 * @param {String} OFFER <small>Value <code>"offer"</code></small>
 *   The state when Peer received <code>OFFER</code> from self.
 * At this state, Peer would set the remote <code>OFFER</code> session description and
 *   start to send local <code>ANSWER</code> session description to self.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">8.</td>
 *        <td class="col-md-5">-</td><td>Receives <code>OFFER</code></td></tr>
 *     <tr><td class="col-md-1">9.</td>
 *        <td class="col-md-5">-</td><td>Sets remote <code>OFFER</code><sup>REF</sup></td></tr>
 *     <tr><td class="col-md-1">10.</td>
 *        <td class="col-md-5">-</td><td>Generates <code>ANSWER</code></td></tr>
 *     <tr><td class="col-md-1">11.</td>
 *        <td class="col-md-5">-</td><td>Sets local <code>ANSWER</code></td></tr>
 *     <tr><td class="col-md-1">12.</td>
 *        <td class="col-md-5">-</td><td>Sends <code>ANSWER</code></td></tr>
 *   </tbody>
 * </table>
 * <sup>REF</sup>: The will cause {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}
 *   state go to <code>HAVE_REMOTE_OFFER</code>.
 * @param {String} ANSWER <small>Value <code>"answer"</code></small>
 *   The state when self received <code>ANSWER</code> from Peer.<br>
 * At this state, self would set the remote <code>ANSWER</code> session description and
 *   the connection handshaking progress has been completed.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">13.</td>
 *        <td class="col-md-5">Receives <code>ANSWER</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">14.</td>
 *        <td class="col-md-5">Sets remote <code>ANSWER</code></td><td>-</td></tr>
 *   </tbody>
 * </table>
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when connection handshake has occurred and exception,
 *   in this which the connection handshake could have been aborted abruptly
 *   and no Peer connection is established.
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
 * Stores the list of Peer connection health timeout objects that
 *   waits for any existing Peer "healthy" state in successful
 *   {{#crossLink "Skylink/_peerConnectionHealth:attr"}}_peerConnectionHealth{{/crossLink}}.
 *   If timeout has reached it's limit and does not have any "healthy" connection state
 *   with Peer connection, it will restart the connection again with
 *   {{#crossLink "Skylink/_restartPeerConnection:method"}}_restartPeerConnection(){{/crossLink}}.
 * @attribute _peerConnectionHealthTimers
 * @param {Object} (#peerId) The timeout object set using <code>setTimeout()</code> that
 *   does the wait for any "healthy" state connection associated with the Peer connection.
 *   This will be removed when the Peer connection has ended or when the Peer
 *   connection has been met with a "healthy" state.
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealthTimers = {};

/**
 * Stores the list of Peer connections that has connection
 *   established successfully. When the Peer connection has a
 *   successful ICE connection state of <code>"completed"</code>,
 *   it stores the Peer connection as "healthy".
 * @attribute _peerConnectionHealth
 * @param {Boolean} (#peerId) The flag that indicates if the associated Peer
 *   connection is in a "healthy" state. If the value is <code>true</code>, it means
 *   that the Peer connectin is in a "healthy" state.
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @since 0.5.5
 */
Skylink.prototype._peerConnectionHealth = {};

/**
 * Stores the list of Peer handshake connection weights.
 * This is implemented to prevent the conflict of sending <code>WELCOME</code>
 *   to peer and receiving <code>WELCOME</code> from peer at the same time.
 * To handle this event, both self and the peer has to generate a weight initially.
 * Then in the {{#crossLink "Skylink/_welcomeHandler:attr"}}_welcomeHandler(){{/crossLink}}
 *   when conflict <code>WELCOME</code> message is received, the handler woudl check
 *   if there is already an existing Peer connection object with the peer (due
 *   to the initialisation in the received <code>ENTER</code>). If so the handler would
 *   then compare the received weight if it is higher than the weight generated for this peer.
 * The one with the highest weight would have the "priority" to initiate the WebRTC layer of
 *   handshake and start sending the <code>OFFER</code> session description.
 * @attribute _peerHSPriorities
 * @param {Number} (#peerId) The generated weight for associated Peer peer.
 *   The weight is generated with <code>Date.getTime()</code>.
 * @param
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._peerHSPriorities = {};

/**
 * Stores the list of Peer handshake callbacks that is awaitng to be
 *   triggered for renegotiation.
 * @attribute _peerRenegoCallbacks
 * @param {Function} (#peerId) The callback function that triggers after
 *   the offer has been created or responsed.
 * @param {RTCSessionDescription} (#peerId).offer The sessionDescription object.
 *   If <code>null</code>, this indicates that the the other party should be the
 *   the offerer.
 * @param {Error} (#peerId).error The error object when createOffer or
 *   setLocalDescription fails.
 * @param
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.6.6
 */
Skylink.prototype._peerRenegoCallbacks = {};

/**
 * Starts to initiate the WebRTC layer of handshake connection by
 *   creating the <code>OFFER</code> session description and then
 *   sending it to the associated Peer.
 * The offerer status may be shifted to the other peer depending on
 *   when version of browser that is initiating the connection
 *   to what version of browser to.
 * @method _doOffer
 * @param {String} targetMid The Peer ID to send the <code>OFFER</code> to.
 * @param {JSON} peerBrowser The Peer platform agent information.
 * @param {String} peerBrowser.name The Peer platform browser or agent name.
 * @param {Number} peerBrowser.version The Peer platform browser or agent version.
 * @param {Number} peerBrowser.os The Peer platform name.
 * @param {Function} renegoCallback The callback function that triggers after
 *   the offer has been created or responsed.
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

    unifiedOfferConstraints.mandatory.iceRestart = true;
    peerBrowser.os = peerBrowser.os || '';

    if (peerBrowser.agent !== 'MCU') {
      /*
       // for windows firefox to mac chrome interopability
      if (window.webrtcDetectedBrowser === 'firefox' &&
        window.navigator.platform.indexOf('Win') === 0 &&
        peerBrowser.agent !== 'firefox' &&
        peerBrowser.agent !== 'MCU' &&
        peerBrowser.os.indexOf('Mac') === 0) {
        beOfferer = false;
      }*/
      if (window.webrtcDetectedBrowser === 'firefox' && peerBrowser.agent !== 'firefox') {
        beOfferer = false;
      }
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
        // Trigger the re-negotation callback error
        if (typeof self._peerRenegoCallbacks[targetMid] === 'function') {
          self._peerRenegoCallbacks[targetMid](null, error);
        }
      }, unifiedOfferConstraints);
    } else {
      log.debug([targetMid, null, null, 'User\'s browser is not eligible to create ' +
        'the offer to the other peer. Requesting other peer to create the offer instead'
        ], peerBrowser);

      // Trigger the re-negotation callback non-offerer
      if (typeof self._peerRenegoCallbacks[targetMid] === 'function') {
        self._peerRenegoCallbacks[targetMid](null, null);
      } else {
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
    }
  }, inputConstraints);
};

/**
 * Responses to the <code>OFFER</code> session description received and
 *    creates an <code>ANSWER</code> session description to sent
 *   to the associated Peer to complete the WebRTC handshake layer.
 * @method _doAnswer
 * @param {String} targetMid The Peer ID to send the <code>ANSWER</code> to.
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
    // No ICE restart constraints for createAnswer as it fails in chrome 48
    // { iceRestart: true }
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
 * Starts the waiting timeout for a "healthy" connection
 *   with associated Peer connection.
 * It waits for any existing Peer "healthy" state in successful
 *   {{#crossLink "Skylink/_peerConnectionHealth:attr"}}_peerConnectionHealth{{/crossLink}}.
 * If timeout has reached it's limit and does not have any "healthy" connection state
 *   with Peer connection, it will restart the connection again with
 *   {{#crossLink "Skylink/_restartPeerConnection:method"}}_restartPeerConnection(){{/crossLink}}.
 * This sets the timeout object associated with the Peer into
 *   {{#crossLink "Skylink/_peerConnectionHealthTimers"}}_peerConnectionHealthTimers(){{/crossLink}}.
 * @method _startPeerConnectionHealthCheck
 * @param {String} peerId The Peer ID to start a waiting timeout for a "healthy" connection.
 * @param {Boolean} [toOffer=false] The flag that indicates if Peer connection
 *   is an offerer or an answerer for an accurate timeout waiting time.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._startPeerConnectionHealthCheck = function (peerId, toOffer) {
  var self = this;
  var timer = (self._enableIceTrickle && !self._peerIceTrickleDisabled[peerId]) ?
    (toOffer ? 12500 : 10000) : 50000;
  timer = (self._hasMCU) ? 105000 : timer;

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
 * Stops the waiting timeout for a "healthy" connection associated
 *   with the Peer.
 * @method _stopPeerConnectionHealthCheck
 * @param {String} peerId The Peer ID to stop a waiting
 *   timeout for a "healthy" connection.
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
 * Sets the WebRTC handshake layer session description into the
 *   Peer <code>RTCPeerConnection</code> object <i><code>
 *   RTCPeerConnection.setLocalDescription()</code></i> associated
 *   with the Peer connection.
 * @method _setLocalAndSendMessage
 * @param {String} targetMid The Peer ID to send the session description to
 *   after setting into the associated <code>RTCPeerConnection</code> object.
 * @param {JSON} sessionDescription The <code>OFFER</code> or an <code>ANSWER</code>
 *   session description to set to the associated Peer after setting into
 *   the <code>RTCPeerConnection</code> object.
 * @trigger handshakeProgress
 * @private
 * @component Peer
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
      // Trigger the re-negotation callback success
      if (typeof self._peerRenegoCallbacks[targetMid] === 'function') {
        self._peerRenegoCallbacks[targetMid](sessionDescription, null);
      } else {
        self._sendChannelMessage({
          type: sessionDescription.type,
          sdp: sessionDescription.sdp,
          mid: self._user.sid,
          target: targetMid,
          rid: self._room.id
        });
      }
    } else {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Waiting for Ice gathering to complete to prevent Ice trickle']);
    }
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Failed setting local description: '], error);
    // Trigger the re-negotation callback error (setLocalDescription)
    if (typeof self._peerRenegoCallbacks[targetMid] === 'function') {
      self._peerRenegoCallbacks[targetMid](null, error);
    }
  });
};

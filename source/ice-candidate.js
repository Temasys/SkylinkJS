/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE gathering states after
 * <a href="#method_joinRoom"><code>joinRoom()</code> method</a> was successful.
 * @attribute CANDIDATE_GENERATION_STATE
 * @param {String} GATHERING <small>Value <code>"gathering"</code></small>
 *   The value of the state when Peer connection is gathering ICE candidates.
 *   <small>These ICE candidates are sent to Peer for its connection to check for a suitable matching
 *   pair of ICE candidates to establish an ICE connection for stream audio, video and data.
 *   See <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a> for ICE connection status.</small>
 *   <small>This state cannot happen until Peer connection remote <code>"offer"</code> / <code>"answer"</code>
 *   session description is set. See <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> for session description exchanging status.</small>
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection gathering of ICE candidates has completed.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * Stores the list of buffered ICE candidates that is received before
 *   remote session description is received and set.
 * @attribute _peerCandidatesQueue
 * @param {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
 * @param {Object} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._peerCandidatesQueue = {};

/**
 * Stores the list of Peer connection ICE candidates.
 * @attribute _gatheredCandidates
 * @param {JSON} <#peerId> The list of the Peer connection ICE candidates.
 * @param {JSON} <#peerId>.sending The list of the Peer connection ICE candidates sent.
 * @param {JSON} <#peerId>.receiving The list of the Peer connection ICE candidates received.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype._gatheredCandidates = {};

/**
 * Function that handles the Peer connection gathered ICE candidate to be sent.
 * @method _onIceCandidate
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;

  if (candidate.candidate) {
    var messageCan = candidate.candidate.split(' ');
    var candidateType = messageCan[7];
    log.debug([targetMid, 'RTCIceCandidate', null, 'Created and sending ' +
      candidateType + ' candidate:'], candidate);

    if (self._forceTURN && candidateType !== 'relay') {
      if (!self._hasMCU) {
        log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
          '" candidate as TURN connections is forced'], candidate);
        return;
      }

      log.warn([targetMid, 'RTCICECandidate', null, 'Not ignoring sending of "' + candidateType +
        '" candidate although TURN connections is forced as MCU is present'], candidate);
    }

    if (!self._gatheredCandidates[targetMid]) {
      self._gatheredCandidates[targetMid] = {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      };
    }

    self._gatheredCandidates[targetMid].sending[candidateType].push({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate
    });

    if (!self._enableIceTrickle) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
        '" candidate as trickle ICE is disabled'], candidate);
      return;
    }

    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.CANDIDATE,
      label: candidate.sdpMLineIndex,
      id: candidate.sdpMid,
      candidate: candidate.candidate,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id
    });

  } else {
    log.debug([targetMid, 'RTCIceCandidate', null, 'End of gathering']);
    self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.COMPLETED,
      targetMid);
    // Disable Ice trickle option
    if (!self._enableIceTrickle) {
      var sessionDescription = self._peerConnections[targetMid].localDescription;

      // make checks for firefox session description
      if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER && window.webrtcDetectedBrowser === 'firefox') {
        sessionDescription.sdp = self._addSDPSsrcFirefoxAnswer(targetMid, sessionDescription.sdp);
      }

      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: self._user.sid,
        agent: window.webrtcDetectedBrowser,
        target: targetMid,
        rid: self._room.id
      });
    }

    // We should remove this.. this could be due to ICE failures
    // Adding this fix is bad
    // Does the restart in the case when the candidates are extremely a lot
    /*var doACandidateRestart = self._addedCandidates[targetMid].relay.length > 20 &&
      (window.webrtcDetectedBrowser === 'chrome' || window.webrtcDetectedBrowser === 'opera');

    log.debug([targetMid, 'RTCIceCandidate', null, 'Relay candidates generated length'], self._addedCandidates[targetMid].relay.length);

    if (doACandidateRestart) {
      setTimeout(function () {
        if (self._peerConnections[targetMid]) {
          if(self._peerConnections[targetMid].iceConnectionState !== self.ICE_CONNECTION_STATE.CONNECTED &&
            self._peerConnections[targetMid].iceConnectionState !== self.ICE_CONNECTION_STATE.COMPLETED) {
            // restart
            self._restartPeerConnection(targetMid, true, true, null, false);
          }
        }
      }, self._addedCandidates[targetMid].relay.length * 50);
    }*/
  }
};

/**
 * Function that buffers the Peer connection ICE candidate when received
 *   before remote session description is received and set.
 * @method _addIceCandidateToQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, candidate) {
  log.debug([targetMid, null, null, 'Queued candidate to add after ' +
    'setRemoteDescription'], candidate);
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push(candidate);
};

/**
 * Function that handles when the Peer connection received ICE candidate
 *   has been added or processed successfully.
 * Separated in a function to prevent jshint errors.
 * @method _onAddIceCandidateSuccess
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._onAddIceCandidateSuccess = function () {
  log.debug([null, 'RTCICECandidate', null, 'Successfully added ICE candidate']);
};

/**
 * Function that handles when the Peer connection received ICE candidate
 *   has failed adding or processing.
  * Separated in a function to prevent jshint errors.
 * @method _onAddIceCandidateFailure
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._onAddIceCandidateFailure = function (error) {
  log.error([null, 'RTCICECandidate', null, 'Error'], error);
};

/**
 * Function that adds all the Peer connection buffered ICE candidates received.
 * This should be called only after the remote session description is received and set.
 * @method _addIceCandidateFromQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  if(this._peerCandidatesQueue[targetMid].length > 0) {
    for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
      var candidate = this._peerCandidatesQueue[targetMid][i];
      log.debug([targetMid, null, null, 'Added queued candidate'], candidate);
      this._peerConnections[targetMid].addIceCandidate(candidate,
        this._onAddIceCandidateSuccess, this._onAddIceCandidateFailure);
    }
    delete this._peerCandidatesQueue[targetMid];
  } else {
    log.log([targetMid, null, null, 'No queued candidates to add']);
  }
};
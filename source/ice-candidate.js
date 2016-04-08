/**
 * Stores the list of buffered ICE candidates received
 *   before <code>RTCPeerConnection.setRemoteDescription</code> is
 *   called. Adding ICE candidates before receiving the remote
 *   session description causes an ICE connection failures in a
 *   number of instances.
 * @attribute _peerCandidatesQueue
 * @param {Array} (#peerId) The Peer ID associated with the
 *   list of buffered ICE candidates.
 * @param {Object} (#peerId).(#index) The buffered RTCIceCandidate
 *   object associated with the Peer.
 * @type JSON
 * @private
 * @required
 * @since 0.5.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._peerCandidatesQueue = {};

/**
 * Stores the list of candidates sent <code>local</code> and added <code>remote</code> information.
 * @attribute _addedCandidates
 * @param {JSON} (#peerId) The list of candidates sent and added associated with the Peer ID.
 * @param {Array} (#peerId).relay The number of relay candidates added and sent.
 * @param {Array} (#peerId).srflx The number of server reflexive candidates added and sent.
 * @param {Array} (#peerId).host The number of host candidates added and sent.
 * @type JSON
 * @private
 * @required
 * @since 0.6.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._addedCandidates = {};

/**
 * The list of Peer connection ICE candidate generation states that Skylink would trigger.
 * - These states references the [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCIceGatheringState).
 * @attribute CANDIDATE_GENERATION_STATE
 * @type JSON
 * @param {String} NEW <small>Value <code>"new"</code></small>
 *   The state when the object was just created, and no networking has occurred yet.<br>
 * This state occurs when Peer connection has just been initialised.
 * @param {String} GATHERING <small>Value <code>"gathering"</code></small>
 *   The state when the ICE engine is in the process of gathering candidates for connection.<br>
 * This state occurs after <code>NEW</code> state.
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The ICE engine has completed gathering. Events such as adding a
 *   new interface or a new TURN server will cause the state to go back to gathering.<br>
 * This state occurs after <code>GATHERING</code> state and means ICE gathering has been done.
 * @readOnly
 * @since 0.4.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * Handles the ICE candidate object received from associated Peer connection
 *   to send the ICE candidate object or wait for all gathering to complete
 *   before sending the candidate to prevent trickle ICE.
 * @method _onIceCandidate
 * @param {String} targetMid The Peer ID associated with the ICE
 *   candidate object received.
 * @param {RTCIceCandidate} candidate The local generated candidate object.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;

  if (candidate.candidate) {
    var messageCan = candidate.candidate.split(' ');
    var candidateType = messageCan[7];
    log.debug([targetMid, 'RTCIceCandidate', null, 'Created and sending ' +
      candidateType + ' candidate:'], candidate);

    if (!self._enableIceTrickle) {
      log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
        '" candidate as trickle ICE is disabled'], candidate);
      return;
    }

    if (self._forceTURN && candidateType !== 'relay') {
      if (!self._hasMCU) {
        log.warn([targetMid, 'RTCICECandidate', null, 'Ignoring sending of "' + candidateType +
          '" candidate as TURN connections is forced'], candidate);
        return;
      }

      log.warn([targetMid, 'RTCICECandidate', null, 'Not ignoring sending of "' + candidateType +
        '" candidate although TURN connections is forced as MCU is present']);
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

    if (!self._addedCandidates[targetMid]) {
      self._addedCandidates[targetMid] = {
        relay: [],
        host: [],
        srflx: []
      };
    }

    // shouldnt happen but just incase
    if (!self._addedCandidates[targetMid][candidateType]) {
      self._addedCandidates[targetMid][candidateType] = [];
    }

    self._addedCandidates[targetMid][candidateType].push('local:' + messageCan[4] +
      (messageCan[5] !== '0' ? ':' + messageCan[5] : '') +
      (messageCan[2] ? '?transport=' + messageCan[2].toLowerCase() : ''));

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
 * Buffers an ICE candidate object associated with a Peer connection
 *   to prevent disruption to ICE connection when ICE candidate
 *   is received before <code>RTCPeerConnection.setRemoteDescription</code>
 *   is called.
 * @method _addIceCandidateToQueue
 * @param {String} targetMid The Peer ID associated with the ICE
 *   candidate object.
 * @param {Object} candidate The constructed ICE candidate object.
 * @private
 * @since 0.5.2
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, candidate) {
  log.debug([targetMid, null, null, 'Queued candidate to add after ' +
    'setRemoteDescription'], candidate);
  this._peerCandidatesQueue[targetMid] =
    this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push(candidate);
};

/**
 * Handles the event when adding an ICE candidate has been added
 *   successfully. This is mainly to prevent JShint errors.
 * @method _onAddIceCandidateSuccess
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateSuccess = function () {
  log.debug([null, 'RTCICECandidate', null, 'Successfully added ICE candidate']);
};

/**
 * Handles the event when adding an ICE candidate has failed.
 * This is mainly to prevent JShint errors.
 * @method _onAddIceCandidateFailure
 * @param {Object} error The error received in the failure callback
 *   in <code>RTCPeerConnection.addIceCandidate(candidate, successCb, failureCb)</code>.
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateFailure = function (error) {
  log.error([null, 'RTCICECandidate', null, 'Error'], error);
};

/**
 * Adds the list of ICE candidates bufferred before <code>RTCPeerConnection.setRemoteDescription
 *   </code> is called associated with the Peer connection.
 * @method _addIceCandidateFromQueue
 * @param {String} targetMid The Peer ID to add the associated bufferred
 *   ICE candidates.
 * @private
 * @since 0.5.2
 * @component ICE
 * @for Skylink
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
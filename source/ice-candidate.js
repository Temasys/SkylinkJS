/**
 * Stores the list of buffered ICE candidates received
 *   before <code>RTCPeerConnection.setRemoteDescription</code> is
 *   called. Adding ICE candidates before receiving the remote
 *   session description causes an ICE connection failures in a
 *   number of instances.
 * @attribute _peerCandidatesQueue
 * @param {Array} (#peerId) The list of buffered ICE candidates
 *   associated with the PeerConnection.
 * @type JSON
 * @private
 * @required
 * @since 0.5.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._peerCandidatesQueue = {};

/**
 * Stores the list of flags associated to the PeerConnections
 *   to disable trickle ICE as attempting to establish an
 *   ICE connection failed after many trickle ICE connection
 *   attempts. To ensure the stability and increase the chances
 *   of a successful ICE connection, track the PeerConnection and store
 *   it as a flag in this list to disable trickling of ICE connections.
 * @attribute _peerIceTrickleDisabled
 * @param {Boolean} (#peerId) The PeerConnection ICE trickle disabled flag.
 * @type JSON
 * @private
 * @required
 * @since 0.5.8
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._peerIceTrickleDisabled = {};

/**
 * The list of PeerConnection ICE candidate generation triggered states.
 * Refer to [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/
 *   #idl-def-RTCIceGatheringState).
 * @attribute CANDIDATE_GENERATION_STATE
 * @type JSON
 * @param {String} NEW The object was just created, and no networking
 *   has occurred yet.
 * @param {String} GATHERING The ICE engine is in the process of gathering
 *   candidates for connection.
 * @param {String} COMPLETED The ICE engine has completed gathering. Events
 *   such as adding a new interface or a new TURN server will cause the
 *   state to go back to gathering.
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
 * Handles the ICE candidate object received from associated PeerConnection
 *   to send the ICE candidate object or wait for all gathering to complete
 *   before sending the candidate to prevent trickle ICE.
 * @method _onIceCandidate
 * @param {String} targetMid The PeerConnection ID associated with the ICE
 *   candidate object received.
 * @param {Event} event The event object received in the <code>RTCPeerConnection.
 *   onicecandidate</code> to parse the ICE candidate and determine
 *   if gathering has completed.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onIceCandidate = function(targetMid, event) {
  if (event.candidate) {
    if (this._enableIceTrickle && !this._peerIceTrickleDisabled[targetMid]) {
      var messageCan = event.candidate.candidate.split(' ');
      var candidateType = messageCan[7];
      log.debug([targetMid, 'RTCIceCandidate', null, 'Created and sending ' +
        candidateType + ' candidate:'], event);

      this._sendChannelMessage({
        type: this._SIG_MESSAGE_TYPE.CANDIDATE,
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        mid: this._user.sid,
        target: targetMid,
        rid: this._room.id
      });
    }
  } else {
    log.debug([targetMid, 'RTCIceCandidate', null, 'End of gathering']);
    this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.COMPLETED,
      targetMid);
    // Disable Ice trickle option
    if (!this._enableIceTrickle || this._peerIceTrickleDisabled[targetMid]) {
      var sessionDescription = this._peerConnections[targetMid].localDescription;
      this._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: this._user.sid,
        agent: window.webrtcDetectedBrowser,
        target: targetMid,
        rid: this._room.id
      });
    }
  }
};

/**
 * Buffers an ICE candidate object associated with a PeerConnection
 *   to prevent disruption to ICE connection when ICE candidate
 *   is received before <code>RTCPeerConnection.setRemoteDescription</code>
 *   is called.
 * @method _addIceCandidateToQueue
 * @param {String} targetMid The PeerConnection associated with the ICE
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
 *   </code> is called associated with the PeerConnection.
 * @method _addIceCandidateFromQueue
 * @param {String} targetMid The PeerConnection ID to add the associated bufferred
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
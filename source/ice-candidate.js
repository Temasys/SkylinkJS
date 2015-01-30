/**
 * Stores the list of queued ICE Candidates received before handshaking is completed.
 * @attribute _peerCandidatesQueue
 * @type Object
 * @private
 * @required
 * @since 0.5.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._peerCandidatesQueue = [];

/**
 * The list of ICE candidate generation states that would be triggered.
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
 * An ICE candidate has just been generated (ICE gathering) and will be sent to the peer.
 * Part of connection establishment.
 * @method _onIceCandidate
 * @param {String} targetMid The peerId of the target peer.
 * @param {Event} event This is provided directly by the peerconnection API.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onIceCandidate = function(targetMid, event) {
  if (event.candidate) {
    if (this._enableIceTrickle) {
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
    if (!this._enableIceTrickle) {
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
 * Stores an ICE Candidate received before handshaking
 * @method _addIceCandidateToQueue
 * @param {String} targetMid The peerId of the target peer.
 * @param {Object} candidate The ICE Candidate object.
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
 * Handles the event when adding ICE Candidate passes.
 * @method _onAddIceCandidateSuccess
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateSuccess = function () {
  log.debug([targetMid, 'RTCICECandidate', candidate.sdpMid, 
    'Successfully added ICE candidate']);
};

/**
 * Handles the event when adding ICE Candidate fails.
 * @method _onAddIceCandidateFailure
 * @private
 * @since 0.5.9
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._onAddIceCandidateFailure = function (error) {
  log.error([targetMid, 'RTCICECandidate', 
    candidate.sdpMid, 'Error'], error);
};

/**
 * Adds all stored ICE Candidates received before handshaking.
 * @method _addIceCandidateFromQueue
 * @param {String} targetMid The peerId of the target peer.
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
    log.log([targetMid, null, null, 'No queued candiate to add']);
  }
};
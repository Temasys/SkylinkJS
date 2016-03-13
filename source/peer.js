/**
 * Stores the Peers.
 * @attribute _peers
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.x
 */
Skylink.prototype._peers = {};

/**
 * Creates a Peer.
 * @method _createPeer
 * @param {String} peerId The Peer ID.
 * @param {JSON} peerData The Peer information and settings.
 * @private
 * @for Skylink
 * @since 0.6.x
 */
Skylink.prototype._createPeer = function (peerId, peerData) {
  var superRef = this;

  /**
   * Singleton class object for the provided Peer.
   * @class SkylinkPeer
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  var SkylinkPeer = function () {
    // peerData is basically the data received in the message object in "welcome" / "enter"
    // Configure for enableDataChannel setting
    if (typeof peerData.enableDataChannel === 'boolean') {
      // Both the Peer and the User has to have datachannel option enabled
      this._connectionSettings.enableDataChannel = peerData.enableDataChannel === true &&
        this._connectionStatus.enableDataChannel;
    }

    // Configure for enableIceTrickle setting
    if (typeof peerData.enableIceTrickle === 'boolean') {
      // Both the Peer and the User has to have trickle ICE enabled
      this._connectionSettings.enableIceTrickle = peerData.enableIceTrickle === true &&
        this._connectionStatus.enableIceTrickle;
    }

    // Configure the agent name information
    if (typeof peerData.agent === 'string') {
      this.agent.name = peerData.agent;
    }

    // Configure the agent version information
    if (typeof peerData.version === 'number') {
      this.agent.version = peerData.version;
    }

    // Configure the agent os information
    if (typeof peerData.os === 'string') {
      this.agent.os = peerData.os;
    }

    // Configure the Peer session information
    if (typeof peerData.userInfo === 'object' && peerData.userInfo !== null) {
      // Configure the custom data information
      this.data = peerData.userInfo.userData;

      // Configure the streamingInfo.mediaStatus information
      if (typeof peerData.userInfo.mediaStatus === 'object' && peerData.userInfo.mediaStatus !== null) {
        this.streamingInfo.mediaStatus = peerData.userInfo.mediaStatus;
      }

      // Configure the streamingInfo.settings information
      if (typeof peerData.userInfo.settings === 'object' && peerData.userInfo.settings !== null) {
        this.streamingInfo.settings = peerData.userInfo.settings;

        // Configure for stereo setting
        if (typeof peerData.userInfo.settings.audio === 'object') {
          // Both the Peer and the User has to have OPUS codec stereo option enabled
          this._connectionSettings.stereo = peerData.userInfo.settings.audio.stereo === true &&
            this._connectionStatus.stereo;
        }
      }
    }

    // Starts the RTCPeerConnection
    this._construct();
  };

  /**
   * Stores the Peer ID.
   * @attribute id
   * @type String
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.id = peerId;

  /**
   * Stores the Peer custom user data.
   * @attribute data
   * @type Any
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.data = null;

  /**
   * Stores the Peer connecting agent information.
   * @attribute agent
   * @type JSON
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.agent = {
    name: 'Unknown',
    version: 0,
    os: ''
  };

  /**
   * Stores the Peer priority weight for handshaking offerer.
   * @attribute weight
   * @type Number
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.weight = peerData.weight;

  /**
   * Stores the Peer streaming information.
   * @attribute streamingInfo
   * @type JSON
   * @for SkylinKPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.streamingInfo = {
    settings: {},
    mediaStatus: {}
  };

  /**
   * Stores the list of DataChannels.
   * @attribute _channels
   * @type JSON
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._channels = {};

  /**
   * Stores the Peer connection settings.
   * @attribute _connectionSettings
   * @type JSON
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._connectionSettings = {
    enableDataChannel: superRef._enableDataChannel === true,
    enableIceTrickle: superRef._enableIcetrickle === true,
    stereo: superRef._streamSettings.audio && superRef._streamSettings.audio.stereo === true
  };

  /**
   * Stores the Peer connection RTCIceCandidate.
   * @attribute _candidates
   * @type JSON
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._candidates = {
    incoming: {
      queued: [],
      success: [],
      failure: []
    },
    outgoing: []
  };

  /**
   * Stores the Peer connection status.
   * @attribute _connectionStatus
   * @type JSON
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._connectionStatus = {
    candidatesGathered: false,
    established: false,
    checker: null,
    retries: 0,
    iceFailures: 0
  };

  /**
   * Stores the Peer connection RTCPeerConnection reference.
   * @attribute _RTCPeerConnection
   * @type RTCPeerConnection
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._RTCPeerConnection = null;

  /**
   * Gets the Peer information.
   * @method getInfo
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.getInfo = function () {
    var ref = this;

    var returnData = {
      userData: clone(ref.data),
      settings: clone(ref.streamingInfo.settings),
      mediaStatus: clone(ref.streamingInfo.mediaStatus),
      agent: clone(ref.agent),
      room: clone(superRef._selectedRoom)
    };

    // Prevent (false) being returned as ''
    if (typeof returnData.userData === 'undefined') {
      returnData.userData = '';
    }

    return returnData;
  };

  /**
   * Creates the RTCPeerConnection object.
   * @method _construct
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._construct = function () {
    var ref = this;

    // RTCPeerConnection configuration
    var configuration = {
      iceServers: []
    };
    // RTCPeerConnection optional configuration
    var optional = {
      optional: [{
        DtlsSrtpKeyAgreement: true
      }]
    };

    if (Array.isArray(superRef._room.connection.peerConfig.iceServers)) {
      configuration.iceServers = superRef._room.connection.peerConfig.iceServers;
    }

    ref._RTCPeerConnection = new RTCPeerConnection(configuration, optional);

    /**
     * Handles the .onicecandidate event.
     */
    ref._RTCPeerConnection.onicecandidate = function (evt) {
      var candidate = evt.candidate || evt;

      // If RTCIceCandidate.candidate returns null, it means that is has been gathered completely
      if (!candidate.candidate) {
        log.log([ref.id, 'Peer', 'RTCIceCandidate', 'Local candidates have been gathered completely']);

        // "Spoof" the .onicegatheringstatechange event to "completed". It seems like
        // .onicegatheringstatechange is never triggered and not event used in apprtc.appspot.com now
        log.log([ref.id, 'Peer', 'RTCIceGatheringState', 'Current ICE gathering state ->'],
          superRef.CANDIDATE_GENERATION_STATE.COMPLETED);

        /* TODO: Should we spoof the other states as well? Like "gathering" */
        superRef._trigger('candidateGenerationState', superRef.CANDIDATE_GENERATION_STATE.COMPLETED, ref.id);

        /* TODO: Send the local SDP if trickle ICE is disabled */

      // Else RTCIceCandidate.candidate gathering is still on-going
      } else {
        log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Generated local candidate ->'], candidate);

        /* TODO: Should we not send the RTCIceCandidate if it's not a TURN candidate under the forceTURN circumstance */
        superRef._sendChannelMessage({
          type: superRef._SIG_MESSAGE_TYPE.CANDIDATE,
          label: candidate.sdpMLineIndex,
          id: candidate.sdpMid,
          candidate: candidate.candidate,
          mid: superRef._user.sid,
          target: ref.id,
          rid: superRef._room.id
        });

        log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Sending generated local candidate ->'], candidate);

        ref._candidates.outgoing.push(candidate);
      }
    };

    /**
     * Handles the .onaddstream event.
     */
    ref._RTCPeerConnection.onaddstream = function (evt) {
      var stream = evt.stream || evt;

      log.log([ref.id, 'Peer', 'MediaStream', 'Received remote stream ->'], stream);

      /* TODO: Should we do integration checks to wait for magical timeout */
      /* TODO: Should we check if it's an empty stream first before triggering this */

      // Check if received remote MediaStream is empty first before triggering event
      // Or ignore if it's from MCU directly since it doesn't send any remote MediaStream from this RTCPeerConnection object
      if (!(!!ref.streamingInfo.settings.audio || !!ref.streamingInfo.settings.video) ||
        ref.id === 'MCU') {
        log.warn([ref.id, 'Peer', 'MediaStream', 'Dropping of received remote stream as it is empty ->'], stream);
        return;
      }

      superRef._trigger('incomingStream', ref.id, stream, false, ref.getInfo());
    };

    /**
     * Handles the .oniceconnectionstatechange event.
     */
    ref._RTCPeerConnection.oniceconnectionstatechange = function () {
      var state = ref._RTCPeerConnection.iceConnectionState;

      log.log([ref.id, 'Peer', 'RTCIceConnectionState', 'Current ICE connection state ->'], state);

      superRef._trigger('iceConnectionState', state, ref.id);

      /* TODO: Trigger "trickleFailed" */
      /* TODO: Reconnect when "failed" or "disconnected" */
    };

    /**
     * Handles the .onsignalingstatechange event.
     */
    ref._RTCPeerConnection.onsignalingstatechange = function () {
      var state = ref._RTCPeerConnection.signalingState;

      log.log([ref.id, 'Peer', 'RTCSignalingState', 'Current signaling state ->'], state);

      superRef._trigger('peerConnectionState', state, ref.id);

      /* TODO: Fix when "closed" and attempt to reconnect if object is not meant to be closed */
    };

    /**
     * Handles the .onicegatheringstatechange event.
     */
    /*ref._RTCPeerConnection.onicegatheringstatechange = function () {
      var state = ref._RTCPeerConnection.iceGatheringState;

      log.log([ref.id, 'Peer', 'RTCIceGatheringState', 'Current ICE gathering state ->'], state);

      superRef._trigger('candidateGenerationState', state, ref.id);
    };*/

    /* TODO: Should we listen to .ondatachannel event */

    // Add local MediaStream object
    ref.addStream();
  };

  /**
   * Adds the local MediaStream object.
   * @method addStream
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.addStream = function () {
    var ref = this;

    /* TODO: Handle MCU case where "Peers" are not supposed to receive stream */
    if (superRef._hasMCU && ref.id !== 'MCU') {
      log.debug([ref.id, 'Peer', 'MediaStream', 'Dropping of sending any local stream as ' +
        'we are receiving only']);
      return;
    }

    var removeStreamFn = function (rStream) {
      // Fallback polyfill for Firefox
      if (window.webrtcDetectedBrowser === 'firefox') {
        var senders = ref._RTCPeerConnection.getSenders();

        for (var s = 0; s < senders.length; s++) {
          var tracks = rStream.getTracks();

          for (var t = 0; t < tracks.length; t++) {
            if (tracks[t] === senders[s].track) {
              ref._RTCPeerConnection.removeTrack(senders[s]);
            }
          }
        }
      } else {
        ref._RTCPeerConnection.removeStream(rStream);
      }
    };

    // Remove all the currently added MediaStreams
    var alStreams = ref._RTCPeerConnection.getLocalStreams();

    for (var s = 0; s < alStreams.length; s++) {
      log.debug([ref.id, 'Peer', 'MediaStream', 'Removing local stream ->'], alStreams[s]);

      removeStreamFn(alStreams[s]);
    }

    // If there is screensharing local MediaStream and send this first
    if (superRef._mediaScreen) {
      log.log([ref.id, 'Peer', 'MediaStream', 'Sending local stream (screensharing) ->'], superRef._mediaScreen);

      ref._RTCPeerConnection.addStream(superRef._mediaScreen);

    // Else if there is userMedia local MediaStream and send this
    } else if (superRef._mediaStream) {
      log.log([ref.id, 'Peer', 'MediaStream', 'Sending local stream (userMedia) ->'], superRef._mediaStream);

      ref._RTCPeerConnection.addStream(superRef._mediaStream);

    // Else we will be sending no local MediaStream
    } else {
      log.warn([ref.id, 'Peer', 'MediaStream', 'Sending no stream']);
    }
  };

  /**
   * Creates the offer for the RTCPeerConnection object.
   * @method handshakeOffer
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeOffer = function () {
    var ref = this;

    // Add checks if RTCPeerConnection signalingState is "stable" first
    if (ref._RTCPeerConnection.signalingState !== 'stable') {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of creating local offer ' +
        'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
      return;
    }

    // Handle the RTCOfferOptions
    var options = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };

    // Safari / IE does not support the new format yet
    if (['firefox', 'chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
      options = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };

      /* TODO: Implement ICE restart ? */
    }

    /* TODO: Create DataChannel here? */

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Creating local offer with options ->'], options);

    // Start creating the local offer
    //- Success case
    ref._RTCPeerConnection.createOffer(function (offer) {
      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Created local offer ->'], offer);

      // Set the local offer
      ref._handshakeSetLocal(offer);

    //- Failure case
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed creating local offer ->'], error);

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);

    //- The options
    }, options);
  };

  /**
   * Creates the answer for the RTCPeerConnection object.
   * @method handshakeAnswer
   * @param {RTCSessionDescription} offer The remote offer received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeAnswer = function (offer) {
    var ref = this;

    // Add checks if RTCPeerConnection signalingState is "stable" first
    if (ref._RTCPeerConnection.signalingState !== 'stable') {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of creating local answer ' +
        'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
      return;
    }

    // Setting remote offer first
    ref._handshakeSetRemote(offer, function () {
      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Creating local answer']);

      // Start creating the local answer
      //- Success case
      ref._RTCPeerConnection.createAnswer(function (answer) {
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Created local answer ->'], answer);

        // Set the local answer
        ref._handshakeSetLocal(answer);

      //- Failure case
      }, function (error) {
        log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed creating local answer ->'], error);

        superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
      });
    });
  };

  /**
   * Completes the handshaking for the RTCPeerConnection object.
   * @method handshakeComplete
   * @param {RTCSessionDescription} answer The remote answer received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeComplete = function (answer) {
    var ref = this;

    // Setting remote answer first
    ref._handshakeSetRemote(answer, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Handshaking has completed']);
    });
  };

  /**
   * Sets the local RTCSessionDescription object.
   * @method _handshakeSetLocal
   * @param {RTCSessionDescription} sessionDescription The local sessionDescription created.
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handshakeSetLocal = function (sessionDescription) {
    var ref = this;

    // Add checks if RTCPeerConnection signalingState is "stable" first if RTCSessionDescription.type is "offer"
    if (sessionDescription.type === 'offer') {
      if (ref._RTCPeerConnection.signalingState !== 'stable') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting local offer ' +
          'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    // Add checks if RTCPeerConnection signalingState is "have-remote-offer" first if RTCSessionDescription.type is "answer"
    } else {
      if (ref._RTCPeerConnection.signalingState !== 'have-remote-offer') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting local answer ' +
          'as signalingState is not "have-remote-offer" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    }

    /* TODO: SDP modifications */

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Setting local ' + sessionDescription.type + ' ->'], sessionDescription);

    // Set the local RTCSessionDescription
    //- Success case
    ref._RTCPeerConnection.setLocalDescription(sessionDescription, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Set local ' + sessionDescription.type + ' success ->'], sessionDescription);

      /* TODO: Implement trickle ICE disabled case to not send local RTCSessionDescription until gathering has completed */
      /* TODO: Fix the firefox local answer first before sending to Chrome/Opera/IE/Safari */

      superRef._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: superRef._user.sid,
        target: ref.id,
        rid: superRef._room.id
      });

      superRef._trigger('handshakeProgress', sessionDescription.type, ref.id);

      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Sending local ' + sessionDescription.type + ' ->'], sessionDescription);

    //- Failure case
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed setting local ' + sessionDescription.type + ' ->'], error);

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
    });
  };

  /**
   * Sets the remote RTCSessionDescription object.
   * @method _handshakeSetRemote
   * @param {RTCSessionDescription} sessionDescription The remote sessionDescription received.
   * @param {Function} callback The callback function triggered when setting the remote sessionDescription is succesful.
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handshakeSetRemote = function (sessionDescription, callback) {
    var ref = this;

    // Add checks if RTCPeerConnection signalingState is "stable" first if RTCSessionDescription.type is "offer"
    if (sessionDescription.type === 'offer') {
      if (ref._RTCPeerConnection.signalingState !== 'stable') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting remote offer ' +
          'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    // Add checks if RTCPeerConnection signalingState is "have-remote-offer" first if RTCSessionDescription.type is "answer"
    } else {
      if (ref._RTCPeerConnection.signalingState !== 'have-local-offer') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting remote answer ' +
          'as signalingState is not "have-local-offer" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    }

    /* TODO: SDP modifications */

    // If user is using Firefox and this is MCU, replace the RTCSessionDescription.sdp to suit MCU needs
    if (window.webrtcDetectedBrowser === 'firefox' && ref.id === 'MCU') {
      sessionDescription.sdp = superRef._parseSDP.MCUFirefoxAnswer(sessionDescription.sdp);
    }

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Setting remote ' + sessionDescription.type + ' ->'], sessionDescription);

    // Set the remote RTCSessionDescription
    //- Success case
    ref._RTCPeerConnection.setRemoteDescription(sessionDescription, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Set remote ' + sessionDescription.type + ' success ->'], sessionDescription);

      superRef._trigger('handshakeProgress', sessionDescription.type, ref.id);

      callback();

      for (var i = 0; i < ref._candidates.incoming.queued.length; i++) {
        var candidate = ref._candidates.incoming.queued[i];

        log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Adding remote candidate (queued) ->'], candidate);

        ref.addCandidate(candidate);
      }

      ref._candidates.incoming.queued = [];

    //- Failure case
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed setting remote ' + sessionDescription.type + ' ->'], error);

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
    });
  };

  /**
   * Sets the remote RTCIceCandidate object.
   * @method addCandidate
   * @param {RTCIceCandidate} candidate The remote candidate received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.addCandidate = function (candidate) {
    var ref = this;

    // Add checks if RTCPeerConnection signalingState is "stable" first if RTCSessionDescription.type is "offer"
    if (!(!!ref._RTCPeerConnection.remoteDescription && !!ref._RTCPeerConnection.remoteDescription.sdp)) {
      log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Queuing remote candidate as connection is not ready yet ->'], candidate);

      ref._candidates.incoming.queued.push(candidate);
      return;
    }

    log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Adding remote candidate ->'], candidate);

    // Adds the remote RTCIceCandidate
    //- Success case
    ref._RTCPeerConnection.addIceCandidate(candidate, function () {
      log.log([ref.id, 'Peer', 'RTCIceCandidate', 'Added remote candidate successfully ->'], candidate);

      ref._candidates.incoming.success.push(candidate);

    //- Failure case
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed adding remote candidate ->'], error);

      /* NOTE: Should we have a clearer log to point which error to which candidate? */

      ref._candidates.incoming.failure.push(candidate);
    });
  };

  /**
   * Destroys the RTCPeerConnection object.
   * @method disconnect
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.disconnect = function () {
    var ref = this;

    ref._RTCPeerConnection.close();

    /* TODO: Close all DataChannels connection */
    /* TODO: Clear all timers */

    log.log([ref.id, 'Peer', null, 'Closed connection']);
  };

  /* TODO: Add timers */

  superRef._peers[peerId] = new SkylinkPeer();
};

/**
 * Destroys a Peer.
 * @method _destroyPeer
 * @param {String} peerId The Peer ID.
 * @private
 * @for Skylink
 * @since 0.6.x
 */
Skylink.prototype._destroyPeer = function (peerId) {
  var superRef = this;

  if (superRef._peers[peerId]) {
    superRef._peers[peerId].disconnect();
    delete superRef._peers[peerId];
  }
};
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
    // Configure for enableDataChannel setting
    //   This feature allows RTCDataChannel channel between the Peers RTCPeerConnection
    if (typeof peerData.enableDataChannel === 'boolean') {
      // Ensure that it can only be true if both Peers have the enableDataChannel option as true
      this._connectionSettings.enableDataChannel = peerData.enableDataChannel === true &&
        this._connectionSettings.enableDataChannel === true;
    }

    /* NOTE: What do we do in mobile SDKs setting ? If we set defaults based on init() configuration,
       having it as false might cause issues since mobile SDKs has it true always be default */
    // Configure for enableIceTrickle setting
    //   This feature allows trickling of ICE connection for faster establishment of connectivity
    if (typeof peerData.enableIceTrickle === 'boolean') {
      // Ensure that it can only be true if both Peers have the enableIceTrickle option as true
      this._connectionSettings.enableIceTrickle = peerData.enableIceTrickle === true &&
        this._connectionSettings.enableIceTrickle === true;
    }

    // Configure for enableIceRestart setting
    //   This feature allows fetching of new RTCIceCandidates when iceConnectionState is "failed" or
    //   "disconnected", which enables a more successful reconnection
    if (typeof peerData.enableIceRestart === 'boolean') {
      // Ensure that it can only be true if both Peers have the enableIceRestart option as true
      this._connectionSettings.enableIceRestart = peerData.enableIceRestart === true &&
        superRef._enableIceRestart === true;

    // Fallback to ensure that enableIceRestart is false if not configured since other SDKs does not
    //   have ICE restart feature implemented on their end yet
    } else {
      this._connectionSettings.enableIceRestart = false;
    }

    // Configure the agent name information
    //   Examples: "Android", "iOS", "firefox", "chrome", "safari" etc
    if (typeof peerData.agent === 'string') {
      this.agent.name = peerData.agent;
    }

    // Configure the agent version information
    //   Examples: 47, 0.1
    if (typeof peerData.version === 'number') {
      this.agent.version = peerData.version;
    }

    // Configure the agent os information. This field may be empty
    //   Examples: "MacOSIntel", "Win32"
    if (typeof peerData.os === 'string') {
      this.agent.os = peerData.os;
    }

    // Configure the weight setting
    //   The Peer with the highest weight will be determined as the offerer always.
    //   This weight is configured once each time a Room session has started.
    if (typeof peerData.weight === 'number') {
      this.weight = peerData.weight;
    }

    // Update the new streaming information
    this.update(peerData);

    // Construct the RTCPeerConnection object reference
    this._construct();

    // Peer has joined the Room
    if (this.id === 'MCU') {
      superRef._trigger('serverPeerJoined', 'MCU', superRef.SERVER_PEER_TYPE.MCU);

    } else {
      superRef._trigger('peerJoined', this.id, this.getInfo(), false);
    }
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
  SkylinkPeer.prototype.weight = 0;

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
    enableIceTrickle: superRef._enableIceTrickle === true,
    enableIceRestart: false,
    stereo: false
  };

  /**
   * Stores the Peer connection RTCIceCandidates.
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
    candidatesGathering: false,
    established: false,
    checker: null,
    retries: 0,
    timeout: 0,
    iceFailures: 0,
    processingLocalSDP: false,
    processingRemoteSDP: false,
    updateCounter: 0
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
   * Gets the Peer information for <code>getPeerInfo()</code>.
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

    // Prevent typeof "boolean" (false) or (null) being returned as an empty string
    if (typeof returnData.userData === 'undefined') {
      returnData.userData = '';
    }

    return returnData;
  };

  /**
   * Creates the offer RTCSessionDescription for the RTCPeerConnection object.
   * @method handshakeOffer
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeOffer = function () {
    var ref = this;

    // Prevent creating the local offer RTCSessionDescription if RTCPeerConnection.signalingState is not "stable"
    if (ref._RTCPeerConnection.signalingState !== 'stable') {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of creating local offer ' +
        'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
      return;
    }

    /* NOTE: Firefox may support ICE restart in later build of Nightly 48 */
    var restartICE = ref._connectionSettings.enableIceRestart &&
      ['disconnected', 'failed'].indexOf(ref._RTCPeerConnection.iceConnectionState) > -1;

    // RTCPeerConnection.createOffer() RTCOfferOptions
    var options = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        iceRestart: restartICE
      }
    };

    // Fallback to the older mandatory format as Safari / IE does not support the new format yet
    if (['firefox', 'chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
      options = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        /* NOTE: Is this flag standard in mandatory ? */
        iceRestart: restartICE
      };
    }

    /* TODO: Create DataChannel here? */

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Creating local offer with options ->'], options);

    /**
     * Start creating the local offer RTCSessionDescription with createOffer()
     */
    // RTCPeerConnection.createOffer() success
    ref._RTCPeerConnection.createOffer(function (offer) {
      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Created local offer ->'], offer);

      if (superRef._SDPParser.detectICERestart(ref._RTCPeerConnection.localDescription, offer)) {
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Restarting the ICE gathered flag as ' +
          'ICE restart is detected']);

        ref._connectionStatus.candidatesGathered = false;
      }

      // Sets the local offer RTCSessionDescription
      ref._handshakeSetLocal(offer);

    // RTCPeerConnection.createOffer() failure
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed creating local offer ->'], error);

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);

    // RTCPeerConnection.createOffer() RTCOfferOptions parameter
    }, options);
  };

  /**
   * Creates the answer RTCSessionDescription for the RTCPeerConnection object
   *   based on the offer RTCSessionDescription received.
   * @method handshakeAnswer
   * @param {RTCSessionDescription} offer The remote offer RTCSessionDescription received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeAnswer = function (offer) {
    var ref = this;

    // Prevent creating the local answer RTCSessionDescription if RTCPeerConnection.signalingState is not "stable"
    if (ref._RTCPeerConnection.signalingState !== 'stable') {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of creating local answer ' +
        'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
      return;
    }

    // Sets the remote offer RTCSessionDescription
    ref._handshakeSetRemote(offer, function () {
      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Creating local answer']);

      /**
       * Start creating the local answer RTCSessionDescription with createAnswer()
       */
      // RTCPeerConnection.createAnswer() success
      ref._RTCPeerConnection.createAnswer(function (answer) {
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Created local answer ->'], answer);

        if (superRef._SDPParser.detectICERestart(ref._RTCPeerConnection.localDescription, answer)) {
          log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Restarting the ICE gathered flag as ' +
            'ICE restart is detected']);

          ref._connectionStatus.candidatesGathered = false;
        }

        // Set the local answer
        ref._handshakeSetLocal(answer);

      // RTCPeerConnection.createAnswer() failure
      }, function (error) {
        log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed creating local answer ->'], error);

        superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
      });
    });
  };

  /**
   * Completes the handshaking of local/remote RTCSessionDescription for the RTCPeerConnection object.
   * @method handshakeComplete
   * @param {RTCSessionDescription} answer The remote answer RTCSessionDescription received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeComplete = function (answer) {
    var ref = this;

    // Sets the remote answer RTCSessionDescription
    ref._handshakeSetRemote(answer, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Handshaking has completed']);
    });
  };

  /**
   * Restarts the handshaking of local/remote RTCSessionDescription for the RTCPeerConnection object.
   * @method handshakeRestart
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.handshakeRestart = function () {
    var ref = this;

    // Check if RTCPeerConnection.signalingState is at "have-local-offer",
    //   which we resend the local offer RTCSessionDescription
    if (ref._RTCPeerConnection.signalingState === 'have-local-offer') {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Resending of local offer ' +
        'as signalingState is at "have-local-offer" ->'], ref._RTCPeerConnection.signalingState);

      var sessionDescription = ref._RTCPeerConnection.localDescription;

      // Prevent sending a corrupted local RTCSessionDescription
      if (!(!!sessionDescription && !!sessionDescription.sdp)) {
        log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of sending local sessionDescription ' +
          'as it is missing']);
        return;
      }

      // Check if trickle ICE is disabled or if the candidate generation has been completed as in the
      //   use-case of trickle ICE disabled, it sends the local RTCSessionDescription with all the RTCIceCandidates
      if (!ref._connectionSettings.enableIceTrickle && !ref._connectionStatus.candidatesGathered) {
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Halting resending of local ' + sessionDescription.type +
          ' until local candidates have all been gathered ->'], sessionDescription);
        return;
      }

      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Resending local ' +
        sessionDescription.type + ' ->'], sessionDescription);

      // Resend the local RTCSessionDescription
      superRef._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: superRef._user.sid,
        target: ref.id,
        rid: superRef._room.id
      });

    // Restart connection negotiation handshaking
    } else {
      // Update to the latest local MediaStream everytime a request for restart connection
      ref._addStream();

      // Send the restart message to start re-negotiation (another handshaking of local/remote RTCSessionDescription)
      superRef._sendChannelMessage({
        type: superRef._SIG_MESSAGE_TYPE.RESTART,
        mid: superRef._user.sid,
        rid: superRef._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: superRef.getPeerInfo(),
        target: ref.id,
        weight: superRef._peerPriorityWeight,
        receiveOnly: superRef._hasMCU && ref.id !== 'MCU',
        enableIceTrickle: superRef._enableIceTrickle,
        enableDataChannel: superRef._enableDataChannel,
        enableIceRestart: superRef._enableIceRestart
      });

      // Peer has restarted connection (another set of handshaking)
      if (ref.id === 'MCU') {
        superRef._trigger('serverPeerRestart', 'MCU', superRef.SERVER_PEER_TYPE.MCU);

      } else {
        superRef._trigger('peerRestart', ref.id, ref.getInfo(), true);
      }
    }

    // Start the connection monitor checker
    ref.monitorConnection();
  };

  /**
   * Monitors the RTCPeerConnection connection object and the main RTCDataChannel connection.
   * This restarts the RTCPeerConnection connection object if connection is bad.
   * @method monitorConnection
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.monitorConnection = function () {
    var ref = this;

    // Configure the waiting timeout trickle ICE
    if (ref._connectionSettings.enableIceTrickle) {
      /* NOTE: Is there proof that it takes longer ? */
      // The Peer that is the offerer should take longer
      if (ref.weight > superRef._peerPriorityWeight) {
        ref._connectionStatus.timeout = 12500;
      } else {
        ref._connectionStatus.timeout = 10000;
      }

    // Configure a higher waiting timeout if trickle ICE is disabled as it would take longer
    //   for all the local RTCIceCandidates to be gathered
    } else {
      ref._connectionStatus.timeout = 50000;
    }

    /* NOTE: Unknown reason why it was added like that in the past */
    // Configure an additional waiting timeout for MCU environment
    if (superRef._hasMCU) {
      ref._connectionStatus.timeout = 105000;
    }

    // Increment the waiting timeout based off the retries counter
    ref._connectionStatus.timeout += ref._connectionStatus.retries * 10000;

    // Clear any existing checker to replace with the new checker
    if (ref._connectionStatus.checker) {
      clearTimeout(ref._connectionStatus.checker);
    }

    // Start a new connection status checker
    ref._connectionStatus.checker = setTimeout(function () {
      var isDataChannelConnectionHealthy = true; //false;
      var isConnectionHealthy = false;

      // Prevent restarting the Peer if the connection has ended
      if (!superRef._peers[ref.id]) {
        log.warn([ref.id, 'Peer', 'RTCPeerConnection', 'Dropping of restarting connection as connection has ended']);
        return;
      }

      // Prevent restarting a "closed" RTCPeerConnection
      if (ref._RTCPeerConnection.signalingState === 'closed') {
        log.warn([ref.id, 'Peer', 'RTCPeerConnection', 'Dropping of restarting connection as signalingState ' +
          'is "closed" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }

      if (superRef._hasMCU) {
        log.warn([ref.id, 'Peer', 'RTCPeerConnection', 'Dropping of restart connection it is in MCU environment']);
        return;
      }

      /* TODO: Implement main DataChannels connection checker */
      /*if (ref._connectionSettings.enableDataChannel) {
        if (ref._channels.main) {
          isDataChannelConnectionHealthy = true;
        }

      // Setting the datachannel connection healthy flag as "true" because there's not a need
      } else {
        isDataChannelConnectionHealthy = true;
      }*/

      if (['connected', 'completed'].indexOf(ref._RTCPeerConnection.iceConnectionState) > -1 &&
        ref._RTCPeerConnection.signalingState === 'stable') {
        isConnectionHealthy = true;
      }

      if (isDataChannelConnectionHealthy && isConnectionHealthy) {
        log.debug([ref.id, 'Peer', 'RTCPeerConnection', 'Dropping of restarting connection as connection ' +
          'is healthy']);
        return;
      }

      log.debug([ref.id, 'Peer', 'RTCPeerConnection', 'Restarting connection again ->'], {
        channel: isDataChannelConnectionHealthy,
        connection: isConnectionHealthy
      });

      // Limit the maximum increment to 5 minutes
      if (ref._connectionStatus.retries < 30){
        ref._connectionStatus.retries++;
      }

      ref.handshakeRestart();

    }, ref._connectionStatus.timeout);

    log.log([ref.id, 'Peer', 'RTCPeerConnection', 'Monitoring connection status']);
  };

  /**
   * Sets the remote RTCIceCandidate for the RTCPeerConnection object.
   * @method addCandidate
   * @param {RTCIceCandidate} candidate The remote RTCIceCandidate received.
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.addCandidate = function (candidate) {
    var ref = this;

    // Check if trickle ICE is disabled, which in that case we do no need to send the RTCIceCandidate
    //   as it will be present in the remote RTCSessionDescription
    if (!ref._connectionSettings.enableIceTrickle) {
      log.debug([ref.id, 'Peer', 'RTCIceCandidate',
        'Not adding remote candidate as trickle ICE is disabled ->'], candidate);
      return;
    }

    // Prevent adding other types of candidates if it's not a "relay" (TURN) candidate
    if (superRef._forceTURN && candidate.candidate.indexOf('relay') === -1) {
      log.warn([ref.id, 'Peer', 'RTCIceCandidate', 'Dropping of adding remote candidate ' +
        'as it is not a "relay" candidate in forced TURN case ->'], candidate);
      return;
    }

    // Prevent adding remote RTCIceCandidate if RTCPeerConnection object does not have remote RTCSessionDescription
    if (!(!!ref._RTCPeerConnection.remoteDescription && !!ref._RTCPeerConnection.remoteDescription.sdp)) {
      log.debug([ref.id, 'Peer', 'RTCIceCandidate',
        'Queuing remote candidate as connection is not ready yet ->'], candidate);

      // Queues the remote RTCIceCandidate received,
      //   which is to be added after remote RTCSessionDescription is received
      ref._candidates.incoming.queued.push(candidate);
      return;
    }

    log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Adding remote candidate ->'], candidate);

    /**
     * Adds the remote RTCIceCandidate with addIceCandidate()
     */
    // RTCPeerConnection.addIceCandidate() success
    ref._RTCPeerConnection.addIceCandidate(candidate, function () {
      log.log([ref.id, 'Peer', 'RTCIceCandidate', 'Added remote candidate successfully ->'], candidate);

      ref._candidates.incoming.success.push(candidate);

    // RTCPeerConnection.addIceCandidate() failure
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed adding remote candidate ->'], {
        error: error,
        candidate: candidate
      });

      ref._candidates.incoming.failure.push({
        candidate: candidate,
        error: error
      });
    });
  };

  /**
   * Updates the Peer information.
   * @method update
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.update = function (peerData) {
    var ref = this;

    // Configure the Peer session information
    if (typeof peerData.userInfo === 'object' && peerData.userInfo !== null) {
      // Configure the custom data information
      if (peerData.userInfo.hasOwnProperty('userData')) {
        ref.data = peerData.userInfo.userData;
      }

      // Configure the streaming muted status information
      if (typeof peerData.userInfo.mediaStatus === 'object' && peerData.userInfo.mediaStatus !== null) {
        ref.streamingInfo.mediaStatus = peerData.userInfo.mediaStatus;
      }

      // Configure the streaming settings information
      if (typeof peerData.userInfo.settings === 'object' && peerData.userInfo.settings !== null) {
        ref.streamingInfo.settings = peerData.userInfo.settings;

        // Configure for streaming settings audio stereo (for OPUS codec connection) setting
        if (typeof peerData.userInfo.settings.audio === 'object') {
          /* NOTE: Perhaps we actually need not to have both Peers connected to have OPUS streaming since
             it is not the decoding part for the self Peer only? */
          // Both Peers has to have audio.stereo option enabled
          ref._connectionSettings.stereo = peerData.userInfo.settings.audio.stereo === true &&
            (superRef._streamSettings.audio && superRef._streamSettings.audio.stereo === true);
        }
      }
    }

    if (ref._connectionStatus.updateCounter > 0) {
      superRef._trigger('peerUpdated', ref.id, ref.getInfo(), false);
    }

    ref._connectionStatus.updateCounter++;

    log.log([ref.id, 'Peer', null, 'Session streaming information has been updated ->'], ref.getInfo());
  };

  /**
   * Destroys the RTCPeerConnection object.
   * @method disconnect
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype.disconnect = function () {
    var ref = this;

    // Prevent closing a RTCPeerConnection object at signalingState that is "closed",
    // as it might throw an Error
    if (ref._RTCPeerConnection.signalingState !== 'closed') {
      log.debug([ref.id, 'Peer', 'RTCPeerConnection', 'Closing connection']);

      ref._RTCPeerConnection.close();
    }

    // Clear the connection health timer if there is one existing
    if (ref._connectionStatus.checker) {
      log.debug([ref.id, 'Peer', 'RTCPeerConnection', 'Removing monitoring connection status checker']);

      clearTimeout(ref._connectionStatus.checker);
    }

    // Trigger that the Peer has left the Room (or is disconnected)
    if (ref.id === 'MCU') {
      superRef._trigger('serverPeerLeft', 'MCU', superRef.SERVER_PEER_TYPE.MCU);

    } else {
      superRef._trigger('peerLeft', ref.id, superRef._peers[peerId].getInfo(), false);
    }

    /* TODO: Close all DataChannels connection */

    log.info([ref.id, 'Peer', 'RTCPeerConnection', 'Connection session has ended']);
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

    /**
     * Construct the RTCPeerConnection object
     */
    ref._RTCPeerConnection = new RTCPeerConnection(configuration, optional);

    // Handles the .onicecandidate event.
    ref._handleOnIceCandidateEvent();

    // Handles the .onaddstream event.
    ref._handleOnAddStreamEvent();

    // Handles the .oniceconnectionstatechange event.
    ref._handleOnIceConnectionStateChangeEvent();

    // Handles the .onsignalingstatechange event.
    ref._handleOnSignalingStateChangeEvent();

    // Handles the .ondatachannel event.
    ref._handleOnDataChannelEvent();

    /* NOTE: Not listening to .onicegatheringstatechange event as it's never triggered */

    // Stream the local MediaStream object in connection
    ref._addStream();

    log.log([ref.id, 'Peer', 'RTCPeerConnection', 'Connection has started']);

    // Start a connection monitor checker
    ref.monitorConnection();
  };

  /**
   * Updates with the currently selected local MediaStream object.
   * Screensharing MediaStream gets the priority first before user media MediaStream.
   * @method _addStream
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._addStream = function () {
    var ref = this;

    // Prevent sending of local MediaStream to P2P Peers in MCU environment.
    //   We only send the local MediaStream to the Peer with "MCU" as the ID
    if (superRef._hasMCU && ref.id !== 'MCU') {
      log.debug([ref.id, 'Peer', 'MediaStream', 'Dropping of sending any local stream as ' +
        'we are receiving only']);
      return;
    }

    /**
     * Function that checks if local MediaStream exists before removing all
     *   currently added MediaStreams and sending
     */
    var updateStreamFn = function (updatedStream) {
      var hasAlreadyAdded = false;

      // Remove the currently added local MediaStreams in the RTCPeerConnection object reference
      ref._RTCPeerConnection.getLocalStreams().forEach(function (stream) {
        if (updatedStream !== null && stream.id === updatedStream.id) {
          log.warn([ref.id, 'Peer', 'MediaStream', 'Dropping of removing local stream ' +
            'as it has already been added ->'], stream);
          hasAlreadyAdded = true;
          return;
        }

        log.debug([ref.id, 'Peer', 'MediaStream', 'Removing local stream ->'], stream);

        // Polyfill for removeStream() function as it is currently not implemented in Firefox 40+
        if (window.webrtcDetectedBrowser === 'firefox') {
          // Fetch the list of RTPSenders
          ref._RTCPeerConnection.getSenders().forEach(function (sender) {
            var tracks = stream.getAudioTracks().concat(stream.getVideoTracks());
            // Fetch the list of MediaStreamTracks in the stream
            tracks.forEach(function (track) {
              // If MediaStreamTrack matches, remove the RTPSender in removeTrack() function
              if (track === sender.track) {
                ref._RTCPeerConnection.removeTrack(sender);
              }
            });
          });

        // Use the removeStream() function
        } else {
          ref._RTCPeerConnection.removeStream(stream);
        }
      });

      if (!hasAlreadyAdded && updatedStream !== null) {
        log.debug([ref.id, 'Peer', 'MediaStream', 'Adding local stream ->'], updatedStream);
        ref._RTCPeerConnection.addStream(updatedStream);
      }
    };

    /**
     * Priority: Screensharing > User media > No stream
     */
    // Check if there is screensharing local MediaStream and send this first
    if (superRef._mediaScreen) {
      log.log([ref.id, 'Peer', 'MediaStream', 'Sending local stream (screensharing) ->'], superRef._mediaScreen);

      updateStreamFn(superRef._mediaScreen);

    // Else check if there is userMedia local MediaStream and send this
    } else if (superRef._mediaStream) {
      log.log([ref.id, 'Peer', 'MediaStream', 'Sending local stream (userMedia) ->'], superRef._mediaStream);

      updateStreamFn(superRef._mediaStream);

    // Else we will be sending no local MediaStream
    } else {
      log.warn([ref.id, 'Peer', 'MediaStream', 'Sending no stream']);

      updateStreamFn(null);
    }
  };

  /**
   * Handles the RTCPeerConnection.onicecandidate event.
   * @method _handleOnIceCandidateEvent
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handleOnIceCandidateEvent = function () {
    var ref = this;

    ref._RTCPeerConnection.onicecandidate = function (evt) {
      var candidate = evt.candidate || evt;

      // Check if ICE gathering has completed, which happens when RTCIceCandidate.candidate returns null.
      if (!candidate.candidate) {
        log.log([ref.id, 'Peer', 'RTCIceCandidate', 'Local candidates have been gathered completely']);

        // Polyfill the .onicegatheringstatechange event to "completed".
        //   It seems like .onicegatheringstatechange event is never triggered and not event used in appRTC now
        log.log([ref.id, 'Peer', 'RTCIceGatheringState', 'Current ICE gathering state ->'],
          superRef.CANDIDATE_GENERATION_STATE.COMPLETED);

        ref._connectionStatus.candidatesGathered = true;
        ref._connectionStatus.candidatesGathering = false;

        superRef._trigger('candidateGenerationState', superRef.CANDIDATE_GENERATION_STATE.COMPLETED, ref.id);

        // Check if trickle ICE is disabled, which we have to send the local RTCSessionDescription
        //   after ICE gathering has completed
        if (!ref._connectionSettings.enableIceTrickle) {
          var sessionDescription = ref._RTCPeerConnection.localDescription;

          // Prevent sending a corrupted local RTCSessionDescription
          if (!(!!sessionDescription && !!sessionDescription.sdp)) {
            log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of sending local sessionDescription ' +
              'as it is not ready yet']);
            return;
          }

          /**
           * Parse SDP: Configure for the use-case of switching of streams for the Firefox local RTCSessionDescription
           *   during re-negotiation. Firefox is always the answerer with other Peers
           */
          if (window.webrtcDetectedBrowser === 'firefox' && ref.agent.name !== 'firefox') {
            /* NOTE: Should we check if the sessionDescription.type is "answer" before implementing the logic? */
            log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating Firefox local answer with SSRC lines ' +
              'to interop with other browsers']);
            sessionDescription.sdp = superRef._SDPParser.configureFirefoxAnswerSSRC(sessionDescription.sdp);
          }

          log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Sending delayed local ' +
            sessionDescription.type + ' ->'], sessionDescription);

          // Send the delayed local RTCSessionDescription (with all RTCIceCandidates present)
          superRef._sendChannelMessage({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp,
            mid: superRef._user.sid,
            target: ref.id,
            rid: superRef._room.id
          });
        }

      // Else RTCIceCandidate.candidate is still gathering
      } else {
        log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Generated local candidate ->'], candidate);

        if (!ref._connectionStatus.candidatesGathering) {
          // Polyfill the .onicegatheringstatechange event to "gathering".
          //   It seems like .onicegatheringstatechange event is never triggered and not event used in appRTC now
          log.log([ref.id, 'Peer', 'RTCIceGatheringState', 'Current ICE gathering state ->'],
            superRef.CANDIDATE_GENERATION_STATE.GATHERING);

          ref._connectionStatus.candidatesGathering = true;

          superRef._trigger('candidateGenerationState', superRef.CANDIDATE_GENERATION_STATE.GATHERING, ref.id);
        }

        // Check if trickle ICE is disabled, which in that case we do no need to send the RTCIceCandidate
        //   as it will be present in the local RTCSessionDescription
        if (!ref._connectionSettings.enableIceTrickle) {
          log.debug([ref.id, 'Peer', 'RTCIceCandidate',
            'Not sending local candidate as trickle ICE is disabled ->'], candidate);
          return;
        }

        // Prevent sending other types of candidates if it's not a "relay" (TURN) candidate
        if (superRef._forceTURN && candidate.candidate.indexOf('relay') === -1) {
          log.warn([ref.id, 'Peer', 'RTCIceCandidate', 'Dropping of sending local candidate ' +
            'as it is not a "relay" candidate in forced TURN case ->'], candidate);
          return;
        }

        // Send the local RTCIceCandidate
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

        // Log the local RTCIceCandidate sent
        ref._candidates.outgoing.push(candidate);
      }
    };
  };

  /**
   * Handles the RTCPeerConnection.onaddstream event.
   * @method _handleOnAddStreamEvent
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handleOnAddStreamEvent = function () {
    var ref = this;

    // Handle Firefox 46 and above using .ontrack and deprecating .onaddstream
    if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 45) {
      var stream = new MediaStream();
      var hasTriggeredStreamEvent = false;

      ref._RTCPeerConnection.ontrack = function (evt) {
        var track = evt.track || evt;

        log.log([ref.id, 'Peer', 'MediaStreamTrack', 'Received remote track ->'], track);

        stream.addTrack(track);

        // Prevent triggering of empty remote MediaStream if Peer ID is "MCU" since MCU does not
        //   send any remote MediaStream from this Peer but from the P2P Peers
        if (ref.id !== 'MCU' && !hasTriggeredStreamEvent) {
          log.log([ref.id, 'Peer', 'MediaStream', 'Constructing remote stream ->'], stream);

          superRef._trigger('incomingStream', ref.id, stream, false, ref.getInfo());
          hasTriggeredStreamEvent = true;
        }

        /* NOTE: Should we actually use .getRemoteStreams() to get the MediaStream with the correct ID ? */
      };

    } else {
      ref._RTCPeerConnection.onaddstream = function (evt) {
        var stream = evt.stream || evt;

        log.log([ref.id, 'Peer', 'MediaStream', 'Received remote stream ->'], stream);

        /* NOTE: Should we do integration checks to wait for magical timeout */

        // Prevent triggering of empty remote MediaStream by checking the streaming information or if Peer ID
        //   is "MCU" since MCU does not send any remote MediaStream from this Peer but from the P2P Peers
        if (!(!!ref.streamingInfo.settings.audio || !!ref.streamingInfo.settings.video) || ref.id === 'MCU') {
          log.warn([ref.id, 'Peer', 'MediaStream', 'Dropping of received remote stream as it is empty ->'], stream);
          return;
        }

        superRef._trigger('incomingStream', ref.id, stream, false, ref.getInfo());
      };
    }
  };

  /**
   * Handles the RTCPeerConnection.oniceconnectionstatechange event.
   * @method _handleOnIceConnectionStateChangeEvent
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handleOnIceConnectionStateChangeEvent = function () {
    var ref = this;

    ref._RTCPeerConnection.oniceconnectionstatechange = function () {
      var state = ref._RTCPeerConnection.iceConnectionState;

      log.log([ref.id, 'Peer', 'RTCIceConnectionState', 'Current ICE connection state ->'], state);

      superRef._trigger('iceConnectionState', state, ref.id);

      // Increment every ICE failures
      if (state === 'failed') {
        ref._connectionStatus.iceFailures++;
      }

      // Go to "trickleFailed" state if trickle ICE is enabled and iceConnectionState "failed" for the 3rd time
      if (ref._connectionSettings.enableIceTrickle && ref._connectionStatus.iceFailures === 3) {
        superRef._trigger('iceConnectionState', superRef.ICE_CONNECTION_STATE.TRICKLE_FAILED);
      }

      // Restart connection for iceConnectionState "failed" or "disconnected"
      if (['failed', 'disconnected'].indexOf(state) > -1) {
        ref.handshakeRestart();
      }
    };
  };

  /**
   * Handles the RTCPeerConnection.onsignalingstatechange event.
   * @method _handleOnSignalingStateChangeEvent
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handleOnSignalingStateChangeEvent = function () {
    var ref = this;

    ref._RTCPeerConnection.onsignalingstatechange = function () {
      var state = ref._RTCPeerConnection.signalingState;

      log.log([ref.id, 'Peer', 'RTCSignalingState', 'Current signaling state ->'], state);

      superRef._trigger('peerConnectionState', state, ref.id);

      /* NOTE: We will not fix when "closed" and attempt to reconnect if object is not meant to be closed */
    };
  };

  /**
   * Handles the RTCPeerConnection.ondatachannel event.
   * @method _handleOnDataChannelEvent
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handleOnDataChannelEvent = function () {
    var ref = this;

    ref._RTCPeerConnection.ondatachannel = function (evt) {
      var channel = evt.channel || evt;

      log.log([ref.id, 'Peer', 'RTCDataChannel', 'Received datachannel ->'], channel);
    };
  };

  /**
   * Sets the local RTCSessionDescription object.
   * @method _handshakeSetLocal
   * @param {RTCSessionDescription} sessionDescription The local RTCSessionDescription.
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handshakeSetLocal = function (sessionDescription) {
    var ref = this;

    // Prevent setting the local offer RTCSessionDescription if
    //   RTCPeerConnection.signalingState is not "stable"
    if (sessionDescription.type === 'offer') {
      if (ref._RTCPeerConnection.signalingState !== 'stable') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting local offer ' +
          'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    // Prevent setting the local answer RTCSessionDescription if
    //   RTCPeerConnection.signalingState is not "have-remote-offer"
    } else {
      if (ref._RTCPeerConnection.signalingState !== 'have-remote-offer') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting local answer ' +
          'as signalingState is not "have-remote-offer" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    }

    /**
     * Parse SDP: Configure OPUS codec stereo modification
     */
    log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating OPUS stereo enabled option ->'],
      ref._connectionSettings.stereo);

    sessionDescription.sdp = superRef._SDPParser.configureOPUSStereo(sessionDescription.sdp,
      ref._connectionSettings.stereo);

    /**
     * Parse SDP: Configure the connection issues with Chrome 50 to Safari/IE browsers
     *   when Chrome is offerer
     */
    if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1 &&
      ['IE', 'safari'].indexOf(ref.agent.name) > -1 && sessionDescription.type === 'offer') {

      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating local offer for connection from ' +
        'Chrome/Opera browsers to Safari/IE browsers']);

      sessionDescription.sdp = superRef._SDPParser.configureChrome50OfferToPluginBrowsers(sessionDescription.sdp);
    }

    /**
     * Parse SDP: Configure the maximum audio bitrate to send
     */
    // Prevent retrieving values when .bandwidth is not defined.
    if (superRef._streamSettings.bandwidth && typeof superRef._streamSettings.bandwidth.audio === 'number' &&
      superRef._streamSettings.bandwidth.audio > 0) {

      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating maximum sending audio bitrate ->'],
        superRef._streamSettings.bandwidth.audio);

      sessionDescription.sdp = superRef._SDPParser.configureMaxSendingBandwidth(sessionDescription.sdp,
        'audio', superRef._streamSettings.bandwidth.audio);

    } else {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Not configuration maximum sending audio bitrate ' +
        'and leaving to browser\'s defaults']);
    }

    /**
     * Parse SDP: Configure the maximum video bitrate to send
     */
    // Prevent retrieving values when .bandwidth is not defined.
    if (superRef._streamSettings.bandwidth && typeof superRef._streamSettings.bandwidth.video === 'number' &&
      superRef._streamSettings.bandwidth.video > 0) {

      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating maximum sending video bitrate ->'],
        superRef._streamSettings.bandwidth.video);

      sessionDescription.sdp = superRef._SDPParser.configureMaxSendingBandwidth(sessionDescription.sdp,
        'video', superRef._streamSettings.bandwidth.video);

    } else {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Not configuration maximum sending video bitrate ' +
        'and leaving to browser\'s defaults']);
    }

    /**
     * Parse SDP: Configure the maximum data bitrate to send
     */
    // Prevent retrieving values when .bandwidth is not defined.
    if (superRef._streamSettings.bandwidth && typeof superRef._streamSettings.bandwidth.data === 'number' &&
      superRef._streamSettings.bandwidth.data > 0) {

      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating maximum sending data bitrate ->'],
        superRef._streamSettings.bandwidth.data);

      sessionDescription.sdp = superRef._SDPParser.configureMaxSendingBandwidth(sessionDescription.sdp,
        'data', superRef._streamSettings.bandwidth.data);

    } else {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Not configuration maximum sending data bitrate ' +
        'and leaving to browser\'s defaults']);
    }

    /**
     * Parse SDP: Remove the H264 preference from Firefox 32 (Ubuntu) browsers that was
     *   causing connection issues previously
     */
    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Removing any Firefox H264 profile experimental feature']);

    sessionDescription.sdp = superRef._SDPParser.removeFirefoxH264Pref(sessionDescription.sdp);

    /**
     * Configure the audio codec to use in connection when available
     */
    if (superRef._selectedAudioCodec !== superRef.AUDIO_CODEC.AUTO) {
      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating to select audio codec if available ->'],
        superRef._selectedAudioCodec);

      sessionDescription.sdp = superRef._SDPParser.configureCodec(sessionDescription.sdp, 'audio',
        superRef._selectedAudioCodec);

    } else {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Using browser\'s selected default audio codec']);
    }

    /**
     * Parse SDP: Configure the video codec to use in connection when available
     */
    if (superRef._selectedVideoCodec !== superRef.VIDEO_CODEC.AUTO) {
      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating to select video codec if available ->'],
        superRef._selectedVideoCodec);

      sessionDescription.sdp = superRef._SDPParser.configureCodec(sessionDescription.sdp, 'video',
        superRef._selectedVideoCodec);

    } else {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Using browser\'s selected default video codec']);
    }

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Setting local ' +
      sessionDescription.type + ' ->'], sessionDescription);

    // Prevent setting the local RTCSessionDescription if the
    //   RTCPeerConnection object is currently processing another local RTCSessionDescription
    if (ref._connectionStatus.processingLocalSDP) {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting local ' + sessionDescription.type +
        ' as another local description is being processed ->'], sessionDescription);
      return;
    }

    // Set the processing local RTCSessionDescription flag to true
    ref._connectionStatus.processingLocalSDP = true;

    /**
     * Sets the local RTCSessionDescription with setLocalDescription()
     */
    // RTCPeerConnection.setLocalDescription() success
    ref._RTCPeerConnection.setLocalDescription(sessionDescription, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Set local ' +
        sessionDescription.type + ' success ->'], sessionDescription);

      // Set the processing local RTCSessionDescription flag to false
      ref._connectionStatus.processingLocalSDP = false;

      superRef._trigger('handshakeProgress', sessionDescription.type, ref.id);

      // Check if trickle ICE is disabled or if the candidate generation has been completed as in the use-case
      //   of trickle ICE disabled, it sends the local RTCSessionDescription with all the RTCIceCandidates
      if (!ref._connectionSettings.enableIceTrickle && !ref._connectionStatus.candidatesGathered) {
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Halting sending of local ' + sessionDescription.type +
          ' until local candidates have all been gathered ->'], sessionDescription);
        return;
      }

      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Sending local ' +
        sessionDescription.type + ' ->'], sessionDescription);

      /**
       * Parse SDP: Configure for the use-case of switching of streams for the Firefox local RTCSessionDescription
       *   during re-negotiation. Firefox is always the answerer with other Peers
       */
      if (window.webrtcDetectedBrowser === 'firefox' && ref.agent.name !== 'firefox') {
        /* NOTE: Should we check if the sessionDescription.type is "answer" before implementing the logic? */
        log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating Firefox local answer with SSRC lines ' +
          'to interop with other browsers']);
        sessionDescription.sdp = superRef._SDPParser.configureFirefoxAnswerSSRC(sessionDescription.sdp);
      }

      // Send the local RTCSessionDescription
      superRef._sendChannelMessage({
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        mid: superRef._user.sid,
        target: ref.id,
        rid: superRef._room.id
      });

    // RTCPeerConnection.setLocalDescription() failure
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed setting local ' +
        sessionDescription.type + ' ->'], error);

      // Set the processing local RTCSessionDescription flag to false
      ref._connectionStatus.processingLocalSDP = false;

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
    });
  };

  /**
   * Sets the remote RTCSessionDescription object.
   * @method _handshakeSetRemote
   * @param {RTCSessionDescription} sessionDescription The remote RTCSessionDescription received.
   * @param {Function} callback The callback function triggered when
   *   setting the remote RTCSessionDescription is succesful.
   * @private
   * @for SkylinkPeer
   * @since 0.6.x
   */
  SkylinkPeer.prototype._handshakeSetRemote = function (sessionDescription, callback) {
    var ref = this;

    // Prevent setting the remote offer RTCSessionDescription if
    //   RTCPeerConnection.signalingState is not "stable"
    if (sessionDescription.type === 'offer') {
      if (ref._RTCPeerConnection.signalingState !== 'stable') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting remote offer ' +
          'as signalingState is not "stable" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    // Prevent setting the local offer RTCSessionDescription if
    //   RTCPeerConnection.signalingState is not "have-local-offer"
    } else {
      if (ref._RTCPeerConnection.signalingState !== 'have-local-offer') {
        log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting remote answer ' +
          'as signalingState is not "have-local-offer" ->'], ref._RTCPeerConnection.signalingState);
        return;
      }
    }

    /**
     * Parse SDP: Configure for the use-case where self Peer is Firefox and Peer ID is "MCU"
     *   to suit MCU environment needs
     */
    if (window.webrtcDetectedBrowser === 'firefox' && ref.id === 'MCU') {
      log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating local answer for Firefox interop with MCU']);
      sessionDescription.sdp = superRef._SDPParser.configureMCUFirefoxAnswer(sessionDescription.sdp);
    }

    /**
     * Parse SDP: Configure to remove non-relay (TURN) candidates when trickle ICE is disabled
     */
    if (superRef._forceTURN && !ref._connectionSettings.enableIceTrickle) {
      log.info([ref.id, 'Peer', 'RTCSessionDescription', 'Configurating to receive only "relay" remote candidates']);
      sessionDescription.sdp = superRef._SDPParser.removeNonRelayCandidates(sessionDescription.sdp);
    }

    log.debug([ref.id, 'Peer', 'RTCSessionDescription', 'Setting remote ' +
      sessionDescription.type + ' ->'], sessionDescription);

    // Prevent setting the remote RTCSessionDescription if the
    //   RTCPeerConnection object is currently processing another remote RTCSessionDescription
    if (ref._connectionStatus.processingRemoteSDP) {
      log.warn([ref.id, 'Peer', 'RTCSessionDescription', 'Dropping of setting remote ' + sessionDescription.type +
        ' as another remote description is being processed ->'], sessionDescription);
      return;
    }

    // Set the processing remote RTCSessionDescription flag to true
    ref._connectionStatus.processingRemoteSDP = true;

    /**
     * Set the remote RTCSessionDescription with setRemoteDescription()
     */
    // RTCPeerConnection.setRemoteDescription() success
    ref._RTCPeerConnection.setRemoteDescription(sessionDescription, function () {
      log.log([ref.id, 'Peer', 'RTCSessionDescription', 'Set remote ' +
        sessionDescription.type + ' success ->'], sessionDescription);

      // Set the processing remote RTCSessionDescription flag to false
      ref._connectionStatus.processingRemoteSDP = false;

      superRef._trigger('handshakeProgress', sessionDescription.type, ref.id);

      callback();

      for (var i = 0; i < ref._candidates.incoming.queued.length; i++) {
        var candidate = ref._candidates.incoming.queued[i];

        log.debug([ref.id, 'Peer', 'RTCIceCandidate', 'Adding remote candidate (queued) ->'], candidate);

        ref.addCandidate(candidate);
      }

      ref._candidates.incoming.queued = [];

    // RTCPeerConnection.setRemoteDescription() failure
    }, function (error) {
      log.error([ref.id, 'Peer', 'RTCSessionDescription', 'Failed setting remote ' +
        sessionDescription.type + ' ->'], error);

      // Set the processing remote RTCSessionDescription flag to false
      ref._connectionStatus.processingRemoteSDP = false;

      superRef._trigger('handshakeProgress', superRef.HANDSHAKE_PROGRESS.ERROR, ref.id, error);
    });
  };

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

  log.log([peerId, 'Peer', 'RTCPeerConnection', 'Session and connection has ended']);
};
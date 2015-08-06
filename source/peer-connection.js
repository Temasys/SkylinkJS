/**
 * The list of Peer connection states that would be triggered.
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {String} STABLE There is no handshaking in progress. This state occurs
 *   when handshaking has just started or close.
 * @param {String} HAVE_LOCAL_OFFER The session description "offer" is generated
 *   and to be sent.
 * @param {String} HAVE_REMOTE_OFFER The session description "offer" is received.
 *   The handshaking has been completed.
 * @param {String} CLOSED The connection is closed.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};

/**
 * Timestamp of the moment when last restart happened.
 * @attribute _lastRestart
 * @type Object
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._lastRestart = null;

/**
 * Counter of the number of consecutive retries.
 * @attribute _retryCount
 * @type Integer
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._retryCount = 0;

/**
 * Internal array of Peer connections.
 * @attribute _peerConnections
 * @type Object
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = [];

/**
 * Stores the list of restart weights received that would be compared against
 * to indicate if User should initiates a restart or Peer should.
 * In general, the one that sends restart later is the one who initiates the restart.
 * @attribute _peerRestartPriorities
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype._peerRestartPriorities = {};

/**
 * Initiates a Peer connection with either a response to an answer or starts
 * a connection with an offer.
 * @method _addPeer
 * @param {String} targetMid PeerId of the peer we should connect to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Number} peerBrowser.version The peer browser version.
 * @param {Number} peerBrowser.os The peer operating system.
 * @param {Boolean} [toOffer=false] Whether we should start the O/A or wait.
 * @param {Boolean} [restartConn=false] Whether connection is restarted.
 * @param {Boolean} [receiveOnly=false] Should they only receive?
 * @param {Boolean} [isSS=false] Should the incoming stream labelled as screensharing mode?
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });

  log.info('Adding peer', isSS);

  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS);
  }
  self._peerConnections[targetMid].receiveOnly = !!receiveOnly;
  self._peerConnections[targetMid].hasScreen = !!isSS;
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
  // I'm the callee I need to make an offer
  if (toOffer) {
    if (self._enableDataChannel) {
      self._dataChannels[targetMid] = self._createDataChannel(targetMid);
    }
    self._doOffer(targetMid, peerBrowser);
  }

  // do a peer connection health check
  this._startPeerConnectionHealthCheck(targetMid, toOffer);
};

/**
 * Restarts a Peer connection.
 * @method _restartPeerConnection
 * @param {String} peerId PeerId of the peer to restart connection with.
 * @param {Boolean} isSelfInitiatedRestart Indicates whether the restarting action
 *   was caused by self.
 * @param {Boolean} isConnectionRestart The flag that indicates whether the restarting action
 *   is caused by connectivity issues.
 * @param {Function} [callback] The callback once restart peer connection is completed.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, isSelfInitiatedRestart, isConnectionRestart, callback, explicit) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  log.log([peerId, null, null, 'Restarting a peer connection']);

  // get the value of receiveOnly
  var receiveOnly = self._peerConnections[peerId] ?
    !!self._peerConnections[peerId].receiveOnly : false;
  var hasScreenSharing = self._peerConnections[peerId] ?
    !!self._peerConnections[peerId].hasScreen : false;

  // close the peer connection and remove the reference
  var iceConnectionStateClosed = false;
  var peerConnectionStateClosed = false;
  var dataChannelStateClosed = !self._enableDataChannel;

  self._peerConnections[peerId].dataChannelClosed = true;

  self.once('iceConnectionState', function () {
    iceConnectionStateClosed = true;
  }, function (state, currentPeerId) {
    return state === self.ICE_CONNECTION_STATE.CLOSED && peerId === currentPeerId;
  });

  self.once('peerConnectionState', function () {
    peerConnectionStateClosed = true;
  }, function (state, currentPeerId) {
    return state === self.PEER_CONNECTION_STATE.CLOSED && peerId === currentPeerId;
  });

  delete self._peerConnectionHealth[peerId];
  delete self._peerRestartPriorities[peerId];

  self._stopPeerConnectionHealthCheck(peerId);

  if (self._peerConnections[peerId].signalingState !== 'closed') {
    self._peerConnections[peerId].close();
  }

  if (self._peerConnections[peerId].hasStream) {
    self._trigger('streamEnded', peerId, self.getPeerInfo(peerId), false);
  }

  self._wait(function () {

    log.log([peerId, null, null, 'Ice and peer connections closed']);

    delete self._peerConnections[peerId];

    log.log([peerId, null, null, 'Re-creating peer connection']);

    self._peerConnections[peerId] = self._createPeerConnection(peerId, !!hasScreenSharing);

    // Set one second tiemout before sending the offer or the message gets received
    setTimeout(function () {
      if (self._peerConnections[peerId]){
        self._peerConnections[peerId].receiveOnly = receiveOnly;
        self._peerConnections[peerId].hasScreen = hasScreenSharing;
      }

      if (!receiveOnly) {
        self._addLocalMediaStreams(peerId);
      }

      if (isSelfInitiatedRestart){
        log.log([peerId, null, null, 'Sending restart message to signaling server']);

        var lastRestart = Date.now() || function() { return +new Date(); };

        var weight = (new Date()).valueOf();
        self._peerRestartPriorities[peerId] = weight;

        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.RESTART,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          os: window.navigator.platform,
          userInfo: self.getPeerInfo(),
          target: peerId,
          isConnectionRestart: !!isConnectionRestart,
          lastRestart: lastRestart,
          weight: weight,
          receiveOnly: receiveOnly,
          enableIceTrickle: self._enableIceTrickle,
          enableDataChannel: self._enableDataChannel,
          sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
          explicit: !!explicit
        });
      }

      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true);

      if (typeof callback === 'function'){
        log.log('Firing callback');
        callback();
      }
    }, 1000);
  }, function () {
    return iceConnectionStateClosed && peerConnectionStateClosed;
  });
};

/**
 * Removes and closes a Peer connection.
 * @method _removePeer
 * @param {String} peerId PeerId of the peer to close connection.
 * @trigger peerLeft
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, this.getPeerInfo(peerId), false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
  }
  // stop any existing peer health timer
  this._stopPeerConnectionHealthCheck(peerId);

  // check if health timer exists
  if (typeof this._peerConnections[peerId] !== 'undefined') {
    // new flag to check if datachannels are all closed
    this._peerConnections[peerId].dataChannelClosed = true;

    if (this._peerConnections[peerId].signalingState !== 'closed') {
      this._peerConnections[peerId].close();
    }

    if (this._peerConnections[peerId].hasStream) {
      this._trigger('streamEnded', peerId, this.getPeerInfo(peerId), false);
    }

    delete this._peerConnections[peerId];
  }

  // check the handshake priorities and remove them accordingly
  if (typeof this._peerHSPriorities[peerId] !== 'undefined') {
    delete this._peerHSPriorities[peerId];
  }
  if (typeof this._peerRestartPriorities[peerId] !== 'undefined') {
    delete this._peerRestartPriorities[peerId];
  }
  if (typeof this._peerInformations[peerId] !== 'undefined') {
    delete this._peerInformations[peerId];
  }
  if (typeof this._peerConnectionHealth[peerId] !== 'undefined') {
    delete this._peerConnectionHealth[peerId];
  }
  // close datachannel connection
  if (this._enableDataChannel) {
    this._closeDataChannel(peerId);
  }

  log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Creates a Peer connection to communicate with the peer whose ID is 'targetMid'.
 * All the peerconnection callbacks are set up here. This is a quite central piece.
 * @method _createPeerConnection
 * @param {String} targetMid The target peer Id.
 * @param {Boolean} [isScreenSharing=false] The flag that indicates if incoming
 *   stream is screensharing mode.
 * @return {Object} The created peer connection object.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  try {
    pc = new window.RTCPeerConnection(
      self._room.connection.peerConfig,
      self._room.connection.peerConstraints);
    log.info([targetMid, null, null, 'Created peer connection']);
    log.debug([targetMid, null, null, 'Peer connection config:'],
      self._room.connection.peerConfig);
    log.debug([targetMid, null, null, 'Peer connection constraints:'],
      self._room.connection.peerConstraints);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  pc.hasScreen = !!isScreenSharing;
  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel) {
      self._dataChannels[targetMid] = self._createDataChannel(targetMid, dc);
    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel']);
    }
  };
  pc.onaddstream = function(event) {
    pc.hasStream = true;

    log.info('Remote stream', event, !!pc.hasScreen);

    self._onRemoteStreamAdded(targetMid, event, !!pc.hasScreen);
  };
  pc.onicecandidate = function(event) {
    log.debug([targetMid, 'RTCIceCandidate', null, 'Ice candidate generated ->'],
      event.candidate);
    self._onIceCandidate(targetMid, event);
  };
  pc.oniceconnectionstatechange = function(evt) {
    checkIceConnectionState(targetMid, pc.iceConnectionState,
      function(iceConnectionState) {
      log.debug([targetMid, 'RTCIceConnectionState', null,
        'Ice connection state changed ->'], iceConnectionState);
      self._trigger('iceConnectionState', iceConnectionState, targetMid);

      // clear all peer connection health check
      // peer connection is stable. now if there is a waiting check on it
      if (iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED &&
        pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
        log.debug([targetMid, 'PeerConnectionHealth', null,
          'Peer connection with user is stable']);
        self._peerConnectionHealth[targetMid] = true;
        self._stopPeerConnectionHealthCheck(targetMid);
        self._retryCount = 0;
      }

      if (typeof self._ICEConnectionFailures[targetMid] === 'undefined') {
        self._ICEConnectionFailures[targetMid] = 0;
      }

      if (self._ICEConnectionFailures[targetMid] > 2) {
        self._peerIceTrickleDisabled[targetMid] = true;
      }

      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        self._ICEConnectionFailures[targetMid] += 1;

        if (self._enableIceTrickle && !self._peerIceTrickleDisabled[targetMid]) {
          self._trigger('iceConnectionState',
            self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
        }
        // refresh when failed
        if (self._hasMCU)
          self._restartMCU();
        else
          self._restartPeerConnection(targetMid, true, true);
      }

      /**** SJS-53: Revert of commit ******
      // resend if failed
      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        log.debug([targetMid, 'RTCIceConnectionState', null,
          'Ice connection state failed. Re-negotiating connection']);
        self._removePeer(targetMid);
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.WELCOME,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          userInfo: self.getPeerInfo(),
          target: targetMid,
          restartNego: true,
          hsPriority: -1
        });
      } *****/
    });
  };
  // pc.onremovestream = function () {
  //   self._onRemoteStreamRemoved(targetMid);
  // };
  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null,
      'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);

    // clear all peer connection health check
    // peer connection is stable. now if there is a waiting check on it
    if ((pc.iceConnectionState === self.ICE_CONNECTION_STATE.COMPLETED ||
      pc.iceConnectionState === self.ICE_CONNECTION_STATE.CONNECTED) &&
      pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
      log.debug([targetMid, 'PeerConnectionHealth', null,
        'Peer connection with user is stable']);
      self._peerConnectionHealth[targetMid] = true;
      self._stopPeerConnectionHealthCheck(targetMid);
      self._retryCount = 0;
    }
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null,
      'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };
  return pc;
};

/**
 * Refreshes a Peer connection with a connected peer.
 * If there are more than 1 refresh during 5 seconds
 *   or refresh is less than 3 seconds since the last refresh
 *   initiated by the other peer, it will be aborted.
 * @method refreshConnection
 * @param {String} [peerId] The peerId of the peer to refresh the connection.
 * @example
 *   SkylinkDemo.on('iceConnectionState', function (state, peerId)) {
 *     if (iceConnectionState === SkylinkDemo.ICE_CONNECTION_STATE.FAILED) {
 *       // Do a refresh
 *       SkylinkDemo.refreshConnection(peerId);
 *     }
 *   });
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(peerId) {
  var self = this;

  if (self._hasMCU) {
    log.warn([peerId, 'PeerConnection', null, 'Restart functionality for peer\'s connection ' +
      'for MCU is not yet supported']);
    return;
  }

  var refreshSinglePeer = function(peer){
    var fn = function () {
      if (!self._peerConnections[peer]) {
        log.error([peer, null, null, 'There is currently no existing peer connection made ' +
          'with the peer. Unable to restart connection']);
        return;
      }

      var now = Date.now() || function() { return +new Date(); };

      if (now - self.lastRestart < 3000) {
        log.error([peer, null, null, 'Last restart was so tight. Aborting.']);
        return;
      }
      // do a hard reset on variable object
      self._restartPeerConnection(peer, true, false, null, true);
    };
    fn();
  };

  var toRefresh = function() {
    if (!self._hasMCU) {
      if (typeof peerId !== 'string') {
        for (var key in self._peerConnections) {
          if (self._peerConnections.hasOwnProperty(key))
            refreshSinglePeer(key);
        }
      } else
        refreshSinglePeer(peerId);
    } else
      self._restartMCU();
  };

  self._throttle(toRefresh,5000)();
};

/**
 * Equivalent to _restartPeerConnection but with MCU enabled.
 * Makes the peer (self) leave the room and rejoin
 * @method _restartMCU
 */
Skylink.prototype._restartMCU = function() {
  var self = this;
  log.info([self._user.sid, null, null, 'Restarting with MCU enabled']);
  // Save room name
  var roomName = (self._room.id).substring((self._room.id).indexOf("_api_") + 5, (self._room.id).length);
  // Save username if it's been modified (should be used to keep same name after rejoin)
  if ( ((self._userData).length <= 10) || ( ((self._userData).length > 10) && ((self._userData).substring(0, 10) != "name_user_") ) )
    var name = self._userData;
  // Restart with MCU = peer leaves then rejoins room
  self.leaveRoom();
  self._initSelectedRoom(roomName, function() {});
}

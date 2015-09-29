/**
 * The list of Skylink PeerConnection signaling triggered states.
 * Refer to [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCSignalingState).
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
 * The types of Skylink server PeerConnections that serves different functionalities.
 * @type JSON
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU The MCU server PeerConnection.
 *   This server PeerConnection is only available after MCU PeerConnection
 *   is connected.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
};

/**
 * Stores the timestamp of the moment when the last PeerConnections
 *   restarts has happened. Used for the restart PeerConnection functionality.
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
 * Stores the counter of the number of consecutive
 *   PeerConnections restarts retries.
 * @attribute _retryCount
 * @type Number
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._retryCount = 0;

/**
 * Stores the list of PeerConnections.
 * @attribute _peerConnections
 * @param {Object} (#peerId) The RTCPeerConnection object associated to
 *   PeerConnection connection.
 * @type JSON
 * @required
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = {};

/**
 * Stores the list of PeerConnection restart weights received
 *   that would be compared against to indicate if PeerConnection
 *   should initiates a restart from the other connection end should.
 * The one that sends restart later is the one who initiates the restart.
 * @attribute _peerRestartPriorities
 * @param {Number} (#peerId) The PeerConnection connection restart
 *   handshake reconnection weights. The weight is generated with
 *   <code>Date.valueOf()</code>.
 * @type JSON
 * @private
 * @required
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype._peerRestartPriorities = {};

/**
 * Connects to the PeerConnection associated to the ID provided.
 * @method _addPeer
 * @param {String} targetMid The PeerConnection ID to connect to.
 * @param {JSON} peerBrowser The PeerConnection platform agent information.
 * @param {String} peerBrowser.agent The PeerConnection platform browser or agent name.
 * @param {Number} peerBrowser.version The PeerConnection platform browser or agent version.
 * @param {Number} peerBrowser.os The PeerConnection platform name.
 * @param {Boolean} [toOffer=false] The flag that indicates if the PeerConnection connection
 *   should be start connection as an offerer or as an answerer.
 * @param {Boolean} [restartConn=false] The flag that indicates if the PeerConnection
 *   connection is part of restart functionality use-case.
 * @param {Boolean} [receiveOnly=false] The flag that indicates if the PeerConnection
 *   connection would send Stream or not (receive only).
 * @param {Boolean} [isSS=false] The flag that indicates if the PeerConnection
 *   connection Stream object sent is a screensharing stream or not.
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
      if (typeof self._dataChannels[targetMid] !== 'object') {
        log.error([targetMid, 'RTCDataChannel', null, 'Create offer error as unable to create datachannel ' +
          'as datachannels array is undefined'], self._dataChannels[targetMid]);
        return;
      }

      self._dataChannels[targetMid].main =
        self._createDataChannel(targetMid, self.DATA_CHANNEL_TYPE.MESSAGING, null, targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
    self._doOffer(targetMid, peerBrowser);
  }

  // do a peer connection health check
  this._startPeerConnectionHealthCheck(targetMid, toOffer);
};

/**
 * Restarts a PeerConnection connection in a P2P environment.
 * This is usually done for replacing the previous Stream object and restarting
 *   the connection with a new one, or when the ICE connection has issues
 *   streaming video/audio stream in the remote Stream object which requires
 *   a refresh in the ICE connection.
 * @method _restartPeerConnection
 * @param {String} peerId The PeerConnection ID to restart the connection with.
 * @param {Boolean} isSelfInitiatedRestart The flag that indicates if the restart action
 *    was caused by self.
 * @param {Boolean} isConnectionRestart The flag that indicates whether the restarting action
 *   is caused by ICE connection or handshake connection failure. Currently, this feature works the same as
 *   <code>explict</code> parameter.
 * @param {Function} callback The callback fired after the PeerConnection connection has
 *   been succesfully initiated with a restart. Set this value to <code>null</code> if you
 *   do not want to pass in any callbacks.
 * @param {Boolean} [explict=false] The flag that indicates whether the restart functionality
 *   is invoked by the application or by Skylink when the ICE connection fails to establish
 *   a "healthy" connection state. Currently, this feature works the same as
 *   <code>isConnectionRestart</code> parameter.
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

      // NOTE
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
        callback();
      }
    }, 1000);
  }, function () {
    return iceConnectionStateClosed && peerConnectionStateClosed;
  });
};

/**
 * Disconnects the PeerConnection and remove object references
 *   associated to the ID provided
 * @method _removePeer
 * @param {String} peerId The PeerConnection ID to disconnect
 *   the connection with.
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
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
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
 * Creates a PeerConnection connection. This does not start the handshake connection
 *   but creates the PeerConnection connection object ready for connection.
 * @method _createPeerConnection
 * @param {String} targetMid The PeerConnection ID to create the PeerConnection object
 *   with.
 * @param {Boolean} [isScreenSharing=false] The flag that indicates if the PeerConnection
 *   connection Stream object sent is a screensharing stream or not.
 * @return {Object} The PeerConnection connection object associated with
 *   the provided ID.
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
  pc.hasMainChannel = false;

  self._dataChannels[targetMid] = {};

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel) {

      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._dataChannels[targetMid][channelKey] =
        self._createDataChannel(targetMid, channelType, dc, dc.label);

    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };
  pc.onaddstream = function(event) {
    pc.hasStream = true;
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
        if (self._hasMCU) {
          self._restartMCUConnection();
        } else {
          self._restartPeerConnection(targetMid, true, true, null, false);
        }
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
 * Refreshes a PeerConnection connection.
 * This feature can be used to refresh a PeerConnection when the
 *   remote Stream object received does not stream any audio/video stream.
 * If there are more than 1 refresh during 5 seconds
 *   or refresh is less than 3 seconds since the last refresh
 *   initiated by the other peer, it will be aborted.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] The array of targeted PeerConnections to refresh
 *   the connection with.
 * @param {Function} [callback] The callback fired after all targeted PeerConnections has
 *   been initiated with refresh or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Array} callback.error.listOfPeers The list of PeerConnection that the
 *   refresh connection had been initiated with.
 * @param {JSON} callback.error.refreshErrors The list of errors occurred
 *   based on per PeerConnection basis.
 * @param {Object|String} callback.error.refreshErrors.(#peerId) The error that occurred when
 *   refreshing the connection with associated PeerConnection.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {Array} callback.success.listOfPeers The list of PeerConnection that the
 *   refresh connection had been initiated with.
 * @example
 *   SkylinkDemo.on("iceConnectionState", function (state, peerId)) {
 *     if (iceConnectionState === SkylinkDemo.ICE_CONNECTION_STATE.FAILED) {
 *       // Do a refresh
 *       SkylinkDemo.refreshConnection(peerId);
 *     }
 *   });
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(targetPeerId, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (listOfPeers.length === 0) {
    error = 'There is currently no peer connections to restart';
    log.warn([null, 'PeerConnection', null, error]);

    listOfPeerRestartErrors.self = new Error(error);

    if (typeof callback === 'function') {
      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
    return;
  }

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error, success) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers
            });
          }
        }
      }
    };
  };

  var refreshSinglePeer = function(peerId, peerCallback){
    if (!self._peerConnections[peerId]) {
      error = 'There is currently no existing peer connection made ' +
        'with the peer. Unable to restart connection';
      log.error([peerId, null, null, error]);
      listOfPeerRestartErrors[peerId] = new Error(error);
      return;
    }

    var now = Date.now() || function() { return +new Date(); };

    if (now - self.lastRestart < 3000) {
      error = 'Last restart was so tight. Aborting.';
      log.error([peerId, null, null, error]);
      listOfPeerRestartErrors[peerId] = new Error(error);
      return;
    }

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, true, false, peerCallback, true);
  };

  var toRefresh = function() {
    if(!self._hasMCU) {
      var i;

      for (i = 0; i < listOfPeers.length; i++) {
        var peerId = listOfPeers[i];

        if (Object.keys(self._peerConnections).indexOf(peerId) > -1) {
          refreshSinglePeer(peerId, refreshSinglePeerCallback(peerId));
        } else {
          error = 'Peer connection with peer does not exists. Unable to restart';
          log.error([peerId, 'PeerConnection', null, error]);
          listOfPeerRestartErrors[peerId] = new Error(error);
        }

        // there's an error to trigger for
        if (i === listOfPeers.length - 1 && Object.keys(listOfPeerRestartErrors).length > 0) {
          if (typeof callback === 'function') {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          }
        }
      }
    } else {
      self._restartMCUConnection(callback);
    }
  };

  self._throttle(toRefresh,5000)();

};

/**
 * Restarts all PeerConnection connection in a MCU connection environment.
 * This would require the current user to leave the room and restart all
 *   current existing PeerConnection connections.
 * @method _restartMCUConnection
 * @param {Function} [callback] The callback fired after all targeted PeerConnections has
 *   been initiated with refresh or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Array} callback.error.listOfPeers The list of PeerConnection that the
 *   refresh connection had been initiated with.
 * @param {JSON} callback.error.refreshErrors The list of errors occurred
 *   based on per PeerConnection basis.
 * @param {Object|String} callback.error.refreshErrors.(#peerId) The error that occurred when
 *   refreshing the connection with associated PeerConnection.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {Array} callback.success.listOfPeers The list of PeerConnection that the
 *   refresh connection had been initiated with.
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._restartMCUConnection = function(callback) {
  var self = this;
  log.info([self._user.sid, null, null, 'Restarting with MCU enabled']);
  // Save room name
  /*var roomName = (self._room.id).substring((self._room.id)
                    .indexOf('_api_') + 5, (self._room.id).length);*/
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var peerId; // j shint is whinning
  var receiveOnly = false;

  // Save username if it's been modified (should be used to keep same name after rejoin)
  /*if (((self._userData).length <= 10) || ( ((self._userData).length > 10) &&
    ((self._userData).substring(0, 10) !== 'name_user_'))) {
    var name = self._userData;
  }*/

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  for (var i = 0; i < listOfPeers.length; i++) {
    peerId = listOfPeers[i];

    if (!self._peerConnections[peerId]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      log.error([peerId, 'PeerConnection', null, error]);
      listOfPeerRestartErrors[peerId] = new Error(error);
      continue;
    }

    if (peerId === 'MCU') {
      receiveOnly = !!self._peerConnections[peerId].receiveOnly;
    }

    self._peerConnections[peerId].dataChannelClosed = true;
    self._stopPeerConnectionHealthCheck(peerId);

    if (self._peerConnections[peerId].signalingState !== 'closed') {
      self._peerConnections[peerId].close();
    }

    if (self._peerConnections[peerId].hasStream) {
      self._trigger('streamEnded', peerId, self.getPeerInfo(peerId), false);
    }

    if (peerId !== 'MCU') {
      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true);
    }

    delete self._peerConnections[peerId];
  }

  //self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true);

  // Restart with MCU = peer leaves then rejoins room
  var peerJoinedFn = function (peerId, peerInfo, isSelf) {
    if (isSelf) {
      self.off('peerJoined', peerJoinedFn);

      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      var lastRestart = Date.now() || function() { return +new Date(); };

      var weight = (new Date()).valueOf();
      self._peerRestartPriorities.MCU = weight;

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.RESTART,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self.getPeerInfo(),
        target: 'MCU',
        isConnectionRestart: false,
        lastRestart: lastRestart,
        weight: weight,
        receiveOnly: receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
        explicit: true
      });

      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerRestartErrors).length > 0) {
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            listOfPeers: listOfPeers
          });
        }
      }
    }
  };

  self.on('peerJoined', peerJoinedFn);

  self.leaveRoom(false, function (error, success) {
    if (error) {
      if (typeof callback === 'function') {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerRestartErrors[listOfPeers[i]] = error;
        }
        callback({
          refreshErrors: listOfPeerRestartErrors,
          listOfPeers: listOfPeers
        }, null);
      }
    } else {
      self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
      self.joinRoom();
    }
  });
};

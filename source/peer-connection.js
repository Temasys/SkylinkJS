/**
 * The list of peer connection states.
 * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
 *   webrtc/editor/webrtc.html#rtcpeerstate-enum).
 * - This is the RTCSignalingState of the peer.
 * - The states that would occur are:
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {String} STABLE There is no offer/answer exchange in progress.
 *   This is also the initial state in which case the local and remote
 *   descriptions are empty.
 * @param {String} HAVE_LOCAL_OFFER A local description, of type "offer",
 *   has been successfully applied.
 * @param {String} HAVE_REMOTE_OFFER A remote description, of type "offer",
 *   has been successfully applied.
 * @param {String} HAVE_LOCAL_PRANSWER A remote description of type "offer"
 *   has been successfully applied and a local description of type "pranswer"
 *   has been successfully applied.
 * @param {String} HAVE_REMOTE_PRANSWER A local description of type "offer"
 *   has been successfully applied and a remote description of type
 *   "pranswer" has been successfully applied.
 * @param {String} CLOSED The connection is closed.
 * @readOnly
 * @since 0.5.0
 */
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  HAVE_LOCAL_PRANSWER: 'have-local-pranswer',
  HAVE_REMOTE_PRANSWER: 'have-remote-pranswer',
  CLOSED: 'closed'
};

/**
 * Internal array of peer connections.
 * @attribute _peerConnections
 * @type Object
 * @required
 * @private
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = [];

/**
 * We have a peer, this creates a peerconnection object to handle the call.
 * if we are the initiator, we then starts the O/A handshake.
 * @method _addPeer
 * @param {String} targetMid PeerId of the peer we should connect to.
 * @param {JSON} peerBrowser The peer browser information.
 * @param {String} peerBrowser.agent The peer browser agent.
 * @param {Integer} peerBrowser.version The peer browser version.
 * @param {Boolean} toOffer Whether we should start the O/A or wait.
 * @param {Boolean} restartConn Whether connection is restarted.
 * @param {Boolean} receiveOnly Should they only receive?
 * @private
 * @since 0.5.0
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    self._log(self.LOG_LEVEL.ERROR, {
      target: targetMid,
      log: 'Connection to peer has already been made'
    });
    return;
  }
  self._log(self.LOG_LEVEL.TRACE, {
    target: targetMid,
    log: 'Starting the connection to peer. Options provided: '
  }, {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });
  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
  }
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
  // I'm the callee I need to make an offer
  if (toOffer) {
    if (self._enableDataChannel) {
      self._createDataChannel(targetMid);
    }
    self._doOffer(targetMid, peerBrowser);
  }
};

/**
 * Actually clean the peerconnection and trigger an event.
 * Can be called by _byHandler and leaveRoom.
 * @method _removePeer
 * @param {String} peerId PeerId of the peer that has left.
 * @trigger peerLeft
 * @private
 * @since 0.5.2
 */
Skylink.prototype._removePeer = function(peerId) {
  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, this._peerInformations[peerId], false);
  } else {
    this._log(this.LOG_LEVEL.TRACE, {
      target: peerId,
      log: 'MCU has stopped listening and left'
    });
  }
  if (this._peerConnections[peerId]) {
    this._peerConnections[peerId].close();
    delete this._peerConnections[peerId];
  }
  if (this._peerHSPriorities[peerId]) {
    delete this._peerHSPriorities[peerId];
  }
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  this._log(this.LOG_LEVEL.TRACE, {
    target: peerId,
    log: 'Successfully removed peer'
  });
};

/**
 * Creates a peerconnection to communicate with the peer whose ID is 'targetMid'.
 * All the peerconnection callbacks are set up here. This is a quite central piece.
 * @method _createPeerConnection
 * @param {String} targetMid
 * @return {Object} The created peer connection object.
 * @private
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid) {
  var pc, self = this;
  try {
    pc = new window.RTCPeerConnection(
      self._room.connection.peerConfig,
      self._room.connection.peerConstraints);
    self._log(self.LOG_LEVEL.INFO, {
      target: targetMid,
      log: 'Created peer connection'
    });
    self._log(self.LOG_LEVEL.DEBUG, {
      target: targetMid,
      log: 'Peer connection config: '
    }, self._room.connection.peerConfig);
    self._log(self.LOG_LEVEL.DEBUG, {
      target: targetMid,
      log: 'Peer connection constraints: '
    }, self._room.connection.peerConstraints);
  } catch (error) {
    self._log(self.LOG_LEVEL.ERROR, {
      target: targetMid,
      log: 'Failed creating peer connection: '
    }, error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    self._log(self.LOG_LEVEL.DEBUG, {
      target: targetMid,
      interface: 'RTCDataChannel',
      keys: dc.label,
      log: 'Received datachannel -> '
    }, dc);
    if (self._enableDataChannel) {
      self._createDataChannel(targetMid, dc);
    } else {
      self._log(self.LOG_LEVEL.WARN, {
        target: targetMid,
        interface: 'RTCDataChannel',
        keys: dc.label,
        log: 'Not adding datachannel'
      });
    }
  };
  pc.onaddstream = function(event) {
    self._onRemoteStreamAdded(targetMid, event);
  };
  pc.onicecandidate = function(event) {
    self._log(self.LOG_LEVEL.DEBUG, {
      target: targetMid,
      interface: 'RTCIceCandidate',
      log: 'Ice candidate generated -> '
    }, event.candidate);
    self._onIceCandidate(targetMid, event);
  };
  pc.oniceconnectionstatechange = function(evt) {
    checkIceConnectionState(targetMid, pc.iceConnectionState,
      function(iceConnectionState) {
      self._log(self.LOG_LEVEL.DEBUG, {
        target: targetMid,
        interface: 'RTCIceConnectionState',
        log: 'Ice connection state changed -> '
      }, iceConnectionState);
      self._trigger('iceConnectionState', iceConnectionState, targetMid);
      /**** SJS-53: Revert of commit ******
      // resend if failed
      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        self._log(self.LOG_LEVEL.DEBUG, {
          target: targetMid,
          interface: 'RTCIceConnectionState',
          log: 'Ice connection state failed. Re-negotiating connection'
        });
        self._removePeer(targetMid);
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.WELCOME,
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser,
          version: window.webrtcDetectedVersion,
          userInfo: self._user.info,
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
    self._log(self.LOG_LEVEL.DEBUG, {
      target: targetMid,
      interface: 'RTCSignalingState',
      log: 'Peer connection state changed -> '
    }, pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    self._log(self.LOG_LEVEL.TRACE, {
      target: targetMid,
      interface: 'RTCIceGatheringState',
      log: 'Ice gathering state changed -> '
    }, pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };
  return pc;
};
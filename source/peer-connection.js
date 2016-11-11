/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection session description exchanging states.
 * @attribute PEER_CONNECTION_STATE
 * @param {String} STABLE            <small>Value <code>"stable"</code></small>
 *   The value of the state when there is no session description being exchanged between Peer connection.
 * @param {String} HAVE_LOCAL_OFFER  <small>Value <code>"have-local-offer"</code></small>
 *   The value of the state when local <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after remote <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} HAVE_REMOTE_OFFER <small>Value <code>"have-remote-offer"</code></small>
 *   The value of the state when remote <code>"offer"</code> session description is set.
 *   <small>This should transition to <code>STABLE</code> state after local <code>"answer"</code>
 *   session description is set.</small>
 *   <small>See <a href="#event_handshakeProgress"><code>handshakeProgress</code> event</a> for a more
 *   detailed exchanging of session description states.</small>
 * @param {String} CLOSED            <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection is closed and no session description can be exchanged and set.
 * @type JSON
 * @readOnly
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
 * The list of <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code>
 * method</a> retrieval states.
 * @attribute GET_CONNECTION_STATUS_STATE
 * @param {Number} RETRIEVING <small>Value <code>0</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> is retrieving the Peer connection stats.
 * @param {Number} RETRIEVE_SUCCESS <small>Value <code>1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has retrieved the Peer connection stats successfully.
 * @param {Number} RETRIEVE_ERROR <small>Value <code>-1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has failed retrieving the Peer connection stats.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.GET_CONNECTION_STATUS_STATE = {
  RETRIEVING: 0,
  RETRIEVE_SUCCESS: 1,
  RETRIEVE_ERROR: -1
};

/**
 * <blockquote class="info">
 *  As there are more features getting implemented, there will be eventually more different types of
 *  server Peers.
 * </blockquote>
 * The list of available types of server Peer connections.
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU <small>Value <code>"mcu"</code></small>
 *   The value of the server Peer type that is used for MCU connection.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
  //SIP: 'sip'
};

/**
 * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
 *   for the Peer connection health timer.
 * @attribute _retryCounters
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._retryCounters = {};

/**
 * Stores the list of the Peer connections.
 * @attribute _peerConnections
 * @param {Object} <#peerId> The Peer connection.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._peerConnections = {};

/**
 * <blockquote class="info">
 *   For MCU enabled Peer connections, the restart functionality may differ, you may learn more about how to workaround
 *   it <a href="http://support.temasys.com.sg/support/discussions/topics/12000002853">in this article here</a>.
 *   For restarts with Peers connecting from Android, iOS or C++ SDKs, restarts might not work as written in
 *   <a href="http://support.temasys.com.sg/support/discussions/topics/12000005188">in this article here</a>.
 *   Note that this functionality should be used when Peer connection stream freezes during a connection.
 *   For a better user experience for only MCU enabled Peer connections, the functionality is throttled when invoked many
 *   times in less than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Function that refreshes Peer connections to update with the current streaming.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] <blockquote class="info">
 *   Note that this is ignored if MCU is enabled for the App Key provided in
 *   <a href="#method_init"><code>init()</code> method</a>. <code>refreshConnection()</code> will "refresh"
 *   all Peer connections. See the <u>Event Sequence</u> for more information.</blockquote>
 *   The target Peer ID to refresh connection with.
 * - When provided as an Array, it will refresh all connections with all the Peer IDs provided.
 * - When not provided, it will refresh all the currently connected Peers in the Room.
 * @param {Boolean} [iceRestart=false] <blockquote class="info">
 *   Note that this flag will not be honoured for MCU enabled Peer connections as it is not necessary since for MCU
 *   "restart" case is to invoke <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again.</blockquote>
 *   The flag if ICE connections should restart when refreshing Peer connections.
 *   <small>This is used when ICE connection state is <code>FAILED</code> or <code>DISCONNECTED</code>, which state
 *   can be retrieved with the <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerRestart">
 *   <code>peerRestart</code> event</a> triggering <code>isSelfInitiateRestart</code> parameter payload
 *   value as <code>true</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.refreshErrors The list of Peer connection refresh errors.
 * @param {Error|String} callback.error.refreshErrors.#peerId The Peer connection refresh error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   is no Peer connections to refresh with.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a><ol>
 *   <li>If MCU is enabled: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all connected Peer connections.</li>
 *   <li><a href="#event_serverPeerRestart"><code>serverPeerRestart</code> event</a> triggers for
 *   connected MCU server Peer connection.</li></ol></li>
 *   <li>Invokes <a href="#method_joinRoom"><code>joinRoom()</code> method</a> <small><code>refreshConnection()</code>
 *   will retain the User session information except the Peer ID will be a different assigned ID due to restarting the
 *   Room session.</small> <ol><li>If request has errors <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Refresh connections for all targeted Peers. <ol>
 *   <li>If Peer connection exists: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all targeted Peer connections.</li></ol></li>
 *   <li>Else: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   </ol></li></ol></li></ol></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Refreshing a Peer connection
 *   function refreshFrozenVideoStream (peerId) {
 *     skylinkDemo.refreshConnection(peerId, function (error, success) {
 *       if (error) return;
 *       console.log("Refreshing connection for '" + peerId + "'");
 *     });
 *   }
 *
 *   // Example 2: Refreshing a list of Peer connections
 *   function refreshFrozenVideoStreamGroup (peerIdA, peerIdB) {
 *     skylinkDemo.refreshConnection([peerIdA, peerIdB], function (error, success) {
 *       if (error) {
 *         if (error.transferErrors[peerIdA]) {
 *           console.error("Failed refreshing connection for '" + peerIdA + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdA + "'");
 *         }
 *         if (error.transferErrors[peerIdB]) {
 *           console.error("Failed refreshing connection for '" + peerIdB + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdB + "'");
 *         }
 *       } else {
 *         console.log("Refreshing connection for '" + peerIdA + "' and '" + peerIdB + "'");
 *       }
 *     });
 *   }
 *
 *   // Example 3: Refreshing all Peer connections
 *   function refreshFrozenVideoStreamAll () {
 *     skylinkDemo.refreshConnection(function (error, success) {
 *       if (error) {
 *         for (var i = 0; i < error.listOfPeers.length; i++) {
 *           if (error.refreshErrors[error.listOfPeers[i]]) {
 *             console.error("Failed refreshing connection for '" + error.listOfPeers[i] + "'");
 *           } else {
 *             console.info("Refreshing connection for '" + error.listOfPeers[i] + "'");
 *           }
 *         }
 *       } else {
 *         console.log("Refreshing connection for all Peers", success.listOfPeers);
 *       }
 *     });
 *   }
 *
 *   // Example 4: Refresh Peer connection when ICE connection has failed or disconnected
 *   //            and do a ICE connection refresh (only for non-MCU case)
 *   skylinkDemo.on("iceConnectionState", function (state, peerId) {
 *      if (!usesMCUKey && [skylinkDemo.ICE_CONNECTION_STATE.FAILED,
 *        skylinkDemo.ICE_CONNECTION_STATE.DISCONNECTED].indexOf(state) > -1) {
 *        skylinkDemo.refreshConnection(peerId, true);
 *      }
 *   });
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(targetPeerId, iceRestart, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var doIceRestart = false;

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'boolean') {
    doIceRestart = targetPeerId;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (typeof iceRestart === 'boolean') {
    doIceRestart = iceRestart;
  } else if (typeof iceRestart === 'function') {
    callback = iceRestart;
  }

  var emitErrorForPeersFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var listOfPeerErrors = {};

      if (listOfPeers.length === 0) {
        listOfPeerErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
  };

  if (listOfPeers.length === 0) {
    emitErrorForPeersFn('There is currently no peer connections to restart');
    return;
  }

  self._throttle(function (runFn) {
    if (!runFn && self._hasMCU) {
      if (self._throttlingShouldThrowError) {
        emitErrorForPeersFn('Unable to run as throttle interval has not reached (' + self._throttlingTimeout.refreshConnection + 'ms).');
      }
      return;
    }
    self._refreshPeerConnection(listOfPeers, doIceRestart, callback);
  }, 'refreshConnection', self._throttlingTimeout.refreshConnection);

};

/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
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

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, peerCallback);
  };

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

/**
 * Function that retrieves Peer connection bandwidth and ICE connection stats.
 * @method getConnectionStatus
 * @param {String|Array} [targetPeerId] The target Peer ID to retrieve connection stats from.
 * - When provided as an Array, it will retrieve all connection stats from all the Peer IDs provided.
 * - When not provided, it will retrieve all connection stats from the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getConnectionStatusStateChange">
 *   <code>getConnectionStatusStateChange</code> event</a> triggering <code>state</code> parameter payload
 *   value as <code>RETRIEVE_SUCCESS</code> for all Peers targeted for request success.</small>
 *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.retrievalErrors The list of Peer connection stats retrieval errors.
 * @param {Error|String} callback.error.retrievalErrors.#peerId The Peer connection stats retrieval error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to refresh with.</small>
 * @param {JSON} callback.error.connectionStats The list of Peer connection stats.
 *   <small>These are the Peer connection stats that has been managed to be successfully retrieved.</small>
 * @param {JSON} callback.error.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.success.connectionStats The list of Peer connection stats.
 * @param {JSON} callback.success.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves Peer connection stats for all targeted Peers. <ol>
 *   <li>If Peer connection has closed or does not exists: <small>This can be checked with
 *   <a href="#event_peerConnectionState"><code>peerConnectionState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> for Peer.</small> <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVING</code>.</li>
 *   <li>Received response from retrieval. <ol>
 *   <li>If retrieval was successful: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_SUCCESS</code>.</li></ol></li>
 *   <li>Else: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Retrieve a Peer connection stats
 *   function startBWStatsInterval (peerId) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(peerId, function (error, success) {
 *         if (error) return;
 *         var sendVideoBytes  = success.connectionStats[peerId].video.sending.bytes;
 *         var sendAudioBytes  = success.connectionStats[peerId].audio.sending.bytes;
 *         var recvVideoBytes  = success.connectionStats[peerId].video.receiving.bytes;
 *         var recvAudioBytes  = success.connectionStats[peerId].audio.receiving.bytes;
 *         var localCandidate  = success.connectionStats[peerId].selectedCandidate.local;
 *         var remoteCandidate = success.connectionStats[peerId].selectedCandidate.remote;
 *         console.log("Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *         console.log("Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *         console.log("Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *           "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *         console.log("Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *           "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 2: Retrieve a list of Peer connection stats
 *   function printConnStats (peerId, data) {
 *     if (!data.connectionStats[peerId]) return;
 *     var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *     var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *     var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *     var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *     var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *     var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *     console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *     console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *     console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *       "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *     console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *       "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus([peerIdA, peerIdB], function (error, success) {
 *         if (error) {
 *           printConnStats(peerIdA, error.connectionStats);
 *           printConnStats(peerIdB, error.connectionStats);
 *         } else {
 *           printConnStats(peerIdA, success.connectionStats);
 *           printConnStats(peerIdB, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 3: Retrieve all Peer connection stats
 *   function printConnStats (listOfPeers, data) {
 *     listOfPeers.forEach(function (peerId) {
 *       if (!data.connectionStats[peerId]) return;
 *       var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *       var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *       var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *       var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *       var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *       var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *       console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *       console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *       console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *         "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *       console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *         "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *     });
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(function (error, success) {
 *         if (error) {
 *           printConnStats(error.listOfPeers, error.connectionStats);
 *         } else {
 *           printConnStats(success.listOfPeers, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.getConnectionStatus = function (targetPeerId, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerStats = {};
  var listOfPeerErrors = {};

  // getConnectionStatus([])
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  // getConnectionStatus('...')
  } else if (typeof targetPeerId === 'string' && !!targetPeerId) {
    listOfPeers = [targetPeerId];

  // getConnectionStatus(function () {})
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
    targetPeerId = undefined;
  }

  // Check if Peers list is empty, in which we throw an Error if there isn't any
  if (listOfPeers.length === 0) {
    listOfPeerErrors.self = new Error('There is currently no peer connections to retrieve connection status');

    log.error([null, 'RTCStatsReport', null, 'Retrieving request failure ->'], listOfPeerErrors.self);

    if (typeof callback === 'function') {
      callback({
        listOfPeers: listOfPeers,
        retrievalErrors: listOfPeerErrors,
        connectionStats: listOfPeerStats
      }, null);
    }
    return;
  }

  var completedTaskCounter = [];

  var checkCompletedFn = function (peerId) {
    if (completedTaskCounter.indexOf(peerId) === -1) {
      completedTaskCounter.push(peerId);
    }

    if (completedTaskCounter.length === listOfPeers.length) {
      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerErrors).length > 0) {
          callback({
            listOfPeers: listOfPeers,
            retrievalErrors: listOfPeerErrors,
            connectionStats: listOfPeerStats
          }, null);

        } else {
          callback(null, {
            listOfPeers: listOfPeers,
            connectionStats: listOfPeerStats
          });
        }
      }
    }
  };

  var statsFn = function (peerId) {
    log.debug([peerId, 'RTCStatsReport', null, 'Retrieivng connection status']);

    var pc = self._peerConnections[peerId];
    var result = {
      raw: null,
      connection: {
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        remoteDescription: {
          type: pc.remoteDescription ? pc.remoteDescription.type || null : null,
          sdp : pc.remoteDescription ? pc.remoteDescription.sdp || null : null
        },
        localDescription: {
          type: pc.localDescription ? pc.localDescription.type || null : null,
          sdp : pc.localDescription ? pc.localDescription.sdp || null : null
        },
        candidates: clone(self._gatheredCandidates[peerId] || {
          sending: { host: [], srflx: [], relay: [] },
          receiving: { host: [], srflx: [], relay: [] }
        }),
        dataChannels: {}
      },
      audio: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.localDescription, 'audio'),
          inputLevel: null,
          echoReturnLoss: null,
          echoReturnLossEnhancement: null
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
          outputLevel: null
        }
      },
      video: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.localDescription, 'video'),
          frameWidth: null,
          frameHeight: null,
          framesInput: null,
          frames: null,
          frameRateMean: null,
          frameRateStdDev: null,
          framesDropped: null,
          nacks: null,
          plis: null,
          firs: null
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
          frameWidth: null,
          frameHeight: null,
          framesDecoded: null,
          framesOutput: null,
          frames: null,
          frameRateMean: null,
          frameRateStdDev: null,
          nacks: null,
          plis: null,
          firs: null
        }
      },
      selectedCandidate: {
        local: { ipAddress: null, candidateType: null, portNumber: null, transport: null },
        remote: { ipAddress: null, candidateType: null, portNumber: null, transport: null }
      }
    };

    for (var channelProp in self._dataChannels[peerId]) {
      if (self._dataChannels[peerId].hasOwnProperty(channelProp) && self._dataChannels[peerId][channelProp]) {
        result.connection.dataChannels[self._dataChannels[peerId][channelProp].channel.label] = {
          label: self._dataChannels[peerId][channelProp].channel.label,
          readyState: self._dataChannels[peerId][channelProp].channel.readyState,
          channelType: channelProp === 'main' ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA,
          currentTransferId: self._dataChannels[peerId][channelProp].transferId || null
        };
      }
    }

    var loopFn = function (obj, fn) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop]) {
          fn(obj[prop], prop);
        }
      }
    };

    var formatCandidateFn = function (candidateDirType, candidate) {
      result.selectedCandidate[candidateDirType].ipAddress = candidate.ipAddress;
      result.selectedCandidate[candidateDirType].candidateType = candidate.candidateType;
      result.selectedCandidate[candidateDirType].portNumber = typeof candidate.portNumber !== 'number' ?
        parseInt(candidate.portNumber, 10) || null : candidate.portNumber;
      result.selectedCandidate[candidateDirType].transport = candidate.transport;
    };

    pc.getStats(null, function (stats) {
      log.debug([peerId, 'RTCStatsReport', null, 'Retrieval success ->'], stats);

      result.raw = stats;

      if (window.webrtcDetectedBrowser === 'firefox') {
        loopFn(stats, function (obj, prop) {
          var dirType = '';

          // Receiving/Sending RTP packets
          if (prop.indexOf('inbound_rtp') === 0 || prop.indexOf('outbound_rtp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            result[obj.mediaType][dirType].bytes = dirType === 'sending' ? obj.bytesSent : obj.bytesReceived;
            result[obj.mediaType][dirType].packets = dirType === 'sending' ? obj.packetsSent : obj.packetsReceived;
            result[obj.mediaType][dirType].ssrc = obj.ssrc;

            if (dirType === 'receiving') {
              result[obj.mediaType][dirType].packetsLost = obj.packetsLost || 0;
              result[obj.mediaType][dirType].jitter = obj.jitter || 0;
            }

            if (obj.mediaType === 'video') {
              result.video[dirType].frameRateMean = obj.framerateMean || 0;
              result.video[dirType].frameRateStdDev = obj.framerateStdDev || 0;

              if (dirType === 'sending') {
                result.video.sending.framesDropped = obj.framesDropped || 0;
              }
            }

          // Sending RTP packets lost
          } else if (prop.indexOf('inbound_rtcp') === 0 || prop.indexOf('outbound_rtcp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            if (dirType === 'sending') {
              result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
              result[obj.mediaType].sending.packetsLost = obj.packetsLost || 0;
              result[obj.mediaType].sending.jitter = obj.jitter || 0;
            }

          // Candidates
          } else if (obj.nominated && obj.selected) {
            formatCandidateFn('remote', stats[obj.remoteCandidateId]);
            formatCandidateFn('local', stats[obj.localCandidateId]);
          }
        });

      } else if (window.webrtcDetectedBrowser === 'edge') {
        if (pc.getRemoteStreams().length > 0) {
          var tracks = pc.getRemoteStreams()[0].getTracks();

          loopFn(tracks, function (track) {
            loopFn(stats, function (obj, prop) {
              if (obj.type === 'track' && obj.trackIdentifier === track.id) {
                loopFn(stats, function (streamObj) {
                  if (streamObj.associateStatsId === obj.id &&
                    ['outboundrtp', 'inboundrtp'].indexOf(streamObj.type) > -1) {
                    var dirType = streamObj.type === 'outboundrtp' ? 'sending' : 'receiving';

                    result[track.kind][dirType].bytes = dirType === 'sending' ? streamObj.bytesSent : streamObj.bytesReceived;
                    result[track.kind][dirType].packets = dirType === 'sending' ? streamObj.packetsSent : streamObj.packetsReceived;
                    result[track.kind][dirType].packetsLost = streamObj.packetsLost || 0;
                    result[track.kind][dirType].ssrc = parseInt(streamObj.ssrc || '0', 10);

                    if (dirType === 'sending') {
                      result[track.kind].sending.rtt = obj.roundTripTime || 0;
                    }
                  }
                });
              }
            });
          });
        }

      } else {
        var reportedCandidate = false;

        loopFn(stats, function (obj, prop) {
          if (prop.indexOf('ssrc_') === 0) {
            var dirType = prop.indexOf('_recv') > 0 ? 'receiving' : 'sending';

            // Polyfill fix for plugin. Plugin should fix this though
            if (!obj.mediaType) {
              obj.mediaType = obj.hasOwnProperty('audioOutputLevel') ||
                obj.hasOwnProperty('audioInputLevel') ? 'audio' : 'video';
            }

            // Receiving/Sending RTP packets
            result[obj.mediaType][dirType].bytes = parseInt((dirType === 'receiving' ?
              obj.bytesReceived : obj.bytesSent) || '0', 10);
            result[obj.mediaType][dirType].packets = parseInt((dirType === 'receiving' ?
              obj.packetsReceived : obj.packetsSent) || '0', 10);
            result[obj.mediaType][dirType].ssrc = parseInt(obj.ssrc || '0', 10);
            result[obj.mediaType][dirType].packetsLost = parseInt(obj.packetsLost || '0', 10);
            result[obj.mediaType][dirType].jitter = parseInt(obj.googJitterReceived || '0', 10);
            result[obj.mediaType][dirType].jitterBufferMs = parseInt(obj.googJitterBufferMs || '0', 10);

            if (result[obj.mediaType][dirType].codec) {
              result[obj.mediaType][dirType].codec.implementation = obj.codecImplementationName || null;
              if (obj.googCodecName) {
                result[obj.mediaType][dirType].codec.name = obj.googCodecName;
              }
            }

            if (dirType === 'sending') {
              // NOTE: Chrome sending audio does have it but plugin has..
              result[obj.mediaType].sending.rtt = parseInt(obj.googRtt || '0', 10);
            }

            if (obj.mediaType === 'video') {
              result.video[dirType].frameWidth = parseInt((dirType === 'receiving' ?
                obj.googFrameWidthReceived : obj.googFrameWidthSent) || '0', 10);
              result.video[dirType].frameHeight = parseInt((dirType === 'receiving' ?
                obj.googFrameHeightReceived : obj.googFrameHeightSent) || '0', 10);
              result.video[dirType].frames = parseInt((dirType === 'receiving' ?
                obj.googFrameRateReceived : obj.googFrameRateSent) || '0', 10);
              result.video[dirType].nacks = parseInt((dirType === 'receiving' ?
                obj.googNacksReceived : obj.googNacksSent) || '0', 10);
              result.video[dirType].plis = parseInt((dirType === 'receiving' ?
                obj.googPlisReceived : obj.googPlisSent) || '0', 10);
              result.video[dirType].firs = parseInt((dirType === 'receiving' ?
                obj.googFirsReceived : obj.googFirsSent) || '0', 10);

              if (dirType === 'receiving') {
                result.video[dirType].framesDecoded = parseInt(obj.googFrameRateDecoded || '0', 10);
                result.video[dirType].framesOutput = parseInt(obj.googFrameRateOutput || '0', 10);
              } else {
                result.video[dirType].framesInput = parseInt(obj.googFrameRateInput || '0', 10);
              }
            } else {
              if (dirType === 'receiving') {
                result.audio[dirType].outputLevel = parseFloat(obj.audioOutputLevel || '0', 10);
              } else {
                result.audio[dirType].inputLevel = parseFloat(obj.audioInputLevel || '0', 10);
                result.audio[dirType].echoReturnLoss = parseFloat(obj.googEchoCancellationReturnLoss || '0', 10);
                result.audio[dirType].echoReturnLossEnhancement = parseFloat(obj.googEchoCancellationReturnLossEnhancement || '0', 10);
              }
            }

            if (!reportedCandidate) {
              loopFn(stats, function (canObj, canProp) {
                if (!reportedCandidate && canProp.indexOf('Conn-') === 0) {
                  if (obj.transportId === canObj.googChannelId) {
                    formatCandidateFn('local', stats[canObj.localCandidateId]);
                    formatCandidateFn('remote', stats[canObj.remoteCandidateId]);
                    reportedCandidate = true;
                  }
                }
              });
            }
          }
        });
      }

      listOfPeerStats[peerId] = result;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
        peerId, listOfPeerStats[peerId], null);

      checkCompletedFn(peerId);

    }, function (error) {
      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);

      listOfPeerErrors[peerId] = error;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, error);

      checkCompletedFn(peerId);
    });
  };

  // Loop through all the list of Peers selected to retrieve connection status
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVING,
      peerId, null, null);

    // Check if the Peer connection exists first
    if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
      statsFn(peerId);

    } else {
      listOfPeerErrors[peerId] = new Error('The peer connection object does not exists');

      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], listOfPeerErrors[peerId]);

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, listOfPeerErrors[peerId]);

      checkCompletedFn(peerId);
    }
  }
};

/**
 * Function that starts the Peer connection session.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _addPeer
 * @private
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

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Failed creating the connection to peer']);
    return;
  }

  self._peerConnections[targetMid].receiveOnly = !!receiveOnly;
  self._peerConnections[targetMid].hasScreen = !!isSS;
  if (!receiveOnly) {
    self._addLocalMediaStreams(targetMid);
  }
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];

  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._SUPPORTED_WEB_AGENTS.indexOf(agent.name) === -1) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    if (self._peerConnections[peerId] && !self._peerConnections[peerId].receiveOnly) {
      self._addLocalMediaStreams(peerId);
    }

    log.log([peerId, null, null, 'Sending restart message to signaling server']);

    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self._peerConnections[peerId] && self._peerConnections[peerId].receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true,
      sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      // Deprecated but comply to protocol
      lastRestart: (new Date()).getTime(),
      explicit: true,
      isConnectionRestart: false
    });

    self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
      callback(null);
    }

  } else {
    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (pc.signalingState === self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
      // Checks if the local description is defined first
      var hasLocalDescription = pc.localDescription && pc.localDescription.sdp;
      // By then it should have at least the local description..
      if (hasLocalDescription) {
        self._sendChannelMessage({
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
          mid: self._user.sid,
          target: peerId,
          rid: self._room.id,
          restart: true
        });
      } else {
        var noLocalDescriptionError = 'Failed re-sending localDescription as there is ' +
          'no localDescription set to connection. There could be a handshaking step error';
        log.error([peerId, 'RTCPeerConnection', null, noLocalDescriptionError], {
            localDescription: pc.localDescription,
            remoteDescription: pc.remoteDescription
        });
        if (typeof callback === 'function') {
          log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
          callback(new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(new Error(unableToRestartError));
      }
    }
  }
};

/**
 * Function that ends the Peer connection session.
 * @method _removePeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId]) {
    log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: {},
    mediaStatus: {},
    agent: {},
    room: clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (typeof this._peerConnections[peerId] !== 'undefined') {
    // new flag to check if datachannels are all closed
    this._peerConnections[peerId].dataChannelClosed = true;

    if (this._peerConnections[peerId].signalingState !== 'closed') {
      this._peerConnections[peerId].close();
    }

    if (peerId !== 'MCU' && this._peerConnections[peerId].hasStream) {
      this._trigger('streamEnded', peerId, this.getPeerInfo(peerId), false);
    }

    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (typeof this._peerInformations[peerId] !== 'undefined') {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (typeof this._peerMessagesStamps[peerId] !== 'undefined') {
    delete this._peerMessagesStamps[peerId];
  }

  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }

  log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
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
  pc.firefoxStreamId = '';
  pc.processingLocalSDP = false;
  pc.processingRemoteSDP = false;
  pc.gathered = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel && self._peerInformations[targetMid] &&
      self._peerInformations[targetMid].config.enableDataChannel) {
      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._createDataChannel(targetMid, dc);

    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };
  pc.onaddstream = function(event) {
    var stream = event.stream || event;

    if (targetMid === 'MCU') {
      log.debug([targetMid, 'MediaStream', stream.id, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    }

    pc.hasStream = true;

    var agent = (self.getPeerInfo(targetMid) || {}).agent || {};
    var timeout = 0;

    // NOTE: Add timeouts to the firefox stream received because it seems to have some sort of black stream rendering at first
    // This may not be advisable but that it seems to work after 1500s. (tried with ICE established but it does not work and getStats)
    if (agent.name === 'firefox' && window.webrtcDetectedBrowser !== 'firefox') {
      timeout = 1500;
    }
    setTimeout(function () {
      self._onRemoteStreamAdded(targetMid, stream, !!pc.hasScreen);
    }, timeout);
  };
  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };
  pc.oniceconnectionstatechange = function(evt) {
    checkIceConnectionState(targetMid, pc.iceConnectionState, function(iceConnectionState) {
      log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

      self._trigger('iceConnectionState', iceConnectionState, targetMid);

      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._enableIceTrickle) {
        self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
      }
    });
  };
  // pc.onremovestream = function () {
  //   self._onRemoteStreamRemoved(targetMid);
  // };
  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
          }
        }
      }
    };
  }

  return pc;
};

/**
 * Function that handles the <code>_restartPeerConnection</code> scenario
 *   for MCU enabled Peer connections.
 * This is implemented currently by making the user leave and join the Room again.
 * The Peer ID will not stay the same though.
 * @method _restartMCUConnection
 * @private
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
  // for MCU case, these dont matter at all
  var weight = (new Date()).valueOf();

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

    if (peerId !== 'MCU') {
      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, false);

      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.RESTART,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self._getUserInfo(),
        target: peerId, //'MCU',
        weight: self._peerPriorityWeight,
        receiveOnly: receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        enableIceRestart: self._enableIceRestart,
        doIceRestart: false,
        sessionType: !!self._streams.screenshare ? 'screensharing' : 'stream',
        temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        // Deprecated but comply to protocol
        lastRestart: (new Date()).getTime(),
        explicit: true,
        isConnectionRestart: false
      });
    }
  }

  // Restart with MCU = peer leaves then rejoins room
  var peerJoinedFn = function (peerId, peerInfo, isSelf) {
    log.log([null, 'PeerConnection', null, 'Invoked all peers to restart with MCU. Firing callback']);

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
  };

  self.once('peerJoined', peerJoinedFn, function (peerId, peerInfo, isSelf) {
    return isSelf;
  });

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
      //self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
      self.joinRoom(self._selectedRoom);
    }
  });
};

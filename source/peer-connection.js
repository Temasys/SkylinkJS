/**
 * <blockquote class="info">
 *   Note that Edge browser does not support renegotiation.
 *   For MCU enabled Peer connections with <code>options.mcuUseRenegoRestart</code> set to <code>false</code>
 *   in the <a href="#method_init"><code>init()</code> method</a>, the restart functionality may differ, you
 *   may learn more about how to workaround it
 *   <a href="http://support.temasys.io/support/discussions/topics/12000002853">in this article here</a>.
 *   For restarts with Peers connecting from Android, iOS or C++ SDKs, restarts might not work as written in
 *   <a href="http://support.temasys.io/support/discussions/topics/12000005188">in this article here</a>.
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
 *   Note that this flag will not be honoured for MCU enabled Peer connections where
 *   <code>options.mcuUseRenegoRestart</code> flag is set to <code>false</code> as it is not necessary since for MCU
 *   "restart" case is to invoke <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again, or that it is
 *   not supported by the MCU.</blockquote>
 *   The flag if ICE connections should restart when refreshing Peer connections.
 *   <small>This is used when ICE connection state is <code>FAILED</code> or <code>DISCONNECTED</code>, which state
 *   can be retrieved with the <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a>.</small>
 * @param {JSON} [options] <blockquote class="info">
 *   Note that for MCU connections, the <code>bandwidth</code> or <code>googleXBandwidth</code>
 *   settings will override for all Peers or the current Room connection session settings.</blockquote>
 *   The custom Peer configuration settings.
 * @param {JSON} [options.bandwidth] The configuration to set the maximum streaming bandwidth to send to Peers.
 *   <small>Object signature follows <a href="#method_joinRoom"><code>joinRoom()</code> method</a>
 *   <code>options.bandwidth</code> settings.</small>
 * @param {JSON} [options.googleXBandwidth] The configuration to set the experimental google
 *   video streaming bandwidth sent to Peers.
 *   <small>Object signature follows <a href="#method_joinRoom"><code>joinRoom()</code> method</a>
 *   <code>options.googleXBandwidth</code> settings.</small>
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
 * @param {JSON} callback.error.refreshSettings The list of Peer connection refresh settings.
 * @param {JSON} callback.error.refreshSettings.#peerId The Peer connection refresh settings associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 * @param {Boolean} callback.error.refreshSettings.#peerId.iceRestart The flag if ICE restart is enabled for
 *   this Peer connection refresh session.
 * @param {JSON} callback.error.refreshSettings.#peerId.customSettings The Peer connection custom settings.
 *   <small>Object signature follows <a href="#method_getPeersCustomSettings"><code>getPeersCustomSettings</code>
 *   method</a> returned per <code>#peerId</code> object.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.success.refreshSettings The list of Peer connection refresh settings.
 * @param {JSON} callback.success.refreshSettings.#peerId The Peer connection refresh settings associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 * @param {Boolean} callback.success.refreshSettings.#peerId.iceRestart The flag if ICE restart is enabled for
 *   this Peer connection refresh session.
 * @param {JSON} callback.success.refreshSettings.#peerId.customSettings The Peer connection custom settings.
 *   <small>Object signature follows <a href="#method_getPeersCustomSettings"><code>getPeersCustomSettings</code>
 *   method</a> returned per <code>#peerId</code> object.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a><ol>
 *   <li>If MCU is enabled: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all connected Peer connections.</li>
 *   <li><a href="#event_serverPeerRestart"><code>serverPeerRestart</code> event</a> triggers for
 *   connected MCU server Peer connection.</li></ol></li>
 *   <li>If <code>options.mcuUseRenegoRestart</code> value is <code>false</code> set in the
 *   <a href="#method_init"><code>init()</code> method</a>: <ol><li>
 *   Invokes <a href="#method_joinRoom"><code>joinRoom()</code> method</a> <small><code>refreshConnection()</code>
 *   will retain the User session information except the Peer ID will be a different assigned ID due to restarting the
 *   Room session.</small> <ol><li>If request has errors <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li></ol></li>
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
Skylink.prototype.refreshConnection = function(targetPeerId, iceRestart, options, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var doIceRestart = false;
  var bwOptions = {};

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'boolean') {
    doIceRestart = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'object') {
    bwOptions = targetPeerId;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (typeof iceRestart === 'boolean') {
    doIceRestart = iceRestart;
  } else if (iceRestart && typeof iceRestart === 'object') {
    bwOptions = iceRestart;
  } else if (typeof iceRestart === 'function') {
    callback = iceRestart;
  }

  if (options && typeof options === 'object') {
    bwOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
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

  if (listOfPeers.length === 0 && !(self._hasMCU && !self._initOptions.mcuUseRenegoRestart)) {
    emitErrorForPeersFn('There is currently no peer connections to restart');
    return;
  }

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    emitErrorForPeersFn('Edge browser currently does not support renegotiation.');
    return;
  }

  self._throttle(function (runFn) {
    if (!runFn && self._hasMCU && !self._initOptions.mcuUseRenegoRestart) {
      if (self._initOptions.throttlingShouldThrowError) {
        emitErrorForPeersFn('Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.refreshConnection + 'ms).');
      }
      return;
    }
    self._refreshPeerConnection(listOfPeers, doIceRestart, bwOptions, callback);
  }, 'refreshConnection', self._initOptions.throttleIntervals.refreshConnection);

};

/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, bwOptions, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};
  var listOfPeersSettings = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        } else {
          listOfPeersSettings[peerId] = {
            iceRestart: !self._hasMCU && self._peerInformations[peerId] && self._peerInformations[peerId].config &&
              self._peerInformations[peerId].config.enableIceRestart && self._enableIceRestart && doIceRestart,
            customSettings: self.getPeersCustomSettings()[peerId] || {}
          };
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers,
              refreshSettings: listOfPeersSettings
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers,
              refreshSettings: listOfPeersSettings
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
      peerCallback(error);
      return;
    }

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, bwOptions, peerCallback);
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
        refreshSinglePeerCallback(peerId)(error);
      }
    }
  } else {
    self._restartMCUConnection(callback, doIceRestart, bwOptions);
  }
};

/**
 * <blockquote class="info">
 * Note that this is not well supported in the Edge browser.
 * </blockquote>
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

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    log.warn('Edge browser does not have well support for stats.');
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
    var retrieveFn = function (firstRetrieval, nextCb) {
      return function (err, result) {
        if (err) {
          log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);
          listOfPeerErrors[peerId] = error;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
            peerId, null, error);
          checkCompletedFn(peerId);
          if (firstRetrieval) {
            delete self._peerStats[peerId];
          }
          return;
        }

        if (firstRetrieval) {
          nextCb();
        } else {
          listOfPeerStats[peerId] = result;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
            peerId, listOfPeerStats[peerId], null);
          checkCompletedFn(peerId);
        }
      };
    };

    if (!self._peerStats[peerId]) {
      self._peerStats[peerId] = {};

      log.debug([peerId, 'RTCStatsReport', null, 'Retrieving first report to tabulate results']);

      self._retrieveStats(peerId, retrieveFn(true, function () {
        self._retrieveStats(peerId, retrieveFn());
      }), true);
      return;
    }

    self._retrieveStats(peerId, retrieveFn());
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
 * Function that retrieves Peer connection stats.
 * @method _retrieveStats
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._retrieveStats = function (peerId, callback, beSilentOnLogs, isAutoBwStats) {
  var self = this;
  var pc = self._peerConnections[peerId];
  var output = {
    raw: {},
    connection: {},
    audio: {
      sending: {},
      receiving: {} },
    video: {
      sending: {},
      receiving: {}
    },
    selectedCandidate: {
      local: {},
      remote: {},
      consentResponses: {},
      consentRequests: {},
      responses: {},
      requests: {}
    },
    certificate: {}
  };

  // Peer stats has to be retrieved once first before the second time.
  if (!self._peerStats[peerId] && !isAutoBwStats) {
    return callback(new Error('No stats initiated yet.'));
  } else if (!pc) {
    return callback(new Error('Peer connection is not initialised'));
  }

  // Warn due to Edge not giving complete stats and returning as 0 sometimes..
  if (AdapterJS.webrtcDetectedBrowser === 'edge' || AdapterJS.webrtcDetectedType === 'AppleWebKit') {
    log.warn('Current connection stats may not be complete as it is in beta');
  }

  // Parse RTCPeerConnection details
  output.connection.iceConnectionState = pc.iceConnectionState;
  output.connection.iceGatheringState = pc.iceGatheringState;
  output.connection.signalingState = pc.signalingState;
  output.connection.remoteDescription = {
    type: (pc.remoteDescription && pc.remoteDescription.type) || '',
    sdp : (pc.remoteDescription && pc.remoteDescription.sdp) || ''
  };
  output.connection.localDescription = {
    type: (pc.localDescription && pc.localDescription.type) || '',
    sdp : (pc.localDescription && pc.localDescription.sdp) || ''
  };
  output.connection.candidates = {
    sending: self._getSDPICECandidates(peerId, pc.localDescription, beSilentOnLogs),
    receiving: self._getSDPICECandidates(peerId, pc.remoteDescription, beSilentOnLogs)
  };
  output.connection.dataChannels = {};
  output.connection.constraints = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].constraints : null;
  output.connection.optional = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].optional : null;
  output.connection.sdpConstraints = self._peerConnStatus[peerId] ? self._peerConnStatus[peerId].sdpConstraints : null;

  // Parse workaround possible codecs details
  output.audio.sending.codec = self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio', beSilentOnLogs);
  output.video.sending.codec = self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video', beSilentOnLogs);
  output.audio.receiving.codec = self._getSDPSelectedCodec(peerId, pc.localDescription, 'audio', beSilentOnLogs);
  output.video.receiving.codec = self._getSDPSelectedCodec(peerId, pc.localDescription, 'video', beSilentOnLogs);

  // Parse workaround possible certificate details
  output.certificate.local = self._getSDPFingerprint(peerId, pc.localDescription, beSilentOnLogs);
  output.certificate.remote = self._getSDPFingerprint(peerId, pc.remoteDescription, beSilentOnLogs);

  // Parse workaround possible SSRC details to prevent receiving 0 from Safari 11
  var inboundSSRCs = self._getSDPMediaSSRC(peerId, pc.remoteDescription, beSilentOnLogs);
  output.audio.receiving.ssrc = inboundSSRCs.audio;
  output.video.receiving.ssrc = inboundSSRCs.video;
  var outboundSSRCs = self._getSDPMediaSSRC(peerId, pc.localDescription, beSilentOnLogs);
  output.audio.sending.ssrc = outboundSSRCs.audio;
  output.video.sending.ssrc = outboundSSRCs.video;

  // Parse RTCDataChannel details (not stats)
  Object.keys(self._dataChannels[peerId] || {}).forEach(function (prop) {
    var channel = self._dataChannels[peerId][prop];
    output.connection.dataChannels[channel.channel.label] = {
      label: channel.channel.label,
      readyState: channel.channel.readyState,
      channelType: self.DATA_CHANNEL_TYPE[prop === 'main' ? 'MESSAGING' : 'DATA'],
      currentTransferId: channel.transferId || null,
      currentStreamId: channel.streamId || null
    };
  });

  // Format DTLS certificates and ciphers used
  var certificateFn = function (item, prop) {
    // Safari 11
    if (prop.indexOf('RTCCertificate_') === 0) {
      // Map the certificate data basing off the fingerprint algorithm
      if (item.fingerprint === output.certificate.local.fingerprint) {
        output.certificate.local.derBase64 = item.base64Certificate;
        output.certificate.local.fingerprintAlgorithm = item.fingerprintAlgorithm;

      } else if (item.fingerprint  === output.certificate.remote.fingerprint) {
        output.certificate.remote.derBase64 = item.base64Certificate;
        output.certificate.remote.fingerprintAlgorithm = item.fingerprintAlgorithm;
      }

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.transportId) {
      var pairItem = output.raw[item.transportId] || {};
      output.certificate.srtpCipher = pairItem.srtpCipher;
      output.certificate.dtlsCipher = pairItem.dtlsCipher;

      var localCertItem = output.raw[pairItem.localCertificateId || ''] || {};
      output.certificate.local.fingerprint = localCertItem.googFingerprint;
      output.certificate.local.fingerprintAlgorithm = localCertItem.googFingerprintAlgorithm;
      output.certificate.local.derBase64 = localCertItem.googDerBase64;

      var remoteCertItem = output.raw[pairItem.remoteCertificateId || ''] || {};
      output.certificate.remote.fingerprint = remoteCertItem.googFingerprint;
      output.certificate.remote.fingerprintAlgorithm = remoteCertItem.googFingerprintAlgorithm;
      output.certificate.remote.derBase64 = remoteCertItem.googDerBase64;
    }
  };

  // Format selected candidate pair
  var candidatePairFn = function (item, prop) {
    // Safari 11
    if (prop.indexOf('RTCIceCandidatePair_') === 0) {
      // Use the nominated pair, else use the one that has succeeded but not yet nominated.
      // This is to handle the case where none of the ICE candidates appear nominated.
      if (item.state !== 'succeeded' || (output.selectedCandidate.nominated ? true :
        (item.prioirty < (output.selectedCandidate.priority || 0)))) {
        return;
      }

      var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

      // Map the selected ICE candidate pair based on computed prioirty
      var sending = (pc.localDescription && pc.localDescription.sdp && pc.localDescription.sdp.match(/a=candidate:.*\r\n/gi)) || [];
      var receiving = (pc.remoteDescription && pc.remoteDescription && pc.remoteDescription.sdp.match(/a=candidate:.*\r\n/gi)) || [];

      // Compute the priority
      var computePrioirtyFn = function (controller, controlled) {
        return (Math.pow(2, 32) * Math.min(controller, controlled)) + (2 * Math.max(controller, controlled)) + (controller > controlled ? 1 : 0);
      };

      // Format the candidate type
      var computeCanTypeFn = function (type) {
        if (type === 'relay') {
          return 'relayed';
        } else if (type === 'host') {
          return 'local';
        } else if (type === 'srflx') {
          return 'serverreflexive';
        }
        return type;
      };

      for (var s = 0; s < sending.length; s++) {
        var sendCanParts = sending[s].split(' ');

        for (var r = 0; r < receiving.length; r++) {
          var recvCanParts = receiving[r].split(' ');
          var priority = null;

          if (item.writable) {
            // Compute the priority since we are the controller
            priority = computePrioirtyFn(parseInt(sendCanParts[3], 10), parseInt(recvCanParts[3], 10));
          } else {
            // Compute the priority since we are the controlled
            priority = computePrioirtyFn(parseInt(recvCanParts[3], 10), parseInt(sendCanParts[3], 10));
          }

          if (priority === item.priority) {
            output.selectedCandidate.local.ipAddress = sendCanParts[4];
            output.selectedCandidate.local.candidateType = sendCanParts[7];
            output.selectedCandidate.local.portNumber = parseInt(sendCanParts[5], 10);
            output.selectedCandidate.local.transport = sendCanParts[2];
            output.selectedCandidate.local.priority = parseInt(sendCanParts[3], 10);
            output.selectedCandidate.local.candidateType = computeCanTypeFn(sendCanParts[7]);

            output.selectedCandidate.remote.ipAddress = recvCanParts[4];
            output.selectedCandidate.remote.candidateType = recvCanParts[7];
            output.selectedCandidate.remote.portNumber = parseInt(recvCanParts[5], 10);
            output.selectedCandidate.remote.transport = recvCanParts[2];
            output.selectedCandidate.remote.priority = parseInt(recvCanParts[3], 10);
            output.selectedCandidate.remote.candidateType = computeCanTypeFn(recvCanParts[7]);
            break;
          }
        }
      }

      output.selectedCandidate.writable = item.writable;
      output.selectedCandidate.readable = item.readable;
      output.selectedCandidate.priority = item.priority;
      output.selectedCandidate.nominated = item.nominated;

      var rtt = parseInt(item.rtt || '0', 10);
      output.selectedCandidate.totalRtt = rtt;
      output.selectedCandidate.rtt = self._parseConnectionStats(prevStats, item, 'rtt');

      var consentResponsesReceived = parseInt(item.consentResponsesReceived || '0', 10);
      output.selectedCandidate.consentResponses.totalReceived = consentResponsesReceived;
      output.selectedCandidate.consentResponses.received = self._parseConnectionStats(prevStats, item, 'consentResponsesReceived');

      var consentResponsesSent = parseInt(item.consentResponsesSent || '0', 10);
      output.selectedCandidate.consentResponses.totalSent = consentResponsesSent;
      output.selectedCandidate.consentResponses.sent = self._parseConnectionStats(prevStats, item, 'consentResponsesSent');

      var responsesReceived = parseInt(item.responsesReceived || '0', 10);
      output.selectedCandidate.responses.totalReceived = responsesReceived;
      output.selectedCandidate.responses.received = self._parseConnectionStats(prevStats, item, 'responsesReceived');

      var responsesSent = parseInt(item.responsesSent || '0', 10);
      output.selectedCandidate.responses.totalSent = responsesSent;
      output.selectedCandidate.responses.sent = self._parseConnectionStats(prevStats, item, 'responsesSent');

    // Chrome / Plugin
    } else if (item.type === 'googCandidatePair') {
      var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

      output.selectedCandidate.writable = item.googWritable === 'true';
      output.selectedCandidate.readable = item.googReadable === 'true';

      var rtt = parseInt(item.googRtt || '0', 10);
      output.selectedCandidate.totalRtt = rtt;
      output.selectedCandidate.rtt = self._parseConnectionStats(prevStats, item, 'rtt');

      if (item.consentResponsesReceived) {
        var consentResponsesReceived = parseInt(item.consentResponsesReceived || '0', 10);
        output.selectedCandidate.consentResponses.totalReceived = consentResponsesReceived;
        output.selectedCandidate.consentResponses.received = self._parseConnectionStats(prevStats, item, 'consentResponsesReceived');
      }

      if (item.consentResponsesSent) {
        var consentResponsesSent = parseInt(item.consentResponsesSent || '0', 10);
        output.selectedCandidate.consentResponses.totalSent = consentResponsesSent;
        output.selectedCandidate.consentResponses.sent = self._parseConnectionStats(prevStats, item, 'consentResponsesSent');
      }

      if (item.responsesReceived) {
        var responsesReceived = parseInt(item.responsesReceived || '0', 10);
        output.selectedCandidate.responses.totalReceived = responsesReceived;
        output.selectedCandidate.responses.received = self._parseConnectionStats(prevStats, item, 'responsesReceived');
      }

      if (item.responsesSent) {
        var responsesSent = parseInt(item.responsesSent || '0', 10);
        output.selectedCandidate.responses.totalSent = responsesSent;
        output.selectedCandidate.responses.sent = self._parseConnectionStats(prevStats, item, 'responsesSent');
      }

      var localCanItem = output.raw[item.localCandidateId || ''] || {};
      output.selectedCandidate.local.ipAddress = localCanItem.ipAddress;
      output.selectedCandidate.local.portNumber = parseInt(localCanItem.portNumber, 10);
      output.selectedCandidate.local.priority = parseInt(localCanItem.priority, 10);
      output.selectedCandidate.local.networkType = localCanItem.networkType;
      output.selectedCandidate.local.transport = localCanItem.transport;
      output.selectedCandidate.local.candidateType = localCanItem.candidateType;

      var remoteCanItem = output.raw[item.remoteCandidateId || ''] || {};
      output.selectedCandidate.remote.ipAddress = remoteCanItem.ipAddress;
      output.selectedCandidate.remote.portNumber = parseInt(remoteCanItem.portNumber, 10);
      output.selectedCandidate.remote.priority = parseInt(remoteCanItem.priority, 10);
      output.selectedCandidate.remote.transport = remoteCanItem.transport;
      output.selectedCandidate.remote.candidateType = remoteCanItem.candidateType;

    // Firefox
    } else if (item.type === 'candidatepair' && item.state === 'succeeded' && item.nominated) {
      output.selectedCandidate.writable = item.writable;
      output.selectedCandidate.readable = item.readable;

      var localCanItem = output.raw[item.localCandidateId || ''];
      output.selectedCandidate.local.ipAddress = localCanItem.ipAddress;
      output.selectedCandidate.local.portNumber = localCanItem.portNumber;
      output.selectedCandidate.local.transport = localCanItem.transport;
      output.selectedCandidate.local.candidateType = localCanItem.candidateType;
      output.selectedCandidate.local.turnMediaTransport = localCanItem.mozLocalTransport;

      var remoteCanItem = output.raw[item.remoteCandidateId || ''];
      output.selectedCandidate.remote.ipAddress = remoteCanItem.ipAddress;
      output.selectedCandidate.remote.portNumber = remoteCanItem.portNumber;
      output.selectedCandidate.remote.transport = remoteCanItem.transport;
      output.selectedCandidate.remote.candidateType = remoteCanItem.candidateType;
    }
  };

  // Format selected codecs
  var codecsFn = function (item, prop) {
    // Chrome / Plugin
    if (prop.indexOf('ssrc_') === 0) {
      var direction = prop.indexOf('_send') > 0 ? 'sending' : 'receiving';

      item.codecImplementationName = item.codecImplementationName === 'unknown' ? null : item.codecImplementationName;
      output[item.mediaType][direction].codec.implementation = item.codecImplementationName || null;

      item.googCodecName = item.googCodecName === 'unknown' ? null : item.googCodecName;
      output[item.mediaType][direction].codec.name = item.googCodecName || output[item.mediaType][direction].codec.name;
    }
  };

  // Format audio stats
  var audioStatsFn = function (item, prop) {
    var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

    // Safari 11 (Inbound stats)
    if (prop.indexOf('RTCInboundRTPAudioStream') === 0) {
      output.audio.receiving.fractionLost = item.fractionLost;
      output.audio.receiving.jitter = item.jitter;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsDiscarded = item.packetsDiscarded;
      output.audio.receiving.packetsDiscarded = self._parseConnectionStats(prevStats, item, 'packetsDiscarded');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      if (typeof pc.getReceivers !== 'function') {
        return;
      }

    // Safari 11 (Inbound track stats)
    } else if (prop.indexOf('RTCMediaStreamTrack_remote_audio_') === 0) {
      output.audio.receiving.audioOutputLevel = item.audioLevel;

    // Safari 11 (Outbound stats)
    } else if (prop.indexOf('RTCOutboundRTPAudioStream') === 0) {
      output.audio.sending.targetBitrate = item.targetBitrate || 0;

      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'inboundrtp' && item.mediaType === 'audio' && item.isRemote) {
      output.audio.receiving.fractionLost = item.fractionLost;
      output.audio.receiving.jitter = item.jitter;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Edge (WebRTC not ORTC shim) (Outbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'outboundrtp' && item.mediaType === 'audio' && !item.isRemote) {
      output.audio.sending.targetBitrate = item.targetBitrate;
      output.audio.sending.rtt = item.roundTripTime;

      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.audio.sending.audioInputLevel = trackItem.audioLevel;
      output.audio.sending.echoReturnLoss = trackItem.echoReturnLoss;
      output.audio.sending.echoReturnLossEnhancement = trackItem.echoReturnLossEnhancement;

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'audio') {
      // Chrome / Plugin (Inbound stats)
      if (prop.indexOf('_recv') > 0) {
        output.audio.receiving.jitter = parseInt(item.googJitterReceived || '0', 10);
        output.audio.receiving.jitterBufferMs = parseInt(item.googJitterBufferMs || '0', 10);
        output.audio.receiving.currentDelayMs = parseInt(item.googCurrentDelayMs || '0', 10);
        //output.audio.receiving.audioOutputLevel = parseInt(item.audioOutputLevel || '0', 10);

        var bytesReceived = parseInt(item.bytesReceived || '0', 10);
        output.audio.receiving.totalBytes = bytesReceived;
        output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

        var packetsReceived = parseInt(item.packetsReceived || '0', 10);
        output.audio.receiving.totalPackets = packetsReceived;
        output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

        var packetsLost = parseInt(item.packetsLost || '0', 10);
        output.audio.receiving.totalPacketsLost = packetsLost;
        output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      // Chrome / Plugin (Outbound stats)
      } else {
        output.audio.sending.rtt = parseInt(item.googRtt || '0', 10);
        output.audio.sending.audioInputLevel = parseInt(item.audioInputLevel || '0', 10);
        output.audio.sending.echoReturnLoss = parseInt(item.googEchoCancellationReturnLoss || '0', 10);
        output.audio.sending.echoReturnLossEnhancement = parseInt(item.googEchoCancellationReturnLossEnhancement || '0', 10);

        var bytesSent = parseInt(item.bytesSent || '0', 10);
        output.audio.sending.totalBytes = bytesSent;
        output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

        var packetsSent = parseInt(item.packetsSent || '0', 10);
        output.audio.sending.totalPackets = packetsSent;
        output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');
      }

    // Firefox (Inbound stats)
    } else if (prop.indexOf('inbound_rtp_audio') === 0) {
      output.audio.receiving.jitter = item.jitter || 0;

      output.audio.receiving.totalBytes = item.bytesReceived;
      output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.audio.receiving.totalPackets = item.packetsReceived;
      output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.audio.receiving.totalPacketsLost = item.packetsLost;
      output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.audio.receiving.totalNacks = item.nackCount;
      output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

    // Firefox (Outbound stats)
    } else if (prop.indexOf('outbound_rtp_audio') === 0) {
      output.audio.sending.totalBytes = item.bytesSent;
      output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.audio.sending.totalPackets = item.packetsSent;
      output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.audio.sending.totalNacks = item.nackCount;
      output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      var rtcpItem = output.raw[prop.replace(/_rtp_/g, '_rtcp_')] || {};
      output.audio.sending.rtt = rtcpItem.roundTripTime || 0;
    }
  };

  // Format video stats
  var videoStatsFn = function (item, prop) {
    var prevStats = isAutoBwStats ? self._peerBandwidth[peerId][prop] : self._peerStats[peerId][prop];

    // Safari 11 (Inbound stats)
    if (prop.indexOf('RTCInboundRTPVideoStream') === 0) {
      output.video.receiving.fractionLost = item.fractionLost;
      output.video.receiving.jitter = item.jitter;
      output.video.receiving.framesDecoded = item.framesDecoded;
      output.video.receiving.qpSum = item.qpSum;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsDiscarded = item.packetsDiscarded;
      output.video.receiving.packetsDiscarded = self._parseConnectionStats(prevStats, item, 'packetsDiscarded');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.receiving.totalSlis = item.sliCount;
      output.video.receiving.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

    // Safari 11 (Inbound track stats)
    } else if (prop.indexOf('RTCMediaStreamTrack_remote_video_') === 0) {
      output.video.receiving.frameHeight = item.frameHeight;
      output.video.receiving.frameWidth = item.frameWidth;
      output.video.receiving.framesCorrupted = item.framesCorrupted;
      output.video.receiving.framesPerSecond = item.framesPerSecond;
      output.video.receiving.framesDropped = item.framesDropped;

      output.video.receiving.totalFrames = item.framesReceived;
      output.video.receiving.frames = self._parseConnectionStats(prevStats, item, 'framesReceived');

    // Safari 11 (Outbound stats)
    } else if (prop.indexOf('RTCOutboundRTPVideoStream') === 0) {
      output.video.sending.qpSum = item.qpSum;
      output.video.sending.targetBitrate = item.targetBitrate || 0;
      output.video.sending.framesEncoded = item.framesEncoded || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.sending.totalSlis = item.sliCount;
      output.video.sending.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

    // Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'inboundrtp' && item.mediaType === 'video' && item.isRemote) {
      output.video.receiving.fractionLost = item.fractionLost;
      output.video.receiving.jitter = item.jitter;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalPlis = item.pliCount;
      output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.receiving.totalSlis = item.sliCount;
      output.video.receiving.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.video.receiving.framesCorrupted = trackItem.framesCorrupted;
      output.video.receiving.framesDropped = trackItem.framesDropped;
      output.video.receiving.framesDecoded = trackItem.framesDecoded;

      output.video.receiving.totalFrames = trackItem.framesReceived;
      output.video.receiving.frames = self._parseConnectionStats(prevStats, trackItem, 'framesReceived');

    // Edge (WebRTC not ORTC shim) (Outbound stats) - Stats may not be accurate as it returns 0.
    } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'outboundrtp' && item.mediaType === 'video' && !item.isRemote) {
      output.video.sending.targetBitrate = item.targetBitrate || 0;
      output.video.sending.roundTripTime = item.roundTripTime || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.sending.totalFirs = item.firCount;
      output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      output.video.sending.totalPlis = item.pliCount;
      output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.sending.totalSlis = item.sliCount;
      output.video.sending.slis = self._parseConnectionStats(prevStats, item, 'sliCount');

      var trackItem = output.raw[item.mediaTrackId || ''] || {};
      output.video.sending.frameHeight = trackItem.frameHeight;
      output.video.sending.frameWidth = trackItem.frameWidth;
      output.video.sending.framesPerSecond = trackItem.framesPerSecond;

      output.video.sending.totalFrames = trackItem.framesSent;
      output.video.sending.frames = self._parseConnectionStats(prevStats, trackItem, 'framesSent');

    // Chrome / Plugin
    } else if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'video') {
      // Chrome / Plugin (Inbound stats)
      if (prop.indexOf('_recv') > 0) {
        output.video.receiving.jitter = parseInt(item.googJitterReceived || '0', 10);
        output.video.receiving.jitterBufferMs = parseInt(item.googJitterBufferMs || '0', 10);
        output.video.receiving.currentDelayMs = parseInt(item.googCurrentDelayMs || '0', 10);
        output.video.receiving.renderDelayMs = parseInt(item.googRenderDelayMs || '0', 10);
        output.video.receiving.frameWidth = parseInt(item.googFrameWidthReceived || '0', 10);
        output.video.receiving.frameHeight = parseInt(item.googFrameHeightReceived || '0', 10);
        output.video.receiving.framesDecoded = parseInt(item.framesDecoded || '0', 10);
        output.video.receiving.frameRateOutput = parseInt(item.googFrameRateOutput || '0', 10);
        output.video.receiving.frameRateDecoded = parseInt(item.googFrameRateDecoded || '0', 10);
        output.video.receiving.frameRateReceived = parseInt(item.googFrameRateReceived || '0', 10);
        output.video.receiving.qpSum = parseInt(item.qpSum || '0', 10);

        var bytesReceived = parseInt(item.bytesReceived || '0', 10);
        output.video.receiving.totalBytes = bytesReceived;
        output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

        var packetsReceived = parseInt(item.packetsReceived || '0', 10);
        output.video.receiving.totalPackets = packetsReceived;
        output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

        var packetsLost = parseInt(item.packetsLost || '0', 10);
        output.video.receiving.totalPacketsLost = packetsLost;
        output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

        var nacksSent = parseInt(item.googNacksSent || '0', 10);
        output.video.receiving.totalNacks = nacksSent;
        output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'googNacksSent');

        var plisSent = parseInt(item.googPlisSent || '0', 10);
        output.video.receiving.totalPlis = plisSent;
        output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'googPlisSent');

        var firsSent = parseInt(item.googFirsSent || '0', 10);
        output.video.receiving.totalFirs = firsSent;
        output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'googFirsSent');

      // Chrome / Plugin (Outbound stats)
      } else {
        output.video.sending.rtt = parseInt(item.googRtt || '0', 10);
        output.video.sending.frameWidth = parseInt(item.googFrameWidthSent || '0', 10);
        output.video.sending.frameHeight = parseInt(item.googFrameHeightSent || '0', 10);
        output.video.sending.framesEncoded = parseInt(item.framesEncoded || '0', 10);
        output.video.sending.frameRateInput = parseInt(item.googFrameRateInput || '0', 10);
        output.video.sending.frameRateEncoded = parseInt(item.googFrameRateEncoded || '0', 10);
        output.video.sending.frameRateSent = parseInt(item.googFrameRateSent || '0', 10);
        output.video.sending.cpuLimitedResolution = item.googCpuLimitedResolution === 'true';
        output.video.sending.bandwidthLimitedResolution = item.googBandwidthLimitedResolution === 'true';

        var bytesSent = parseInt(item.bytesSent || '0', 10);
        output.video.sending.totalBytes = bytesSent;
        output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

        var packetsSent = parseInt(item.packetsSent || '0', 10);
        output.video.sending.totalPackets = packetsSent;
        output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

        var nacksReceived = parseInt(item.googNacksReceived || '0', 10);
        output.video.sending.totalNacks = nacksReceived;
        output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'googNacksReceived');

        var plisReceived = parseInt(item.googPlisReceived || '0', 10);
        output.video.sending.totalPlis = plisReceived;
        output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'googPlisReceived');

        var firsReceived = parseInt(item.googFirsReceived || '0', 10);
        output.video.sending.totalFirs = firsReceived;
        output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'googFirsReceived');
      }

    // Firefox (Inbound stats)
    } else if (prop.indexOf('inbound_rtp_video') === 0) {
      output.video.receiving.jitter = item.jitter || 0;
      output.video.receiving.framesDecoded = item.framesDecoded || 0;
      output.video.receiving.frameRateMean = item.framerateMean || 0;
      output.video.receiving.frameRateStdDev = item.framerateStdDev || 0;

      output.video.receiving.totalBytes = item.bytesReceived;
      output.video.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');

      output.video.receiving.totalPackets = item.packetsReceived;
      output.video.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');

      output.video.receiving.totalPacketsLost = item.packetsLost;
      output.video.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');

      output.video.receiving.totalNacks = item.nackCount;
      output.video.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.receiving.totalPlis = item.pliCount;
      output.video.receiving.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.receiving.totalFirs = item.firCount;
      output.video.receiving.firs = self._parseConnectionStats(prevStats, item, 'firCount');

    // Firefox (Outbound stats)
    } else if (prop.indexOf('outbound_rtp_video') === 0) {
      output.video.sending.framesEncoded = item.framesEncoded || 0;
      output.video.sending.frameRateMean = item.framerateMean || 0;
      output.video.sending.frameRateStdDev = item.framerateStdDev || 0;
      output.video.sending.framesDropped = item.droppedFrames || 0;

      output.video.sending.totalBytes = item.bytesSent;
      output.video.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');

      output.video.sending.totalPackets = item.packetsSent;
      output.video.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');

      output.video.sending.totalNacks = item.nackCount;
      output.video.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');

      output.video.sending.totalPlis = item.pliCount;
      output.video.sending.plis = self._parseConnectionStats(prevStats, item, 'pliCount');

      output.video.sending.totalFirs = item.firCount;
      output.video.sending.firs = self._parseConnectionStats(prevStats, item, 'firCount');

      var rtcpItem = output.raw[prop.replace(/_rtp_/g, '_rtcp_')] || {};
      output.video.sending.rtt = rtcpItem.roundTripTime || 0;
    }
  };

  // Format video e2e delay stats
  var videoE2EStatsFn = function (item, prop) {
    // Chrome / Plugin (Inbound e2e stats)
    if (prop.indexOf('ssrc_') === 0 && item.mediaType === 'video') {
      var captureStartNtpTimeMs = parseInt(item.googCaptureStartNtpTimeMs || '0', 10);
      var remoteStream = pc.getRemoteStreams()[0];

      if (!(captureStartNtpTimeMs > 0 && prop.indexOf('_recv') > 0 && remoteStream &&
        document && typeof document.getElementsByTagName === 'function')) {
        return;
      }

      try {
        var elements = document.getElementsByTagName(AdapterJS.webrtcDetectedType === 'plugin' ? 'object' : 'video');

        if (AdapterJS.webrtcDetectedType !== 'plugin' && elements.length === 0) {
          elements = document.getElementsByTagName('audio');
        }

        for (var e = 0; e < elements.length; e++) {
          var videoStreamId = null;

          // For Plugin case where they use the <object> element
          if (AdapterJS.webrtcDetectedType === 'plugin') {
            // Precautionary check to return if there is no children like <param>, which means something is wrong..
            if (!(elements[e].children && typeof elements[e].children === 'object' &&
              typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
              break;
            }

            // Retrieve the "streamId" parameter
            for (var ec = 0; ec < elements[e].children.length; ec++) {
              if (elements[e].children[ec].name === 'streamId') {
                videoStreamId = elements[e].children[ec].value || null;
                break;
              }
            }

          // For Chrome case where the srcObject can be obtained and determine the streamId
          } else {
            videoStreamId = (elements[e].srcObject && (elements[e].srcObject.id || elements[e].srcObject.label)) || null;
          }

          if (videoStreamId && videoStreamId === (remoteStream.id || remoteStream.label)) {
            output.video.receiving.e2eDelay = ((new Date()).getTime() + 2208988800000) - captureStartNtpTimeMs - elements[e].currentTime * 1000;
            break;
          }
        }

      } catch (error) {
        if (!beSilentOnLogs) {
          log.warn([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
        }
      }
    }
  };

  var successCbFn =  function (stats) {
    if (typeof stats.forEach === 'function') {
      stats.forEach(function (item, prop) {
        output.raw[prop] = item;
      });
    } else {
      output.raw = stats;
    }

    var edgeTracksKind = {
      remote: {},
      local: {}
    };

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      if (pc.remoteStream) {
        pc.remoteStream.getTracks().forEach(function (track) {
          edgeTracksKind.remote[track.id] = track.kind;
        });
      }

      if (pc.localStream) {
        pc.localStream.getTracks().forEach(function (track) {
          edgeTracksKind.local[track.id] = track.kind;
        });
      }
    }

    Object.keys(output.raw).forEach(function (prop) {
      // Polyfill for Plugin missing "mediaType" stats item
      if (prop.indexOf('ssrc_') === 0 && !output.raw[prop].mediaType) {
        output.raw[prop].mediaType = output.raw[prop].audioInputLevel || output.raw[prop].audioOutputLevel ? 'audio' : 'video';

      // Polyfill for Edge 15.x missing "mediaType" stats item
      } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && !output.raw[prop].mediaType &&
        ['inboundrtp', 'outboundrtp'].indexOf(output.raw[prop].type) > -1) {
        var trackItem = output.raw[ output.raw[prop].mediaTrackId ] || {};
        output.raw[prop].mediaType = edgeTracksKind[ output.raw[prop].isRemote ? 'remote' : 'local' ][ trackItem.trackIdentifier ] || '';
      }

      certificateFn(output.raw[prop], prop);
      candidatePairFn(output.raw[prop], prop);
      codecsFn(output.raw[prop], prop);
      audioStatsFn(output.raw[prop], prop);
      videoStatsFn(output.raw[prop], prop);
      videoE2EStatsFn(output.raw[prop], prop);

      // Parse for bandwidth statistics if not yet defined to not mix with the getConnectionStatus()
      if (isAutoBwStats && !self._peerBandwidth[peerId][prop]) {
        self._peerBandwidth[peerId][prop] = output.raw[prop];
      } else if (!isAutoBwStats && !self._peerStats[peerId][prop]) {
        self._peerStats[peerId][prop] = output.raw[prop];
      }
    });

    // Prevent "0" in Edge 15.x and Safari 11 when SSRC stats is not available
    output.audio.sending.bytes = output.audio.sending.bytes || 0;
    output.audio.sending.packets = output.audio.sending.packets || 0;
    output.audio.sending.totalBytes = output.audio.sending.totalBytes || 0;
    output.audio.sending.totalPackets = output.audio.sending.totalPackets || 0;

    output.video.sending.bytes = output.video.sending.bytes || 0;
    output.video.sending.packets = output.video.sending.packets || 0;
    output.video.sending.totalBytes = output.video.sending.totalBytes || 0;
    output.video.sending.totalPackets = output.video.sending.totalPackets || 0;

    output.audio.receiving.bytes = output.audio.receiving.bytes || 0;
    output.audio.receiving.packets = output.audio.receiving.packets || 0;
    output.audio.receiving.totalBytes = output.audio.receiving.totalBytes || 0;
    output.audio.receiving.totalPackets = output.audio.receiving.totalPackets || 0;

    output.video.receiving.bytes = output.video.receiving.bytes || 0;
    output.video.receiving.packets = output.video.receiving.packets || 0;
    output.video.receiving.totalBytes = output.video.receiving.totalBytes || 0;
    output.video.receiving.totalPackets = output.video.receiving.totalPackets || 0;

    callback(null, output);
  };

  var errorCbFn = function (error) {
    if (!beSilentOnLogs) {
      log.error([peerId, 'RTCStatsReport', null, 'Failed retrieving stats ->'], error);
    }
    callback(error, null);
  };

  if (typeof pc.getStats !== 'function') {
    return errorCbFn(new Error('getStats() API is not available.'));
  }

  if (AdapterJS.webrtcDetectedType === 'plugin') {
    pc.getStats(null, successCbFn, errorCbFn);
  } else {
    pc.getStats(null).then(successCbFn).catch(errorCbFn);
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
Skylink.prototype._addPeer = function(targetMid, cert, peerBrowser, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }

  self._peerConnStatus[targetMid] = {
    connected: false,
    init: false
  };

  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    receiveOnly: receiveOnly,
    enableDataChannel: self._initOptions.enableDataChannel
  });

  log.info('Adding peer', isSS);

  self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS, cert);

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Failed creating the connection to peer.']);
    return;
  }

  self._peerConnStatus[targetMid].init = true;
  self._peerConnections[targetMid].hasScreen = !!isSS;
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, bwOptions, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];
  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._isLowerThanVersion(agent.SMProtocolVersion || '', '0.1.2')) {
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
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE && self._peerConnections[peerId]) {
    log.log([peerId, null, null, 'Sending restart message to signaling server ->'], {
      iceRestart: doIceRestart,
      options: bwOptions
    });

    self._peerCustomConfigs[peerId] = self._peerCustomConfigs[peerId] || {};
    self._peerCustomConfigs[peerId].bandwidth = self._peerCustomConfigs[peerId].bandwidth || {};
    self._peerCustomConfigs[peerId].googleXBandwidth = self._peerCustomConfigs[peerId].googleXBandwidth || {};

    if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
      if (typeof bwOptions.bandwidth.audio === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.audio = bwOptions.bandwidth.audio;
      }
      if (typeof bwOptions.bandwidth.video === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.video = bwOptions.bandwidth.video;
      }
      if (typeof bwOptions.bandwidth.data === 'number') {
        self._peerCustomConfigs[peerId].bandwidth.data = bwOptions.bandwidth.data;
      }
    }

    if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
      if (typeof bwOptions.googleXBandwidth.min === 'number') {
        self._peerCustomConfigs[peerId].googleXBandwidth.min = bwOptions.googleXBandwidth.min;
      }
      if (typeof bwOptions.googleXBandwidth.max === 'number') {
        self._peerCustomConfigs[peerId].googleXBandwidth.max = bwOptions.googleXBandwidth.max;
      }
    }

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(peerId),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true && self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._peerEndOfCandidatesCounter[peerId] = self._peerEndOfCandidatesCounter[peerId] || {};
    self._peerEndOfCandidatesCounter[peerId].len = 0;
    self._doOffer(peerId, doIceRestart, restartMsg);
    //self._handleNegotiationStats('restart', peerId, restartMsg, false);
    //self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

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
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId] && !this._hasMCU) {
    log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = null;

  if (!this._hasMCU) {
    peerInfo = clone(this.getPeerInfo(peerId)) || {
      userData: '',
      settings: { audio: false, video: false, data: false },
      mediaStatus: { audioMuted: true, videoMuted: true },
      agent: {
        name: 'unknown',
        version: 0,
        os: '',
        pluginVersion: null
      },
      config: {
        enableDataChannel: true,
        enableIceRestart: false,
        enableIceTrickle: true,
        priorityWeight: 0,
        publishOnly: false,
        receiveOnly: true
      },
      parentId: null,
      room: clone(this._selectedRoom)
    };
  }


  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (this._peerConnections[peerId]) {
    if (this._peerConnections[peerId].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      this._peerConnections[peerId].close();
      // Polyfill for safari 11 "closed" event not triggered for "iceConnectionState" and "signalingState".
      if (AdapterJS.webrtcDetectedType === 'AppleWebKit') {
        if (!this._peerConnections[peerId].signalingStateClosed) {
          this._peerConnections[peerId].signalingStateClosed = true;
          this._trigger('peerConnectionState', this.PEER_CONNECTION_STATE.CLOSED, peerId);
        }
        if (!this._peerConnections[peerId].iceConnectionStateClosed) {
          this._peerConnections[peerId].iceConnectionStateClosed = true;
          this._handleIceConnectionStats(this.ICE_CONNECTION_STATE.CLOSED, peerId);
          this._trigger('iceConnectionState', this.ICE_CONNECTION_STATE.CLOSED, peerId);
        }
      }
    }
    if (peerId !== 'MCU') {
      this._handleEndedStreams(peerId);
    }
    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (this._peerMessagesStamps[peerId]) {
    delete this._peerMessagesStamps[peerId];
  }
  // remove peer streams session
  if (this._streamsSession[peerId]) {
    delete this._streamsSession[peerId];
  }
  // remove peer streams session
  if (this._peerEndOfCandidatesCounter[peerId]) {
    delete this._peerEndOfCandidatesCounter[peerId];
  }
  // remove peer queued ICE candidates
  if (this._peerCandidatesQueue[peerId]) {
    delete this._peerCandidatesQueue[peerId];
  }
  // remove peer sdp session
  if (this._sdpSessions[peerId]) {
    delete this._sdpSessions[peerId];
  }
  // remove peer stats session
  if (this._peerStats[peerId]) {
    delete this._peerStats[peerId];
  }
  // remove peer bandwidth stats
  if (this._peerBandwidth[peerId]) {
    delete this._peerBandwidth[peerId];
  }
  // remove peer ICE candidates
  if (this._gatheredCandidates[peerId]) {
    delete this._gatheredCandidates[peerId];
  }
  // remove peer ICE candidates
  if (this._peerCustomConfigs[peerId]) {
    delete this._peerCustomConfigs[peerId];
  }
  // remove peer connection config
  if (this._peerConnStatus[peerId]) {
    delete this._peerConnStatus[peerId];
  }
  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }
  log.log([peerId, 'RTCPeerConnection', null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing, cert) {
  var pc, self = this;
  if (!self._inRoom || !(self._room && self._room.connection &&
    self._room.connection.peerConfig && Array.isArray(self._room.connection.peerConfig.iceServers))) {
    return;
  }

  var constraints = {
    iceServers: self._room.connection.peerConfig.iceServers,
    iceTransportPolicy: self._initOptions.filterCandidatesType.host && self._initOptions.filterCandidatesType.srflx &&
      !self._initOptions.filterCandidatesType.relay ? 'relay' : 'all',
    bundlePolicy: self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.NONE ?
      self.BUNDLE_POLICY.BALANCED : self._peerConnectionConfig.bundlePolicy,
    rtcpMuxPolicy: self._peerConnectionConfig.rtcpMuxPolicy,
    iceCandidatePoolSize: self._peerConnectionConfig.iceCandidatePoolSize
  };
  var optional = {
    optional: [
      { DtlsSrtpKeyAgreement: true },
      { googIPv6: true }
    ]
  };

  if (cert) {
    constraints.certificates = [cert];
  }

  if (self._peerConnStatus[targetMid]) {
    self._peerConnStatus[targetMid].constraints = constraints;
    self._peerConnStatus[targetMid].optional = optional;
  }

  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Creating peer connection ->'], {
      constraints: constraints,
      optional: optional
    });
    pc = new (self._initOptions.useEdgeWebRTC && window.msRTCPeerConnection ? window.msRTCPeerConnection : RTCPeerConnection)(constraints, optional);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
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
  pc.gathering = false;
  pc.localStream = null;
  pc.localStreamId = null;
  pc.remoteStream = null;
  pc.remoteStreamId = null;
  // Used for safari 11
  pc.iceConnectionStateClosed = false;
  pc.signalingStateClosed = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  self._streamsSession[targetMid] = self._streamsSession[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._sdpSessions[targetMid] = { local: {}, remote: {} };
  self._peerBandwidth[targetMid] = {};
  var bandwidth = null;

  if (targetMid === 'MCU') {
    log.info('Creating an empty transceiver of kind video with MCU');
    if (typeof pc.addTransceiver === 'function') {
      pc.addTransceiver('video');
    }
  }

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._initOptions.enableDataChannel && self._peerInformations[targetMid] &&
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
  self.videoRenderers = self.videoRenderers || {};

  pc.ontrack = function (rtcTrackEvent) {
    // TargetMid goes all the way back to Skylink.prototype._enterHandler

    if (!self._peerConnections[targetMid]) {
      return;
    }

    var stream = rtcTrackEvent.streams ? rtcTrackEvent.streams[0] : null;

    if (!stream) {
      return;
    }

    var transceiverMid = rtcTrackEvent.transceiver.mid;

    // Safari RTCTrackEvent receiver object does not have mid info
    if (self._hasMCU && AdapterJS.webrtcDetectedBrowser === 'safari') {
      rtcTrackEvent.currentTarget.getTransceivers().forEach(function(transceiver) {
        if (transceiver.receiver.track.id === rtcTrackEvent.receiver.track.id) {
          transceiverMid = transceiver.mid;
        }
      })
    }

    pc.remoteStream = stream;
    pc.remoteStreamId = pc.remoteStreamId || stream.id || stream.label;

    var peerSettings = clone(self.getPeerInfo(targetMid).settings);

    self._streamsSession[targetMid][pc.remoteStreamId] = peerSettings;

    if (stream.getAudioTracks().length === 0) {
      self._streamsSession[targetMid][pc.remoteStreamId].audio = false;
    }

    if (stream.getVideoTracks().length === 0) {
      self._streamsSession[targetMid][pc.remoteStreamId].video = false;
    }

    pc.hasStream = true;
    pc.hasScreen = peerSettings.video && typeof peerSettings.video === 'object' && peerSettings.video.screenshare;

    rtcTrackEvent.track.onunmute = function() {
      self._onRemoteStreamAdded(self._hasMCU ? self._transceiverIdPeerIdMap[transceiverMid] : targetMid, stream, !!pc.hasScreen);
    };

    // Safari tracks come in as muted=false
    if (!rtcTrackEvent.track.muted){
      self._onRemoteStreamAdded(self._hasMCU ? self._transceiverIdPeerIdMap[transceiverMid] : targetMid, stream, !!pc.hasScreen);
    }
  };

  pc.onremovestream = function(evt) {
    var stream = evt.stream || evt;
  };

  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };

  // FIX for Chrome 75
  if (!(AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion === 75)) {
      var statsInterval = null;
      pc.oniceconnectionstatechange = function(evt) {
          var iceConnectionState = pc.iceConnectionState;

          log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

          if (AdapterJS.webrtcDetectedBrowser === 'edge') {
              if (iceConnectionState === 'connecting') {
                  iceConnectionState = self.ICE_CONNECTION_STATE.CHECKING;
              } else if (iceConnectionState === 'new') {
                  iceConnectionState = self.ICE_CONNECTION_STATE.FAILED;
              }
          }

          if (AdapterJS.webrtcDetectedType === 'AppleWebKit' && iceConnectionState === self.ICE_CONNECTION_STATE.CLOSED) {
              setTimeout(function () {
                  if (!pc.iceConnectionStateClosed) {
                      self._handleIceConnectionStats(self.ICE_CONNECTION_STATE.CLOSED, targetMid);
                      self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.CLOSED, targetMid);
                  }
              }, 10);
              return;
          }

          self._handleIceConnectionStats(pc.iceConnectionState, targetMid);
          self._trigger('iceConnectionState', iceConnectionState, targetMid);

          if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._initOptions.enableIceTrickle) {
              self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
          }

          if (self._peerConnStatus[targetMid]) {
              self._peerConnStatus[targetMid].connected = [self.ICE_CONNECTION_STATE.COMPLETED,
                  self.ICE_CONNECTION_STATE.CONNECTED].indexOf(iceConnectionState) > -1;
          }

          if (!statsInterval && [self.ICE_CONNECTION_STATE.CONNECTED, self.ICE_CONNECTION_STATE.COMPLETED].indexOf(iceConnectionState) > -1) {
              statsInterval = true;

              // Do an initial getConnectionStatus() to backfill the first retrieval in order to do (currentTotalStats - lastTotalStats).
              self.getConnectionStatus(targetMid, function () {
                  statsInterval = setInterval(function () {
                      if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
                          clearInterval(statsInterval);
                          return;
                      }
                      self._handleBandwidthStats(targetMid);
                  }, 20000);
              });
          }

          if (!self._hasMCU && [self.ICE_CONNECTION_STATE.CONNECTED, self.ICE_CONNECTION_STATE.COMPLETED].indexOf(
              iceConnectionState) > -1 && !!self._bandwidthAdjuster && !bandwidth && AdapterJS.webrtcDetectedBrowser !== 'edge' &&
              (((self._peerInformations[targetMid] || {}).agent || {}).name || 'edge') !== 'edge') {
              var currentBlock = 0;
              var formatTotalFn = function (arr) {
                  var total = 0;
                  for (var i = 0; i < arr.length; i++) {
                      total += arr[i];
                  }
                  return total / arr.length;
              };
              bandwidth = {
                  audio: { send: [], recv: [] },
                  video: { send: [], recv: [] }
              };
              var pullInterval = setInterval(function () {
                  if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
                      self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster || !self._peerBandwidth[targetMid]) {
                      clearInterval(pullInterval);
                      return;
                  }
                  self._retrieveStats(targetMid, function (err, stats) {
                      if (!(self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !==
                          self.PEER_CONNECTION_STATE.CLOSED) || !self._bandwidthAdjuster) {
                          clearInterval(pullInterval);
                          return;
                      }
                      if (err) {
                          bandwidth.audio.send.push(0);
                          bandwidth.audio.recv.push(0);
                          bandwidth.video.send.push(0);
                          bandwidth.video.recv.push(0);
                      } else {
                          bandwidth.audio.send.push(stats.audio.sending.bytes * 8);
                          bandwidth.audio.recv.push(stats.audio.receiving.bytes * 8);
                          bandwidth.video.send.push(stats.video.sending.bytes * 8);
                          bandwidth.video.recv.push(stats.video.receiving.bytes * 8);
                      }
                      currentBlock++;
                      if (currentBlock === self._bandwidthAdjuster.interval) {
                          currentBlock = 0;
                          var totalAudioBw = formatTotalFn(bandwidth.audio.send);
                          var totalVideoBw = formatTotalFn(bandwidth.video.send);
                          if (!self._bandwidthAdjuster.useUploadBwOnly) {
                              totalAudioBw += formatTotalFn(bandwidth.audio.recv);
                              totalVideoBw += formatTotalFn(bandwidth.video.recv);
                              totalAudioBw = totalAudioBw / 2;
                              totalVideoBw = totalVideoBw / 2;
                          }
                          totalAudioBw = parseInt((totalAudioBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
                          totalVideoBw = parseInt((totalVideoBw * (self._bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
                          bandwidth = {
                              audio: { send: [], recv: [] },
                              video: { send: [], recv: [] }
                          };
                          self.refreshConnection(targetMid, {
                              bandwidth: { audio: totalAudioBw, video: totalVideoBw }
                          });
                      }
                  }, true, true);
              }, 1000);
          }
      };
  }

  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);

    if (AdapterJS.webrtcDetectedType === 'AppleWebKit' && pc.signalingState === self.PEER_CONNECTION_STATE.CLOSED) {
      setTimeout(function () {
        if (!pc.signalingStateClosed) {
          self._trigger('peerConnectionState', self.PEER_CONNECTION_STATE.CLOSED, targetMid);
        }
      }, 10);
      return;
    }

    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
            self._removeSenderFromList(targetMid, senders[s]);
          }
        }
      }
    };
  }

  self._handleIceConnectionStats(pc.iceConnectionState, targetMid);
  self._handleIceGatheringStats('new', targetMid, false);
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
Skylink.prototype._restartMCUConnection = function(callback, doIceRestart, bwOptions) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var sendRestartMsgFn = function (peerId) {
    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: AdapterJS.webrtcDetectedBrowser,
      version: (AdapterJS.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(peerId),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._initOptions.enableIceTrickle,
      enableDataChannel: self._initOptions.enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: self._initOptions.mcuUseRenegoRestart && doIceRestart === true &&
        self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    // log.log([peerId, 'RTCPeerConnection', null, 'Sending restart message to signaling server ->'], restartMsg);

    self._doOffer('MCU', doIceRestart, restartMsg);
    //self._handleNegotiationStats('restart', peerId, restartMsg, false);
  };

  // Toggle the main bandwidth options.
  if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
    if (typeof bwOptions.bandwidth.audio === 'number') {
      self._streamsBandwidthSettings.bAS.audio = bwOptions.bandwidth.audio;
    }
    if (typeof bwOptions.bandwidth.video === 'number') {
      self._streamsBandwidthSettings.bAS.video = bwOptions.bandwidth.video;
    }
    if (typeof bwOptions.bandwidth.data === 'number') {
      self._streamsBandwidthSettings.bAS.data = bwOptions.bandwidth.data;
    }
  }

  if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
    if (typeof bwOptions.googleXBandwidth.min === 'number') {
      self._streamsBandwidthSettings.googleX.min = bwOptions.googleXBandwidth.min;
    }
    if (typeof bwOptions.googleXBandwidth.max === 'number') {
      self._streamsBandwidthSettings.googleX.max = bwOptions.googleXBandwidth.max;
    }
  }


  // Below commented since with new MCU only peer connected is MCU

  // for (var i = 0; i < listOfPeers.length; i++) {
  //   if (!self._peerConnections[listOfPeers[i]]) {
  //     var error = 'Peer connection with peer does not exists. Unable to restart';
  //     log.error([listOfPeers[i], 'PeerConnection', null, error]);
  //     listOfPeerRestartErrors[listOfPeers[i]] = new Error(error);
  //     continue;
  //   }
  //
  //   if (listOfPeers[i] !== 'MCU') {
  //     self._trigger('peerRestart', listOfPeers[i], self.getPeerInfo(listOfPeers[i]), true, false);
  //
  //     if (!self._initOptions.mcuUseRenegoRestart) {
  //       sendRestartMsgFn(listOfPeers[i]);
  //     }
  //   }
  // }

  // self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  if (self._initOptions.mcuUseRenegoRestart) {
    self._peerEndOfCandidatesCounter.MCU = self._peerEndOfCandidatesCounter.MCU || {};
    self._peerEndOfCandidatesCounter.MCU.len = 0;
    sendRestartMsgFn('MCU');
  } else {
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
        self.joinRoom(self._selectedRoom, {
          bandwidth: bwOptions.bandwidth || {},
          googleXBandwidth: bwOptions.googleXBandwidth || {},
          sdpSettings: clone(self._sdpSettings),
          voiceActivityDetection: self._voiceActivityDetection,
          publishOnly: !!self._publishOnly,
          parentId: self._parentId || null,
          autoBandwidthAdjustment: self._bandwidthAdjuster
        });
      }
    });
  }
};

/**
 * Function that handles the stats tabulation.
 * @method _parseConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._parseConnectionStats = function(prevStats, stats, prop) {
  var nTime = stats.timestamp;
  var oTime = prevStats ? prevStats.timestamp || 0 : 0;
  var nVal = parseFloat(stats[prop] || '0', 10);
  var oVal = parseFloat(prevStats ? prevStats[prop] || '0' : '0', 10);

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

/**
 * Function that signals the end-of-candidates flag.
 * @method _signalingEndOfCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._signalingEndOfCandidates = function(targetMid) {
  var self = this;

  if (!self._peerEndOfCandidatesCounter[targetMid]) {
    return;
  }

  if (
  // If peer connection exists first and state is not closed.
    self._peerConnections[targetMid] && self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
  // If remote description is set
    self._peerConnections[targetMid].remoteDescription && self._peerConnections[targetMid].remoteDescription.sdp &&
  // If end-of-candidates signal is received
    typeof self._peerEndOfCandidatesCounter[targetMid].expectedLen === 'number' &&
  // If all ICE candidates are received
    self._peerEndOfCandidatesCounter[targetMid].len >= self._peerEndOfCandidatesCounter[targetMid].expectedLen &&
  // If there is no ICE candidates queue
    (self._peerCandidatesQueue[targetMid] ? self._peerCandidatesQueue[targetMid].length === 0 : true) &&
  // If it has not been set yet
    !self._peerEndOfCandidatesCounter[targetMid].hasSet) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);

    self._peerEndOfCandidatesCounter[targetMid].hasSet = true;

    try {
      if (AdapterJS.webrtcDetectedBrowser === 'edge') {
        var mLineCounter = -1;
        var addedMids = [];
        var sdpLines = self._peerConnections[targetMid].remoteDescription.sdp.split('\r\n');
        var rejected = false;

        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('m=') === 0) {
            rejected = sdpLines[i].split(' ')[1] === '0';
            mLineCounter++;
          } else if (sdpLines[i].indexOf('a=mid:') === 0 && !rejected) {
            var mid = sdpLines[i].split('a=mid:')[1] || '';
            if (mid && addedMids.indexOf(mid) === -1) {
              addedMids.push(mid);
              self._addIceCandidate(targetMid, 'endofcan-' + (new Date()).getTime(), new RTCIceCandidate({
                sdpMid: mid,
                sdpMLineIndex: mLineCounter,
                candidate: 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates'
              }));
              // Start breaking after the first add because of max-bundle option
              if (self._peerConnectionConfig.bundlePolicy === self.BUNDLE_POLICY.MAX_BUNDLE) {
                break;
              }
            }
          }
        }

      } else if (AdapterJS && !self._isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
        self._peerConnections[targetMid].addIceCandidate(null);
      }

      if (self._gatheredCandidates[targetMid]) {
        self._trigger('candidatesGathered', targetMid, {
          expected: self._peerEndOfCandidatesCounter[targetMid].expectedLen || 0,
          received: self._peerEndOfCandidatesCounter[targetMid].len || 0,
          processed: self._gatheredCandidates[targetMid].receiving.srflx.length +
            self._gatheredCandidates[targetMid].receiving.relay.length +
            self._gatheredCandidates[targetMid].receiving.host.length
        });
      }

    } catch (error) {
      log.error([targetMid, 'RTCPeerConnection', null, 'Failed signaling end-of-candidates ->'], error);
    }
  }
};

/**
 * Function that iterates the Peer Connections and replaces track using the RTCRTPSender.replaceTrack
 * @method _replaceTrack
 * @param {String} trackIDToCompare - ID of the track whose RTCRTPSenders needs to be used
 * @param {MediaStreamTrack} trackToReplace - The new track which will replace the old track
 * @private
 */
Skylink.prototype._replaceTrack = function (trackIDToCompare, trackToReplace) {
  var self = this;
  if (Object.keys(self._peerConnections).length > 0) {
    var peerIds = Object.keys(self._peerConnections);
    for (var i = 0; i < peerIds.length; i++) {
      var pc = self._peerConnections[peerIds[i]];
      var senders = pc.getSenders();

      for (var y = 0; y < senders.length; y++) {
        var sender = senders[y];
        if (sender.track && sender.track.id === trackIDToCompare) {
          sender.replaceTrack(trackToReplace);
        }
      }
    }
  }
};



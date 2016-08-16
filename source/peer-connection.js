/**
 * Contains the list of Peer connection session description exchanging states.
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {String} STABLE <small>Value <code>"stable"</code></small>
 *   The state when there is no session description being exchanged with Peer connection.
 * @param {String} HAVE_LOCAL_OFFER <small>Value <code>"have-local-offer"</code></small>
 *   The state when offer session description is generated from Peer connection and is sent.
 * @param {String} HAVE_REMOTE_OFFER <small>Value <code>"have-remote-offer"</code></small>
 *   The state when offer session description is received from Peer connection.
 *   The Peer connection would then generate a local session description and send to Peer,
 *   which would result in the <code>STABLE</code> state afterwards.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when Peer connection is closed and no session description would be exchanged.
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
 * Contains the list of <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code>
 *   method</a> retrieval states.
 * @attribute GET_CONNECTION_STATUS_STATE
 * @type JSON
 * @param {Number} RETRIEVING <small>Value <code>0</code></small>
 *   The state when <code>getConnectionStatus()</code> is retrieving the Peer connection stats.
 * @param {Number} RETRIEVE_SUCCESS <small>Value <code>1</code></small>
 *   The state when <code>getConnectionStatus()</code> has retrieved the Peer connection stats.
 * @param {Number} RETRIEVE_ERROR <small>Value <code>-1</code></small>
 *   The state when <code>getConnectionStatus()</code> has failed retrieving the Peer connection stats.
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
 * Contains the list of different types of server Peer connections.
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU <small>Value <code>"mcu"</code></small>
 *   The server Peer type that is used for MCU connection.
 * <small>Read more about what is a MCU <a href="#">here</a>.</small>
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
 * Stores the restart initiated timestamp to throttle the <code>refreshConnection</code> functionality.
 * @attribute _lastRestart
 * @type Object
 * @private
 * @for Skylink
 * @since 0.5.9
 */
Skylink.prototype._lastRestart = null;

/**
 * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
 *   for the Peer connection health timer.
 * @attribute _retryCount
 * @type Number
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._retryCount = 0;

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
 *   For MCU enabled Peer connections, the restart functionality may differ.
 *   <a href="http://support.temasys.com.sg/support/discussions/topics/12000002853">Read this article here</a>.<br>
 *   Note that the functionality is throttled when invoked many times in less than 3 seconds interval.
 * </blockquote>
 * Function that refreshes Peer connections.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] The target Peer ID to only refresh the Peer connection.<br>
 * - When provided as an Array, it will refresh the Peer connections with all the Peer IDs provided.<br>
 * - When not provided, it will refresh the Peer connections with all the currently connected Peers.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for refreshing the Peer connections.
 * @param {JSON} callback.error.refreshErrors The list of Peer connection refresh errors.
 *   <small>If there is <code>"self"</code> property, it's likely due to having no Peers to refresh the
 *     Peer connections with.</small>
 * @param {Error|String} callback.error.refreshErrors.<#peerId> The Peer connection refresh error associated
 *   with the Peer ID property name.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for refreshing the Peer connections.
 * @trigger <b class="desc-seq-header">&#8594; For Peer connections without MCU enabled:</b> <ol class="desc-seq">
 *   <li>Starts re-negotiation with Peer connections. <ul>
 *     <li>Triggers <a href="#event_peerRestart"><code>peerRestart</code> event</a>.</li></ul></li>
 *   </ol>
 *   <b class="desc-seq-header">&#8594; For Peer connections with MCU enabled:</b> <ol class="desc-seq">
 *   <li>Starts sending notifications to Peer connected in the Room that User is restarting connection.<ul>
 *      <li>Triggers <a href="#event_peerRestart"><code>peerRestart</code> event</a>.</li>
 *      <li>Triggers <a href="#event_serverPeerRestart"><code>serverPeerRestart</code> event</a> for User</li>
 *   </ul></li>
 *   <li>Invokes <a href="#method_joinRoom"><code>joinRoom()</code> method</a>. <ul>
 *     <li><code>refreshConnection()</code> will retain the User session information except the Peer ID will
 *        be a different assigned ID.</li></ul></li>
 *   </ol>
 * @example &lt;body&gt;
 *   &lt;div id="peer-list"&gt;&lt;/div&gt;
 *   &lt;script&gt;
 *     skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *       if (!isSelf) {
 *         var peerBtn = document.createElement("button");
 *         peerBtn.id = peerId;
 *         peerBtn.onclick = function () {
 *           skylinkDemo.refreshConnection(peerId);
 *         };
 *         peerBtn.innerHTML = "Refresh Connection?";
 *         document.getElementById("peer-list").appendChild(peerBtn);
 *       }
 *     });
 *   &lt;/script&gt;
 *  &lt;/body&gt;
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
 * Function that retrieves the Peer connection stats.
 * @method getConnectionStatus
 * @param {String|Array} [targetPeerId] The target Peer ID to only retrieve the Peer connection stats.<br>
 * - When provided as an Array, it will retrieve the Peer connections stats with all the Peer IDs provided.<br>
 * - When not provided, it will retrieve the Peer connections stats with all the currently connected Peers.
 * @param {Function} [callback] he callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for retrieving the Peer connections stats.
 * @param {JSON} callback.error.retrievalErrors The list of retrieval of Peer connection stats errors.
 *   <small>If there is <code>"self"</code> property, it's likely due to having no Peers to retrieve the
 *     Peer connections stats from.</small>
 * @param {Error|String} callback.error.retrievalErrors.<#peerId> The Peer connection stats retrieval error associated
 *   with the Peer ID property name.
 * @param {JSON} callback.error.connectionStats The list of Peer connection stats that has been successfully retrieved.
 * @param {JSON} callback.error.connectionStats.<#peerId> The Peer connection stats associated
 *   with the Peer ID property name.
 * <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for retrieving the Peer connections stats.
 * @param {JSON} callback.success.connectionStats The list of Peer connection stats.
 * @param {JSON} callback.success.connectionStats.<#peerId> The Peer connection stats associated
 *   with the Peer ID property name.
 * <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves the Peer connections stats.<ul>
 *     <li>Triggers <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *       with parameter payload <code>state</code> as <code>RETRIEVING</code>.</li>
 *     <li>If retrieval of Peer connection stats is successful, it triggers <a href="#event_getConnectionStatusStateChange">
 *       <code>getConnectionStatusStateChange</code> event</a> with parameter payload <code>state</code> as
 *       <code>RETRIEVE_SUCCESS</code> after <code>RETRIEVING</code>.</li>
 *     <li>If retrieval of Peer connection stats had failed, it triggers <a href="#event_getConnectionStatusStateChange">
 *       <code>getConnectionStatusStateChange</code> event</a> with parameter payload <code>state</code> as
 *       <code>RETRIEVE_ERROR</code> after <code>RETRIEVING</code>.</li>
 *   </ul></li></ol>
 * @example
 *   var peerIntervals = {};
 *
 *   skylinkDemo.on("getConnectionStatusStateChange", function (state, peerId, stats, error) {
 *     if (state === skylinkDemo.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS) {
 *       // Display connection stats
 *     } else if (state === skylinkDemo.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR) {
 *       // Display retrieval error
 *     }
 *   });
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (!isSelf) {
 *       peerIntervals[peerId] = setInterval(function () {
 *         skylinkDemo.getConnectionStatus(peerId);
 *       }, 1000);
 *     }
 *   });
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
        remoteDescription: pc.remoteDescription,
        localDescription: pc.localDescription,
        candidates: clone(self._gatheredCandidates[peerId] || {
          sending: { host: [], srflx: [], relay: [] },
          receiving: { host: [], srflx: [], relay: [] }
        })
      },
      audio: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0
        }
      },
      video: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0
        }
      },
      selectedCandidate: {
        local: { ipAddress: null, candidateType: null, portNumber: null, transport: null },
        remote: { ipAddress: null, candidateType: null, portNumber: null, transport: null }
      }
    };
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
            }

          // Sending RTP packets lost
          } else if (prop.indexOf('outbound_rtcp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            result[obj.mediaType][dirType].packetsLost = obj.packetsLost || 0;

            if (dirType === 'sending') {
              result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
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

            if (dirType === 'sending') {
              // NOTE: Chrome sending audio does have it but plugin has..
              result[obj.mediaType].sending.rtt = parseInt(obj.googRtt || '0', 10);
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
  // I'm the callee I need to make an offer
  /*if (toOffer) {
    self._doOffer(targetMid, peerBrowser);
  }*/

  // do a peer connection health check
  // let MCU handle this case
  if (!self._hasMCU) {
    this._startPeerConnectionHealthCheck(targetMid, toOffer);
  } else {
    log.warn([targetMid, 'PeerConnectionHealth', null, 'Not setting health timer for MCU connection']);
    return;
  }
};

/**
 * Function that re-negotiates a Peer connection.
 * We currently do not implement the ICE restart functionality.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
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

  delete self._peerConnectionHealth[peerId];

  self._stopPeerConnectionHealthCheck(peerId);

  var pc = self._peerConnections[peerId];

  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (['Android', 'iOS', 'cpp'].indexOf(agent.name) > -1) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(null, notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    if (self._peerConnections[peerId] && !self._peerConnections[peerId].receiveOnly) {
      self._addLocalMediaStreams(peerId);
    }

    if (isSelfInitiatedRestart){
      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      var lastRestart = Date.now() || function() { return +new Date(); };

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
        // This will not be used based off the logic in _restartHandler
        weight: self._peerPriorityWeight,
        receiveOnly: self._peerConnections[peerId] && self._peerConnections[peerId].receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
        explicit: !!explicit
      });

      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), false);

      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
        callback(null, null);
      }
    } else {
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback (receiving peer)']);
        callback(null, null);
      }
    }

    // following the previous logic to do checker always
    self._startPeerConnectionHealthCheck(peerId, false);

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
          callback(null, new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(null, new Error(unableToRestartError));
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
  // remove peer informations session
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

  // datachannels
  self._dataChannels[targetMid] = {};
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
    var stream = event.stream || event;

    if (targetMid === 'MCU') {
      log.debug([targetMid, 'MediaStream', stream.id,
        'Ignoring received remote stream from MCU ->'], stream);
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
    var candidate = event.candidate || event;

    if (candidate.candidate) {
      pc.gathered = false;
    } else {
      pc.gathered = true;
    }

    log.debug([targetMid, 'RTCIceCandidate', null, 'Ice candidate generated ->'], candidate);
    self._onIceCandidate(targetMid, candidate);
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

      if (iceConnectionState === self.ICE_CONNECTION_STATE.FAILED) {
        self._ICEConnectionFailures[targetMid] += 1;

        if (self._enableIceTrickle) {
          self._trigger('iceConnectionState',
            self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
        }

        // refresh when failed. ignore for MCU case since restart is handled by MCU in this case
        if (!self._hasMCU) {
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
  var lastRestart = Date.now() || function() { return +new Date(); };
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
      self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true);

      log.log([peerId, null, null, 'Sending restart message to signaling server']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.RESTART,
        mid: self._user.sid,
        rid: self._room.id,
        agent: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        userInfo: self.getPeerInfo(),
        target: peerId, //'MCU',
        isConnectionRestart: false,
        lastRestart: lastRestart,
        weight: self._peerPriorityWeight,
        receiveOnly: receiveOnly,
        enableIceTrickle: self._enableIceTrickle,
        enableDataChannel: self._enableDataChannel,
        sessionType: !!self._mediaScreen ? 'screensharing' : 'stream',
        explicit: true
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

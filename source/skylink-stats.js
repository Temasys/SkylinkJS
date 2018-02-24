/**
 * Function that posts the stats to API.
 * @method _postStatsToApi
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._postStatsToApi = function (endpoint, params) {
  var self = this;

  // The API result returned "username" will change each time a GET /api/:appKey/:room is done.
  if (!self._statIdRandomStr) {
    self._statIdRandomStr = (Date.now() + Math.floor(Math.random() * 1000000));
  }

  params.client_id = ((self._user && self._user.uid) || 'dummy') + '_' + self._statIdRandomStr;
  params.room_id = (self._room && self._room.id) || null;
  params.user_id = (self._user && self._user.sid) || null;
  params.app_key = self._initOptions.appKey;
  params.timestamp = (new Date()).toISOString();

  // We need not use CORS and do not need to care if API returns success or failure
  // since we are just endlessly posting it.
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.temasys.io' + endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify(params));
};


/**
 * Function that handles the parsing of mediastream tracks details.
 * @method _handleStatsClient
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStatsMediaTracks = function (callback) {
  var self = this;
  var tracksStatsObject = {
    audio: [],
    video: []
  };
  // Retrieve the stream that is used by the SDK to send to all other peers.
  var stream =
    (self._streams.screenshare && self._streams.screenshare.stream) ||
    ((self._streams.userMedia && self._streams.userMedia.stream) || null);

  if (!stream) {
    return callback(tracksStatsObject);
  }

  var audioTracks = stream.getAudioTracks();
  var videoTracks = stream.getVideoTracks();

  // Parse the audio tracks information first.
  audioTracks.forEach(function (track) {
    tracksStatsObject.audio.push({
      id: track.id,
      stream_id: stream.id || stream.label
    });
  });


  if (videoTracks.length === 0) {
    return callback(tracksStatsObject);
  }

  // Append the stream to a dummy <video> element to retrieve the resolution width and height.
  var video = document.createElement('video');
  video.autoplay = true;
  // Mute the audio of the <video> element to prevent feedback.
  video.muted = true;
  video.volume = 0;

  var onVideoLoaded = function () {
    videoTracks.forEach(function (track) {
      tracksStatsObject.video.push({
        id: track.id,
        stream_id: stream.id || stream.label,
        resolution_width: video.videoWidth,
        resolution_height: video.videoHeight
      });
    });
  };

  // Because the plugin does not support the "loaded" event.
  if (AdapterJS.webrtcDetectedType === 'plugin') {
    setTimeout(onVideoLoaded, 1500);

  } else {
    video.addEventListener('loaded', onVideoLoaded);
  }

  AdapterJS.attachMediaStream(video, stream);
};

/**
 * Function that handles the posting of client information (POST /stats/client) stats.
 * @method _handleStatsClient
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsClient = function() {
  var self = this;
  var statsObject = {
    username: (self._user && self._user.uid) || null,
    sdk: {
      name: 'web',
      version: self.VERSION
    },
    agent: {
      name: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      platform: navigator.platform,
      plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null
    },
    media: {}
  };

  self._parseStatsMediaTracks(function (tracksStatsObject) {
    statsObject.media = tracksStatsObject;
    self._postStatsToApi('/stats/client', statsObject);
  });
};

/**
 * Function that handles the posting of appkey authentication (POST /stats/auth) stats.
 * @method _handleStatsAuth
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsAuth = function(result, status) {
  var self = this;
  var statsObject = {
    api_url: self._path,
    api_result: result,
    room_id: (result && result.room_key) || null,
    http_status: status || null // TOCHECK: Not documented in specs.
  };

  self._postStatsToApi('/stats/auth', statsObject);
};

/**
 * Function that handles the posting of socket connection (POST /stats/client/signaling) stats.
 * @method _handleStatsSignaling
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsSignaling = function(state, socketSession, error) {
  var self = this;
  var statsObject = {
    state: state,
    protocol: self._signalingServerProtocol,
    server: (socketSession.socketServer.split('//')[1] || '').split(':')[0] || '',
    port: parseInt(((socketSession.socketServer.split(':') || '')[2] || '').split('?')[0] || '', 10),
    transport: socketSession.transportType.toLowerCase(),
    attempts: socketSession.attempts,
    // TO CHECK: Added new field "error" not documented in specs.
    error: error || null
  };

  self._postStatsToApi('/stats/client/signaling', statsObject);
};

/**
 * Function that handles the posting of peer ICE connection states (POST /stats/client/iceconnection) stats.
 * @method _handleStatsIceConnection
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsIceConnection = function(state, peerId) {
  var self = this;
  var statsObject = {
    peer_id: peerId,
    state: state,
    is_trickle: self._initOptions.enableIceTrickle,
    local_candidate: {},
    remote_candidate: {}
  };

  self._retrieveStats(peerId, function (error, stats) {
    if (stats) {
      // Parse the selected ICE candidate pair for both local and remote candidate.
      ['local', 'remote'].forEach(function (directionType) {
        var candidate = stats.selectedCandidate[directionType];

        if (candidate) {
          statsObject[directionType + '_candidate'].address = candidate.ipAddress || null;
          statsObject[directionType + '_candidate'].port = candidate.portNumber || null;
          statsObject[directionType + '_candidate'].priority = candidate.priority || null;
          statsObject[directionType + '_candidate'].transport = candidate.transport || null;
          statsObject[directionType + '_candidate'].candidateType = candidate.candidateType || null;

          // This is only available for the local ICE candidate.
          if (directionType === 'local') {
            statsObject[directionType + '_candidate'].networkType = candidate.networkType || null;
          }
        }
      });
    }

    self._postStatsToApi('/stats/client/iceconnection', statsObject);
  }, true);
};

/**
 * Function that handles the posting of peer ICE candidate processing states (POST /stats/client/icecandidate) stats.
 * @method _handleStatsIceCandidate
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsIceCandidate = function(state, peerId, candidateId, candidate, error) {
  var self = this;
  var statsObject = {
    peer_id: peerId,
    state: state,
    candidate_id: candidateId || null,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate,
    is_remote: !!candidateId, // TOCHECK: Not documented in specs.
    error: error || null
  };

  self._postStatsToApi('/stats/client/icecandidate', statsObject);
};

/**
 * Function that parses the session description to obtain every media connections to signal end of ICE gathering for stats.
 * @method _parseStatsIceGatheringCompleted
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStatsIceGatheringCompleted = function(peerId, directionType) {
  var self = this;

  // Ignore if that the peer connection does not exists.
  if (!self._peerConnections[peerId]) {
    return;
  }

  var sessionDescription = self._peerConnections[peerId][directionType + 'Description'];

  // Ignore if the session description does not exists.
  if (!(sessionDescription && sessionDescription.sdp)) {
    return;
  }

  // Example SDP format:
  // v=0\r\n
  // ..\r\n
  // m=audio\r\n
  // ..\r\n
  // m=video\r\n
  // ..\r\n
  // m=application\r\n
  // ..\r\n
  sessionDescription.sdp.split('m=').forEach(function (lines, index) {
    if (['audio', 'video', 'application'].indexOf(lines.split(' ')[0]) === -1) {
      return;
    }

    // Parse the a=mid:xxx\r\n line part from the SDP.
    var sdpMid = (lines.split('a=mid:')[1] || '').split('\r\n')[0];
    // For local ICE candidate, it doesn't need the candidate ID.
    var candidateId = directionType === 'remote' ? 'endofcan-' + (index - 1) : null;

    self._handleStatsIceCandidate(null, peerId, candidateId, {
      sdpMid: sdpMid,
      // Given that the first index would be "v=0\r\n", it makes sense it should be (index - 1)
      sdpMLineIndex: index - 1,
      // TOCHECK: We use `null` to indicate that the end-of-candidates has occurred.
      candidate: null
    });
  });
};

/**
 * Function that parses ICE candidates (a=candidate:) from the non-trickle remote description and post to stats.
 * @method _parseStatsIceCandidatesFromSDP
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStatsIceCandidatesFromSDP = function(peerId, sessionDescription) {
  var self = this;

  // Ignore if the session description does not exists.
  if (!(sessionDescription && sessionDescription.sdp)) {
    return;
  }

  // TOCHECK: Should we actually send the non-trickle ICE candidates since we have
  //          the session details from the negotiation stats?
  sessionDescription.sdp.split('m=').forEach(function (lines, index) {
    if (['audio', 'video', 'application'].indexOf(lines.split(' ')[0]) === -1) {
      return;
    }

    var sdpMid = null;
    var candidates = [];

    lines.split('\r\n').forEach(function (line) {
      // Parse the a=mid:xxx line.
      if (line.indexOf('a=mid:') === 0) {
        sdpMid = (lines.split('a=mid:')[1] || '').split('\r\n')[0];
      // Parse the ICE candidate (a=candidate:xxx xxx) line. It is returned as (candidate:xxxx xx) in trickle ICE format.
      } else if (line.indexOf('a=candidate:') === 0) {
        candidates.push(line.replace(/a=/g, ''));
      }
    });

    candidates.forEach(function (candidate, canIndex) {
      var candidateId = sdpMid + '-' + canIndex;

      self._handleStatsIceCandidate(self.CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS, peerId, candidateId, {
        sdpMid: sdpMid,
        sdpMLineIndex: index - 1,
        candidate: candidate
      });
    });
  });
};

/**
 * Function that handles the posting of peer connection negotiation (POST /stats/client/negotiation) stats.
 * @method _handleStatsNegotiation
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsNegotiation = function(state, peerId, sessionDescription, error) {
  var self = this;
  var statsObject = {
    peer_id: peerId,
    state: state,
    weight: self._peerPriorityWeight,
    sdp_type: (sessionDescription && sessionDescription.type) || null,
    sdp_sdp: (sessionDescription && sessionDescription.sdp) || null,
    error: error || null
  };

  self._postStatsToApi('/stats/client/negotiation', statsObject);
};

/**
 * Function that handles the posting of peer connection bandwidth (POST /stats/client/bandwidth) stats.
 * @method _handleStatsBandwidth
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsBandwidth = function (peerId) {
  var self = this;
  var statsObject = {
    peer_id: peerId,
    audio: {
      send: {},
      recv: {}
    },
    video: {
      send: {},
      recv: {}
    }
  };

  self._retrieveStats(peerId, function (error, stats) {
    var stream =
      (self._streams.screenshare && self._streams.screenshare.stream) ||
      (self._streams.userMedia && self._streams.userMedia.stream) || null;

    stats = stats || { audio: { sending: {}, receiving: {} }, video: { sending: {}, receiving: {} } };
    statsObject.error = (error && error.message) || null;

    ['audio', 'video'].forEach(function (mediaType) {
      ['send', 'recv'].forEach(function (directionType) {
        // Stats: Send (audio/video) + Recv (audio/video)
        var statsDirectionType = directionType === 'send' ? 'sending' : 'receiving';

        statsObject[mediaType][directionType].bytes = stats[mediaType][statsDirectionType].bytes || 0;
        statsObject[mediaType][directionType].packets = stats[mediaType][statsDirectionType].packets || 0;
        statsObject[mediaType][directionType].nacks = stats[mediaType][statsDirectionType].nacks || 0;

        // Stats: Send (audio/video)
        if (directionType === 'send') {
          var track = stream && stream[mediaType === 'audio' ? 'getAudioTracks' : 'getVideoTracks']()[0];

          statsObject[mediaType].send.muted = track ? track.muted : null;
          statsObject[mediaType].send.round_trip_time = stats[mediaType].sending.rtt;

          // TO CHECK: These are fields not documented in specs.
          // Stats: Send (audio)
          if (mediaType === 'audio') {
            statsObject.audio.send.echoReturnLoss = stats.audio.sending.echoReturnLoss;
            statsObject.audio.send.echoReturnLossEnhancement = stats.audio.sending.echoReturnLossEnhancement;

          // Stats: Send (video)
          } else {
            statsObject.video.send.framesEncoded = stats.video.sending.framesEncoded;
            statsObject.video.send.framesDropped = stats.video.sending.framesDropped;
            statsObject.video.send.frameHeight = stats.video.sending.frameHeight;
            statsObject.video.send.frameWidth = stats.video.sending.frameWidth;
            statsObject.video.send.frameRate = stats.video.sending.frameRate;
            statsObject.video.send.firs = stats.video.sending.firs;
            statsObject.video.send.plis = stats.video.sending.plis;
            statsObject.video.send.moz_frameRateMean = stats.video.sending.frameRateMean;
            statsObject.video.send.moz_frameRateStdDev = stats.video.sending.frameRateStdDev;
            statsObject.video.send.goog_frameRateInput = stats.video.sending.frameRateInput;
            statsObject.video.send.goog_frameRateSent = stats.video.sending.frameRateSent;
            statsObject.video.send.goog_cpuLimitedResolution = stats.video.sending.cpuLimitedResolution;
            statsObject.video.send.goog_bandwidthLimitedResolution = stats.video.sending.bandwidthLimitedResolution;
          }

        // Stats: Recv (audio/video)
        } else {
          statsObject[mediaType].recv.jitter = stats[mediaType].receiving.jitter;
          statsObject[mediaType].recv.packets_lost = stats[mediaType].receiving.packetsLost;

          // Stats: Recv (video)
          if (mediaType === 'video') {
            statsObject.video.recv.framesDecoded = stats.video.receiving.framesDecoded;
            statsObject.video.recv.frameHeight = stats.video.receiving.frameHeight;
            statsObject.video.recv.frameWidth = stats.video.receiving.frameWidth;
            statsObject.video.recv.frameRate = stats.video.receiving.frameRate;
            statsObject.video.recv.firs = stats.video.receiving.firs;
            statsObject.video.recv.plis = stats.video.receiving.plis;
            statsObject.video.recv.qpSum = stats.video.receiving.qpSum;
            statsObject.video.recv.goog_frameRateInput = stats.video.receiving.frameRateOutput;
            statsObject.video.recv.goog_frameRateSent = stats.video.receiving.frameRateReceived;
          }
        }
      });
    });

    self._postStatsToApi('/stats/client/bandwidth', statsObject);
  }, true);
};

/**
 * Function that handles the posting of recording states (POST /stats/client/recording) stats.
 * @method _handleStatsRecording
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsRecording = function(state, recordingId, recordings, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    state: state,
    recording_id: recordingId || null,
    recordings: recordings,
    error: error || null
  };

  self._postStatsToApi('/stats/client/recording', statsObject);
};


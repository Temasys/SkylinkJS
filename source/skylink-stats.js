/**
 * Function that sends the stats to the API server.
 * @method _postStatsToServer
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._postStats = function (endpoint, params) {
  var self = this;
  if(self._initOptions.enableStatsGathering){
    params.client_id = ((self._user && self._user.uid) || 'dummy') + '_' + self._statIdRandom;
    params.app_key = self._initOptions.appKey;
    params.timestamp = (new Date()).toISOString();

    // Simply post the data directly to the API server without caring if it is successful or not.
    try {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function () { };
      xhr.open('POST', 'https://api.temasys.io' + endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify(params));

    } catch (error) {
      log.error([null, 'XMLHttpRequest', "POST", 'Error in posting stats data ->'], error);
    }
  }
};

/**
 * Function that handles the posting of client information.
 * @method _handleClientStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleClientStats = function() {
  var self = this;
  var statsObject = {
    username: (self._user && self._user.uid) || null,
    sdk_name: 'web',
    sdk_version: self.VERSION,
    agent_name: AdapterJS.webrtcDetectedBrowser,
    agent_version: AdapterJS.webrtcDetectedVersion,
    agent_platform: navigator.platform,
    agent_plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null
  };

  self._postStats('/rest/stats/client', statsObject);
};

/**
 * Function that handles the posting of session states.
 * @method _handleSessionStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleSessionStats = function(message) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: (self._user && self._user.sid) || null,
    state: message.type,
    contents: message
  };

  self._postStats('/rest/stats/session', statsObject);
};

/**
 * Function that handles the posting of app key authentication states.
 * @method _handleAuthStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleAuthStats = function(state, result, status, error) {
  var self = this;
  var statsObject = {
    room_id: (result && result.room_key) || null,
    state: state,
    http_status: status,
    http_error: (typeof error === 'string' ? error : (error && error.message)) || null,
    api_url: self._path,
    api_result: result
  };

  self._postStats('/rest/stats/auth', statsObject);
};

/**
 * Function that handles the posting of socket connection states.
 * @method _handleSignalingStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleSignalingStats = function(state, retries, error) {
  var self = this;
  var socketSession = clone(self._socketSession);
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: (self._user && self._user.sid) || null,
    state: state,
    signaling_url: socketSession.socketServer,
    signaling_transport: socketSession.transportType.toLowerCase(),
    // Use the retries from the function itself to prevent non-sequential event calls issues.
    attempts: retries,
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  self._postStats('/rest/stats/client/signaling', statsObject);
};

/**
 * Function that handles the posting of peer ICE connection states.
 * @method _handleIceConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleIceConnectionStats = function(state, peerId) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    local_candidate: {},
    remote_candidate: {}
  };
  var postData = [];
  // Set a timeout to pause process to ensure the stats retrieval does not run at the same time
  // when the state is triggered, so that the selected ICE candidate pair information can be returned.
  setTimeout(function () {
    self._retrieveStats(peerId, function (error, stats) {
      if (stats) {
        // Parse the selected ICE candidate pair for both local and remote candidate.
        ['local', 'remote'].forEach(function (dirType) {
          var candidate = stats.selectedCandidate[dirType];

          if (candidate) {
            statsObject[dirType + '_candidate'].ip_address = candidate.ipAddress || null;
            statsObject[dirType + '_candidate'].port_number = candidate.portNumber || null;
            statsObject[dirType + '_candidate'].candidate_type = candidate.candidateType || null;
            statsObject[dirType + '_candidate'].protocol = candidate.transport || null;
            statsObject[dirType + '_candidate'].priority = candidate.priority || null;

            // This is only available for the local ICE candidate.
            if (dirType === 'local') {
              statsObject.local_candidate.network_type = candidate.networkType || null;
            }
          }
        });
      }
      postData.push(statsObject);

    }, true);

    if(postData.length>9){
      self._postStats('/rest/stats/client/iceconnection', postData);
      postData = [];
    }
  }, 1000);

};

/**
 * Function that handles the posting of peer local/remote ICE candidate processing states.
 * @method _handleIceCandidateStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleIceCandidateStats = function(state, peerId, candidateId, candidate, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    is_remote: !!candidateId,
    candidate_id: candidateId || null,
    candidate_sdp_mid: candidate.sdpMid,
    candidate_sdp_mindex: candidate.sdpMLineIndex,
    candidate_candidate: candidate.candidate,
    error: (typeof error === 'string' ? error : (error && error.message)) || null,
  };
  self._manageStatsBuffer('iceCandidate', statsObject, '/rest/stats/client/icecandidate');
};

/**
 * Function that handles the posting of peer local/remote ICE gathering states.
 * @method _handleIceGatheringStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleIceGatheringStats = function(state, peerId, isRemote) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    is_remote: isRemote
  };
  self._manageStatsBuffer('iceGathering', statsObject, '/rest/stats/client/icegathering');
};

/**
 * Function that handles the posting of peer connection negotiation states.
 * @method _handleNegotiationStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleNegotiationStats = function(state, peerId, sdpOrMessage, isRemote, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    is_remote: isRemote,
    // Currently sharing a parameter "sdpOrMessage" that indicates a "welcome" message
    // or session description to save parameters length.
    weight: sdpOrMessage.weight,
    sdp_type: null,
    sdp_sdp: null,
    error: (typeof error === 'string' ? error : (error && error.message)) || null,
  };

  // Retrieve the weight for states where the "weight" field is not available.
  if (['enter', 'welcome', 'restart'].indexOf(state) === -1) {
    // Retrieve the peer's weight if it from remote end.
    statsObject.weight = self.getPeerInfo(isRemote ? peerId : undefined).config.priorityWeight;
    statsObject.sdp_type = (sdpOrMessage && sdpOrMessage.type) || null;
    statsObject.sdp_sdp = (sdpOrMessage && sdpOrMessage.sdp) || null;
  }
  self._manageStatsBuffer('negotiation', statsObject, '/rest/stats/client/negotiation');
};

/**
 * Function that handles the posting of peer connection bandwidth information.
 * @method _handleBandwidthStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleBandwidthStats = function (peerId) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    audio_send: { tracks: [] },
    audio_recv: {},
    video_send: { tracks: [] },
    video_recv: {}
  };

  var useStream = self._streams.screenshare || self._streams.userMedia || null;
  var mutedStatus = self.getPeerInfo().mediaStatus;

  // When stream is available, format the stream tracks information.
  // The SDK currently only allows sending of 1 stream at a time that has only 1 audio and video track each.
  if (useStream) {
    // Parse the audio track if it exists only.
    if (useStream.tracks.audio) {
      statsObject.audio_send.tracks = [{
        stream_id: useStream.id,
        id: useStream.tracks.audio.id,
        label: useStream.tracks.audio.label,
        muted: mutedStatus.audioMuted
      }];
    }

    // Parse the video track if it exists only.
    if (useStream.tracks.video) {
      statsObject.video_send.tracks = [{
        stream_id: useStream.id,
        id: useStream.tracks.video.id,
        label: useStream.tracks.video.label,
        height: useStream.tracks.video.height,
        width: useStream.tracks.video.width,
        muted: mutedStatus.videoMuted
      }];
    }
  }

  self._retrieveStats(peerId, function (error, stats) {
    if (error) {
      statsObject.error = error && error.message;
      stats = {
        audio: { sending: {}, receiving: {} },
        video: { sending: {}, receiving: {} }
      };
    }

    // Common function to parse and handle any `null`/`undefined` values.
    var formatValue = function (mediaType, directionType, itemKey) {
      var value = stats[mediaType][directionType === 'send' ? 'sending' : 'receiving'][itemKey];
      if (['number', 'string', 'boolean'].indexOf(typeof value) > -1) {
        return value;
      }
      return null;
    };

    // Parse bandwidth information for sending audio packets.
    statsObject.audio_send.bytes = formatValue('audio', 'send', 'bytes');
    statsObject.audio_send.packets = formatValue('audio', 'send', 'packets');
    statsObject.audio_send.round_trip_time = formatValue('audio', 'send', 'rtt');
    statsObject.audio_send.nack_count = formatValue('audio', 'send', 'nacks');
    statsObject.audio_send.echo_return_loss = formatValue('audio', 'send', 'echoReturnLoss');
    statsObject.audio_send.echo_return_loss_enhancement = formatValue('audio', 'send', 'echoReturnLossEnhancement');

    // Parse bandwidth information for receiving audio packets.
    statsObject.audio_recv.bytes = formatValue('audio', 'recv', 'bytes');
    statsObject.audio_recv.packets = formatValue('audio', 'recv', 'packets');
    statsObject.audio_recv.packets_lost = formatValue('audio', 'recv', 'packetsLost');
    statsObject.video_recv.packets_discarded = formatValue('audio', 'recv', 'packetsDiscarded');
    statsObject.audio_recv.jitter = formatValue('audio', 'recv', 'jitter');
    statsObject.audio_recv.nack_count = formatValue('audio', 'recv', 'nacks');

    // Parse bandwidth information for sending video packets.
    statsObject.video_send.bytes = formatValue('video', 'send', 'bytes');
    statsObject.video_send.packets = formatValue('video', 'send', 'packets');
    statsObject.video_send.round_trip_time = formatValue('video', 'send', 'rtt');
    statsObject.video_send.nack_count = formatValue('video', 'send', 'nacks');
    statsObject.video_send.firs_count = formatValue('video', 'send', 'firs');
    statsObject.video_send.plis_count = formatValue('video', 'send', 'plis');
    statsObject.video_send.frames = formatValue('video', 'send', 'frames');
    statsObject.video_send.frames_encoded = formatValue('video', 'send', 'framesEncoded');
    statsObject.video_send.frames_dropped = formatValue('video', 'send', 'framesDropped');
    statsObject.video_send.frame_width = formatValue('video', 'send', 'frameWidth');
    statsObject.video_send.frame_height = formatValue('video', 'send', 'frameHeight');
    statsObject.video_send.framerate = formatValue('video', 'send', 'frameRate');
    statsObject.video_send.framerate_input = formatValue('video', 'send', 'frameRateInput');
    statsObject.video_send.framerate_encoded = formatValue('video', 'send', 'frameRateEncoded');
    statsObject.video_send.framerate_mean = formatValue('video', 'send', 'frameRateMean');
    statsObject.video_send.framerate_std_dev = formatValue('video', 'send', 'frameRateStdDev');
    statsObject.video_send.cpu_limited_resolution = formatValue('video', 'send', 'cpuLimitedResolution');
    statsObject.video_send.bandwidth_limited_resolution = formatValue('video', 'send', 'bandwidthLimitedResolution');

    // Parse bandwidth information for receiving video packets.
    statsObject.video_recv.bytes = formatValue('video', 'recv', 'bytes');
    statsObject.video_recv.packets = formatValue('video', 'recv', 'packets');
    statsObject.video_recv.packets_lost = formatValue('video', 'recv', 'packetsLost');
    statsObject.video_recv.packets_discarded = formatValue('video', 'recv', 'packetsDiscarded');
    statsObject.video_recv.jitter = formatValue('video', 'recv', 'jitter');
    statsObject.video_recv.nack_count = formatValue('video', 'recv', 'nacks');
    statsObject.video_recv.firs_count = formatValue('video', 'recv', 'firs');
    statsObject.video_recv.plis_count = formatValue('video', 'recv', 'plis');
    statsObject.video_recv.frames = formatValue('video', 'recv', 'frames');
    statsObject.video_recv.frames_decoded = formatValue('video', 'recv', 'framesDecoded');
    statsObject.video_recv.frame_width = formatValue('video', 'recv', 'frameWidth');
    statsObject.video_recv.frame_height = formatValue('video', 'recv', 'frameHeight');
    statsObject.video_recv.framerate = formatValue('video', 'recv', 'frameRate');
    statsObject.video_recv.framerate_output = formatValue('video', 'recv', 'frameRateOutput');
    statsObject.video_recv.framerate_decoded = formatValue('video', 'recv', 'frameRateDecoded');
    statsObject.video_recv.framerate_mean = formatValue('video', 'recv', 'frameRateMean');
    statsObject.video_recv.framerate_std_dev = formatValue('video', 'recv', 'frameRateStdDev');
    statsObject.video_recv.qp_sum = formatValue('video', 'recv', 'qpSum');
    self._postStats('/rest/stats/client/bandwidth', statsObject);
  }, true);
};

/**
 * Function that handles the posting of recording states.
 * @method _handleRecordingStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleRecordingStats = function(state, recordingId, recordings, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    state: state,
    recording_id: recordingId || null,
    recordings: recordings,
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  self._postStats('/rest/stats/client/recording', statsObject);
};

/**
 * Function that handles the posting of datachannel states.
 * @method _handleDatachannelStats
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleDatachannelStats = function(state, peerId, channel, channelProp, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    channel_id: channel && channel.id,
    channel_label: channel && channel.label,
    channel_type: channelProp === 'main' ? 'persistent' : 'temporal',
    channel_binary_type: channel && channel.binaryType,
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  if (channel && AdapterJS.webrtcDetectedType === 'plugin') {
    statsObject.channel_binary_type = 'int8Array';

    // For IE 10 and below browsers, binary support is not available.
    if (AdapterJS.webrtcDetectedBrowser === 'IE' && AdapterJS.webrtcDetectedVersion < 11) {
      statsObject.channel_binary_type = 'none';
    }
  }

  self._postStats('/rest/stats/client/datachannel', statsObject);
};

Skylink.prototype._stats_buffer = {};
/**
 * Function that handles buffer of stats data
 * @method _handleDatachannelStats
 * @private
 * @for Skylink
 * @since 0.6.35
 */
Skylink.prototype._manageStatsBuffer = function(operation, data, url){
  var self = this;
  if(self._stats_buffer[operation] === undefined){
    self._stats_buffer[operation] = {};
    self._stats_buffer[operation].url = url;
    self._stats_buffer[operation].data = [];
  }
  self._stats_buffer[operation].data.push(data);
  setInterval(function () {
    for (var key in self._stats_buffer) {
      if (self._stats_buffer[key]["data"].length > 0) {
        self._postStats(self._stats_buffer[key]["url"], self._stats_buffer[key]["data"]);
        self._stats_buffer[key]["data"] = [];
      }
    }
  }, 5000);
};

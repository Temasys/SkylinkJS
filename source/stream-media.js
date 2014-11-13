/**
 * The list of recommended video resolutions.
 * - Note that the higher the resolution, the connectivity speed might
 *   be affected.
 * - The available video resolutions type are:
 * @param {JSON} QVGA QVGA video resolution.
 * @param {Integer} QVGA.width 320
 * @param {Integer} QVGA.height 180
 * @param {JSON} VGA VGA video resolution.
 * @param {Integer} VGA.width 640
 * @param {Integer} VGA.height 360
 * @param {JSON} HD HD video quality
 * @param {Integer} HD.width 1280
 * @param {Integer} HD.height 720
 * @param {JSON} FHD Might not be supported. Full HD video resolution.
 * @param {Integer} FHD.width 1920
 * @param {Integer} FHD.height 1080
 * @attribute VIDEO_RESOLUTION
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QVGA: {
    width: 320,
    height: 180
  },
  VGA: {
    width: 640,
    height: 360
  },
  HD: {
    width: 1280,
    height: 720
  },
  FHD: {
    width: 1920,
    height: 1080
  } // Please check support
};

/**
 * The user stream settings.
 * @attribute _streamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio
 * @param {Boolean} [audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [video=false] This call requires video
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [video.resolution.width] Video width
 * @param {Integer} [video.resolution.height] Video height
 * @param {Integer} [video.frameRate] Mininum frameRate of Video
 * @param {String} [bandwidth] Bandwidth settings
 * @param {String} [bandwidth.audio] Audio Bandwidth
 * @param {String} [bandwidth.video] Video Bandwidth
 * @param {String} [bandwidth.data] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamSettings = {};

/**
 * Fallback to audio call if audio and video is required.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Access to user's MediaStream is successful.
 * @method _onUserMediaSuccess
 * @param {MediaStream} stream MediaStream object.
 * @trigger mediaAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);
  self._trigger('mediaAccessSuccess', stream);

  // check if readyStateChange is done
  self._condition('readyStateChange', function () {
    self._user.streams[stream.id] = stream;
    self._user.streams[stream.id].active = true;

    // check if users is in the room already
    self._condition('peerJoined', function () {
      self._trigger('incomingStream', self._user.sid, stream, true, self._user.info);
    }, function () {
      return self._inRoom;
    }, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Access to user's MediaStream failed.
 * @method _onUserMediaError
 * @param {Object} error Error object that was thrown.
 * @trigger mediaAccessFailure
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error) {
  var self = this;
  log.error([null, 'MediaStream', 'Failed retrieving stream:'], error);
  if (self._audioFallback && self._streamSettings.video) {
    // redefined the settings for video as false
    self._streamSettings.video = false;
    // prevent undefined error
    self._user = self._user || {};
    self._user.info = self._user.info || {};
    self._user.info.settings = self._user.info.settings || {};
    self._user.info.settings.video = false;

    log.debug([null, 'MediaStream', null, 'Falling back to audio stream call']);
    window.getUserMedia({
      audio: true
    }, function(stream) {
      self._onUserMediaSuccess(stream);
    }, function(error) {
      log.error([null, 'MediaStream', null,
        'Failed retrieving audio in audio fallback:'], error);
      self._trigger('mediaAccessError', error);
    });
    this.getUserMedia({ audio: true });
  } else {
    log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
   self._trigger('mediaAccessError', error);
  }
};

/**
 * The remote peer advertised streams, that we are forwarding to the app. This is part
 * of the peerConnection's addRemoteDescription() API's callback.
 * @method _onRemoteStreamAdded
 * @param {String} targetMid PeerId of the peer that has remote stream to send.
 * @param {Event}  event This is provided directly by the peerconnection API.
 * @trigger incomingStream
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, event) {
  if(targetMid !== 'MCU') {
    if (!this._peerInformations[targetMid]) {
      log.error([targetMid, 'MediaStream', event.stream.id,
          'Received remote stream when peer is not connected. ' +
          'Ignoring stream ->'], event.stream);
      return;
    }
    if (!this._peerInformations[targetMid].settings.audio &&
      !this._peerInformations[targetMid].settings.video) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Receive remote stream but ignoring stream as it is empty ->'
        ], event.stream);
      return;
    }
    log.log([targetMid, 'MediaStream', event.stream.id,
      'Received remote stream ->'], event.stream);
    this._trigger('incomingStream', targetMid, event.stream,
      false, this._peerInformations[targetMid]);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires audio
 * @param {Boolean} [options.stereo=false] Enabled stereo or not.
 * @return {JSON} The parsed audio options.
 * - settings: User set audio options
 * - userMedia: getUserMedia options
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseAudioStreamSettings = function (audioOptions) {
  audioOptions = (typeof audioOptions === 'object') ?
    audioOptions : !!audioOptions;

  // Cleaning of unwanted keys
  if (audioOptions !== false) {
    audioOptions = (typeof audioOptions === 'boolean') ? {} : audioOptions;
    var tempAudioOptions = {};
    tempAudioOptions.stereo = audioOptions.stereo || false;
    audioOptions = tempAudioOptions;
  }

  var userMedia = (typeof audioOptions === 'object') ?
    true : audioOptions;

  return {
    settings: audioOptions,
    userMedia: userMedia
  };
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires video
 * @param {JSON} [options.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.resolution.width=serverDefault] Video width
 * @param {Integer} [options.resolution.height=serverDefault] Video height
 * @param {Integer} [options.frameRate=50] Mininum frameRate of Video
 * @return {JSON} The parsed video options.
 * - settings: User set video options
 * - userMedia: getUserMedia options
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseVideoStreamSettings = function (videoOptions) {
  videoOptions = (typeof videoOptions === 'object') ?
    videoOptions : !!videoOptions;

  var userMedia = false;

  // Cleaning of unwanted keys
  if (videoOptions !== false) {
    videoOptions = (typeof videoOptions === 'boolean') ?
      { resolution: {} } : videoOptions;
    var tempVideoOptions = {};
    // set the resolution
    tempVideoOptions.resolution = tempVideoOptions.resolution || {};
    tempVideoOptions.resolution.width = videoOptions.resolution.width ||
      this._room.mediaConstraints.mandatory.maxWidth;
    tempVideoOptions.resolution.height = videoOptions.resolution.height ||
      this._room.mediaConstraints.mandatory.maxHeight;
    // set the framerate
    tempVideoOptions.frameRate = videoOptions.frameRate || 50;
    videoOptions = tempAudioOptions;

    userMedia = {
      mandatory: {
        maxWidth: videoOptions.resolution.width,
        maxHeight: videoOptions.resolution.height
      },
      optional: [{ minFrameRate: videoOptions.framerate }]
    };
  }

  return {
    settings: videoOptions,
    userMedia: userMedia
  };
};

/**
 * Parse and set bandwidth settings.
 * @method _parseBandwidth
 * @param {String} [options] Bandwidth settings
 * @param {String} [options.audio=50] Audio Bandwidth
 * @param {String} [options.video=256] Video Bandwidth
 * @param {String} [options.data=1638400] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseBandwidth = function (bwOptions) {
  bwOptions = (typeof bwOptions === 'object') ?
    bwOptions : {};

  // set audio bandwidth
  bwOptions.audio = (typeof bwOptions.audio === 'number') ?
    bwOptions.audio : 50;
  // set video bandwidth
  bwOptions.video = (typeof bwOptions.video === 'number') ?
    bwOptions.video : 256;
  // set data bandwidth
  bwOptions.data = (typeof bwOptions.data === 'number') ?
    bwOptions.data : 1638400;

  // set the settings
  this._streamSettings.bandwidth = bwOptions;
  this._user.info.settings.bandwidth = bwOptions;
};

/**
 * Parse stream settings
 * @method _parseBandwidthSettings
 * @param {JSON} [options] The stream settings
 * @param {Boolean} [options.audio] Is audio enabled.
 * @param {Boolean} [options.video] Is video enabled.
 * @param {JSON} [muted] The muted settings
 * @param {Boolean} [muted.audio] Is audio muted.
 * @param {Boolean} [muted.video] Is video muted.
 * @return {JSON} The parsed muted options.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMutedSettings = function (options, muted) {
  options = (typeof options === 'object') ?
    options : { audio: false, video: false };

  return {
    audioMuted: (!options.audio) ? true : !!muted.audio,
    videoMuted: (!options.video) ? true : !!muted.video
  };
};

/**
 * Parse stream settings
 * @method _parseMediaSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate=50] Mininum frameRate of video.
 * @return {Boolean} Is there any stream audio or video changes.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMediaSettings = function(options) {
  var hasMediaChanged = false;

  options = options || {};

  log.debug('Parsing stream settings. Stream options:', options);

  this._user.info = this._user.info || {};
  this._user.info.settings = this._user.info.settings || {};
  this._user.info.mediaStatus = this._user.info.mediaStatus || {};

  // Set audio settings
  var audioSettings = this._parseAudioStreamSettings(options.audio ||
    this._streamSettings.audio);
  // check for change
  if (audioSettings.settings !== this._streamSettings.audio) {
    hasMediaChanged = true;
    this._streamSettings.audio = audioSettings.settings;
    this._user.info.settings.audio = audioSettings.userMedia;
  }

  // Set video settings
  var videoSettings = this._parseVideoStreamSettings(options.video ||
    this._streamSettings.video);
  // check for change
  if (videoSettings.settings !== this._streamSettings.video) {
    hasMediaChanged = true;
    this._streamSettings.video = videoSettings.settings;
    this._user.info.settings.video = videoSettings.userMedia;
  }

  // Set user media status options
  var mutedSettings = this._parseMutedSettings({
    video: !!videoSettings.settings,
    audio: !!audioSettings.settings
  }, this._user.info.mediaStatus);
  this._user.info.settings.mediaStatus = mutedSettings;

  log.debug('Parsed user stream settings', this._user.info);
  log.debug('User media status:', {
    audioMuted: options.audioMuted,
    videoMuted: options.videoMuted
  });

  return hasMediaChanged;
};

/**
 * Sends our Local MediaStreams to other Peers.
 * By default, it sends all it's other stream
 * @method _addLocalMediaStreams
 * @param {String} peerId PeerId of the peer to send local stream to.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  log.log([peerId, null, null, 'Adding local stream']);
  if (Object.keys(this._user.streams).length > 0) {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        if (this._user.streams[stream].active) {
          this._peerConnections[peerId].addStream(this._user.streams[stream]);
          log.debug([peerId, 'MediaStream', stream, 'Sending stream']);
        }
      }
    }
  } else {
    log.warn([peerId, null, null, 'No media to send. Will be only receiving']);
  }
};

/**
 * Handles the muting of audio and video streams.
 * @method _muteLocalMediaStreams
 * @param {JSON} options The options to mute or unmuted audio or video streams.
 * @param {Boolean} [options.audio=false] To mute audio or not.
 * @param {Boolean} [options.video=false] To mute video or not.
 * @trigger peerUpdated, peerRestart
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._muteLocalMediaStreams = function (mutedOptions) {
  if (!this._user) {
    log.error('Skylink not ready for communications yet. Cannot set audio stream');
    return;
  }
  var hasAudioStream = false;
  var hasVideoStream = false;
  var toMuteAudio = mutedOptions.audio ||
    !!this._user.settings.mediaStatus.audioMuted || false;
  var toMuteVideo = mutedOptions.video ||
    !!this._user.settings.mediaStatus.audioMuted || false;

  // to prevent undefined error
  this._user.info = this._user.info || {};
  this._user.info.settings = this._user.info.settings || {};
  this._user.info.settings.mediaStatus = this._user.info.settings.mediaStatus || {};

  // Loop and enable tracks accordingly
  for (var streamId in this._user.streams) {
    if (this._user.streams.hasOwnProperty(streamId)) {
      var audioTracks = this._user.streams[streamId].getAudioTracks();
      var videoTracks = this._user.streams[streamId].getVideoTracks();

      hasAudioStream = audioTracks.length > 0 || hasAudioStream;
      hasVideoStream = videoTracks.length > 0 || hasVideoStream;

      // loop audio tracks
      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].enabled = !toMuteAudio;
      }
      // loop video tracks
      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].enabled = !toMuteVideo;
      }
    }
  }
  log.log('Update to isAudioMuted status ->', toMuteAudio);
  log.log('Update to isVideoMuted status ->', toMuteVideo);

  var hasAudioMutedStatusChanged = this._user.info.settings.mediaStatus.audioMuted !== toMutedAudio;
  var hasVideoMutedStatusChanged = this._user.info.settings.mediaStatus.videoMuted !== toMutedVideo;

  // set the settings
  this._user.info.settings.mediaStatus.audioMuted = toMuteAudio;
  this._user.info.settings.mediaStatus.videoMuted = toMuteVideo;

  // Broadcast to other peers
  if (this._inRoom) {
    if (hasAudioMutedStatusChanged) {
      this._sendChannelMessage({
        type: this._SIG_MESSAGE_TYPE.MUTE_AUDIO,
        mid: this._user.sid,
        rid: this._room.id,
        muted: toMuteAudio
      });
    }
    if (hasVideoMutedStatusChanged) {
      this._sendChannelMessage({
        type: this._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: this._user.sid,
        rid: this._room.id,
        muted: toMuteVideo
      });
    }
    this._trigger('peerUpdated', this._user.sid, this._user.info, true);
  }
};

/**
 * Waits for MediaStream.
 * - Once the stream is loaded, callback is called
 * - If there's not a need for stream, callback is called
 * @method _waitForLocalMediaStream
 * @param {Function} callback Callback after requested constraints are loaded.
 * @param {JSON} [options] Media Constraints.
 * @param {JSON} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio=50] Audio Bandwidth
 * @param {String} [options.bandwidth.video=256] Video Bandwidth
 * @param {String} [options.bandwidth.data=1638400] Data Bandwidth
 * @trigger mediaAccessRequired
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForLocalMediaStream = function(callback, options) {
  var self = this;
  options = options || {};

  // parse user data settings
  self._parseUserData(options.userData);
  self._parseBandwidth(options.bandwidth);

  // get the stream
  if (options.manualGetUserMedia === true) {
    self._trigger('mediaAccessRequired');
    getUserMedia({
      audio: options.audio,
      video: options.video
    });
  }
  // If options video or audio false, do the opposite to throw a true.
  var requireAudio = !!this._streamSettings.audio;
  var requireVideo = !!this._streamSettings.video;

  log.log('Requested audio:', requireAudio);
  log.log('Requested video:', requireVideo);

  // check if it requires audio or video
  if (requireAudio || requireVideo) {
    self._wait(function () {
      callback();

    }, function () {
      var hasAudio = !requireAudio;
      var hasVideo = !requireVideo;

      // for now we require one MediaStream with both audio and video
      // due to firefox non-supported audio or video
      for (var streamId in self._user.streams) {
        if (self._user.streams.hasOwnProperty(streamId)) {
          var stream = self._user.streams[streamId];

          // do the check
          if (requireAudio) {
            hasAudio = stream.getAudioTracks().length > 0;
          }
          if (requireVideo) {
            hasVideo =  stream.getVideoTracks().length > 0;
          }
          if (hasAudio && hasVideo) {
            return true;
          }
        }
      }
    });
  } else {
    callback();
  }
};

/**
 * Gets the default video source and microphone source.
 * - This is an implemented function for Skylink.
 * - Constraints are not the same as the [MediaStreamConstraints](http://dev.w3.
 *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
 *   -mediastreamconstraints-members) specified in the w3c specs.
 * @method getUserMedia
 * @param {JSON} [options]  MediaStream constraints.
 * @param {JSON|Boolean} [options.audio=true] Option to allow audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate=50]
 *   The video stream mininum frameRate.
 * @example
 *   // Default is to get both audio and video
 *   // Example 1: Get both audio and video by default.
 *   SkylinkDemo.getUserMedia();
 *
 *   // Example 2: Get the audio stream only
 *   SkylinkDemo.getUserMedia({
 *     'video' : false,
 *     'audio' : true
 *   });
 *
 *   // Example 3: Set the stream settings for the audio and video
 *   SkylinkDemo.getUserMedia({
 *     'video' : {
 *        'resolution': SkylinkDemo.VIDEO_RESOLUTION.HD,
 *        'frameRate': 50
 *      },
 *     'audio' : {
 *       'stereo': true
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.getUserMedia = function(options) {
  var self = this;
  // this will fix the self._user.info.settings undefined error
  var hasMediaChanged = self._parseMediaSettings(options);

  if (hasMediaChanged) {
    try {
      window.getUserMedia({
        audio: self._streamSettings.audio,
        video: self._streamSettings.video

      }, function(stream) {
        self._onUserMediaSuccess(stream);

      }, function(error) {
        self._onUserMediaError(error);
      });

    } catch (error) {
      self._onUserMediaError(error);
    }
  } else {
    log.warn([null, 'MediaStream', null, 'Not retrieving stream']);
  }

  /*// called during joinRoom
  if (self._user.info.settings) {
    // So it would invoke to getMediaStream defaults
    if (!options.video && !options.audio) {
      log.info('No audio or video stream is requested');
    } else if (self._user.info.settings.audio !== options.audio ||
      self._user.info.settings.video !== options.video) {
      if (Object.keys(self._user.streams).length > 0) {
        // NOTE: User's stream may hang.. so find a better way?
        // NOTE: Also make a use case for multiple streams?
        getStream = self._setLocalMediaStreams(options);
        if (getStream) {
          // NOTE: When multiple streams, streams should not be cleared.
          self._user.streams = [];
        }
      } else {
        getStream = true;
      }
    }
  } else { // called before joinRoom
    getStream = true;
  }
  self._parseStreamSettings(options);
  if (getStream) {

  } else if (Object.keys(self._user.streams).length > 0) {
    log.log([null, 'MediaStream', null,
      'User has already this mediastream. Reactiving media']);
  } else {
  }*/
};

/**
 * Enable microphone.
 * - Try to start the audio source.
 * - If no audio source was initialy set, this function has no effect.
 * - If you want to activate your audio but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the audio parameter to true.
 * @method enableAudio
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @example
 *   SkylinkDemo.enableAudio();
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this._handleLocalMediaStreams('audio', true);
};

/**
 * Disable microphone.
 * - Try to disable the microphone.
 * - If no microphone was initially set, this function has no effect.
 * @method disableAudio
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this._handleLocalMediaStreams('audio', false);
};

/**
 * Enable webcam video.
 * - Try to start the video source.
 * - If no video source was initialy set, this function has no effect.
 * - If you want to activate your video but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the video parameter to true.
 * @method enableVideo
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this._handleLocalMediaStreams('video', true);
};

/**
 * Disable video source.
 * - Try to disable the video source.
 * - If no video source was initially set, this function has no effect.
 * @method disableVideo
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this._handleLocalMediaStreams('video', false);
};
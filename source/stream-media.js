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
 * @default {
 *   audio : false,
 *   video : false
 * }
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamSettings = {
  audio: false,
  video: false
};

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
  var checkReadyState = setInterval(function () {
    if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
      clearInterval(checkReadyState);
      self._user.streams[stream.id] = stream;
      self._user.streams[stream.id].active = true;
      var checkIfUserInRoom = setInterval(function () {
        if (self._inRoom) {
          clearInterval(checkIfUserInRoom);
          self._trigger('incomingStream', stream, self._user.sid, self._user.info, true);
        }
      }, 500);
    }
  }, 500);
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
    this._trigger('incomingStream', event.stream, targetMid, this._peerInformations[targetMid], false);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {JSON} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._parseStreamSettings = function(options) {
  options = options || {};
  log.debug('Parsing stream settings. Stream options:', options);
  this._user.info = this._user.info || {};
  this._user.info.settings = this._user.info.settings || {};
  this._user.info.mediaStatus = this._user.info.mediaStatus || {};
  // Set User
  this._user.info.userData = options.userData || this._user.info.userData || '';
  // Set Bandwidth
  this._streamSettings.bandwidth = options.bandwidth ||
    this._streamSettings.bandwidth || {};
  this._user.info.settings.bandwidth = options.bandwidth ||
    this._user.info.settings.bandwidth || {};
  // Set audio settings
  this._user.info.settings.audio = (typeof options.audio === 'boolean' ||
    typeof options.audio === 'object') ? options.audio :
    (this._streamSettings.audio || false);
  this._user.info.mediaStatus.audioMuted = (options.audio) ?
    ((typeof this._user.info.mediaStatus.audioMuted === 'boolean') ?
    this._user.info.mediaStatus.audioMuted : !options.audio) : true;
  // Set video settings
  this._user.info.settings.video = (typeof options.video === 'boolean' ||
    typeof options.video === 'object') ? options.video :
    (this._streamSettings.video || false);
  // Set user media status options
  this._user.info.mediaStatus.videoMuted = (options.video) ?
    ((typeof this._user.info.mediaStatus.videoMuted === 'boolean') ?
    this._user.info.mediaStatus.videoMuted : !options.video) : true;

  if (!options.video && !options.audio) {
    return;
  }
  // If undefined, at least set to boolean
  options.video = options.video || false;
  options.audio = options.audio || false;

  // Set Video
  if (typeof options.video === 'object') {
    if (typeof options.video.resolution === 'object') {
      var width = options.video.resolution.width;
      var height = options.video.resolution.height;
      var frameRate = (typeof options.video.frameRate === 'number') ?
        options.video.frameRate : 50;
      if (!width || !height) {
        options.video = true;
      } else {
        options.video = {
          mandatory: {
            minWidth: width,
            minHeight: height
          },
          optional: [{ minFrameRate: frameRate }]
        };
      }
    }
  }
  // Set Audio
  if (typeof options.audio === 'object') {
    options.stereo = (typeof options.audio.stereo === 'boolean') ?
      options.audio.stereo : false;
    options.audio = true;
  }
  // Set stream settings
  // use default video media size if no width or height provided
  this._streamSettings.video = (typeof options.video === 'boolean' && options.video) ?
    this._room.connection.mediaConstraints : options.video;
  this._streamSettings.audio = options.audio;
  this._streamSettings.stereo = options.stereo;

  log.debug('Parsed user stream settings', this._user.info);
  log.debug('User media status:', {
    audio: options.audioMuted,
    video: options.videoMuted
  });
};

/**
 * Opens or closes existing MediaStreams.
 * @method _setLocalMediaStreams
 * @param {JSON} options
 * @param {JSON} [options.audio=false] Enable audio or not
 * @param {JSON} [options.video=false] Enable video or not
 * @return {Boolean} Whether we should re-fetch mediaStreams or not
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalMediaStreams = function(options) {
  var hasAudioTracks = false, hasVideoTracks = false;
  if (!this._user) {
    log.error('User have no active streams');
    return;
  }
  for (var stream in this._user.streams) {
    if (this._user.streams.hasOwnProperty(stream)) {
      var audios = this._user.streams[stream].getAudioTracks();
      var videos = this._user.streams[stream].getVideoTracks();
      for (var audio in audios) {
        if (audios.hasOwnProperty(audio)) {
          audios[audio].enabled = options.audio;
          hasAudioTracks = true;
        }
      }
      for (var video in videos) {
        if (videos.hasOwnProperty(video)) {
          videos[video].enabled = options.video;
          hasVideoTracks = true;
        }
      }
      if (!options.video && !options.audio) {
        this._user.streams[stream].active = false;
      } else {
        this._user.streams[stream].active = true;
      }
    }
  }
  return ((!hasAudioTracks && options.audio) ||
    (!hasVideoTracks && options.video));
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
 * Handles all audio and video mute events.
 * - If there is no available audio or video stream, it will call
 *   {{#crossLink "Skylink/leaveRoom:method"}}leaveRoom(){{/crossLink}}
 *   and call {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   to join user in the room to send their audio and video stream.
 * @method _handleLocalMediaStreams
 * @param {String} mediaType Media types expected to receive.
 * - audio: Audio type of media to be handled.
 * - video: Video type of media to be handled.
 * @param {Boolean} [enableMedia=false] Enable it or disable it
 * @trigger peerUpdated
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._handleLocalMediaStreams = function(mediaType, enableMedia) {
  if (mediaType !== 'audio' && mediaType !== 'video') {
    return;
  } else if (!this._inRoom) {
    log.error('Failed ' + ((enableMedia) ? 'enabling' : 'disabling') +
      ' ' + mediaType + '. User is not in the room');
    return;
  }
  // Loop and enable tracks accordingly
  var hasTracks = false, isStreamActive = false;
  for (var stream in this._user.streams) {
    if (this._user.streams.hasOwnProperty(stream)) {
      var tracks = (mediaType === 'audio') ?
        this._user.streams[stream].getAudioTracks() :
        this._user.streams[stream].getVideoTracks();
      for (var track in tracks) {
        if (tracks.hasOwnProperty(track)) {
          tracks[track].enabled = enableMedia;
          hasTracks = true;
        }
      }
      isStreamActive = this._user.streams[stream].active;
    }
  }
  log.log('Update to is' + mediaType + 'Muted status ->', enableMedia);
  // Broadcast to other peers
  if (!(hasTracks && isStreamActive) && enableMedia) {
    this.leaveRoom();
    var hasProperty = (this._user) ? ((this._user.info) ? (
      (this._user.info.settings) ? true : false) : false) : false;
    // set timeout? to 500?
    this.joinRoom({
      audio: (mediaType === 'audio') ? true : ((hasProperty) ?
        this._user.info.settings.audio : false),
      video: (mediaType === 'video') ? true : ((hasProperty) ?
        this._user.info.settings.video : false)
    });
    this._user.info.mediaStatus[mediaType + 'Muted'] = !enableMedia;
  } else {
    this._sendChannelMessage({
      type: ((mediaType === 'audio') ? this._SIG_MESSAGE_TYPE.MUTE_AUDIO :
        this._SIG_MESSAGE_TYPE.MUTE_VIDEO),
      mid: this._user.sid,
      rid: this._room.id,
      muted: !enableMedia
    });
    this._user.info.mediaStatus[mediaType + 'Muted'] = !enableMedia;
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
 * @param {JSON} [options.video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._waitForLocalMediaStream = function(callback, options) {
  var self = this;
  options = options || {};
  self.getUserMedia(options);

  log.log('Requested audio:', ((typeof options.audio === 'boolean') ? options.audio : false));
  log.log('Requested video:', ((typeof options.video === 'boolean') ? options.video : false));

  // If options video or audio false, do the opposite to throw a true.
  var hasAudio = (options.audio) ? false : true;
  var hasVideo = (options.video) ? false : true;

  if (options.video || options.audio) {
    // lets wait for a minute and then we pull the updates
    var count = 0;
    var checkForStream = setInterval(function() {
      if (count < 5) {
        for (var stream in self._user.streams) {
          if (self._user.streams.hasOwnProperty(stream)) {
            if (options.audio &&
              self._user.streams[stream].getAudioTracks().length > 0) {
              hasAudio = true;
            }
            if (options.video &&
              self._user.streams[stream].getVideoTracks().length > 0) {
              hasVideo = true;
            }
            if (hasAudio && hasVideo) {
              clearInterval(checkForStream);
              callback();
            } else {
              count++;
            }
          }
        }
      } else {
        clearInterval(checkForStream);
        var error = ((!hasAudio && options.audio) ?  'Expected audio but no ' +
          'audio stream received' : '') +  '\n' + ((!hasVideo && options.video) ?
          'Expected video but no video stream received' : '');
        log.error([null, 'Socket', self._selectedRoom, 'Failed joining room:'], error);
        self._trigger('mediaAccessError', error);
      }
    }, 2000);
  } else {
    callback();
  }
};

/**
 * Gets the default webcam and microphone.
 * - Please do not be confused with the [MediaStreamConstraints](http://dev.w3.
 *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
 *   -mediastreamconstraints-members) specified in the original w3c specs.
 * - This is an implemented function for Skylink.
 * @method getUserMedia
 * @param {JSON} [options]  MediaStream constraints.
 * @param {JSON|Boolean} [options.audio=true] Option to allow audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
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
 * @since 0.4.1
 */
Skylink.prototype.getUserMedia = function(options) {
  var self = this;
  var getStream = false;
  options = options || {
    audio: true,
    video: true
  };
  // prevent undefined error
  self._user = self._user || {};
  self._user.info = self._user.info || {};
  self._user.info.settings = self._user.info.settings || {};
  self._user.streams = self._user.streams || [];
  // called during joinRoom
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
  } else if (Object.keys(self._user.streams).length > 0) {
    log.log([null, 'MediaStream', null,
      'User has already this mediastream. Reactiving media']);
  } else {
    log.warn([null, 'MediaStream', null,
      'Not retrieving stream']);
  }
};

/**
 * Enable microphone.
 * - If microphone is not enabled from the beginning, user would have to reinitate the
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and ask for microphone again.
 * @method enableAudio
 * @trigger peerUpdated
 * @example
 *   SkylinkDemo.enableAudio();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.enableAudio = function() {
  this._handleLocalMediaStreams('audio', true);
};

/**
 * Disable microphone.
 * - If microphone is not enabled from the beginning, there is no effect.
 * @method disableAudio
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.disableAudio = function() {
  this._handleLocalMediaStreams('audio', false);
};

/**
 * Enable webcam video.
 * - If webcam is not enabled from the beginning, user would have to reinitate the
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and ask for webcam again.
 * @method enableVideo
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.enableVideo = function() {
  this._handleLocalMediaStreams('video', true);
};

/**
 * Disable webcam video.
 * - If webcam is not enabled from the beginning, there is no effect.
 * - Note that in a Chrome-to-chrome session, each party's peer audio
 *   may appear muted in when the audio is muted.
 * - You may follow up the bug on [here](https://github.com/Temasys/SkylinkJS/issues/14).
 * @method disableVideo
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger peerUpdated
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.disableVideo = function() {
  this._handleLocalMediaStreams('video', false);
};
/**
 * <blockquote class="info">
 *   For a better user experience, the functionality is throttled when invoked many times in less
 *   than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Function that retrieves camera Stream.
 * @method getUserMedia
 * @param {JSON} [options] The camera Stream configuration options.
 * - When not provided, the value is set to <code>{ audio: true, video: true }</code>.
 *   <small>To fallback to retrieve audio track only when retrieving of audio and video tracks failed,
 *   enable the <code>audioFallback</code> flag in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints=false] <blockquote class="info">
 *   Note that by enabling this flag, exact values will be requested when retrieving camera Stream,
 *   but it does not prevent constraints related errors. By default when not enabled,
 *   expected mandatory maximum values (or optional values for source ID) will requested to prevent constraints related
 *   errors, with an exception for <code>options.video.frameRate</code> option in Safari and IE (any plugin-enabled) browsers,
 *   where the expected maximum value will not be requested due to the lack of support.</blockquote>
 *   The flag if <code>getUserMedia()</code> should request for camera Stream to match exact requested values of
 *   <code>options.audio.deviceId</code> and <code>options.video.deviceId</code>, <code>options.video.resolution</code>
 *   and <code>options.video.frameRate</code> when provided.
 * @param {Boolean|JSON} [options.audio=false] <blockquote class="info">
 *    Note that the current Edge browser implementation does not support the <code>options.audio.optional</code>,
 *    <code>options.audio.deviceId</code>, <code>options.audio.echoCancellation</code>.</blockquote>
 *    The audio configuration options.
 * @param {Boolean} [options.audio.stereo=false] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code> and
 *   the <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> or <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   is configured, this overrides the <code>options.audio.stereo</code> setting.</blockquote>
 *   The flag if OPUS audio codec stereo band should be configured for sending encoded audio data.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.audio.usedtx] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> is configured, this overrides the
 *   <code>options.audio.stereo</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.</blockquote>
 *   The flag if OPUS audio codec should enable DTX (Discontinuous Transmission) for sending encoded audio data.
 *   <small>This might help to reduce bandwidth as it reduces the bitrate during silence or background noise, and
 *   goes hand-in-hand with the <code>options.voiceActivityDetection</code> flag in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.audio.useinbandfec] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.useinbandfec</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.useinbandfec</code> is configured, this overrides the
 *   <code>options.audio.useinbandfec</code> setting. Note that this parameter should only be used
 *   for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   <small>This helps to reduce the harm of packet loss by encoding information about the previous packet loss.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.audio.maxplaybackrate] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.maxplaybackrate</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.maxplaybackrate</code> is configured, this overrides the
 *   <code>options.audio.maxplaybackrate</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> sets <code>peerInfo.mediaStatus.audioMuted</code> to <code>1</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.audioMuted</code> value to
 *   <code>0</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> audio tracks as well.</small>
 * @param {Array} [options.audio.optional] <blockquote class="info">
 *   This property has been deprecated. "optional" constraints has been moved from specs.<br>
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the audio track,
 *   use <code>options.audio.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>audio: { optional [..] }</code> property.
 * @param {String} [options.audio.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The audio track source ID of the device to use.
 *   <small>The list of available audio source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {Boolean} [options.audio.echoCancellation=true] <blockquote class="info">
 *   For Chrome/Opera/IE/Safari/Bowser, the echo cancellation functionality may not work and may produce a terrible
 *   feedback. It is recommended to use headphones or other microphone devices rather than the device
 *   in-built microphones.</blockquote> The flag to enable echo cancellation for audio track.
 * @param {Boolean|JSON} [options.video=false] <blockquote class="info">
 *    Note that the current Edge browser implementation does not support the <code>options.video.optional</code>,
 *    <code>options.video.deviceId</code>, <code>options.video.resolution</code> and
 *    <code>options.video.frameRate</code>, <code>options.video.facingMode</code>.</blockquote>
 *   The video configuration options.
 * @param {Boolean} [options.video.mute=false] The flag if video tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>1</code>, but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>0</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> video tracks as well.</small>
 * @param {JSON} [options.video.resolution] The video resolution.
 *   <small>By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.</small>
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number|JSON} [options.video.resolution.width] The video resolution width.
 * - When provided as a number, it is the video resolution width.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.width</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal resolution width, <code>"exact"</code> for exact video resolution width,
 *   <code>"min"</code> for min video resolution width and <code>"max"</code> for max video resolution width.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Number|JSON} [options.video.resolution.height] The video resolution height.
 * - When provided as a number, it is the video resolution height.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.height</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video resolution height, <code>"exact"</code> for exact video resolution height,
 *   <code>"min"</code> for min video resolution height and <code>"max"</code> for max video resolution height.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Number|JSON} [options.video.frameRate] The video <a href="https://en.wikipedia.org/wiki/Frame_rate">
 *   frameRate</a> per second (fps).
 * - When provided as a number, it is the video framerate.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.frameRate</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video framerate, <code>"exact"</code> for exact video framerate,
 *   <code>"min"</code> for min video framerate and <code>"max"</code> for max video framerate.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Array} [options.video.optional] <blockquote class="info">
 *   This property has been deprecated. "optional" constraints has been moved from specs.<br>
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the video track,
 *   use <code>options.video.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>video: { optional [..] }</code> property.
 * @param {String} [options.video.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The video track source ID of the device to use.
 *   <small>The list of available video source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {String|JSON} [options.video.facingMode] The video camera facing mode.
 *   <small>The list of available video source ID can be retrieved by the <a href="https://developer.mozilla.org
 *   /en-US/docs/Web/API/MediaTrackConstraints/facingMode">MediaTrackConstraints <code>facingMode</code> API</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter
 *   payload value as <code>false</code> for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getUserMedia()</code> error when retrieving camera Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the camera Stream object.</small>
 * @example
 *   // Example 1: Get both audio and video.
 *   skylinkDemo.getUserMedia(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 2: Get only audio.
 *   skylinkDemo.getUserMedia({
 *     audio: true
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-audio"), success);
 *   });
 *
 *   // Example 3: Configure resolution for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       resolution: skylinkDemo.VIDEO_RESOLUTION.HD
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 4: Configure stereo flag for OPUS codec audio (OPUS is always used by default)
 *   skylinkDemo.init({
 *     appKey: "xxxxxx",
 *     audioCodec: skylinkDemo.AUDIO_CODEC.OPUS
 *   }, function (initErr, initSuccess) {
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         stereo: true
 *       },
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   });
 *
 *   // Example 5: Configure frameRate for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       frameRate: 50
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 6: Configure video and audio based on selected sources. Does not work for Firefox currently.
 *   var sources = { audio: [], video: [] };
 *
 *   function selectStream (audioSourceId, videoSourceId) {
 *     if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
 *       console.warn("Currently this feature is not supported by Firefox browsers!");
 *       return;
 *     }
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         optional: [{ sourceId: audioSourceId }]
 *       },
 *       video: {
 *         optional: [{ sourceId: videoSourceId }]
 *       }
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   navigator.mediaDevices.enumerateDevices().then(function(devices) {
 *     var selectedAudioSourceId = "";
 *     var selectedVideoSourceId = "";
 *     devices.forEach(function(device) {
 *       console.log(device.kind + ": " + device.label + " source ID = " + device.deviceId);
 *       if (device.kind === "audio") {
 *         selectedAudioSourceId = device.deviceId;
 *       } else {
 *         selectedVideoSourceId = device.deviceId;
 *       }
 *     });
 *     selectStream(selectedAudioSourceId, selectedVideoSourceId);
 *   }).catch(function (error) {
 *      console.error("Failed", error);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If <code>options.audio</code> value is <code>false</code> and <code>options.video</code>
 *   value is <code>false</code>: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieve camera Stream. <ol><li>If retrieval was succesful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If <code>options.audioFallback</code> is enabled in the <a href="#method_init"><code>init()</code> method</a>,
 *   <code>options.audio</code> value is <code>true</code> and <code>options.video</code> value is <code>true</code>: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKING</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Retrieve camera Stream with audio tracks only. <ol><li>If retrieval was successful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>true</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallbackError</code> value as <code>true</code>.</li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>, <code>isScreensharing</code> value as
 *   <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallbackError</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function (options, callback) {
  var self = this;
  self._getUserMedia(options, callback, false);
};

Skylink.prototype._getUserMedia = function (options, callback, fromSendStream) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };

  } else if (typeof options !== 'object' || options === null) {
    if (typeof options === 'undefined') {
      options = {
        audio: true,
        video: true
      };
    } else {
      var invalidOptionsError = 'Please provide a valid options';
      log.error(invalidOptionsError, options);
      if (typeof callback === 'function') {
        callback(new Error(invalidOptionsError), null);
      }
      return;
    }

  } else if (!options.audio && !options.video) {
    var noConstraintOptionsSelectedError = 'Please select audio or video';
    log.error(noConstraintOptionsSelectedError, options);
    if (typeof callback === 'function') {
      callback(new Error(noConstraintOptionsSelectedError), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && AdapterJS.webrtcDetectedBrowser === 'chrome' &&
    AdapterJS.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._initOptions.throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.getUserMedia + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    if (typeof callback === 'function') {
      var mediaAccessSuccessFn = function (stream) {
        self.off('mediaAccessError', mediaAccessErrorFn);
        callback(null, stream);
      };
      var mediaAccessErrorFn = function (error) {
        self.off('mediaAccessSuccess', mediaAccessSuccessFn);
        callback(error, null);
      };

      self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
        return !isScreensharing;
      });

      self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
        return !isScreensharing;
      });
    }

    // Parse stream settings
    var settings = self._parseStreamSettings(options);

    var onSuccessCbFn = function (stream) {
        self._streamsMutedSettings.audioMuted = settings.mutedSettings.shouldAudioMuted;

        if (options.audio) {
          self._streamMediaStatus.audioMuted = settings.mutedSettings.shouldAudioMuted ? self.MEDIA_STATUS.MUTED : self.MEDIA_STATUS.ACTIVE;
        }

      settings.mutedSettings.shouldVideoMuted = self._streamsMutedSettings.videoMuted;

        if (options.video) {
          self._streamMediaStatus.videoMuted = settings.mutedSettings.shouldVideoMuted ? self.MEDIA_STATUS.MUTED : self.MEDIA_STATUS.ACTIVE;
        }

      self._onStreamAccessSuccess(stream, settings, false, false, fromSendStream);
    };

    var onErrorCbFn = function (error) {
      self._onStreamAccessError(error, settings, false, false);
    };

    try {
      if (typeof (AdapterJS || {}).webRTCReady !== 'function') {
        return onErrorCbFn(new Error('Failed to call getUserMedia() as AdapterJS is not yet loaded!'));
      }

      AdapterJS.webRTCReady(function () {
        navigator.getUserMedia(settings.getUserMediaSettings, onSuccessCbFn, onErrorCbFn);
      });
    } catch (error) {
      onErrorCbFn(error);
    }

  }, 'getUserMedia', self._initOptions.throttleIntervals.getUserMedia);
};

/**
 * <blockquote class="info">
 *   Note that if <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available despite having
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> available, the
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is sent instead of the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> to Peers.
 * </blockquote>
 * Function that sends a new <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 * to all connected Peers in the Room.
 * @method sendStream
 * @param {JSON|MediaStream} options The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options</code> parameter settings.
 * - When provided as a <code>MediaStream</code> object, this configures the <code>options.audio</code> and
 *   <code>options.video</code> based on the tracks available in the <code>MediaStream</code> object,
 *   and configures the <code>options.audio.mute</code> and <code>options.video.mute</code> based on the tracks
 *   <code>.enabled</code> flags in the tracks provided in the <code>MediaStream</code> object without
 *   invoking <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 *   <small>Object signature matches the <code>options</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * <blockquote class="info">
 *   Note that when provided as a <code>MediaStream</code> object, the MediaStream object should be cloned if it is to be reused after
 *   invoking <a href="#method_stopStream"><code>stopStream()</code> method</a>.
 *   When the MediaStream object is no longer needed,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a> with the MediaStream object as a param to stop the stream.
 *   Failure to do so may cause the visual indicator (usually a green light) on the camera device to remain active.
 * </blockquote>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>false</code> for request success when User is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> error or
 *   when invalid <code>options</code> is provided.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
 *   Stream object.</small>
 * @example
 *   // Example 1: Send MediaStream object before being connected to Room
 *   function retrieveStreamBySourceForFirefox (sourceId) {
 *     navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId }
 *       }
 *     }).then(function (stream) {
 *       skylinkDemo.sendStream(stream, function (error, success) {
 *         if (err) return;
 *         if (stream === success) {
 *           console.info("Same MediaStream has been sent");
 *         }
 *         console.log("Stream is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 *
 *   // Example 2: Send video after being connected to Room
 *   function sendVideo () {
 *     skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *       if (jRError) return;
 *       skylinkDemo.sendStream({
 *         audio: true,
 *         video: true
 *       }, function (error, success) {
 *         if (error) return;
 *         console.log("getUserMedia() Stream with video is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 *
 *   // Example 3: Sending manually managed MediaStreams
 *   var mediaStream_1 = null;
 *   var mediaStream_2 = null;
 *
 *   navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId_1 }
 *       }
 *     }).then(function (stream) {
 *       mediaStream_1 = stream;
 *     });
 *
 *   navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId_2 }
 *       }
 *     }).then(function (stream) {
 *       mediaStream_2 = stream;
 *     });
 *
 *   function showStream_1 () {
 *      skylinkDemo.sendStream(mediaStream_1.clone());
 *   };
 *
 *   function showStream_2 () {
 *      skylinkDemo.sendStream(mediaStream_2.clone());
 *   };
 *
 *   // Stopping the active stream in the video element
 *   skylinkDemo.stopStream();
 *
 *   // Stopping the manually managed getUserMedia streams when it is no longer needed
 *   skylinkDemo.stopStream(mediaStream_1);
 *   skylinkDemo.stopStream(mediaStream_2);
 * @trigger <ol class="desc-seq">
 *   <li>Checks <code>options</code> provided. <ol><li>If provided parameter <code>options</code> is not valid: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Else if provided parameter <code>options</code> is a Stream object: <ol>
 *   <li>Checks if there is any audio or video tracks. <ol><li>If there is no tracks: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol>
 *   <li>Set <code>options.audio</code> value as <code>true</code> if Stream has audio tracks.</li>
 *   <li>Set <code>options.video</code> value as <code>false</code> if Stream has video tracks.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in
 *   <code>peerInfo.mediaStatus</code>. <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li>If there is any previous <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>:
 *   <ol><li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a> to stop previous Stream.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> with
 *   <code>options</code> provided in <code>sendStream()</code>. <ol><li>If request has errors: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If there is currently no <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> and User is in Room: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code>
 *   method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(options, callback) {
  var self = this;

  var isOptionsMediaStream = function () {
    return typeof options.getAudioTracks === 'function' || typeof options.getVideoTracks === 'function';
  };

  var checkActiveTracksFn = function (tracks) {
    for (var t = 0; t < tracks.length; t++) {
      if (!(tracks[t].ended || (typeof tracks[t].readyState === 'string' ?
          tracks[t].readyState !== 'live' : false))) {
        return true;
      }
    }
    return false;
  };

  var renegotiate = function(originalStream, newStream, cb) {
    if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
      self._refreshPeerConnection(Object.keys(self._peerConnections), false, {}, function (err, success) {
        if (err) {
          log.error('Failed refreshing connections for sendStream() ->', err);
          if (typeof cb === 'function') {
            cb(new Error('Failed refreshing connections.'), null);
          }
          return;
        }
        if (typeof cb === 'function') {
          cb(null, newStream);
        }
      });
    } else if (typeof cb === 'function') {
      cb(null, newStream);
    }
  }

  var performReplaceTracks = function (originalStream, newStream, cb) {
    if (!originalStream) {
      renegotiate(newStream, cb);
    } else {
      self._stopStreams(originalStream, true);
      renegotiate(newStream, cb);
    }

    /** TODO: Replace track

     if (!originalStream) {
      renegotiate(newStream, cb);
      return;
    }

     var newStreamHasVideoTrack = Array.isArray(newStream.getVideoTracks()) && newStream.getVideoTracks().length;
     var newStreamHasAudioTrack = Array.isArray(newStream.getAudioTracks()) && newStream.getAudioTracks().length;
     var originalStreamHasVideoTrack = Array.isArray(originalStream.getVideoTracks()) && originalStream.getVideoTracks().length;
     var originalStreamHasAudioTrack = Array.isArray(originalStream.getAudioTracks()) && originalStream.getAudioTracks().length;

     if ((newStreamHasVideoTrack && !originalStreamHasVideoTrack) || (newStreamHasAudioTrack && !originalStreamHasAudioTrack)) {
     self._stopStreams(originalStream, true);
     renegotiate(newStream, cb);
     return;
     }

    if (newStreamHasVideoTrack && originalStreamHasVideoTrack) {
      self._replaceTrack(originalStream.getVideoTracks()[0].id, newStream.getVideoTracks()[0]);
    }

    if (newStreamHasAudioTrack && originalStreamHasAudioTrack) {
      self._replaceTrack(originalStream.getAudioTracks()[0].id, newStream.getAudioTracks()[0]);
    }

    self._stopStreams(originalStream, true);
     **/
  };

  var restartFn = function (originalStream, stream) {
    if (self._inRoom) {

      if (!self._streams.screenshare) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), false, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      } else {
        performReplaceTracks(originalStream, stream, callback);
      }

      if (self._streams.userMedia) {
        performReplaceTracks(originalStream, stream, callback);
      }

    } else if (typeof callback === 'function') {
      callback(null, stream);
    }
  };

  // Note: Sometimes it may be "function" or "object" but then "function" might be mistaken for callback function, so for now fixing it that way
  if ((typeof options !== 'object' || options === null) && !(AdapterJS && AdapterJS.WebRTCPlugin &&
    AdapterJS.WebRTCPlugin.plugin && ['function', 'object'].indexOf(typeof options) > -1)) {
    var invalidOptionsError = 'Provided stream settings is invalid';
    log.error(invalidOptionsError, options);
    if (typeof callback === 'function'){
      callback(new Error(invalidOptionsError),null);
    }
    return;
  }

  if (!self._inRoom) {
    log.warn('There are no peers to send stream to as not in room!');
  }

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    var edgeNotSupportError = 'Edge browser currently does not support renegotiation.';
    log.error(edgeNotSupportError, options);
    if (typeof callback === 'function'){
      callback(new Error(edgeNotSupportError),null);
    }
    return;
  }

  var origStream = null;

  if (self._streams.userMedia) {
    origStream = self._streams.userMedia.stream;
  }

  if (self._streams.screenshare) {
    origStream = self._streams.screenshare.stream;
  }

  if (isOptionsMediaStream()) {
    var hasActiveAudioTracks = checkActiveTracksFn(options.getAudioTracks());
    var hasActiveVideoTracks = checkActiveTracksFn( options.getVideoTracks());

    if (!hasActiveAudioTracks && !hasActiveVideoTracks) {
      var invalidStreamError = 'Provided stream object does not have audio or video tracks.';
      log.error(invalidStreamError, options);
      if (typeof callback === 'function'){
        callback(new Error(invalidStreamError),null);
      }
      return;
    }

    self._onStreamAccessSuccess(options, {
      settings: {
        audio: hasActiveAudioTracks,
        video: hasActiveVideoTracks
      },
      getUserMediaSettings: {
        audio: hasActiveAudioTracks,
        video: hasActiveVideoTracks
      }
    }, false, false, true);

    restartFn(origStream, options);

  } else {
    self._getUserMedia(options, function (err, stream) {
      if (err) {
        if (typeof callback === 'function') {
          callback(err, null);
        }
        return;
      }
      restartFn(origStream, stream);
    }, true);
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * @method stopStream
 * @param {JSON} [mediaStream] - The manually managed MediaStream to stop. Manually managed MediaStreams are obtained
 * by invoking <code>navigator.mediaDevices.getUserMedia()</code> method.
 * @example
 *   // Example 1
 *   function stopStream () {
 *     skylinkDemo.stopStream();
 *   }
 *
 *   skylinkDemo.getUserMedia();
 *
 *   // Example 2: Stopping a manually managed MediaStream
 *   function stopStream () {
 *     skylinkDemo.stopStream(stream);
 *   }
 *
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as<code>false</code>
 *   .</li><li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function (mediaStream) {
  if (mediaStream) {
    mediaStream.getTracks().forEach(function(track) {
      track.stop();
    })
  } else if (this._streams.userMedia) {
    this._stopStreams({
      userMedia: true
    });
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio or video tracks.
 * @method muteStream
 * @param {JSON} options The Streams muting options.
 * @param {Boolean} [options.audioMuted=true] The flag if all Streams audio
 *   tracks should be muted or not.
 * @param {Boolean} [options.videoMuted=true] The flag if all Streams video
 *   tracks should be muted or not.
 * @example
 *   // Example 1: Mute both audio and video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: true
 *   });
 *
 *   // Example 2: Mute only audio tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 *
 *   // Example 3: Mute only video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: false,
 *     videoMuted: true
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If provided parameter <code>options</code> is invalid: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if there is any available Streams: <ol><li>If there is no available Streams: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If User is in Room: <ol>
 *   <li>Checks if there is audio tracks to mute / unmute: <ol><li>If there is audio tracks to mute / unmute: <ol>
 *   <li>If <code>options.audioMuted</code> is <code>false</code> and
 *   <code>peerInfo.mediaStatus.audioMuted</code> is <code>1</code> or <code>options.audioMuted</code> is <code>true</code> and
 *   <code>peerInfo.mediaStatus.audioMuted</code> is <code>0</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li>
 *   <li>Checks if there is video tracks to mute / unmute: <ol><li>If there is video tracks to mute / unmute: <ol>
 *   <li>If <code>options.videoMuted</code> is <code>false</code> and
 *   <code>peerInfo.mediaStatus.videoMuted</code> is <code>1</code> or <code>options.videoMuted</code> is <code>true</code> and
 *   <code>peerInfo.mediaStatus.videoMuted</code> is <code>0</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If <code>options.audioMuted</code> / <code>options.videoMuted</code> is <code>false</code> and
 *   <code>peerInfo.mediaStatus.audioMuted</code> / <code>peerInfo.mediaStatus.videoMuted</code> is <code>1</code> or
 *    <code>options.audioMuted</code> / <code>options.videoMuted</code> is <code>true</code> and
 *   <code>peerInfo.mediaStatus.audioMuted</code> / <code>peerInfo.mediaStatus.videoMuted</code> is <code>0</code>: <ol>
 *   <li><a href="#event_localMediaMuted"><code>localMediaMuted</code> event</a> triggers.</li>
 *   <li>If User is in Room: <ol><li><a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  var getMutedSetting = function(mediaMutedOption) {
    switch (mediaMutedOption) {
      case 1:
        return false;
      case 0:
        return true;
      default:
        return true;
    }
  };

  if (!(self._streams.userMedia && self._streams.userMedia.stream) &&
    !(self._streams.screenshare && self._streams.screenshare.stream)) {
    log.warn('No streams are available to mute / unmute!');
    return;
  }

  var audioMuted = typeof options.audioMuted === 'boolean' ? options.audioMuted : typeof options.audioMuted === 'number' ? getMutedSetting(options.audioMuted) : true;
  var videoMuted = typeof options.videoMuted === 'boolean' ? options.videoMuted : typeof options.videoMuted === 'number' ? getMutedSetting(options.videoMuted) : true;
  var hasToggledAudio = false;
  var hasToggledVideo = false;

  if (self._streamsMutedSettings.audioMuted !== audioMuted) {
    self._streamsMutedSettings.audioMuted = audioMuted;
    hasToggledAudio = true;
  }

  if (self._streamsMutedSettings.videoMuted !== videoMuted) {
    self._streamsMutedSettings.videoMuted = videoMuted;
    hasToggledVideo = true;
  }

  if (hasToggledVideo || hasToggledAudio) {
    var streamTracksAvailability = self._muteStreams();

    if (hasToggledVideo && self._inRoom && streamTracksAvailability.hasVideo) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._streamsMutedSettings.videoMuted,
        stamp: (new Date()).getTime()
      });

    }

    if (hasToggledAudio && self._inRoom && streamTracksAvailability.hasAudio) {
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._streamsMutedSettings.audioMuted,
          stamp: (new Date()).getTime()
        });
      }, hasToggledVideo ? 1050 : 0);
    }

    log.debug('Updated Streams muted state ->', self._streamMediaStatus);

    if ((streamTracksAvailability.hasVideo && hasToggledVideo) ||
      (streamTracksAvailability.hasAudio && hasToggledAudio)) {

      self._trigger('localMediaMuted', self._streamMediaStatus);

      if (self._inRoom) {
        self._trigger('streamMuted', self._user.sid, self.getPeerInfo(), true,
          self._streams.screenshare && self._streams.screenshare.stream);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }
    }
  }
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method enableAudio
 * @deprecated true
 * @example
 *   function unmuteAudio () {
 *     skylinkDemo.enableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>false</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method disableAudio
 * @deprecated true
 * @example
 *   function muteAudio () {
 *     skylinkDemo.disableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>true</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method enableVideo
 * @deprecated true
 * @example
 *   function unmuteVideo () {
 *     skylinkDemo.enableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>false</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method disableVideo
 * @deprecated true
 * @example
 *   function muteVideo () {
 *     skylinkDemo.disableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>true</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * <blockquote class="info">
 *   For a better user experience, the functionality is throttled when invoked many times in less
 *   than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 *   Note that the Opera and Edge browser does not support screensharing, and as for IE / Safari browsers using
 *   the Temasys Plugin screensharing support, check out the <a href="https://temasys.com.sg/plugin/#commercial-licensing">
 *   commercial licensing</a> for more options.
 * </blockquote>
 * Function that retrieves screensharing Stream.
 * @method shareScreen
 * @param {JSON|Boolean} [enableAudio=false] The flag if audio tracks should be retrieved.
 * @param {Boolean} [enableAudio.stereo=false] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code> and
 *   the <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> or <code>options.codecParams.audio.opus["sprop-stereo"]</code>
 *   is configured, this overrides the <code>options.audio.stereo</code> setting.</blockquote>
 *   The flag if OPUS audio codec stereo band should be configured for sending encoded audio data.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.usedtx] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.stereo</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.stereo</code> is configured, this overrides the
 *   <code>options.audio.stereo</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.</blockquote>
 *   The flag if OPUS audio codec should enable DTX (Discontinuous Transmission) for sending encoded audio data.
 *   <small>This might help to reduce bandwidth as it reduces the bitrate during silence or background noise, and
 *   goes hand-in-hand with the <code>options.voiceActivityDetection</code> flag in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.useinbandfec] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.useinbandfec</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.useinbandfec</code> is configured, this overrides the
 *   <code>options.audio.useinbandfec</code> setting. Note that this parameter should only be used
 *   for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   <small>This helps to reduce the harm of packet loss by encoding information about the previous packet loss.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [enableAudio.maxplaybackrate] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Configure this with the <code>options.codecParams.audio.opus.maxplaybackrate</code>
 *   parameter in the <a href="#method_init"><code>init()</code> method</a> instead. If the
 *   <code>options.codecParams.audio.opus.maxplaybackrate</code> is configured, this overrides the
 *   <code>options.audio.maxplaybackrate</code> setting.  Note that this feature might
 *   not work depending on the browser support and implementation.
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.echoCancellation=true] <blockquote class="info">
 *   For Chrome/Opera/IE/Safari/Bowser, the echo cancellation functionality may not work and may produce a terrible
 *   feedback. It is recommended to use headphones or other microphone devices rather than the device
 *   in-built microphones.</blockquote> The flag to enable echo cancellation for audio track.
 *   <small>Note that this will not be toggled for Chrome/Opera case when `mediaSource` value is `["tab","audio"]`.</small>
 * @param {String|Array|JSON} [mediaSource=screen] The screensharing media source to select.
 *   <small>Note that multiple sources are not supported by Firefox as of the time of this release.
 *   Firefox will use the first item specified in the Array in the event that multiple sources are defined.</small>
 *   <small>E.g. <code>["screen", "window"]</code>, <code>["tab", "audio"]</code>, <code>"screen"</code> or <code>"tab"</code>
 *   or <code>{ sourceId: "xxxxx", mediaSource: "screen" }</code>.</small>
 *   [Rel: Skylink.MEDIA_SOURCE]
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>true</code> for request success when User is not in the Room or is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>shareScreen()</code> error when retrieving screensharing Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the screensharing Stream object.</small>
 * @example
 *   // Example 1: Share screen with audio
 *   skylinkDemo.shareScreen(true, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 2: Share screen without audio
 *   skylinkDemo.shareScreen(false, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 3: Share "window" media source
 *   skylinkDemo.shareScreen("window", function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 4: Share tab and its audio media source
 *   skylinkDemo.shareScreen(true, ["tab", "audio"], function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 5: Share "window" and "screen" media source
 *   skylinkDemo.shareScreen(["window", "screen"], function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 6: Share "window" with specific media source for specific plugin build users.
 *   skylinkDemo.shareScreen({ mediaSource: "window", sourceId: "xxxxx" }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves screensharing Stream. <ol><li>If retrieval was successful: <ol><li>If browser is Firefox: <ol>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If audio is requested: <small>Chrome, Safari and IE currently doesn't support retrieval of
 *   audio track together with screensharing video track.</small> <ol><li>Retrieves audio Stream: <ol>
 *   <li>If retrieval was successful: <ol><li>Attempts to attach screensharing Stream video track to audio Stream. <ol>
 *   <li>If attachment was successful: <ol><li><a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code>
 *   and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>If User is in Room: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as <code>shareScreen()</code> Stream.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.
 *   <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there are connected Peers in the Room: <ol><li>Invoke <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.shareScreen = function (enableAudio, mediaSource, callback) {
  var self = this;
  var enableAudioSettings = false;
  var useMediaSource = [self.MEDIA_SOURCE.SCREEN];
  var useMediaSourceId = null;
  var checkIfSourceExistsFn = function (val) {
    for (var prop in self.MEDIA_SOURCE) {
      if (self.MEDIA_SOURCE.hasOwnProperty(prop) && self.MEDIA_SOURCE[prop] === val) {
        return true;
      }
    }
    return false;
  };

  // shareScreen("screen") or shareScreen({ sourceId: "xxxx", mediaSource: "xxxxx" })
  if (enableAudio && typeof enableAudio === 'string' ||
    (enableAudio && typeof enableAudio === 'object' && enableAudio.sourceId && enableAudio.mediaSource)) {
    if (checkIfSourceExistsFn(typeof enableAudio === 'object' ? enableAudio.mediaSource : enableAudio)) {
      useMediaSource = [typeof enableAudio === 'object' ? enableAudio.mediaSource : enableAudio];
    }
    useMediaSourceId = typeof enableAudio === 'object' ? enableAudio.sourceId : null;
  // shareScreen(["screen", "window"])
  } else if (Array.isArray(enableAudio)) {
    var enableAudioArr = [];

    for (var i = 0; i < enableAudio.length; i++) {
      if (checkIfSourceExistsFn(enableAudio[i])) {
        enableAudioArr.push(enableAudio[i]);
      }
    }

    if (enableAudioArr.length > 0) {
      useMediaSource = enableAudioArr;
    }
  // shareScreen({ stereo: true })
  } else if (enableAudio && typeof enableAudio === 'object') {
    if (enableAudio.sourceId && enableAudio.mediaSource) {

    } else {
      enableAudioSettings = {
        usedtx: typeof enableAudio.usedtx === 'boolean' ? enableAudio.usedtx : null,
        useinbandfec: typeof enableAudio.useinbandfec === 'boolean' ? enableAudio.useinbandfec : null,
        stereo: enableAudio.stereo === true,
        echoCancellation: enableAudio.echoCancellation !== false,
        deviceId: enableAudio.deviceId
      };
    }
  // shareScreen(true)
  } else if (enableAudio === true) {
    enableAudioSettings = enableAudio === true ? {
      usedtx: null,
      useinbandfec: null,
      stereo: false,
      echoCancellation: true,
      deviceId: null
    } : false;
  // shareScreen(function () {})
  } else if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = false;
  }

  // shareScreen(.., "screen") or shareScreen({ sourceId: "xxxx", mediaSource: "xxxxx" })
  if (mediaSource && typeof mediaSource === 'string' ||
    (mediaSource && typeof mediaSource === 'object' && mediaSource.sourceId && mediaSource.mediaSource)) {
    if (checkIfSourceExistsFn(typeof mediaSource === 'object' ? mediaSource.mediaSource : mediaSource)) {
      useMediaSource = [typeof mediaSource === 'object' ? mediaSource.mediaSource : mediaSource];
    }
    useMediaSourceId = typeof mediaSource === 'object' ? mediaSource.sourceId : null;
  // shareScreen(.., ["screen", "window"])
  } else if (Array.isArray(mediaSource)) {
    var mediaSourceArr = [];
    for (var i = 0; i < mediaSource.length; i++) {
      if (checkIfSourceExistsFn(mediaSource[i])) {
        mediaSourceArr.push(mediaSource[i]);
      }
    }
    if (mediaSourceArr.length > 0) {
      useMediaSource = mediaSourceArr;
    }
  // shareScreen(.., function () {})
  } else if (typeof mediaSource === 'function') {
    callback = mediaSource;
  }

  if (useMediaSource.indexOf('audio') > -1 && useMediaSource.indexOf('tab') === -1) {
    useMediaSource.splice(useMediaSource.indexOf('audio'), 1);
    if (useMediaSource.length === 0) {
      useMediaSource = [self.MEDIA_SOURCE.SCREEN];
    }
  }

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._initOptions.throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._initOptions.throttleIntervals.shareScreen + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    var settings = {
      settings: {
        audio: enableAudioSettings,
        video: {
          screenshare: true,
          exactConstraints: false
        }
      },
      getUserMediaSettings: {
        audio: false,
        video: {
          mediaSource: useMediaSource
        }
      }
    };

    if (AdapterJS.webrtcDetectedType === 'plugin' && useMediaSourceId) {
      settings.getUserMediaSettings.video.optional = [{
        screenId: useMediaSourceId
      }];
    }

    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);

      if (self._inRoom) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), true, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
        var shouldRenegotiate = true;

        if (self._streams.userMedia && self._streams.userMedia.stream && Array.isArray(self._streams.userMedia.stream.getVideoTracks()) && self._streams.userMedia.stream.getVideoTracks().length) {
          shouldRenegotiate = false;
        }

        if (AdapterJS.webrtcDetectedBrowser === 'edge') {
          shouldRenegotiate = true;
        }

        if (shouldRenegotiate) {
          if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
            stream.wasNegotiated = true;
            self._refreshPeerConnection(Object.keys(self._peerConnections), false, {}, function (err, success) {
              if (err) {
                log.error('Failed refreshing connections for shareScreen() ->', err);
                if (typeof callback === 'function') {
                  callback(new Error('Failed refreshing connections.'), null);
                }
                return;
              }
              if (typeof callback === 'function') {
                callback(null, stream);
              }
            });
          } else if (typeof callback === 'function') {
            callback(null, stream);
          }
        } else {
          var gDMVideoTrack = stream.getVideoTracks()[0];
          var gUMVideoTrack = self._streams.userMedia.stream.getVideoTracks()[0];
          self._replaceTrack(gUMVideoTrack.id, gDMVideoTrack);
        }
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    };

    var mediaAccessErrorFn = function (error) {
      self.off('mediaAccessSuccess', mediaAccessSuccessFn);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    };

    self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
      return isScreensharing;
    });

    self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
      return isScreensharing;
    });

    var getUserMediaAudioSettings = enableAudioSettings ? {
      echoCancellation: enableAudioSettings.echoCancellation
    } : false;

    try {
      var hasDefaultAudioTrack = false;


      if (self._streams.userMedia && self._streams.userMedia.stream && Array.isArray(self._streams.userMedia.stream.getAudioTracks()) && self._streams.userMedia.stream.getAudioTracks().length) {
        hasDefaultAudioTrack = true;
      }

      if (enableAudioSettings) {
        if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
          settings.getUserMediaSettings.audio = getUserMediaAudioSettings;
        } else if (useMediaSource.indexOf('audio') > -1 && useMediaSource.indexOf('tab') > -1) {
          hasDefaultAudioTrack = true;
          settings.getUserMediaSettings.audio = {};
        }
      }

      var onSuccessCbFn = function (stream) {
        var onAudioSuccessCbFn = function (audioStream) {
          try {
            audioStream.addTrack(stream.getVideoTracks()[0]);

            self.once('mediaAccessSuccess', function () {
              self._streams.screenshare.streamClone = stream;
            }, function (stream, isScreensharing) {
              return isScreensharing;
            });

            self._onStreamAccessSuccess(audioStream, settings, true, false);

          } catch (error) {
            log.error('Failed retrieving audio stream for screensharing stream', error);
            self._onStreamAccessSuccess(stream, settings, true, false);
          }
        };

        var onAudioErrorCbFn = function (error) {
          log.error('Failed retrieving audio stream for screensharing stream', error);
          self._onStreamAccessSuccess(stream, settings, true, false);
        };

        var audioTrack = null;
        var videoTrack = stream.getVideoTracks()[0];
        var newStream = null;

        if (hasDefaultAudioTrack) {
          // use audio tracks from userMedia stream
          audioTrack = self._streams.userMedia.stream.getAudioTracks()[0];
          newStream = new MediaStream([videoTrack, audioTrack]).clone();

          self._onStreamAccessSuccess(newStream, settings, true, false);
        } else if (!enableAudioSettings) {
          // add dummy track
          var createDummyAudio = function () {
            var ctx = new AudioContext(), oscillator = ctx.createOscillator();
            var dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
          }

          audioTrack = createDummyAudio();
          newStream = new MediaStream([videoTrack, audioTrack]);

          self._onStreamAccessSuccess(newStream, settings, true, false);
        } else if (enableAudioSettings) {
          settings.getUserMediaSettings.audio = getUserMediaAudioSettings;
          navigator.getUserMedia({ audio: getUserMediaAudioSettings }, onAudioSuccessCbFn, onAudioErrorCbFn);
        }
      };

      var onErrorCbFn = function (error) {
        self._onStreamAccessError(error, settings, true, false);
        if (typeof callback === 'function') {
          callback(error, null);
        }
      };

      if (typeof (AdapterJS || {}).webRTCReady !== 'function') {
        return onErrorCbFn(new Error('Failed to call getUserMedia() as AdapterJS is not yet loaded!'));
      }

      AdapterJS.webRTCReady(function () {
        if (AdapterJS.webrtcDetectedBrowser === 'edge' && typeof navigator.getDisplayMedia === 'function') {
          navigator.getDisplayMedia(settings.getUserMediaSettings).then(function(stream) {
            onSuccessCbFn(stream);
          }).catch(function(err) {
            onErrorCbFn(err);
          });
        } else if (typeof navigator.mediaDevices.getDisplayMedia === 'function') {
          navigator.mediaDevices.getDisplayMedia(settings.getUserMediaSettings).then(function(stream) {
            onSuccessCbFn(stream);
          }).catch(function(err) {
            onErrorCbFn(err);
          });
        } else {
          navigator.getUserMedia(settings.getUserMediaSettings, onSuccessCbFn, onErrorCbFn);
        }
      });
    } catch (error) {
      self._onStreamAccessError(error, settings, true, false);
    }
  }, 'shareScreen', self._initOptions.throttleIntervals.shareScreen);
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 * @method stopScreen
 * @example
 *   function stopScreen () {
 *     skylinkDemo.stopScreen();
 *   }
 *
 *   skylinkDemo.shareScreen();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   </ol></li></ol></li><li>If User is in Room: <small><b>SKIP</b> this step if <code>stopScreen()</code>
 *   was invoked from <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.</small> <ol>
 *   <li>If there is <a href="#method_getUserMedia"> <code>getUserMedia()</code>Stream</a> Stream: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.stopScreen = function () {
  var self = this;
  if (self._streams.screenshare) {
    if (self._inRoom) {
      if (self._streams.userMedia && self._streams.userMedia.stream) {
        self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo(),
          false, self._streams.userMedia.stream.id || self._streams.userMedia.stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }

      if (self._streams.screenshare.stream.wasNegotiated === true) {
        this._refreshPeerConnection(Object.keys(this._peerConnections), {}, false);
      } else {
        var gDMVideoTrack = self._streams.screenshare.stream.getVideoTracks()[0];
        var gUMVideoTrack = self._streams.userMedia && self._streams.userMedia.stream  ? self._streams.userMedia.stream.getVideoTracks()[0] : null;

        self._replaceTrack(gDMVideoTrack.id, gUMVideoTrack);
      }
    }
    self._stopStreams({
      screenshare: true,
    }, true);
  }
};

/**
 * Function that returns the camera and microphone sources.
 * @method getStreamSources
 * @param {Function} callback The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (success)</code></small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Object signature is the list of sources.</small>
 * @param {JSON} callback.success.audio The list of audio input (microphone) and output (speakers) sources.
 * @param {Array} callback.success.audio.input The list of audio input (microphone) sources.
 * @param {JSON} callback.success.audio.input.#index The audio input source item.
 * @param {String} callback.success.audio.input.#index.deviceId The audio input source item device ID.
 * @param {String} callback.success.audio.input.#index.label The audio input source item device label name.
 * @param {String} [callback.success.audio.input.#index.groupId] The audio input source item device physical device ID.
 * <small>Note that there can be different <code>deviceId</code> due to differing sources but can share a
 * <code>groupId</code> because it's the same device.</small>
 * @param {Array} callback.success.audio.output The list of audio output (speakers) sources.
 * @param {JSON} callback.success.audio.output.#index The audio output source item.
 * <small>Object signature matches <code>callback.success.audio.input.#index</code> format.</small>
 * @param {JSON} callback.success.video The list of video input (camera) sources.
 * @param {Array} callback.success.video.input The list of video input (camera) sources.
 * @param {JSON} callback.success.video.input.#index The video input source item.
 * <small>Object signature matches <code>callback.success.audio.input.#index</code> format.</small>
 * @example
 *   // Example 1: Retrieve the getUserMedia() stream with selected source ID.
 *   skylinkDemo.getStreamSources(function (sources) {
 *     skylinkDemo.getUserMedia({
 *       audio: sources.audio.input[0].deviceId,
 *       video: sources.video.input[0].deviceId
 *     });
 *   });
 *
 *   // Example 2: Set the output audio speaker (Chrome 49+ supported only)
 *   skylinkDemo.getStreamSources(function (sources) {
 *     var videoElement = document.getElementById('video');
 *     if (videoElement && typeof videoElement.setSinkId === 'function') {
 *       videoElement.setSinkId(sources.audio.output[0].deviceId)
 *     }
 *   });
 * @for Skylink
 * @since 0.6.27
 */
Skylink.prototype.getStreamSources = function(callback) {
  var outputSources = {
    audio: {
      input: [],
      output: []
    },
    video: {
      input: []
    }
  };

  if (typeof callback !== 'function') {
    return log.error('Please provide the callback.');
  }

  var sourcesListFn = function (sources) {
    sources.forEach(function (sourceItem) {
      var item = {
        deviceId: sourceItem.deviceId || sourceItem.sourceId || 'default',
        label: sourceItem.label,
        groupId: sourceItem.groupId || null
      };

      item.label = item.label || 'Source for ' + item.deviceId;

      if (['audio', 'audioinput'].indexOf(sourceItem.kind) > -1) {
        outputSources.audio.input.push(item);
      } else if (['video', 'videoinput'].indexOf(sourceItem.kind) > -1) {
        outputSources.video.input.push(item);
      } else if (sourceItem.kind === 'audiooutput') {
        outputSources.audio.output.push(item);
      }
    });

    callback(outputSources);
  };

  if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
    navigator.mediaDevices.enumerateDevices().then(sourcesListFn);
  } else if (window.MediaStreamTrack && typeof MediaStreamTrack.getSources === 'function') {
    MediaStreamTrack.getSources(sourcesListFn);
  } else if (typeof navigator.getUserMedia === 'function') {
    sourcesListFn([
      { deviceId: 'default', kind: 'audioinput', label: 'Default Audio Track' },
      { deviceId: 'default', kind: 'videoinput', label: 'Default Video Track' }
    ]);
  } else {
    sourcesListFn([]);
  }
};

/**
 * Function that returns the screensharing sources.
 * @method getScreenSources
 * @param {Function} callback The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (success)</code></small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Object signature is the list of sources.</small>
 * @param {JSON} callback.success The list of screensharing media sources and screen sources.
 * @param {Array} callback.success.mediaSource The array of screensharing media sources.
 * @param {String} callback.success.mediaSource.#index The screensharing media source item.
 * [Rel: Skylink.MEDIA_SOURCE]
 * @param {Array} callback.success.mediaSourceInput The list of specific media source screen inputs.
 * @param {JSON} callback.success.mediaSourceInput.#index The media source screen input item.
 * @param {String} callback.success.mediaSourceInput.#index.sourceId The screen input item ID.
 * @param {String} callback.success.mediaSourceInput.#index.label The screen input item label name.
 * @param {String} callback.success.mediaSourceInput.#index.mediaSource The screen input item media source it belongs to.
 * [Rel: Skylink.MEDIA_SOURCE]
 * @example
 *   // Example 1: Retrieve the list of available shareScreen() sources.
 *   skylinkDemo.getScreenSources(function (sources) {
 *     skylinkDemo.shareScreen(sources.mediaSource[0] || null);
 *   });
 *
 *   // Example 2: Retrieve the list of available shareScreen() sources with a specific item.
 *   skylinkDemo.getScreenSources(function (sources) {
 *     if (sources.mediaSourceInput[0]) {
 *       skylinkDemo.shareScreen({
 *         mediaSource: mediaSourceInput[0].mediaSource,
 *         sourceId: mediaSourceInput[0].sourceId
 *       });
 *     } else {
 *       skylinkDemo.shareScreen();
 *     }
 *   });
 * @for Skylink
 * @since 0.6.27
 */
Skylink.prototype.getScreenSources = function(callback) {
  var outputSources = {
    mediaSource: [],
    mediaSourceInput: []
  };

  if (typeof callback !== 'function') {
    return log.error('Please provide the callback.');
  }

  // For chrome android 59+ has screensharing support behind chrome://flags (needs to be enabled by user)
  // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=487935
  if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
    if (AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 59) {
      outputSources.mediaSource = ['screen'];
    }
    callback(outputSources);
    return;
  }

  // IE / Safari (plugin) needs commerical screensharing enabled
  if (AdapterJS.webrtcDetectedType === 'plugin') {
    AdapterJS.webRTCReady(function () {
      // IE / Safari (plugin) is not available or do not support screensharing
      if (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable &&
        AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature) {
        outputSources.mediaSource = ['window', 'screen'];

        // Do not provide the error callback as well or it will throw NPError.
        if (typeof AdapterJS.WebRTCPlugin.plugin.getScreensharingSources === 'function') {
          AdapterJS.WebRTCPlugin.plugin.getScreensharingSources(function (sources) {
            sources.forEach(sources, function (sourceItem) {
              var item = {
                sourceId: sourceItem.id || sourceItem.sourceId || 'default',
                label: sourceItem.label,
                mediaSource: sourceItem.kind || 'screen'
              };

              item.label = item.label || 'Source for ' + item.sourceId;
              outputSources.mediaSourceInput.push(item);
            });

            callback(outputSources);
          });
          return;
        }
      }

      callback(outputSources);
    });
    return;

  // Chrome 34+ and Opera 21(?)+ supports screensharing
  // Firefox 38(?)+ supports screensharing
  } else if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 34) ||
    (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion >= 38) ||
    (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 21)) {
    // Just warn users for those who did not configure the Opera screensharing extension settings, it will not work!
    if (AdapterJS.webrtcDetectedBrowser === 'opera' && !(AdapterJS.extensionInfo &&
      AdapterJS.extensionInfo.opera && AdapterJS.extensionInfo.opera.extensionId)) {
      log.warn('Please ensure that your application allows Opera screensharing!');
    }

    outputSources.mediaSource = ['window', 'screen'];

    // Chrome 52+ and Opera 39+ supports tab and audio
    // Reference: https://developer.chrome.com/extensions/desktopCapture
    if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 52) ||
      (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 39)) {
      outputSources.mediaSource.push('tab', 'audio');

    // Firefox supports some other sources
    // Reference: http://fluffy.github.io/w3c-screen-share/#screen-based-video-constraints
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1037405
    //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
    } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
      outputSources.mediaSource.push('browser', 'camera', 'application');
    }
  }

  callback(outputSources);
};

/**
 * Function that handles the muting of Stream audio and video tracks.
 * @method _muteStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._muteStreams = function () {
  var self = this;
  var hasVideo = false;
  var hasAudio = false;

  var muteFn = function (stream) {
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();

    for (var a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = !self._streamsMutedSettings.audioMuted;
      hasAudio = true;
    }

    for (var v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = !self._streamsMutedSettings.videoMuted;
      hasVideo = true;
    }

    self._streamMediaStatus.audioMuted = hasAudio ? (self._streamsMutedSettings.audioMuted ? self.MEDIA_STATUS.MUTED : self.MEDIA_STATUS.ACTIVE) : self.MEDIA_STATUS.UNAVAILABLE;
    self._streamMediaStatus.videoMuted = hasVideo ? (self._streamsMutedSettings.videoMuted ? self.MEDIA_STATUS.MUTED : self.MEDIA_STATUS.ACTIVE) : self.MEDIA_STATUS.UNAVAILABLE;
  };

  if (self._streams.userMedia && self._streams.userMedia.stream) {
    muteFn(self._streams.userMedia.stream);

    // screenshare stream to follow userMedia settings if userMedia stream is present
    if (self._streams.screenshare && self._streams.screenshare.stream) {
      muteFn(self._streams.screenshare.stream);
    }

    if (self._streams.screenshare && self._streams.screenshare.streamClone) {
      muteFn(self._streams.screenshare.streamClone);
    }
  }

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    for (var peerId in self._peerConnections) {
      if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
        var localStreams = self._peerConnections[peerId].getLocalStreams();
        for (var s = 0; s < localStreams.length; s++) {
          muteFn(localStreams[s]);
        }
      }
    }
  }

  log.debug('Updated Streams muted settings ->', self._streamsMutedSettings);

  return {
    hasVideo: hasVideo,
    hasAudio: hasAudio
  };
};

/**
 * Function that handles stopping the Stream streaming.
 * @method _stopStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._stopStreams = function (options, stopOnly) {
  var self = this;

  var removeTracksFromPC = function(track) {
    var peerIds = Object.keys(self._peerConnections);
    peerIds.forEach(function(peerId) {
      var pc = self._peerConnections[peerId]
      var senders = pc.getSenders();

      senders.forEach(function(sender) {
        if(sender.track && sender.track.id === track.id) {
          pc.removeTrack(sender);
        }
      })
    })
  };

  var stopFn = function (stream) {
    var streamId = stream.id || stream.label;
    log.debug([null, 'MediaStream', streamId, 'Stopping Stream ->'], stream);

    try {
      var audioTracks = stream.getAudioTracks();
      var videoTracks = stream.getVideoTracks();

      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].stop();
        if (!stopOnly) {
          removeTracksFromPC(audioTracks[a]);
        }
      }

      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].stop();
        if (!stopOnly) {
          removeTracksFromPC(videoTracks[v]);
        }
      }

    } catch (error) {
      stream.stop();
    }

    if (self._streamsStoppedCbs[streamId]) {
      self._streamsStoppedCbs[streamId]();
      delete self._streamsStoppedCbs[streamId];
    }
  };

  var updateMediaStateToUnavailable = function (streamId) {
    var mediaInfos = Object.values(self._peerMedias[self._user.sid]);
    for (var m = 0; m < mediaInfos.length; m++) {
      if (mediaInfos[m].streamId === streamId) {
        self._peerMedias[self._user.sid][mediaInfos[m].mediaId].mediaState = self.MEDIA_STATE.UNAVAILABLE;
      }
    }
  };

  var deleteUnavailableMedia = function () {
    var mediaInfos = Object.values(self._peerMedias[self._user.sid]);
    for (var m = 0; m < mediaInfos.length; m++) {
      if (mediaInfos[m].mediaState === self.MEDIA_STATE.UNAVAILABLE) {
        log.log([self._user.sid, 'PeerMedia', null, 'Media in \'unavailable\' state deleted'], self._peerMedias[self._user.sid][mediaInfos[m].mediaId]);
        delete self._peerMedias[self._user.sid][mediaInfos[m].mediaId];
      }
    }
  };

  var stopUserMedia = false;
  var stopScreenshare = false;
  var hasStoppedMedia = false;
  // userMedia and screen stream is removed in _streamsStoppedCbs
  var userMediaStreamId = self._streams.userMedia.stream ? self._streams.userMedia.stream.id : null;
  var scrennStreamId = self._streams.screenshare ? self._streams.screenshare.stream.id : null;

  // from sendStream to stop original stream before sending new stream
  if (!options.screenshare && !options.userMedia) { // options is a MediaStream object
    if (options.getTracks()) {
      stopFn(options);
    }
    return;
  }

  if (typeof options === 'object') {
    stopUserMedia = options.userMedia === true;
    stopScreenshare = options.screenshare === true;
  }

  if (stopUserMedia && self._streams.userMedia) {
    if (self._streams.userMedia.stream) {
      stopFn(self._streams.userMedia.stream);
    }

    updateMediaStateToUnavailable(userMediaStreamId);
    self._streams.userMedia = null;
    hasStoppedMedia = true;
  }

  if (stopScreenshare && self._streams.screenshare) {
    if (self._streams.screenshare.streamClone) {
      stopFn(self._streams.screenshare.streamClone);
    }

    if (self._streams.screenshare.stream) {
      stopFn(self._streams.screenshare.stream);
    }

    updateMediaStateToUnavailable(scrennStreamId);
    self._streams.screenshare = null;
    hasStoppedMedia = true;
  }

  self.once('handshakeProgress', function () {
    deleteUnavailableMedia();
  }, function (state) {
    return state === self.HANDSHAKE_PROGRESS.OFFER;
  });

  if (Object.keys(self._peerConnections).length > 0) {
    self._refreshPeerConnection(Object.keys(self._peerConnections), false, {}, function (err, success) {
      if (err) {
        log.error('Failed refreshing connections for stopStream() ->', err);
        return;
      }
    });
  } else {
    deleteUnavailableMedia();
  }

  if (self._inRoom && hasStoppedMedia) {
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  }

  log.log('Stopping Streams with settings ->', options);
};

/**
 * Function that parses the <code>getUserMedia()</code> settings provided.
 * @method _parseStreamSettings
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._parseStreamSettings = function(options) {
  var settings = {
    settings: { audio: false, video: false },
    mutedSettings: { shouldAudioMuted: false, shouldVideoMuted: false },
    getUserMediaSettings: { audio: false, video: false }
  };

  if (options.audio) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.audio = {
      stereo: false,
      exactConstraints: !!options.useExactConstraints,
      echoCancellation: true
    };
    settings.getUserMediaSettings.audio = {
      echoCancellation: true
    };

    if (typeof options.audio === 'object') {
      if (typeof options.audio.stereo === 'boolean') {
        settings.settings.audio.stereo = options.audio.stereo;
      }

      if (typeof options.audio.useinbandfec === 'boolean') {
        settings.settings.audio.useinbandfec = options.audio.useinbandfec;
      }

      if (typeof options.audio.usedtx === 'boolean') {
        settings.settings.audio.usedtx = options.audio.usedtx;
      }

      if (typeof options.audio.maxplaybackrate === 'number' &&
        options.audio.maxplaybackrate >= 8000 && options.audio.maxplaybackrate <= 48000) {
        settings.settings.audio.maxplaybackrate = options.audio.maxplaybackrate;
      }

      if (typeof options.audio.mute === 'boolean') {
        settings.mutedSettings.shouldAudioMuted = options.audio.mute;
      }

      // Not supported in Edge browser features
      if (AdapterJS.webrtcDetectedBrowser !== 'edge') {
        if (typeof options.audio.echoCancellation === 'boolean') {
          settings.settings.audio.echoCancellation = options.audio.echoCancellation;
          settings.getUserMediaSettings.audio.echoCancellation = options.audio.echoCancellation;
        }

        if (Array.isArray(options.audio.optional)) {
          settings.settings.audio.optional = clone(options.audio.optional);
          settings.getUserMediaSettings.audio.optional = clone(options.audio.optional);
        }

        if (options.audio.deviceId && typeof options.audio.deviceId === 'string' &&
          AdapterJS.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.audio.deviceId = options.audio.deviceId;
          settings.getUserMediaSettings.audio.deviceId = options.useExactConstraints ?
            { exact: options.audio.deviceId } : { ideal: options.audio.deviceId };
        }
      }
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    }
  }

  if (options.video) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.video = {
      resolution: clone(this.VIDEO_RESOLUTION.VGA),
      screenshare: false,
      exactConstraints: !!options.useExactConstraints
    };
    settings.getUserMediaSettings.video = {};

    if (typeof options.video === 'object') {
      if (typeof options.video.mute === 'boolean') {
        settings.mutedSettings.shouldVideoMuted = options.video.mute;
      }

      if (Array.isArray(options.video.optional)) {
        settings.settings.video.optional = clone(options.video.optional);
        settings.getUserMediaSettings.video.optional = clone(options.video.optional);
      }

      if (options.video.deviceId && typeof options.video.deviceId === 'string') {
        settings.settings.video.deviceId = options.video.deviceId;
        settings.getUserMediaSettings.video.deviceId = options.useExactConstraints ?
          { exact: options.video.deviceId } : { ideal: options.video.deviceId };
      }

      if (options.video.resolution && typeof options.video.resolution === 'object') {
        if ((options.video.resolution.width && typeof options.video.resolution.width === 'object') ||
          typeof options.video.resolution.width === 'number') {
          settings.settings.video.resolution.width = options.video.resolution.width;
        }
        if ((options.video.resolution.height && typeof options.video.resolution.height === 'object') ||
          typeof options.video.resolution.height === 'number') {
          settings.settings.video.resolution.height = options.video.resolution.height;
        }
      }

      settings.getUserMediaSettings.video.width = typeof settings.settings.video.resolution.width === 'object' ?
        settings.settings.video.resolution.width : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.width } : { max: settings.settings.video.resolution.width });

      settings.getUserMediaSettings.video.height = typeof settings.settings.video.resolution.height === 'object' ?
        settings.settings.video.resolution.height : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.height } : { max: settings.settings.video.resolution.height });

      if ((options.video.frameRate && typeof options.video.frameRate === 'object') ||
        typeof options.video.frameRate === 'number' && AdapterJS.webrtcDetectedType !== 'plugin') {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.frameRate = typeof settings.settings.video.frameRate === 'object' ?
          settings.settings.video.frameRate : (options.useExactConstraints ?
          { exact: settings.settings.video.frameRate } : { max: settings.settings.video.frameRate });
      }

      if (options.video.facingMode && ['string', 'object'].indexOf(typeof options.video.facingMode) > -1 && AdapterJS.webrtcDetectedType === 'plugin') {
        settings.settings.video.facingMode = options.video.facingMode;
        settings.getUserMediaSettings.video.facingMode = typeof settings.settings.video.facingMode === 'object' ?
          settings.settings.video.facingMode : (options.useExactConstraints ?
          { exact: settings.settings.video.facingMode } : { max: settings.settings.video.facingMode });
      }
    } else {
      settings.getUserMediaSettings.video = {
        width: options.useExactConstraints ? { exact: settings.settings.video.resolution.width } :
          { max: settings.settings.video.resolution.width },
        height: options.useExactConstraints ? { exact: settings.settings.video.resolution.height } :
          { max: settings.settings.video.resolution.height }
      };
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.settings.video = {
        screenshare: false,
        exactConstraints: !!options.useExactConstraints
      };
      settings.getUserMediaSettings.video = true;
    }
  }

  return settings;
};

/**
 * Function that parses the mediastream tracks for details.
 * @method _parseStreamTracksInfo
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStreamTracksInfo = function (streamKey, callback) {
	var self = this;
	var stream = self._streams[streamKey].stream;

	if (!stream) {
		log.warn('Unable to parse stream tracks information as the stream is not defined');
		return callback();
	}

	self._streams[streamKey].tracks = {
 		audio: null,
 		video: null
 	};

	// Currently, we are sending 1 audio and video track.
  var audioTracks = stream.getAudioTracks();
  var videoTracks = stream.getVideoTracks();

  if (audioTracks.length > 0) {
  	self._streams[streamKey].tracks.audio = {
  		id: audioTracks[0].id || '',
  		label: audioTracks[0].label || 'audio_track_0'
  	};
  }

  if (videoTracks.length === 0) {
  	return callback();
  }

  self._streams[streamKey].tracks.video = {
		id: videoTracks[0].id || '',
		label: videoTracks[0].label || 'video_track_0',
		width: null,
		height: null
	};

  callback();
}

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API success callback result.
 * @method _onStreamAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onStreamAccessSuccess = function(stream, settings, isScreenSharing, isAudioFallback, fromSendStream) {
  var self = this;
  var streamId = stream.id || stream.label;
  var streamHasEnded = false;

  log.log([null, 'MediaStream', streamId, 'Has access to stream ->'], stream);

  // Stop previous stream
  if (!isScreenSharing && self._streams.userMedia && !fromSendStream) {
    self._stopStreams({
      userMedia: true,
      screenshare: false
    });

  } else if (isScreenSharing && self._streams.screenshare && !fromSendStream) {
    self._stopStreams({
      userMedia: false,
      screenshare: true
    });
  }

  self._streamsStoppedCbs[streamId] = function () {
    log.log([null, 'MediaStream', streamId, 'Stream has ended']);
    streamHasEnded = true;
    self._trigger('mediaAccessStopped', !!isScreenSharing, !!isAudioFallback, streamId);

    if (self._inRoom) {
      // FIXME: remove - not needed as now renegotiation is triggered with mediaInfoList in offer
      // log.debug([null, 'MediaStream', streamId, 'Sending Stream ended status to Peers']);

      // self._sendChannelMessage({
      //   type: self._SIG_MESSAGE_TYPE.STREAM,
      //   mid: self._user.sid,
      //   rid: self._room.id,
      //   cid: self._key,
      //   streamId: streamId,
      //   settings: settings.settings,
      //   status: 'ended'
      // });

      self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true, !!isScreenSharing, streamId);

      if (isScreenSharing && self._streams.screenshare && self._streams.screenshare.stream &&
        (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label) === streamId) {
        self._streams.screenshare = null;

      } else if (!isScreenSharing && self._streams.userMedia && self._streams.userMedia.stream &&
        (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label) === streamId) {
        self._streams.userMedia = null;
      }
    }
  };

  // Handle event for Chrome / Opera
  if (['chrome', 'opera'].indexOf(AdapterJS.webrtcDetectedBrowser) > -1) {
    stream.oninactive = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };

    if (isScreenSharing && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].onended = function () {
        setTimeout(function () {
          if (!streamHasEnded && self._inRoom) {
            self.stopScreen();
          }
        }, 350);
      };
    }

  // Handle event for Firefox (use an interval)
  } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }
      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);

        if (self._streamsStoppedCbs[streamId]) {
          self._streamsStoppedCbs[streamId]();
          delete self._streamsStoppedCbs[streamId];
        }

      } else {
        stream.recordedTime = stream.currentTime;
      }
    }, 1000);

  } else {
    stream.onended = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };
  }

  if ((settings.settings.audio && stream.getAudioTracks().length === 0) ||
    (settings.settings.video && stream.getVideoTracks().length === 0)) {

    var tracksNotSameError = 'Expected audio tracks length with ' +
      (settings.settings.audio ? '1' : '0') + ' and video tracks length with ' +
      (settings.settings.video ? '1' : '0') + ' but received audio tracks length ' +
      'with ' + stream.getAudioTracks().length + ' and video ' +
      'tracks length with ' + stream.getVideoTracks().length;

    log.warn([null, 'MediaStream', streamId, tracksNotSameError]);

    var requireAudio = !!settings.settings.audio;
    var requireVideo = !!settings.settings.video;

    if (settings.settings.audio && stream.getAudioTracks().length === 0) {
      settings.settings.audio = false;
    }

    if (settings.settings.video && stream.getVideoTracks().length === 0) {
      settings.settings.video = false;
    }

    self._trigger('mediaAccessFallback', {
      error: new Error(tracksNotSameError),
      diff: {
        video: { expected: requireVideo ? 1 : 0, received: stream.getVideoTracks().length },
        audio: { expected: requireAudio ? 1 : 0, received: stream.getAudioTracks().length }
      }
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKED, !!isScreenSharing, !!isAudioFallback, streamId);
  }

  self._streams[ isScreenSharing ? 'screenshare' : 'userMedia' ] = {
  	id: streamId,
    stream: stream,
    settings: settings.settings,
    constraints: settings.getUserMediaSettings
  };

  self._muteStreams();

  self._parseStreamTracksInfo(isScreenSharing ? 'screenshare' : 'userMedia', function () {
  	self._trigger('mediaAccessSuccess', stream, !!isScreenSharing, !!isAudioFallback, streamId);
  });

  // build peerMedia
  var processPeerMedia = function () {
    var tracks = stream.getTracks();
    var peerMedia = self._user.sid ? self._peerMedias[self._user.sid] : self._peerMedias['self'] || {};

    for (var i = 0; i < tracks.length; i++) {
      var mediaId = (tracks[i].kind === self.TRACK_KIND.AUDIO ? 'AUDIO' : 'VIDEO') + '_' + stream.id;
      var mediaState = tracks[i].readyState === self.TRACK_READY_STATE.ENDED ? self.MEDIA_STATE.UNAVAILABLE : (tracks[i].muted ? self.MEDIA_STATE.MUTED : self.MEDIA_STATE.ACTIVE);
      peerMedia[mediaId] = {
        publisherId: self._user.sid || null,
        mediaId: mediaId,
        mediaType: tracks[i].kind === self.TRACK_KIND.AUDIO ? self.MEDIA_TYPE.AUDIO_MIC : (isScreenSharing ? self.MEDIA_TYPE.VIDEO_SCREEN : self.MEDIA_TYPE.VIDEO_CAMERA),
        mediaState: mediaState,
        transceiverMid: null,
        streamId: stream.id,
        trackId: tracks[i].id,
        mediaMetaData: '',
        simulcast: '',
      };

      if (self._user.sid) {
        self._peerMedias[self._user.sid] = peerMedia;
      } else {
        self._peerMedias['self'] = peerMedia;
      }
    }

  };
  processPeerMedia();
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API failure callback result.
 * @method _onStreamAccessError
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._onStreamAccessError = function(error, settings, isScreenSharing) {
  var self = this;

  if (!isScreenSharing && settings.settings.audio && settings.settings.video && self._initOptions.audioFallback) {
    log.debug('Fallbacking to retrieve audio only Stream');

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING, false, true);

    var onAudioSuccessCbFn = function (stream) {
      self._onStreamAccessSuccess(stream, settings, false, true);
    };

    var onAudioErrorCbFn = function (error) {
      log.error('Failed fallbacking to retrieve audio only Stream ->', error);

      self._trigger('mediaAccessError', error, false, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, self.MEDIA_ACCESS_FALLBACK_STATE.ERROR, false, true);
    };

    navigator.getUserMedia({ audio: true }, onAudioSuccessCbFn, onAudioErrorCbFn);
    return;
  }
  if (isScreenSharing) {
    log.warn('Failed retrieving screensharing Stream ->', error);
  } else {
    log.error('Failed retrieving camera Stream ->', error);
  }


  self._trigger('mediaAccessError', error, !!isScreenSharing, false);
};

/**
 * Function that handles the <code>RTCPeerConnection.onaddstream</code> remote MediaStream received.
 * @method _onRemoteStreamAdded
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, stream, isScreenSharing) {
  var self = this;
  var streamId = (self._peerConnections[targetMid] && self._peerConnections[targetMid].remoteStreamId) || stream.id || stream.label;

  var buildNewStream = function() {
    var audioTrack = null;
    var videoTrack = null;

    stream.getAudioTracks().forEach(function(track) {
      if (track.enabled && !track.muted) {
        audioTrack = track;
      }
    });

    stream.getVideoTracks().forEach(function(track) {
      if (track.enabled && !track.muted) {
        videoTrack = track;
      }
    });

    if (audioTrack && videoTrack) {
      return new MediaStream([audioTrack, videoTrack]);
    }

    return null;
  };

  var newStream = stream;
  if (stream.getTracks().length > 2) {
    newStream = buildNewStream();
  }

  if (!newStream) {
    return;
  }

  log.log([targetMid, 'MediaStream', streamId, 'Received remote stream ->'], newStream);

  if (isScreenSharing) {
    log.log([targetMid, 'MediaStream', streamId, 'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, newStream, false, self.getPeerInfo(targetMid), isScreenSharing, newStream.id);
  self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
};


/**
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>getUserMedia()</code> Stream.
 * @method _addLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  var self = this;

  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);

    var pc = self._peerConnections[peerId];

    if (pc) {
      var offerToReceiveAudio = !(!self._sdpSettings.connection.audio && peerId !== 'MCU') &&
        self._getSDPCommonSupports(peerId, pc.remoteDescription).video;
      var offerToReceiveVideo = !(!self._sdpSettings.connection.video && peerId !== 'MCU') &&
        self._getSDPCommonSupports(peerId, pc.remoteDescription).audio;

      if (pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          if (updatedStream ? (pc.localStreamId ? updatedStream.id !== pc.localStreamId : true) : true) {
            pc.getSenders().forEach(function (sender) {
              pc.removeTrack(sender);
              self._removeSenderFromList(peerId, sender);
            });

            if (!offerToReceiveAudio && !offerToReceiveVideo) {
              return;
            }

            if (updatedStream) {
                updatedStream.getTracks().forEach(function (track) {
                  if ((track.kind === 'audio' && !offerToReceiveAudio) || (track.kind === 'video' && !offerToReceiveVideo)) {
                    return;
                  }
                  var sender = pc.addTrack(track, updatedStream);

                  if (!self._currentRTCRTPSenders[peerId]) {
                    self._currentRTCRTPSenders[peerId] = [];
                  }

                  self._currentRTCRTPSenders[peerId].push(sender);
                });

              pc.localStreamId = updatedStream.id || updatedStream.label;
              pc.localStream = updatedStream;
            }
          }
        };

        if (self._streams.screenshare && self._streams.screenshare.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending screen'], self._streams.screenshare.stream);

          updateStreamFn(self._streams.screenshare.stream);

        } else if (self._streams.userMedia && self._streams.userMedia.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending stream'], self._streams.userMedia.stream);

          updateStreamFn(self._streams.userMedia.stream);

        } else {
          log.warn([peerId, 'MediaStream', null, 'No media to send. Will be only receiving']);

          updateStreamFn(null);
        }

      } else {
        log.warn([peerId, 'MediaStream', null,
          'Not adding any stream as signalingState is closed']);
      }
    } else {
      log.warn([peerId, 'MediaStream', self._mediaStream,
        'Not adding stream as peerconnection object does not exists']);
    }
  } catch (error) {
    if ((error.message || '').indexOf('already added') > -1) {
      log.warn([peerId, null, null, 'Not re-adding stream as LocalMediaStream is already added'], error);
    } else {
      // Fix errors thrown like NS_ERROR_UNEXPECTED
      log.error([peerId, null, null, 'Failed adding local stream'], error);
    }
  }
};

/**
 * Function that handles ended streams.
 * @method _handleEndedStreams
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleEndedStreams = function (peerId, checkStreamId) {
  var self = this;
  self._streamsSession[peerId] = self._streamsSession[peerId] || {};

  var renderEndedFn = function (streamId) {
    if (self._streamsSession[peerId][streamId]) {
      var peerInfo = clone(self.getPeerInfo(peerId));
      peerInfo.settings.audio = clone(self._streamsSession[peerId][streamId].audio);
      peerInfo.settings.video = clone(self._streamsSession[peerId][streamId].video);
      var hasScreenshare = peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
        !!peerInfo.settings.video.screenshare;
      self._streamsSession[peerId][streamId] = false;
      self._trigger('streamEnded', peerId, peerInfo, false, hasScreenshare, streamId);
    }
  };

  if (checkStreamId) {
    renderEndedFn(checkStreamId);
  } else if (self._peerConnections[peerId]) {
    for (var streamId in self._streamsSession[peerId]) {
      if (self._streamsSession[peerId].hasOwnProperty(streamId) && self._streamsSession[peerId][streamId]) {
        renderEndedFn(streamId);
      }
    }
  }
};

Skylink.prototype._removeSenderFromList = function(peerId, sender) {
  var indexToRemove = -1;
  if (!this._currentRTCRTPSenders[peerId]) {
    return;
  }
  var listOfSenders = this._currentRTCRTPSenders[peerId];
  for (var i = 0; i < listOfSenders.length; i++) {
    if (sender === listOfSenders[i]) {
      indexToRemove = i;
      break;
    }
  }
  if (indexToRemove !== -1) {
    listOfSenders.splice(i, 1);
    this._currentRTCRTPSenders[peerId] = listOfSenders;
  } else {
    log.warn([peerId, null, null, 'No matching sender was found for the peer'], sender);
  }
}

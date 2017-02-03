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
 * @param {Boolean} [options.audio.stereo=false] The flag if stereo band should be configured
 *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>Note that Peers may override the "receiving" <code>stereo</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.usedtx] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if DTX (Discontinuous Transmission) should be configured when encoding audio codec
 *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>usedtx</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.useinbandfec] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) should be
 *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>useinbandfec</code> config depending on the Peers configuration.</small>
 * @param {Number} [options.audio.maxplaybackrate] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
 *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>maxplaybackrate</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.audioMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.audioMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> audio tracks as well.</small>
 * @param {Array} [options.audio.optional] <blockquote class="info">
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
 * @param {Boolean} [options.audio.echoCancellation=false] The flag to enable audio tracks echo cancellation.
 * @param {Boolean|JSON} [options.video=false] <blockquote class="info">
 *    Note that the current Edge browser implementation does not support the <code>options.video.optional</code>,
 *    <code>options.video.deviceId</code>, <code>options.video.resolution</code> and
 *    <code>options.video.frameRate</code>, <code>options.video.facingMode</code>.</blockquote>
 *   The video configuration options.
 * @param {Boolean} [options.video.mute=false] The flag if video tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.videoMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
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
 *     if (window.webrtcDetectedBrowser === 'firefox') {
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
Skylink.prototype.getUserMedia = function(options,callback) {
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
      self._log.error(invalidOptionsError, options);
      if (typeof callback === 'function') {
        callback(new Error(invalidOptionsError), null);
      }
      return;
    }

  } else if (!options.audio && !options.video) {
    var noConstraintOptionsSelectedError = 'Please select audio or video';
    self._log.error(noConstraintOptionsSelectedError, options);
    if (typeof callback === 'function') {
      callback(new Error(noConstraintOptionsSelectedError), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && window.webrtcDetectedBrowser === 'chrome' &&
    window.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.getUserMedia + 'ms).';
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

    navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
      if (settings.mutedSettings.shouldAudioMuted) {
        self._streamsMutedSettings.audioMuted = true;
      }

      if (settings.mutedSettings.shouldVideoMuted) {
        self._streamsMutedSettings.videoMuted = true;
      }

      self._onStreamAccessSuccess(stream, settings, false, false);

    }, function (error) {
      self._onStreamAccessError(error, settings, false, false);
    });
  }, 'getUserMedia', self._throttlingTimeouts.getUserMedia);
};
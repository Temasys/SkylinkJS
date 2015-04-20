/**
 * Enables the stereo feature by modifying the SDP. This requires the OPUS
 * to be enabled in the connection first.
 * @method _addSDPStereo
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with Stereo feature
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._addSDPStereo = function(sdpLines) {
  var opusRtmpLineIndex = 0;
  var opusLineFound = false;
  var opusPayload = 0;
  var fmtpLineFound = false;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      var parts = line.split(' ');

      if (parts[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = parts[0].split(':')[1];
        opusRtmpLineIndex = i;
        break;
      }
    }
  }

  // if found
  if (opusLineFound) {
    log.debug([null, 'SDP', null, 'OPUS line is found. Enabling stereo']);

    // loop for fmtp payload
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('a=fmtp:' + opusPayload) === 0) {
        fmtpLineFound = true;
        sdpLines[j] += '; stereo=1';
        break;
      }
    }

    // if line doesn't exists for an instance firefox
    if (!fmtpLineFound) {
      sdpLines.splice(opusRtmpLineIndex, 0, 'a=fmtp:' + opusPayload + ' stereo=1');
    }
  }

  return sdpLines;
};


/**
 * Sets the video resolution by modifying the SDP.
 * - This is broken.
 * @method _setSDPVideoResolution
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Resolution settings
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPVideoResolution = function(sdpLines){
  var video = this._streamSettings.video;
  var frameRate = video.frameRate || 50;
  var resolution = {
    width: 320,
    height: 50
  }; //video.resolution || {};

  var videoLineFound = false;
  var videoLineIndex = 0;
  var fmtpPayloads = [];

  var i, j, k;
  var line;

  var sdpLineData = 'max-fr=' + frameRate +
    '; max-recv-width=320' + //(resolution.width ? resolution.width : 640) +
    '; max-recv-height=160'; //+ (resolution.height ? resolution.height : 480);

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=video') === 0 || line.indexOf('m=video') === 0) {
      videoLineFound = true;
      videoLineIndex = i;
      fmtpPayloads = line.split(' ');
      fmtpPayloads.splice(0, 3);
      break;
    }
  }

  if (videoLineFound) {
    // loop for every video codec
    // ignore if not vp8 or h264
    for (j = 0; j < fmtpPayloads.length; j += 1) {
      var payload = fmtpPayloads[j];
      var rtpmapLineIndex = 0;
      var fmtpLineIndex = 0;
      var fmtpLineFound = false;
      var ignore = false;

      for (k = 0; k < sdpLines.length; k += 1) {
       line = sdpLines[k];

        if (line.indexOf('a=rtpmap:' + payload) === 0) {
          // for non h264 or vp8 codec, ignore. these are experimental codecs
          // that may not exists afterwards
          if (!(line.indexOf('VP8') > 0 || line.indexOf('H264') > 0)) {
            ignore = true;
            break;
          }
          rtpmapLineIndex = k;
        }

        if (line.indexOf('a=fmtp:' + payload) === 0) {
          fmtpLineFound = true;
          fmtpLineIndex = k;
        }
      }

      if (ignore) {
        continue;
      }

      if (fmtpLineFound) {
        sdpLines[fmtpLineIndex] += ';' + sdpLineData;

      } else {
        sdpLines.splice(rtpmapLineIndex + 1, 0, 'a=fmtp:' + payload + ' ' + sdpLineData);
      }
    }

    log.debug([null, 'SDP', null, 'Setting video resolution (broken)']);
  }
  return sdpLines;
};

/**
 * Set the audio, video and data streamming bandwidth by modifying the SDP.
 * It sets the bandwidth when the connection is good. In low bandwidth environment,
 * the bandwidth is managed by the browser.
 * @method _setSDPBitrate
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(sdpLines, settings) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;
  var hasAudio = !!(settings || {}).audio;
  var hasVideo = !!(settings || {}).video;

  var i;

  var audioIndex = 0;
  var videoIndex = 0;
  var dataIndex = 0;

  var audioLineFound = false;
  var videoLineFound = false;
  var dataLineFound = false;

  for (i = 0; i < sdpLines.length; i += 1) {

    // set the audio bandwidth
    if (sdpLines[i].indexOf('a=audio') === 0 || sdpLines[i].indexOf('m=audio') === 0) {
      audioIndex = i;
      audioLineFound = true;
      continue;
    }

    // set the video bandwidth
    if (sdpLines[i].indexOf('a=video') === 0 || sdpLines[i].indexOf('m=video') === 0) {
      videoIndex = i;
      videoLineFound = true;
      continue;
    }

    // set the data bandwidth
    if (sdpLines[i].indexOf('a=data') === 0 || sdpLines[i].indexOf('m=data') === 0) {
      dataIndex = i;
      dataLineFound = true;
    }
  }

  if (audioLineFound) {
    sdpLines.splice(audioIndex + 1, 0, 'b=AS:' + bandwidth.audio);

    log.debug([null, 'SDP', null, 'Setting audio bitrate (' +
      bandwidth.audio + ')'], audioIndex);
  }

  if (videoLineFound) {
    sdpLines.splice(videoIndex + 1, 0, 'b=AS:' + bandwidth.video);

    log.debug([null, 'SDP', null, 'Setting video bitrate (' +
      bandwidth.video + ')'], videoIndex);
  }

  if (dataLineFound) {
    sdpLines.splice(dataIndex + 1, 0, 'b=AS:' + bandwidth.data);

    log.debug([null, 'SDP', null, 'Setting data bitrate (' +
      bandwidth.data + ')'], dataIndex);
  }
  return sdpLines;
};

/**
 * Removes Firefox 32 H262 preference in the SDP to prevent breaking connection in
 * unsupported browsers.
 * @method _removeSDPFirefoxH264Pref
 * @param {Array} sdpLines The session description received.
 * @return {Array} Updated session description.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    log.debug([null, 'SDP', null, 'Firefox H264 invalid pref found:'], invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};
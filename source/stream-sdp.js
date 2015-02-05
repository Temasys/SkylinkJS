/**
 * Finds a line in the SDP that contains the condition string and returns it.
 * @method _findSDPLine
 * @param {Array} sdpLines Sdp received.
 * @param {Array} condition Return if one of the conditions satisfies.
 * @return {Array} [index, line] - Returns the sdpLines based on the condition
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._findSDPLine = function(sdpLines, condition) {
  for (var index in sdpLines) {
    if (sdpLines.hasOwnProperty(index)) {
      for (var c = 0; c < condition.length; c++) {
        if (typeof sdpLines[index] === 'string') {
          if (sdpLines[index].indexOf(condition[c]) === 0) {
            return [index, sdpLines[index]];
          }
        } else {
          log.warn([null, 'SDP', index, 'SDP line is not defined'], sdpLines[index]);
        }
      }
    }
  }
  return [];
};

/**
 * Enables the stereo feature by modifying the SDP. This requires the OPUS
 * to be enabled in the connection first.
 * @method _addSDPStereo
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with Stereo feature
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._addSDPStereo = function(sdpLines) {
  var opusLineFound = false,
    opusPayload = 0;
  // Check if opus exists
  var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
  if (rtpmapLine.length) {
    if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
      opusLineFound = true;
      opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
    }
  }
  // Find the A=FMTP line with the same payload
  if (opusLineFound) {
    var fmtpLine = this._findSDPLine(sdpLines, ['a=fmtp:' + opusPayload]);
    if (fmtpLine.length) {
      sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
    }

    log.debug([null, 'SDP', null, 'OPUS line is found. Enabling stereo']);
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
 * @since 0.5.6
 */
Skylink.prototype._setSDPVideoResolution = function(sdpLines){
  var video = this._streamSettings.video;
  var frameRate = video.frameRate || 50;
  var resolution = video.resolution || {};
  var fmtpLine = this._findSDPLine(sdpLines, ['a=fmtp:']);
  if (fmtpLine.length){
    sdpLines.splice(fmtpLine[0], 1,fmtpLine[1] + ';max-fr=' + frameRate +
      ';max-recv-width=' + (resolution.width ? resolution.width : 640) +
      ';max-recv-height=' + (resolution.height ? resolution.height : 480));
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
 * @since 0.5.7
 */
Skylink.prototype._setSDPBitrate = function(sdpLines, settings) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;
  var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
  var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;

  var hasAudio = !!(settings || {}).audio;
  var hasVideo = !!(settings || {}).video;
  
  // Find the RTPMAP with Audio Codec
  if (maLineFound && cLineFound) {
    if (bandwidth.audio && hasAudio) {
      var audioLine = this._findSDPLine(sdpLines, ['a=audio', 'm=audio']);
      sdpLines.splice(audioLine[0], 1, audioLine[1], 'b=AS:' + bandwidth.audio);

      log.debug([null, 'SDP', null, 'Setting audio bitrate (' +
        bandwidth.audio + ')'], audioLine);
    }
    if (bandwidth.video && hasVideo) {
      var videoLine = this._findSDPLine(sdpLines, ['a=video', 'm=video']);
      sdpLines.splice(videoLine[0], 1, videoLine[1], 'b=AS:' + bandwidth.video);

      log.debug([null, 'SDP', null, 'Setting video bitrate (' +
        bandwidth.video + ')'], videoLine);
    }
    if (bandwidth.data && this._enableDataChannel) {
      var dataLine = this._findSDPLine(sdpLines, ['a=application', 'm=application']);
      sdpLines.splice(dataLine[0], 1, dataLine[1], 'b=AS:' + bandwidth.data);

      log.debug([null, 'SDP', null, 'Setting data bitrate (' +
        bandwidth.data + ')'], dataLine);
    }
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
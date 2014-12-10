/**
 * Finds a line in the SDP that contains the condition string and returns it.
 * @method _findSDPLine
 * @param {Array} sdpLines Sdp received.
 * @param {Array} condition Return if one of the conditions satisfies.
 * @return {Array} [index, line] - Returns the sdpLines based on the condition
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._findSDPLine = function(sdpLines, condition) {
  for (var index in sdpLines) {
    if (sdpLines.hasOwnProperty(index)) {
      for (var c=0; c<condition.length; c++) {
          if (sdpLines[index].indexOf(condition[c]) === 0) {
            return [index, sdpLines[index]];
          }
        }
      }
    }
  return [];
};

/**
 * Adds stereo feature to the SDP.
 * - This requires OPUS to be enabled in the SDP or it will not work.
 * @method _addSDPStereo
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with Stereo feature
 * @private
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
  }
  return sdpLines;
};


/**
 * Set Audio, Video and Frame rate in SDP
 * @method _setSDPVideoResolution
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Resolution settings
 * @private
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
  }
  return sdpLines;
};

/**
 * Set Audio, Video and Data Bitrate in SDP
 * @method _setSDPBitrate
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Bandwidth settings
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._setSDPBitrate = function(sdpLines) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;
  var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
  var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
  // Find the RTPMAP with Audio Codec
  if (maLineFound && cLineFound) {
    if (bandwidth.audio) {
      var audioLine = this._findSDPLine(sdpLines, ['a=mid:audio', 'm=mid:audio']);
      sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
    }   
    if (bandwidth.video) {
      var videoLine = this._findSDPLine(sdpLines, ['a=mid:video', 'm=mid:video']);
      sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
    }
    if (bandwidth.data) {
      var dataLine = this._findSDPLine(sdpLines, ['a=mid:data', 'm=mid:data']);
      sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
    }
  }
  return sdpLines;
};

/**
 * Removes Firefox 32 H264 preference in sdp.
 * - As noted in bugzilla as bug in [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1064247).
 * @method _removeSDPFirefoxH264Pref
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version removing Firefox h264 pref support.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    log.debug('Firefox H264 invalid pref found:', invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};
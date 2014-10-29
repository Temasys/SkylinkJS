/**
 * Finds a line in the SDP and returns it.
 * - To set the value to the line, add an additional parameter to the method.
 * @method _findSDPLine
 * @param {Array} sdpLines Sdp received.
 * @param {Array} condition The conditions.
 * @param {String} value Value to set Sdplines to
 * @return {Array} [index, line] - Returns the sdpLines based on the condition
 * @private
 * @since 0.2.0
 */
Skylink.prototype._findSDPLine = function(sdpLines, condition, value) {
  for (var index in sdpLines) {
    if (sdpLines.hasOwnProperty(index)) {
      for (var c in condition) {
        if (condition.hasOwnProperty(c)) {
          if (sdpLines[index].indexOf(c) === 0) {
            sdpLines[index] = value;
            return [index, sdpLines[index]];
          }
        }
      }
    }
  }
  return [];
};

/**
 * Adds stereo feature to the SDP.
 * - This requires OPUS to be enabled in the SDP or it will not work.
 * @method _addStereo
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with Stereo feature
 * @private
 * @since 0.2.0
 */
Skylink.prototype._addStereo = function(sdpLines) {
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
 * Set Audio, Video and Data Bitrate in SDP
 * @method _setSDPBitrate
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version with custom Bandwidth settings
 * @private
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
 * @method _removeFirefoxH264Pref
 * @param {Array} sdpLines Sdp received.
 * @return {Array} Updated version removing Firefox h264 pref support.
 * @private
 * @since 0.5.2
 */
Skylink.prototype._removeFirefoxH264Pref = function(sdpLines) {
  var invalidLineIndex = sdpLines.indexOf(
    'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');
  if (invalidLineIndex > -1) {
    this._log(this.LOG_LEVEL.DEBUG, 'Firefox H264 invalid pref found: ', invalidLineIndex);
    sdpLines.splice(invalidLineIndex, 1);
  }
  return sdpLines;
};
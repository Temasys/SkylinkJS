/**
 * Modifies the array of session description received to enable
 *   stereo in the audio streaming connection.
 * @method _addSDPStereo
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    with the stereo feature.
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
 * <b>BROKEN (not in use)</b>. Modifies the array of session description received to set
 *   a custom video resolution in the video streaming connection.
 * @method _setSDPVideoResolution
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    with the custom video resolution.
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
 * Modifies the array of session description received to set
 *   a custom bandwidth bitrate (in kbps) in the streaming connection.
 * Setting the bandwidth flags may not
 *   force set the bandwidth for each connection stream channels as it depends
 *   on how the browser handles the bandwidth bitrate.
 * @method _setSDPBitrate
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    with custom bandwidth bitrate (in kbps) settings.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(sdpLines, settings) {
  // Find if user has audioStream
  var bandwidth = this._streamSettings.bandwidth;

  // Prevent setting of bandwidth audio if not configured
  if (typeof bandwidth.audio === 'number' && bandwidth.audio > 0) {
    var hasSetAudio = false;

    for (var i = 0; i < sdpLines.length; i += 1) {
      // set the audio bandwidth
      if (sdpLines[i].indexOf('m=audio') === 0) {
      //if (sdpLines[i].indexOf('a=audio') === 0 || sdpLines[i].indexOf('m=audio') === 0) {
        sdpLines.splice(i + 1, 0, 'b=AS:' + bandwidth.audio);

        log.info([null, 'SDP', null, 'Setting maximum sending audio bitrate @(index:' + i + ') -> '], bandwidth.audio);
        hasSetAudio = true;
        break;
      }
    }

    if (!hasSetAudio) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending audio bitrate as m=audio line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending audio bitrate and leaving to browser\'s defaults']);
  }

  // Prevent setting of bandwidth video if not configured
  if (typeof bandwidth.video === 'number' && bandwidth.video > 0) {
    var hasSetVideo = false;

    for (var j = 0; j < sdpLines.length; j += 1) {
      // set the video bandwidth
      if (sdpLines[j].indexOf('m=video') === 0) {
      //if (sdpLines[j].indexOf('a=video') === 0 || sdpLines[j].indexOf('m=video') === 0) {
        sdpLines.splice(j + 1, 0, 'b=AS:' + bandwidth.video);

        log.info([null, 'SDP', null, 'Setting maximum sending video bitrate @(index:' + j + ') -> '], bandwidth.video);
        hasSetVideo = true;
        break;
      }
    }

    if (!hasSetVideo) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending video bitrate as m=video line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending video bitrate and leaving to browser\'s defaults']);
  }

  // Prevent setting of bandwidth data if not configured
  if (typeof bandwidth.data === 'number' && bandwidth.data > 0) {
    var hasSetData = false;

    for (var k = 0; k < sdpLines.length; k += 1) {
      // set the data bandwidth
      if (sdpLines[k].indexOf('m=application') === 0) {
      //if (sdpLines[k].indexOf('a=application') === 0 || sdpLines[k].indexOf('m=application') === 0) {
        sdpLines.splice(k + 1, 0, 'b=AS:' + bandwidth.data);

        log.info([null, 'SDP', null, 'Setting maximum sending data bitrate @(index:' + k + ') -> '], bandwidth.data);
        hasSetData = true;
        break;
      }
    }

    if (!hasSetData) {
      log.warn([null, 'SDP', null, 'Not setting maximum sending data bitrate as m=application line is not found']);
    }
  } else {
    log.warn([null, 'SDP', null, 'Not setting maximum sending data bitrate and leaving to browser\'s defaults']);
  }

  return sdpLines;
};

/**
 * Modifies the array of session description received to configure
 *   the selected video codec to use in the video streaming connection.
 * @method _setSDPVideoCodec
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    with the selected video codec.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPVideoCodec = function(sdpLines) {
  log.log('Setting video codec', this._selectedVideoCodec);
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedVideoCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
        break;
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=video') === 0 || line.indexOf('a=video') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Modifies the array of session description received to configure
 *   the selected audio codec to use in the audio streaming connection.
 * @method _setSDPAudioCodec
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    with the selected audio codec.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setSDPAudioCodec = function(sdpLines) {
  log.log('Setting audio codec', this._selectedAudioCodec);
  var codecFound = false;
  var payload = 0;

  var i, j;
  var line;

  for (i = 0; i < sdpLines.length; i += 1) {
    line = sdpLines[i];

    if (line.indexOf('a=rtpmap:') === 0) {
      if (line.indexOf(this._selectedAudioCodec) > 0) {
        codecFound = true;
        payload = line.split(':')[1].split(' ')[0];
      }
    }
  }

  if (codecFound) {
    for (j = 0; j < sdpLines.length; j += 1) {
      line = sdpLines[j];

      if (line.indexOf('m=audio') === 0 || line.indexOf('a=audio') === 0) {
        var parts = line.split(' ');
        var payloads = line.split(' ');
        payloads.splice(0, 3);

        var selectedPayloadIndex = payloads.indexOf(payload);

        if (selectedPayloadIndex === -1) {
          payloads.splice(0, 0, payload);
        } else {
          var first = payloads[0];
          payloads[0] = payload;
          payloads[selectedPayloadIndex] = first;
        }
        sdpLines[j] = parts[0] + ' ' + parts[1] + ' ' + parts[2] + ' ' + payloads.join(' ');
        break;
      }
    }
  }
  return sdpLines;
};

/**
 * Modifies the array of session description received to remove the
 *   Firefox 32 H262 preference to prevent breaking connection with nsupported browsers.
 * @method _removeSDPFirefoxH264Pref
 * @param {Array} sdpLines The array of lines in the session description.
 * @return {Array} The updated array of lines in the session description
 *    removed of the Firefox 32 H262 preference.
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

/**
 * Modifies the session description received to append the correct ssrc lines for Firefox.
 * @method _addSDPSsrcFirefoxAnswer
 * @param {String} targetMid The peer connection ID.
 * @param {String} answerSdp The answer session description.
 * @return {String} The update answer session description with correct SSRC lines.
 * @private
 * @component SDP
 * @for Skylink
 * @since 0.6.6
 */
Skylink.prototype._addSDPSsrcFirefoxAnswer = function (targetMid, sdp) {
  var self = this;
  var agent = self.getPeerInfo(targetMid).agent;

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, 'RTCSessionDesription', 'answer', 'Peer connection object ' +
      'not found. Unable to parse answer session description for peer']);
    return;
  }

  var updatedSdp = sdp;

  // for this case, this is because firefox uses Unified Plan and Chrome uses
  // Plan B. we have to remodify this a bit to let the non-ff detect as new mediastream
  // as chrome/opera/safari detects it as default due to missing ssrc specified as used in plan B.
  if (window.webrtcDetectedBrowser === 'firefox' && agent.name !== 'firefox' &&
    //pc.remoteDescription.sdp.indexOf('a=msid-semantic: WMS *') === -1 &&
    updatedSdp.indexOf('a=msid-semantic:WMS *') > 0) {
    // start parsing
    var sdpLines = updatedSdp.split('\r\n');
    var streamId = '';
    var replaceSSRCSemantic = -1;
    var i;
    var trackId = '';

    var parseTracksSSRC = function (track) {
      for (i = 0, trackId = ''; i < sdpLines.length; i++) {
        if (!!trackId) {
          if (sdpLines[i].indexOf('a=ssrc:') === 0) {
            var ssrcId = sdpLines[i].split(':')[1].split(' ')[0];
            sdpLines.splice(i+1, 0, 'a=ssrc:' + ssrcId +  ' msid:' + streamId + ' ' + trackId,
              'a=ssrc:' + ssrcId + ' mslabel:default',
              'a=ssrc:' + ssrcId + ' label:' + trackId);
            break;
          } else if (sdpLines[i].indexOf('a=mid:') === 0) {
            break;
          }
        } else if (sdpLines[i].indexOf('a=msid:') === 0) {
          if (i > 0 && sdpLines[i-1].indexOf('a=mid:' + track) === 0) {
            var parts = sdpLines[i].split(':')[1].split(' ');

            streamId = parts[0];
            trackId = parts[1];
            replaceSSRCSemantic = true;
          }
        }
      }
    };

    parseTracksSSRC('video');
    parseTracksSSRC('audio');

    /*if (replaceSSRCSemantic) {
      for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].indexOf('a=msid-semantic:WMS ') === 0) {
          var parts = sdpLines[i].split(' ');
          parts[parts.length - 1] = streamId;
          sdpLines[i] = parts.join(' ');
          break;
        }
      }

    }*/
    updatedSdp = sdpLines.join('\r\n');

    log.debug([targetMid, 'RTCSessionDesription', 'answer', 'Parsed remote description from firefox'], sdpLines);
  }

  return updatedSdp;
};
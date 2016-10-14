/**
 * Stores the preferred sending Peer connection streaming audio codec.
 * @attribute _selectedAudioCodec
 * @type String
 * @default "auto"
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedAudioCodec = 'auto';

/**
 * Stores the preferred sending Peer connection streaming video codec.
 * @attribute _selectedVideoCodec
 * @type String
 * @default "auto"
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedVideoCodec = 'auto';

/**
 * Function that modifies the session description to configure settings for OPUS audio codec.
 * @method _addSDPOpusConfig
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addSDPOpusConfig = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var payload = null;
  var settings = {
    stereo: false,
    useinbandfec: null,
    usedtx: null
  };
  var audioSettings = this.getPeerInfo().settings.audio;

  if (audioSettings && typeof audioSettings === 'object') {
    settings.stereo = audioSettings.stereo === true;
    settings.useinbandfec = typeof audioSettings.useinbandfec === 'boolean' ? audioSettings.useinbandfec : null;
    settings.usedtx = typeof audioSettings.usedtx === 'boolean' ? audioSettings.usedtx : null;
  }

  log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Received OPUS config ->'], settings);

  // Find OPUS RTPMAP line
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf('opus/48000/') > 0) {
      payload = (sdpLines[i].split(' ')[0] || '').split(':')[1] || null;
      break;
    }
  }

  if (!payload) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Failed to find OPUS payload. Not configuring options.']);
    return sessionDescription.sdp;
  }

  // Set OPUS FMTP line
  for (var j = 0; j < sdpLines.length; j++) {
    if (sdpLines[j].indexOf('a=fmtp:' + payload) === 0) {
      var opusFmtpLine = sdpLines[j].split(':');

      if ((opusFmtpLine[1] || '').indexOf('useinbandfec=1') > -1 && settings.useinbandfec === null) {
        log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Received OPUS useinbandfec as true by default.']);
        settings.useinbandfec = true;
      }

      if ((opusFmtpLine[1] || '').indexOf('usedtx=1') > -1 && settings.usedtx === null) {
        log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Received OPUS usedtx as true by default.']);
        settings.usedtx = true;
      }

      log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Setting OPUS config ->'], settings);

      var updatedOpusConfig = '';

      if (settings.stereo === true) {
        updatedOpusConfig += 'stereo=1;sprop-stereo=1;';
      }

      if (settings.useinbandfec === true) {
        updatedOpusConfig += 'useinbandfec=1;';
      }

      if (settings.usedtx === true) {
        updatedOpusConfig += 'usedtx=1;';
      }

      sdpLines[j] = 'a=fmtp:' + payload + ' ' + updatedOpusConfig;
      break;
    }
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to limit the maximum sending bandwidth.
 * Setting this may not necessarily work in Firefox.
 * @method _setSDPBitrate
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, bw) {
    if (!(typeof bw === 'number' && bw > 0)) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not limiting "' + type + '" bandwidth']);
      return;
    }

    var mLineType = type;

    if (type === 'data') {
      mLineType = 'application';
    }

    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + mLineType) === 0) {
        log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Limiting maximum sending "' + type + '" bandwidth ->'], bw);

        sdpLines.splice(i + 1, 0, window.webrtcDetectedBrowser === 'firefox' ?
          'b=TIAS:' + (bw * 1024) : 'b=AS:' + bw);
        return;
      }
    }
  };

  parseFn('audio', this._streamsBandwidthSettings.audio);
  parseFn('video', this._streamsBandwidthSettings.video);
  parseFn('data', this._streamsBandwidthSettings.data);

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to set the preferred audio/video codec.
 * @method _setSDPCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._setSDPCodec = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, codec) {
    if (codec === 'auto') {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not preferring any codec for "' + type + '" streaming. Using browser selection.']);
      return;
    }

    var payload = null;

    // Find the codec first
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf(codec.toLowerCase()) > 0) {
        payload = sdpLines[i].split(':')[1].split(' ')[0];
      }
    }

    if (!payload) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not preferring "' +
        codec + '" for "' + type + '" streaming as payload is not found.']);
      return;
    }

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('m=' + type) === 0) {
        log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Preferring "' +
          codec + '" for "' + type + '" streaming.']);

        var parts = sdpLines[j].split(' ');

        if (parts.indexOf(payload) > 2) {
          parts.splice(payload, 1);
        }

        // Example: m=audio 9 UDP/TLS/RTP/SAVPF 111
        parts.splice(3, 0, payload);
        sdpLines[j] = parts.join(' ');
        break;
      }
    }
  };

  parseFn('audio', this._selectedAudioCodec);
  parseFn('video', this._selectedVideoCodec);

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove the previous experimental H264
 * codec that is apparently breaking connections.
 * NOTE: We should perhaps not remove it since H264 is supported?
 * @method _removeSDPFirefoxH264Pref
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var experimentalLineIndex = sdpLines.indexOf('a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');

  if (experimentalLineIndex > -1) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Removing Firefox experimental H264 flag to ensure interopability reliability']);
    sdpLines.splice(experimentalLineIndex, 1);
  }
  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to append the MediaStream and MediaStreamTrack IDs that seems
 * to be missing from Firefox answer session description to Chrome connection causing freezes in re-negotiation.
 * @method _addSDPMediaStreamTrackIDs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addSDPMediaStreamTrackIDs = function (targetMid, sessionDescription) {
  if (!(this._peerConnections[targetMid] && this._peerConnections[targetMid].getLocalStreams().length > 0)) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Not enforcing MediaStream IDs as no Streams is sent.']);
    return sessionDescription.sdp;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');
  var agent = ((this._peerInformations[targetMid] || {}).agent || {}).name || '';
  var localStream = this._peerConnections[targetMid].getLocalStreams()[0];
  var localStreamId = localStream.id || localStream.label;

  var parseFn = function (type, tracks) {
    if (tracks.length === 0) {
      log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not enforcing "' + type + '" MediaStreamTrack IDs as no Stream "' + type + '" tracks is sent.']);
      return;
    }

    var trackId = tracks[0].id || tracks[0].label;
    var ssrcId = null;
    var hasReachedType = false;

    // Get SSRC ID
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + type) === 0) {
        if (!hasReachedType) {
          hasReachedType = true;
          continue;
        } else {
          break;
        }
      }

      if (hasReachedType && sdpLines[i].indexOf('a=ssrc:') === 0) {
        ssrcId = (sdpLines[i].split(':')[1] || '').split(' ')[0] || null;

        var msidLine = 'a=ssrc:' + ssrcId + ' msid:' + localStreamId + ' ' + trackId;
        var mslabelLine = 'a=ssrc:' + ssrcId + ' mslabel:default';
        var labelLine = 'a=ssrc:' + ssrcId + ' label:' + trackId;

        if (sdpLines.indexOf(msidLine) === -1) {
          sdpLines.splice(i + 1, 0, msidLine);
          i++;
        }

        if (sdpLines.indexOf(mslabelLine) === -1) {
          sdpLines.splice(i + 1, 0, mslabelLine);
          i++;
        }

        if (sdpLines.indexOf(labelLine) === -1) {
          sdpLines.splice(i + 1, 0, labelLine);
          i++;
        }
        break;
      }
    }
  };

  parseFn('audio', localStream.getAudioTracks());
  parseFn('video', localStream.getVideoTracks());

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove VP9 and H264 apt/rtx lines to prevent plugin connection breaks.
 * @method _removeH264VP9AptRtxForOlderPlugin
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeH264VP9AptRtxForOlderPlugin = function (targetMid, sessionDescription) {
  var removeVP9AptRtxPayload = false;
  var agent = (this._peerInformations[targetMid] || {}).agent || {};

  if (agent.pluginVersion) {
    // 0.8.870 supports
    var parts = agent.pluginVersion.split('.');
    removeVP9AptRtxPayload = parseInt(parts[0], 10) >= 0 && parseInt(parts[1], 10) >= 8 &&
      parseInt(parts[2], 10) >= 870;
  }

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1 && removeVP9AptRtxPayload) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Removing VP9/H264 apt= and rtx payload lines causing connectivity issues']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=101\r\n/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=107\r\n/g, '');
  }

  return sessionDescription.sdp;
};

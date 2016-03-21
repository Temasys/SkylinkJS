/**
 * Handles the SDP parsing functionalities.
 * @attribute _SDPParser
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.x
 */
Skylink.prototype._SDPParser = {

  /**
   * Handles the Firefox MCU answer mangling.
   * @method configureMCUFirefoxAnswer
   * @param {String} sdpString The local answer RTCSessionDescription.sdp.
   * @return {String} updatedSdpString The modified local answer RTCSessionDescription.sdp
   *   for Firefox connection with MCU Peer.
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  configureMCUFirefoxAnswer: function (sdpString) {
    var newSdpString = '';

    /* NOTE: Do we still need these fixes? There is no clear reason for this (undocumented sorry) */
    // Remove all "generation 0"
    newSdpString = sdpString.replace(/ generation 0/g, '');
    newSdpString = newSdpString.replace(/ udp /g, ' UDP ');

    // Return modified RTCSessionDescription.sdp
    return newSdpString;
  },

  /**
   * Handles the Firefox to other browsers SSRC lines received that instead of interpretating
   *   as "default" for MediaStream.id, interpret as the original id given.
   * Check if sender of local answer RTCSessionDescription is Firefox and
   *   receiver is other browsers before parsing it.
   * @method configureFirefoxAnswerSSRC
   * @param {String} sdpString The local answer RTCSessionDescription.sdp.
   * @return {String} updatedSdpString The modified local answer RTCSessionDescription.sdp
   *   for Firefox connection with Peers connecting with other agents.
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  configureFirefoxAnswerSSRC: function (sdpString) {
    // Check if there is a line to point to a specific MediaStream ID
    if (sdpString.indexOf('a=msid-semantic:WMS *') > 0) {
      var sdpLines = sdpString.split('\r\n'),
          streamId = '',
          shouldReplaceSSRCSemantic = -1;

      /**
       * Loops and checks if there is any MediaStream ID or MediaStreamTrack ID to replace based on the type provided
       */
      var parseTracksSSRCFn = function (track) {
        var trackId = '';

        // Loop out for the a=msid: line that contains the {MediaStream ID} {MediaStreamTrack ID} based on
        // track type provided - "audio" / "video"
        for (var i = 0; i < sdpLines.length; i++) {
          // Check if there is a MediaStreamTrack ID that exists, start appending the tracks
          if (!!trackId) {
            // Check if there is a=ssrc: lines to pass in the extra ssrc lines with the label and MediaStream ID.
            if (sdpLines[i].indexOf('a=ssrc:') === 0) {
              var ssrcId = sdpLines[i].split(':')[1].split(' ')[0];

              sdpLines.splice(i+1, 0, 'a=ssrc:' + ssrcId +  ' msid:' + streamId + ' ' + trackId,
                'a=ssrc:' + ssrcId + ' mslabel:default',
                'a=ssrc:' + ssrcId + ' label:' + trackId);
              break;

            // Prevent going to the next track type or track
            } else if (sdpLines[i].indexOf('a=mid:') === 0) {
              break;
            }

          } else if (sdpLines[i].indexOf('a=msid:') === 0) {
            if (i > 0 && sdpLines[i-1].indexOf('a=mid:' + track) === 0) {
              var parts = sdpLines[i].split(':')[1].split(' ');

              streamId = parts[0];
              trackId = parts[1];
              shouldReplaceSSRCSemantic = true;
            }
          }
        }
      };

      parseTracksSSRCFn('video');
      parseTracksSSRCFn('audio');

      // Commenting out for now as this lines seems to not affect functionality
      /*if (shouldReplaceSSRCSemantic) {
        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('a=msid-semantic:WMS ') === 0) {
            var parts = sdpLines[i].split(' ');
            parts[parts.length - 1] = streamId;
            sdpLines[i] = parts.join(' ');
            break;
          }
        }

      }*/

      // Return modified RTCSessionDescription.sdp
      return sdpLines.join('\r\n');
    }

    return sdpString;
  },

  /**
   * Handles the OPUS stereo flag configuration.
   * @method configureOPUSStereo
   * @param {String} sdpString The local RTCSessionDescription.sdp.
   * @param {Boolean} [enableStereo=false] The flag that indicates if stereo should
   *   be enabled for using OPUS audio codec.
   * @return {String} updatedSdpString The modification local RTCSessionDescription.sdp
   *   for connection using OPUS audio codec to have stereo enabled.
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  configureOPUSStereo: function (sdpString, enableStereo) {
    var sdpLines = sdpString.split('\r\n'),
        opusFmtpLine = null;

    // Loop out and search for the OPUS codec line to obtain the fmtp line
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=rtpmap:') === 0 && sdpLines[i].indexOf('opus/48000/') > 0) {
        var parts = sdpLines[i].split(':');

        // Prevent undefined content
        if (typeof parts[1] === 'string') {
          opusFmtpLine = parts[1].split(' ')[0];
        }
        break;
      }
    }

    /**
     * Loops and parses the payload based on the config line given
     */
    var parsePayloadFn = function (line, flag) {
      var lineParts = line.split(' '),
        hasFlag = false;

      // Remove the fmtp:payload line
      lineParts.splice(0, 1);

      // Split the lines into ";"
      lineParts = (lineParts.join(' ')).split(';');

      // Loop out and search if stereo= flag exists already
      for (var k = 0; k < lineParts.length; k++) {
        // Check for the stereo=1 flag
        if (lineParts[k].indexOf(flag + '=') === 0) {
          if (!enableStereo) {
            lineParts.splice(k, 1);
            break;
          }

          lineParts[k] = flag + '=1';
          hasFlag = true;
        }
      }

      if (enableStereo && !hasFlag) {
        lineParts.push(flag + '=1');
      }

      return line.split(' ')[0] + ' ' + lineParts.join(';');
    };

    // Check if OPUS codec fmtp line exists
    if (opusFmtpLine) {
      for (var j = 0; j < sdpLines.length; j++) {
        // Check if this line is the OPUS fmtp line payload
        if (sdpLines[j].indexOf('a=fmtp:' + opusFmtpLine) === 0) {
          sdpLines[j] = parsePayloadFn(sdpLines[j], 'stereo');
          sdpLines[j] = parsePayloadFn(sdpLines[j], 'sprop-stereo');
          break;
        }
      }
    }

    // Return modified RTCSessionDescription.sdp
    return sdpLines.join('\r\n');
  },

  /**
   * Handles the maximum sending bandwidth configuration.
   * @method configureMCUFirefoxAnswer
   * @param {String} sdpString The local answer RTCSessionDescription.sdp.
   * @param {String} mediaType The media type to configure.
   *   Types are <code>"audio"</code>, <code>"video"</code> and <code>"data"</code>.
   * @param {Number} maxBitrate The maximum sending bitrate value.
   *   This value cannot be <code>0</code> or less.
   * @return {String} updatedSdpString The modified local RTCSessionDescription.sdp
   *   with maximum sending bandwidth configuration based on the media type and bitrate value provided.
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  configureMaxSendingBandwidth: function (sdpString, mediaType, maxBitrate) {
    var sdpLines = sdpString.split('\r\n'),
        sdpMediaType = '';

    if (mediaType === 'audio') {
      sdpMediaType = 'audio';

    } else if (mediaType === 'video') {
      sdpMediaType = 'video';

    } else if (mediaType === 'data') {
      sdpMediaType = 'application';

    // Prevent setting any unknown types
    } else {
      log.error('Dropping of configurating maximum sending bandwidth as unknown mediaType is provided ->', mediaType);
      return sdpString;
    }

    for (var i = 0; i < sdpLines.length; i += 1) {
      // Configure the maximum sending bitrate for the selected media type
      if (sdpLines[i].indexOf('m=' + sdpMediaType) === 0) {
        sdpLines.splice(i + 1, 0, 'b=AS:' + maxBitrate);
        break;
      }
    }

    return sdpLines.join('\r\n');
  },

  /**
   * Removes the H264 preference from that started originally from
   *   Firefox 32 (Ubuntu) browsers to prevent breaking connection
   *   with browsers that do not support it.
   * @method removeFirefoxH264Pref
   * @param {String} sdpString The local RTCSessionDescription.sdp.
   * @return {String} updatedSdpString The modification local RTCSessionDescription.sdp
   *   that has the H264 preference removed.
   * @private
   * @for Skylink
   * @since 0.6.x
   */
  removeFirefoxH264Pref: function (sdpString) {
    var sdpLines = sdpString.split('\r\n');

    // Remove line that causes issue in Firefox 32 (Ubuntu) experimental feature.
    var invalidLineIndex = sdpLines.indexOf(
      'a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1');

    if (invalidLineIndex > -1) {
      sdpLines.splice(invalidLineIndex, 1);
    }

    // Return modified RTCSessionDescription.sdp
    return sdpLines.join('\r\n');
  }

};
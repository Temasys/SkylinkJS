/**
 * Handles the SDP parsing functionalities.
 * @attribute _parseSDP
 * @type JSON
 * @private
 * @for Skylink
 */
Skylink.prototype._parseSDP = {

  /**
   * Handles the Firefox MCU answer mangling.
   * @method MCUFirefoxAnswer
   * @param {String} sdpString The sessionDescription.sdp string.
   */
  MCUFirefoxAnswer: function (sdpString) {
    var newSdpString = '';

    newSdpString = sdpString.replace(/ generation 0/g, '');
    newSdpString = newSdpString.replace(/ udp /g, ' UDP ');

    return newSdpString;
  },

  /**
   * Handles the Firefox to other browsers SSRC lines received
   *   that instead of interpretating as "default" for MediaStream.id,
   *   interpret as the original id given.
   * @method firefoxAnswerSSRC
   * @param {String} sdpString The sessionDescription.sdp string.
   */
  firefoxAnswerSSRC: function (sdpString) {
    if (sdpString.indexOf('a=msid-semantic:WMS *') > 0) {
      var sdpLines = sdpString.split('\r\n'),
          streamId = '',
          shouldReplaceSSRCSemantic = -1;

      /*
       * Loops and checks if there is any stream ID or track ID to replace based on the type provided
       */
      var parseTracksSSRCFn = function (track) {
        var trackId = '';

        for (var i = 0; i < sdpLines.length; i++) {
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
              shouldReplaceSSRCSemantic = true;
            }
          }
        }
      };

      parseTracksSSRCFn('video');
      parseTracksSSRCFn('audio');

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
      return sdpLines.join('\r\n');
    }
  },

  /**
   * Handles the OPUS stereo flag configuration.
   * @method configureOPUSStereo
   * @param {String} sdpString The sessionDescription.sdp string.
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

    // Check if OPUS codec fmtp line exists
    if (opusFmtpLine) {
      for (var j = 0; j < sdpLines.length; j++) {
        // Check if this line is the OPUS fmtp line payload
        if (sdpLines[j].indexOf('a=fmtp:' + opusFmtpLine) === 0) {
          var lineParts = sdpLines[j].split(' '),
              hasStereoFlag = false,
              hasSpropStereoFlag = false;

          // Loop out and search if stereo= flag exists already
          for (var k = 0; k < lineParts.length; k++) {
            // Check for the stereo=1 flag
            if (lineParts[k].indexOf('stereo=') === 0) {
              // Remove the stereo flag if stereo is not enabled for OPUS codec connection
              if (!enableStereo) {
                lineParts[k] = '';
                return;
              }

              lineParts[k] = 'stereo=1;';
              hasStereoFlag = true;

            // Check for the sprop-stereo=1 flag
            } else if (lineParts[k].indexOf('sprop-stereo=') === 0) {
              // Remove the stereo flag if stereo is not enabled for OPUS codec connection
              if (!enableStereo) {
                lineParts[k] = '';
              }

              lineParts[k] = 'sprop-stereo=1;';
              hasSpropStereoFlag = true;
            }
          }

          if (enableStereo) {
            var lastLine = null;

            // Check if stereo=1 line exists and set if it doesn't
            if (!hasStereoFlag) {
              var stereoLine = 'stereo=1;';
              lastLine = lineParts[lineParts.length - 1];

              // Prevent not setting ";" before the appending the stereo line
              if (lastLine[lastLine.length - 1] !== ';') {
                stereoLine = '; ' + stereoLine;
              }

              lineParts.push(stereoLine);
            }

            // Check if sprop-stereo=1 line exists and set if it doesn't
            if (!hasSpropStereoFlag) {
              var spropStereoLine = 'sprop-stereo=1;';
              lastLine = lineParts[lineParts.length - 1];

              // Prevent not setting ";" before the appending the sprop-stereo line
              if (lastLine[lastLine.length - 1] !== ';') {
                spropStereoLine = '; ' + spropStereoLine;
              }

              lineParts.push(spropStereoLine);
            }
          }

          sdpLines[j] = lineParts.join(' ');

          // Prevent setting last character as ";"
          if (sdpLines[j][sdpLines[j].length - 1] === ';') {
            sdpLines[j] = sdpLines[j].slice(0, -1);
          }

          // Prevent any "config=1 ;" kind of payload configuration
          sdpLines[j] = sdpLines[j].replace(/ ;/g, ';');
        }
      }
    }

    // Return modified RTCSessionDescription.sdp
    return sdpLines.join('\r\n');
  }
};
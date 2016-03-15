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
  }
};
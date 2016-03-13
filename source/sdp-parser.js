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
  }
};
/**
 * The current state if ICE trickle is enabled.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.3.0
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * The list of ICE connection states.
 * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
 *   webrtc/editor/webrtc.html#rtciceconnectionstate-enum).
 * - This is the RTCIceConnection state of the peer.
 * - The states that would occur are:
 * @attribute ICE_CONNECTION_STATE
 * @type JSON
 * @param {String} STARTING The ICE agent is gathering addresses
 *   and/or waiting for remote candidates to be supplied.
 * @param {String} CHECKING The ICE agent has received remote candidates
 *   on at least one component, and is checking candidate pairs but has
 *   not yet found a connection. In addition to checking, it may also
 *   still be gathering.
 * @param {String} CONNECTED The ICE agent has found a usable connection
 *   for all components but is still checking other candidate pairs to see
 *   if there is a better connection. It may also still be gathering.
 * @param {String} COMPLETED The ICE agent has finished gathering and
 *   checking and found a connection for all components.
 * @param {String} FAILED The ICE agent is finished checking all
 *   candidate pairs and failed to find a connection for at least one
 *   component.
 * @param {String} DISCONNECTED Liveness checks have failed for one or
 *   more components. This is more aggressive than "failed", and may
 *   trigger intermittently (and resolve itself without action) on
 *   a flaky network.
 * @param {String} CLOSED The ICE agent has shut down and is no
 *   longer responding to STUN requests.
 * @readOnly
 * @since 0.1.0
 */
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  DISCONNECTED: 'disconnected'
};

/**
 * Sets the STUN server specially for Firefox for ICE Connection.
 * @method _setFirefoxIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.1.0
 */
Skylink.prototype._setFirefoxIceServers = function(config) {
  if (window.webrtcDetectedType === 'moz') {
    this._log(this.LOG_LEVEL.TRACE, 'Updating firefox Ice server configuration', config);
    // NOTE ALEX: shoul dbe given by the server
    var newIceServers = [{
      'url': 'stun:stun.services.mozilla.com'
    }];
    for (var i = 0; i < config.iceServers.length; i++) {
      var iceServer = config.iceServers[i];
      var iceServerType = iceServer.url.split(':')[0];
      if (iceServerType === 'stun') {
        if (iceServer.url.indexOf('google')) {
          continue;
        }
        iceServer.url = [iceServer.url];
        newIceServers.push(iceServer);
      } else {
        var newIceServer = {};
        newIceServer.credential = iceServer.credential;
        newIceServer.url = iceServer.url.split(':')[0];
        newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
        newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
        newIceServers.push(newIceServer);
      }
    }
    config.iceServers = newIceServers;
    this._log(this.LOG_LEVEL.DEBUG, 'Updated firefox Ice server configuration: ', config);
  }
  return config;
};
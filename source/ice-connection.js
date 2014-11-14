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
 * @for Skylink
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
 * The list of available TURN server protocols
 * - The available protocols are:
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP Use only TCP transport option.
 * @param {String} UDP Use only UDP transport option.
 * @param {String} ANY Use both TCP and UDP transport option.
 * @param {String} NONE Set no transport option in TURN servers
 * @readOnly
 * @since 0.5.4
 * @for Skylink
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none'
};

/**
 * The current state if ICE trickle is enabled.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.3.0
 * @for Skylink
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * The current state if STUN servers are enabled.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * The current state if TURN servers are enabled.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * SSL option for STUN servers.
 * @attribute _STUNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @development true
 * @unsupported true
 * @since 0.5.4
 * @for Skylink
 */
//Skylink.prototype._STUNSSL = false;

/**
 * SSL option for TURN servers.
 * @attribute _TURNSSL
 * @type Boolean
 * @default false
 * @private
 * @required
 * @development true
 * @unsupported true
 * @since 0.5.4
 * @for Skylink
 */
//Skylink.prototype._TURNSSL = false;

/**
 * The transport protocol for TURN servers.
 * @attribute _TURNTransport
 * @type String
 * @default Skylink.TURN_TRANSPORT.ANY
 * @private
 * @required
 * @since 0.5.4
 * @for Skylink
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Sets the STUN server specially for Firefox for ICE Connection.
 * @method _setFirefoxIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.1.0
 * @for Skylink
 */
Skylink.prototype._setFirefoxIceServers = function(config) {
  if (window.webrtcDetectedType === 'moz') {
    log.log('Updating firefox Ice server configuration', config);
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
    log.debug('Updated firefox Ice server configuration: ', config);
  }
  return config;
};

/**
 * Sets the STUN server specially for Firefox for ICE Connection.
 * @method _setIceServers
 * @param {JSON} config Ice configuration servers url object.
 * @return {JSON} Updated configuration
 * @private
 * @since 0.5.4
 * @for Skylink
 */
Skylink.prototype._setIceServers = function(config) {
  // firstly, set the STUN server specially for firefox
  config = this._setFirefoxIceServers(config);
  for (var i = 0; i < config.iceServers.length; i++) {
    var iceServer = config.iceServers[i];
    var iceServerParts = iceServer.url.split(':');
    // check for stun servers
    if (iceServerParts[0] === 'stun' || iceServerParts[0] === 'stuns') {
      if (!this._enableSTUN) {
        log.log('Removing STUN Server support');
        config.iceServers.splice(i, 1);
        continue;
      } else {
        // STUNS is unsupported
        iceServerParts[0] = (this._STUNSSL) ? 'stuns' : 'stun';
      }
      iceServer.url = iceServerParts.join(':');
    }
    // check for turn servers
    if (iceServerParts[0] === 'turn' || iceServerParts[0] === 'turns') {
      if (!this._enableTURN) {
        log.log('Removing TURN Server support');
        config.iceServers.splice(i, 1);
        continue;
      } else {
        iceServerParts[0] = (this._TURNSSL) ? 'turns' : 'turn';
        iceServer.url = iceServerParts.join(':');
        // check if requires SSL
        log.log('Transport option:', this._TURNTransport);
        if (this._TURNTransport !== this.TURN_TRANSPORT.ANY) {
          // this has a transport attached to it
          if (iceServer.url.indexOf('?transport=') > -1) {
            // remove transport because user does not want it
            if (this._TURNTransport === this.TURN_TRANSPORT.NONE) {
              log.log('Removing transport option');
              iceServer.url = iceServer.url.split('?')[0];
            } else {
              // UDP or TCP
              log.log('Setting transport option');
              var urlProtocolParts = iceServer.url.split('=')[1];
              urlProtocolParts = this._TURNTransport;
              iceServer.url = urlProtocolParts.join('=');
            }
          } else {
            if (this._TURNTransport !== this.TURN_TRANSPORT.NONE) {
              log.log('Setting transport option');
              // no transport here. manually add
              iceServer.url += '?transport=' + this._TURNTransport;
            }
          }
        }
      }
    }
    config.iceServers[i] = iceServer;
    log.log('Output ' + iceServerParts[0] + ' configuration:', config.iceServers[i]);
  }
  log.log('Output iceServers configuration:', config.iceServers);
  return config;
};
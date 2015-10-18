/**
 * The list of Peer connection ICE connection triggered states.
 * Refer to [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCIceConnectionState).
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
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};

/**
 * The list of TURN server transports flags to set for TURN server connections.
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP Use only TCP transport option.
 *   <i>E.g. <code>turn:turnurl:5523?transport=tcp</code></i>.
 * @param {String} UDP Use only UDP transport option.
 *   <i>E.g. <code>turn:turnurl:5523?transport=udp</code></i>.
 * @param {String} ANY Use any transports option given
 *   by the platform signaling.
 *   <i>E.g. <code>turn:turnurl:5523?transport=udp</code> or
 *   <code>turn:turnurl:5523?transport=tcp</code></i>.
 * @param {String} NONE Set no transport option in TURN servers.
 *   <i>E.g. <code>turn:turnurl:5523</code></i>
 * @param {String} ALL Use both UCP and TCP transports options.
 *   <i>E.g. <code>turn:turnurl:5523?transport=udp</code> and
 *   <code>turn:turnurl:5523?transport=tcp</code></i>.
 * @readOnly
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};

/**
 * The flag that indicates if PeerConnections should enable
 *    trickling of ICE to connect the ICE connection.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @required
 * @since 0.3.0
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * The flag that indicates if PeerConnections ICE gathering
 *   should use STUN server connection.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component ICE
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * The flag that indicates if PeerConnections ICE gathering
 *   should use TURN server connection.
 * Tampering this flag may disable any successful Peer connection
 *   that is behind any firewalls.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @required
 * @component ICE
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * The flag to enable using of public STUN server connections.
 * @attribute _usePublicSTUN
 * @type Boolean
 * @default true
 * @required
 * @private
 * @component ICE
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._usePublicSTUN = true;

/**
 * Stores the TURN server transport to enable for TURN server connections.
 * [Rel: Skylink.TURN_TRANSPORT]
 * @attribute _TURNTransport
 * @type String
 * @default Skylink.TURN_TRANSPORT.ANY
 * @private
 * @required
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Stores the list of Peer connection ICE connection failures.
 * After an third attempt of ICE connection failure, the
 *   trickling of ICE would be disabled.
 * @attribute _ICEConnectionFailures
 * @param {Number} (#peerId) The Peer ID associated with the
 *   number of Peer connection ICE connection attempt failures.
 * @type JSON
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._ICEConnectionFailures = {};

/**
 * Reconfigures the <code>RTCConfiguration.iceServers</code> that is
 *   to be passed in constructing the new <code>RTCPeerConnection</code>
 *   object for different browsers support.
 * Previously known as <code>_setFirefoxIceServers</code>.
 * This method will reconfigure <code>urls</code> configuration to
 *   an array of <code>url</code> configuration.
 * @method _parseIceServers
 * @param {JSON} config The RTCConfiguration that is to be passed for
 *   constructing the new RTCPeerConnection object.
 * @return {JSON} The updated RTCConfiguration object with Firefox
 *   specific STUN configuration.
 * @private
 * @since 0.6.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._parseIceServers = function(config) {
  var self = this;
  var newIceServers = [];

  var parseIceServer = function (iceServer) {
    if (iceServer.url.indexOf('@') > 0) {
      var protocolParts = iceServer.url.split(':');
      var urlParts = protocolParts[1].split('@');
      iceServer.username = urlParts[0];
      iceServer.url = protocolParts[0] + ':' + urlParts[1];

      // add the ICE server port
      if (protocolParts[2]) {
        iceServer.url += ':' + protocolParts[2];
      }
    }

    if (iceServer.url.indexOf('stun:') === 0 &&
      window.webrtcDetectedBrowser === 'firefox' &&
      iceServer.url.indexOf('google') > 0) {
      return null;
    }

    return createIceServer(iceServer.url,
      iceServer.username || null, iceServer.credential || null);
  };

  for (var i = 0; i < config.iceServers.length; i++) {
    var iceServer = config.iceServers[i];
    var newIceServer = null;

    if (Array.isArray(iceServer.urls)) {
      for (var j = 0; j < iceServer.urls.length; j++) {
        var iceServerIndex = {
          username: iceServer.username,
          url: iceServer.urls[j],
          credential: iceServer.credential
        };

        newIceServer = parseIceServer(iceServerIndex);

        if (newIceServer !== null) {
          newIceServers.push(newIceServer);
        }
      }
    } else {
      newIceServer = parseIceServer(iceServer);

      if (newIceServer !== null) {
        newIceServers.push(newIceServer);
      }
    }
  }


  // for firefox STUN
  if (window.webrtcDetectedBrowser === 'firefox' && this._enableSTUN) {
    newIceServers.splice(0, 0, {
      url: 'stun:stun.services.mozilla.com'
    });
  }

  return {
    iceServers: newIceServers
  };
};

/**
 * Reconfigures the <code>RTCConfiguration.iceServers</code> that is
 *   to be passed in constructing the new <code>RTCPeerConnection</code>
 *   object to remove (disable) STUN or remove TURN (disable) server
 *   connections based on the
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 *   configuration passed in.
 * @method _setIceServers
 * @param {JSON} config The RTCConfiguration that is to be passed for
 *   constructing the new RTCPeerConnection object.
 * @return {JSON} The updated RTCConfiguration object based on the
 *   configuration settings in the
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
 *   method.
 * @private
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype._setIceServers = function(givenConfig) {
  // firstly, set the STUN server specially for firefox
  var config = this._parseIceServers(givenConfig);

  var newConfig = {
    iceServers: []
  };

  // to prevent repeat
  var iceServerUrls = [];

  var useTURNSSLProtocol = false;
  var useTURNSSLPort = false;

  var clone = function (obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = obj[attr];
      }
    }
    return copy;
  };

  if (window.location.protocol === 'https:' || this._forceTURNSSL) {
    if (window.webrtcDetectedBrowser === 'chrome' ||
      window.webrtcDetectedBrowser === 'safari' ||
      window.webrtcDetectedBrowser === 'IE') {
      useTURNSSLProtocol = true;
    }
    useTURNSSLPort = true;
  }

  log.log('TURN server connections SSL configuration', {
    useTURNSSLProtocol: useTURNSSLProtocol,
    useTURNSSLPort: useTURNSSLPort
  });

  for (var i = 0; i < config.iceServers.length; i++) {
    var iceServer = config.iceServers[i];
    var iceServerParts = iceServer.url.split(':');
    var copyIceServers = [];

    // check for stun servers
    if (iceServerParts[0] === 'stun' || iceServerParts[0] === 'stuns') {
      if (!this._enableSTUN) {
        log.log('Removing STUN Server support', iceServer);
        continue;
      } else {
        if (!this._usePublicSTUN && iceServer.url.indexOf('temasys') === -1) {
          log.log('Remove public STUN Server support', iceServer);
          continue;
        }
        // STUNS is unsupported
        //iceServerParts[0] = (this._STUNSSL) ? 'stuns' : 'stun';
      }
      iceServer.url = iceServerParts.join(':');
    }
    // check for turn servers
    if (iceServerParts[0] === 'turn' || iceServerParts[0] === 'turns') {
      if (!this._enableTURN) {
        log.log('Removing TURN Server support', iceServer);
        continue;
      } else if (iceServer.url.indexOf(':443') === -1 && useTURNSSLPort) {
        log.log('Ignoring TURN Server with non-SSL port', iceServer);
        continue;
      } else {
        // this is terrible. No turns please
        iceServerParts[0] = (useTURNSSLProtocol) ? 'turns' : 'turn';
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
            } else if (this._TURNTransport === this.TURN_TRANSPORT.ALL) {
              log.log('Setting for all transport option');



              var originalUrl = iceServer.url.split('?')[0];

              // turn:turn.test.com
              var iceServerTransportNone = clone(iceServer);
              iceServerTransportNone.url = originalUrl;
              copyIceServers.push(iceServerTransportNone);

              // turn:turn.test.com?transport=tcp
              var iceServerTransportTcp = clone(iceServer);
              iceServerTransportTcp.url = originalUrl + '?transport=' + this.TURN_TRANSPORT.TCP;
              copyIceServers.push(iceServerTransportTcp);

              // turn:turn.test.com?transport=udp
              var iceServerTransportUdp = clone(iceServer);
              iceServerTransportUdp.url = originalUrl + '?transport=' + this.TURN_TRANSPORT.UDP;
              copyIceServers.push(iceServerTransportUdp);

            } else {
              // UDP or TCP
              log.log('Setting transport option');
              var urlProtocolParts = iceServer.url.split('=');
              urlProtocolParts[1] = this._TURNTransport;
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

    if (copyIceServers.length > 0) {
      for (var j = 0; j < copyIceServers.length; j++) {
        if (iceServerUrls.indexOf(copyIceServers[j].url) === -1) {
          newConfig.iceServers.push(copyIceServers[j]);
          iceServerUrls.push(copyIceServers[j].url);
        }
      }
    } else if (iceServerUrls.indexOf(iceServer.url) === -1) {
      newConfig.iceServers.push(iceServer);
      iceServerUrls.push(iceServer.url);
    }
  }

  log.log('Output iceServers configuration:', newConfig.iceServers);
  return newConfig;
};
/**
 * These are the list of Peer connection ICE connection states that Skylink would trigger.
 * - These states references the [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCIceConnectionState),
 *   except the <code>TRICKLE_FAILED</code> state, which is an addition provided state by Skylink
 *   to inform that trickle ICE has failed.
 * @attribute ICE_CONNECTION_STATE
 * @type JSON
 * @param {String} STARTING <small>Value <code>"starting"</code></small>
 *   The state when the ICE agent is gathering addresses and/or waiting
 *   for remote candidates to be supplied.<br>
 * This state occurs when Peer connection has just been initialised.
 * @param {String} CHECKING <small>Value <code>"checking"</code></small>
 *   The state when the ICE agent has received remote candidates
 *   on at least one component, and is checking candidate pairs but has
 *   not yet found a connection. In addition to checking, it may also
 *   still be gathering.<br>
 * This state occurs after <code>STARTING</code> state.
 * @param {String} CONNECTED <small>Value <code>"connected"</code></small>
 *  The state when the ICE agent has found a usable connection
 *   for all components but is still checking other candidate pairs to see
 *   if there is a better connection. It may also still be gathering.<br>
 * This state occurs after <code>CHECKING</code>.
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The state when the ICE agent has finished gathering and
 *   checking and found a connection for all components.<br>
 * This state occurs after <code>CONNECTED</code> (or sometimes after <code>CHECKING</code>).
 * @param {String} FAILED <small>Value <code>"failed"</code></small>
 *   The state when the ICE agent is finished checking all
 *   candidate pairs and failed to find a connection for at least one
 *   component.<br>
 * This state occurs during the ICE connection attempt after <code>STARTING</code> state.
 * @param {String} DISCONNECTED <small>Value <code>"disconnected"</code></small>
 *   The state when liveness checks have failed for one or
 *   more components. This is more aggressive than "failed", and may
 *   trigger intermittently (and resolve itself without action) on
 *   a flaky network.<br>
 * This state occurs after <code>CONNECTED</code> or <code>COMPLETED</code> state.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when the ICE agent has shut down and is no
 *   longer responding to STUN requests.<br>
 * This state occurs after Peer connection has been disconnected <em>(closed)</em>.
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The state when attempting to connect successfully with ICE connection fails
 *    with trickle ICE connections.
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
 * These are the list of available transports that
 *   Skylink would use to connect to the TURN servers with.
 * - For example as explanation how these options works below, let's take that
 *   these are list of TURN servers given by the platform signaling:<br>
 *   <small><code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234</code><br>
 *   <code>turn:turnurl</code></small>
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP <small>Value <code>"tcp"</code></small>
 *   The option to connect using only TCP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=tcp</code><br>
 *   <code>turn:turnurl:1234?transport=tcp</code></small>
 * @param {String} UDP <small>Value <code>"udp"</code></small>
 *   The option to connect using only UDP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=udp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234?transport=udp</code></small>
 * @param {String} ANY <small><b>DEFAULT</b> | Value <code>"any"</code></small>
 *   This option to use any transports that is preconfigured by provided by the platform signaling.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234</code><br>
 *   <code>turn:turnurl</code></small>
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   This option to set no transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123</code><br>
 *   <code>turn:turnurl</code><br>
 *   <code>turn:turnurl:1234</code></small>
 * @param {String} ALL <small>Value <code>"all"</code></small>
 *   This option to use both TCP and UDP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl:123?transport=udp</code><br>
 *   <code>turn:turnurl?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234?transport=tcp</code><br>
 *   <code>turn:turnurl:1234?transport=udp</code></small>
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
  var givenIceServers = clone(givenConfig.iceServers);
  var iceServersList = {};
  var newIceServers = [];
  // TURN SSL config
  var useTURNSSLProtocol = false;
  var useTURNSSLPort = false;



  if (window.location.protocol === 'https:' || this._forceTURNSSL) {
    if (window.webrtcDetectedBrowser === 'chrome' ||
      window.webrtcDetectedBrowser === 'safari' ||
      window.webrtcDetectedBrowser === 'IE') {
      useTURNSSLProtocol = true;
      useTURNSSLPort = false;
    } else {
      useTURNSSLPort = true;
    }
  }

  log.log('TURN server connections SSL configuration', {
    useTURNSSLProtocol: useTURNSSLProtocol,
    useTURNSSLPort: useTURNSSLPort
  });

  var pushIceServer = function (username, credential, url, index) {
    if (!iceServersList[username]) {
      iceServersList[username] = {};
    }

    if (!iceServersList[username][credential]) {
      iceServersList[username][credential] = [];
    }

    if (iceServersList[username][credential].indexOf(url) === -1) {
      if (typeof index === 'number') {
        iceServersList[username][credential].splice(index, 0, url);
      } else {
        iceServersList[username][credential].push(url);
      }
    }
  };

  var i, serverItem;

  for (i = 0; i < givenIceServers.length; i++) {
    var server = givenIceServers[i];

    if (typeof server.url !== 'string') {
      log.warn('Ignoring ICE server provided at index ' + i, clone(server));
      continue;
    }

    if (server.url.indexOf('stun') === 0) {
      if (!this._enableSTUN) {
        log.warn('Ignoring STUN server provided at index ' + i, clone(server));
        continue;
      }

      if (!this._usePublicSTUN && server.url.indexOf('temasys') === -1) {
        log.warn('Ignoring public STUN server provided at index ' + i, clone(server));
        continue;
      }

    } else if (server.url.indexOf('turn') === 0) {
      if (!this._enableTURN) {
        log.warn('Ignoring TURN server provided at index ' + i, clone(server));
        continue;
      }

      if (server.url.indexOf(':443') === -1 && useTURNSSLPort) {
        log.log('Ignoring TURN Server (non-SSL port) provided at index ' + i, clone(server));
        continue;
      }

      if (useTURNSSLProtocol) {
        var parts = server.url.split(':');
        parts[0] = 'turns';
        server.url = parts.join(':');
      }
    }

    // parse "@" settings
    if (server.url.indexOf('@') > 0) {
      var protocolParts = server.url.split(':');
      var urlParts = protocolParts[1].split('@');
      server.username = urlParts[0];
      server.url = protocolParts[0] + ':' + urlParts[1];

      // add the ICE server port
      if (protocolParts[2]) {
        server.url += ':' + protocolParts[2];
      }
    }

    var username = typeof server.username === 'string' ? server.username : 'none';
    var credential = typeof server.credential === 'string' ? server.credential : 'none';

    if (server.url.indexOf('turn') === 0) {
      if (this._TURNTransport === this.TURN_TRANSPORT.ANY) {
        pushIceServer(username, credential, server.url);

      } else {
        var rawUrl = server.url;

        if (rawUrl.indexOf('?transport=') > 0) {
          rawUrl = rawUrl.split('?transport=')[0];
        }

        if (this._TURNTransport === this.TURN_TRANSPORT.NONE) {
          pushIceServer(username, credential, rawUrl);
        } else if (this._TURNTransport === this.TURN_TRANSPORT.UDP) {
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.TCP) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.ALL) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else {
          log.warn('Invalid TURN transport option "' + this._TURNTransport +
            '". Ignoring TURN server at index' + i, clone(server));
          continue;
        }
      }
    } else {
      pushIceServer(username, credential, server.url);
    }
  }

  // add mozilla STUN for firefox
  if (this._enableSTUN && this._usePublicSTUN && window.webrtcDetectedBrowser === 'firefox') {
    pushIceServer('none', 'none', 'stun:stun.services.mozilla.com', 0);
  }

  var hasUrlsSupport = false;

  if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 38) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'opera' && window.webrtcDetectedVersion > 31) {
    hasUrlsSupport = true;
  }

  // plugin supports .urls
  if (window.webrtcDetectedBrowser === 'safari' || window.webrtcDetectedBrowser === 'IE') {
    hasUrlsSupport = true;
  }

  for (var serverUsername in iceServersList) {
    if (iceServersList.hasOwnProperty(serverUsername)) {
      for (var serverCred in iceServersList[serverUsername]) {
        if (iceServersList[serverUsername].hasOwnProperty(serverCred)) {
          if (hasUrlsSupport) {
            var urlsItem = {
              urls: iceServersList[serverUsername][serverCred]
            };
            if (serverUsername !== 'none') {
              urlsItem.username = serverUsername;
            }
            if (serverCred !== 'none') {
              urlsItem.credential = serverCred;
            }
            newIceServers.push(urlsItem);
          } else {
            for (var j = 0; j < iceServersList[serverUsername][serverCred].length; j++) {
              var urlItem = {
                url: iceServersList[serverUsername][serverCred][j]
              };
              if (serverUsername !== 'none') {
                urlItem.username = serverUsername;
              }
              if (serverCred !== 'none') {
                urlItem.credential = serverCred;
              }
              newIceServers.push(urlItem);
            }
          }
        }
      }
    }
  }

  log.log('Output iceServers configuration:', newIceServers);

  return {
    iceServers: newIceServers
  };
};
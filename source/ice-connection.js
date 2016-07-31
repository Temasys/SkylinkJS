/**
 * Contains the list of Peer connection ICE connection states.
 * - ICE connection is used for streaming media like audio and video and Datachannel connections.
 * - ICE candidates
 * - <b>What is an <a href="#attr_CANDIDATE_GENERATION_STATE">ICE candidate</a>?</b><br>
 *   It is the object that contains the IP addresses and port to allow ICE connection.
 * - <b>What is an <a href="#attr_ICE_CONNECTION_STATE">ICE connection</a>?</b><br>
 *   It is the connection used for establishing media and Datachannel connections.
 * - <b>What is the <a href="#attr_PEER_CONNECTION_STATE">session description</a> for?</b><br>
 *   It is the data where it stores the information to map the ICE candidates to the relevant
 *   media type (audio/video/Datachannel).
 * @attribute ICE_CONNECTION_STATE
 * @type JSON
 * @param {String} CHECKING <small>Value <code>"checking"</code></small>
 *   The state when Peer connection is still checking for a suitable matching ICE
 *   candidate pair sent and received.
 * @param {String} CONNECTED <small>Value <code>"connected"</code></small>
 *   The state when Peer connection has found a suitable matching ICE candidate pair
 *   sent and received but is actively looking for other ICE candidates sent and received
 *   for better ICE connection.
 *   <small>At this stage, the ICE connection is established already and
 *     media is streaming with Datachannel starting connections.</small>
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The state when Peer connection had found the best ICE connection.
 *   <small>At this stage, the ICE connection is established already and
 *     media is streaming with Datachannel starting connections.</small>
 * @param {String} FAILED <small>Value <code>"failed"</code></small>
 *   The state when Peer connection has failed to find a suitable matching ICE candidate pair
 *   for a connection.
 *   <small>As a workaround, you may just simply invoke
 *     <a href="#method_joinRoom"><code>joinRoom()</code></a> again when this state happens to reconnect to
 *     the room again to retrieve new ICE credentials and see if it helps the Peer to establish a
 *     successful ICE connection.</small>
 * @param {String} DISCONNECTED <small>Value <code>"disconnected"</code></small>
 *   The state when Peer connection ICE connection has been disconnected.
 *   This may be caused by a flaky network connection.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when Peer connection ICE connection has closed and no media could be streamed from
 *   the Peer connection nor any Datachannel connection could be established.
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The state is the same as <code>FAILED</code> state except that the failure occurs with
 *   trickle ICE enabled.
 *   <small>To disable trickle ICE, configure the <code>enableIceTrickle</code> option in
 *     the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @readOnly
 * @for Skylink
 * @since 0.1.0
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
 * <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired protocol
 *   used in the actual TURN IP traffic as it depends which protocol the browser selects and connects with.<br>
 *   For an advanced explaination, this configures the ICE server urls passed in <code?transport=<protocol></code>
 *   when constructing the Peer connection. When both protocols are selected, the ICE servers urls are duplicated
 *   with both protocols.
 * </blockquote>
 * Contains the list of configurations to use when Peer connection ICE connection using the TURN server.
 * @attribute TURN_TRANSPORT
 * @param {String} TCP <small>Value <code>"tcp"</code></small>
 *   The option to configure using only TCP protocol.
 * @param {String} UDP <small>Value <code>"udp"</code></small>
 *   The option to configure using only UDP protocol.
 * @param {String} ANY <small><b>DEFAULT</b> | Value <code>"any"</code></small>
 *   The option to configure using any protocols provided by default.
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   The option to not configure using only protocols.
 *   <small>Configuring this does not mean that no protocols will be used, but
 *     rather removing <code>?transport</code> flags in the ICE server urls when constructing the Peer connection.</small>
 * @param {String} ALL <small>Value <code>"all"</code></small>
 *   The option to configure using both TCP and UDP protocols.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};

/**
 * Stores the flag that indicates if Peer connections should trickle ICE.
 * @attribute _enableIceTrickle
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._enableIceTrickle = true;

/**
 * Stores the flag that indicates if STUN ICE servers should be used when constructing Peer connection.
 * @attribute _enableSTUN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._enableSTUN = true;

/**
 * Stores the flag that indicates if TURN ICE servers should be used when constructing Peer connection.
 * @attribute _enableTURN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._enableTURN = true;

/**
 * Stores the flag that indicates if public STUN ICE servers should be used when constructing Peer connection.
 * @attribute _usePublicSTUN
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._usePublicSTUN = true;

/**
 * Stores the option for the TURN protocols to use.
 * This should configure the TURN ICE servers urls <code>?transport=protocol</code> flag.
 * @attribute _TURNTransport
 * @type String
 * @default "any"
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._TURNTransport = 'any';

/**
 * Stores the list of Peer connections ICE failures counter.
 * @attribute _ICEConnectionFailures
 * @param {Number} <#peerId> The Peer connection ICE failures counter.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._ICEConnectionFailures = {};

/**
 * Function that filters and configures the ICE servers received from Signaling
 *   based on the <code>init()</code> configuration and returns the updated
 *   list of ICE servers to be used when constructing Peer connection.
 * @method _setIceServers
 * @private
 * @for Skylink
 * @since 0.5.4
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
/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE connection states.
 * @attribute ICE_CONNECTION_STATE
 * @param {String} CHECKING       <small>Value <code>"checking"</code></small>
 *   The value of the state when Peer connection is checking for a suitable matching pair of
 *   ICE candidates to establish ICE connection.
 *   <small>Exchanging of ICE candidates happens during <a href="#event_candidateGenerationState">
 *   <code>candidateGenerationState</code> event</a>.</small>
 * @param {String} CONNECTED      <small>Value <code>"connected"</code></small>
 *   The value of the state when Peer connection has found a suitable matching pair of
 *   ICE candidates to establish ICE connection but is still checking for a better
 *   suitable matching pair of ICE candidates for the best ICE connectivity.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started.</small>
 * @param {String} COMPLETED      <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection has found the best suitable matching pair
 *   of ICE candidates to establish ICE connection and checking has stopped.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started. This may happpen after <code>CONNECTED</code>.</small>
 * @param {String} FAILED         <small>Value <code>"failed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed.
 * @param {String} DISCONNECTED   <small>Value <code>"disconnected"</code></small>
 *   The value of the state when Peer connection ICE connection is disconnected.
 *   <small>At this state, the Peer connection may attempt to revive the ICE connection.
 *   This may happen due to flaky network conditions.</small>
 * @param {String} CLOSED         <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection ICE connection has closed.
 *   <small>This happens when Peer connection is closed and no streaming can occur at this stage.</small>
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed during trickle ICE.
 *   <small>Trickle ICE is enabled in <a href="#method_init"><code>init()</code> method</a>
 *   <code>enableIceTrickle</code> option.</small>
 * @type JSON
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
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 * </blockquote>
 * The list of TURN network transport protocols options when constructing Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * <small>Example <code>.urls</code> inital input: [<code>"turn:server.com?transport=tcp"</code>,
 * <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @attribute TURN_TRANSPORT
 * @param {String} TCP <small>Value  <code>"tcp"</code></small>
 *   The value of the option to configure using only TCP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=tcp"</code>]</small>
 * @param {String} UDP <small>Value  <code>"udp"</code></small>
 *   The value of the option to configure using only UDP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=udp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
 * @param {String} ANY <small>Value  <code>"any"</code></small>
 *   The value of the option to configure using any network transport protocols configured from the Signaling server.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   The value of the option to not configure using any network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com"</code>, <code>"turn:server1.com:3478"</code>]</small>
 *   <small>Configuring this does not mean that no protocols will be used, but
 *   rather removing <code>?transport=(protocol)</code> query option in
 *   the TURN ICE server <code>.urls</code> when constructing the Peer connection.</small>
 * @param {String} ALL <small>Value  <code>"all"</code></small>
 *   The value of the option to configure using both TCP and UDP network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server.com?transport=udp"</code>, <code>"turn:server1.com:3478?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
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
 * Function that filters and configures the ICE servers received from Signaling
 *   based on the <code>init()</code> configuration and returns the updated
 *   list of ICE servers to be used when constructing Peer connection.
 * @method _setIceServers
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._setIceServers = function(passedIceServers) {
  var self = this;
  var iceServerName = null;
  var iceServerProtocol = 'stun';
  var iceServerPorts = {
    udp: [3478, 19302, 19303, 19304],
    tcp: [80, 443],
    both: [19305, 19306, 19307, 19308]
  };
  var iceServers = [
    // Public
    { urls: [] },
    // Private
    { urls: [] }
  ];

  // Note: Provide only 1 single TURN! turn:xxxx.io for custom TURN servers. Ignores custom ports.
  passedIceServers.forEach(function (server) {
    if (server.url.indexOf('stun:') === 0) {
      if (server.url.indexOf('temasys') > 0) {
        // server[?transport=xxx]
        iceServerName = (server.url.split(':')[1] || '').split('?')[0] || null;
      } else {
        iceServers[0].urls.push(server.url);
      }

    } else if (server.url.indexOf('turn:') === 0 && server.url.indexOf('@') > 0 && server.credential &&
      !(iceServers[1].username || iceServers[1].credential)) {
      var parts = server.url.split(':');
      var urlParts = (parts[1] || '').split('@');

      // server[?transport=xxx]
      iceServerName = (urlParts[1] || '').split('?')[0];
      iceServers[1].username = urlParts[0];
      iceServers[1].credential = server.credential;
      iceServerProtocol = 'turn';
    }
  });

  if (self._iceServer) {
    iceServers = [{
      urls: self._iceServer.urls,
      username: iceServers[1].username,
      credential: iceServers[1].credential
    }];

  } else {
    iceServerName = iceServerName || 'turn.temasys.io';

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      iceServerPorts.udp = [3478];
      iceServerPorts.tcp = [];
      iceServerPorts.both = [];
      iceServerProtocol = 'turn';

    } else if (self._forceTURNSSL) {
      if (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion < 53) {
        iceServerPorts.udp = [];
        iceServerPorts.tcp = [443];
        iceServerPorts.both = [];
        iceServerProtocol = 'turn';

      } else {
        iceServerPorts.udp = [];
        iceServerProtocol = 'turns';
      }

    // Limit the number of ports..
    } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
      iceServerPorts.udp = [3478];
      iceServerPorts.tcp = [443, 80];
    }

    if (self._TURNTransport === self.TURN_TRANSPORT.UDP) {
      iceServerPorts.udp = iceServerPorts.udp.concat(iceServerPorts.both);
      iceServerPorts.tcp = [];
      iceServerPorts.both = [];
    }

    if (self._TURNTransport === self.TURN_TRANSPORT.TCP) {
      iceServerPorts.tcp = iceServerPorts.tcp.concat(iceServerPorts.both);
      iceServerPorts.udp = [];
      iceServerPorts.both = [];

    } else if (self._TURNTransport === self.TURN_TRANSPORT.NONE) {
      iceServerPorts.tcp = [];
      iceServerPorts.udp = [];
    }

    if (iceServerProtocol === 'stun') {
      iceServerPorts.tcp = [];
    }

    iceServerPorts.tcp.forEach(function (tcpPort) {
      iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + tcpPort + '?transport=tcp');
    });

    iceServerPorts.udp.forEach(function (udpPort) {
      iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + udpPort + '?transport=udp');
    });

    iceServerPorts.both.forEach(function (bothPort) {
      iceServers[1].urls.push(iceServerProtocol + ':' + iceServerName + ':' + bothPort);
    });
  }

  if (!self._usePublicSTUN) {
    iceServers.splice(0, 1);
  }

  log.log('Output iceServers configuration:', iceServers);  

  return {
    iceServers: iceServers
  };
};
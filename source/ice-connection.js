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

    if (self._TURNTransport === self.TURN_TRANSPORT.UDP && !self._forceTURNSSL) {
      iceServerPorts.udp = iceServerPorts.udp.concat(iceServerPorts.both);
      iceServerPorts.tcp = [];
      iceServerPorts.both = [];

    } else if (self._TURNTransport === self.TURN_TRANSPORT.TCP) {
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
import parsers from './index';

/**
 * Function that parses the raw stats from the RTCInboundRtpStreamStats and RTCOutboundRtpStreamStats dictionary.
 * @param {SkylinkState} state - The room state.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {String} prop - Stats dictionary identifier.
 * @param {RTCPeerConnection} peerConnection - The peer connection.
 * @param {String} peerId - The peer Id.
 * @param {Boolean} isAutoBwStats - The flag if auto bandwidth adjustment is true.
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseVideo = (state, output, prop, peerConnection, peerId, isAutoBwStats) => {
  const { peerBandwidth, peerStats } = state;
  const { raw, video } = output;
  const prevStats = isAutoBwStats ? peerBandwidth[peerId][prop] : peerStats[peerId][prop];

  if (raw[prop].mediaType === 'video' && (raw[prop].type === 'inbound-rtp' || raw[prop].type === 'outbound-rtp')) {
    const direction = raw[prop].type === 'inbound-rtp' ? 'receiving' : 'sending';

    if (direction === 'receiving') {
      const bytesReceived = parseInt(raw[prop].bytesReceived || '0', 10);
      video[direction].totalBytes = bytesReceived;
      video[direction].bytes = parsers.tabulateStats(prevStats, raw[prop], 'bytesReceived');

      const packetsReceived = parseInt(raw[prop].packetsReceived || '0', 10);
      video[direction].totalPackets = packetsReceived;
      video[direction].packets = parsers.tabulateStats(prevStats, raw[prop], 'packetsReceived');

      const packetsLost = parseInt(raw[prop].packetsLost || '0', 10);
      video[direction].totalPacketsLost = packetsLost;
      video[direction].packetsLost = parsers.tabulateStats(prevStats, raw[prop], 'packetsLost');

      const firsSent = parseInt(raw[prop].firCount || '0', 10);
      video[direction].totalFirs = firsSent;
      video[direction].firs = parsers.tabulateStats(prevStats, raw[prop], 'firCount');

      const nacksSent = parseInt(raw[prop].nackCount || '0', 10);
      video[direction].totalNacks = nacksSent;
      video[direction].nacks = parsers.tabulateStats(prevStats, raw[prop], 'nackCount');

      const plisSent = parseInt(raw[prop].pliCount || '0', 10);
      video[direction].totalPlis = plisSent;
      video[direction].plis = parsers.tabulateStats(prevStats, raw[prop], 'pliCount');

      video[direction].fractionLost = parseInt(raw[prop].fractionLost || '0', 10);
      video[direction].framesDecoded = parseInt(raw[prop].framesDecoded || '0', 10);
      video[direction].qpSum = parseInt(raw[prop].qpSum || '0', 10);

      const { trackId } = raw[prop];
      const videoReceiver = raw[trackId];
      if (videoReceiver) {
        video[direction].framesDropped = parseFloat(videoReceiver.framesDropped || '0');
        video[direction].framesReceived = parseInt(videoReceiver.framesReceived || '0', 10);
      }
    }

    if (direction === 'sending') {
      const bytesSent = parseInt(raw[prop].bytesSent || '0', 10);
      video[direction].totalBytes = bytesSent;
      video[direction].bytes = parsers.tabulateStats(prevStats, raw[prop], 'bytesSent');

      const packetsSent = parseInt(raw[prop].packetsSent || '0', 10);
      video[direction].totalPackets = packetsSent;
      video[direction].packets = parsers.tabulateStats(prevStats, raw[prop], 'packetsSent');

      const firsReceived = parseInt(raw[prop].firCount || '0', 10);
      video[direction].totalFirs = firsReceived;
      video[direction].firs = parsers.tabulateStats(prevStats, raw[prop], 'firCount');

      const nacksReceived = parseInt(raw[prop].nackCount || '0', 10);
      video[direction].totalNacks = nacksReceived;
      video[direction].nacks = parsers.tabulateStats(prevStats, raw[prop], 'nackCount');

      const plisReceived = parseInt(raw[prop].pliCount || '0', 10);
      video[direction].totalPlis = plisReceived;
      video[direction].plis = parsers.tabulateStats(prevStats, raw[prop], 'pliCount');

      video[direction].framesEncoded = parseInt(raw[prop].framesEncoded || '0', 10);
      video[direction].qpSum = parseInt(raw[prop].qpSum || '0', 10);

      const { trackId } = raw[prop];
      const videoSender = raw[trackId];
      if (videoSender) {
        video[direction].frameWidth = parseInt(videoSender.frameWidth || '0', 10);
        video[direction].frameHeight = parseInt(videoSender.frameHeight || '0', 10);
        video[direction].framesSent = parseInt(videoSender.framesSent || '0', 10);
        video[direction].hugeFramesSent = parseInt(videoSender.hugeFramesSent || '0', 10);
      }
    }
  }
  // TODO:
  //  // Test for Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
  //  // FF not full implmentation of inbound-rtp and outbound-rtp
  //  // https://webrtc-stats.callstats.io/
};

export default parseVideo;

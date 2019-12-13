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
const parseAudio = (state, output, prop, peerConnection, peerId, isAutoBwStats) => {
  const { peerBandwidth, peerStats } = state;
  const { raw, audio } = output;
  const prevStats = isAutoBwStats ? peerBandwidth[peerId][prop] : peerStats[peerId][prop];

  // Chrome / Safari 12
  if (raw[prop].mediaType === 'audio' && (raw[prop].type === 'inbound-rtp' || raw[prop].type === 'outbound-rtp')) {
    const direction = raw[prop].type === 'inbound-rtp' ? 'receiving' : 'sending';

    if (direction === 'receiving') {
      const bytesReceived = parseInt(raw[prop].bytesReceived || '0', 10);
      audio[direction].totalBytes = bytesReceived;
      audio[direction].bytes = parsers.tabulateStats(prevStats, raw[prop], 'bytesReceived');

      const packetsLost = parseInt(raw[prop].packetsLost || '0', 10);
      audio[direction].totalPacketsLost = packetsLost;
      audio[direction].packetsLost = parsers.tabulateStats(prevStats, raw[prop], 'packetsLost');

      const packetsReceived = parseInt(raw[prop].packetsReceived || '0', 10);
      audio[direction].totalPackets = packetsReceived;
      audio[direction].packets = parsers.tabulateStats(prevStats, raw[prop], 'packetsReceived');

      const nacksSent = parseInt(raw[prop].nackCount || '0', 10);
      audio[direction].totalNacks = nacksSent;
      audio[direction].nacks = parsers.tabulateStats(prevStats, raw[prop], 'nackCount');

      audio[direction].fractionLost = parseInt(raw[prop].fractionLost || '0', 10);
      audio[direction].jitter = parseInt(raw[prop].jitter || '0', 10);

      const { trackId } = raw[prop];
      const audioReceiver = raw[trackId];
      if (audioReceiver) {
        audio[direction].audioLevel = parseFloat(audioReceiver.audioLevel || '0');
        audio[direction].totalAudioEnergy = parseInt(audioReceiver.totalAudioEnergy || '0', 10);
        audio[direction].jitterBufferDelay = parseInt(audioReceiver.jitterBufferDelay || '0', 10);
        audio[direction].jitterBufferEmittedCount = parseInt(audioReceiver.jitterBufferEmittedCount || '0', 10);
      }
    }

    if (direction === 'sending') {
      const bytesSent = parseInt(raw[prop].bytesSent || '0', 10);
      audio[direction].totalBytes = bytesSent;
      audio[direction].bytes = parsers.tabulateStats(prevStats, raw[prop], 'bytesSent');

      const packetsSent = parseInt(raw[prop].packetsSent || '0', 10);
      audio[direction].totalPackets = packetsSent;
      audio[direction].packets = parsers.tabulateStats(prevStats, raw[prop], 'packetsSent');

      const nacksReceived = parseInt(raw[prop].nackCount || '0', 10);
      audio[direction].totalNacks = nacksReceived;
      audio[direction].nacks = parsers.tabulateStats(prevStats, raw[prop], 'nackCount');

      const { trackId } = raw[prop];
      const audioSender = raw[trackId];
      if (audioSender) {
        audio[direction].echoReturnLoss = parseInt(audioSender.echoReturnLoss || '0', 10);
        audio[direction].echoReturnLossEnhancement = parseInt(audioSender.echoReturnLoss || '0', 10);
      }
    }
  }
  // TODO:
  //  // Test for Edge (WebRTC not ORTC shim) (Inbound stats) - Stats may not be accurate as it returns 0.
  //  // FF not full implmentation of inbound-rtp and outbound-rtp
  //  // https://webrtc-stats.callstats.io/
  // } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'inboundrtp' && item.mediaType === 'audio' && item.isRemote) {
  //   output.audio.receiving.fractionLost = item.fractionLost;
  //   output.audio.receiving.jitter = item.jitter;
  //
  //   output.audio.receiving.totalBytes = item.bytesReceived;
  //   output.audio.receiving.bytes = self._parseConnectionStats(prevStats, item, 'bytesReceived');
  //
  //   output.audio.receiving.totalPackets = item.packetsReceived;
  //   output.audio.receiving.packets = self._parseConnectionStats(prevStats, item, 'packetsReceived');
  //
  //   output.audio.receiving.totalPacketsLost = item.packetsLost;
  //   output.audio.receiving.packetsLost = self._parseConnectionStats(prevStats, item, 'packetsLost');
  //
  //   output.audio.receiving.totalNacks = item.nackCount;
  //   output.audio.receiving.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');
  //
  //   // Edge (WebRTC not ORTC shim) (Outbound stats) - Stats may not be accurate as it returns 0.
  // } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && item.type === 'outboundrtp' && item.mediaType === 'audio' && !item.isRemote) {
  //   output.audio.sending.targetBitrate = item.targetBitrate;
  //   output.audio.sending.rtt = item.roundTripTime;
  //
  //   output.audio.sending.totalBytes = item.bytesSent;
  //   output.audio.sending.bytes = self._parseConnectionStats(prevStats, item, 'bytesSent');
  //
  //   output.audio.sending.totalPackets = item.packetsSent;
  //   output.audio.sending.packets = self._parseConnectionStats(prevStats, item, 'packetsSent');
  //
  //   output.audio.sending.totalNacks = item.nackCount;
  //   output.audio.sending.nacks = self._parseConnectionStats(prevStats, item, 'nackCount');
  //
  //   var trackItem = output.raw[item.mediaTrackId || ''] || {};
  //   output.audio.sending.audioInputLevel = trackItem.audioLevel;
  //   output.audio.sending.echoReturnLoss = trackItem.echoReturnLoss;
  //   output.audio.sending.echoReturnLossEnhancement = trackItem.echoReturnLossEnhancement;
};

export default parseAudio;

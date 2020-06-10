import parsers from './index';
import logger from '../../../../logger';
import { TAGS } from '../../../../constants';
import messages from '../../../../messages';

/**
 * @typedef videoStats - The Peer connection video streaming statistics.
 * @property {JSON} videoStats.sending The Peer connection sending video streaming statistics.
 * @property {Number} videoStats.sending.ssrc The Peer connection sending video streaming RTP packets SSRC.
 * @property {Number} videoStats.sending.bytes The Peer connection current sending video streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {Number} videoStats.sending.totalBytes The Peer connection total sending video streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {Number} videoStats.sending.packets The Peer connection current sending video streaming packets.
 * @property {Number} videoStats.sending.totalPackets The Peer connection total sending video streaming packets.
 * @property {Number} videoStats.sending.roundTripTime The Peer connection sending video streaming Round-trip delay time.
 *   Defined as <code>0</code> if it's not present in original raw statistics before parsing.
 * @property {Number} videoStats.sending.jitter <blockquote class="info">
 *   This property has been deprecated and would be removed in future releases
 *   as it should not be in <code>sending</code> property.
 *   </blockquote> The Peer connection sending video streaming RTP packets jitter in seconds.
 *   Defined as <code>0</code> if it's not present in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.qpSum] - The Peer connection sending video streaming sum of the QP values of frames passed.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.frames] - The Peer connection sending video streaming frames.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.frameWidth] - The Peer connection sending video streaming frame width.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.frameHeight] - The Peer connection sending video streaming frame height.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.hugeFramesSent] - The Peer connection sending video streaming number
 * of huge frames sent by this RTP stream. Huge frames, by definition, are frames that have an encoded size at least 2.5 times the average size of the frames.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.framesPerSecond] - The Peer connection sending video streaming fps.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.framesEncoded] - The Peer connection sending video streaming frames encoded.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.nacks] - The Peer connection current sending video streaming nacks.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.totalNacks] - The Peer connection total sending video streaming nacks.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.plis] - The Peer connection current sending video streaming plis.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.totalPlis] - The Peer connection total sending video streaming plis.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.firs] - The Peer connection current sending video streaming firs.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.totalFirs] - The Peer connection total sending video streaming firs.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {JSON} [videoStats.sending.codec] - The Peer connection sending video streaming selected codec information.
 *   Defined as <code>null</code> if local session description is not available before parsing.
 * @property {String} videoStats.sending.codec.name The Peer connection sending video streaming selected codec name.
 * @property {Number} videoStats.sending.codec.payloadType The Peer connection sending video streaming selected codec payload type.
 * @property {String} [videoStats.sending.codec.implementation] - The Peer connection sending video streaming selected codec implementation.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.sending.codec.channels] - The Peer connection sending video streaming selected codec channels (2 for stereo).
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing,
 *   and this is usually present in <code>statistics.audio</code> property.
 * @property {Number} [videoStats.sending.codec.clockRate] - The Peer connection sending video streaming selected codec media sampling rate.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {String} [videoStats.sending.codec.params] - The Peer connection sending video streaming selected codec parameters.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {JSON} videoStats.receiving The Peer connection receiving video streaming statistics.
 * @property {Number} videoStats.receiving.ssrc The Peer connection receiving video streaming RTP packets SSRC.
 * @property {Number} videoStats.receiving.bytes The Peer connection current receiving video streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {Number} videoStats.receiving.totalBytes The Peer connection total receiving video streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {Number} videoStats.receiving.packets The Peer connection current receiving video streaming packets.
 * @property {Number} videoStats.receiving.totalPackets The Peer connection total receiving video streaming packets.
 * @property {Number} videoStats.receiving.packetsLost The Peer connection current receiving video streaming packets lost.
 * @property {Number} videoStats.receiving.totalPacketsLost The Peer connection total receiving video streaming packets lost.
 * @property {Number} [videoStats.receiving.frames] - The Peer connection receiving video streaming frames.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.frameWidth] - The Peer connection sending video streaming frame width.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.frameHeight] - The Peer connection sending video streaming frame height.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.framesDecoded] - The Peer connection receiving video streaming frames decoded.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.framesDroped] - The Peer connection receiving video streaming frames dropped.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.nacks] - The Peer connection current receiving video streaming nacks.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.totalNacks] - The Peer connection total receiving video streaming nacks.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.plis] - The Peer connection current receiving video streaming plis.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.totalPlis] - The Peer connection total receiving video streaming plis.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.firs] - The Peer connection current receiving video streaming firs.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.totalFirs] - The Peer connection total receiving video streaming firs.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {JSON} [videoStats.receiving.codec] - The Peer connection receiving video streaming selected codec information.
 *   Defined as <code>null</code> if remote session description is not available before parsing.
 *   Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
 *   The value is derived from the remote session description.
 * @property {String} videoStats.receiving.codec.name The Peer connection receiving video streaming selected codec name.
 * @property {Number} videoStats.receiving.codec.payloadType The Peer connection receiving video streaming selected codec payload type.
 * @property {String} [videoStats.receiving.codec.implementation] - The Peer connection receiving video streaming selected codec implementation.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {Number} [videoStats.receiving.codec.channels] - The Peer connection receiving video streaming selected codec channels (2 for stereo).
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing,
 *   and this is usually present in <code>statistics.audio</code> property.
 * @property {Number} [videoStats.receiving.codec.clockRate] - The Peer connection receiving video streaming selected codec media sampling rate.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {String} [videoStats.receiving.codec.params] - The Peer connection receiving video streaming selected codec parameters.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 */

const parseReceiving = (output, value, prevStats) => {
  const parsedStats = output.video.receiving;

  if (value.bytesReceived) {
    const bytesReceived = parseInt(value.bytesReceived || '0', 10);
    parsedStats.totalBytes = bytesReceived;
    parsedStats.bytes = parsers.tabulateStats(prevStats, value, 'bytesReceived');
  }

  if (value.packetsReceived) {
    const packetsReceived = parseInt(value.packetsReceived || '0', 10);
    parsedStats.totalPackets = packetsReceived;
    parsedStats.packets = parsers.tabulateStats(prevStats, value, 'packetsReceived');
  }

  if (Number.isInteger(value.packetsLost)) {
    const packetsLost = parseInt(value.packetsLost || '0', 10);
    parsedStats.totalPacketsLost = packetsLost;
    parsedStats.packetsLost = parsers.tabulateStats(prevStats, value, 'packetsLost');
  }

  if (Number.isInteger(value.firCount)) {
    const firsSent = parseInt(value.firCount || '0', 10);
    parsedStats.totalFirs = firsSent;
    parsedStats.firs = parsers.tabulateStats(prevStats, value, 'firCount');
  }

  if (Number.isInteger(value.nackCount)) {
    const nacksSent = parseInt(value.nackCount || '0', 10);
    parsedStats.totalNacks = nacksSent;
    parsedStats.nacks = parsers.tabulateStats(prevStats, value, 'nackCount');
  }

  if (value.pliCount || Number.isInteger(value.pliCount)) {
    const plisSent = parseInt(value.pliCount || '0', 10);
    parsedStats.totalPlis = plisSent;
    parsedStats.plis = parsers.tabulateStats(prevStats, value, 'pliCount');
  }

  parsedStats.ssrc = value.ssrc;
  parsedStats.qpSum = parseInt(value.qpSum || '0', 10);
  parsedStats.decoderImplementation = value.decoderImplementation;

  const { trackId } = value;
  const videoReceiver = output.raw[trackId];

  if (videoReceiver) {
    parsedStats.framesDropped = parseFloat(videoReceiver.framesDropped || '0');
    parsedStats.frames = parseInt(videoReceiver.framesReceived || '0', 10);
    parsedStats.framesDecoded = parseInt(videoReceiver.framesDecoded || '0', 10);
    parsedStats.frameWidth = parseInt(videoReceiver.frameWidth || '0', 10);
    parsedStats.frameHeight = parseInt(videoReceiver.frameHeight || '0', 10);
  }
};

const parseSending = (output, value, prevStats) => {
  const parsedStats = output.video.sending;

  if (value.bytesSent) {
    const bytesSent = parseInt(value.bytesSent || '0', 10);
    parsedStats.totalBytes = bytesSent;
    parsedStats.bytes = parsers.tabulateStats(prevStats, value, 'bytesSent');
  }

  if (value.packetsSent) {
    const packetsSent = parseInt(value.packetsSent || '0', 10);
    parsedStats.totalPackets = packetsSent;
    parsedStats.packets = parsers.tabulateStats(prevStats, value, 'packetsSent');
  }

  if (Number.isInteger(value.firCount)) {
    const firsReceived = parseInt(value.firCount || '0', 10);
    parsedStats.totalFirs = firsReceived;
    parsedStats.firs = parsers.tabulateStats(prevStats, value, 'firCount');
  }

  if (Number.isInteger(value.nackCount)) {
    const nacksReceived = parseInt(value.nackCount || '0', 10);
    parsedStats.totalNacks = nacksReceived;
    parsedStats.nacks = parsers.tabulateStats(prevStats, value, 'nackCount');
  }

  if (Number.isInteger(value.pliCount)) {
    const plisReceived = parseInt(value.pliCount || '0', 10);
    parsedStats.totalPlis = plisReceived;
    parsedStats.plis = parsers.tabulateStats(prevStats, value, 'pliCount');
  }

  if (value.jitter) {
    parsedStats.jitter = parseInt(value.jitter || '0', 10);
  }

  if (value.roundTripTime) {
    parsedStats.roundTripTime = parseInt(value.roundTripTime || '0', 10);
  }

  if (Number.isInteger(value.framesEncoded)) {
    parsedStats.framesEncoded = parseInt(value.framesEncoded || '0', 10);
  }

  parsedStats.ssrc = value.ssrc;
  parsedStats.qpSum = parseInt(value.qpSum || '0', 10);

  const { trackId, mediaSourceId } = value;
  const videoSender = output.raw[trackId];

  if (videoSender) {
    parsedStats.frameWidth = parseInt(videoSender.frameWidth || '0', 10);
    parsedStats.frameHeight = parseInt(videoSender.frameHeight || '0', 10);
    parsedStats.frames = parseInt(videoSender.framesSent || '0', 10);
    parsedStats.hugeFramesSent = parseInt(videoSender.hugeFramesSent || '0', 10);
  }

  const videoSource = output.raw[mediaSourceId];

  if (videoSource) {
    parsedStats.framesPerSecond = parseInt(videoSource.framesPerSecond || '0', 10);
  }
};

/**
 * Function that parses the raw stats from the RTCInboundRtpStreamStats and RTCOutboundRtpStreamStats dictionary.
 * @param {SkylinkState} state - The room state.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {String} type - Stats dictionary identifier.
 * @param {RTCPeerConnection} value - Stats value.
 * @param {String} peerId - The peer Id.
 * @param {String} direction - The direction of the media flow, i.e. sending or receiving
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseVideo = (state, output, type, value, peerId, direction) => {
  const { peerStats } = state;
  const prevStats = peerStats[peerId][value.id];
  switch (direction) {
    case 'receiving':
      parseReceiving(output, value, prevStats);
      break;
    case 'sending':
      parseSending(output, value, prevStats);
      break;
    default:
      logger.log.DEBUG([peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.ERRORS.PARSE_FAILED]);
  }
};

export default parseVideo;

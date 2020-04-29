import parsers from './index';
import logger from '../../../../logger';
import { TAGS } from '../../../../constants';
import messages from '../../../../messages';
import { isANumber } from '../../../../utils/helpers';

/**
 * @typedef {Object} audioStats - The Peer connection audio streaming statistics.
 * @property {JSON} audioStats.sending The Peer connection sending audio streaming statistics.
 * @property {number} audioStats.sending.bytes The Peer connection current sending audio streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {number} audioStats.sending.totalBytes The Peer connection total sending audio streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {number} audioStats.sending.packets The Peer connection current sending audio streaming packets.
 * @property {number} audioStats.sending.totalPackets The Peer connection total sending audio streaming packets.
 * @property {number} audioStats.sending.ssrc The Peer connection sending audio streaming RTP packets SSRC.
 * @property {number} audioStats.sending.roundTripTime The Peer connection sending audio streaming round-trip delay time.
 * @property {number} audioStats.sending.jitter The Peer connection sending audio streaming RTP packets jitter in seconds.
 * @property {number} audioStats.sending.retransmittedBytesSent The total number of bytes that were retransmitted for this SSRC, only including
 *   payload bytes. This is a subset of bytesSent.
 * @property {number} audioStats.sending.retransmittedPacketsSent The total number of packets that were retransmitted for this SSRC. This is a subset of packetsSent.
 * @property {JSON} [audioStats.sending.codec] - The Peer connection sending audio streaming selected codec information.
 *   Defined as <code>null</code> if local session description is not available before parsing.
 * @property {String} audioStats.sending.codec.name The Peer connection sending audio streaming selected codec name.
 * @property {number} audioStats.sending.codec.payloadType The Peer connection sending audio streaming selected codec payload type.
 * @property {String} [audioStats.sending.codec.implementation] - The Peer connection sending audio streaming selected codec implementation.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {number} [audioStats.sending.codec.channels] - The Peer connection sending audio streaming selected codec channels (2 for stereo).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing,
 *   and this is usually present in <code>statistics.audio</code> property.
 * @property {number} [audioStats.sending.codec.clockRate] - The Peer connection sending audio streaming selected codec media sampling rate.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [audioStats.sending.codec.params] - The Peer connection sending audio streaming selected codec parameters.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {number} [audioStats.sending.audioLevel] - The Peer connection audio level of the media source.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {number} [audioStats.sending.totalSamplesDuration] - The Peer connection sending audio total duration in seconds.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {number} [audioStats.sending.echoReturnLoss] - The Peer connection sending audio streaming echo return loss in db (decibels).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {number} [audioStats.sending.echoReturnLossEnhancement] - The Peer connection sending audio streaming
 *   echo return loss enhancement db (decibels).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} audioStats.receiving The Peer connection receiving audio streaming statistics.
 * @property {number} audioStats.receiving.bytes The Peer connection current sending audio streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {number} audioStats.receiving.totalBytes The Peer connection total sending audio streaming bytes.
 *   Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.
 * @property {number} audioStats.receiving.packets The Peer connection current receiving audio streaming packets.
 * @property {number} audioStats.receiving.totalPackets The Peer connection total receiving audio streaming packets.
 * @property {number} audioStats.receiving.packetsLost The Peer connection current receiving audio streaming packets lost.
 * @property {number} audioStats.receiving.fractionLost The Peer connection current receiving audio streaming fraction packets lost.
 * @property {number} audioStats.receiving.totalPacketsLost The Peer connection total receiving audio streaming packets lost.
 * @property {number} audioStats.receiving.ssrc The Peer connection receiving audio streaming RTP packets SSRC.
 * @property {Number} audioStats.receiving.jitter The Peer connection receiving audio streaming RTP packets jitter in seconds.
 *   Defined as <code>0</code> if it's not present in original raw statistics before parsing.
 * @property {Number} audioStats.receiving.totalSamplesReceived The Peer connection total number of audio samples that
 * have been received.
 * @property {number} [audioStats.receiving.totalSamplesDuration] - The Peer connection receiving audio total duration in seconds.
 *   Defined as <code>null</code> if it's not available in original raw statistics before parsing.
 * @property {JSON} [audioStats.receiving.codec] - The Peer connection receiving audio streaming selected codec information.
 *   Defined as <code>null</code> if remote session description is not available before parsing.
 *   Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
 *   The value is derived from the remote session description.
 * @property {String} audioStats.receiving.codec.name The Peer connection receiving audio streaming selected codec name.
 * @property {Number} audioStats.receiving.codec.payloadType The Peer connection receiving audio streaming selected codec payload type.
 * @property {String} [audioStats.receiving.codec.implementation] - The Peer connection receiving audio streaming selected codec implementation.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {Number} [audioStats.receiving.codec.channels] - The Peer connection receiving audio streaming selected codec channels (2 for stereo).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing,
 *   and this is usually present in <code>statistics.audio</code> property.
 * @property {Number} [audioStats.receiving.codec.clockRate] - The Peer connection receiving audio streaming selected codec media sampling rate.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [audioStats.receiving.codec.params] - The Peer connection receiving audio streaming selected codec parameters.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {Number} [audioStats.receiving.audioLevel] - The Peer connection receiving audio streaming audio level.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 */

const parseReceiving = (output, value, prevStats) => {
  const parsedStats = output.audio.receiving;

  const packetsReceived = parseInt(value.packetsReceived || '0', 10);
  parsedStats.totalPackets = packetsReceived;
  parsedStats.packets = parsers.tabulateStats(prevStats, value, 'packetsReceived');

  const bytesReceived = parseInt(value.bytesReceived || '0', 10);
  parsedStats.totalBytes = bytesReceived;
  parsedStats.bytes = parsers.tabulateStats(prevStats, value, 'bytesReceived');

  const packetsLost = parseInt(value.packetsLost || '0', 10);
  parsedStats.totalPacketsLost = packetsLost;
  parsedStats.packetsLost = parsers.tabulateStats(prevStats, value, 'packetsLost');

  parsedStats.jitter = parseInt(value.jitter || '0', 10);
  parsedStats.ssrc = value.ssrc;

  const { trackId } = value;
  const audioReceiver = output.raw[trackId];

  if (audioReceiver) {
    parsedStats.audioLevel = parseFloat(audioReceiver.audioLevel).toFixed(5);
    parsedStats.totalSamplesReceived = parseInt(audioReceiver.totalSamplesReceived || '0', 10);
    parsedStats.totalSamplesDuration = parseInt(audioReceiver.totalSamplesDuration || '0', 10);

    // Available but unexposed stats
    // parsedStats.totalAudioLevel = parseFloat(audioReceiver.totalAudioLevel || '0');
    // parsedStats.jitterBufferDelay = parseInt(audioReceiver.jitterBufferDelay || '0', 10);
    // parsedStats.jitterBufferEmittedCount = parseInt(audioReceiver.jitterBufferEmittedCount || '0', 10);
    // parsedStats.concealedSamples = parseInt(audioReceiver.concealedSamples || '0', 10);
    // parsedStats.silentConcealedSamples = parseInt(audioReceiver.silentConcealedSamples || '0', 10);
    // parsedStats.concealmentEvents = parseInt(audioReceiver.concealmentEvents || '0', 10);
    // parsedStats.insertedSamplesForDeceleration = parseInt(audioReceiver.insertedSamplesForDeceleration || '0', 10);
    // parsedStats.removedSamplesForAcceleration = parseInt(audioReceiver.removedSamplesForAcceleration || '0', 10);
  }
};

const parseSending = (output, value, prevStats) => {
  const parsedStats = output.audio.sending;

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

  if (value.retransmittedBytesSent || isANumber(value.retransmittedBytesSent)) {
    const retransmittedBytesSent = parseInt(value.retransmittedBytesSent || '0', 10);
    parsedStats.totalRetransmittedBytesSent = retransmittedBytesSent;
    parsedStats.retransmittedBytesSent = parsers.tabulateStats(prevStats, value, 'retransmittedBytesSent');
  }

  if (value.retransmittedPacketsSent || isANumber(value.retransmittedPacketsSent)) {
    const retransmittedPacketsSent = parseInt(value.retransmittedPacketsSent || '0', 10);
    parsedStats.totalRetransmittedPacketsSent = retransmittedPacketsSent;
    parsedStats.retransmittedPacketsSent = parsers.tabulateStats(prevStats, value, 'retransmittedPacketsSent');
  }

  parsedStats.ssrc = value.ssrc;

  if (value.jitter) {
    parsedStats.jitter = parseInt(value.jitter || '0', 10);
  }

  if (value.roundTripTime) {
    parsedStats.roundTripTime = parseInt(value.roundTripTime || '0', 10);
  }

  const { trackId, mediaSourceId } = value;
  const audioSender = output.raw[trackId];
  if (audioSender) {
    parsedStats.echoReturnLoss = parseInt(audioSender.echoReturnLoss || '0', 10);
    parsedStats.echoReturnLossEnhancement = parseInt(audioSender.echoReturnLossEnhancement || '0', 10);
  }

  // Available but unexposed stats
  // parsedStats.totalAudioLevel = parseFloat(audioSender.totalAudioLevel || '0');

  const audioSource = output.raw[mediaSourceId];

  if (audioSource) {
    parsedStats.audioLevel = parseFloat(audioSource.audioLevel).toFixed(5);
    parsedStats.totalSamplesDuration = parseInt(audioSource.totalSamplesDuration || '0', 10);
  }
};

/**
 * Function that parses the raw stats from the RTCInboundRtpStreamStats and RTCOutboundRtpStreamStats dictionary.
 * @param {SkylinkState} state - The room state.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {String} type - Stats dictionary identifier.
 * @param {RTCPeerConnection} value - Stats value.
 * @param {String} peerId - The peer Id.
 * @param {Boolean} isAutoBwStats - The flag if auto bandwidth adjustment is true.
 * @param {String} direction - The direction of the media flow, i.e. sending or receiving
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseAudio = (state, output, type, value, peerId, isAutoBwStats, direction) => {
  const { peerBandwidth, peerStats } = state;
  const prevStats = isAutoBwStats ? peerBandwidth[peerId][value.id] : peerStats[peerId][value.id];
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

export default parseAudio;

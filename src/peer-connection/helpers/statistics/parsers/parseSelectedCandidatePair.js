/* eslint-disable prefer-destructuring */
import parsers from './index';
import { BROWSER_AGENT } from '../../../../constants';
import { isAgent } from '../../../../utils/helpers';

const formatCanTypeFn = (type) => {
  if (type === 'relay') {
    return 'relayed';
  } if (type === 'host' || type.indexOf('host') > -1) {
    return 'local';
  } if (type === 'srflx') {
    return 'serverreflexive';
  } if (type === 'prflx') {
    return 'peerreflexive';
  }
  return type;
};

/**
 * Function that parses the raw stats from the RTCIceCandidatePairStats dictionary.
 * @param {SkylinkState} roomState - The room state.
 * @param {Object} output - Stats output object that stores the parsed stats values.
 * @param {RTCPeerConnection} peerConnection - The peer connection.
 * @param {String} peerId - The peer Id.
 * @param {boolean} isAutoBwStats - The flag if auto bandwidth adjustment is true.
 * @memberOf PeerConnectionStatisticsParsers
 */
const parseSelectedCandidatePair = (roomState, output, type, value, peerConnection, peerId, isAutoBwStats) => {
  const { peerBandwidth, peerStats } = roomState;
  const { raw, selectedCandidatePair } = output;

  const keys = Object.keys(output.raw);
  let transportStats = null;
  let selectedLocalCandidateId = null;
  let selectedRemoteCandidateId = null;

  if (isAgent(BROWSER_AGENT.CHROME)) {
    // selectedCandidatePairId can only be obtained from RTCTransportStats and is needed to identify selected candidate pair
    for (let i = 0; i < keys.length; i += 1) {
      if (raw[keys[i]].type === 'transport') {
        transportStats = raw[keys[i]];
      }
    }
  } else if (isAgent(BROWSER_AGENT.FIREFOX)) {
    // FF has not implemented RTCTransportStats report and uses .selected available in the  'candidate-pair' stats report
    transportStats = {};
  }

  if (transportStats) {
    for (let i = 0; i < keys.length; i += 1) {
      const statsReport = raw[keys[i]];
      if ((statsReport.type === 'candidate-pair' && statsReport.id === transportStats.selectedCandidatePairId) || (statsReport.type === 'candidate-pair' && statsReport.selected)) {
        const candidatePairStats = statsReport;
        selectedLocalCandidateId = candidatePairStats.localCandidateId;
        selectedRemoteCandidateId = candidatePairStats.remoteCandidateId;

        selectedCandidatePair.id = candidatePairStats.id;
        selectedCandidatePair.writable = candidatePairStats.writable;
        selectedCandidatePair.priority = candidatePairStats.priority;
        selectedCandidatePair.nominated = candidatePairStats.nominated;

        const prevStats = isAutoBwStats ? peerBandwidth[peerId][statsReport.id] : peerStats[peerId][statsReport.id];
        // FF has not implemented the following stats
        const totalRoundTripTime = parseInt(statsReport.totalRoundTripTime || '0', 10);
        selectedCandidatePair.totalRoundTripTime = totalRoundTripTime;
        selectedCandidatePair.roundTripTime = parsers.tabulateStats(prevStats, statsReport, 'totalRoundTripTime');

        const consentRequestsSent = parseInt(statsReport.consentRequestsSent || '0', 10);
        selectedCandidatePair.consentRequests.totalSent = consentRequestsSent;
        selectedCandidatePair.consentRequests.sent = parsers.tabulateStats(prevStats, statsReport, 'consentRequestsSent');

        const requestsReceived = parseInt(statsReport.requestsReceived || '0', 10);
        selectedCandidatePair.requests.totalReceived = requestsReceived;
        selectedCandidatePair.requests.received = parsers.tabulateStats(prevStats, statsReport, 'requestsReceived');

        const requestsSent = parseInt(statsReport.requestsSent || '0', 10);
        selectedCandidatePair.requests.totalSent = requestsSent;
        selectedCandidatePair.requests.sent = parsers.tabulateStats(prevStats, statsReport, 'requestsSent');

        const responsesSent = parseInt(statsReport.responsesSent || '0', 10);
        selectedCandidatePair.responses.totalSent = responsesSent;
        selectedCandidatePair.responses.sent = parsers.tabulateStats(prevStats, statsReport, 'responsesSent');

        const responsesReceived = parseInt(statsReport.responsesReceived || '0', 10);
        selectedCandidatePair.responses.totalReceived = responsesReceived;
        selectedCandidatePair.responses.received = parsers.tabulateStats(prevStats, statsReport, 'responsesReceived');
      }
    }
  }

  if (selectedLocalCandidateId && selectedRemoteCandidateId) {
    if (type === 'remote-candidate') {
      const remoteCandidateStats = value;
      if (remoteCandidateStats.id === selectedRemoteCandidateId) {
        // FF uses address instead of ip
        selectedCandidatePair.remote.ipAddress = remoteCandidateStats.ip ? remoteCandidateStats.ip : remoteCandidateStats.address;
        selectedCandidatePair.remote.portNumber = remoteCandidateStats.port;
        selectedCandidatePair.remote.transport = remoteCandidateStats.protocol;
        selectedCandidatePair.remote.priority = remoteCandidateStats.priority;
        selectedCandidatePair.remote.candidateType = formatCanTypeFn(remoteCandidateStats.candidateType);
      }
    }

    if (type === 'local-candidate') {
      const localCandidateStats = value;
      if (localCandidateStats.id === selectedLocalCandidateId) {
        selectedCandidatePair.local.ipAddress = localCandidateStats.ip ? localCandidateStats.ip : localCandidateStats.address;
        selectedCandidatePair.local.portNumber = localCandidateStats.port;
        selectedCandidatePair.local.transport = localCandidateStats.protocol;
        selectedCandidatePair.local.priority = localCandidateStats.priority;
        selectedCandidatePair.local.networkType = localCandidateStats.networkType;
        selectedCandidatePair.local.candidateType = formatCanTypeFn(localCandidateStats.candidateType);
      }
    }
  }
};

export default parseSelectedCandidatePair;

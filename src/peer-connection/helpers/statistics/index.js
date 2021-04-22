import Skylink from '../../../index';
import SessionDescription from '../../../session-description';
import logger from '../../../logger';
import messages from '../../../messages';
import {
  GET_CONNECTION_STATUS_STATE, DATA_CHANNEL_TYPE, TAGS, BROWSER_AGENT,
} from '../../../constants';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { getConnectionStatusStateChange } from '../../../skylink-events/peer-events';
import parsers from './parsers/index';
import { isEmptyObj, isAgent } from '../../../utils/helpers';

/**
 * @classdesc This class is used to fetch the statistics for a RTCPeerConnection
 * @class
 * @private
 */
class PeerConnectionStatistics {
  constructor(roomKey, peerId) {
    /**
     * The current skylink state of the room
     * @type {SkylinkState}
     */
    this.roomState = Skylink.getSkylinkState(roomKey);
    /**
     * Current RTCPeerConnection based on the peerId
     * @type {RTCPeerConnection}
     */
    this.peerConnection = this.roomState.peerConnections[peerId] || null;
    this.dataChannel = this.roomState.dataChannels[peerId] || null;
    this.peerId = peerId;
    this.roomKey = roomKey;
    this.output = {
      peerId,
      raw: {},
      connection: {},
      audio: {
        sending: {},
        receiving: {},
      },
      video: {
        sending: {},
        receiving: {},
      },
      selectedCandidatePair: {
        id: null,
        local: {},
        remote: {},
        consentRequests: {},
        responses: {},
        requests: {},
      },
      certificate: {},
    };
    this.beSilentOnLogs = Skylink.getInitOptions().beSilentOnStatsLogs;
    this.beSilentOnParseLogs = Skylink.getInitOptions().beSilentOnParseLogs;
    this.bandwidth = null;
  }

  /**
   * Helper function for getting RTC Connection Statistics
   * @returns {Promise<statistics>}
   */
  getConnectionStatus() {
    return this.getStatistics(false, false);
  }

  getStatsSuccess(promiseResolve, promiseReject, stats) {
    if (!stats && isAgent(BROWSER_AGENT.REACT_NATIVE)) {
      // get stats in react native will resolve with 'null'
      promiseResolve(this.output);
      return;
    }
    const { peerStats, room } = this.roomState;
    // TODO: Need to do full implementation of success function
    if (typeof stats.forEach === 'function') {
      stats.forEach((item, prop) => {
        this.output.raw[prop] = item;
      });
    } else {
      this.output.raw = stats;
    }

    try {
      if (isEmptyObj(peerStats)) {
        logger.log.DEBUG([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.STATS_DISCARDED]);
        return;
      }

      const rawEntries = Object.entries(this.output.raw);
      rawEntries.forEach((entry) => {
        const key = entry[0];
        const value = entry[1];
        const { type } = value;
        switch (type) {
          case 'remote-inbound-rtp': // sender stats
          case 'outbound-rtp':
          case 'inbound-rtp':
            if (type === 'inbound-rtp') {
              parsers.parseMedia(this.roomState, this.output, type, value, this.peerConnection, this.peerId, 'receiving');
            } else {
              parsers.parseMedia(this.roomState, this.output, type, value, this.peerConnection, this.peerId, 'sending');
            }
            break;
          case 'certificate':
            parsers.parseCertificates(this.output, value);
            break;
          case 'local-candidate':
          case 'remote-candidate':
            parsers.parseSelectedCandidatePair(this.roomState, this.output, type, value, this.peerConnection, this.peerId);
            break;
          case 'media-source':
            parsers.parseSelectedCandidatePair(this.roomState, this.output, type, value, this.peerConnection, this.peerId);
            break;
          default:
            // do nothing
        }

        peerStats[this.peerId][key] = this.output.raw[key];

        Skylink.setSkylinkState(this.roomState, room.id);
      });
    } catch (err) {
      this.getStatsFailure(promiseReject, messages.STATS_MODULE.ERRORS.PARSE_FAILED, err);
    }

    if (!this.beSilentOnLogs) {
      dispatchEvent(getConnectionStatusStateChange({
        state: GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
        peerId: this.peerId,
        stats: this.output,
      }));
    }

    promiseResolve(this.output);
  }

  getStatsFailure(promiseReject, errorMsg, error) {
    const errMsg = errorMsg || messages.STATS_MODULE.RETRIEVE_STATS_FAILED;

    if (!this.beSilentOnLogs) {
      logger.log.ERROR([this.peerId, TAGS.STATS_MODULE, null, errMsg], error);
      dispatchEvent(getConnectionStatusStateChange({
        state: GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId: this.peerId,
        error,
      }));
    }
    promiseReject(error);
  }

  /**
   * Fetch webRTC stats of a RTCPeerConnection
   * @param beSilentOnLogs
   * @return {Promise<statistics>}
   * @fires GET_CONNECTION_STATUS_STATE_CHANGE
   */
  // eslint-disable-next-line consistent-return
  getStatistics(beSilentOnLogs = false) {
    const { STATS_MODULE } = messages;
    return new Promise((resolve, reject) => {
      if (!this.roomState.peerStats[this.peerId]) {
        logger.log.WARN(STATS_MODULE.NOT_INITIATED);
        resolve(null);
      } else {
        this.beSilentOnLogs = beSilentOnLogs;

        try {
          // obtain stats from SDP that are not available in stats report or not complete
          this.gatherRTCPeerConnectionDetails();
          this.gatherSDPIceCandidates();
          this.gatherSDPCodecs();
          this.gatherRTCDataChannelDetails();
        } catch (err) {
          logger.log.WARN([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.ERRORS.PARSE_FAILED], err);
        }

        if (typeof this.peerConnection.getStats !== 'function') {
          this.getStatsFailure(reject, messages.PEER_CONNECTION.STATS_API_UNAVAILABLE);
        }

        if (!this.beSilentOnLogs) {
          dispatchEvent(getConnectionStatusStateChange({
            state: GET_CONNECTION_STATUS_STATE.RETRIEVING,
            peerId: this.peerId,
          }));
        }

        this.peerConnection.getStats()
          .then((stats) => { this.getStatsSuccess(resolve, reject, stats); })
          .catch((error) => {
            if (error.message === messages.STATS_MODULE.ERRORS.STATS_IS_NULL) {
              logger.log.WARN([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.ERRORS.RETRIEVE_STATS_FAILED], error.message);
              return;
            }
            this.getStatsFailure(reject, null, error);
          });
      }
    });
  }

  /**
   * Formats output object with RTCPeerConnection details
   * @private
   */
  gatherRTCPeerConnectionDetails() {
    const { peerConnection } = this;
    this.output.connection.iceConnectionState = peerConnection.iceConnectionState;
    this.output.connection.iceGatheringState = peerConnection.iceGatheringState;
    this.output.connection.signalingState = peerConnection.signalingState;

    this.output.connection.remoteDescription = {
      type: (peerConnection.remoteDescription && peerConnection.remoteDescription.type) || '',
      sdp: (peerConnection.remoteDescription && peerConnection.remoteDescription.sdp) || '',
    };

    this.output.connection.localDescription = {
      type: (peerConnection.localDescription && peerConnection.localDescription.type) || '',
      sdp: (peerConnection.localDescription && peerConnection.localDescription.sdp) || '',
    };

    this.output.connection.constraints = this.peerConnection.constraints ? this.peerConnection.constraints : null;
    this.output.connection.sdpConstraints = this.peerConnection.sdpConstraints ? this.peerConnection.sdpConstraints : null;
  }

  /**
   * Formats output object with Ice Candidate details
   * @private
   */
  gatherSDPIceCandidates() {
    const { peerConnection, beSilentOnParseLogs } = this;
    this.output.connection.candidates = {
      sending: SessionDescription.getSDPICECandidates(this.peerId, peerConnection.localDescription, beSilentOnParseLogs),
      receiving: SessionDescription.getSDPICECandidates(this.peerId, peerConnection.remoteDescription, beSilentOnParseLogs),
    };
  }

  /**
   * Formats output object with SDP codecs
   * @private
   */
  gatherSDPCodecs() {
    const { peerConnection, beSilentOnParseLogs } = this;
    this.output.audio.sending.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.remoteDescription, 'audio', beSilentOnParseLogs);
    this.output.video.sending.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.remoteDescription, 'video', beSilentOnParseLogs);
    this.output.audio.receiving.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.localDescription, 'audio', beSilentOnParseLogs);
    this.output.video.receiving.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.localDescription, 'video', beSilentOnParseLogs);
  }

  /**
   * Formats output object with RTCDataChannel details
   * @private
   */
  gatherRTCDataChannelDetails() {
    const { dataChannel } = this;
    if (dataChannel) {
      const dcKeys = Object.keys(dataChannel);

      this.output.connection.dataChannels = {};

      dcKeys.forEach((prop) => {
        const channel = dataChannel[prop];
        this.output.connection.dataChannels[channel.channel.label] = {
          label: channel.channel.label,
          readyState: channel.channel.readyState,
          channelType: DATA_CHANNEL_TYPE[prop === 'main' ? 'MESSAGING' : 'DATA'],
          currentTransferId: channel.transferId || null,
          currentStreamId: channel.streamId || null,
        };
      });
    }
  }
}

export default PeerConnectionStatistics;

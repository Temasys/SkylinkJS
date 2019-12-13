import Skylink from '../../../index';
import SessionDescription from '../../../session-description';
import logger from '../../../logger';
import messages from '../../../messages';
import {
  GET_CONNECTION_STATUS_STATE, DATA_CHANNEL_TYPE, TAGS,
} from '../../../constants';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { getConnectionStatusStateChange } from '../../../skylink-events/peer-events';
import parsers from './parsers/index';
import { isEmptyObj } from '../../../utils/helpers';

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
    this.peerConnStatus = this.roomState.peerConnStatus[peerId] || null;
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
      selectedCandidate: {
        local: {},
        remote: {},
        // consentResponses: {}, TODO: remove
        consentRequests: {},
        responses: {},
        requests: {},
      },
      certificate: {},
    };
    this.beSilentOnLogs = Skylink.getInitOptions().beSilentOnStatsLogs;
    this.isAutoBwStats = false;
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
    const { AdapterJS } = window;
    const { peerBandwidth, peerStats } = this.roomState;
    // TODO: Need to do full implementation of success function
    if (typeof stats.forEach === 'function') {
      stats.forEach((item, prop) => {
        this.output.raw[prop] = item;
      });
    } else {
      this.output.raw = stats;
    }

    const edgeTracksKind = {
      remote: {},
      local: {},
    };

    try {
      if (isEmptyObj(peerStats)) {
        logger.log.DEBUG([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.STATS_DISCARDED]);
        return;
      }
      // Polyfill for Plugin missing "mediaType" stats item
      const rawOutput = Object.keys(this.output.raw);
      for (let i = 0; i < rawOutput.length; i += 1) {
        try {
          if (rawOutput[i].indexOf('ssrc_') === 0 && !this.output.raw[rawOutput[i]].mediaType) {
            this.output.raw[rawOutput[i]].mediaType = this.output.raw[rawOutput[i]].audioInputLevel || this.output.raw[rawOutput[i]].audioOutputLevel ? 'audio' : 'video';

            // Polyfill for Edge 15.x missing "mediaType" stats item
          } else if (AdapterJS.webrtcDetectedBrowser === 'edge' && !this.output.raw[rawOutput[i]].mediaType
            && ['inboundrtp', 'outboundrtp'].indexOf(this.output.raw[rawOutput[i]].type) > -1) {
            const trackItem = this.output.raw[this.output.raw[rawOutput[i]].mediaTrackId] || {};
            this.output.raw[rawOutput[i]].mediaType = edgeTracksKind[this.output.raw[rawOutput[i]].isRemote ? 'remote' : 'local'][trackItem.trackIdentifier] || '';
          }

          // Parse DTLS certificates and ciphers used
          parsers.parseCertificates(this.output, rawOutput[i]);
          parsers.parseSelectedCandidatePair(this.roomState, this.output, rawOutput[i], this.peerConnection, this.peerId, this.isAutoBwStats);
          parsers.parseCodecs(this.output, rawOutput[i]);
          parsers.parseAudio(this.roomState, this.output, rawOutput[i], this.peerConnection, this.peerId, this.isAutoBwStats);
          parsers.parseVideo(this.roomState, this.output, rawOutput[i], this.peerConnection, this.peerId, this.isAutoBwStats);
          parsers.parseVideoE2EDelay(this.roomState, this.output, rawOutput[i], this.peerConnection, this.peerId, this.beSilentOnLogs);

          if (this.isAutoBwStats && !peerBandwidth[this.peerId][rawOutput[i]]) {
            peerBandwidth[this.peerId][rawOutput[i]] = this.output.raw[rawOutput[i]];
          } else if (!this.isAutoBwStats && !peerStats[this.peerId][rawOutput[i]]) {
            peerStats[this.peerId][rawOutput[i]] = this.output.raw[rawOutput[i]];
          }
        } catch (err) {
          logger.log.DEBUG([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.ERRORS.PARSE_FAILED], err);
          break;
        }
      }
    } catch (err) {
      this.getStatsFailure(promiseReject, messages.STATS_MODULE.ERRORS.PARSE_FAILED, err);
    }

    dispatchEvent(getConnectionStatusStateChange({
      state: GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
      peerId: this.peerId,
      stats: this.output,
    }));

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
   * @param isAutoBwStats
   * @return {Promise<statistics>}
   * @fires getConnectionStatusStateChange
   */
  // eslint-disable-next-line consistent-return
  getStatistics(beSilentOnLogs = false, isAutoBwStats = false) {
    const { STATS_MODULE } = messages;
    return new Promise((resolve, reject) => {
      if (!this.roomState.peerStats[this.peerId] && !isAutoBwStats) {
        logger.log.WARN(STATS_MODULE.NOT_INITIATED);
        resolve(null);
      } else {
        this.beSilentOnLogs = beSilentOnLogs;
        this.isAutoBwStats = isAutoBwStats;

        try {
          this.gatherRTCPeerConnectionDetails();
          this.gatherSDPIceCandidates();
          this.gatherSDPCodecs();
          this.gatherCertificateDetails();
          this.gatherSSRCDetails();
          this.gatherRTCDataChannelDetails();
        } catch (err) {
          logger.log.WARN([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.ERRORS.PARSE_FAILED], err);
        }

        if (typeof this.peerConnection.getStats !== 'function') {
          this.getStatsFailure(reject, messages.PEER_CONNECTION.getstats_api_not_available);
        }

        dispatchEvent(getConnectionStatusStateChange({
          state: GET_CONNECTION_STATUS_STATE.RETRIEVING,
          peerId: this.peerId,
        }));

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

    this.output.connection.constraints = this.peerConnStatus ? this.peerConnStatus.constraints : null;
    this.output.connection.optional = this.peerConnStatus ? this.peerConnStatus.optional : null;
    this.output.connection.sdpConstraints = this.peerConnStatus ? this.peerConnStatus.sdpConstraints : null;
  }

  /**
   * Formats output object with Ice Candidate details
   * @private
   */
  gatherSDPIceCandidates() {
    const { peerConnection, beSilentOnLogs } = this;
    this.output.connection.candidates = {
      sending: SessionDescription.getSDPICECandidates(this.peerId, peerConnection.localDescription, beSilentOnLogs),
      receiving: SessionDescription.getSDPICECandidates(this.peerId, peerConnection.remoteDescription, beSilentOnLogs),
    };
  }

  /**
   * Formats output object with SDP codecs
   * @private
   */
  gatherSDPCodecs() {
    const { peerConnection, beSilentOnLogs } = this;
    this.output.audio.sending.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.remoteDescription, 'audio', beSilentOnLogs);
    this.output.video.sending.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.remoteDescription, 'video', beSilentOnLogs);
    this.output.audio.receiving.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.localDescription, 'audio', beSilentOnLogs);
    this.output.video.receiving.codec = SessionDescription.getSDPSelectedCodec(this.peerId, peerConnection.localDescription, 'video', beSilentOnLogs);
  }

  /**
   * Formats output object with SDP certificate details
   * @private
   */
  gatherCertificateDetails() {
    const { peerConnection, beSilentOnLogs } = this;
    this.output.certificate.local = SessionDescription.getSDPFingerprint(this.peerId, peerConnection.localDescription, beSilentOnLogs);
    this.output.certificate.remote = SessionDescription.getSDPFingerprint(this.peerId, peerConnection.remoteDescription, beSilentOnLogs);
  }

  /**
   * Formats output object with audio and video ssrc details
   * @private
   */
  gatherSSRCDetails() {
    const { peerConnection, beSilentOnLogs } = this;
    const inboundSSRCs = SessionDescription.getSDPMediaSSRC(this.peerId, peerConnection.remoteDescription, beSilentOnLogs);
    const outboundSSRCs = SessionDescription.getSDPMediaSSRC(this.peerId, peerConnection.localDescription, beSilentOnLogs);
    this.output.audio.receiving.ssrc = inboundSSRCs.audio;
    this.output.video.receiving.ssrc = inboundSSRCs.video;
    this.output.audio.sending.ssrc = outboundSSRCs.audio;
    this.output.video.sending.ssrc = outboundSSRCs.video;
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

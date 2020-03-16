import SkylinkStats from './index';
import Skylink from '../index';
import PeerConnection from '../peer-connection';
import logger from '../logger';
import MESSAGES from '../messages';

class HandleIceConnectionStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      appKey: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      peer_id: null,
      state: null,
      local_candidate: {},
      remote_candidate: {},
    };
  }

  send(roomKey, state, peerId) {
    try {
      const roomState = Skylink.getSkylinkState(roomKey);

      if (!roomState) return;

      this.model.room_id = roomKey;
      this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
      this.model.peer_id = peerId;
      this.model.client_id = roomState.clientId;
      this.model.state = state;
      this.model.appKey = Skylink.getInitOptions().appKey;
      this.model.timestamp = (new Date()).toISOString();

      PeerConnection.retrieveStatistics(roomKey, peerId, Skylink.getInitOptions().beSilentOnStatsLogs).then((stats) => {
        if (stats) {
          // Parse the selected ICE candidate pair for both local and remote candidate.
          ['local', 'remote'].forEach((dirType) => {
            const candidate = stats.selectedCandidatePair[dirType];
            if (candidate) {
              const modelCandidate = this.model[`${dirType}_candidate`];
              modelCandidate.ip_address = candidate.ipAddress || null;
              modelCandidate.port_number = candidate.portNumber || null;
              modelCandidate.candidate_type = candidate.candidateType || null;
              modelCandidate.protocol = candidate.transport || null;
              modelCandidate.priority = candidate.priority || null;

              // This is only available for the local ICE candidate.
              if (dirType === 'local') {
                this.model.local_candidate.network_type = candidate.networkType || null;
              }
            }
          });
        }

        this.postStats(this.endpoints.iceConnection, this.model);
      }).catch((ex) => {
        logger.log.DEBUG(MESSAGES.STATS_MODULE.HANDLE_ICE_CONNECTION_STATS.RETRIEVE_FAILED, ex);
      });
    } catch (error) {
      logger.log.DEBUG(MESSAGES.STATS_MODULE.HANDLE_ICE_CONNECTION_STATS.SEND_FAILED, error);
    }
  }
}

export default HandleIceConnectionStats;

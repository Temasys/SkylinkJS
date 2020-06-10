import SkylinkStats from './index';
import Skylink from '../index';

class HandleIceCandidateStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      peer_id: null,
      state: null,
      is_remote: false,
      candidate_id: null,
      candidate_sdp_mid: null,
      candidate_sdp_mindex: null,
      candidate_candidate: null,
      error: null,
    };
  }

  send(roomKey, state, peerId, candidateId, candidate, error) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.client_id = roomState.clientId;
    this.model.state = state;
    this.model.is_remote = !!candidateId;
    this.model.candidate_id = candidateId || null;
    this.model.candidate_sdp_mid = candidate.sdpMid;
    this.model.candidate_sdp_mindex = candidate.sdpMLineIndex;
    this.model.candidate_candidate = candidate.candidate;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.error = (typeof error === 'string' ? error : (error && error.message)) || null;

    this.addToStatsBuffer('iceCandidate', this.model, this.endpoints.iceCandidate);
    this.manageStatsBuffer();
  }
}

export default HandleIceCandidateStats;

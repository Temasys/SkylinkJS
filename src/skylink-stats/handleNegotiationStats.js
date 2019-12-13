import SkylinkStats from './index';
import Skylink from '../index';
import PeerData from '../peer-data';

class HandleNegotiationStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      room_id: null,
      user_id: null,
      peer_id: null,
      client_id: null,
      state: null,
      is_remote: null,
      weight: null,
      sdp_or_msg: null,
      sdp_type: null,
      sdp_sdp: null,
      error: null,
    };
  }

  send(roomKey, state, peerId, sdpOrMessage, isRemote, error) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.client_id = roomState.clientId;
    this.model.state = state;
    this.model.is_remote = isRemote;
    this.model.sdp_or_msg = sdpOrMessage;
    this.model.weight = sdpOrMessage.weight || null;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.error = (typeof error === 'string' ? error : (error && error.msg)) || null;

    // Retrieve the weight for states where the "weight" field is not available.
    if (['enter', 'welcome', 'restart'].indexOf(this.model.state) === -1) {
      // Retrieve the peer's weight if it from remote end.
      this.model.weight = this.model.is_remote && PeerData.getPeerInfo(this.model.peer_id, roomState).config && PeerData.getPeerInfo(this.model.peer_id, roomState).config.priorityWeight ? PeerData.getPeerInfo(this.model.peer_id, roomState).config.priorityWeight : PeerData.getCurrentSessionInfo(roomState.room).config.priorityWeight;
      this.model.sdp_type = (this.model.sdp_or_msg && this.model.sdp_or_msg.type) || null;
      this.model.sdp_sdp = (this.model.sdp_or_msg && this.model.sdp_or_msg.sdp) || null;
    }

    this.addToStatsBuffer('negotiation', this.model, this.endpoints.negotiation);
    this.manageStatsBuffer();
  }
}

const handleNegotationStats = new HandleNegotiationStats();
export default handleNegotationStats;

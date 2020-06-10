import SkylinkStats from './index';
import Skylink from '../index';
import PeerData from '../peer-data';

class HandleNegotiationStats extends SkylinkStats {
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
      is_remote: null,
      weight: null,
      sdp_type: null,
      sdp_sdp: null,
      error: null,
    };
  }

  send(roomKey, state, peerId, sdpOrMessage, isRemote, error) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.state = state;
    this.model.is_remote = isRemote;
    this.model.weight = sdpOrMessage.weight || null;
    this.model.error = (typeof error === 'string' ? error : (error && error.msg)) || null;
    this.model.sdp_type = null;
    this.model.sdp_sdp = null;

    // Retrieve the weight for states where the "weight" field is not available.
    if (['enter', 'welcome'].indexOf(this.model.state) === -1) {
      // Retrieve the peer's weight if it from remote end.
      this.model.weight = this.model.is_remote && PeerData.getPeerInfo(this.model.peer_id, roomState.room).config && PeerData.getPeerInfo(this.model.peer_id, roomState.room).config.priorityWeight ? PeerData.getPeerInfo(this.model.peer_id, roomState.room).config.priorityWeight : PeerData.getCurrentSessionInfo(roomState.room).config.priorityWeight;
      this.model.sdp_type = (sdpOrMessage && sdpOrMessage.type) || null;
      this.model.sdp_sdp = (sdpOrMessage && sdpOrMessage.sdp) || null;
    }

    this.addToStatsBuffer('negotiation', this.model, this.endpoints.negotiation);
    this.manageStatsBuffer();
  }
}

const handleNegotationStats = new HandleNegotiationStats();
export default handleNegotationStats;

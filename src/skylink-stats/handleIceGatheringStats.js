import SkylinkStats from './index';
import Skylink from '../index';

class HandleIceGatheringStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      room_id: null,
      user_id: null,
      peer_id: null,
      client_id: null,
      state: null,
      is_remote: null,
    };
  }

  send(roomkey, state, peerId, isRemote) {
    const roomState = Skylink.getSkylinkState(roomkey);

    this.model.room_id = roomkey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.client_id = roomState.clientId;
    this.model.state = state;
    this.model.is_remote = isRemote;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();

    this.addToStatsBuffer('iceGathering', this.model, this.endpoints.iceGathering);
    this.manageStatsBuffer();
  }
}

const handleIceGatheringStats = new HandleIceGatheringStats();
export default handleIceGatheringStats;

import SkylinkStats from './index';
import Skylink from '../index';
import retrieveConfig from '../defaults';

class HandleIceGatheringStats extends SkylinkStats {
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
      is_remote: null,
      bundlePolicy: null,
      rtcpMuxPolicy: null,
    };
  }

  send(roomkey, state, peerId, isRemote) {
    const roomState = Skylink.getSkylinkState(roomkey);

    this.model.client_id = roomState.clientId;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomkey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.state = state;
    this.model.is_remote = isRemote;
    this.model.bundlePolicy = retrieveConfig('PEER_CONNECTION').bundlePolicy;
    this.model.rtcpMuxPolicy = retrieveConfig('PEER_CONNECTION').rtcpMuxPolicy;

    this.addToStatsBuffer('iceGathering', this.model, this.endpoints.iceGathering);
    this.manageStatsBuffer();
  }
}

const handleIceGatheringStats = new HandleIceGatheringStats();
export default handleIceGatheringStats;

import SkylinkStats from './index';
import Skylink from '../index';
import retrieveConfig from '../defaults';
import { CONFIG_NAME } from '../constants';

class HandleIceGatheringStats extends SkylinkStats {
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
      bundlePolicy: null,
      rtcpMuxPolicy: null,
    };
  }

  send(roomkey, state, peerId, isRemote) {
    const roomState = Skylink.getSkylinkState(roomkey);

    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomkey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.state = state;
    this.model.is_remote = isRemote;
    this.model.bundlePolicy = retrieveConfig(CONFIG_NAME.PEER_CONNECTION, { rid: roomkey }).bundlePolicy;
    this.model.rtcpMuxPolicy = retrieveConfig(CONFIG_NAME.PEER_CONNECTION, { rid: roomkey }).rtcpMuxPolicy;

    this.addToStatsBuffer('iceGathering', this.model, this.endpoints.iceGathering);
    this.manageStatsBuffer();
  }
}

const handleIceGatheringStats = new HandleIceGatheringStats();
export default handleIceGatheringStats;

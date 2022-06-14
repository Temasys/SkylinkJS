import SkylinkStats from './index';
import Skylink from '../index';

class HandleDataChannelStats extends SkylinkStats {
  constructor() {
    super();
    const { AdapterJS } = window;
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      peer_id: null,
      state: null,
      channel_id: null,
      channel_label: null,
      channel_type: null,
      channel_binary_type: null,
      error: null,
      agent_name: AdapterJS.webrtcDetectedBrowser,
      agent_type: AdapterJS.webrtcDetectedType,
      agent_version: AdapterJS.webrtcDetectedVersion,
    };
  }

  send(roomKey, state, peerId, channel, channelProp, error) {
    const roomState = Skylink.getSkylinkState(roomKey) || Object.values(Skylink.getSkylinkState())[0]; // user.uid and clientId should be the same
    // regardless of the room
    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.uid) || null;
    this.model.peer_id = peerId;
    this.model.client_id = roomState && roomState.clientId;
    this.model.state = state;
    this.model.channel = channel;
    this.model.channel_id = channel.id;
    this.model.channel_label = channel.label;
    this.model.channel_type = channelProp === 'main' ? 'persistent' : 'temporal';
    this.model.channel_binary_type = channel.binaryType;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.error = (typeof error === 'string' ? error : (error && error.message)) || null;

    if (this.model.agent_name === 'plugin') {
      this.model.channel_binary_type = 'int8Array';

      // For IE 10 and below browsers, binary support is not available.
      if (this.model.agent_name === 'IE' && this.model.agent_version < 11) {
        this.model.channel_binary_type = 'none';
      }
    }

    this.postStats(this.endpoints.dataChannel, this.model);
  }
}

export default HandleDataChannelStats;

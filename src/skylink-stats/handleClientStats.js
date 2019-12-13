import SkylinkStats from './index';
import Skylink from '../index';

class HandleClientStats extends SkylinkStats {
  constructor() {
    super();
    const { AdapterJS, navigator } = window;
    this.model = {
      client_id: null,
      username: null,
      sdk_name: 'web',
      sdk_version: null,
      agent_name: AdapterJS.webrtcDetectedBrowser,
      agent_version: AdapterJS.webrtcDetectedVersion,
      agent_platform: navigator.platform,
      agent_plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null,
    };
  }

  send(roomKey) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.username = (roomState.user && roomState.user.uid) || null;
    this.model.sdk_version = roomState.VERSION;
    this.model.client_id = roomState.clientId;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();

    this.postStats(this.endpoints.client, this.model);
  }
}

export default HandleClientStats;

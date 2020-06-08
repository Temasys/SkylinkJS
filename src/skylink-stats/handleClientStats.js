import SkylinkStats from './index';
import Skylink from '../index';
import { SDK_NAME } from '../constants';

class HandleClientStats extends SkylinkStats {
  constructor() {
    super();
    const { AdapterJS, navigator } = window;
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      username: null,
      sdk_name: SDK_NAME.WEB,
      sdk_version: null,
      agent_name: AdapterJS.webrtcDetectedBrowser,
      agent_version: AdapterJS.webrtcDetectedVersion,
      agent_platform: navigator.platform,
      agent_plugin_version: null,
      device_version: null,
      enumerated_devices: null,
      device_muted: null,
      network_type: navigator.connection ? navigator.connection.type : '-',
      language: navigator.language,
    };
  }

  send(roomKey) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.username = (roomState.user && roomState.user.uid) || null;
    this.model.sdk_version = roomState.VERSION;
    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();

    this.postStats(this.endpoints.client, this.model);
  }
}

export default HandleClientStats;

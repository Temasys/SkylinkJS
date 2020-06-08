import SkylinkStats from './index';
import Skylink from '../index';

class HandleSessionStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      state: null,
      contents: null,
    };
  }

  send(roomKey, message) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.client_id = roomState.clientId;
    this.model.state = message.type;
    this.model.contents = message;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();

    this.postStats(this.endpoints.session, this.model);
  }
}

export default HandleSessionStats;

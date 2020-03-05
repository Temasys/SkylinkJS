import SkylinkStats from './index';
import Skylink from '../index';

class HandleAuthStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      room_id: null,
      client_id: null,
      http_status: null,
      http_error: null,
      api_url: null,
      api_result: null,
      state: null,
    };
  }

  send(roomKey, state, result, status, error) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.room_id = roomKey;
    this.model.http_status = status;
    this.model.http_error = (typeof error === 'string' ? error : (error && error.message)) || null;
    this.model.api_url = roomState.path;
    this.model.client_id = roomState.clientId;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.state = state;
    this.model.timestamp = (new Date()).toISOString();

    this.postStats(this.endpoints.auth, this.model);
  }
}

export default HandleAuthStats;

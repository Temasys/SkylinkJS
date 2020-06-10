import SkylinkStats from './index';
import Skylink from '../index';

class HandleAuthStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      state: null,
      http_status: null,
      http_error: null,
      api_url: null,
      api_result: null,
    };
  }

  send(roomName, state, response, error) {
    this.model.room_id = roomName;
    // eslint-disable-next-line no-nested-ternary
    this.model.http_status = error ? (-1) : (response && response.status ? response.status : null);
    this.model.http_error = (typeof error === 'string' ? error : (error && error.message)) || null;
    this.model.api_url = response && response.endpoint ? response.endpoint : response.url;
    this.model.client_id = Skylink.getInitOptions().clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.state = state;
    this.model.timestamp = (new Date()).toISOString();

    this.postStats(this.endpoints.auth, this.model);
  }
}

export default HandleAuthStats;

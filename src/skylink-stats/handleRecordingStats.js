import SkylinkStats from './index';
import Skylink from '../index';

class HandleRecordingStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      state: null,
      recording_id: null,
      recordings: null,
      error: null,
    };
  }

  send(roomKey, state, recordingId, recordings, error) {
    const roomState = Skylink.getSkylinkState(roomKey);

    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.state = state;
    this.model.recording_id = recordingId;
    this.model.recordings = recordings;
    this.error = (typeof error === 'string' ? error : (error && error.message)) || null;

    this.postStats(this.endpoints.recording, this.model);
  }
}

export default HandleRecordingStats;

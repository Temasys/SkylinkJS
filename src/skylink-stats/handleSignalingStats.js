import SkylinkStats from './index';
import Skylink from '../index';

class HandleSignalingStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      state: null,
      signaling_url: null,
      signaling_transport: null,
      attempts: null,
      error: null,
    };
  }

  send(roomKey, state, error) {
    const roomState = Skylink.getSkylinkState(roomKey);
    const { socketSession } = roomState;

    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.client_id = roomState.clientId;
    this.model.state = state;
    this.model.signaling_url = roomState.socketSession.socketServer;
    this.model.signaling_transport = roomState.socketSession.socketType.toLowerCase();
    this.model.attempts = socketSession.socketSession.finalAttempts === 0 ? socketSession.socketSession.attempts : (socketSession.socketSession.finalAttempts * 2) + socketSession.socketSession.attempts;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.attempts = typeof error === 'number' ? error : null;
    this.model.error = (typeof error === 'string' ? error : (error && error.message)) || null;

    this.postStats(this.endpoints.signaling, this.model);
  }
}

export default HandleSignalingStats;

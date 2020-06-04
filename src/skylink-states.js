import ScreenSharing from './features/screen-sharing';
import AsyncMessaging from './features/messaging/async-messaging';
import EncryptedMessaging from './features/messaging/encrypted-messaging';
import SkylinkApiResponse from './models/api-response';

let instance = null;

/**
 * @class SkylinkStates
 * @hideconstructor
 * @classdesc Singleton Class that provides methods to access and update Skylink State
 * @private
 */
class SkylinkStates {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.states = {};

    return instance;
  }

  /**
   * @param {SkylinkState} skylinkState
   */
  setState(skylinkState) {
    this.states[skylinkState.room.id] = skylinkState;
  }

  /**
   *
   * @return {Object}
   */
  getAllStates() {
    return this.states;
  }

  /**
   *
   * @param {String} roomId
   * @return {SkylinkState}
   */
  getState(roomId) {
    return this.states[roomId];
  }

  /**
   *
   * @param {String} roomId
   * @return boolean
   */
  removeStateByRoomId(roomId) {
    return delete this.states[roomId];
  }

  /**
   *
   * @param {String} roomKey
   */
  clearRoomStateFromSingletons(roomKey) {
    const roomState = this.getState(roomKey);
    new ScreenSharing(roomState).deleteScreensharingInstance(roomState.room);
    AsyncMessaging.deleteAsyncInstance(roomState.room);
    EncryptedMessaging.deleteEncryptedInstance(roomState.room);
    new SkylinkApiResponse(roomKey).deleteApiResponseInstance(roomKey);
  }
}

export default SkylinkStates;

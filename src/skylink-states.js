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
   * @return {SkylinkState}
   */
  getAllStates() {
    return this.states;
  }

  /**
   *
   * @param {string} roomId
   * @return {SkylinkState}
   */
  getState(roomId) {
    return this.states[roomId];
  }

  /**
   *
   * @param {string} roomId
   * @return boolean
   */
  removeStateByRoomId(roomId) {
    return delete this.states[roomId];
  }
}

export default SkylinkStates;

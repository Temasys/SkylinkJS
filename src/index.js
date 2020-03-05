/**
 * @description Exports {@link Skylink}, {@link SkylinkLogger} and {@link SkylinkConstants}
 * */
import AdapterJS from 'adapterjs';
import io from 'socket.io-client';
import SkylinkStates from './skylink-states';
import SkylinkPublicInterface from './public/index';
import SkylinkLogger from './logger/index';
import SkylinkEventManager from './utils/skylinkEventManager';
import * as constants from './constants';
import messages from './messages';
import { SkylinkAPIServer } from './server-communication';

/**
 * @description AdapterJS provides polyfills and cross-browser mediaStreamHelpers for WebRTC.
 * @see {@link https://github.com/Temasys/AdapterJS}
 * @global
 */
window.AdapterJS = AdapterJS;
/**
 * @description Socket.IO enables real-time, bidirectional and event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed.
 * @see {@link https://socket.io/}
 * @global
 */
window.io = io;

/**
 * @description State manager for accessing SkylinkJS states.
 * @type {SkylinkStates}
 * @private
 */
const skylinkStates = new SkylinkStates();

/**
 * @description Stores options passed into init.
 * @type {initOptions}
 * @private
 */
let initOptions = {};
let userInitOptions = {};

const SkylinkEvents = constants.EVENTS;

/**
 * @classdesc Class representing a SkylinkJS instance.
 * @example
 * import Skylink from 'skylinkjs';
 *
 * const initOptions = {
 *    // Obtain your app key from {@link https://console.temasys.io}
 *    appKey: 'temasys-appKey-XXXXX-XXXXXX',
 *    defaultRoom: "Default_Room",
 * };
 *
 * const skylink = new Skylink(initOptions);
 */
class Skylink extends SkylinkPublicInterface {
  /**
   * @description Creates a SkylinkJS instance.
   * @param {initOptions} options - Skylink authentication and initialisation configuration options.
   * @private
   */
  constructor(options) {
    super();

    /**
     * @description Init options passed to API server to set certain values.
     * @type {initOptions}
     * @private
     */
    const parsedOptions = new SkylinkAPIServer().init(options);

    Skylink.setInitOptions(parsedOptions);
  }

  /**
   * @description Method that retrieves the Skylink state.
   * @param {SkylinkRoom.id} roomKey - The id/key of the room.
   * @return {SkylinkState| Object}
   * @private
   */
  static getSkylinkState(roomKey = null) {
    if (roomKey) {
      return skylinkStates.getState(roomKey);
    }
    return skylinkStates.getAllStates();
  }

  /**
   * @description Method that sets the Skylink state keyed by room id.
   * @param {SkylinkState} state
   * @param {SkylinkRoom.id} roomKey - The id/key of the room.
   * @private
   */
  static setSkylinkState(state, roomKey) {
    if (roomKey) {
      skylinkStates.setState(state);
    }
  }

  // eslint-disable-next-line consistent-return
  static removeSkylinkState(roomKey) {
    if (roomKey) {
      return skylinkStates.removeStateByRoomId(roomKey);
    }
  }

  /**
   * @description Method that retrieves the complete initOptions values (default + user specified).
   * @return {initOptions}
   * @private
   */
  static getInitOptions() {
    return initOptions;
  }

  /**
   * @description Method that stores the complete initOptions values (default + user specified).
   * @param {initOptions} options
   * @private
   */
  static setInitOptions(options) {
    initOptions = options;
  }

  /**
   * @description Method that stores the initOptions specified by the user.
   * @param {initOptions} options
   * @private
   */
  static setUserInitOptions(options) {
    userInitOptions = options;
  }

  /**
   * @description Method that retrieves the initOptions specified by the user.
   * @private
   */
  static getUserInitOptions() {
    return userInitOptions;
  }

  /**
   * @description Logs an error when Skylink state is not found for a roomKey.
   * @param {String} keyOrName - The id/key of the room or the room name.
   * @private
   */
  static logNoRoomState(keyOrName) {
    SkylinkLogger.log.ERROR(`${messages.ROOM_STATE.NOT_FOUND} - ${keyOrName}`);
  }
}

export default Skylink;
export {
  SkylinkLogger,
  SkylinkEventManager,
  SkylinkEvents,
  constants as SkylinkConstants,
};

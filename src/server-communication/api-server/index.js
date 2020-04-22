/* eslint-disable class-methods-use-this */
import defaultOptions from './defaultOptions';
import { validateDepencies } from '../../compatibility/index';
import {
  authenticateApp,
  parseAndMutateOptions,
  validateOptions,
  parseAPIResponseBody,
  validateAPIResponse,
  webRTCReadyOperations,
  codecSupport,
  enforceUserInitOptions,
} from './api-helpers';
import Skylink from '../../index';
import { getStateByKey } from '../../utils/helpers';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { READY_STATE_CHANGE, READY_STATE_CHANGE_ERROR } from '../../constants';
import { readyStateChange } from '../../skylink-events';

let instance = null;

/**
 * @class
 * @classdesc Singleton class that represents a API server.
 * @private
 */
class SkylinkAPIServer {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.options = {};

    return instance;
  }

  // eslint-disable-next-line class-methods-use-this
  init(options = defaultOptions) {
    if (options) {
      if (options.socketServer) { // set socketServerPath to override socketServerPath value returned from api that only works with default sig
        // server url
        // eslint-disable-next-line no-param-reassign
        options.socketServerPath = '';
      }
      Skylink.setUserInitOptions(options);
    }
    dispatchEvent(readyStateChange({
      readyState: READY_STATE_CHANGE.INIT,
      error: null,
      room: null,
    }));
    const dependencies = validateDepencies();
    const { AdapterJS } = window;
    if (!dependencies.fulfilled) {
      dispatchEvent(readyStateChange({
        readyState: READY_STATE_CHANGE.ERROR,
        error: {
          status: -2,
          content: new Error(dependencies.message),
          errorCode: dependencies.readyStateChangeErrorCode,
        },
        room: null,
      }));
      throw new Error(dependencies.message);
    }

    let initOptions = Object.assign({}, defaultOptions, options);
    const optionsValidity = validateOptions(initOptions);
    if (!optionsValidity.isValid) {
      throw new Error(optionsValidity.message);
    }
    AdapterJS.webRTCReady(() => {
      const webrtcReady = webRTCReadyOperations();
      if (!webrtcReady.ready) {
        throw new Error(webrtcReady.message);
      }
    });
    initOptions = parseAndMutateOptions(initOptions);
    return initOptions;
  }

  createRoom(room) {
    return new Promise((resolve, reject) => {
      const initOptions = Skylink.getInitOptions();
      initOptions.defaultRoom = room;
      authenticateApp(initOptions).then((result) => {
        const { endpoint, response } = result;
        const isResponseValid = validateAPIResponse(response);
        if (isResponseValid) {
          dispatchEvent(readyStateChange({
            readyState: READY_STATE_CHANGE.COMPLETED,
            error: null,
            room,
          }));
          response.json().then((apiResponse) => {
            resolve({
              endpoint,
              response: apiResponse,
            });
          });
        } else {
          dispatchEvent(readyStateChange({
            readyState: READY_STATE_CHANGE.ERROR,
            error: {
              status: response.status,
              content: new Error(response.info || `XMLHttpRequest status not OK\nStatus was: ${response.status}`),
              errorCode: response.error || response.status,
            },
            room,
          }));
          reject(response.json());
        }
      }).catch((error) => {
        dispatchEvent(readyStateChange({
          readyState: READY_STATE_CHANGE.ERROR,
          error: {
            status: error.status || -1,
            content: new Error(error.message || 'Network error occurred'),
            errorCode: READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR,
          },
          room,
        }));
      });
    });
  }

  checkCodecSupport(roomKey) {
    return codecSupport(roomKey);
  }

  static parseAPIResponseBody(response) {
    return parseAPIResponseBody(response);
  }

  enforceUserInitOptions(response) {
    return enforceUserInitOptions(response);
  }

  static getRoomNameFromParams(params) {
    const initOptions = Skylink.getInitOptions();
    const { roomName } = params;
    const { defaultRoom } = initOptions;
    let room = null;
    if (typeof roomName !== 'undefined' && roomName !== '' && defaultRoom !== roomName) {
      room = roomName;
    } else {
      room = defaultRoom;
    }
    return room;
  }

  static getStateByKey(roomKey) {
    return getStateByKey(roomKey);
  }
}

export default SkylinkAPIServer;

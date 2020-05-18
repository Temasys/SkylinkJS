import MESSAGES from '../../messages';
import logger from '../../logger/index';
import SessionDescription from '../../session-description';
import ApiResponse from '../../models/api-response';
import { readyStateChange } from '../../skylink-events';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import {
  API_VERSION,
  READY_STATE_CHANGE,
  READY_STATE_CHANGE_ERROR,
  SDK_NAME,
  SDK_VERSION,
  SIGNALING_VERSION,
} from '../../constants';
import Skylink from '../../index';

const getEndPoint = (options) => {
  const {
    roomServer,
    appKey,
    defaultRoom,
    credentials,
    forceSSL,
  } = options;
  let path = `${roomServer}/api/${appKey}/${defaultRoom}`;
  let urlChar = '?';
  path = forceSSL ? `https:${path}` : `${window.location.protocol}${path}`;

  if (credentials) {
    const { startDateTime, duration } = credentials;
    path += `/${startDateTime}/${duration}?cred=${credentials.credentials}`;
    urlChar = '&';
  }

  path += `${urlChar}rand=${Date.now()}`;
  return path;
};

const logAPIResponse = (response) => {
  const { status, ok } = response;
  const loggerMethod = ok ? 'INFO' : 'ERROR';
  let message = MESSAGES.INIT.INFO.API_SUCCESS;
  if (!ok) {
    message = MESSAGES.INIT.ERRORS.AUTH_GENERAL;
    if (status === 403) {
      message = MESSAGES.INIT.ERRORS.AUTH_CORS;
    }
  }
  logger.log[loggerMethod](['API', null, 'auth', message], response);
};

export const validateOptions = (options) => {
  const { appKey } = options;
  const toReturn = {
    isValid: true,
    message: '',
  };
  logger.log.INFO(['API', null, 'init', 'API initialised with options:'], options);
  if (!appKey) {
    toReturn.isValid = false;
    toReturn.message = MESSAGES.INIT.ERRORS.NO_APP_KEY;
    dispatchEvent(readyStateChange({
      readyState: READY_STATE_CHANGE.ERROR,
      error: {
        status: -2,
        content: new Error(MESSAGES.INIT.ERRORS.NO_APP_KEY),
        errorCode: READY_STATE_CHANGE_ERROR.NO_PATH,
      },
      room: null,
    }));
  }
  if (!toReturn.isValid) {
    logger.log.ERROR(['API', null, 'init', toReturn.message]);
  }
  return toReturn;
};

export const validateAPIResponse = (response) => {
  const { ok } = response;
  logAPIResponse(response);
  return ok;
};

export const parseAndMutateOptions = (options) => {
  const updatedOptions = options;
  // Force TURN connections should enforce settings.
  if (updatedOptions.forceTURN === true) {
    updatedOptions.enableTURNServer = true;
    updatedOptions.enableSTUNServer = false;
    updatedOptions.filterCandidatesType.host = true;
    updatedOptions.filterCandidatesType.srflx = true;
    updatedOptions.filterCandidatesType.relay = false;
  }

  return updatedOptions;
};

export const enforceUserInitOptions = (apiResponse) => {
  const userInitOptions = Skylink.getUserInitOptions();
  const initOptions = Skylink.getInitOptions();
  let updatedInitOptions = Object.assign(initOptions, apiResponse, userInitOptions);
  const optionsValidity = validateOptions(updatedInitOptions);

  if (!optionsValidity.isValid) {
    throw new Error(optionsValidity.message);
  }

  updatedInitOptions = parseAndMutateOptions(updatedInitOptions);
  Skylink.setInitOptions(updatedInitOptions);

  return updatedInitOptions;
};

export const authenticateApp = async (options) => {
  const { fetch } = window;
  const endpoint = getEndPoint(options);
  const apiResponse = await fetch(endpoint, {
    headers: {
      Skylink_SDK_type: SDK_NAME.WEB,
      Skylink_SDK_version: SDK_VERSION,
      Skylink_API_version: API_VERSION,
      'X-Server-Select': SIGNALING_VERSION,
    },
  });

  return {
    endpoint,
    response: apiResponse,
  };
};

export const parseAPIResponseBody = (responseBody) => {
  const apiResponse = new ApiResponse(responseBody);
  return apiResponse;
};

const testRTCPeerConnection = () => {
  try {
    const p = new window.RTCPeerConnection(null);
    // IE returns as typeof object
    return ['object', 'function'].indexOf(typeof p.createOffer) > -1 && p.createOffer !== null;
  } catch (e) {
    return false;
  }
};

export const webRTCReadyOperations = () => {
  const { AdapterJS } = window;
  const returnObject = {
    ready: true,
    message: '',
  };
  if (!testRTCPeerConnection()) {
    if (window.RTCPeerConnection && AdapterJS.webrtcDetectedType === 'plugin') {
      returnObject.message = 'Plugin is not available. Please check plugin status.';
    } else {
      returnObject.message = 'WebRTC not supported. Please upgrade your browser';
    }
    returnObject.ready = false;
    dispatchEvent(readyStateChange({
      readyState: READY_STATE_CHANGE.ERROR,
      error: {
        status: -2,
        content: new Error(AdapterJS.webrtcDetectedType === 'plugin' && window.RTCPeerConnection ? 'Plugin is not available' : 'WebRTC not available'),
        errorCode: READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT,
      },
      room: null,
    }));
  }


  return returnObject;
};

export const codecSupport = roomKey => new Promise((resolve, reject) => {
  SessionDescription.getCodecsSupport(roomKey)
    .then((currentCodecSupport) => {
      const state = Skylink.getSkylinkState(roomKey);
      const { room } = state;

      if (Object.keys(currentCodecSupport.audio).length === 0 && Object.keys(currentCodecSupport.video).length === 0) {
        logger.log.ERROR(MESSAGES.JOIN_ROOM.ERRORS.CODEC_SUPPORT);
        dispatchEvent(readyStateChange({
          readyState: READY_STATE_CHANGE.ERROR,
          error: {
            status: -2,
            content: new Error(MESSAGES.JOIN_ROOM.ERRORS.CODEC_SUPPORT),
            errorCode: READY_STATE_CHANGE_ERROR.PARSE_CODECS,
          },
          room: room.roomName,
        }));
        reject(new Error(MESSAGES.JOIN_ROOM.ERRORS.CODEC_SUPPORT));
      } else {
        resolve(true);
      }

      state.currentCodecSupport = currentCodecSupport;
      Skylink.setSkylinkState(state);
    })
    .catch((error) => {
      const state = Skylink.getSkylinkState(roomKey);
      const { room } = state;

      logger.log.ERROR(error);
      dispatchEvent(readyStateChange({
        readyState: READY_STATE_CHANGE.ERROR,
        error: {
          status: -2,
          content: new Error(error.message || error.toString()),
          errorCode: READY_STATE_CHANGE_ERROR.PARSE_CODECS,
        },
        room: room.roomName,
      }));
      reject(new Error(error.message || error.toString()));
    });
});

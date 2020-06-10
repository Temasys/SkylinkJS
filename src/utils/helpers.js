import Skylink from '../index';
import logger from '../logger';
import MESSAGES from '../messages';
import mediaStreamHelpers from '../media-stream/helpers/index';
import SkylinkSignalingServer from '../server-communication/signaling-server/index';
import { BROWSER_AGENT } from '../constants';

/**
 * @namespace UtilHelpers
 * @description Util helper functions
 * @private
 */

/**
 * Function that tests if an object is empty.
 * @param {Object} obj
 * @return {boolean}
 * @memberOf UtilHelpers
 */
export const isEmptyObj = (obj) => {
  const keys = Object.keys(obj);
  return keys.length === 0;
};

/**
 * Function that tests if an array is empty.
 * @param {Array} array
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isEmptyArray = array => array.length === 0;

/**
 * Function that tests if a string is an empty string.
 * @param string
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isEmptyString = string => string === '';

/**
 * Function that tests if type is 'Object'.
 * @param {*} param
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isAObj = param => typeof param === 'object' && param !== null;

/**
 * Function that tests if type is 'Null'.
 * @param {*} param
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isNull = param => typeof param === 'object' && param == null;

/**
 * Function that tests if type is 'Number'.
 * @param {*} param
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isANumber = param => typeof param === 'number';

/**
 * Function that tests if type is 'Function'.
 * @param {*} param
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isAFunction = param => typeof param === 'function';

/**
 * Function that tests if type is 'Boolean'.
 * @param {Object|boolean}
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isABoolean = obj => typeof obj !== 'undefined' && typeof obj === 'boolean';

/**
 * Function that tests if type is 'String'.
 * @param {*} param
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isAString = param => typeof param === 'string';

/**
 * Function that tests if a param is null, undefined or a string.
 * @param param
 * @param paramName
 * @param methodName
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const getParamValidity = (param, paramName, methodName) => {
  let proceed = true;
  if (param === null || typeof param === 'undefined' || !isAString(param)) {
    logger.log.ERROR(`${methodName}: ${paramName} is null, undefined or not a string.`);
    proceed = false;
  }
  return proceed;
};

/**
 * Function that returns the Skylink state.
 * @param {SkylinkRoom.id} rid
 * @returns {SkylinkState|null} state
 * @memberOf UtilHelpers
 */
export const getStateByRid = (rid) => {
  const proceed = getParamValidity(rid, 'roomId', 'getStateByRid');
  if (proceed) {
    const states = Skylink.getSkylinkState();
    const roomKeys = Object.keys(states);
    let roomState = null;
    for (let i = 0; i < roomKeys.length; i += 1) {
      const key = roomKeys[i];
      if (key === rid) {
        roomState = states[key];
        break;
      }
    }
    return roomState;
  }
  logger.log.ERROR(`getRoomStateByRid: ${MESSAGES.ROOM_STATE.NOT_FOUND} - ${rid}`);
  return null;
};

/**
 * Function that returns the Skylink state.
 * @param {String} roomkey - The room key.
 * @returns {SkylinkState}
 * @memberOf UtilHelpers
 */
export const getStateByKey = roomkey => getStateByRid(roomkey);

/**
 * Function that returns the room state.
 * @param {String} roomName - The room name.
 * @returns {SkylinkState|null} - The room state.
 * @memberOf UtilHelpers
 */
export const getRoomStateByName = (roomName) => {
  const proceed = getParamValidity(roomName, 'roomName', 'getRoomStateByName');
  let matchedRoomState = null;
  if (proceed) {
    const state = Skylink.getSkylinkState();
    const roomKeys = Object.keys(state);
    for (let i = 0; i < roomKeys.length; i += 1) {
      const roomState = state[roomKeys[i]];
      if (roomState.room.roomName.toLowerCase() === roomName.toLowerCase()) {
        matchedRoomState = roomState;
        break;
      }
    }
  }
  if (!matchedRoomState) {
    logger.log.ERROR(`getRoomStateByName: ${MESSAGES.ROOM_STATE.NOT_FOUND} - ${roomName}`);
  }
  return matchedRoomState;
};

/**
 * Disconnects from the signaling server.
 * @memberOf UtilHelpers
 */
export const disconnect = () => {
  try {
    new SkylinkSignalingServer().socket.disconnect();
  } catch (error) {
    logger.log.ERROR(error);
  }
};

/**
 * Function that generates an <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier">UUID</a> (Unique ID).
 * @returns {String} Returns a generated UUID (Unique ID).
 * @memberOf UtilHelpers
 */
export const generateUUID = () => {
  /* eslint-disable no-bitwise */
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

/**
 * Function that returns the getUserMedia stream when the user had not joined a room (is stateless)
 * @param {Object} options
 * @returns {Promise}
 * @memberOf UtilHelpers
 */
export const statelessGetUserMedia = options => new Promise((resolve, reject) => {
  const { navigator } = window;
  if (!options || !isAObj(options)) {
    reject(new Error(`${MESSAGES.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS} ${options}`));
  }

  navigator.mediaDevices.getUserMedia(options).then((stream) => {
    const streams = mediaStreamHelpers.splitAudioAndVideoStream(stream);
    resolve(streams);
  }).catch((error) => {
    reject(error);
  });
});

/**
 * Function that always returns are rejected Promise.
 * @param {String} errorMsg
 * @returns {Promise}
 * @memberOf UtilHelpers
 */
export const rejectPromise = errorMsg => new Promise((resolve, reject) => {
  reject(new Error(errorMsg));
});

/**
 * Function that updates the replaced state of the streams
 * @param {MediaStream} replacedStream
 * @param {MediaStream} newStream
 * @param {SkylinkState} state
 * @param {boolean} isReplaced
 * @memberOf UtilHelpers
 */
export const updateReplacedStreamInState = (replacedStream, newStream, state, isReplaced) => {
  const { streams, room } = state;
  const streamObjs = Object.values(streams.userMedia);
  for (let i = 0; i < streamObjs.length; i += 1) {
    if (streamObjs[i].id === replacedStream.id) {
      streamObjs[i].isReplaced = isReplaced;
      streamObjs[i].newStream = newStream;
    }
  }

  Skylink.setSkylinkState(state, room.id);
};

/**
 * Function that checks if the peerId exists on the peerConnection
 * @param {SkylinkRoom} room
 * @param {String} peerId
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isValidPeerId = (room, peerId) => {
  const state = Skylink.getSkylinkState(room.id);

  const { peerConnections } = state;
  const peerIds = Object.keys(peerConnections);

  let isValid = false;
  peerIds.forEach((validPeerId) => {
    if (validPeerId === peerId) {
      isValid = true;
    }
  });

  return isValid;
};

/**
 * Function that checks if a media stream has an audio track.
 * @param {MediaStream} stream
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const hasAudioTrack = stream => stream.getAudioTracks().length > 0;

/**
 * Function that checks if a media stream has a video track.
 * @param {MediaStream} stream
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const hasVideoTrack = stream => stream.getVideoTracks().length > 0;

/**
 * Function that checks the browser agent.
 * @param {String} agent
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isAgent = (agent) => {
  const { AdapterJS } = window;
  switch (agent) {
    case BROWSER_AGENT.CHROME:
      return AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.CHROME;
    case BROWSER_AGENT.SAFARI:
      return AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.SAFARI;
    case BROWSER_AGENT.FIREFOX:
      return AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.FIREFOX;
    case BROWSER_AGENT.REACT_NATIVE:
      return AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.REACT_NATIVE;
    default:
      logger.log.DEBUG(MESSAGES.UTILS.INVALID_BROWSER_AGENT);
      return false;
  }
};

/**
 * Function that checks the browser version.
 * @param {number} version
 * @param {string} operator
 * @returns {boolean}
 * @memberOf UtilHelpers
 */
export const isVersion = (version, operator = '===') => {
  const { AdapterJS } = window;
  switch (operator) {
    case '>':
      return AdapterJS.webrtcDetectedVersion > version;
    case '<':
      return AdapterJS.webrtcDetectedVersion < version;
    default:
      return AdapterJS.webrtcDetectedVersion === version;
  }
};

/**
 * Function that generates a timestamp in UNIX format.
 * @returns {number}
 * @memberOf UtilHelpers
 */
export const generateUNIXTimeStamp = () => Math.round(new Date().getTime() / 1000);

/**
 * Function that parses UNIX timestamp and returns timestamp in ISO string.
 * @param timestamp
 * @returns {string}
 * @memberOf UtilHelpers
 */
export const parseUNIXTimeStamp = timestamp => new Date(timestamp).toISOString();

/**
 * Function that generates a timestamp in ISO string format.
 * @returns {string}
 * @memberOf UtilHelpers
 */
export const generateISOStringTimesStamp = () => new Date().toISOString();

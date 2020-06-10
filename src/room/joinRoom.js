import clone from 'clone';
import Skylink from '../index';
import { SkylinkAPIServer, SkylinkSignalingServer } from '../server-communication/index';
import HandleClientStats from '../skylink-stats/handleClientStats';
import { dispatchEvent } from '../utils/skylinkEventManager';
import { readyStateChange } from '../skylink-events';
import * as constants from '../constants';
import SkylinkApiResponse from '../models/api-response';
import SkylinkState from '../models/skylink-state';
import MediaStream from '../media-stream/index';
import { isAgent } from '../utils/helpers';

const buildCachedApiResponse = (skylinkApiResponse) => {
  const cachedResponse = clone(skylinkApiResponse);
  delete cachedResponse.room;
  delete cachedResponse.user;
  return cachedResponse;
};

const addNewStateAndCacheApiResponse = (response, options) => {
  const apiServer = new SkylinkAPIServer();
  const skylinkApiResponse = new SkylinkApiResponse(response);
  const initOptions = apiServer.enforceUserInitOptions(skylinkApiResponse);
  const skylinkState = new SkylinkState(initOptions);
  skylinkState.user.userData = options.userData;
  skylinkState.apiResponse = Object.freeze(buildCachedApiResponse(skylinkApiResponse));
  Skylink.setSkylinkState(skylinkState, response.roomName);
  return skylinkState;
};

/**
 * @description Method that starts the Room Session.
 * @param {joinRoomOptions} [options] The options available to join the room and configure the session.
 * @param {MediaStream} [prefetchedStream] The prefetched media stream object obtained when the user calls getUserMedia before joinRoom.
 * @return {Promise} Promise object with MediaStream.
 * @memberOf Room
 * @alias Room.joinRoom
 * @private
 */
const joinRoom = (options = {}, prefetchedStream) => new Promise((resolve, reject) => {
  const { navigator } = window;
  const apiServer = new SkylinkAPIServer();
  const signalingServer = new SkylinkSignalingServer();
  const initOptions = Skylink.getInitOptions();
  const handleClientStats = new HandleClientStats();
  const roomName = SkylinkAPIServer.getRoomNameFromParams(options) ? SkylinkAPIServer.getRoomNameFromParams(options) : initOptions.defaultRoom;

  dispatchEvent(readyStateChange({
    readyState: constants.READY_STATE_CHANGE.LOADING,
    error: null,
    room: { roomName },
  }));

  apiServer.createRoom(roomName).then((result) => {
    const { response } = result;
    response.roomName = roomName;
    const skylinkState = addNewStateAndCacheApiResponse(response, options);

    apiServer.checkCodecSupport(skylinkState.room.id).then(() => {
      handleClientStats.send(skylinkState.room.id);
      return signalingServer.createSocket(response.room_key).then(() => {
        const room = SkylinkAPIServer.getStateByKey(response.room_key);
        const userMediaParams = Object.assign({}, options);

        userMediaParams.room = room;
        if (prefetchedStream || (options.id && options.active)) { // check for prefetched stream as the only arg
          MediaStream.usePrefetchedStream(response.room_key, prefetchedStream, options).then(() => {
            signalingServer.joinRoom(room);
            resolve(null);
          }).catch((error) => {
            reject(error);
          });
        } else if (options.audio || options.video) {
          MediaStream.getUserMedia(skylinkState, userMediaParams).then((stream) => {
            signalingServer.joinRoom(room);
            resolve(stream);
          }).catch((streamException) => {
            reject(streamException);
          });
        } else {
          // If no audio is requested for Safari, audio will not be heard on the Safari peer even if the remote peer has audio. Workaround to
          // request media access but not add the track to the peer connection. Does not seem to apply to video.
          if (isAgent(constants.BROWSER_AGENT.SAFARI)) {
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then(() => signalingServer.joinRoom(room));
          } else {
            signalingServer.joinRoom(room);
          }
          resolve(null);
        }
      });
    }).catch((codecError) => {
      reject(codecError);
    });
  }).catch((socketException) => {
    reject(socketException);
  });
});

export default joinRoom;

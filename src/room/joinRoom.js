import Skylink from '../index';
import { SkylinkAPIServer, SkylinkSignalingServer } from '../server-communication/index';
import HandleClientStats from '../skylink-stats/handleClientStats';
import { dispatchEvent } from '../utils/skylinkEventManager';
import { readyStateChange } from '../skylink-events';
import * as constants from '../constants';
import SkylinkApiResponse from '../models/api-response';
import SkylinkState from '../models/skylink-state';
import MediaStream from '../media-stream/index';

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
  const apiServer = new SkylinkAPIServer();
  const signalingServer = new SkylinkSignalingServer();
  let initOptions = Skylink.getInitOptions();
  const handleClientStats = new HandleClientStats();
  const roomName = SkylinkAPIServer.getRoomNameFromParams(options) ? SkylinkAPIServer.getRoomNameFromParams(options) : initOptions.defaultRoom;

  dispatchEvent(readyStateChange({
    readyState: constants.READY_STATE_CHANGE.LOADING,
    error: null,
    room: roomName,
  }));

  apiServer.createRoom(roomName).then((result) => {
    const { endpoint, response } = result;
    response.roomName = roomName;
    const skylinkApiResponse = new SkylinkApiResponse(response);
    initOptions = apiServer.enforceUserInitOptions(skylinkApiResponse);
    const skylinkState = new SkylinkState(initOptions);

    skylinkState.userData = options.userData || '';
    skylinkState.path = endpoint;
    Skylink.setSkylinkState(skylinkState, roomName);

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
          signalingServer.joinRoom(room);
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

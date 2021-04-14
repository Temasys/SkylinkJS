import { isAObj, isAFunction } from '../../utils/helpers';
import logger from '../../logger';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import PeerData from '../../peer-data';
import { peerUpdated } from '../../skylink-events';
import PeerConnection from '../../peer-connection/index';
import MediaStream from '../index';
import MESSAGES from '../../messages';

const dispatchEvents = (roomState) => {
  const { user, room } = roomState;
  const isSelf = true;
  const peerId = user.sid;
  const peerInfo = PeerData.getCurrentSessionInfo(room);

  dispatchEvent(peerUpdated({
    isSelf,
    peerId,
    peerInfo,
  }));
};

const restartFn = (roomState, streams, resolve, reject) => {
  const { peerConnections, hasMCU } = roomState;

  try {
    dispatchEvents(roomState);

    if (Object.keys(peerConnections).length > 0 || hasMCU) {
      const refreshPeerConnectionPromise = PeerConnection.refreshPeerConnection(Object.keys(peerConnections), roomState, false, {});

      refreshPeerConnectionPromise.then(() => {
        resolve(streams);
      }).catch((error) => {
        logger.log.ERROR(MESSAGES.PEER_CONNECTION.REFRESH_CONNECTION.FAILED);
        reject(error);
      });
    } else {
      logger.log.WARN(MESSAGES.ROOM.ERRORS.NO_PEERS);
      resolve(streams);
    }
  } catch (error) {
    logger.log.ERROR(error);
  }
};

const processMediaOptions = (roomState, stream, resolve, reject) => {
  const getUserMediaPromise = MediaStream.getUserMedia(roomState, stream);

  return getUserMediaPromise.then((userMediaStreams) => {
    restartFn(roomState, userMediaStreams, resolve, reject);
  }).catch((error) => {
    reject(error);
  });
};

const processMediaStream = (roomState, stream, resolve, reject) => {
  const usePrefetchedStreamPromise = MediaStream.usePrefetchedStream(roomState.room.id, stream);

  return usePrefetchedStreamPromise.then((prefetchedStreams) => {
    restartFn(roomState, prefetchedStreams, resolve, reject);
  }).catch((error) => {
    reject(error);
  });
};

const processMediaStreamArray = (roomState, streams, resolve, reject) => {
  const usePrefetchedStreamsPromises = [];

  streams.forEach((stream) => {
    usePrefetchedStreamsPromises.push(MediaStream.usePrefetchedStream(roomState.room.id, stream));
  });

  return Promise.all(usePrefetchedStreamsPromises)
    .then((results) => {
      restartFn(roomState, results, resolve, reject);
    })
    .catch((error) => {
      reject(error);
    });
};

/**
 * Function that sends a MediaStream if provided or gets and sends an new getUserMedia stream.
 * @param {SkylinkState} roomState
 * @param {MediaStream|Object} options
 * @memberOf MediaStreamHelpers
 * @fires ON_INCOMING_STREAM
 * @fires PEER_UPDATED
 */
// eslint-disable-next-line consistent-return
const sendStream = (roomState, options = null) => new Promise((resolve, reject) => {
  if (!roomState) {
    return reject(new Error(MESSAGES.ROOM_STATE.NO_ROOM_NAME));
  }

  const { room } = roomState;
  const isNotObjOrNull = (!isAObj(options) || options === null);

  if (!room.inRoom) {
    logger.log.WARN(MESSAGES.ROOM.ERRORS.NOT_IN_ROOM);
    return reject(new Error(`${MESSAGES.ROOM.ERRORS.NOT_IN_ROOM}`));
  }

  if (isNotObjOrNull) {
    return reject(new Error(`${MESSAGES.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS} ${options}`));
  }

  let isTypeStream = false;

  try {
    if (Array.isArray(options)) {
      // check that it is an array of type MediaStream
      let isArrayOfTypeStream = true;
      options.forEach((item) => {
        if (!isAFunction(item.getAudioTracks) || !isAFunction(item.getVideoTracks)) {
          isArrayOfTypeStream = false;
        }
      });

      if (!isArrayOfTypeStream) {
        return reject(new Error(MESSAGES.MEDIA_STREAM.ERRORS.INVALID_MEDIA_STREAM_ARRAY));
      }

      // check that the MediaStream is active
      let isArrayOfActiveStreams = true;
      options.forEach((stream) => {
        if (!stream.active) {
          isArrayOfActiveStreams = false;
        }
      });

      if (!isArrayOfActiveStreams) {
        return reject(new Error(MESSAGES.MEDIA_STREAM.ERRORS.INACTIVE_MEDIA_STREAM));
      }

      return processMediaStreamArray(roomState, options, resolve, reject);
    }

    isTypeStream = options ? (isAFunction(options.getAudioTracks) || isAFunction(options.getVideoTracks)) : false;
    if (isTypeStream) {
      return processMediaStream(roomState, options, resolve, reject);
    }

    return processMediaOptions(roomState, options, resolve, reject);
  } catch (error) {
    logger.log.ERROR(MESSAGES.MEDIA_STREAM.ERRORS.SEND_STREAM, error);
  }
});

export default sendStream;

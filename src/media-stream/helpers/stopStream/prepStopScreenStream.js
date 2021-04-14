import stopStreamHelpers from './index';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import Skylink from '../../../index';

const prepStopScreenStream = (room, streamId, fromLeaveRoom = false) => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(room.id);
  const { user, peerStreams } = state;
  const screenStream = peerStreams[user.sid][streamId];
  const isScreensharing = true;

  try {
    stopStreamHelpers.stopAddedStream(state, screenStream, isScreensharing, fromLeaveRoom);
    stopStreamHelpers.initRefreshConnectionAndResolve(state.room, fromLeaveRoom, resolve, reject);
  } catch (error) {
    logger.log.DEBUG([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN], error);
    reject(new Error(MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN));
  }
});

export default prepStopScreenStream;

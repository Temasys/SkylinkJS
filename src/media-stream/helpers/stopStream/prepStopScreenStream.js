import stopStreamHelpers from './index';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import Skylink from '../../../index';

const hasStreamBeenReplaced = (state, stoppedStream) => {
  const { streams } = state;

  if (!streams.userMedia) {
    return false;
  }

  const streamObjs = Object.values(streams.userMedia);

  return streamObjs.some(streamObj => streamObj.isReplaced && (streamObj.id === stoppedStream.id));
};

const prepStopScreenStream = (room, streamId, fromLeaveRoom = false) => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(room.id);
  const { user, streams } = state;
  const screenStream = streams.screenshare.stream;
  const isScreensharing = true;

  try {
    if (hasStreamBeenReplaced(state, screenStream)) {
      stopStreamHelpers.stopReplacedStream(state, screenStream, isScreensharing, fromLeaveRoom);
    } else {
      stopStreamHelpers.stopAddedStream(state, screenStream, isScreensharing, fromLeaveRoom);
    }

    stopStreamHelpers.initRefreshConnectionAndResolve(state.room, fromLeaveRoom, resolve, reject);
  } catch (error) {
    logger.log.DEBUG([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN], error);
    reject(new Error(MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN));
  }
});

export default prepStopScreenStream;

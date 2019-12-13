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

const prepStopScreenStream = (room, streamId, fromLeaveRoom = false) => {
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

    stopStreamHelpers.initRefreshConnection(state.room, fromLeaveRoom);
  } catch (error) {
    logger.log.ERROR([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN], error);
  }
};

export default prepStopScreenStream;

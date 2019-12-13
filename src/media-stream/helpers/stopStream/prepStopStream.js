import Skylink from '../../../index';
import stopStreamHelpers from './index';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';

const prepStopStream = (roomId, streamId, fromLeaveRoom = false, isScreensharing = false) => {
  const state = Skylink.getSkylinkState(roomId);
  const { streams, user } = state;

  if (!state || !streams) {
    logger.log.WARN([user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.ROOM_STATE.NOT_FOUND} - ${roomId}`]);
    return false;
  }

  if (!streams || (!isScreensharing && !streams.userMedia) || (isScreensharing && !streams.screenshare) || (isScreensharing && streams.screenshare && (streams.screenshare.id !== streamId))) {
    logger.log.WARN([user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM} - ${streamId}`]);
    return false;
  }

  if (isScreensharing) {
    return stopStreamHelpers.prepStopScreenStream(state.room, streamId, fromLeaveRoom);
  }

  return stopStreamHelpers.prepStopUserMediaStream(state, streamId, fromLeaveRoom);
};

export default prepStopStream;

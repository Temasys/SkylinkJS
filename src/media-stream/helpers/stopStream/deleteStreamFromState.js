import { isEmptyObj } from '../../../utils/helpers';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import Skylink from '../../../index';

const deleteStreamFromState = (room, stream, isScreensharing = null) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  const { user } = updatedState;
  const streamIdToRemove = stream.id;

  if (isScreensharing) {
    delete updatedState.streams.screenshare;

    logger.log.INFO([user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.STOP_SUCCESS} - stream id: ${stream.id} (screenshare)`]);
  } else {
    delete updatedState.streams.userMedia[streamIdToRemove];
    delete updatedState.streamsMediaStatus[stream.id];
    delete updatedState.streamsMutedSettings[stream.id];

    if (isEmptyObj(updatedState.streams.userMedia)) {
      updatedState.streams.userMedia = null;
    }

    logger.log.INFO([user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.STOP_SUCCESS} - stream id: ${stream.id}`]);
  }

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
};

export default deleteStreamFromState;

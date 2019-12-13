import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import stopStreamHelpers from './index';
import ScreenSharing from '../../../features/screen-sharing';

const stopAddedStream = (state, stream, isScreensharing = false, fromLeaveRoom = false) => {
  const { room, user } = state;

  try {
    stopStreamHelpers.tryStopStream(stream, user.sid);

    if (!fromLeaveRoom) {
      stopStreamHelpers.removeTracks(room, stream);
      stopStreamHelpers.updateMediaInfoMediaState(room, stream);
      stopStreamHelpers.deleteStreamFromState(room, stream, isScreensharing);
      stopStreamHelpers.listenForEventAndDeleteMediaInfo(room, stream);
      stopStreamHelpers.dispatchOnLocalStreamEnded(room, stream, isScreensharing);

      if (isScreensharing) {
        new ScreenSharing(state).deleteScreensharingInstance(room);
      }
    }
  } catch (err) {
    logger.log.ERROR([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_ADDED_STREAM], err);
  }
};

export default stopAddedStream;

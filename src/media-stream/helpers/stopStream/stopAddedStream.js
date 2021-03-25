import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import stopStreamHelpers from './index';
import ScreenSharing from '../../../features/screen-sharing';
import PeerStream from '../../../peer-stream';
import PeerMedia from '../../../peer-media';

const stopAddedStream = (state, stream, isScreensharing = false) => {
  const { room, user } = state;

  try {
    stopStreamHelpers.tryStopStream(stream, user.sid);
    stopStreamHelpers.removeTracks(room, stream);
    PeerMedia.setMediaStateToUnavailable(room, user.sid, PeerMedia.retrieveMediaId(stream.getTracks()[0].kind, stream.id));
    PeerStream.deleteStream(user.sid, room, stream.id);
    stopStreamHelpers.listenForEventAndDeleteMediaInfo(room, stream);
    stopStreamHelpers.dispatchEvents(room, stream, isScreensharing);
    stopStreamHelpers.updateMediaStatusMutedSettings(room, stream);

    if (isScreensharing) {
      new ScreenSharing(state).deleteScreensharingInstance(room);
    }

    logger.log.INFO([user.sid, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.STOP_SUCCESS} - stream id: ${stream.id} ${(isScreensharing ? '(screenshare)' : '')}`]);
  } catch (err) {
    logger.log.ERROR([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_ADDED_STREAM], err);
  }
};

export default stopAddedStream;

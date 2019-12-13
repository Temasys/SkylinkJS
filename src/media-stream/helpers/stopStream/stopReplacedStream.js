import logger from '../../../logger';
import { STREAM_STATUS, TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import stopStreamHelpers from './index';
import SkylinkSignalingServer from '../../../server-communication/signaling-server';

const sendStreamReplaceEndedMsg = (state, stoppedStream) => {
  const { room, user } = state;
  const signaling = new SkylinkSignalingServer();
  signaling.stream(room.id, user, stoppedStream, STREAM_STATUS.REPLACED_STREAM_ENDED, null);
};

// TODO:
//  implement stop user media stream
//  stop screen stream will be implemented diff - need to replace the screen stream with the original user media stream
//  ref: onScreenStreamEnded for previous implementation
const stopReplacedStream = (state, stream, isScreensharing, fromLeaveRoom) => {
  const { user, room } = state;

  try {
    stopStreamHelpers.tryStopStream(stream);

    if (!fromLeaveRoom) {
      sendStreamReplaceEndedMsg(state, stream);
      stopStreamHelpers.deleteStreamFromState(room, stream, isScreensharing);
      stopStreamHelpers.dispatchOnLocalStreamEnded(room, stream);
    }
  } catch (err) {
    logger.log.ERROR([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_REPLACED_STREAM], err);
  }
};

export default stopReplacedStream;

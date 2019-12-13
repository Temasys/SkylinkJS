import helpers from './index';
import Skylink from '../../index';
import MESSAGES from '../../messages';
import logger from '../../logger';
import { mediaAccessSuccess } from '../../skylink-events';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import PeerMedia from '../../peer-media/index';
import { TAGS } from '../../constants';

const isStreamInState = (state, stream) => {
  const { streams } = state;

  if (!streams.userMedia && !streams.screenshare) {
    return false;
  }

  const streamObjs = Object.values(streams.userMedia);
  if (streamObjs.some(streamObj => streamObj.id === stream.id)) {
    return true;
  }

  return streams.screenshare && streams.screenshare.id === stream.id;
};

/**
 * Function that processes the streams object in the state.
 * @param {MediaStream} stream - User MediaStream object
 * @param {GetUserMediaOptions} settings - Options used to get the peer-media stream
 * @param {SkylinkRoom.id} roomkey - Room's id
 * @param {boolean} [isScreensharing=false] isScreensharing
 * @param {boolean} [isAudioFallback=false] isAudioFallback
 * @memberOf MediaStreamHelpers
 * @fires mediaAccessSuccess
 * @private
 * */
const processStreamInState = (stream = null, settings = {}, roomkey, isScreensharing = false, isAudioFallback = false) => {
  if (!stream) return;
  const updatedState = Skylink.getSkylinkState(roomkey);

  if (isStreamInState(updatedState, stream)) {
    return;
  }

  helpers.processNewStream(updatedState.room, stream, settings, isScreensharing);
  PeerMedia.processPeerMedia(updatedState.room, updatedState.user.sid, stream, isScreensharing);

  if (isAudioFallback) {
    logger.log.DEBUG([updatedState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.FALLBACK_SUCCESS]);
  }

  if (isScreensharing) {
    logger.log.DEBUG([updatedState.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.START_SCREEN_SUCCESS]);
  }

  dispatchEvent(mediaAccessSuccess({
    stream,
    isScreensharing,
    isAudioFallback,
    streamId: stream.id,
  }));
};

export default processStreamInState;

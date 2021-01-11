import {
  MEDIA_TYPE, MEDIA_INFO, TAGS, MEDIA_STATE,
} from '../../../../constants';
import MESSAGES from '../../../../messages';
import PeerMedia from '../../../../peer-media/index';
import Skylink from '../../../../index';
import audioStateChangeHandler from './audioStateChangeHandler';
import videoStateChangeHandler from './videoStateChangeHandler';
import logger from '../../../../logger/index';

const addNewPeerMediaInfo = (state, message) => {
  const updatedState = state;
  const { mediaId, publisherId } = message;
  updatedState.peerMedias[publisherId] = updatedState.peerMedias[publisherId] || {};

  if (!updatedState.peerMedias[publisherId][mediaId]) {
    updatedState.peerMedias[publisherId][mediaId] = message;
    Skylink.setSkylinkState(updatedState, updatedState.room.id);
    return true;
  }

  return false;
};

const processOtherChanges = (targetMid, message, key) => {
  logger.log.WARN([targetMid, TAGS.SIG_SERVER, `${MESSAGES.MEDIA_INFO.WARN.READ_ONLY_VALUE} ${key}`], message);
};

const processTransceiverMidChange = (targetMid, message) => {
  const {
    rid, mediaId, transceiverMid,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  PeerMedia.updatePeerMediaInfo(state.room, targetMid, mediaId, MEDIA_INFO.TRANSCEIVER_MID, transceiverMid);
};

const processUnavailableStream = (room, mediaType, targetMid, message) => {
  const { mediaId } = message;

  PeerMedia.setMediaStateToUnavailable(room, targetMid, mediaId);
  PeerMedia.deleteUnavailableMedia(room, targetMid, mediaId);
};

const processMediaStateChange = (room, mediaType, targetMid, message) => {
  if (message.mediaState === MEDIA_STATE.UNAVAILABLE) {
    processUnavailableStream(room, mediaType, targetMid, message);
  } else {
    switch (mediaType) {
      case MEDIA_TYPE.VIDEO_SCREEN:
      case MEDIA_TYPE.VIDEO_CAMERA:
      case MEDIA_TYPE.VIDEO_OTHER:
      case MEDIA_TYPE.VIDEO:
        setTimeout(() => {
          videoStateChangeHandler(targetMid, message);
        }, 100); // setTimeout to handle joinRoom with audio/video and muted true. Safari browser may not have processed ontrack before the
        // mediaInfoEvent is received resulting in the streamId being undefined
        break;
      case MEDIA_TYPE.AUDIO_MIC:
      case MEDIA_TYPE.AUDIO:
        setTimeout(() => {
          audioStateChangeHandler(targetMid, message);
        }, 100);
        break;
      default: logger.log.ERROR([targetMid, TAGS.SIG_SERVER, `${MESSAGES.MEDIA_INFO.WARN.INVALID_MEDIA_TYPE} ${mediaType}`], message);
    }
  }
};

const valueChanged = (roomKey, peerId, mediaId, key, newValue) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { peerMedias } = state;
  const mediaInfo = peerMedias[peerId][mediaId];

  return mediaInfo[key] && mediaInfo[key] !== newValue;
};

const mediaInfoEventHandler = (message) => {
  const {
    mid, rid, mediaType, mediaId, publisherId,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const { hasMCU, room } = state;
  const targetMid = hasMCU ? publisherId : mid;

  try {
    if (!addNewPeerMediaInfo(state, message)) {
      const mediaInfoKeys = Object.values(MEDIA_INFO);

      for (let k = 0; k < mediaInfoKeys.length; k += 1) {
        if (valueChanged(rid, targetMid, mediaId, mediaInfoKeys[k], message[mediaInfoKeys[k]])) {
          PeerMedia.updatePeerMediaInfo(state.room, targetMid, mediaId, mediaInfoKeys[k], message[mediaInfoKeys[k]]);

          if (mediaInfoKeys[k] === MEDIA_INFO.MEDIA_STATE) {
            processMediaStateChange(room, mediaType, targetMid, message);
            return;
          }

          if (mediaInfoKeys[k] === MEDIA_INFO.TRANSCEIVER_MID) {
            processTransceiverMidChange(targetMid, message);
            return;
          }

          processOtherChanges(targetMid, message, mediaInfoKeys[k]);
        }
      }
    }
  } catch (err) {
    logger.log.ERROR([targetMid, TAGS.SIG_SERVER, MESSAGES.MEDIA_INFO.FAILED_PROCESSING_MEDIA_INFO_EVENT], err);
  }
};

export default mediaInfoEventHandler;

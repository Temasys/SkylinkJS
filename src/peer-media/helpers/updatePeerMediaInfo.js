import Skylink from '../../index';
import helpers from './index';
import logger from '../../logger/index';
import { TAGS } from '../../constants';
import MESSAGES from '../../messages';

const doUpdate = (room, peerId, dispatchEvent, mediaId, key = false, value = false, mediaInfo = false) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  // Check for key + value || mediaInfo but not both
  if (!mediaInfo && key && value) {
    updatedState.peerMedias[peerId][mediaId][key] = value;
    logger.log.INFO([peerId, TAGS.PEER_MEDIA, null, `${MESSAGES.MEDIA_INFO.UPDATE_SUCCESS} -- ${mediaId} - ${key}: ${value}`]);
  } else if (mediaInfo && !key && !value) {
    updatedState.peerMedias[peerId] = updatedState.peerMedias[peerId] || {};
    updatedState.peerMedias[peerId][mediaId] = mediaInfo;
  } else {
    // log if !key && !value && !mediaInfo - nothing to update or if all present which to update?
  }

  Skylink.setSkylinkState(updatedState, room.id);
};

const dispatchMediaInfoMsg = (room, peerId, dispatchEvent, mediaId) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  if (updatedState.user.sid === peerId && dispatchEvent) {
    helpers.sendMediaInfoMsg(room, updatedState.peerMedias[peerId][mediaId]);
  }
};

// dispatch event when:
// 1) not from offer and answer
// 2) self mediaInfo is updated
// 3) a new stream (with new mediaInfo obj) will replace an existing stream - e.g. screen share, send stream

const updatePeerMediaInfo = (room, peerId, dispatchEvent, mediaId, key = false, value = false, mediaInfo = false) => {
  try {
    doUpdate(room, peerId, dispatchEvent, mediaId, key, value, mediaInfo);
    dispatchMediaInfoMsg(room, peerId, dispatchEvent, mediaId);
  } catch (err) {
    const msg = mediaInfo ? JSON.stringify(mediaInfo) : `${mediaId} - ${key}: ${value}`;
    logger.log.ERROR([peerId, TAGS.PEER_MEDIA, null, `${MESSAGES.MEDIA_INFO.ERRORS.FAILED_UPDATING} -- ${msg}`], err);
  }
};

export default updatePeerMediaInfo;

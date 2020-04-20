import Skylink from '../../../../index';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import {
  MEDIA_STATE, MEDIA_STATUS, TAGS, TRACK_KIND,
} from '../../../../constants';
import PeerMedia from '../../../../peer-media';
import mediaInfoEventHelpers from './helpers/mediaInfoEventHelpers';

const audioStateChangeHandler = (targetMid, message) => {
  const {
    type, rid, mediaId, mediaState, transceiverMid,
  } = message;
  const updatedState = Skylink.getSkylinkState(rid);
  const { room } = updatedState;
  const streamId = PeerMedia.retrieveStreamId(room, targetMid, mediaId, transceiverMid);
  const stamp = (new Date()).toISOString();

  logger.log.INFO([targetMid, TAGS.SIG_SERVER, type, MESSAGES.MEDIA_INFO.AUDIO_STATE_CHANGE, mediaState, streamId], message);

  if (!updatedState.peerInformations[targetMid]) {
    logger.log.WARN([targetMid, TAGS.PEER_INFORMATION, type, `${MESSAGES.PEER_INFORMATIONS.NO_PEER_INFO} ${targetMid}`]);
    return;
  }

  if (updatedState.peerMessagesStamps[targetMid]) {
    if (stamp < updatedState.peerMessagesStamps[targetMid].audioMuted) {
      logger.log.WARN([targetMid, TAGS.SIG_SERVER, type, MESSAGES.SIGNALING.OUTDATED_MSG], message);
      return;
    }
    updatedState.peerMessagesStamps[targetMid].audioMuted = stamp;
  }

  if (!updatedState.peerInformations[targetMid].mediaStatus[streamId]) {
    updatedState.peerInformations[targetMid].mediaStatus[streamId] = {};
  }

  updatedState.peerInformations[targetMid].mediaStatus[streamId].audioMuted = (mediaState === MEDIA_STATE.MUTED || mediaState === MEDIA_STATE.STOPPED) ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE;
  Skylink.setSkylinkState(updatedState, room.id);

  mediaInfoEventHelpers.dispatchMediaStateChangeEvents(updatedState, streamId, targetMid, TRACK_KIND.AUDIO, false);
};

export default audioStateChangeHandler;

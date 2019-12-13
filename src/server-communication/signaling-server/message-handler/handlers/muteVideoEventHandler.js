import Skylink from '../../../../index';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import { MEDIA_STATUS, TAGS } from '../../../../constants';
import muteEventHelpers from './helpers/muteEventHelpers';

const muteVideoEventHandler = (message) => {
  const {
    type, mid, muted, rid, stamp, streamId,
  } = message;
  const targetMid = mid;
  const updatedState = Skylink.getSkylinkState(rid);
  const { room } = updatedState;

  if (muteEventHelpers.shouldDropMessage(updatedState, targetMid)) {
    return;
  }

  logger.log.INFO([targetMid, null, type, MESSAGES.MEDIA_STREAM.VIDEO_MUTED, muted, streamId], message);

  if (!updatedState.peerInformations[targetMid]) {
    logger.log.WARN([targetMid, TAGS.PEER_INFORMATION, type, `${MESSAGES.PEER_INFORMATIONS.NO_PEER_INFO} ${targetMid}`]);
    return;
  }

  if (updatedState.peerMessagesStamps[targetMid]) {
    if (stamp < updatedState.peerMessagesStamps[targetMid].videoMuted) {
      logger.log.WARN([targetMid, TAGS.SIG_SERVER, type, MESSAGES.SIGNALING.OUTDATED_MSG], message);
      return;
    }
    updatedState.peerMessagesStamps[targetMid].videoMuted = stamp;
  }
  if (!updatedState.peerInformations[targetMid].mediaStatus[streamId]) {
    updatedState.peerInformations[targetMid].mediaStatus[streamId] = {};
  }
  updatedState.peerInformations[targetMid].mediaStatus[streamId].videoMuted = muted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE;

  Skylink.setSkylinkState(updatedState, room.id);

  muteEventHelpers.dispatchMuteEvents(updatedState, streamId, targetMid);
};

export default muteVideoEventHandler;

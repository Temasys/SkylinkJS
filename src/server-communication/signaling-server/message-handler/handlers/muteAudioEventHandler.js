import { MEDIA_STATUS, TAGS } from '../../../../constants';
import Skylink from '../../../../index';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';
import muteEventHelpers from './helpers/muteEventHelpers';

const muteAudioEventHandler = (message) => {
  const {
    type, mid, rid, muted, stamp, streamId,
  } = message;
  const targetMid = mid;
  const updatedState = Skylink.getSkylinkState(rid);
  const { room } = updatedState;

  if (muteEventHelpers.shouldDropMessage(updatedState, targetMid)) {
    return;
  }

  logger.log.INFO([targetMid, TAGS.SIG_SERVER, type, MESSAGES.MEDIA_STREAM.AUDIO_MUTED, muted, streamId], message);

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
  updatedState.peerInformations[targetMid].mediaStatus[streamId].audioMuted = muted ? MEDIA_STATUS.MUTED : MEDIA_STATUS.ACTIVE;
  Skylink.setSkylinkState(updatedState, room.id);

  muteEventHelpers.dispatchMuteEvents(updatedState, streamId, targetMid);
};

export default muteAudioEventHandler;

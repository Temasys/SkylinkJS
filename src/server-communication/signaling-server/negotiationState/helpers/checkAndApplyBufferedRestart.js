import Skylink from '../../../../index';
import { sendRestartOffer } from '../../message-handler/handlers/commons/offerAndAnswer';
import logger from '../../../../logger';
import { TAGS } from '../../../../constants';
import MESSAGES from '../../../../messages';

const checkAndApplyBufferedRestart = (room, peerId) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  const { bufferedRestart } = updatedState;

  if (bufferedRestart[peerId]) {
    delete updatedState.bufferedRestart[peerId];
    Skylink.setSkylinkState(updatedState, room.id);

    logger.log.DEBUG([peerId, TAGS.NEGOTIATION, null, MESSAGES.NEGOTIATION_PROGRESS.APPLY_BUFFERED_RESTART]);
    sendRestartOffer(updatedState, peerId, bufferedRestart.doIceRestart);
  }
};

export default checkAndApplyBufferedRestart;

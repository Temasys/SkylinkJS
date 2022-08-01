import SkylinkError from '../../../utils/skylinkError';
import messagingHelpers from './index';
import MESSAGES from '../../../messages';

const trySendMessage = (roomState, message, targetPeerId, peerSessionId) => {
  try {
    const config = messagingHelpers.getMessageConfig(roomState, targetPeerId, peerSessionId);
    messagingHelpers.sendMessageToSig(roomState, config, message, null, targetPeerId);
  } catch (error) {
    SkylinkError.throwError(targetPeerId, MESSAGES.MESSAGING.ERRORS.FAILED_SENDING_MESSAGE);
  }
};

export default trySendMessage;

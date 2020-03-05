import SkylinkError from '../../../utils/skylinkError';
import messagingHelpers from './index';
import MESSAGES from '../../../messages';

const trySendMessage = (roomState, message, targetPeerId) => {
  try {
    const config = messagingHelpers.getMessageConfig(roomState, targetPeerId);
    messagingHelpers.sendMessageToSig(roomState, config, message, null, targetPeerId);
  } catch (error) {
    SkylinkError.throwError(MESSAGES.MESSAGING.ERRORS.FAILED_SENDING_MESSAGE);
  }
};

export default trySendMessage;

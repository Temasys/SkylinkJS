import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import messagingHelpers from './index';

const sendMessageToSig = (roomState, config, message, encryptedMessage = '', targetPeerId) => {
  const signaling = new SkylinkSignalingServer();
  signaling.sendUserMessage(roomState, config, encryptedMessage || message);
  messagingHelpers.dispatchOnIncomingMessage(roomState, config, message, true, targetPeerId);
};

export default sendMessageToSig;

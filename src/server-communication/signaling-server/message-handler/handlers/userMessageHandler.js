import Messaging from '../../../../features/messaging';

const userMessageHandler = (message, isPublic) => {
  Messaging.processMessage(message, isPublic);
};

export default userMessageHandler;

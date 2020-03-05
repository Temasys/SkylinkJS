import AsyncMessaging from '../../../../features/messaging/async-messaging';

/**
 * Function that handles the "storedMessages" socket message received.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 */
const storedMessagesHandler = (message) => {
  AsyncMessaging.processStoredMessages(message);
};

export default storedMessagesHandler;

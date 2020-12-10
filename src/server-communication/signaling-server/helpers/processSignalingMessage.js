import { SIG_MESSAGE_TYPE } from '../../../constants';
import logger from '../../../logger';

const processSignalingMessage = (messageHandler, message) => {
  const { type } = message;
  logger.log.INFO(['SIG SERVER', null, type, 'received']);
  switch (type) {
    case SIG_MESSAGE_TYPE.IN_ROOM: messageHandler.inRoomHandler(message); break;
    case SIG_MESSAGE_TYPE.ENTER: messageHandler.enterRoomHandler(message); break;
    case SIG_MESSAGE_TYPE.OFFER: messageHandler.offerHandler(message); break;
    case SIG_MESSAGE_TYPE.WELCOME: messageHandler.welcomeHandler(message); break;
    case SIG_MESSAGE_TYPE.ANSWER: messageHandler.answerHandler(message); break;
    case SIG_MESSAGE_TYPE.ANSWER_ACK: messageHandler.answerAckHandler(message); break;
    case SIG_MESSAGE_TYPE.CANDIDATE: messageHandler.candidateHandler(message); break;
    case SIG_MESSAGE_TYPE.PEER_LIST: messageHandler.getPeerListHandler(message); break;
    case SIG_MESSAGE_TYPE.INTRODUCE_ERROR: messageHandler.introduceError(message); break;
    case SIG_MESSAGE_TYPE.BYE: messageHandler.byeHandler(message); break;
    case SIG_MESSAGE_TYPE.STREAM: messageHandler.streamHandler(message); break;
    case SIG_MESSAGE_TYPE.RECORDING: messageHandler.recordingHandler(message); break;
    case SIG_MESSAGE_TYPE.REDIRECT: messageHandler.redirectHandler(message); break;
    case SIG_MESSAGE_TYPE.RTMP: messageHandler.rtmpHandler(message); break;
    case SIG_MESSAGE_TYPE.UPDATE_USER: messageHandler.setUserDataHandler(message); break;
    case SIG_MESSAGE_TYPE.MEDIA_INFO_EVENT: messageHandler.mediaInfoEventHandler(message); break;
    case SIG_MESSAGE_TYPE.MESSAGE: messageHandler.userMessageHandler(message, null); break;
    case SIG_MESSAGE_TYPE.STORED_MESSAGES: messageHandler.storedMessagesHandler(message); break;
    case SIG_MESSAGE_TYPE.ROOM_LOCK: messageHandler.roomLockHandler(message); break;
    // Backward compatibility for public and private message protocol
    case SIG_MESSAGE_TYPE.PUBLIC_MESSAGE: messageHandler.userMessageHandler(message, true); break;
    case SIG_MESSAGE_TYPE.PRIVATE_MESSAGE: messageHandler.userMessageHandler(message, false); break;
    default: break;
  }
};

export default processSignalingMessage;

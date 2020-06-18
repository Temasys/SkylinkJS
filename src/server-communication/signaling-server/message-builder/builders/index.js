import joinRoomMessage from './joinRoomMessage';
import enterRoomMessage from './enterRoomMessage';
import welcomeMessage from './welcomeMessage';
import offerMessage from './offerMessage';
import answerMessage from './answerMessage';
import answerAckMessage from './answerAckMessage';
import candidateMessage from './candidateMessage';
import setUserDataMessage from './setUserDataMessage';
import getPeerListMessage from './getPeerListMessage';
import restartOfferMessage from './restartOfferMessage';
import streamMessage from './streamMessage';
import recordingMessage from './recordingMessage';
import rtmpMessage from './rtmpMessage';
import byeMessage from './byeMessage';
import roomLockMessage from './roomLockMeessage';
import mediaInfoEventMessage from './mediaInfoEventMessage';
import getStoredMessagesMessage from './getStoredMessagesMessage';
import userMessagesMessage from './getUserMessages';

const messageBuilders = {
  joinRoom: joinRoomMessage,
  enterRoom: enterRoomMessage,
  welcome: welcomeMessage,
  offer: offerMessage,
  answer: answerMessage,
  answerAck: answerAckMessage,
  candidate: candidateMessage,
  setUserData: setUserDataMessage,
  getPeerList: getPeerListMessage,
  restartOffer: restartOfferMessage,
  stream: streamMessage,
  recording: recordingMessage,
  rtmp: rtmpMessage,
  bye: byeMessage,
  roomLock: roomLockMessage,
  mediaInfoEvent: mediaInfoEventMessage,
  getStoredMessages: getStoredMessagesMessage,
  userMessages: userMessagesMessage,
};

export default messageBuilders;

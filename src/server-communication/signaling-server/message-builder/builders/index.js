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
import signalingMessages from './peerMessageViaSignaling';
import rtmpMessage from './rtmpMessage';
import byeMessage from './byeMessage';
import roomLockMessage from './roomLockMeessage';
import mediaInfoEventMessage from './mediaInfoEventMessage';
import muteAudioEventMessage from './muteAudioEventMessage';
import muteVideoEventMessage from './muteVideoEventMessage';

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
  signalingMessages,
  bye: byeMessage,
  roomLock: roomLockMessage,
  mediaInfoEvent: mediaInfoEventMessage,
  muteAudioEvent: muteAudioEventMessage,
  muteVideoEvent: muteVideoEventMessage,
};

export default messageBuilders;

import peerMessageFromSignaling from './peerMessageFromSignalingHandler';
import inRoom from './inRoomHandler';
import enter from './enterHandler';
import offer from './offerHandler';
import answer from './answerHandler';
import answerAck from './answerAckHandler';
import welcome from './welcomeHandler';
import candidate from './candidateHandler';
import getPeerList from './getPeerListHandler';
import introduceError from './introduceErrorHandler';
import bye from './byeHandler';
import stream from './streamHandler';
import recording from './recordingHandler';
import redirect from './redirectHandler';
import rtmp from './rtmpHandler';
import setUserData from './setUserDataHandler';
import mediaInfoEvent from './mediaInfoEventHandler';
import muteVideoEvent from './muteVideoEventHandler';
import muteAudioEvent from './muteAudioEventHandler';

const handlers = {
  peerMessageFromSignaling,
  answer,
  answerAck,
  inRoom,
  enter,
  offer,
  welcome,
  candidate,
  getPeerList,
  introduceError,
  stream,
  bye,
  recording,
  redirect,
  rtmp,
  muteVideoEvent,
  muteAudioEvent,
  setUserData,
  mediaInfoEvent,
};

export default handlers;

/* eslint-disable class-methods-use-this */
import handlers from './handlers/index';

/**
 * @class
 * @classdesc Class representing a SignalingMessageHandler instance.
 * @namespace SignalingMessageHandler
 * @private
 */
class SignalingMessageHandler {
  userMessageHandler(...args) {
    handlers.userMessageHandler(...args);
  }

  answerHandler(...args) {
    handlers.answer(...args);
  }

  answerAckHandler(...args) {
    handlers.answerAck(...args);
  }

  inRoomHandler(...args) {
    handlers.inRoom(...args);
  }

  enterRoomHandler(...args) {
    handlers.enter(...args);
  }

  offerHandler(...args) {
    handlers.offer(...args);
  }

  welcomeHandler(...args) {
    handlers.welcome(...args);
  }

  candidateHandler(...args) {
    handlers.candidate(...args);
  }

  getPeerListHandler(...args) {
    handlers.getPeerList(...args);
  }

  introduceErrorHandler(...args) {
    handlers.introduceError(...args);
  }

  byeHandler(...args) {
    handlers.bye(...args);
  }

  streamHandler(...args) {
    handlers.stream(...args);
  }

  recordingHandler(...args) {
    handlers.recording(...args);
  }

  redirectHandler(...args) {
    handlers.redirect(...args);
  }

  rtmpHandler(...args) {
    handlers.rtmp(...args);
  }

  setUserDataHandler(...args) {
    handlers.setUserData(...args);
  }

  mediaInfoEventHandler(...args) {
    handlers.mediaInfoEvent(...args);
  }

  storedMessagesHandler(...args) {
    handlers.storedMessages(...args);
  }
}

export default SignalingMessageHandler;

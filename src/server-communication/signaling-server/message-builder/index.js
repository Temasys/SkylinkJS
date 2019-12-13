import messageBuilders from './builders/index';

/**
 * @class
 * @classdesc Class representing a SignalingMessageBuilder instance.
 * @namespace SignalingMessageBuilder
 * @private
 */
class SignalingMessageBuilder {
  constructor() {
    this.messageBuilders = messageBuilders;
  }

  getJoinRoomMessage(...args) {
    return this.messageBuilders.joinRoom(...args);
  }

  getWelcomeMessage(...args) {
    return this.messageBuilders.welcome(...args);
  }

  getEnterRoomMessage(...args) {
    return this.messageBuilders.enterRoom(...args);
  }

  getAnswerMessage(...args) {
    return this.messageBuilders.answer(...args);
  }

  getAnswerAckMessage(...args) {
    return this.messageBuilders.answerAck(...args);
  }

  getOfferMessage(...args) {
    return this.messageBuilders.offer(...args);
  }

  getCandidateMessage(...args) {
    return this.messageBuilders.candidate(...args);
  }

  getSetUserDataMessage(roomState) {
    return this.messageBuilders.setUserData(roomState);
  }

  getPeerListMessage(...args) {
    return this.messageBuilders.getPeerList(...args);
  }

  getRestartOfferMessage(...args) {
    return this.messageBuilders.restartOffer(...args);
  }

  getStreamMessage(...args) {
    return this.messageBuilders.stream(...args);
  }

  getRecordingMessage(...args) {
    return this.messageBuilders.recording(...args);
  }

  getPeerMessagesForSignaling(...args) {
    return this.messageBuilders.signalingMessages(...args);
  }

  getMuteAudioMessage(...args) {
    return this.messageBuilders.muteAudioEvent(...args);
  }

  getMuteVideoMessage(...args) {
    return this.messageBuilders.muteVideoEvent(...args);
  }

  getRTMPMessage(...args) {
    return this.messageBuilders.rtmp(...args);
  }

  getByeMessage(...args) {
    return this.messageBuilders.bye(...args);
  }

  getRoomLockMessage(...args) {
    return this.messageBuilders.roomLock(...args);
  }

  getMediaInfoEventMessage(...args) {
    return this.messageBuilders.mediaInfoEvent(...args);
  }
}

export default SignalingMessageBuilder;

import clone from 'clone';
import {
  createSocket,
  sendChannelMessage,
  processSignalingMessage,
  setSocketCallbacks,
  shouldBufferMessage,
} from './signaling-server-helpers';
import logger from '../../logger';
import SignalingMessageHandler from './message-handler/index';
import SignalingMessageBuilder from './message-builder/index';
import {
  socketError, channelMessage, handshakeProgress,
} from '../../skylink-events';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import Skylink from '../../index';
import MESSAGES from '../../messages';
import { TAGS, SOCKET_ERROR, HANDSHAKE_PROGRESS } from '../../constants';
import Room from '../../room';

const SOCKET_TYPE = {
  POLLING: 'Polling',
  WEBSOCKET: 'WebSocket',
  XHR_POLLING: 'xhr-polling',
  JSONP_POLLING: 'jsonp-polling',
};

let instance = null;

/**
 * @class
 * @classdesc Singleton class that represents a signaling server
 * @private
 */
class SkylinkSignalingServer {
  constructor() {
    if (!instance) {
      instance = this;
    }
    /**
     * Stores the WebSocket object
     * @type {WebSocket}
     */
    this.socket = null;
    /**
     * Stores the number of socket reconnect attempts
     * @type {number}
     */
    this.attempts = 0;
    /**
     * Current timestamp
     * @type {number}
     */
    this.timestamp = new Date().valueOf();
    /**
     * Handler for incoming messages on the socket
     * @type {SignalingMessageHandler}
     */
    this.messageHandler = new SignalingMessageHandler();
    /**
     * Handler for outbound messages via the socket
     * @type {SignalingMessageBuilder}
     */
    this.messageBuilder = new SignalingMessageBuilder();
    /**
     * Config needed for create a socket and establishing a socket connection with the Signaling Server
     * @type {{protocol: Window.location.protocol, socketType: string, signalingServerProtocol: Window.location.protocol, socketSession: {finalAttempts: number, attempts: number}, fallbackType: null, signalingServerPort: null}}
     */
    this.config = null;
    return instance;
  }

  // eslint-disable-next-line class-methods-use-this
  resetSocketConfig(protocol) {
    return {
      protocol,
      socketType: !window.WebSocket ? SOCKET_TYPE.POLLING : SOCKET_TYPE.WEBSOCKET,
      signalingServerProtocol: protocol,
      socketSession: {
        finalAttempts: 0,
        attempts: 0,
      },
      fallbackType: null,
      signalingServerPort: null,
      socketTimeout: false,
    };
  }

  /**
   * Method that creates a socket - Returns the same instance of socket if already created.
   * @param {SkylinkRoom.id} roomKey
   * @fires SOCKET_ERROR
   * @return {Promise}
   */
  createSocket(roomKey) {
    const roomState = Skylink.getSkylinkState(roomKey);
    roomState.socketSession = this.resetSocketConfig(roomState.signalingServerProtocol);
    Skylink.setSkylinkState(roomState, roomKey);

    return new Promise((resolve, reject) => {
      try {
        if (this.socket !== null && this.socket instanceof window.io.Socket && this.socket.connected) {
          resolve();
        } else {
          this.tryCreateSocket(roomKey, resolve, reject);
        }
      } catch (ex) {
        this.handleCreateSocketFailure(roomKey, resolve, reject, ex);
      }
    });
  }

  tryCreateSocket(roomKey, resolve, reject) {
    const roomState = Skylink.getSkylinkState(roomKey);
    const { socketSession } = roomState;

    this.socket = createSocket({
      config: socketSession,
      roomKey,
    });

    setSocketCallbacks(roomKey, this, resolve, reject);
  }

  // eslint-disable-next-line class-methods-use-this
  handleCreateSocketFailure(roomKey, resolve, reject, error) {
    const roomState = Skylink.getSkylinkState(roomKey);
    const { socketSession } = roomState;
    logger.log.ERROR(MESSAGES.INIT.SOCKET_CREATE_FAILED, error);

    dispatchEvent(socketError({
      session: clone(socketSession),
      errorCode: SOCKET_ERROR.CONNECTION_FAILED,
      type: socketSession.fallbackType,
      error,
    }));

    reject(error);
  }

  // eslint-disable-next-line class-methods-use-this
  dispatchHandshakeProgress(roomState, state) {
    dispatchEvent(handshakeProgress({
      peerId: roomState.user.sid,
      state: HANDSHAKE_PROGRESS[state],
      error: null,
      room: Room.getRoomInfo(roomState.room.id),
    }));
  }

  /**
   *
   * @param args
   */
  answer(...args) {
    return this.messageBuilder.getAnswerMessage(...args).then((answer) => {
      const state = args[0];
      this.sendMessage(answer);
      this.dispatchHandshakeProgress(state, 'ANSWER');
      return answer;
    });
  }

  answerAck(...args) {
    const answerAck = this.messageBuilder.getAnswerAckMessage(...args);
    const roomState = args[0];
    this.sendMessage(answerAck);
    this.dispatchHandshakeProgress(roomState, 'ANSWER_ACK');
  }

  /**
   *
   * @param args
   */
  enterRoom(...args) {
    const enter = this.messageBuilder.getEnterRoomMessage(...args);
    this.sendMessage(enter);
    this.dispatchHandshakeProgress(...args, 'ENTER');
  }

  joinRoom(...args) {
    const join = this.messageBuilder.getJoinRoomMessage(...args);
    this.sendMessage(join);
  }

  offer(...args) {
    const room = args[0];
    const peerId = args[1];
    const state = Skylink.getSkylinkState(room.id);
    if (state.peerConnections[peerId].negotiating) {
      logger.log.DEBUG([peerId, TAGS.SIG_SERVER, null, `${MESSAGES.SIGNALING.ABORTING_OFFER}`]);
      return;
    }

    this.messageBuilder.getOfferMessage(...args).then((offer) => {
      this.sendMessage(offer);
      this.dispatchHandshakeProgress(state, 'OFFER');
    });
  }

  welcome(...args) {
    const welcome = this.messageBuilder.getWelcomeMessage(...args);
    this.sendMessage(welcome);
  }

  // eslint-disable-next-line class-methods-use-this
  noop() {
    return null;
  }

  sendCandidate(...args) {
    const candidate = this.messageBuilder.getCandidateMessage(...args);
    if (candidate) {
      this.sendMessage(candidate);
    }
  }

  /**
   * @param {SkylinkState} roomState
   */
  setUserData(roomState) {
    const userData = this.messageBuilder.getSetUserDataMessage(roomState);
    if (userData) {
      this.sendMessage(userData);
    }
  }

  /**
   * @param {boolean} showAll
   */
  getPeerList(showAll) {
    const peers = this.messageBuilder.getPeerListMessage(showAll);
    if (peers) {
      this.sendMessage(peers);
    }
  }

  stream(...args) {
    const stream = this.messageBuilder.getStreamMessage(...args);
    if (stream) {
      this.sendMessage(stream);
    }
  }

  recording(...args) {
    const recordingMessage = this.messageBuilder.getRecordingMessage(...args);
    this.sendMessage(recordingMessage);
  }

  rtmp(...args) {
    const rtmpMessage = this.messageBuilder.getRTMPMessage(...args);
    this.sendMessage(rtmpMessage);
  }

  roomLock(roomState) {
    const roomLock = this.messageBuilder.getRoomLockMessage(roomState);
    if (roomLock) {
      this.sendMessage(roomLock);
    }
  }

  bye(...args) {
    const byeMessage = this.messageBuilder.getByeMessage(...args);
    this.sendMessage(byeMessage);
  }

  mediaInfoEvent(roomState, peerId, mediaInfo) {
    const mInfo = this.messageBuilder.getMediaInfoEventMessage(roomState, peerId, mediaInfo);
    if (mInfo) {
      this.sendMessage(mInfo);
    }
  }

  getStoredMessages(roomState) {
    const history = this.messageBuilder.getGetStoredMessagesMessage(roomState);
    if (history) {
      this.sendMessage(history);
    }
  }

  onMessage(message) {
    const roomState = Skylink.getSkylinkState(JSON.parse(message).rid);
    if (!roomState) {
      return; // FIXME: to handle multi room when the last peer has left one room and that roomState has been removed but the socket channel is still open as the peer is still in the other room
    }
    const { socketSession } = roomState;
    dispatchEvent(channelMessage({
      message,
      socketSession: clone(socketSession),
    }));
    processSignalingMessage(this.messageHandler, JSON.parse(message));
  }

  sendMessage(message) {
    if (!shouldBufferMessage(message)) {
      logger.log.INFO(['SIG SERVER', null, message.type, 'sent']);
      sendChannelMessage(this.socket, message);
    }
  }

  sendUserMessage(roomState, config, message) {
    const peerMessages = this.messageBuilder.getUserMessages(roomState, config, message);
    if (Array.isArray(peerMessages) && peerMessages.length) {
      peerMessages.map((peerMessage) => {
        this.sendMessage(peerMessage);
        return null;
      });
    }
  }

  updateAttempts(roomKey, key, attempts) {
    this.attempts = attempts;

    const state = Skylink.getSkylinkState(roomKey);
    const { socketSession } = state;
    socketSession.socketSession[key] = attempts;

    Skylink.setSkylinkState(state, roomKey);
  }

  getAttempts() {
    return this.attempts;
  }
}

export default SkylinkSignalingServer;

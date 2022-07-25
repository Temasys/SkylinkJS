import clone from 'clone';
import Skylink, { SkylinkEventManager } from '../../../index';
import {
  SIG_MESSAGE_TYPE, EVENTS, HANDSHAKE_PROGRESS, TAGS,
} from '../../../constants';
import { isABoolean, isNull } from '../../../utils/helpers';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import SkylinkSignalingServer from '../index';

const isNegotiationTypeMsg = (message) => {
  const {
    JOIN_ROOM, ENTER, WELCOME, OFFER, ANSWER, ANSWER_ACK, CANDIDATE, END_OF_CANDIDATES,
  } = SIG_MESSAGE_TYPE;
  const negTypeMessages = [JOIN_ROOM, ENTER, WELCOME, OFFER, ANSWER, ANSWER_ACK, CANDIDATE, END_OF_CANDIDATES];
  return negTypeMessages.indexOf(message.type) > -1;
};

const sendBufferedMsg = (state, currentBufferedMsgs) => {
  const signaling = new SkylinkSignalingServer();
  for (let i = currentBufferedMsgs.length - 1; i >= 0; i -= 1) {
    const message = currentBufferedMsgs[i];
    if (!message.mid) {
      if (!state.user.sid) {
        logger.log.DEBUG([state.user.sid, TAGS.SIG_SERVER, null, `${MESSAGES.SIGNALING.BUFFERED_MESSAGES_DROPPED}`]);
        return;
      }
      message.mid = state.user.sid;
    }
    signaling.sendMessage(message);
    currentBufferedMsgs.splice(i, 1);
  }
};

const initAndTrue = value => isABoolean(value) && value;

const shouldBufferMessage = (message) => {
  const { rid } = message;
  const updatedState = Skylink.getSkylinkState(rid);
  const { user, room } = updatedState;

  let boundedEventListener;

  const executeCallbackAndRemoveListener = (_rid, evt) => {
    const state = Skylink.getSkylinkState(_rid);
    const { detail } = evt;

    if (detail.state === HANDSHAKE_PROGRESS.ENTER) {
      const currentBufferedMsgs = clone(state.socketMessageQueue);
      state.user.bufferMessage = false;
      state.socketMessageQueue = [];
      Skylink.setSkylinkState(state, state.room.id);

      logger.log.DEBUG([state.user.sid, TAGS.SIG_SERVER, null, `${MESSAGES.SIGNALING.BUFFERED_MESSAGES_SENT}: ${currentBufferedMsgs.length}`]);
      sendBufferedMsg(state, currentBufferedMsgs);
      SkylinkEventManager.removeEventListener(EVENTS.HANDSHAKE_PROGRESS, boundedEventListener);
    }
  };

  boundedEventListener = executeCallbackAndRemoveListener.bind(this, rid);

  if ((isNull(user.bufferMessage) || initAndTrue(user.bufferMessage)) && !isNegotiationTypeMsg(message)) {
    logger.log.DEBUG([user.sid, TAGS.SIG_SERVER, null, MESSAGES.SIGNALING.MESSAGE_ADDED_TO_BUFFER]);
    updatedState.socketMessageQueue.unshift(message);

    if (!initAndTrue(user.bufferMessage)) {
      updatedState.user.bufferMessage = true;
      logger.log.DEBUG([user.sid, TAGS.SIG_SERVER, null, MESSAGES.SIGNALING.ENTER_LISTENER]);
      SkylinkEventManager.addEventListener(EVENTS.HANDSHAKE_PROGRESS, boundedEventListener);
    }

    Skylink.setSkylinkState(updatedState, room.id);

    return true;
  }

  if (message.type === HANDSHAKE_PROGRESS.ENTER && isNull(user.bufferMessage)) {
    logger.log.DEBUG([user.sid, TAGS.SIG_SERVER, null, MESSAGES.SIGNALING.BUFFER_NOT_NEEDED]);
    updatedState.user.bufferMessage = false;
    updatedState.socketMessageQueue = [];
    Skylink.setSkylinkState(updatedState, updatedState.room.id);
  }

  return false;
};

export default shouldBufferMessage;

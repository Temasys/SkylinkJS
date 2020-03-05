import SkylinkSignalingServer from '../../../server-communication/signaling-server';

const sendRestartOfferMsg = (state, peerId, doIceRestart) => {
  const { room } = state;
  const signaling = new SkylinkSignalingServer();

  try {
    const restartOfferMsg = signaling.messageBuilder.getRestartOfferMessage(room.id, peerId, doIceRestart);
    signaling.offer(room, peerId, doIceRestart, restartOfferMsg);
    return peerId;
  } catch (ex) {
    return [peerId, ex];
  }
};

export default sendRestartOfferMsg;

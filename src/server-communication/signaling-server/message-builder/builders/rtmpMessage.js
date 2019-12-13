import { SIG_MESSAGE_TYPE, PEER_TYPE } from '../../../../constants';

const rtmpMessage = (type, rid, mid, rtmpId, streamId = null, endpoint = null) => {
  const message = {
    type,
    rid,
    rtmpId,
    streamId,
    endpoint,
    mid,
    target: PEER_TYPE.MCU,
  };

  if (type === SIG_MESSAGE_TYPE.STOP_RTMP) {
    delete message.endpoint;
    delete message.streamId;
  }

  return message;
};

export default rtmpMessage;

import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import { SIG_MESSAGE_TYPE } from '../../../constants';
/**
 * Method sends START_RTMP or STOP_RTMP message to Signaling Server
 * @param {SkylinkState} roomState
 * @param {boolean} isStartRTMPSession
 * @param {String} rtmpId
 * @param {String} streamId
 * @param {String} endpoint
 * @private
 */
const sendRTMPMessageViaSig = (roomState, isStartRTMPSession, rtmpId, streamId = null, endpoint = null) => {
  const { room, user } = roomState;
  const signaling = new SkylinkSignalingServer();
  const messageType = isStartRTMPSession ? SIG_MESSAGE_TYPE.START_RTMP : SIG_MESSAGE_TYPE.STOP_RTMP;

  signaling.rtmp(messageType, room.id, user.sid, rtmpId, streamId, endpoint);
};

export default sendRTMPMessageViaSig;

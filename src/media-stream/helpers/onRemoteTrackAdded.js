import { dispatchEvent } from '../../utils/skylinkEventManager';
import { onIncomingStream, peerUpdated, onIncomingScreenStream } from '../../skylink-events/index';
import PeerData from '../../peer-data/index';
import Room from '../../room';

/**
 * Function that handles the <code>RTCPeerConnection.ontrack</code> event on remote stream added.
 * @param {MediaStream} stream - {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream}
 * @param {SkylinkState} currentRoomState - Current room state
 * @param {String} targetMid - The mid of the target peer
 * @param {boolean} isScreensharing - The flag if incoming stream is a screenshare stream.
 * @param {boolean} isVideo - The flag if incoming stream has a video track.
 * @param {boolean} isAudio- The flag if incoming stream has an audio track.
 * @memberOf MediaStreamHelpers
 * @fires ON_INCOMING_STREAM
 * @fires PEER_UPDATED
 * @private
 */
const onRemoteTrackAdded = (stream, currentRoomState, targetMid, isScreensharing, isVideo, isAudio) => {
  const { user, hasMCU, room } = currentRoomState;
  const dispatchOnIncomingStream = (detail) => { dispatchEvent(onIncomingStream(detail)); };
  const dispatchOnIncomingScreenStream = (detail) => {
    // eslint-disable-next-line no-param-reassign
    detail.isReplace = false;
    dispatchEvent(onIncomingScreenStream(detail));
  };
  const methods = { dispatchOnIncomingStream, dispatchOnIncomingScreenStream };
  const dispatch = { methodName: isScreensharing ? 'dispatchOnIncomingScreenStream' : 'dispatchOnIncomingStream' };
  const detail = {
    stream,
    peerId: targetMid,
    room: Room.getRoomInfo(room.id),
    isSelf: hasMCU ? (targetMid === user.sid || false) : false,
    peerInfo: PeerData.getPeerInfo(targetMid, room),
    streamId: stream.id,
    isVideo,
    isAudio,
  };

  methods[dispatch.methodName](detail);

  dispatchEvent(peerUpdated({
    peerId: targetMid,
    peerInfo: PeerData.getPeerInfo(targetMid, room),
    isSelf: hasMCU ? (targetMid === user.sid || false) : false,
    room,
  }));
};

export default onRemoteTrackAdded;

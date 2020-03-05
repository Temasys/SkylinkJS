import { SIG_MESSAGE_TYPE } from '../../../../constants';

const mediaInfoEventMessage = (roomState, peerId, mediaInfo) => ({
  type: SIG_MESSAGE_TYPE.MEDIA_INFO_EVENT,
  rid: roomState.room.id,
  mid: mediaInfo.publisherId,
  target: peerId,
  publisherId: mediaInfo.publisherId,
  mediaId: mediaInfo.mediaId,
  mediaType: mediaInfo.mediaType,
  mediaState: mediaInfo.mediaState,
  transceiverMid: mediaInfo.transceiverMid,
});

export default mediaInfoEventMessage;

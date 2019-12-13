import { SIG_MESSAGE_TYPE } from '../../../../constants';
import Skylink from '../../../../index';

const muteVideoEventMessage = (room, streamId) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const { user, streamsMutedSettings } = roomState;

  return {
    type: SIG_MESSAGE_TYPE.MUTE_VIDEO_EVENT,
    mid: user.sid,
    rid: room.id,
    muted: streamsMutedSettings[streamId].videoMuted,
    stamp: (new Date()).getTime(),
    streamId,
  };
};

export default muteVideoEventMessage;

import { SIG_MESSAGE_TYPE } from '../../../../constants';
import Skylink from '../../../../index';

const muteAudioEventMessage = (room, streamId) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const { user, streamsMutedSettings } = roomState;

  return {
    type: SIG_MESSAGE_TYPE.MUTE_AUDIO_EVENT,
    mid: user.sid,
    rid: room.id,
    muted: streamsMutedSettings[streamId].audioMuted,
    stamp: (new Date()).getTime(),
    streamId,
  };
};

export default muteAudioEventMessage;

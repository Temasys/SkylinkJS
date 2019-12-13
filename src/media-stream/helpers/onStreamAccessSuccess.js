import helpers from './index';
import { hasAudioTrack } from '../../utils/helpers';

const onStreamAccessSuccess = (roomKey, stream, audioSettings, videoSettings, isAudioFallback, resolve) => {
  const isScreensharing = false;
  const streams = helpers.splitAudioAndVideoStream(stream);

  streams.forEach((st) => {
    if (!st) return;
    helpers.processStreamInState(st, hasAudioTrack(st) ? audioSettings : videoSettings, roomKey, isScreensharing, isAudioFallback);
  });

  resolve(streams);
};

export default onStreamAccessSuccess;

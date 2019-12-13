import helpers from './index';

const buildPrefetchedStreamOptions = (stream) => {
  const hasAudio = stream.getAudioTracks().length !== 0;
  const hasVideo = stream.getVideoTracks().length !== 0;

  return helpers.parseStreamSettings({ audio: hasAudio, video: hasVideo });
};

export default buildPrefetchedStreamOptions;

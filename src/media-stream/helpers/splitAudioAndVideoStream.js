import { hasAudioTrack, hasVideoTrack } from '../../utils/helpers';

const splitAudioAndVideoStream = (stream) => {
  const { MediaStream } = window;
  const streams = [];
  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();

  if (hasAudioTrack(stream)) {
    streams.push(new MediaStream(audioTracks));
  } else {
    streams.push(null);
  }

  if (hasVideoTrack(stream)) {
    streams.push(new MediaStream(videoTracks));
  } else {
    streams.push(null);
  }

  return streams;
};

export default splitAudioAndVideoStream;

import helpers from './index';

const buildPeerMediaInfo = (room, mid, track, streamId, mediaType) => ({
  publisherId: mid,
  mediaId: helpers.retrieveMediaId(track.kind, streamId),
  mediaType,
  mediaState: helpers.retrieveMediaState(track),
  transceiverMid: helpers.retrieveTransceiverMid(room, track),
  streamId,
  trackId: track.id,
  mediaMetaData: '',
  simulcast: '',
});

export default buildPeerMediaInfo;

import { TRACK_KIND } from '../../constants';

const retrieveMediaId = (trackKind, streamId) => {
  const prefix = trackKind === TRACK_KIND.AUDIO ? 'AUDIO' : 'VIDEO';
  return `${prefix}_${streamId}`;
};

export default retrieveMediaId;

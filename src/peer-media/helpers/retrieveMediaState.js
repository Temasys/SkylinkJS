import { MEDIA_STATE, TRACK_READY_STATE } from '../../constants';

const retrieveMediaState = (track) => {
  if (track.readyState === TRACK_READY_STATE.ENDED) {
    return MEDIA_STATE.UNAVAILABLE;
  } if (track.muted) {
    return MEDIA_STATE.MUTED;
  }
  return MEDIA_STATE.ACTIVE;
};

export default retrieveMediaState;

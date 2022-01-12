import { PEER_TYPE } from '../../../../constants';

const recordingMessage = (rid, type) => ({
  type,
  rid,
  target: PEER_TYPE.MCU,
});

export default recordingMessage;

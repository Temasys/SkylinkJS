import { PEER_TYPE } from '../../../../constants';
import Skylink from '../../../../index';

const recordingMessage = (rid, type) => {
  const state = Skylink.getSkylinkState(rid);
  return {
    type,
    rid,
    target: state.hasMCU ? PEER_TYPE.MCU : PEER_TYPE.REC_SRV,
  };
};

export default recordingMessage;

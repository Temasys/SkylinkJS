import PeerConnection from '../../../../peer-connection/index';

const getAnswerMessage = (...args) => PeerConnection.createAnswer(...args);

export default getAnswerMessage;

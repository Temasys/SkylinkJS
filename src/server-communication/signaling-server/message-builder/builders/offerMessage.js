import PeerConnection from '../../../../peer-connection/index';

const getOfferMessage = (...args) => PeerConnection.createOffer(...args);

export default getOfferMessage;

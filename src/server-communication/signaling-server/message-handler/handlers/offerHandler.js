import { parseAndSetRemoteDescription } from './commons/offerAndAnswer';

const offerHandler = (message) => {
  parseAndSetRemoteDescription(message);
};

export default offerHandler;

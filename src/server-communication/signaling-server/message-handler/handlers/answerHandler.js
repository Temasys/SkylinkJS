import { parseAndSetRemoteDescription } from './commons/offerAndAnswer';

const answerHandler = (message) => {
  parseAndSetRemoteDescription(message);
};

export default answerHandler;

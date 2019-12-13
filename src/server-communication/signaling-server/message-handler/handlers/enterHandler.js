import { parseAndSendWelcome, CALLERS } from './commons/enterAndWelcome';

const enterHandler = (message) => {
  parseAndSendWelcome(message, CALLERS.ENTER);
};

export default enterHandler;

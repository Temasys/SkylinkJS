import { parseAndSendWelcome, CALLERS } from './commons/enterAndWelcome';

const welcomeHandler = (message) => {
  parseAndSendWelcome(message, CALLERS.WELCOME);
};

export default welcomeHandler;
